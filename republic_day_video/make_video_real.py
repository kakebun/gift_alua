"""Видео ко Дню Республики на основе реальных фото и видео с Wikimedia Commons.

1) python3 fetch_media.py      — скачать материалы (media/, credits.json)
2) python3 make_video_real.py  — собрать republic_day.mp4

Текст, озвучка и музыка берутся из make_video.py.
"""
import json
import os
import shutil
import subprocess
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

import make_video as mv
from make_video import (W, H, FPS, GOLD, WHITE, text, wrap_text, fade, ease, font,
                        paste_alpha, frame_borders, wave_flag, TIMELINE, VALUES, HIST)

HERE = os.path.dirname(os.path.abspath(__file__))
MEDIA = os.path.join(HERE, "media")
CACHE = os.path.join(HERE, "cache")

mv.DURATION = DURATION = 168.0


def media_path(key):
    for f in os.listdir(MEDIA):
        if os.path.splitext(f)[0] == key:
            return os.path.join(MEDIA, f)
    raise FileNotFoundError(key)


# ---------------------------------------------------------------- backgrounds
_photos = {}


def photo(key):
    """Фото, уменьшенное так, чтобы с запасом закрывать кадр 1920x1080."""
    if key not in _photos:
        im = Image.open(media_path(key)).convert("RGB")
        k = max(W * 1.18 / im.width, H * 1.18 / im.height)
        _photos[key] = im.resize((int(im.width * k) + 1, int(im.height * k) + 1), Image.LANCZOS)
    return _photos[key]


def ken_burns(key, p, zoom=(1.0, 1.12), pan=(0.5, 0.5, 0.5, 0.5)):
    """p ∈ [0,1] — прогресс кадра; zoom — масштаб от/до; pan — центр x0,y0 → x1,y1 (доли)."""
    im = photo(key)
    p = ease(p) * 0.6 + p * 0.4
    z = zoom[0] + (zoom[1] - zoom[0]) * p
    # размер окна выреза в пикселях исходника
    base = min(im.width / W, im.height / H)
    cw, ch = W * base / z, H * base / z
    cx = (pan[0] + (pan[2] - pan[0]) * p) * im.width
    cy = (pan[1] + (pan[3] - pan[1]) * p) * im.height
    cx = min(max(cx, cw / 2), im.width - cw / 2)
    cy = min(max(cy, ch / 2), im.height - ch / 2)
    box = (cx - cw / 2, cy - ch / 2, cx + cw / 2, cy + ch / 2)
    return im.resize((W, H), Image.BILINEAR, box=box)


def panorama(key, p, x0=0.0, x1=1.0):
    """Широкая панорама: камера плавно едет слева направо."""
    im = photo(key)
    k = H * 1.0 / im.height
    if k != 1:
        _photos[key] = im = im.resize((int(im.width * k), H), Image.LANCZOS)
    span = im.width - W
    x = (x0 + (x1 - x0) * p) * span
    return im.crop((int(x), 0, int(x) + W, H))


def extract_video(key, start, dur):
    d = os.path.join(CACHE, f"{key}_{start}_{dur}")
    if not os.path.isdir(d):
        os.makedirs(d + ".tmp", exist_ok=True)
        subprocess.run(["ffmpeg", "-v", "error", "-ss", str(start), "-t", str(dur), "-i", media_path(key),
                        "-vf", f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS}",
                        "-q:v", "3", os.path.join(d + ".tmp", "%05d.jpg")], check=True)
        os.rename(d + ".tmp", d)
    return d


def video_frame(key, start, dur, lt):
    d = extract_video(key, start, dur)
    n = len(os.listdir(d))
    i = int(lt * FPS) % (2 * n - 2) if n > 1 else 0
    i = (i if i < n else 2 * n - 2 - i) + 1
    return Image.open(os.path.join(d, f"{i:05d}.jpg")).convert("RGB")


VIDEOS = []  # (ключ, начало, длительность) — нарезаются заранее в main()


def vshot(key, start=0, dur=12, blur=0):
    if (key, start, dur) not in VIDEOS:
        VIDEOS.append((key, start, dur))
    def fn(p, lt):
        im = video_frame(key, start, dur, lt)
        return im.filter(ImageFilter.GaussianBlur(blur)) if blur else im
    return fn


def shade(img, top=0.35, bottom=0.65):
    """Затемнение фона, чтобы текст читался."""
    a = np.linspace(top, bottom, H)[:, None]
    arr = np.asarray(img).astype(np.float32) * (1 - a[..., None])
    return Image.fromarray(arr.astype(np.uint8)).convert("RGBA")


def shots(lt, seq):
    """seq: [(длительность, функция(p, t))] — последовательность кадров с наплывами 0.5 c."""
    t0 = 0
    for i, (d, fn) in enumerate(seq):
        if lt < t0 + d or i == len(seq) - 1:
            img = fn(clamp01((lt - t0) / d), lt - t0)
            if i + 1 < len(seq) and lt > t0 + d - 0.5:
                nxt = seq[i + 1][1](0.0, 0.0)
                img = Image.blend(img, nxt, (lt - (t0 + d - 0.5)) / 0.5)
            return img
        t0 += d


def clamp01(x):
    return max(0.0, min(1.0, x))


def caption(img, s, alpha):
    """Подпись в углу (источник / архив)."""
    text(img, s, H - 36, 22, alpha * 0.85, (230, 230, 230), bold=False, x=W - 40, anchor="rm")


_flag = {}


def official_flag(width):
    if width not in _flag:
        im = Image.open(media_path("flag")).convert("RGB")
        im = im.resize((width, width // 2), Image.LANCZOS)
        _flag[width] = np.asarray(im).astype(np.float32)
    return _flag[width]


_emb = {}


def emblem(h):
    if h not in _emb:
        im = Image.open(media_path("emblem")).convert("RGBA")
        _emb[h] = im.resize((int(im.width * h / im.height), h), Image.LANCZOS)
    return _emb[h]


# ---------------------------------------------------------------- scenes
def scene_intro(t):          # 0 – 12
    img = shade(video_frame("milkyway", 0, 12, t), 0.25, 0.55)
    caption(img, "Обсерватория Ассы-Тургень, Казахстан", fade(t, 1, 12.6, 1, 0.7))
    em = emblem(330)
    paste_alpha(img, em, (W / 2 - em.width / 2, 250 + (1 - ease((t - 1) / 2)) * 30), fade(t, 1.0, 12.6, 2, 0.7))
    text(img, "25 ҚАЗАН", 160, 110, fade(t, 3.5, 12.6, 1.5, 0.7), GOLD, serif=True)
    text(img, "РЕСПУБЛИКА КҮНІ", 720, 104, fade(t, 4.5, 12.6, 1.5, 0.7), WHITE, serif=True)
    text(img, "25 октября — День Республики Казахстан", 830, 46, fade(t, 5.5, 12.6, 1.5, 0.7), WHITE, bold=False)
    return img


def scene_flag(t):           # 12 – 26
    bg = vshot("sunrise2", 2, 14, blur=4)(0, t)
    img = shade(bg, 0.25, 0.5)
    flag = wave_flag(official_flag(1400), t, 1400)
    paste_alpha(img, flag, ((W - flag.width) / 2, 110), fade(t, 0, 14.4, 1.0, 0.6))
    al = fade(t, 1.5, 14.4, 1.2, 0.6)
    bar = Image.new("RGBA", (W, 190), (0, 20, 40, 170))
    paste_alpha(img, bar, (0, H - 190), al)
    text(img, "Көк байрақ — тәуелсіздігіміздің символы", H - 128, 52, al, GOLD, serif=True)
    text(img, "Голубой флаг — символ нашей независимости, мира и единства", H - 58, 36, al, WHITE, bold=False)
    return img


def scene_declaration(t):    # 26 – 54
    bg = shots(t, [(14, vshot("sunrise", 0, 14)), (14, vshot("berkut", 1, 14))])
    img = shade(bg, 0.45, 0.75)
    a = fade(t, 0, 28.4, 1, 0.6)
    text(img, "1990", 260, 150, fade(t, 0.6, 28.4, 1.2, 0.6), GOLD, serif=True)
    text(img, "жылғы 25 қазан  ·  25 октября 1990 года", 375, 44, fade(t, 1.4, 28.4, 1.2, 0.6))
    wrap_text(img, "Қазақ КСР-інің Мемлекеттік егемендігі туралы декларация қабылданды",
              560, 50, 1500, fade(t, 3.0, 28.4, 1.2, 0.6), GOLD, serif=True, bold=True)
    wrap_text(img, "Принята Декларация о государственном суверенитете Казахской ССР — "
                   "первый шаг к независимости нашей страны",
              760, 40, 1450, fade(t, 5.0, 28.4, 1.2, 0.6))
    return img


def scene_history(t):        # 54 – 80
    img = shade(shots(t, [(13, vshot("milkyway", 6, 13)), (13, vshot("sunrise2", 6, 13))]), 0.5, 0.7)
    al = fade(t, 0, 26.4, 1, 0.6)
    if t < 13:
        caption(img, "Обсерватория Ассы-Тургень, Казахстан", al)
    text(img, "МЕРЕКЕНІҢ ТАРИХЫ  ·  ИСТОРИЯ ПРАЗДНИКА", 150, 50, al, GOLD, serif=True)
    starts = [1.0, 6.5, 11.0]
    cw, ch, gap = 540, 600, 50
    x0 = (W - 3 * cw - 2 * gap) / 2
    for i, (yr, kz, ru) in enumerate(HIST):
        ca = fade(t, starts[i], 26.4, 1.0, 0.6) * al
        if ca <= 0:
            continue
        x = x0 + i * (cw + gap)
        y = 260 + (1 - ease((t - starts[i]) / 1.0)) * 60
        card = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
        ImageDraw.Draw(card).rounded_rectangle([0, 0, cw - 1, ch - 1], 28,
                                               fill=(0, 60, 90, 205) if i != 1 else (30, 38, 50, 205),
                                               outline=GOLD + (255,), width=4)
        paste_alpha(img, card, (x, y), ca)
        text(img, yr, y + 110, 110, ca, GOLD if i != 1 else (190, 200, 210), serif=True, x=x + cw / 2)
        for txt, size, col, b, yy in [(kz, 34, WHITE, True, y + 250), (ru, 30, (210, 235, 245), False, y + 355)]:
            fnt = font(size, b, b)
            words, lines, cur = txt.split(), [], ""
            for wd in words:
                tt = (cur + " " + wd).strip()
                if fnt.getlength(tt) > cw - 60 and cur:
                    lines.append(cur)
                    cur = wd
                else:
                    cur = tt
            lines.append(cur)
            for li, ln in enumerate(lines):
                text(img, ln, yy + li * size * 1.3, size, ca, col, serif=b, bold=b, x=x + cw / 2, shadow=False)
    return img


TL_BG = [("milkyway", 0), ("soldier_sil", 0), ("berkut", 6), ("sunrise", 6), ("jets", 2)]


def scene_timeline(t):       # 80 – 100
    seg = 20.0 / len(TIMELINE)
    idx = max(0, min(int(t // seg), len(TIMELINE) - 1))
    lt = t - idx * seg
    img = shade(shots(t, [(4, vshot(k, st, 4)) for k, st in TL_BG]), 0.5, 0.75)
    al = fade(t, 0, 20.4, 1, 0.6)
    text(img, "ТАРИХ БЕЛЕСТЕРІ  ·  ВЕХИ ИСТОРИИ", 150, 50, al, GOLD, serif=True)
    d = ImageDraw.Draw(img)
    y = 300
    x0, x1 = 260, W - 260
    d.line([(x0, y), (x1, y)], fill=(255, 255, 255, int(140 * al)), width=4)
    prog = (idx + ease(lt / 1.0)) / (len(TIMELINE) - 1)
    d.line([(x0, y), (x0 + (x1 - x0) * min(prog, 1), y)], fill=GOLD + (int(255 * al),), width=6)
    for i, (date, _, _) in enumerate(TIMELINE):
        x = x0 + (x1 - x0) * i / (len(TIMELINE) - 1)
        on = i <= idx
        r = 18 if i == idx else 12
        d.ellipse([x - r, y - r, x + r, y + r], fill=(GOLD if on else (150, 160, 170)) + (int(255 * al),))
        text(img, date, y + 50, 28, al * (1 if on else 0.7), GOLD if i == idx else WHITE, bold=(i == idx), x=x)
    date, kz, ru = TIMELINE[idx]
    ia = fade(lt, 0.3, seg - 0.05, 0.8, 0.5) * al
    slide = (1 - ease((lt - 0.3) / 0.8)) * 60
    text(img, date, 540 + slide, 120, ia, GOLD, serif=True)
    wrap_text(img, kz, 700 + slide, 52, 1500, ia, WHITE, serif=True, bold=True)
    wrap_text(img, ru, 840 + slide, 40, 1500, ia, (215, 235, 245))
    return img


def scene_army(t):           # 100 – 120
    img = shade(shots(t, [(7, vshot("jets", 0, 7)), (7, vshot("soldiers_walk", 3, 7)), (6, vshot("soldier_sil", 4, 6))]), 0.35, 0.8)
    al = fade(t, 0, 20.4, 1, 0.6)
    text(img, "ҚАЗАҚСТАН РЕСПУБЛИКАСЫНЫҢ ҚАРУЛЫ КҮШТЕРІ", 130, 54, fade(t, 0.5, 20.4, 1, 0.6), GOLD, serif=True)
    text(img, "Вооружённые Силы Республики Казахстан", 200, 38, fade(t, 1.0, 20.4, 1, 0.6))
    if t < 10.0:
        q = fade(t, 2.0, 10.1, 1.2, 0.6) * al
        wrap_text(img, "«Қазақстан Республикасын қорғау — оның әрбір азаматының қасиетті парызы және міндеті»",
                  720, 46, 1500, q, WHITE, serif=True, bold=True)
        wrap_text(img, "«Защита Республики Казахстан является священным долгом и обязанностью каждого её гражданина»",
                  860, 36, 1400, q, (215, 235, 245))
        text(img, "Конституция РК, статья 36", 950, 28, q * 0.9, GOLD, bold=False)
    else:
        cards = [("Құрлық әскерлері", "Сухопутные войска"),
                 ("Әуе қорғанысы күштері", "Силы воздушной обороны"),
                 ("Әскери-теңіз күштері", "Военно-морские силы")]
        cw, ch, gap = 560, 200, 40
        x0 = (W - 3 * cw - 2 * gap) / 2
        for i, (kz, ru) in enumerate(cards):
            ca = fade(t, 10.2 + i * 0.6, 20.4, 0.9, 0.6) * al
            if ca <= 0:
                continue
            x = x0 + i * (cw + gap)
            y = 780 + (1 - ease((t - 10.2 - i * 0.6) / 0.9)) * 50
            card = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
            ImageDraw.Draw(card).rounded_rectangle([0, 0, cw - 1, ch - 1], 24, fill=(0, 50, 75, 210),
                                                   outline=GOLD + (255,), width=4)
            paste_alpha(img, card, (x, y), ca)
            text(img, kz, y + 75, 33, ca, GOLD, serif=True, x=x + cw / 2)
            text(img, ru, y + 135, 30, ca, WHITE, bold=False, x=x + cw / 2)
    return img


def scene_values(t):         # 120 – 134
    img = shade(shots(t, [(7, vshot("soldier_sil", 0, 7)), (7, vshot("berkut", 8, 7))]), 0.55, 0.7)
    al = fade(t, 0, 14.4, 1, 0.6)
    paste_alpha(img, mv.assets()["orn_v"], (40, 0), al * 0.8)
    paste_alpha(img, mv.assets()["orn_v"], (W - 110, 0), al * 0.8)
    for i, (kz, ru) in enumerate(VALUES):
        st = 0.8 + i * 1.9
        va = fade(t, st, 14.4, 1.0, 0.6)
        y = 210 + i * 200
        text(img, kz, y + (1 - ease((t - st) / 1.0)) * 30, 96, va, GOLD, serif=True)
        text(img, ru, y + 75, 36, va, WHITE, bold=False)
    return img


def scene_congrats(t):       # 134 – 152
    img = shade(vshot("milkyway", 0, 18)(0, t), 0.45, 0.75)
    al = fade(t, 0, 18.4, 1, 0.6)
    frame_borders(img, al)
    caption(img, "Обсерватория Ассы-Тургень, Казахстан", al)
    em = emblem(170)
    paste_alpha(img, em, (W / 2 - em.width / 2, 120), al)
    text(img, "Құрметті профессор-оқытушылар құрамы, курсанттар мен студенттер!", 360, 42,
         fade(t, 0.8, 18.4, 1.2, 0.6), GOLD, serif=True)
    text(img, "Уважаемые преподаватели, курсанты и студенты!", 430, 38, fade(t, 1.6, 18.4, 1.2, 0.6))
    wrap_text(img, "Әскери кафедра сіздерді Республика күнімен шын жүректен құттықтайды! "
                   "Еліміздің тәуелсіздігі мен бейбітшілігін қорғау — біздің ортақ борышымыз.",
              600, 40, 1550, fade(t, 3.5, 18.4, 1.2, 0.6), WHITE, serif=True, bold=True)
    wrap_text(img, "Военная кафедра сердечно поздравляет вас с Днём Республики! "
                   "Желаем мирного неба, крепкого здоровья, стойкости и успехов в служении Родине!",
              800, 36, 1500, fade(t, 6.0, 18.4, 1.2, 0.6), (215, 235, 245))
    return img


def scene_final(t):          # 152 – 162
    bg = vshot("sunrise", 4, 10, blur=3)(0, t)
    img = shade(bg, 0.3, 0.6)
    flag = wave_flag(official_flag(1200), t + 30, 1200)
    paste_alpha(img, flag, ((W - flag.width) / 2, 60), fade(t, 0, 20, 1.0, 1))
    bar = Image.new("RGBA", (W, 300), (0, 20, 40, 190))
    paste_alpha(img, bar, (0, H - 300), fade(t, 0.5, 20, 1, 1))
    text(img, "Республика күні құтты болсын!", H - 200, 72, fade(t, 1.0, 20, 1.2, 1), GOLD, serif=True)
    text(img, "С Днём Республики!", H - 115, 50, fade(t, 2.0, 20, 1.2, 1), WHITE, serif=True)
    text(img, "МӘҢГІЛІК ЕЛ!", H - 45, 36, fade(t, 3.0, 20, 1.2, 1), GOLD, bold=True)
    return img


def scene_credits(t):        # 162 – 168
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255))
    a = fade(t, 0.3, 6.5, 0.8, 1.0)
    lines = [("Использованные материалы", 44, GOLD),
             ("Флаг и герб Республики Казахстан — Wikimedia Commons (общественное достояние)", 28, WHITE),
             ("Млечный Путь над обсерваторией Ассы-Тургень — Astrobond, Wikimedia Commons, CC BY-SA 4.0", 28, WHITE),
             ("Видео: Mixkit (mixkit.co), бесплатная лицензия Mixkit", 28, WHITE),
             ("Озвучка: синтезатор речи RHVoice  ·  Музыка: создана для этого видео", 28, WHITE)]
    for i, (ln, size, col) in enumerate(lines):
        text(img, ln, 300 + i * 110 + (40 if i else 0), size, a, col, serif=(i == 0), bold=(i == 0), shadow=False)
    return img


SCENES = [(0, 12, scene_intro), (12, 26, scene_flag), (26, 54, scene_declaration),
          (54, 80, scene_history), (80, 100, scene_timeline), (100, 120, scene_army),
          (120, 134, scene_values), (134, 152, scene_congrats), (152, 162, scene_final),
          (162, 168, scene_credits)]
XF = 0.6
ARCH_START = 0.0


def render(i):
    return render_img(i).convert("RGB").tobytes()


def render_img(i):
    t = i / FPS
    for k, (s, e, fn) in enumerate(SCENES):
        if s <= t < e or k == len(SCENES) - 1:
            img = fn(t - s)
            if k + 1 < len(SCENES) and t > e - XF:
                ns, _, nfn = SCENES[k + 1]
                img = Image.blend(img, nfn(max(0.0, t - ns)), (t - (e - XF)) / XF)
            return img


def main():
    out = os.path.join(HERE, "republic_day.mp4")
    audio = os.path.join(HERE, "music.wav")
    mv.mix_audio(audio)
    # заранее нарезаем видеофрагменты в кадры
    for i in range(0, int(DURATION * FPS), FPS):   # прогон, чтобы собрать список клипов
        render_img(i)
    for k, st, d in VIDEOS:
        extract_video(k, st, d)
    total = int(DURATION * FPS)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", audio,
           "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    with Pool(os.cpu_count()) as pool:
        for i, fr in enumerate(pool.imap(render, range(total), chunksize=8)):
            p.stdin.write(fr)
            if i % 600 == 0:
                print(f"{i}/{total}", flush=True)
    p.stdin.close()
    p.wait()
    os.remove(audio)
    shutil.rmtree(CACHE, ignore_errors=True)
    print("done:", out)


if __name__ == "__main__":
    main()

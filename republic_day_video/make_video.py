"""Видео ко Дню Республики Казахстан (25 октября) для страницы военной кафедры.

Запуск:  python3 make_video.py
Результат: republic_day.mp4 (1920x1080, 30 к/с, ~2.5 мин, с музыкой).
Нужны: python3, Pillow, numpy, ffmpeg.
"""
import math
import os
import subprocess
import wave
from multiprocessing import Pool

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H, FPS = 1920, 1080, 30
DURATION = 152.0
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "republic_day.mp4")
AUDIO = os.path.join(HERE, "music.wav")

SKY = (0, 175, 202)       # голубой цвет флага
GOLD = (254, 197, 0)      # золотой цвет флага
NAVY = (6, 30, 52)
WHITE = (255, 255, 255)

FONT_DIR = "/usr/share/fonts/truetype/dejavu/"
_fonts = {}


def font(size, bold=True, serif=False):
    name = ("DejaVuSerif" if serif else "DejaVuSans") + ("-Bold" if bold else "") + ".ttf"
    key = (name, size)
    if key not in _fonts:
        _fonts[key] = ImageFont.truetype(FONT_DIR + name, size)
    return _fonts[key]


# ---------------------------------------------------------------- helpers
def clamp(x, a=0.0, b=1.0):
    return max(a, min(b, x))


def ease(x):
    x = clamp(x)
    return x * x * (3 - 2 * x)


def fade(t, start, end, fin=0.8, fout=0.8):
    """Прозрачность элемента, видимого с start до end."""
    if t < start or t > end:
        return 0.0
    return ease((t - start) / fin) * ease((end - t) / fout)


def vgradient(top, bottom, w=W, h=H):
    a = np.linspace(0, 1, h)[:, None, None]
    arr = np.array(top)[None, None, :] * (1 - a) + np.array(bottom)[None, None, :] * a
    return np.repeat(arr, w, axis=1).astype(np.uint8)


def text(img, s, y, size, alpha=1.0, color=WHITE, serif=False, bold=True, x=None,
         shadow=True, anchor="mm"):
    if alpha <= 0.01:
        return
    f = font(size, bold, serif)
    layer = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x = W / 2 if x is None else x
    a = int(255 * alpha)
    if shadow:
        sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
        ImageDraw.Draw(sh).text((x + 3, y + 4), s, font=f, fill=(0, 0, 0, int(a * 0.6)), anchor=anchor)
        sh = sh.filter(ImageFilter.GaussianBlur(5))
        img.alpha_composite(sh)
    d.text((x, y), s, font=f, fill=color + (a,), anchor=anchor)
    img.alpha_composite(layer)


def wrap_text(img, s, y, size, max_w, alpha=1.0, color=WHITE, serif=False, bold=False, gap=1.35):
    f = font(size, bold, serif)
    words, lines, cur = s.split(), [], ""
    for wd in words:
        t = (cur + " " + wd).strip()
        if f.getlength(t) > max_w and cur:
            lines.append(cur)
            cur = wd
        else:
            cur = t
    lines.append(cur)
    y0 = y - (len(lines) - 1) * size * gap / 2
    for i, ln in enumerate(lines):
        text(img, ln, y0 + i * size * gap, size, alpha, color, serif, bold)


def paste_alpha(img, layer, xy, alpha=1.0):
    if alpha <= 0.01:
        return
    if alpha < 1:
        layer = layer.copy()
        layer.putalpha(layer.getchannel("A").point(lambda v: int(v * alpha)))
    img.alpha_composite(layer, (int(xy[0]), int(xy[1])))


# ---------------------------------------------------------------- assets
def make_sun(r, rays=32):
    """Солнце с 32 лучами, как на флаге."""
    s = int(r * 2.3)
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    c = s / 2
    for i in range(rays):
        a = 2 * math.pi * i / rays
        da = math.pi / rays * 0.55
        r1, r2 = r * 0.72, r * 1.12
        pts = [(c + r1 * math.cos(a - da), c + r1 * math.sin(a - da)),
               (c + r2 * math.cos(a), c + r2 * math.sin(a)),
               (c + r1 * math.cos(a + da), c + r1 * math.sin(a + da))]
        d.polygon(pts, fill=GOLD + (255,))
    d.ellipse([c - r * 0.66, c - r * 0.66, c + r * 0.66, c + r * 0.66], fill=GOLD + (255,))
    return im


def make_eagle(w):
    """Стилизованный силуэт степного орла (берку́та) с раскрытыми крыльями."""
    h = int(w * 0.36)
    S = 4
    im = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    def P(pts):
        return [(x * w * S, y * h * S) for x, y in pts]
    right_wing = [(0.53, 0.42), (0.62, 0.30), (0.74, 0.22), (0.86, 0.14), (1.00, 0.05),
                  (0.95, 0.16), (0.99, 0.18), (0.91, 0.28), (0.95, 0.30), (0.86, 0.38),
                  (0.89, 0.41), (0.79, 0.47), (0.81, 0.50), (0.70, 0.54), (0.60, 0.58), (0.53, 0.60)]
    left_wing = [(1 - x, y) for x, y in right_wing]
    d.polygon(P(right_wing), fill=GOLD + (255,))
    d.polygon(P(left_wing), fill=GOLD + (255,))
    body = [(0.46, 0.40), (0.50, 0.30), (0.54, 0.40), (0.56, 0.62), (0.53, 0.80),
            (0.58, 0.98), (0.50, 0.90), (0.42, 0.98), (0.47, 0.80), (0.44, 0.62)]
    d.polygon(P(body), fill=GOLD + (255,))
    head = [(0.47, 0.34), (0.43, 0.26), (0.40, 0.27), (0.43, 0.20), (0.49, 0.19), (0.52, 0.28)]
    d.polygon(P(head), fill=GOLD + (255,))
    return im.resize((w, h), Image.LANCZOS)


def ornament_motif(d, cx, cy, s, color, width):
    """Мотив «қошқар мүйіз» (бараньи рога) — две спирали от общего стебля."""
    d.line([(cx, cy + s * 0.9), (cx, cy - s * 0.2)], fill=color, width=width)
    for sgn in (-1, 1):
        pts = []
        for i in range(60):
            t = i / 59
            ang = math.pi * 0.5 + sgn * (t * 2.6 * math.pi)
            rr = s * 0.55 * (1 - t * 0.75)
            ox = cx + sgn * s * 0.5
            oy = cy - s * 0.2
            pts.append((ox + rr * math.cos(ang) * -sgn * -1, oy - rr * math.sin(ang)))
        # стебель переходит в спираль
        d.line([(cx, cy - s * 0.2)] + pts, fill=color, width=width, joint="curve")


def make_ornament_strip(w, h, color=GOLD, vertical=True):
    S = 3
    im = Image.new("RGBA", (w * S, h * S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if vertical:
        step = w * S * 1.15
        n = int(h * S / step) + 1
        for i in range(n):
            ornament_motif(d, w * S / 2, step * (i + 0.5), w * S * 0.42, color + (255,), max(2, int(w * S * 0.07)))
    else:
        step = h * S * 1.15
        n = int(w * S / step) + 1
        for i in range(n):
            ornament_motif(d, step * (i + 0.5), h * S / 2, h * S * 0.42, color + (255,), max(2, int(h * S * 0.07)))
    return im.resize((w, h), Image.LANCZOS)


def make_flag(fw):
    fh = fw // 2
    im = Image.new("RGBA", (fw, fh), SKY + (255,))
    sun = make_sun(int(fh * 0.20))
    im.alpha_composite(sun, (int(fw / 2 - sun.width / 2), int(fh * 0.43 - sun.height / 2)))
    eagle = make_eagle(int(fw * 0.42))
    im.alpha_composite(eagle, (int(fw / 2 - eagle.width / 2), int(fh * 0.60)))
    orn = make_ornament_strip(int(fw * 0.075), fh)
    im.alpha_composite(orn, (int(fw * 0.035), 0))
    return im


ASSETS = {}


def assets():
    if not ASSETS:
        ASSETS["flag"] = np.array(make_flag(1500).convert("RGB")).astype(np.float32)
        ASSETS["flag_small"] = np.array(make_flag(900).convert("RGB")).astype(np.float32)
        ASSETS["sun_big"] = make_sun(260)
        ASSETS["sun_mid"] = make_sun(120)
        ASSETS["eagle"] = make_eagle(900)
        ASSETS["orn_h"] = make_ornament_strip(W, 70, vertical=False)
        ASSETS["orn_v"] = make_ornament_strip(70, H)
        ASSETS["bg_sky"] = vgradient((0, 120, 160), (0, 60, 95))
        ASSETS["bg_night"] = vgradient((3, 14, 30), (8, 40, 70))
        ASSETS["bg_navy"] = vgradient((5, 24, 44), (2, 10, 22))
        rng = np.random.default_rng(7)
        ASSETS["stars"] = rng.random((260, 4))
    return ASSETS


def wave_flag(arr, t, out_w):
    """Колышущийся флаг: смещение по синусоиде + затенение складок."""
    fh, fw, _ = arr.shape
    xs = np.arange(fw, dtype=np.float32)
    k = xs / fw
    amp = fh * 0.045 * (0.25 + k)
    phase = xs * 0.011 - t * 3.2
    dy = amp * np.sin(phase) + amp * 0.35 * np.sin(phase * 1.9 + 1.3)
    shade = 1.0 + 0.22 * np.cos(phase) * (0.3 + k)
    ys = np.arange(fh, dtype=np.float32)[:, None]
    src_y = ys - dy[None, :]
    valid = (src_y >= 0) & (src_y <= fh - 1)
    y0 = np.clip(np.floor(src_y).astype(np.int32), 0, fh - 1)
    y1 = np.clip(y0 + 1, 0, fh - 1)
    fr = (src_y - np.floor(src_y))[..., None]
    xi = np.broadcast_to(np.arange(fw)[None, :], (fh, fw))
    pix = arr[y0, xi] * (1 - fr) + arr[y1, xi] * fr
    pix = np.clip(pix * shade[None, :, None], 0, 255)
    alpha = valid.astype(np.float32)
    rgba = np.dstack([pix, alpha * 255]).astype(np.uint8)
    im = Image.fromarray(rgba, "RGBA")
    if out_w != fw:
        im = im.resize((out_w, int(fh * out_w / fw)), Image.BILINEAR)
    return im


def starfield(img, t, alpha=1.0, color=(255, 230, 150)):
    st = assets()["stars"]
    d = ImageDraw.Draw(img)
    for x, y, s, p in st:
        yy = (y * H - t * (8 + 25 * s)) % H
        tw = 0.5 + 0.5 * math.sin(t * (1 + 3 * p) + p * 10)
        a = int(alpha * 255 * tw * (0.3 + 0.7 * s))
        r = 1 + 2.2 * s
        d.ellipse([x * W - r, yy - r, x * W + r, yy + r], fill=color + (a,))


def rotated(im, deg):
    return im.rotate(deg, resample=Image.BICUBIC)


def base(bg):
    return Image.fromarray(assets()[bg]).convert("RGBA")


def frame_borders(img, alpha):
    a = assets()
    paste_alpha(img, a["orn_h"], (0, 18), alpha * 0.85)
    paste_alpha(img, a["orn_h"], (0, H - 88), alpha * 0.85)


# ---------------------------------------------------------------- scenes
def scene_intro(t):          # 0 – 12
    a = assets()
    img = base("bg_night")
    sky = Image.fromarray(a["bg_sky"]).convert("RGBA")
    paste_alpha(img, sky, (0, 0), ease(t / 6))
    starfield(img, t, 1 - ease(t / 5))
    rise = ease(t / 5.5)
    sun = rotated(a["sun_big"], t * 6)
    cy = H + 200 - rise * (H * 0.5 + 200) - 40
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse([W / 2 - 420, cy - 420, W / 2 + 420, cy + 420], fill=(255, 210, 80, 70))
    glow = glow.filter(ImageFilter.GaussianBlur(90))
    img.alpha_composite(glow)
    paste_alpha(img, sun, (W / 2 - sun.width / 2, cy - sun.height / 2), 1)
    text(img, "25 ҚАЗАН", 210 + (1 - ease((t - 4) / 1.5)) * 40, 120, fade(t, 4, 12.6, 1.5, 0.7), GOLD, serif=True)
    text(img, "РЕСПУБЛИКА КҮНІ", 840, 104, fade(t, 5.2, 12.6, 1.5, 0.7), WHITE, serif=True)
    text(img, "25 октября — День Республики Казахстан", 950, 46, fade(t, 6.5, 12.6, 1.5, 0.7), WHITE, bold=False)
    return img


def scene_flag(t):           # 12 – 26
    a = assets()
    img = base("bg_sky")
    flag = wave_flag(a["flag"], t, 1500)
    paste_alpha(img, flag, ((W - flag.width) / 2, 120), fade(t, 0, 14.4, 1.0, 0.6))
    al = fade(t, 1.5, 14.4, 1.2, 0.6)
    bar = Image.new("RGBA", (W, 190), (0, 20, 40, 170))
    paste_alpha(img, bar, (0, H - 190), al)
    text(img, "Көк байрақ — тәуелсіздігіміздің символы", H - 128, 52, al, GOLD, serif=True)
    text(img, "Голубой флаг — символ нашей независимости, мира и единства", H - 58, 36, al, WHITE, bold=False)
    return img


def scene_declaration(t):    # 26 – 42
    a = assets()
    img = base("bg_navy")
    starfield(img, t + 30, 0.5)
    frame_borders(img, fade(t, 0, 16.4, 1, 0.6))
    sun = rotated(a["sun_mid"], t * 4)
    paste_alpha(img, sun, (W / 2 - sun.width / 2, 120), fade(t, 0, 16.4, 1, 0.6) * 0.9)
    text(img, "1990", 460, 150, fade(t, 0.6, 16.4, 1.2, 0.6), GOLD, serif=True)
    text(img, "жылғы 25 қазан  ·  25 октября 1990 года", 575, 44, fade(t, 1.4, 16.4, 1.2, 0.6))
    wrap_text(img, "Қазақ КСР-інің Мемлекеттік егемендігі туралы декларация қабылданды",
              700, 46, 1500, fade(t, 3.0, 16.4, 1.2, 0.6), GOLD, serif=True, bold=True)
    wrap_text(img, "Принята Декларация о государственном суверенитете Казахской ССР — "
                   "первый шаг к независимости нашей страны",
              850, 38, 1450, fade(t, 5.0, 16.4, 1.2, 0.6))
    return img


TIMELINE = [
    ("16.12.1991", "Мемлекеттік тәуелсіздік туралы Заң қабылданды",
     "Принят Конституционный закон о государственной независимости"),
    ("07.05.1992", "Қазақстан Республикасының Қарулы Күштері құрылды",
     "Образованы Вооружённые Силы Республики Казахстан"),
    ("04.06.1992", "Мемлекеттік Ту мен Елтаңба бекітілді",
     "Утверждены Государственный флаг и герб"),
    ("30.08.1995", "Қазақстан Республикасының Конституциясы қабылданды",
     "Принята Конституция Республики Казахстан"),
    ("2022", "Республика күні қайтадан басты ұлттық мереке болды",
     "День Республики вновь стал главным национальным праздником"),
]


def scene_timeline(t):       # 42 – 74 (32 c)
    img = base("bg_navy")
    starfield(img, t + 60, 0.4)
    al = fade(t, 0, 32.4, 1, 0.6)
    frame_borders(img, al)
    text(img, "ТАРИХ БЕЛЕСТЕРІ  ·  ВЕХИ ИСТОРИИ", 175, 50, al, GOLD, serif=True)
    seg = 32.0 / len(TIMELINE)
    idx = min(int(t // seg), len(TIMELINE) - 1)
    lt = t - idx * seg
    d = ImageDraw.Draw(img)
    y = 330
    x0, x1 = 260, W - 260
    d.line([(x0, y), (x1, y)], fill=(255, 255, 255, int(120 * al)), width=4)
    prog = (idx + ease(lt / 1.0)) / (len(TIMELINE) - 1)
    d.line([(x0, y), (x0 + (x1 - x0) * min(prog, 1), y)], fill=GOLD + (int(255 * al),), width=6)
    for i, (date, _, _) in enumerate(TIMELINE):
        x = x0 + (x1 - x0) * i / (len(TIMELINE) - 1)
        on = i <= idx
        r = 18 if i == idx else 12
        d.ellipse([x - r, y - r, x + r, y + r], fill=(GOLD if on else (90, 110, 130)) + (int(255 * al),))
        text(img, date, y + 50, 28, al * (1 if on else 0.6), GOLD if i == idx else WHITE, bold=(i == idx), shadow=False, x=x)
    date, kz, ru = TIMELINE[idx]
    ia = fade(lt, 0.3, seg - 0.05, 0.8, 0.5) * al
    slide = (1 - ease((lt - 0.3) / 0.8)) * 60
    text(img, date, 560 + slide, 120, ia, GOLD, serif=True)
    wrap_text(img, kz, 720 + slide, 50, 1500, ia, WHITE, serif=True, bold=True)
    wrap_text(img, ru, 850 + slide, 38, 1500, ia, (200, 230, 240))
    return img


def make_shield(size):
    S = 3
    s = size * S
    im = Image.new("RGBA", (s, int(s * 1.2)), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    pts = [(s * 0.5, 0), (s, s * 0.15), (s * 0.95, s * 0.7), (s * 0.5, s * 1.18), (s * 0.05, s * 0.7), (0, s * 0.15)]
    d.polygon(pts, fill=GOLD + (255,))
    inner = [((x - s / 2) * 0.88 + s / 2, y * 0.88 + s * 0.06) for x, y in pts]
    d.polygon(inner, fill=SKY + (255,))
    cx, cy, R = s / 2, s * 0.55, s * 0.28
    star = []
    for i in range(10):
        a = -math.pi / 2 + i * math.pi / 5
        r = R if i % 2 == 0 else R * 0.42
        star.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    d.polygon(star, fill=GOLD + (255,))
    return im.resize((size, int(size * 1.2)), Image.LANCZOS)


def scene_army(t):           # 74 – 100 (26 c)
    a = assets()
    if "shield" not in a:
        a["shield"] = make_shield(260)
    img = base("bg_navy")
    starfield(img, t + 90, 0.35)
    al = fade(t, 0, 26.4, 1, 0.6)
    frame_borders(img, al)
    sh = a["shield"]
    k = 0.85 + 0.15 * ease(t / 1.5)
    shs = sh.resize((int(sh.width * k), int(sh.height * k)), Image.LANCZOS)
    paste_alpha(img, shs, (W / 2 - shs.width / 2, 140 + (1 - k) * 100), al)
    text(img, "ҚАЗАҚСТАН РЕСПУБЛИКАСЫНЫҢ ҚАРУЛЫ КҮШТЕРІ", 500, 54, fade(t, 0.8, 26.4, 1, 0.6), GOLD, serif=True)
    text(img, "Вооружённые Силы Республики Казахстан", 570, 38, fade(t, 1.4, 26.4, 1, 0.6))
    if t < 12.5:
        q = fade(t, 2.5, 12.6, 1.2, 0.6) * al
        wrap_text(img, "«Қазақстан Республикасын қорғау — оның әрбір азаматының қасиетті парызы және міндеті»",
                  730, 44, 1500, q, WHITE, serif=True, bold=True)
        wrap_text(img, "«Защита Республики Казахстан является священным долгом и обязанностью каждого её гражданина»",
                  870, 34, 1400, q, (200, 230, 240))
        text(img, "Конституция РК, статья 36", 960, 28, q * 0.8, GOLD, bold=False, shadow=False)
    else:
        cards = [("Құрлық әскерлері", "Сухопутные войска"),
                 ("Әуе қорғанысы күштері", "Силы воздушной обороны"),
                 ("Әскери-теңіз күштері", "Военно-морские силы")]
        cw, ch, gap = 560, 220, 40
        x0 = (W - 3 * cw - 2 * gap) / 2
        for i, (kz, ru) in enumerate(cards):
            ca = fade(t, 12.8 + i * 0.6, 26.4, 0.9, 0.6) * al
            if ca <= 0:
                continue
            x = x0 + i * (cw + gap)
            y = 700 + (1 - ease((t - 12.8 - i * 0.6) / 0.9)) * 50
            card = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
            cd = ImageDraw.Draw(card)
            cd.rounded_rectangle([0, 0, cw - 1, ch - 1], 24, fill=(0, 90, 120, 200), outline=GOLD + (255,), width=4)
            paste_alpha(img, card, (x, y), ca)
            text(img, kz, y + 85, 33, ca, GOLD, serif=True, x=x + cw / 2)
            text(img, ru, y + 145, 30, ca, WHITE, bold=False, x=x + cw / 2)
    return img


VALUES = [("БІРЛІК", "единство"), ("ЕРЛІК", "мужество"), ("АДАЛДЫҚ", "верность"), ("ОТАНСҮЙГІШТІК", "патриотизм")]


def scene_values(t):         # 100 – 122 (22 c)
    a = assets()
    img = base("bg_sky")
    flag = wave_flag(a["flag_small"], t, 900)
    al = fade(t, 0, 22.4, 1, 0.6)
    dim = Image.new("RGBA", (W, H), (0, 25, 45, 140))
    img.alpha_composite(dim)
    paste_alpha(img, flag, (W / 2 - flag.width / 2, 70), al * 0.35)
    paste_alpha(img, a["orn_v"], (40, 0), al * 0.8)
    paste_alpha(img, a["orn_v"], (W - 110, 0), al * 0.8)
    for i, (kz, ru) in enumerate(VALUES):
        st = 1.0 + i * 2.2
        va = fade(t, st, 22.4, 1.0, 0.6)
        y = 210 + i * 200
        text(img, kz, y + (1 - ease((t - st) / 1.0)) * 30, 96, va, GOLD, serif=True)
        text(img, ru, y + 75, 36, va, WHITE, bold=False)
    return img


def scene_congrats(t):       # 122 – 142 (20 c)
    a = assets()
    img = base("bg_navy")
    starfield(img, t + 120, 0.5)
    al = fade(t, 0, 20.4, 1, 0.6)
    frame_borders(img, al)
    sun = rotated(a["sun_mid"], -t * 4)
    paste_alpha(img, sun, (W / 2 - sun.width / 2, 110), al * 0.9)
    text(img, "Құрметті профессор-оқытушылар құрамы, курсанттар мен студенттер!", 420, 42,
         fade(t, 0.8, 20.4, 1.2, 0.6), GOLD, serif=True)
    text(img, "Уважаемые преподаватели, курсанты и студенты!", 490, 38, fade(t, 1.6, 20.4, 1.2, 0.6))
    wrap_text(img, "Әскери кафедра сіздерді Республика күнімен шын жүректен құттықтайды! "
                   "Еліміздің тәуелсіздігі мен бейбітшілігін қорғау — біздің ортақ борышымыз.",
              640, 38, 1550, fade(t, 3.5, 20.4, 1.2, 0.6), WHITE, serif=True, bold=True)
    wrap_text(img, "Военная кафедра сердечно поздравляет вас с Днём Республики! "
                   "Желаем мирного неба, крепкого здоровья, стойкости и успехов в служении Родине!",
              820, 34, 1500, fade(t, 6.0, 20.4, 1.2, 0.6), (200, 230, 240))
    return img


def scene_final(t):          # 142 – 152 (10 c)
    a = assets()
    img = base("bg_sky")
    flag = wave_flag(a["flag"], t + 30, 1300)
    paste_alpha(img, flag, ((W - flag.width) / 2, 60), fade(t, 0, 20, 1.0, 1))
    bar = Image.new("RGBA", (W, 300), (0, 20, 40, 180))
    paste_alpha(img, bar, (0, H - 300), fade(t, 0.5, 20, 1, 1))
    text(img, "Республика күні құтты болсын!", H - 200, 72, fade(t, 1.0, 20, 1.2, 1), GOLD, serif=True)
    text(img, "С Днём Республики!", H - 115, 50, fade(t, 2.0, 20, 1.2, 1), WHITE, serif=True)
    text(img, "МӘҢГІЛІК ЕЛ!", H - 45, 36, fade(t, 3.0, 20, 1.2, 1), GOLD, bold=True)
    black = 1 - ease((10 - t) / 2.2)
    if black > 0:
        img.alpha_composite(Image.new("RGBA", (W, H), (0, 0, 0, int(255 * black))))
    return img


SCENES = [(0, 12, scene_intro), (12, 26, scene_flag), (26, 42, scene_declaration),
          (42, 74, scene_timeline), (74, 100, scene_army), (100, 122, scene_values),
          (122, 142, scene_congrats), (142, 152, scene_final)]
XF = 0.6  # перекрёстное затухание между сценами, с


def render(i):
    t = i / FPS
    img = None
    for k, (s, e, fn) in enumerate(SCENES):
        if s <= t < e:
            img = fn(t - s)
            if k + 1 < len(SCENES) and t > e - XF:
                ns, _, nfn = SCENES[k + 1]
                nxt = nfn(t - ns)  # отрицательное время → сцена ещё «пустая»
                a = (t - (e - XF)) / XF
                img = Image.blend(img, nxt, a)
            break
    if img is None:
        img = scene_final(t - 142)
    return img.convert("RGB").tobytes()


# ---------------------------------------------------------------- music
def make_music(path, dur):
    sr = 44100
    n = int(sr * dur)
    t = np.arange(n) / sr
    out = np.zeros(n)
    bpm = 76
    beat = 60 / bpm
    bar = beat * 4

    def note(f):
        return 440 * 2 ** ((f - 69) / 12)

    # Торжественная гармония в ре мажоре: D – Bm – G – A, G – D – Em – A
    prog = [[50, 57, 62, 66], [47, 54, 59, 62], [43, 55, 59, 62], [45, 57, 61, 64],
            [43, 55, 59, 62], [50, 57, 62, 66], [40, 55, 59, 64], [45, 57, 61, 64]]
    nb = int(dur / bar) + 1
    for b in range(nb):
        ch = prog[b % len(prog)]
        s0 = int(b * bar * sr)
        s1 = min(n, int((b + 1) * bar * sr) + int(0.3 * sr))
        if s0 >= n:
            break
        tt = np.arange(s1 - s0) / sr
        env = np.minimum(1, tt / 0.6) * np.minimum(1, np.maximum(0, (bar + 0.3 - tt) / 0.5))
        pad = sum(np.sin(2 * np.pi * note(m + 12) * tt) * 0.5 + np.sin(2 * np.pi * note(m + 12) * 1.003 * tt) * 0.5
                  for m in ch[1:])
        pad += 0.6 * np.sin(2 * np.pi * note(ch[0]) * tt)
        out[s0:s1] += 0.05 * pad * env
        # «колокольчики» — арпеджио
        if b >= 2:
            for k in range(4):
                ns = s0 + int(k * beat * sr)
                if ns >= n:
                    break
                m = ch[(k % 3) + 1] + 24
                ln = min(n - ns, int(1.6 * sr))
                tk = np.arange(ln) / sr
                bell = (np.sin(2 * np.pi * note(m) * tk) + 0.3 * np.sin(2 * np.pi * note(m) * 2.01 * tk)) * np.exp(-tk * 3)
                out[ns:ns + ln] += 0.035 * bell
        # литавры и малый барабан (маршевый ритм) после вступления
        if b >= 4:
            for k in range(4):
                ns = s0 + int(k * beat * sr)
                if ns >= n:
                    break
                ln = min(n - ns, int(0.8 * sr))
                tk = np.arange(ln) / sr
                if k in (0, 2):
                    f0 = note(ch[0] - 12 if ch[0] > 45 else ch[0])
                    timp = np.sin(2 * np.pi * f0 * tk * (1 + 0.05 * np.exp(-tk * 20))) * np.exp(-tk * 4)
                    out[ns:ns + ln] += 0.16 * timp
                rng = np.random.default_rng(b * 4 + k)
                sl = min(ln, int(0.18 * sr))
                snare = rng.standard_normal(sl) * np.exp(-np.arange(sl) / sr * 22)
                out[ns:ns + sl] += (0.03 if k in (1, 3) else 0.012) * snare
                if k == 3:  # дробь перед долей
                    for r in range(3):
                        rs = ns + int((0.5 + r / 6) * beat * sr)
                        rl = min(n - rs, int(0.08 * sr))
                        if rl > 0:
                            out[rs:rs + rl] += 0.012 * rng.standard_normal(rl) * np.exp(-np.arange(rl) / sr * 40)
    # простое «эхо зала»
    for dl, g in ((0.11, 0.25), (0.23, 0.15), (0.37, 0.08)):
        d = int(dl * sr)
        out[d:] += g * out[:-d].copy()
    fade_in = np.minimum(1, t / 3)
    fade_out = np.minimum(1, np.maximum(0, (dur - t) / 5))
    out *= fade_in * fade_out
    out /= np.max(np.abs(out)) + 1e-9
    out *= 0.85
    st = np.stack([out, np.roll(out, 300)], axis=1)
    data = (st * 32767).astype(np.int16)
    with wave.open(path, "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(data.tobytes())


def main():
    make_music(AUDIO, DURATION)
    total = int(DURATION * FPS)
    cmd = ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", AUDIO,
           "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-pix_fmt", "yuv420p",
           "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", OUT]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    with Pool(os.cpu_count()) as pool:
        for i, fr in enumerate(pool.imap(render, range(total), chunksize=8)):
            p.stdin.write(fr)
            if i % 300 == 0:
                print(f"{i}/{total}", flush=True)
    p.stdin.close()
    p.wait()
    os.remove(AUDIO)
    print("done:", OUT)


if __name__ == "__main__":
    main()

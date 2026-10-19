"""Скачивает фото и видео со свободными лицензиями с Wikimedia Commons в папку media/
и пишет credits.json (автор, лицензия, ссылка) для титров."""
import hashlib, json, os, re, time, urllib.parse, urllib.request

UA = "Mozilla/5.0 (compatible; RepublicDayVideo/1.0; +https://github.com/kakebun/gift_alua)"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "media")

# ключ -> (файл на Commons, ширина превью или None для оригинала)
FILES = {
    "flag": ("Flag of Kazakhstan.svg", 3840),
    "emblem": ("Emblem of Kazakhstan latin.svg", 1200),
    "milkyway": ("A timelapse of the Milky Way's movement against the backdrop of the Assy-Turgen Observatory at an altitude of 2,750 m. Kazakhstan.webm", None),
    "archive1992": ("MT2894 - Working Visit with President Nursultan Nazarbaev of Kazakhstan - 19 May 1992.webm", None),
    "kazakh_eli": ("Kazakh Eli Monument 01.jpg", 3840),
    "astana_skyline": ("New Astana Skyline (9587635437).jpg", None),
    "astana_night": ("Кровавое лунное затмение над панорамой Астаны.jpg", None),
    "bayterek_view": ("View from Bayterek tower.jpg", 3840),
    "akorda": ("Ak Orda palace panorama.jpg", None),
    "independence_almaty": ("Republic Square - sculptures at the Independence Monument Almaty.jpg", 3840),
    "parade_mp": ("Парадная коробка Военной полиции Вооружённых сил Республики Казахстан.jpg", 3840),
    "parade_bmp": ("БМП-2 на военном параде в Астане 7 мая 2015 года.JPG", 3840),
    "parade_2s3": ("2С3 на военном параде в Астане 7 мая 2015 года.JPG", 3840),
    "soldiers_2024": ("Soldiers of the Kazakh Armed Forces in Astana, September 2024.jpg", None),
    "steppe_eagle14": ("Steppe Eagle 14 closing ceremony 141013-A-DO086-961.jpg", 3840),
    "steppe_eagle15": ("Steppe Eagle 2015 officially underway 150406-A-ZZ247-154.jpg", 3840),
    "rep_guard": ("The Kazakhstan Republican Guard performs during the opening ceremonies of exercise Central Asian Peacekeeping Battalion (CENTRASBAT) 2000, Almaty, Kazakhstan (KAZ), Wednesday 13 Sep - DPLA - 1c1e0b35055ee055b13a73806b32a7b5.jpeg", None),
    "air_force": ("Kazakstan Air Force Astana (54407603803).jpg", 3840),
    "museum": ("Kazakhstan Military History Museum 02.jpg", 3840),
}


def get(url, binary=False):
    for i in range(10):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=120)
            return r.read() if binary else json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(30)
                continue
            raise
    raise RuntimeError("rate limited: " + url)


def api(**p):
    p["format"] = "json"
    time.sleep(1.5)
    return get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p))


def resolve_prefix(prefix):
    d = api(action="query", list="allimages", aiprefix=prefix.replace(" ", "_"), ailimit=1)
    return d["query"]["allimages"][0]["name"].replace("_", " ")


def strip(html):
    return re.sub(r"<[^>]+>", "", html or "").strip()


def commons_path(title):
    name = title.replace(" ", "_")
    h = hashlib.md5(name.encode()).hexdigest()
    return h[0], h[:2], urllib.parse.quote(name)


def direct_urls(title, width):
    a, ab, q = commons_path(title)
    base = "https://upload.wikimedia.org/wikipedia/commons"
    if title.endswith((".webm", ".ogv")):
        return [f"{base}/transcoded/{a}/{ab}/{q}/{q}.{v}" for v in
                ("1080p.vp9.webm", "1080p.webm", "720p.vp9.webm", "720p.webm")]
    if width:
        suffix = ".png" if title.endswith(".svg") else ""
        return [f"{base}/thumb/{a}/{ab}/{q}/{width}px-{q}{suffix}", f"{base}/{a}/{ab}/{q}"]
    return [f"{base}/{a}/{ab}/{q}"]


def fetch(url):
    delay = 10
    for _ in range(12):
        try:
            r = urllib.request.urlopen(urllib.request.Request(url, headers={"User-Agent": UA}), timeout=180)
            return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            if e.code != 429:
                raise
        time.sleep(delay)
        delay = min(delay * 1.6, 120)
    return None


def main():
    os.makedirs(OUT, exist_ok=True)
    cpath = os.path.join(HERE, "credits.json")
    credits = json.load(open(cpath, encoding="utf-8")) if os.path.exists(cpath) else {}
    # 1) все метаданные одним запросом
    need = [k for k in FILES if k not in credits]
    if need:
        titles = {"File:" + FILES[k][0]: k for k in need}
        d = None
        delay = 15
        while d is None:
            try:
                d = api(action="query", titles="|".join(titles), prop="imageinfo",
                        iiprop="extmetadata", iiextmetadatafilter="LicenseShortName|Artist")
            except RuntimeError:
                time.sleep(delay)
                delay = min(delay * 1.5, 180)
        norm = {n["to"]: n["from"] for n in d["query"].get("normalized", [])}
        for pg in d["query"]["pages"].values():
            k = titles.get(norm.get(pg["title"], pg["title"]))
            if not k or "imageinfo" not in pg:
                print("NOT FOUND", pg["title"])
                continue
            em = pg["imageinfo"][0].get("extmetadata", {})
            credits[k] = {"title": FILES[k][0], "author": strip(em.get("Artist", {}).get("value")),
                          "license": em.get("LicenseShortName", {}).get("value"),
                          "page": "https://commons.wikimedia.org/wiki/File:" +
                                  urllib.parse.quote(FILES[k][0].replace(" ", "_"))}
        json.dump(credits, open(cpath, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    # 2) сами файлы по прямым ссылкам
    for key, (title, width) in FILES.items():
        if any(os.path.splitext(f)[0] == key for f in os.listdir(OUT)):
            continue
        ext = ".webm" if title.endswith((".webm", ".ogv")) else (".png" if title.endswith(".svg") else
                                                                  os.path.splitext(title)[1].lower())
        for url in direct_urls(title, width):
            data = fetch(url)
            if data and len(data) > 20000:
                with open(os.path.join(OUT, key + ext), "wb") as f:
                    f.write(data)
                print(key, ext, len(data) // 1000, "KB", flush=True)
                break
        else:
            print("FAILED", key, flush=True)
        time.sleep(3)


if __name__ == "__main__":
    main()

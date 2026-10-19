"""Скачивает фото и видео со свободными лицензиями с Wikimedia Commons в папку media/
и пишет credits.json (автор, лицензия, ссылка) для титров."""
import json, os, re, time, urllib.parse, urllib.request

UA = "Mozilla/5.0 (compatible; RepublicDayVideo/1.0; +https://github.com/kakebun/gift_alua)"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "media")

# ключ -> (файл на Commons, ширина превью или None для оригинала)
FILES = {
    "flag": ("Flag of Kazakhstan.svg", 3000),
    "emblem": ("Emblem of Kazakhstan latin.svg", 1200),
    "milkyway": ("A timelapse of the Milky Way's movement against the backdrop of the Assy-Turgen Observatory at an altitude of 2,750 m. Kazakhstan.webm", None),
    "archive1992": ("MT2894 - Working Visit with President Nursultan Nazarbaev of Kazakhstan - 19 May 1992.webm", None),
    "kazakh_eli": ("Kazakh Eli Monument 01.jpg", 3000),
    "astana_skyline": ("New Astana Skyline (9587635437).jpg", 7000),
    "astana_night": ("Кровавое лунное затмение над панорамой Астаны.jpg", 5000),
    "bayterek_view": ("View from Bayterek tower.jpg", 3000),
    "akorda": ("Ak Orda palace panorama.jpg", 9000),
    "independence_almaty": ("Republic Square - sculptures at the Independence Monument Almaty.jpg", 3000),
    "parade_mp": ("Парадная коробка Военной полиции Вооружённых сил Республики Казахстан.jpg", 3000),
    "parade_bmp": ("БМП-2 на военном параде в Астане 7 мая 2015 года.JPG", 2600),
    "parade_2s3": ("2С3 на военном параде в Астане 7 мая 2015 года.JPG", 2600),
    "soldiers_2024": ("Soldiers of the Kazakh Armed Forces in Astana, September 2024.jpg", None),
    "steppe_eagle14": ("Steppe Eagle 14 closing ceremony 141013-A-DO086-961.jpg", 3000),
    "steppe_eagle15": ("Steppe Eagle 2015 officially underway 150406-A-ZZ247-154.jpg", 3000),
    "rep_guard": ("The Kazakhstan Republican Guard performs during the opening ceremonies of exercise Ce", None),
    "air_force": ("Kazakstan Air Force Astana (54407603803).jpg", 3000),
    "museum": ("Kazakhstan Military History Museum 02.jpg", 3000),
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


def main():
    os.makedirs(OUT, exist_ok=True)
    credits = {}
    cpath = os.path.join(HERE, "credits.json")
    if os.path.exists(cpath):
        credits = json.load(open(cpath, encoding="utf-8"))
    for key, (title, width) in FILES.items():
        if key in credits and any(f.startswith(key + ".") for f in os.listdir(OUT)):
            continue
        if not os.path.splitext(title)[1]:
            title = resolve_prefix(title)
        p = dict(action="query", titles="File:" + title, prop="imageinfo",
                 iiprop="url|extmetadata|mime", iiextmetadatafilter="LicenseShortName|Artist")
        if width:
            p["iiurlwidth"] = width
        info = next(iter(api(**p)["query"]["pages"].values()))["imageinfo"][0]
        url = info.get("thumburl") if width else info["url"]
        ext = os.path.splitext(urllib.parse.urlparse(url).path)[1].lower() or ".bin"
        if title.endswith(".svg"):
            ext = ".png"
        if title.endswith((".webm", ".ogv")):
            data = None
            dv = next(iter(api(action="query", titles="File:" + title, prop="videoinfo",
                                viprop="derivatives")["query"]["pages"].values()))["videoinfo"][0]["derivatives"]
            dv = sorted([d for d in dv if d.get("transcodekey", "").endswith("webm") and d.get("height")],
                        key=lambda d: -abs(min(d["height"], 1080)))
            for d in dv:
                try:
                    data = get(d["src"], binary=True)
                    if len(data) > 100000:
                        print("  using", d["transcodekey"])
                        break
                except Exception as e:
                    print("  skip", d["transcodekey"], e)
            ext = ".webm"
        else:
            data = get(url, binary=True)
        with open(os.path.join(OUT, key + ext), "wb") as f:
            f.write(data)
        em = info.get("extmetadata", {})
        credits[key] = {"title": title, "author": strip(em.get("Artist", {}).get("value")),
                        "license": em.get("LicenseShortName", {}).get("value"),
                        "page": info["descriptionurl"] if "descriptionurl" in info else
                        "https://commons.wikimedia.org/wiki/File:" + urllib.parse.quote(title.replace(" ", "_"))}
        print(key, ext, len(data) // 1000, "KB", credits[key]["license"], "|", credits[key]["author"][:60], flush=True)
        json.dump(credits, open(cpath, "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()

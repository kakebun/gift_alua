# Builds the soundtrack: narration + procedural music + synthesized SFX -> build/audio.wav
import json, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly

SR = 44100
rng = np.random.default_rng(7)
tl = json.load(open("build/timeline.json"))
cues = json.load(open("build/cues.json"))
TOTAL = sum(s["dur"] for s in tl) + 0.5
N = int(TOTAL * SR)

def t_(d): return np.arange(int(d * SR)) / SR
def env(n, a=.005, r=.1):
    e = np.ones(n); na, nr = max(1, int(a * SR)), max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(d * SR))
def sweep(f0, f1, d, kind='sin'):
    t = t_(d); fr = np.geomspace(f0, f1, len(t)); ph = 2 * np.pi * np.cumsum(fr) / SR
    return np.sin(ph) if kind == 'sin' else 2 * ((ph / (2 * np.pi)) % 1) - 1
def saw(f, d, vib=0, vr=5):
    t = t_(d); fr = f * (1 + vib * np.sin(2 * np.pi * vr * t)); ph = np.cumsum(fr) / SR
    return 2 * (ph % 1) - 1
def ping(f, d, dec):
    t = t_(d); return np.sin(2 * np.pi * f * t) * np.exp(-t * dec)
def norm(x, p=1.0): m = np.max(np.abs(x)) + 1e-9; return x / m * p
def cat(*xs): return np.concatenate(xs)
def at(x, off, total=None):
    y = np.zeros(int((total or (len(x) / SR + off)) * SR) + 1); i = int(off * SR); y[i:i + len(x)] += x[:len(y) - i]; return y

SFX = {}
SFX['pop'] = lambda: sweep(350, 900, .09) * np.exp(-t_(.09) * 30)
SFX['click'] = lambda: hp(noise(.03), 2000) * np.exp(-t_(.03) * 150) * .8
SFX['whoosh'] = lambda: norm(bp(noise(.45), 400, 2500) * np.sin(np.pi * t_(.45) / .45) ** 2, .8)
def clank():
    d = .7; t = t_(d); x = sum(np.sin(2 * np.pi * f * t) * np.exp(-t * dc) * a for f, dc, a in [(523, 7, 1), (1237, 9, .7), (1873, 12, .5), (2964, 16, .35), (4100, 22, .2)])
    return norm(x + hp(noise(d), 3000) * np.exp(-t * 60) * .6, .9)
SFX['clank'] = clank
SFX['thud'] = lambda: norm(ping(70, .4, 12) + lp(noise(.4), 300) * np.exp(-t_(.4) * 18) * .8, .95)
def horn():
    d = 2.1; x = (saw(146.8, d, .006, 5.5) + .7 * saw(220.4, d, .006, 5.2) + .4 * saw(293.6, d, .005, 6)) / 2
    x = lp(x, 1800, 2) * env(len(x), .12, .5)
    return norm(x, .9)
SFX['horn'] = horn
SFX['boing'] = lambda: norm(np.sin(2 * np.pi * np.cumsum(220 + 120 * np.sin(2 * np.pi * 14 * t_(.5)) * np.exp(-t_(.5) * 4)) / SR) * np.exp(-t_(.5) * 5), .7)
SFX['squish'] = lambda: norm(lp(noise(.35), 900) * np.sin(np.pi * t_(.35) / .35) + sweep(300, 120, .35) * .4 * np.exp(-t_(.35) * 6), .7)
def snore():
    d = 1.6; t = t_(d); e = np.sin(np.pi * t / d) ** 2
    x = lp(noise(d), 500) * e * (0.6 + 0.4 * np.sin(2 * np.pi * 35 * t))
    return norm(cat(x, np.zeros(int(.6 * SR)), x * .8), .6)
SFX['snore'] = snore
SFX['slurp'] = lambda: norm(np.concatenate([bp(noise(.4), 700, 1600) * np.sin(np.pi * t_(.4) / .4) * (.6 + .4 * np.sin(2 * np.pi * 22 * t_(.4)))]), .6)
SFX['yuck'] = lambda: norm(lp(saw(170, .6, .03, 9), 1200) * env(int(.6 * SR), .02, .2) * np.linspace(1, .5, int(.6 * SR)), .6)
SFX['shiver'] = lambda: norm(bp(noise(.8), 300, 2000) * (np.sin(2 * np.pi * 28 * t_(.8)) > 0) * env(int(.8 * SR), .02, .2), .6)
SFX['stamp'] = lambda: norm(ping(90, .3, 18) + hp(noise(.3), 1500) * np.exp(-t_(.3) * 40) * .7, .95)
def coin():
    d = .6; t = t_(d); return norm(sum(np.sin(2 * np.pi * f * t) * np.exp(-t * dc) for f, dc in [(2200, 8), (3350, 10), (4900, 14), (6100, 18)]), .6)
SFX['coin'] = coin
def coins():
    out = np.zeros(int(1.0 * SR))
    for k in range(7):
        c = coin() * rng.uniform(.4, 1); o = int(rng.uniform(0, .45) * SR); out[o:o + len(c)] += c[:len(out) - o]
    return norm(out, .8)
SFX['coins'] = coins
def hoof():
    out = np.zeros(int(1.2 * SR))
    for k in range(4):
        c = bp(noise(.06), 600, 2500) * np.exp(-t_(.06) * 70); o = int(k * .22 * SR); out[o:o + len(c)] += c
    return norm(out, .7)
SFX['hoof'] = hoof
def heehaw():
    parts = []
    for i in range(4):
        f = 640 if i % 2 == 0 else 260; d = .32
        x = lp(saw(f, d, .04, 25), 2500) * env(int(d * SR), .02, .08); parts.append(x)
    return norm(cat(*parts), .55)
SFX['heehaw'] = heehaw
SFX['whack'] = lambda: norm(hp(noise(.25), 1200) * np.exp(-t_(.25) * 35) + ping(150, .25, 20) * .7, .95)
SFX['dig'] = lambda: norm(bp(noise(.3), 300, 3000) * np.exp(-t_(.3) * 9) + ping(80, .3, 15) * .5, .6)
SFX['rewind'] = lambda: norm(cat(*[sweep(500 + 80 * k, 2600 + 150 * k, .14) * np.hanning(int(.14 * SR)) for k in range(8)]), .45)
SFX['scroll'] = lambda: norm(bp(noise(.7), 1000, 6000) * env(int(.7 * SR), .05, .3) * (.5 + .5 * np.abs(np.sin(2 * np.pi * 9 * t_(.7)))), .5)
SFX['scribble'] = lambda: norm(bp(noise(.5), 2000, 7000) * (.3 + .7 * (np.sin(2 * np.pi * 11 * t_(.5)) > 0)) * env(int(.5 * SR), .02, .1), .4)
def sad():
    notes = [(196, .45), (185, .45), (174.6, .45), (164.8, 1.3)]
    return norm(cat(*[lp(saw(f, d, .02 if i == 3 else .004, 6), 900) * env(int(d * SR), .03, .12) for i, (f, d) in enumerate(notes)]), .6)
SFX['sad'] = sad
SFX['ouch'] = lambda: norm(sweep(700, 200, .25) * np.exp(-t_(.25) * 8), .6)
def sting():
    d = 1.8; t = t_(d)
    x = lp(saw(73.4, d) + saw(110, d) * .7 + saw(146.8, d) * .5, 900) * np.exp(-t * 1.6)
    x += lp(noise(d), 200) * np.exp(-t * 5) * 1.2
    return norm(x, .9)
SFX['sting'] = sting
def sparkle():
    out = np.zeros(int(1.2 * SR))
    for k, f in enumerate([1568, 1976, 2349, 2637, 3136, 3951]):
        c = ping(f, .6, 7) * .7; o = int(k * .07 * SR); out[o:o + len(c)] += c
    return norm(out, .55)
SFX['sparkle'] = sparkle
def magic():
    d = 1.6; out = np.zeros(int(d * SR))
    for k in range(18):
        c = ping(rng.uniform(1200, 4200), .5, 8) * rng.uniform(.3, .8); o = int(rng.uniform(0, 1.1) * SR); out[o:o + len(c)] += c
    out += bp(noise(d), 800, 5000) * np.sin(np.pi * t_(d) / d) ** 2 * .5
    return norm(out, .6)
SFX['magic'] = magic
SFX['gulp'] = lambda: norm(cat(sweep(600, 250, .08) * np.hanning(int(.08 * SR)), np.zeros(int(.05 * SR)), sweep(500, 200, .1) * np.hanning(int(.1 * SR))), .7)
def typing():
    out = np.zeros(int(1.4 * SR))
    for k in range(10):
        c = hp(noise(.025), 2500) * np.exp(-t_(.025) * 200); o = int((k * .13 + rng.uniform(0, .04)) * SR); out[o:o + len(c)] += c
    return norm(out, .5)
SFX['type'] = typing

def scene(sid): return next(s for s in tl if s["id"] == sid)
def march_loop(d):
    out = np.zeros(int(d * SR)); step = np.pi / 7.5
    k = 0.0
    while k < d - .3:
        c = bp(noise(.12), 200, 2500) * np.exp(-t_(.12) * 30) * .8 + ping(90, .12, 30) * .5
        o = int(k * SR); out[o:o + len(c)] += c[:len(out) - o]
        if rng.random() < .5:
            j = coin() * .12; out[o:o + len(j)] += j[:len(out) - o]
        k += step
    return out * env(len(out), .3, .6)
def crickets(d):
    out = np.zeros(int(d * SR)); k = 0.3
    while k < d - .5:
        for j in range(3):
            c = ping(4600, .03, 60) * .5; o = int((k + j * .05) * SR); out[o:o + len(c)] += c[:len(out) - o]
        k += rng.uniform(.5, 1.1)
    # fire crackle
    for _ in range(int(d * 6)):
        c = hp(noise(.01), 1500) * rng.uniform(.1, .5); o = int(rng.uniform(0, d - .1) * SR); out[o:o + len(c)] += c
    return out * env(len(out), .4, .8)

sfx = np.zeros(N)
for t0, name, vol in cues:
    if name == 'march': x = march_loop(scene('march')['dur'] - t0 + scene('march')['start'] - .1) * .6
    elif name == 'crickets': x = crickets(scene('night')['dur'])
    else: x = SFX[name]()
    i = int(t0 * SR); n = min(len(x), N - i)
    if n > 0: sfx[i:i + n] += x[:n] * vol

# ---------------- narration
vo = np.zeros(N)
for s in tl:
    for i, (a, b) in enumerate(s["lines"]):
        x, sr = sf.read(f"build/vo/{s['id']}_{i}.wav")
        x = resample_poly(x, SR, sr) if sr != SR else x
        st = int((s["start"] + a) * SR); n = min(len(x), N - st); vo[st:st + n] += x[:n]
vo = norm(vo, .92)

# ---------------- music (lyre plucks + pad + frame drum), D dorian
def ks(freq, d, damp=.996):
    n = int(d * SR); P = int(SR / freq); buf = rng.uniform(-1, 1, P); out = np.zeros(n)
    i = 0
    while i < n:
        m = min(P, n - i); out[i:i + m] = buf[:m]
        buf = damp * 0.5 * (buf + np.roll(buf, -1)); i += P
    return out * env(n, .002, .05)
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
cache = {}
def pluck(m, d=1.6):
    if m not in cache: cache[m] = lp(ks(NOTE(m), d), 3500)
    return cache[m]
BPM = 96; beat = 60 / BPM
prog = [[50, 57, 62, 65], [48, 55, 60, 64], [46, 53, 58, 62], [48, 55, 60, 64]]  # Dm C Bb C
mel = [74, 72, 69, 72, 74, 77, 76, 74, 72, 69, 67, 69, 70, 72, 74, 0]
music = np.zeros(N); pad = np.zeros(N); drum = np.zeros(N)
def section(T):
    for s in tl:
        if s["start"] <= T < s["start"] + s["dur"]: return s["id"]
    return 'outro'
bar = 0; T = 0.0
while T < TOTAL - 1:
    ch = prog[bar % 4]; sec = section(T)
    soft = sec in ('night', 'tent')
    for k in range(8):  # eighth-note arpeggio
        if soft and k % 2: continue
        m = ch[[0, 1, 2, 3, 2, 1, 2, 3][k]] + 12
        x = pluck(m) * (.35 if k % 2 else .5)
        i = int((T + k * beat / 2) * SR); n = min(len(x), N - i)
        if n > 0: music[i:i + n] += x[:n]
    if not soft and sec not in ('intro',):
        for k in range(4):
            mm = mel[(bar * 4 + k) % len(mel)]
            if mm:
                x = pluck(mm) * .32; i = int((T + k * beat) * SR); n = min(len(x), N - i)
                if n > 0: music[i:i + n] += x[:n]
    # pad
    d = 4 * beat; tt = t_(d)
    p = sum(np.sin(2 * np.pi * NOTE(m) * tt) * a for m, a in zip(ch[:3], [.5, .35, .3]))
    p *= env(len(p), .6, .8) * (.6 if soft else .35)
    i = int(T * SR); n = min(len(p), N - i); pad[i:i + n] += p[:n]
    if sec in ('march', 'gear', 'camp', 'outro'):
        for k in [0, 2] if sec != 'march' else [0, 1, 2, 3]:
            x = ping(65, .35, 10) + lp(noise(.35), 400) * np.exp(-t_(.35) * 20) * .4
            i = int((T + k * beat) * SR); n = min(len(x), N - i)
            if n > 0: drum[i:i + n] += x[:n] * (.5 if k % 2 else .7)
    bar += 1; T += 4 * beat
mus = norm(music + pad * .6 + drum * .5, 1)
# duck under narration
ve = np.abs(vo); win = int(.15 * SR)
ve = np.convolve(ve, np.ones(win) / win, mode='same')
duck = 1 - .55 * np.clip(ve / (np.max(ve) * .15), 0, 1)
duck = np.convolve(duck, np.ones(win) / win, mode='same')
fade = np.ones(N); fo = int(2.0 * SR); fade[-fo:] = np.linspace(1, 0, fo); fade[:int(.3 * SR)] = np.linspace(0, 1, int(.3 * SR))
mix = vo * 1.0 + mus * .16 * duck * fade + sfx * .42
mix = np.tanh(mix * 1.1) / np.tanh(1.1)
mix = norm(mix, .95)
sf.write("build/audio.wav", np.stack([mix, mix], 1).astype(np.float32), SR)
print("audio", N / SR, "s")

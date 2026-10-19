# Soundtrack for episode 2: narration + procedural music + SFX with reverb.
# usage: python3 mix2.py [end_seconds]
import json, sys, numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, resample_poly, fftconvolve

SR = 44100
rng = np.random.default_rng(11)
tl = json.load(open(sys.argv[2] if len(sys.argv) > 2 else "build/timeline.json"))
cues = json.load(open("build/cues.json"))
END = float(sys.argv[1]) if len(sys.argv) > 1 else sum(s["dur"] for s in tl)
N = int((END + .5) * SR)

def t_(d): return np.arange(int(d * SR)) / SR
def env(n, a=.005, r=.1):
    e = np.ones(n); na, nr = max(1, min(n, int(a * SR))), max(1, min(n, int(r * SR)))
    e[:na] = np.linspace(0, 1, na); e[-nr:] *= np.linspace(1, 0, nr); return e
def bp(x, lo, hi, o=2): return sosfilt(butter(o, [lo, hi], 'band', fs=SR, output='sos'), x)
def lp(x, fr, o=2): return sosfilt(butter(o, fr, 'low', fs=SR, output='sos'), x)
def hp(x, fr, o=2): return sosfilt(butter(o, fr, 'high', fs=SR, output='sos'), x)
def noise(d): return rng.standard_normal(int(d * SR))
def sweep(f0, f1, d):
    fr = np.geomspace(f0, f1, int(d * SR)); return np.sin(2 * np.pi * np.cumsum(fr) / SR)
def saw(fq, d, vib=0, vr=5):
    t = t_(d); fr = fq * (1 + vib * np.sin(2 * np.pi * vr * t)); ph = np.cumsum(fr) / SR; return 2 * (ph % 1) - 1
def ping(fq, d, dec): t = t_(d); return np.sin(2 * np.pi * fq * t) * np.exp(-t * dec)
def norm(x, p=1.0): return x / (np.max(np.abs(x)) + 1e-9) * p
def put(buf, x, t0, g=1.0):
    i = int(t0 * SR)
    if i >= len(buf) or i + len(x) <= 0: return
    a = max(0, -i); n = min(len(x) - a, len(buf) - max(i, 0)); buf[max(i, 0):max(i, 0) + n] += x[a:a + n] * g
def reverb(x, dur=2.2, wet=.3, damp=3000):
    ir = noise(dur) * np.exp(-t_(dur) * (6.9 / dur)); ir = lp(ir, damp); ir /= np.sqrt(np.sum(ir ** 2))
    y = fftconvolve(x, ir)[:len(x)]; return x * (1 - wet) + y * wet * .6
NOTE = lambda m: 440 * 2 ** ((m - 69) / 12)
def ks(fq, d, damp=.996, bright=1.0):
    n = int(d * SR); P = max(2, int(SR / fq)); buf = rng.uniform(-1, 1, P); out = np.zeros(n); i = 0
    while i < n:
        m = min(P, n - i); out[i:i + m] = buf[:m]; buf = damp * (.5 * (buf + np.roll(buf, -1))); i += P
    return lp(out, 2500 * bright + 500) * env(n, .002, .08)
def bell(fq, d=2.5):
    t = t_(d); return sum(np.sin(2 * np.pi * fq * r * t) * np.exp(-t * dc) * a for r, dc, a in [(1, 1.6, 1), (2.76, 3, .4), (5.4, 6, .2), (8.9, 9, .1)])
def brass(fq, d, vib=.004):
    x = saw(fq, d, vib, 5.5) + .6 * saw(fq * 1.003, d, vib, 5.1)
    e = env(int(d * SR), .06, .25); return lp(x, 900 + 1400 * e.mean()) * e

# ---------------------------------------------------------------- SFX
def murmur(d):
    out = np.zeros(int(d * SR))
    for k in range(int(d * 9)):
        sy = .12 + rng.random() * .25; fq = rng.uniform(180, 420)
        v = bp(noise(sy), fq, fq * 3.2) * np.sin(np.pi * t_(sy) / sy) ** 2 * rng.uniform(.3, 1)
        put(out, v, rng.uniform(0, d - sy))
    return lp(out, 2200) * env(len(out), .5, .6)
def birds(d):
    out = np.zeros(int(d * SR)); k = .3
    while k < d - .6:
        for j in range(rng.integers(2, 5)):
            c = sweep(rng.uniform(2800, 3600), rng.uniform(4000, 5200), .06) * np.hanning(int(.06 * SR)); put(out, c * .5, k + j * .09)
        k += rng.uniform(.9, 2.6)
    return out
def city(d):
    x = murmur(d) * .7 + birds(d) * .25
    k = 1.0
    while k < d - .5:  # distant hammer / cart
        put(x, (bp(noise(.05), 800, 3000) * np.exp(-t_(.05) * 60)) * .25, k); k += rng.uniform(1.5, 4)
    return x + lp(noise(d), 300) * .05
def amb_attic(d):
    x = lp(noise(d), 400) * .12 * (1 + .5 * np.sin(2 * np.pi * .15 * t_(d)))
    for k in [2.3, 7.8, 12.1]:
        if k < d: put(x, norm(bp(saw(rng.uniform(90, 140), .5, .05, 3), 300, 1800) * env(int(.5 * SR), .1, .3), .18), k)
    return x * env(len(x), .8, 1.0)
def heartbeat(d=2.2):
    out = np.zeros(int(d * SR))
    for k in [0, .7, 1.4]:
        for j, a in [(0, 1), (.18, .7)]: put(out, lp(ping(55, .25, 18) + noise(.25) * np.exp(-t_(.25) * 30) * .3, 200) * a, k + j)
    return norm(out, .9)
SFX = {
    'pop': lambda: sweep(350, 900, .09) * np.exp(-t_(.09) * 30),
    'whoosh': lambda: norm(bp(noise(.6), 300, 2600) * np.sin(np.pi * t_(.6) / .6) ** 2, .8),
    'rummage': lambda: norm(bp(noise(1.2), 900, 6000) * np.abs(lp(noise(1.2), 6)) * 8 * env(int(1.2 * SR), .1, .3), .5),
    'glint': lambda: norm(bell(2637, 1.5) + bell(3951, 1.5) * .6, .5),
    'shimmer': lambda: norm(sum(np.roll(bell(NOTE(m), 2.5), int(i * .09 * SR)) for i, m in enumerate([81, 84, 88, 91, 93, 96])), .6),
    'swell': lambda: norm(bp(noise(2.2), 300, 4000) * np.linspace(0, 1, int(2.2 * SR)) ** 2 + sweep(110, 330, 2.2) * np.linspace(0, .5, int(2.2 * SR)), .8),
    'portal': lambda: norm(lp(noise(3.0), 600) * env(int(3 * SR), .3, .8) * (1 + .4 * np.sin(2 * np.pi * 4 * t_(3))) + sweep(60, 90, 3.0) * .6 * env(int(3 * SR), .3, .8) + bp(noise(3), 3000, 8000) * .15, .9),
    'suck': lambda: norm(bp(noise(1.2), 200, 3000) * np.linspace(1, 0, int(1.2 * SR)) + sweep(900, 80, 1.2) * .5, .8),
    'boom': lambda: norm(lp(noise(2.5), 180) * np.exp(-t_(2.5) * 2.5) + ping(45, 2.5, 2) * .8, .95),
    'heartbeat': heartbeat,
    'blink': lambda: norm(lp(noise(.08), 1200) * np.hanning(int(.08 * SR)), .3),
    'murmur': lambda: murmur(3.5),
    'steps': lambda: norm(sum(np.roll(np.pad(bp(noise(.08), 300, 2500) * np.exp(-t_(.08) * 50), (0, int(1.1 * SR))), int(k * .28 * SR)) for k in range(4)), .6),
    'shout': lambda: norm(np.concatenate([brass(NOTE(43), .35), brass(NOTE(42), .45) * .8]), .8),
    'stamp': lambda: norm(ping(90, .3, 18) + hp(noise(.3), 1500) * np.exp(-t_(.3) * 40) * .6, .9),
    'rattle': lambda: norm(bp(noise(1.6), 2000, 8000) * (.5 + .5 * np.sign(np.sin(2 * np.pi * 11 * t_(1.6)))) * env(int(1.6 * SR), .05, .3), .45),
    'thud': lambda: norm(lp(ping(70, .4, 12) + noise(.4) * np.exp(-t_(.4) * 18) * .6, 400), .9),
    'creak': lambda: norm(bp(saw(110, .7, .08, 4) * (1 + .5 * np.sin(2 * np.pi * 30 * t_(.7))), 300, 2000) * env(int(.7 * SR), .05, .2), .5),
    'squeak': lambda: norm(np.concatenate([sweep(900, 1500, .12) * np.hanning(int(.12 * SR)), sweep(1400, 900, .15) * np.hanning(int(.15 * SR))]), .5),
    'fanfare': None,
}
def _coin():
    d = .6; t = t_(d); return norm(sum(np.sin(2 * np.pi * fq * t) * np.exp(-t * dc) for fq, dc in [(2200, 8), (3350, 10), (4900, 14), (6100, 18)]), .6)
def _coins():
    out = np.zeros(int(1.0 * SR))
    for k in range(7): put(out, _coin() * rng.uniform(.4, 1), rng.uniform(0, .45))
    return norm(out, .8)
def _crowd(d=3.5, cheer=1.0):
    x = murmur(d) * .6 + bp(noise(d), 300, 3000) * env(int(d * SR), .3, .8) * .5 * cheer
    for k in range(int(d * 3)): put(x, norm(bp(saw(rng.uniform(250, 500), .4, .05, 6), 300, 2500), .3) * env(int(.4 * SR), .05, .2), rng.uniform(0, d - .5))
    return norm(x, .9)
def _hooves(d=4):
    out = np.zeros(int(d * SR)); k = 0
    while k < d - .1:
        put(out, bp(noise(.05), 200, 1500) * np.exp(-t_(.05) * 60) * rng.uniform(.5, 1), k); k += rng.choice([.09, .12, .2])
    return norm(out + lp(noise(d), 200) * .2, .8) * env(int(d * SR), .2, .5)
def _fire(d=4):
    x = lp(noise(d), 500) * .5
    for _ in range(int(d * 14)): put(x, hp(noise(.012), 1800) * rng.uniform(.2, .8), rng.uniform(0, d - .1))
    return norm(x, .7) * env(int(d * SR), .3, .6)
def _water(d=2.5): return norm(bp(noise(d), 400, 3000) * (.6 + .4 * np.abs(np.sin(2 * np.pi * 3 * t_(d)))), .4) * env(int(d * SR), .3, .5)
def _crash():
    x = lp(noise(2.0), 300) * np.exp(-t_(2.0) * 2) + hp(noise(2.0), 1500) * np.exp(-t_(2.0) * 5) * .5
    for k in range(8): put(x, bp(noise(.1), 800, 4000) * np.exp(-t_(.1) * 30) * .6, .1 + k * .12)
    return norm(x, .95)
SFX.update({
    'coin': _coin, 'coins': _coins, 'crowd': lambda: _crowd(4.0), 'hooves': lambda: _hooves(5.0), 'fire': lambda: _fire(5.0), 'water': lambda: _water(2.5), 'crash': _crash,
    'splat': lambda: norm(lp(noise(.4), 900) * np.exp(-t_(.4) * 10) + np.pad(ping(110, .3, 20), (0, int(.1 * SR))) * .6, .9),
    'cart': lambda: norm(sum(np.roll(np.pad(bp(noise(.06), 300, 2000) * np.exp(-t_(.06) * 50), (0, int(3.0 * SR))), int(k * .17 * SR)) for k in range(16)) * .7 + lp(noise(3.06), 150) * .3, .7),
    'clank': lambda: norm(sum(np.sin(2 * np.pi * fq * t_(.6)) * np.exp(-t_(.6) * dc) * a for fq, dc, a in [(523, 7, 1), (1237, 9, .7), (1873, 12, .5), (2964, 16, .35)]), .8),
    'clang': lambda: norm(sum(np.sin(2 * np.pi * fq * t_(.9)) * np.exp(-t_(.9) * dc) * a for fq, dc, a in [(700, 5, 1), (1650, 7, .7), (2600, 10, .5), (3900, 14, .35)]) + hp(noise(.9), 3000) * np.exp(-t_(.9) * 40) * .5, .9),
    'moo': lambda: norm(lp(saw(110, 1.2, .03, 4), 700) * env(int(1.2 * SR), .1, .4) * np.linspace(1, .6, int(1.2 * SR)), .6),
    'growl': lambda: norm(lp(noise(1.4), 220) * (1 + .8 * np.sin(2 * np.pi * 9 * t_(1.4))) * env(int(1.4 * SR), .1, .4) + lp(saw(60, 1.4, .1, 3), 300) * .3, .8),
    'flutter': lambda: norm(bp(noise(1.5), 800, 4000) * (np.sin(2 * np.pi * 22 * t_(1.5)) > 0) * env(int(1.5 * SR), .05, .4), .3),
    'sparkle': lambda: norm(sum(np.roll(np.pad(ping(fq, .6, 7), (0, int(.6 * SR))), int(k * .07 * SR)) for k, fq in enumerate([1568, 1976, 2349, 2637, 3136, 3951])), .55),
    'pour': lambda: norm(bp(noise(1.6), 300, 1800) * (.7 + .3 * np.sin(2 * np.pi * 7 * t_(1.6))) * env(int(1.6 * SR), .1, .3), .5),
    'buzz': lambda: norm(bp(saw(190, 2.0, .05, 9), 200, 2000) * env(int(2.0 * SR), .1, .4), .25),
    'gulp': lambda: norm(np.concatenate([np.concatenate([sweep(500, 200, .12) * np.hanning(int(.12 * SR)), np.zeros(int(.18 * SR))]) for _ in range(3)]), .6),
    'tvbeep': lambda: norm(np.sin(2 * np.pi * 1000 * t_(.25)) * env(int(.25 * SR), .01, .05), .4),
    'scribble': lambda: norm(bp(noise(1.0), 2000, 7000) * (.3 + .7 * (np.sin(2 * np.pi * 11 * t_(1.0)) > 0)) * env(int(1.0 * SR), .02, .1), .35),
    'rumble': lambda: norm(lp(noise(2.0), 120) * env(int(2.0 * SR), .4, .6), .8),
    'thunder': lambda: norm(lp(noise(3.0), 400) * np.exp(-t_(3.0) * 1.2) + hp(noise(3.0), 2000) * np.exp(-t_(3.0) * 12) * .8, .95),
    'baa': lambda: norm(lp(saw(330, .8, .06, 12), 1800) * env(int(.8 * SR), .05, .3), .4),
    'inhale': lambda: norm(bp(noise(.7), 800, 3000) * np.linspace(0, 1, int(.7 * SR)), .3),
    'sneeze': lambda: norm(np.concatenate([bp(noise(.08), 1000, 5000) * .6, bp(noise(.4), 500, 6000) * np.exp(-t_(.4) * 8)]), .8),
    'sizzle': lambda: norm(hp(noise(2.0), 3000) * env(int(2.0 * SR), .2, .5), .3),
    'splash': lambda: norm(bp(noise(1.0), 300, 5000) * np.exp(-t_(1.0) * 4) + lp(noise(1.0), 200) * np.exp(-t_(1.0) * 10), .9),
    'shiver': lambda: norm(bp(noise(1.2), 300, 2000) * (np.sin(2 * np.pi * 28 * t_(1.2)) > 0) * env(int(1.2 * SR), .02, .2), .5),
    'scrape': lambda: norm(bp(noise(1.6), 1500, 5000) * np.abs(np.sin(2 * np.pi * 3.5 * t_(1.6))), .3),
    'sting': lambda: norm(lp(saw(73.4, 1.8) + saw(110, 1.8) * .7 + saw(146.8, 1.8) * .5, 900) * np.exp(-t_(1.8) * 1.6), .8),
    'squish': lambda: norm(lp(noise(.4), 900) * np.sin(np.pi * t_(.4) / .4) + sweep(300, 120, .4) * .4, .6),
    'tiptoe': lambda: norm(sum(np.roll(np.pad(bp(noise(.04), 1000, 4000) * np.exp(-t_(.04) * 80), (0, int(1.6 * SR))), int(k * .4 * SR)) for k in range(4)), .3),
    'roar_lion': lambda: norm(lp(saw(90, 1.4, .08, 6) + noise(1.4) * .5, 900) * env(int(1.4 * SR), .1, .6), .7),
    'fanfare_s': lambda: norm(np.concatenate([sum(brass(NOTE(m - 12), .25) for m in [62, 66, 69]), sum(brass(NOTE(m - 12), .9) for m in [67, 71, 74])]), .8),
    'brawl': lambda: norm(sum(np.roll(np.pad(lp(noise(.12), 600) * np.exp(-t_(.12) * 30), (0, int(1.8 * SR))), int(rng.uniform(0, 1.6) * SR)) for _ in range(10)), .7),
    'wind': lambda: norm(bp(noise(4.0), 200, 900) * (0.6 + .4 * np.sin(2 * np.pi * .5 * t_(4.0))) * env(int(4 * SR), .8, 1), .4),
    'march': lambda: norm(sum(np.roll(np.pad(bp(noise(.1), 200, 1500) * np.exp(-t_(.1) * 30), (0, int(6 * SR))), int(k * .46 * SR)) for k in range(13)), .6),
    'magic': lambda: SFX['shimmer'](),
    'type': lambda: norm(sum(np.roll(np.pad(hp(noise(.025), 2500) * np.exp(-t_(.025) * 200), (0, int(1.4 * SR))), int((k * .13) * SR)) for k in range(10)), .4),
    'click': lambda: norm(hp(noise(.03), 2000) * np.exp(-t_(.03) * 150), .8),
})
sfx = np.zeros(N)
def scene(sid): return next(s for s in tl if s["id"] == sid)
for t0, name, vol, sid in cues:
    if t0 > END: continue
    if name == 'city': x = city(min(scene(sid)['dur'] - (t0 - scene(sid)['start']), END - t0 + .5))
    elif name == 'amb_attic': x = amb_attic(scene(sid)['dur'])
    elif name == 'fanfare':
        x = np.zeros(int(5 * SR))
        for st, m, d in [(0, [62, 66, 69], .28), (.3, [62, 66, 69], .28), (.6, [67, 71, 74], .5), (1.15, [69, 73, 76], 1.8)]:
            for mm in m: put(x, brass(NOTE(mm - 12), d), st, .33)
        put(x, lp(noise(.5), 300) * np.exp(-t_(.5) * 8), 0, .8); put(x, lp(noise(.5), 300) * np.exp(-t_(.5) * 8), 1.15, 1.0)
        put(x, SFX['shimmer'](), 1.15, .5); x = norm(reverb(x, 2.5, .35), .95)
    else: x = SFX[name]()
    put(sfx, x, t0, vol)
sfx = reverb(sfx, 1.4, .18)

# ---------------------------------------------------------------- narration
vo = np.zeros(N)
for s in tl:
    for i, (a, b) in enumerate(s["lines"]):
        if s["start"] + a > END: continue
        x, sr = sf.read(f"build/vo/{s['id']}_{i}.wav"); x = resample_poly(x, SR, sr) if sr != SR else x
        put(vo, x, s["start"] + a)
vo = hp(vo, 70); vo = norm(vo, .9)
vo = vo * .9 + reverb(vo, .5, .12) * .1

# ---------------------------------------------------------------- music
mus = np.zeros(N)
def music_attic(s):
    st, d = s["start"], s["dur"]
    seq = [69, 72, 76, 72, 69, 71, 74, 71, 65, 69, 72, 69, 64, 67, 71, 68]  # Am  G/B  F  E
    beat = .42; k = 0; T0 = st + .6
    while T0 + k * beat < st + d - 1.5:
        m = seq[k % 16] + 12; put(mus, bell(NOTE(m), 2.2) * .22, T0 + k * beat); k += 1
    chords = [[45, 57, 64], [43, 55, 62], [41, 53, 60], [40, 52, 59]]
    for j in range(int(d / (beat * 4)) + 1):
        ch = chords[j % 4]; dd = beat * 4 + .6; tt = t_(dd)
        p = sum(np.sin(2 * np.pi * NOTE(m) * tt) * a for m, a in zip(ch, [.5, .3, .25])) * env(len(tt), .5, .6) * .22
        put(mus, p, T0 + j * beat * 4)
def music_lyre(st, en, soft=False):
    prog = [[50, 57, 62, 65], [48, 55, 60, 64], [46, 53, 58, 62], [45, 52, 57, 61]]
    mel = [74, 76, 77, 76, 74, 72, 74, 0, 72, 70, 69, 70, 72, 74, 73, 0]
    beat = .5; bar = 0; T0 = st
    while T0 < en - .5:
        ch = prog[bar % 4]
        for k in range(8):
            if soft and k % 2: continue
            put(mus, ks(NOTE(ch[[0, 1, 2, 3, 2, 1, 2, 3][k]] + 12), 1.6) * (.3 if k % 2 else .42), T0 + k * beat / 2)
        if not soft:
            for k in range(4):
                mm = mel[(bar * 4 + k) % 16]
                if mm: put(mus, ks(NOTE(mm), 1.4, bright=1.4) * .3, T0 + k * beat)
        dd = 4 * beat + .4; tt = t_(dd)
        put(mus, sum(np.sin(2 * np.pi * NOTE(m) * tt) * a for m, a in zip(ch[:3], [.4, .25, .2])) * env(len(tt), .4, .5) * .25, T0)
        if not soft:
            for k in [0, 2]: put(mus, lp(ping(70, .3, 12) + lp(noise(.3), 300) * np.exp(-t_(.3) * 25) * .5, 400) * .4, T0 + k * beat)
        bar += 1; T0 += 4 * beat
for s in tl:
    if s["start"] > END: break
    if s["id"] == 'attic': music_attic(s)
    if s["id"] == 'arrival': music_lyre(s["start"] + s["lines"][1][0] + 2.5, s["start"] + s["dur"], soft=True)
    if s["id"] == 'title': music_lyre(s["start"] + 1.0, s["start"] + s["lines"][1][1] + .3)
    if s["id"] not in ('attic', 'arrival', 'title'): music_lyre(s["start"], s["start"] + s["dur"], soft=s["id"] in ('dangers', 'choice'))
mus = reverb(mus, 2.4, .32)
mus = norm(mus, 1)
# duck under narration
ve = np.convolve(np.abs(vo), np.ones(int(.2 * SR)) / int(.2 * SR), mode='same')
duck = 1 - .5 * np.clip(ve / (np.max(ve) * .12), 0, 1); duck = np.convolve(duck, np.ones(int(.3 * SR)) / int(.3 * SR), mode='same')
fade = np.ones(N); fo = int(1.5 * SR); fade[-fo:] = np.linspace(1, 0, fo)
mix = vo + mus * .2 * duck + sfx * .45
mix = np.tanh(mix * 1.05) / np.tanh(1.05) * fade
mix = norm(mix, .95)
sf.write("build/audio.wav", np.stack([mix, mix], 1).astype(np.float32), SR)
print("audio", N / SR)

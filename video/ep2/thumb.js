// YouTube thumbnails for "What If You Woke Up in Ancient Rome?" (1920x1080, downscaled to 1280x720)
const TDEFS = `<defs>
  <filter id="stk" x="-20%" y="-20%" width="140%" height="140%">
    <feMorphology in="SourceAlpha" operator="dilate" radius="11" result="d"/>
    <feFlood flood-color="#ffffff"/><feComposite in2="d" operator="in" result="w"/>
    <feOffset in="d" dx="10" dy="14" result="so"/><feFlood flood-color="#000" flood-opacity=".35"/><feComposite in2="so" operator="in" result="sh"/>
    <feMerge><feMergeNode in="sh"/><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge>
  </filter>
</defs>`;
// big punchy title text: dark outline + offset shadow
function bigText(str, x, y, size, fill, o = {}) {
  const font = o.font || 'Luckiest Guy', rot = o.rot || 0, sw = size * (o.sw || .13), anchor = o.anchor || 'middle';
  const base = (dx, dy, fl, st, w) => `<text x="${dx}" y="${dy}" font-family="${font}" font-size="${size}" fill="${fl}" text-anchor="${anchor}" dominant-baseline="middle" letter-spacing="${o.ls || 2}" ${st ? `stroke="${st}" stroke-width="${w}" stroke-linejoin="round" paint-order="stroke"` : ''}>${str}</text>`;
  return g(T(x, y, 1, rot), base(10, 14, '#1A1A1A', '#1A1A1A', sw) + base(0, 0, fill, '#1A1A1A', sw));
}
const sticker = inner => `<g filter="url(#stk)">${inner}</g>`;
function colosseumSil(x, y, s, body = '#c4613a', holes = '#8e3f24', rim = '#1A1A1A') {
  let c = '';
  const rows = [[0, 640, 170], [1, 600, 160], [2, 560, 150]];
  // stepped elliptical silhouette
  c += `<path d="M-700 0 L-700 -470 Q0 -560 700 -470 L700 0 Z" fill="${body}" stroke="${rim}" stroke-width="7" stroke-linejoin="round"/>`;
  c += `<path d="M-700 -470 Q0 -560 700 -470 L700 -440 Q0 -530 -700 -440 Z" fill="${holes}" opacity=".45"/>`;
  for (let r = 0; r < 3; r++) {
    const y0 = -40 - r * 150, n = 11;
    for (let i = 0; i < n; i++) { const xx = -620 + i * 124, top = y0 - 92 - Math.sin(Math.PI * i / (n - 1)) * 8 * r; c += `<path d="M${xx} ${y0} L${xx} ${f(top + 30)} Q${xx + 34} ${f(top - 10)} ${xx + 68} ${f(top + 30)} L${xx + 68} ${y0} Z" fill="${holes}"/>`; }
    c += `<path d="M-700 ${y0 + 10} L700 ${y0 + 10}" stroke="${rim}" stroke-width="5"/>`;
  }
  // the broken top edge on one side
  c += `<path d="M380 -500 L420 -540 L470 -520 L520 -560 L560 -530 L620 -560 L700 -540 L700 -470 Q500 -500 380 -500 Z" fill="${body}" stroke="${rim}" stroke-width="6" stroke-linejoin="round"/>`;
  return g(T(x, y, s), c);
}
function cypress(x, y, s, col = '#5f7f3e') { return g(T(x, y, s), `<path d="M0 0 L0 -40" stroke="#5b3b22" stroke-width="12"/><path d="M0 -30 Q-46 -120 0 -330 Q46 -120 0 -30 Z" fill="${col}" ${ink(6)}/>`); }
function heldHourglass(glow, t) {
  const hx = 0, hy = -470, hand = s2 => [hx + 56 * s2, hy];
  return { arms: { L: { to: hand(-1), fore: .55, upper: .95 }, R: { to: hand(1), fore: .55, upper: .95 } }, frontExtra: g(`translate(${hx} ${hy})`, hourglassSVG(.35, glow, t)) };
}

// ---------------------------------------------------------------- A: STUCK IN 100 AD
const PANIC = { ...EMO.fear, eyeS: 1.35, bL: [1, -1, -26], bR: [1, -1, -26], m: { w: 20, curve: -.6, open: .75, round: .9, wob: 1, tongue: 0 } };
function cyanPortal(cx, cy, R) {
  let s = '';
  for (let i = 0; i < 4; i++) s += `<circle cx="${cx}" cy="${cy}" r="${f(R * (1 - i * .18))}" fill="#7fe3f0" opacity=".13"/>`;
  const cols = ['#e9fbff', '#9eeaf5', '#35c9e0', '#1fa3c0'];
  for (let i = 0; i < 12; i++) {
    const rr = R * (.18 + i * .07), a0 = i * 53 + 20, len = 110 + (i % 3) * 40;
    s += `<path d="M${f(cx + Math.cos(rad(a0)) * rr)} ${f(cy + Math.sin(rad(a0)) * rr)} A${f(rr)} ${f(rr)} 0 0 1 ${f(cx + Math.cos(rad(a0 + len)) * rr)} ${f(cy + Math.sin(rad(a0 + len)) * rr)}" fill="none" stroke="${cols[i % 4]}" stroke-width="${f(14 - i * .5)}" stroke-linecap="round"/>`;
  }
  return s;
}
function crackedHourglass(sand = .6) { // sand running out of a crack
  let h = hourglassSVG(sand, 0, 0);
  h += `<path d="M-14 -40 L-4 -22 L-16 -6 L-6 8" fill="none" stroke="#1A1A1A" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  h += `<path d="M-22 -18 Q-60 10 -64 60" fill="none" stroke="#e9c46a" stroke-width="6" stroke-linecap="round" stroke-dasharray="2 12"/>`;
  return h;
}
function thumbA() {
  let s = '';
  const bands = [['#f9b24e', 0], ['#f7a440', 300], ['#f08f36', 560], ['#e8762c', 780]];
  for (const [c, y] of bands) s += `<rect x="0" y="${y}" width="1920" height="${1080 - y}" fill="${c}"/>`;
  s += `<circle cx="470" cy="760" r="270" fill="#ffd27a"/><circle cx="470" cy="760" r="220" fill="#ffe2a0"/>`;
  // dark Colosseum silhouette with warm lit arches, kept left of Max
  s += colosseumSil(370, 1100, .62, '#5a2618', '#ffcf7a', '#1A1A1A');
  s += cypress(70, 1090, .95, '#3f5a2a');
  s += `<rect y="1010" width="1920" height="80" fill="#4a1f14"/><path d="M0 1010 L1920 1010" ${ink(7)}/>`;
  // cyan portal behind Max (complementary to the orange sky)
  const MX = 1430, S = 1.9, GROUND = 1790;
  s += cyanPortal(MX - 30, 470, 640);
  // glow just around the hourglass
  const HX = -150, HY = -650; // hero-local hand position (next to his face, towards the frame centre)
  s += flatGlow(MX + HX * S, GROUND + (HY - 100) * S, 230, '#c9f6ff', .9);
  s += sticker(hero({ x: MX, y: GROUND, s: S, yaw: 12, headYaw: -6, t: 0, idle: 0, ground: false, face: PANIC, look: [-.35, -.05], sweat: 1.6, blink: 0, wave: 2.4, wind: [90, -50], tilt: -6,
    arms: { L: { to: [HX, HY] }, R: { to: [104, -690] } }, holdL: g('translate(0 -6) rotate(-12) scale(1.1)', crackedHourglass(.62)), legsVisible: false }));
  for (let i = 0; i < 5; i++) { const a = 110 + i * 38; s += sparkle(MX + HX * S + Math.cos(rad(a)) * 210, GROUND + (HY - 100) * S + Math.sin(rad(a)) * 170, .9 + (i % 3) * .25, a); }
  s += bigText('STUCK IN', 480, 150, 160, '#ffffff', { rot: -4 });
  s += bigText('100 AD', 500, 355, 290, '#ffd23f', { rot: -4 });
  return TDEFS + s;
}

// ---------------------------------------------------------------- B: portal hole in the paper
function romeInside(t = 1) {
  let r = `<rect x="0" y="0" width="1920" height="1080" fill="#a8d6ef"/>`;
  r += `<circle cx="760" cy="300" r="90" fill="#fff1c4" ${ink(5)}/>` + cloud(380, 230, 1.1) + cloud(900, 160, .8);
  r += colosseumSil(640, 860, .55, '#e8d2a6', '#b39066');
  r += cypress(240, 880, .8) + cypress(1000, 880, .7);
  r += `<rect x="0" y="860" width="1920" height="300" fill="#cdbb98"/><path d="M0 860 L1920 860" ${ink(6)}/>`;
  for (let i = 0; i < 12; i++) r += `<path d="M${i * 120} 900 l60 0 M${i * 120 + 60} 960 l60 0" stroke="#a8936e" stroke-width="5" stroke-linecap="round"/>`;
  return r;
}
function tornRing(cx, cy, R, n = 46) {
  const pts = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, rr = R + (i % 2 ? 22 : -8) + (rnd(i * 3) - .5) * 26; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  return pts;
}
function thumbB() {
  let s = `<rect width="1920" height="1080" fill="#2b3447"/>`;
  for (let i = 0; i < 16; i++) s += `<path d="M${i * 130} 0 L${i * 130} 1080" stroke="#323c52" stroke-width="40"/>`;
  s += `<rect width="1920" height="1080" fill="url(#vig)"/>`;
  const cx = 600, cy = 590, R = 400;
  s += flatGlow(cx, cy, R * 1.5, '#ffd66b', .8);
  for (let i = 0; i < 9; i++) { const rr = R + 40 + i * 18, a0 = i * 47; s += `<path d="M${f(cx + Math.cos(rad(a0)) * rr)} ${f(cy + Math.sin(rad(a0)) * rr)} A${rr} ${rr} 0 0 1 ${f(cx + Math.cos(rad(a0 + 70)) * rr)} ${f(cy + Math.sin(rad(a0 + 70)) * rr)}" fill="none" stroke="${['#ffe08a', '#f6c65a', '#e8a93c'][i % 3]}" stroke-width="${10 - i * .6}" stroke-linecap="round"/>`; }
  const hole = tornRing(cx, cy, R);
  s += `<clipPath id="holeclip"><path d="M${hole.map(p => f(p[0]) + ' ' + f(p[1])).join(' L')} Z"/></clipPath>`;
  s += `<g clip-path="url(#holeclip)">${g(`translate(${cx - 640} ${cy - 560})`, romeInside())}</g>`;
  s += `<path d="M${hole.map(p => f(p[0]) + ' ' + f(p[1])).join(' L')} Z" fill="none" stroke="#e9dfcc" stroke-width="26" stroke-linejoin="round"/><path d="M${hole.map(p => f(p[0]) + ' ' + f(p[1])).join(' L')} Z" fill="none" ${ink(7)}/>`;
  for (let i = 0; i < 8; i++) { const a = i * 45 + 20; s += sparkle(cx + Math.cos(rad(a)) * (R + 90), cy + Math.sin(rad(a)) * (R + 70), .8 + (i % 3) * .25, a); }
  const shocked = { ...EMO.surprise, eyeS: 1.35, bL: [1, -20, -6], bR: [1, -20, -6], m: { ...EMO.surprise.m, w: 18, open: .95 } };
  s += sticker(hero({ x: 1480, y: 1520, s: 1.6, yaw: -35, headYaw: -10, t: 0, idle: 0, ground: false, lean: -6, face: shocked, look: [-1, -.1], blink: 0, wave: 1.2, legsVisible: false,
    arms: { L: { to: [-260, -560] }, R: { to: [120, -470] } }, hands: { L: 'point' }, holdR: g('translate(0 -20) scale(.9)', hourglassSVG(.4, .9, 1)), sweat: 1 }));
  s += bigText('NO WAY BACK?!', 600, 110, 150, '#ffd23f', { rot: -3 });
  return `<defs><radialGradient id="vig" cx="50%" cy="50%" r="70%"><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".45"/></radialGradient></defs>` + TDEFS + s;
}

// ---------------------------------------------------------------- C: everyone stares at Max
function thumbC() {
  let s = `<rect width="1920" height="1080" fill="#ffcf5a"/>`;
  // radial burst
  for (let i = 0; i < 18; i++) { const a0 = rad(i * 20), a1 = rad(i * 20 + 10); s += `<path d="M960 640 L${f(960 + Math.cos(a0) * 1800)} ${f(640 + Math.sin(a0) * 1800)} L${f(960 + Math.cos(a1) * 1800)} ${f(640 + Math.sin(a1) * 1800)} Z" fill="#ffbf3a"/>`; }
  // Roman faces looming from the edges
  const face = (k, x, y, sc, rot, fc, lk) => sticker(g(T(x, y, sc, rot), headSVG(Object.assign({}, NPC[k], { face: EMO[fc], look: lk, blink: 0 }))));
  s += face('merchant', 170, 330, 2.2, 28, 'anger', [.7, .4]) + face('oldman', 1760, 300, 2.1, -26, 'surprise', [-.7, .4]) + face('boy', 220, 900, 1.8, 40, 'joy', [.8, -.2]) + face('lady', 1720, 880, 1.9, -36, 'anger', [-.8, -.2]);
  // Max in the centre, sitting up, dazed with the hourglass
  const hg = heldHourglass(.9, 1.1);
  s += sticker(hero(Object.assign({ x: 960, y: 1420, s: 1.38, yaw: 0, t: 0, idle: 0, face: { ...EMO.fear, m: { ...EMO.fear.m, wob: 1 } }, look: [0, -.2], sweat: 1.6, blink: 0, wave: .4 }, hg)));
  s += bigText('WHERE AM I?!', 960, 110, 170, '#ffffff', { rot: -2 });
  return TDEFS + s;
}
window.THUMBS = { A: thumbA, B: thumbB, C: thumbC };

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
function thumbA() {
  let s = `<rect width="1920" height="1080" fill="#ff9d4d"/>`;
  s += `<circle cx="560" cy="700" r="360" fill="#ffd27a"/><circle cx="560" cy="700" r="300" fill="#ffe2a0"/>`;
  s += colosseumSil(560, 1100, .78, '#d86a3c', '#9c4426');
  s += cypress(140, 1090, 1.0, '#6f8a45') + cypress(980, 1090, .8, '#6f8a45');
  s += `<rect y="1000" width="1920" height="90" fill="#c9773f"/><path d="M0 1000 L1920 1000" ${ink(7)}/>`;
  // portal behind Max
  s += portalSVG(1390, 520, 560, 1.7, 1);
  // Max: big, scared, holding the glowing hourglass
  const hg = heldHourglass(1, 1.1);
  s += sticker(hero(Object.assign({ x: 1390, y: 1330, s: 1.48, yaw: 18, headYaw: -8, t: 0, idle: 0, face: EMO.fear, look: [-.5, -.1], sweat: 1.6, blink: 0, wave: 2, wind: [80, -40], tilt: -4 }, hg)));
  for (let i = 0; i < 7; i++) { const a = i * 52 + 10; s += sparkle(1390 + Math.cos(rad(a)) * 190, 650 + Math.sin(rad(a)) * 150, .7 + (i % 3) * .2, a); }
  // title
  s += bigText('STUCK IN', 520, 150, 150, '#ffffff', { rot: -4 });
  s += bigText('100 AD', 540, 345, 270, '#ffd23f', { rot: -4 });
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
  let s = `<rect width="1920" height="1080" fill="#FAF7F0"/><image href="../assets/paper.jpg" x="0" y="0" width="1920" height="1080" opacity=".9"/>`;
  const cx = 640, cy = 560, R = 410;
  s += flatGlow(cx, cy, R * 1.45, '#ffd66b', .9);
  // spiral swirls around the hole
  for (let i = 0; i < 9; i++) { const rr = R + 40 + i * 18, a0 = i * 47; s += `<path d="M${f(cx + Math.cos(rad(a0)) * rr)} ${f(cy + Math.sin(rad(a0)) * rr)} A${rr} ${rr} 0 0 1 ${f(cx + Math.cos(rad(a0 + 70)) * rr)} ${f(cy + Math.sin(rad(a0 + 70)) * rr)}" fill="none" stroke="${['#ffe08a', '#f6c65a', '#e8a93c'][i % 3]}" stroke-width="${10 - i * .6}" stroke-linecap="round"/>`; }
  const hole = tornRing(cx, cy, R);
  const id = 'holeclip';
  s += `<clipPath id="${id}"><path d="M${hole.map(p => f(p[0]) + ' ' + f(p[1])).join(' L')} Z"/></clipPath>`;
  s += `<g clip-path="url(#${id})">${g(`translate(${cx - 640} ${cy - 560})`, romeInside())}</g>`;
  // paper lip (curled edge) + ink outline
  s += `<path d="M${hole.map(p => f(p[0]) + ' ' + f(p[1])).join(' L')} Z" fill="none" stroke="#e9dfcc" stroke-width="26" stroke-linejoin="round"/>`;
  s += `<path d="M${hole.map(p => f(p[0]) + ' ' + f(p[1])).join(' L')} Z" fill="none" ${ink(7)}/>`;
  for (let i = 0; i < 8; i++) { const a = i * 45 + 20; s += sparkle(cx + Math.cos(rad(a)) * (R + 90), cy + Math.sin(rad(a)) * (R + 70), .8 + (i % 3) * .25, a); }
  // Max leaning in from the right, pointing at Rome
  s += sticker(hero({ x: 1500, y: 1340, s: 1.42, yaw: -35, headYaw: -10, t: 0, idle: 0, lean: -8, face: EMO.surprise, look: [-1, -.1], blink: 0, wave: 1.2, arms: { L: { a: [-100, -6] }, R: { to: [60, -560] } }, hands: { L: 'point' }, sweat: 1 }));
  s += bigText('ROME?!', 1460, 140, 210, '#e53935', { rot: 4 });
  return TDEFS + s;
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

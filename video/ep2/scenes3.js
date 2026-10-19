// Episode 2 (v3): "What If You Woke Up in Ancient Rome?" — first minute, built on the spec rig (lib3.js)
let CAMT = 0; // time used for the handheld drift
const cam = (inner, cx, cy, z, rot = 0) => { const dx = noise1(CAMT * .35) * 5, dy = noise1(CAMT * .3 + 9) * 4, dr = noise1(CAMT * .25 + 3) * .25; return g(`translate(960 540) rotate(${f(rot + dr)}) scale(${f(z * 1000) / 1000}) translate(${f(-cx - dx)} ${f(-cy - dy)})`, inner); };
// walking without foot sliding: phase follows the distance travelled
const STRIDE = 215;
const walkPh = (x, x0, s = 1, amp = 1) => Math.abs(x - x0) / (STRIDE * s * Math.max(.3, amp)) * Math.PI;
// blink when the head turns quickly, hair lags behind head turns
const turnFX = (t, fn, seed = 0) => { const v = (fn(t + .03) - fn(t - .03)) / .06; return { blink: Math.max(blinkK(t, seed), clamp((Math.abs(v) - 120) / 200)), hairRot: clamp(-(fn(t) - fn(t - .12)) * .12, -7, 7) }; };
const shake = (t, a) => [noise1(t * 23) * a, noise1(t * 23 + 40) * a];
const lf = (S, i, fr) => S.L[i][0] + (S.L[i][1] - S.L[i][0]) * fr;
const label = (str, x, y, t, t0, o = {}) => t < t0 ? '' : text(str, x, y, Object.assign({ s: pop(t, t0, .5), sw: 12 }, o, { op: (o.op == null ? 1 : o.op) * fadeI(t, t0, .15) }));
const E = (t, list) => S(t, list.map(([tt, k]) => [tt, typeof k === 'string' ? EMO[k] : k]), .28);
// world -> hero-local (for IK targets); ignores lean
const toLocal = (o, wx, wy) => [(wx - o.x) / (o.s || 1), (wy - o.y) / (o.s || 1)];
const flatGlow = (x, y, r, col, a) => { let s = ''; for (let i = 0; i < 4; i++) s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r * (1 - i * .22))}" fill="${col}" opacity="${f(a * .22)}"/>`; return s; };
const sparkle = (x, y, s, rot = 0, a = 1) => op(a, g(T(x, y, s, rot), `<path d="M0 -30 Q4 -4 30 0 Q4 4 0 30 Q-4 4 -30 0 Q-4 -4 0 -30 Z" fill="#fff6d0" ${ink(3)}/>`));
const NPC = {
  merchant: { hairStyle: 'short', hairCol: '#2b2523', mustache: true, cape: false, tunicCol: '#b8773f', tunicLine: '#96602f', apron: '#eadfc6' },
  woman: { hairStyle: 'long', hairCol: '#6b4a32', cape: false, dress: true, tunicCol: '#86a3bb', tunicLine: '#6d8aa2', belt: false, noVneck: true },
  oldman: { hairStyle: 'bald', hairCol: '#a9a5a0', beard: true, cape: false, toga: true, tunicCol: '#efe9dc' },
  boy: { hairStyle: 'curly', hairCol: '#c9984f', cape: false, tunicCol: '#8aa36a', tunicLine: '#728a54', sc: .78 },
  lady: { hairStyle: 'bun', hairCol: '#2b2523', cape: false, dress: true, tunicCol: '#c98d86', tunicLine: '#ad716b', belt: false, noVneck: true },
  worker: { hairStyle: 'short', hairCol: '#9a4a2a', beard: true, cape: false, tunicCol: '#9c8a6e', tunicLine: '#83725a' },
  soldier: { helmet: true, armor: true, capeCol: '#9c2a2a', tunicCol: '#b8473f', tunicLine: '#963630' },
};
const npc = (k, o) => hero(Object.assign({}, NPC[k], o, { s: (o.s || 1) * (NPC[k].sc || 1) }));

// ---------------------------------------------------------------- PROPS
function hourglassSVG(sand = .3, glow = 0, t = 0) {
  let s = '';
  if (glow > .01) s += flatGlow(0, 0, 150 * (1 + Math.sin(t * 5) * .05) * (.6 + glow * .5), '#ffd66b', glow);
  const cap = y => `<rect x="-46" y="${y - 10}" width="92" height="20" rx="8" fill="${PAL.grip}" ${ink(5)}/>`;
  s += `<path d="M-34 -62 L-34 62 M34 -62 L34 62" ${ink(8)}/><path d="M-34 -62 L-34 62 M34 -62 L34 62" stroke="${PAL.guard}" stroke-width="3"/>`;
  s += `<path d="M-28 -62 Q-28 -16 -5 0 Q-28 16 -28 62 L28 62 Q28 16 5 0 Q28 -16 28 -62 Z" fill="#eef3f2" ${ink(5)}/>`;
  const col = glow > .3 ? '#ffd86a' : '#d9b46b', top = 1 - sand;
  if (top > .02) s += `<path d="M${f(-23 * Math.sqrt(top))} ${f(-6 - 50 * top)} L${f(23 * Math.sqrt(top))} ${f(-6 - 50 * top)} L4 -3 L-4 -3 Z" fill="${col}"/>`;
  s += `<path d="M-23 58 Q0 ${f(58 - 46 * sand)} 23 58 Z" fill="${col}"/>`;
  if (sand < .99 && top > .01) s += `<path d="M0 -2 L0 56" stroke="${col}" stroke-width="3"/>`;
  s += cap(-70) + cap(70);
  if (glow > .2) for (let i = 0; i < 7; i++) { const a = t * 1.7 + i * .9, r = 74 + Math.sin(t * 2 + i) * 14; s += `<circle cx="${f(Math.cos(a) * r)}" cy="${f(Math.sin(a) * r * .7)}" r="${f(3 + (i % 3))}" fill="#fff3b8" opacity="${f(glow * (.5 + .5 * Math.sin(t * 6 + i)))}"/>`; }
  return s;
}
const boxSVG = (w, h, col = '#c79a62') => `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="4" fill="${col}" ${ink(5)}/><path d="M${-w / 2 + 8} ${-h * .5} L${w / 2 - 8} ${-h * .5}" stroke="#a87f4c" stroke-width="3"/><rect x="-14" y="${-h}" width="28" height="${h * .42}" fill="#e3c99a" ${ink(3)}/>`;
function chestSVG(lid = 0) {
  let s = g(`translate(-150 -150) rotate(${f(-lid * 108)})`, `<path d="M0 0 L300 0 L300 -16 Q150 -76 0 -16 Z" fill="#6f4627" ${ink(5)}/><path d="M60 -6 L60 -46 M240 -6 L240 -46" stroke="#5f5c58" stroke-width="10"/>`);
  s += `<rect x="-150" y="-150" width="300" height="150" fill="#8a5a34" ${ink(5)}/><rect x="-142" y="-146" width="284" height="16" fill="#2e1c10"/>`;
  s += `<path d="M-90 -150 L-90 0 M90 -150 L90 0" stroke="#5f5c58" stroke-width="12"/><path d="M-150 -70 L150 -70" stroke="#6f4627" stroke-width="3"/>`;
  s += `<rect x="-16" y="-122" width="32" height="38" rx="5" fill="${PAL.brooch}" ${ink(4)}/>`;
  return s;
}
const sockSVG = `<path d="M-12 -40 L12 -40 L12 6 Q30 8 34 22 Q34 34 18 34 L-12 32 Z" fill="#c9cfd8" ${ink(4)}/><path d="M-12 -30 L12 -30" stroke="#a8323d" stroke-width="5"/>`;
const bookSVG = `<rect x="-34" y="-24" width="68" height="48" rx="4" fill="#5d7a8c" ${ink(4)}/><path d="M-26 -24 L-26 24" ${ink(3)}/>`;
const duckSVG = `<ellipse cx="0" cy="0" rx="30" ry="20" fill="#e8c34a" ${ink(4)}/><circle cx="22" cy="-20" r="14" fill="#e8c34a" ${ink(4)}/><path d="M34 -20 l12 4 l-12 4 z" fill="#d9822e" ${ink(2.5)}/>`;

// ---------------------------------------------------------------- BACKGROUNDS (flat colors, ink lines, hatching)
function hatch(x, y, w, h, gap = 16, col = '#000', a = .12, ang = 1) {
  let s = ''; for (let i = -h; i < w; i += gap) s += `<path d="M${f(x + i)} ${f(y + h)} L${f(x + i + h * ang)} ${f(y)}" stroke="${col}" stroke-width="2.5" opacity="${a}"/>`;
  const id = uid('hc'); return `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">${s}</g>`;
}
function atticBG(t, k = {}) {
  const wind = k.wind || 0;
  let s = `<rect width="1920" height="1080" fill="#7a5a40"/>`;
  for (let i = 0; i < 14; i++) s += `<path d="M${90 + i * 140} 40 L${90 + i * 140} 830" stroke="#664a33" stroke-width="4"/>`;
  // round window with sunset bands
  const id = uid('win');
  s += `<clipPath id="${id}"><circle cx="1300" cy="330" r="110"/></clipPath><g clip-path="url(#${id})"><rect x="1180" y="210" width="240" height="240" fill="#f7c27a"/><rect x="1180" y="330" width="240" height="40" fill="#f29f73"/><rect x="1180" y="370" width="240" height="90" fill="#c9798f"/><circle cx="1300" cy="370" r="34" fill="#ffe2a0"/></g>`;
  s += `<circle cx="1300" cy="330" r="110" fill="none" stroke="#5a3b25" stroke-width="22"/><circle cx="1300" cy="330" r="121" fill="none" ${ink(5)}/><circle cx="1300" cy="330" r="99" fill="none" ${ink(4)}/><path d="M1300 220 L1300 440 M1190 330 L1410 330" stroke="#5a3b25" stroke-width="12"/>`;
  // roof planes, rafters, ridge
  s += `<path d="M0 0 L780 0 L0 760 Z" fill="#5e432f" ${ink(5)}/><path d="M1920 0 L1140 0 L1920 760 Z" fill="#5e432f" ${ink(5)}/>`;
  for (let i = 1; i < 6; i++) s += `<path d="M${i * 130} 0 L0 ${i * 127}" stroke="#4d3624" stroke-width="3"/><path d="M${1920 - i * 130} 0 L1920 ${i * 127}" stroke="#4d3624" stroke-width="3"/>`;
  s += `<path d="M640 0 L690 0 L0 700 L0 650 Z" fill="#a0714a" ${ink(5)}/><path d="M1280 0 L1230 0 L1920 700 L1920 650 Z" fill="#a0714a" ${ink(5)}/><rect x="560" y="-5" width="800" height="48" fill="#8a5f3e" ${ink(5)}/>`;
  // floor
  s += `<rect y="830" width="1920" height="250" fill="#6b4c35"/><path d="M0 830 L1920 830" ${ink(5)}/>`;
  for (let i = 0; i < 5; i++) s += `<path d="M0 ${876 + i * 48} L1920 ${876 + i * 48}" stroke="#563c29" stroke-width="3"/>`;
  for (let i = 0; i < 22; i++) { const r = Math.floor(i / 4.4); s += `<path d="M${f(rnd(i) * 1920)} ${832 + r * 48} l0 42" stroke="#563c29" stroke-width="3"/>`; }
  // light beam (flat translucent) + dust
  s += `<path d="M1210 290 L1395 365 L1190 1000 L620 1000 Z" fill="#ffe0a0" opacity=".16"/>`;
  for (let i = 0; i < 28; i++) {
    const u = (rnd(i) + t * .014 * (1 + rnd(i + 3)) + wind * t * .05) % 1, v = rnd(i + 9);
    const x = lerp(lerp(1220, 1380, v), lerp(640, 1180, v), u) + Math.sin(t * .7 + i) * 18 - wind * 60 * Math.sin(t * 3 + i), y = lerp(320, 980, u) + Math.cos(t * .5 + i) * 10;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(2 + rnd(i + 5) * 2.4)}" fill="#fff0c8" opacity="${f(.35 + .45 * Math.sin(t * 1.3 + i) ** 2)}"/>`;
  }
  // hanging bulb
  const sw = Math.sin(t * 1.1) * 3 + wind * Math.sin(t * 9) * 10;
  s += g(`translate(600 44) rotate(${f(sw)})`, `<path d="M0 0 L0 220" ${ink(3)}/><rect x="-12" y="216" width="24" height="18" fill="#7a7672" ${ink(3)}/><path d="M-20 236 Q-24 272 0 280 Q24 272 20 236 Z" fill="#f4e9c8" ${ink(4)}/>`);
  const rat = i => wind ? Math.sin(t * 30 + i) * wind * 4 : 0;
  s += g(`translate(${f(250 + rat(1))} 900)`, boxSVG(240, 170)) + g(`translate(${f(270 + rat(2))} 730) rotate(${f(-3 + rat(3) * .3)})`, boxSVG(200, 140, '#b98d58')) + g(`translate(${f(240 + rat(4))} 590) rotate(${f(4 + rat(5) * .3)})`, boxSVG(150, 110, '#cfa46c'));
  s += g(`translate(${f(500 + rat(6))} 900) rotate(-8)`, `<path d="M-90 0 L-70 -300 L90 -300 L110 0 Z" fill="#e6dfd2" ${ink(5)}/><path d="M-50 -280 Q-30 -150 -60 0 M20 -300 Q40 -150 10 0 M70 -290 Q60 -150 90 0" fill="none" stroke="#c9c0b0" stroke-width="5"/>`);
  s += `<path d="M1520 830 L1520 640 L1700 640 L1700 830" fill="#8a5f3e" ${ink(5)}/><path d="M1500 640 L1720 640" ${ink(8)}/>` + g('translate(1570 640)', boxSVG(90, 70, '#b98d58'));
  return s;
}
function cloud(x, y, s, a = 1) { return g(T(x, y, s), `<path d="M-120 20 Q-130 -20 -90 -26 Q-80 -70 -30 -60 Q-6 -96 40 -70 Q90 -80 96 -30 Q136 -24 126 20 Z" fill="#fffdf6" ${ink(4)} opacity="${a}"/>`); }
function skyPOV(t) {
  let s = `<rect width="1920" height="1080" fill="#a9d3ea"/>`;
  s += cloud(520 + t * 14, 300, 1.4) + cloud(1400 + t * 10, 520, 1.0) + cloud(1060 + t * 8, 190, .8);
  const wall = side => {
    const sx = side < 0 ? -10 : 1930, inner = side < 0 ? 520 : 1400, bot = lerp(inner, 960, .35);
    let w = `<path d="M${sx} -10 L${inner} -10 L${bot} 1090 L${sx} 1090 Z" fill="${side < 0 ? '#e0a96c' : '#e9cf98'}" ${ink(5)}/>`;
    for (let i = 0; i < 4; i++) { const y = 140 + i * 230, ix = lerp(inner, bot, y / 1080), x0 = side < 0 ? ix - 220 : ix + 80; w += `<path d="M${f(x0)} ${y} l140 ${side * 12} l0 120 l-140 ${-side * 12} Z" fill="#5a4030" ${ink(4)}/><path d="M${f(x0 + 70)} ${f(y + side * 6)} l0 120" stroke="#8a5f3e" stroke-width="6"/>`; }
    return w;
  };
  s += wall(-1) + wall(1);
  const sag = 60 + Math.sin(t) * 5;
  s += `<path d="M560 230 Q960 ${230 + sag} 1360 230" fill="none" ${ink(3)}/>`;
  [[700, '#c96a5a'], [880, '#f3ece0'], [1080, '#7d9bb5'], [1220, '#d9b45a']].forEach(([x, c], i) => { const yy = 230 + sag * (1 - Math.pow((x - 960) / 400, 2)) - 4; s += g(`translate(${x} ${f(yy)}) rotate(${f(Math.sin(t * 2 + i) * 4)})`, `<path d="M-40 0 L40 0 L36 90 L-36 90 Z" fill="${c}" ${ink(4)}/>`); });
  const bx = (t * 160) % 2600 - 300; s += g(`translate(${f(bx)} ${f(420 + Math.sin(t * 2) * 20)})`, `<path d="M-20 0 Q-10 ${f(-12 + Math.sin(t * 14) * 8)} 0 0 Q10 ${f(-12 + Math.sin(t * 14) * 8)} 20 0" fill="none" ${ink(4)}/>`);
  return s;
}
const BLD = [];
(() => { let x = -300; const cols = ['#e0a96c', '#d2835c', '#efe0bf', '#e8c98a', '#dc9a6e', '#ecd8ae', '#d29e66']; let i = 0; while (x < 2700) { const w = 250 + rnd(i) * 140, h = 380 + rnd(i + 50) * 260; BLD.push({ x, w, h, col: cols[i % cols.length], i, shop: rnd(i + 7) > .3, bal: rnd(i + 11) > .45, awn: ['#b8473f', '#3f6f8f', '#c99a3a', '#5f8a4a'][i % 4] }); x += w; i++; } })();
function building(b, base, t) {
  const { x, w, h, col } = b;
  let s = `<rect x="${f(x)}" y="${f(base - h)}" width="${f(w)}" height="${f(h)}" fill="${col}" ${ink(5)}/>`;
  s += hatch(x + w * .8, base - h, w * .2, h, 18, '#000', .1);
  s += `<path d="M${f(x - 14)} ${f(base - h)} L${f(x + w + 14)} ${f(base - h)} L${f(x + w + 4)} ${f(base - h - 26)} L${f(x - 4)} ${f(base - h - 26)} Z" fill="#c0603f" ${ink(4.5)}/>`;
  for (let k = 0; k < Math.floor(w / 30); k++) s += `<path d="M${f(x + k * 30 + 11)} ${f(base - h - 24)} q-4 12 0 24" fill="none" stroke="#8f3f28" stroke-width="3"/>`;
  const floors = Math.floor((h - 170) / 120);
  for (let fl = 0; fl < floors; fl++) {
    const y = base - h + 60 + fl * 120, n = Math.max(2, Math.floor(w / 100));
    for (let j = 0; j < n; j++) {
      const wx = x + (j + .5) * w / n - 22;
      s += `<rect x="${f(wx)}" y="${f(y)}" width="44" height="62" fill="#4b3325" ${ink(4)}/>`;
      if ((b.i + j + fl) % 3 === 0) s += `<path d="M${f(wx - 16)} ${f(y)} l16 0 l0 62 l-16 0 Z M${f(wx + 44)} ${f(y)} l16 0 l0 62 l-16 0 Z" fill="#7a8f5a" ${ink(3)}/>`;
      else s += `<path d="M${f(wx + 22)} ${f(y)} l0 62" stroke="#8a5f3e" stroke-width="4"/>`;
      if ((b.i + j * 2 + fl) % 4 === 1) s += `<ellipse cx="${f(wx + 22)}" cy="${f(y + 66)}" rx="30" ry="10" fill="#6f8a4a" ${ink(3)}/><rect x="${f(wx + 6)}" y="${f(y + 62)}" width="32" height="14" fill="#c0603f" ${ink(3)}/>`;
    }
    if (b.bal && fl === 1) s += `<rect x="${f(x + 20)}" y="${f(y + 72)}" width="${f(w - 40)}" height="14" fill="#8a5f3e" ${ink(4)}/>` + Array.from({ length: Math.floor((w - 40) / 22) }, (_, k) => `<path d="M${f(x + 30 + k * 22)} ${f(y + 86)} l0 30" stroke="#6b4a30" stroke-width="5"/>`).join('') + `<path d="M${f(x + 20)} ${f(y + 116)} L${f(x + w - 20)} ${f(y + 116)}" ${ink(4)}/>`;
  }
  if (b.shop) {
    const sx = x + w * .14, sw = w * .72, wv = Math.sin(t * 2 + b.i) * 2;
    s += `<path d="M${f(sx)} ${base} L${f(sx)} ${base - 120} Q${f(sx + sw / 2)} ${base - 175} ${f(sx + sw)} ${base - 120} L${f(sx + sw)} ${base} Z" fill="#3a271c" ${ink(4.5)}/>`;
    let aw = ''; const n = 6; for (let k = 0; k < n; k++) aw += `<path d="M${f(sx - 14 + k * (sw + 28) / n)} ${base - 175} L${f(sx - 14 + (k + 1) * (sw + 28) / n)} ${base - 175} L${f(sx - 14 + (k + 1) * (sw + 28) / n + wv)} ${base - 130} L${f(sx - 14 + k * (sw + 28) / n + wv)} ${base - 130} Z" fill="${k % 2 ? '#f6efe0' : b.awn}"/>`;
    s += aw + `<path d="M${f(sx - 14)} ${base - 175} L${f(sx + sw + 14)} ${base - 175} L${f(sx + sw + 14 + wv)} ${base - 130} L${f(sx - 14 + wv)} ${base - 130} Z" fill="none" ${ink(4)}/><rect x="${f(sx + 10)}" y="${base - 60}" width="${f(sw - 20)}" height="60" fill="#c9a77a" ${ink(4)}/>`;
  }
  return s;
}
function farRome() {
  let s = `<path d="M0 640 Q200 560 420 600 Q700 520 980 590 Q1300 530 1600 600 Q1800 570 1920 600 L1920 780 L0 780 Z" fill="#cfd8bd" ${ink(3, '#a9b496')}/>`;
  s += `<g transform="translate(1430 640)"><path d="M-230 0 L-230 -150 Q0 -190 230 -150 L230 0 Z" fill="#e2d3b4" ${ink(3, '#b3a385')}/>`;
  for (let r = 0; r < 3; r++) for (let k = 0; k < 12; k++) s += `<path d="M${-210 + k * 36} ${-12 - r * 46} l0 -26 q12 -14 24 0 l0 26 Z" fill="#b8a888"/>`;
  s += `</g><g transform="translate(120 650)">`; for (let k = 0; k < 9; k++) s += `<path d="M${k * 70} 0 l0 -80 q35 -36 70 0 l0 80" fill="none" stroke="#c4b496" stroke-width="10"/>`; s += `<rect x="-6" y="-130" width="650" height="18" fill="#c4b496"/></g>`;
  s += `<g transform="translate(860 640)"><path d="M-120 -150 L0 -200 L120 -150 Z" fill="#e9dfca" ${ink(3, '#b3a68d')}/>`; for (let k = 0; k < 6; k++) s += `<rect x="${-110 + k * 42}" y="-150" width="14" height="150" fill="#e9dfca" stroke="#b3a68d" stroke-width="2"/>`; s += `</g>`;
  for (let k = 0; k < 7; k++) { const x = 300 + k * 230; s += `<path d="M${x} 650 Q${x - 18} 580 ${x} 500 Q${x + 18} 580 ${x} 650 Z" fill="#93a675" ${ink(3, '#738456')}/>`; }
  return s;
}
function romeStreet(t, o = {}) {
  const base = o.base || 840, px = o.px || 0;
  let s = `<defs><pattern id="cob" width="64" height="40" patternUnits="userSpaceOnUse"><rect width="64" height="40" fill="#bfae92"/><rect x="3" y="3" width="26" height="15" rx="7" fill="#d4c4a8" stroke="#8a7a62" stroke-width="2"/><rect x="35" y="3" width="26" height="15" rx="7" fill="#cbb99d" stroke="#8a7a62" stroke-width="2"/><rect x="-13" y="22" width="26" height="15" rx="7" fill="#cfbfa2" stroke="#8a7a62" stroke-width="2"/><rect x="19" y="22" width="26" height="15" rx="7" fill="#d8c9ad" stroke="#8a7a62" stroke-width="2"/><rect x="51" y="22" width="26" height="15" rx="7" fill="#cbb99d" stroke="#8a7a62" stroke-width="2"/></pattern></defs>`;
  s += `<rect width="1920" height="1080" fill="#b4dbef"/><circle cx="1650" cy="170" r="66" fill="#fff1c4" ${ink(4)}/>`;
  s += cloud(260 + t * 6, 160, 1.1) + cloud(1100 + t * 4, 110, .8);
  s += g(`translate(${f(-px * .15)} 0)`, farRome());
  let bl = ''; for (const b of BLD) if (b.x - px < 2000 && b.x + b.w - px > -100) bl += building(b, base, t);
  s += g(`translate(${f(-px)} 0)`, bl);
  s += `<rect x="-200" y="${base}" width="2320" height="900" fill="url(#cob)"/><rect y="${base}" width="1920" height="26" fill="#ddcfb4" ${ink(4)}/>`;
  return s;
}
function portalSVG(cx, cy, r, t, k) {
  let s = flatGlow(cx, cy, r * 1.2, '#ffd66b', k);
  const cols = ['#fff3c4', '#ffe08a', '#f6c65a', '#e8a93c'];
  let rings = '';
  for (let i = 0; i < 16; i++) {
    const rr = r * (.1 + i * .058), a0 = t * (160 + i * 20) + i * 47, len = 100 + (i % 3) * 50;
    rings += `<path d="M${f(rr)} 0 A${f(rr)} ${f(rr)} 0 0 1 ${f(rr * Math.cos(rad(len)))} ${f(rr * Math.sin(rad(len)))}" fill="none" stroke="${cols[i % 4]}" stroke-width="${f(8 + i * .8)}" stroke-linecap="round" transform="rotate(${f(a0)})"/>`;
  }
  return s + g(`translate(${cx} ${cy})`, rings, `opacity="${f(k)}"`) + `<circle cx="${cx}" cy="${cy}" r="${f(r * .12 * k)}" fill="#fffbe8"/>`;
}

// ---------------------------------------------------------------- SCENE: ATTIC
const SC = {};
SC.attic = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    const tB = 4.0, tFind = lf(S, 0, .74), tC = L[1] - .3, tD = L[2] - .2, tFlip = L[2] + .7, tE = L[3] - .45, tSuck = L[3] + .5;
    const shot = t < tB ? 'A' : t < tC ? 'B' : t < tD ? 'C' : t < tE ? 'D' : 'E';
    const glow = clamp(seg(t, tFind, tC + .8) * .8 + seg(t, tFlip, tFlip + 1) * .5);
    const wind = seg(t, tFlip + .2, tE) * .7 + seg(t, tE, tSuck) * .8;
    let world = atticBG(t, { wind });
    const CHX = 1120, GY = 990;
    world += `<rect x="${CHX - 170}" y="${GY - 170}" width="340" height="170" fill="#8a6a4a" ${ink(5)}/><path d="M${CHX - 170} ${GY - 85} L${CHX + 170} ${GY - 85}" stroke="#6b4f36" stroke-width="4"/>`;
    world += g(`translate(${CHX} ${GY - 170}) scale(.95)`, chestSVG(eback(seg(t, 4.5, 5.1))));
    if (glow > 0 && shot === 'B') world += flatGlow(CHX, GY - 320, 120 + glow * 60, '#ffd66b', glow * .8);
    let hero_ = '', o = { t, blink: blinkK(t, 1), wave: 1 + wind * 2, wind: [-wind * 90, -wind * 30] };
    if (shot === 'A') {
      // walk in with a box, set it down, wipe forehead
      const walkEnd = 2.3, x = K(t, [[0, -180], [walkEnd, 720, eout]]);
      const walking = t < walkEnd, wamp = walking ? 1 - seg(t, walkEnd - .4, walkEnd) : 0, wc = walkCycle(walkPh(x, -180, 1, 1), wamp);
      const yaw = K(t, [[walkEnd - .2, 90], [walkEnd + .4, 25]]);
      const crouch = Math.sin(seg(t, walkEnd + .3, walkEnd + 1.1) * Math.PI);
      const boxDown = seg(t, walkEnd + .7, walkEnd + .8) > 0;
      Object.assign(o, { x, y: GY + wc.bob * .9 + crouch * 30, s: 1, yaw, lean: wc.lean + crouch * 14, legs: walking ? wc.legs : { L: [-8 - crouch * 14, crouch * 30], R: [8 + crouch * 4, crouch * 28] }, ground: true });
      o.face = E(t, [[0, 'neutral'], [walkEnd + 1.3, 'sad'], [walkEnd + 1.6, 'sleepy']]);
      const wipe = seg(t, walkEnd + 1.2, walkEnd + 2.2);
      if (!boxDown) o.arms = { L: { to: [-78, -440 + crouch * 30], fore: .6 }, R: { to: [78, -440 + crouch * 30], fore: .6 } };
      else o.arms = { L: { a: [-12, 4] }, R: wipe > 0 && wipe < 1 ? { to: [lerp(-60, 70, esine(wipe)), -770 + Math.sin(wipe * Math.PI) * 10], bend: 'up' } : { a: [12, -4] } };
      if (!boxDown) o.frontExtra = g('translate(0 -410)', boxSVG(170, 120, '#c79a62'));
      hero_ += shadow(x, GY + 4, 110) + hero(o);
      if (boxDown) { hero_ += g(`translate(${f(x + 210)} ${GY})`, boxSVG(170, 120, '#c79a62')); const pk = seg(t, walkEnd + .8, walkEnd + 1.8); if (pk < 1) for (let i = 0; i < 5; i++) hero_ += `<circle cx="${f(x + 210 + (i - 2) * 50 * (1 + pk))}" cy="${f(GY - 20 - pk * 50 - i % 2 * 20)}" r="${f(22 * (1 - pk) + 8)}" fill="#d9c8ab" ${ink(3)} opacity="${f(1 - pk)}"/>`; }
      world += hero_;
      return cam(world, K(t, [[0, 940], [3.6, 900]]), 540, K(t, [[0, 1.06], [4, 1.12]], esine)) + this.overlay(t, S);
    }
    if (shot === 'B') {
      // rummaging in the chest, tossing things over the shoulder
      Object.assign(o, { x: 900, y: GY, s: 1, yaw: 35, lean: K(t, [[tB, 30], [tFind, 32], [tFind + .5, 4, eback]]) });
      const rum = t < tFind;
      const tosses = [[tB + .9, sockSVG], [tB + 1.7, bookSVG], [lf(S, 0, .6), duckSVG]];
      let throwArm = 0; for (const [t0] of tosses) throwArm = Math.max(throwArm, Math.sin(seg(t, t0 - .25, t0 + .2) * Math.PI));
      const rl = [90 + noise1(t * 2.2) * 30, -430 + noise1(t * 3) * 25], rr = [170 + noise1(t * 2.5 + 9) * 30, -440 + noise1(t * 2.7 + 2) * 25];
      o.arms = rum ? { L: { to: rl }, R: throwArm > 0 ? { a: [lerp(30, 160, throwArm), lerp(-40, 20, throwArm)] } : { to: rr } } : { L: { to: [70, -470] }, R: { to: [160, -460] } };
      o.face = E(t, [[tB, 'neutral'], [tB + 1.0, 'smirk' in EMO ? 'smile' : 'smile'], [lf(S, 0, .55), 'neutral'], [tFind, 'surprise'], [tFind + .9, 'think']]);
      o.look = rum ? [.7, .6] : K(t, [[tFind, [.6, .5]], [tFind + .8, [0, 0]]]);
      const hyB = tt => tt < tFind ? 0 : K(tt, [[tFind + .5, 0], [tFind + 1, -25, eback]]);
      o.headYaw = hyB(t); Object.assign(o, turnFX(t, hyB, 1));
      world += shadow(900, GY + 4, 110) + hero(o);
      for (const [t0, svg] of tosses) { const k = seg(t, t0, t0 + 1.1); if (k > 0 && k < 1) world += g(T(lerp(1000, 300, k), lerp(640, 900, k) - Math.sin(k * Math.PI) * 420, 1, k * 720), svg); }
      world += sparkle(CHX + Math.sin(t * 3) * 14, GY - 360, (.8 + Math.sin(t * 9) * .25) * fadeI(t, tFind - .3, .3), t * 70);
      const z = K(t, [[tB, 1.4], [tC, 1.55]], esine);
      return cam(world, K(t, [[tB, 1000], [tC, 980]]), K(t, [[tB, 560], [tC, 520]]), z) + this.overlay(t, S);
    }
    // shots C/D/E share the standing pose with the hourglass
    const flipK = eback(seg(t, tFlip, tFlip + .8)), antic = Math.sin(seg(t, tFlip - .45, tFlip) * Math.PI) * (t < tFlip ? 1 : 0);
    const lift = shot === 'C' ? eout(seg(t, tC, tC + 1.4)) : 1;
    const hx = 0, hy = lerp(-380, -480, lift) - antic * 30 - Math.sin(seg(t, tFlip, tFlip + .5) * Math.PI) * 70;
    const ang = flipK * 180;
    const hand = s2 => [hx + Math.cos(rad(ang)) * 56 * s2, hy + Math.sin(rad(ang)) * 56 * s2];
    Object.assign(o, { x: 930, y: GY, s: 1, yaw: shot === 'C' ? 10 : 15, squash: 1 - antic * .05, arms: { L: { to: hand(-1), fore: .55, upper: .95 }, R: { to: hand(1), fore: .55, upper: .95 } } });
    o.frontExtra = g(`translate(${hx} ${f(hy)}) rotate(${f(ang)})`, hourglassSVG(t < tFlip ? .3 : .3 + clamp(seg(t, tFlip + .8, D)) * .6, Math.min(glow, .15), t));
    world += flatGlow(930, GY + hy, 200 * (1 + Math.sin(t * 5) * .05) * (.6 + glow * .5), '#ffd66b', glow * .7);
    o.face = E(t, [[tC, 'surprise'], [lf(S, 1, .55), 'surprise'], [lf(S, 1, .78), 'joy'], [tD, 'smug'], [tFlip + .1, 'grin'], [tE + .3, 'surprise'], [tE + .8, 'fear']]);
    o.look = K(t, [[tC, [0, .6]], [lf(S, 1, .5), [0, .4]], [tD, [.5, -.2]], [tFlip, [0, -.2]], [tE + .2, [-.8, -.3]], [tE + .8, [0, 0]]]);
    const hyE = tt => K(tt, [[tE + .2, 0], [tE + .5, -70, eback], [tE + .9, 0, eback]]);
    o.headYaw = hyE(t); Object.assign(o, turnFX(t, hyE, 1));
    o.tilt = K(t, [[tC, 0], [lf(S, 1, .8), -6], [tD, 4], [tFlip, 0]]);
    let heroS = hero(o);
    const portalK = eout(seg(t, tE, tE + .6));
    if (portalK > 0) world += portalSVG(860, 560, 560 * portalK, t, portalK);
    const suck = ein(seg(t, tSuck, tSuck + 1.0)), stretch = Math.sin(seg(t, tSuck - .3, tSuck + .4) * Math.PI) * .2;
    if (suck > 0 || stretch > 0) heroS = g(`translate(${f(lerp(930, 860, suck))} ${f(lerp(700, 560, suck))}) rotate(${f(suck * 540 - stretch * 30)}) scale(${f((1 - suck * .97) * (1 + stretch))} ${f((1 - suck * .97) * (1 - stretch * .5))}) translate(-930 -700)`, heroS);
    world += shadow(930, GY + 4, 110 * (1 - suck)) + heroS;
    if (t > tFlip && t < tFlip + .8) for (let i = 0; i < 8; i++) { const k = seg(t, tFlip, tFlip + .8), a = i * 45; world += sparkle(930 + Math.cos(rad(a)) * (60 + k * 260), GY + hy + Math.sin(rad(a)) * (60 + k * 200), .7 * (1 - k), k * 200); }
    let z, cx, cy;
    if (shot === 'C') { z = K(t, [[tC, 2.0], [tD, 2.2]], esine); cx = 930; cy = K(t, [[tC, 440], [tC + 1.4, 400]]); }
    else if (shot === 'D') { z = K(t, [[tD, 1.45], [tE, 1.55]], esine); cx = 930; cy = 470; }
    else { z = K(t, [[tE, 1.12], [D, 1.22]], esine); cx = 900; cy = 560; }
    const [sx, sy] = shake(t, 9 * seg(t, tE, tE + .3) * (1 - seg(t, tSuck + .7, D)));
    let out = cam(world, cx + sx, cy + sy, z);
    const white = seg(t, tSuck + .55, tSuck + .9);
    if (white > 0) out += `<rect width="1920" height="1080" fill="#fffaf0" opacity="${f(white)}"/>`;
    return out + this.overlay(t, S);
  },
  overlay(t, S) { return t < .7 ? `<rect width="1920" height="1080" fill="#000" opacity="${f(1 - esine(t / .7))}"/>` : ''; },
  cues(S) { const L = S.L.map(l => l[0]); const tFind = lf(S, 0, .74), tFlip = L[2] + .7, tE = L[3] - .45, tSuck = L[3] + .5; return [[0, 'amb_attic', .5], [.2, 'steps', .35], [3.1, 'thud', .5], [4.5, 'creak', .5], [4.9, 'rummage', .4], [5.1, 'whoosh', .25], [5.9, 'whoosh', .25], [lf(S, 0, .6), 'whoosh', .25], [lf(S, 0, .6) + .9, 'squeak', .35], [tFind - .3, 'glint', .6], [L[1] - .2, 'shimmer', .6], [tFlip, 'whoosh', .5], [tFlip + .2, 'swell', .7], [tE, 'portal', .9], [tSuck, 'suck', .8], [tSuck + .7, 'boom', .7]]; },
};

// ---------------------------------------------------------------- SCENE: ARRIVAL
function lids(open) { const h = (1 - open) * 560; return `<path d="M0 0 L1920 0 L1920 ${f(h)} Q960 ${f(h + 160 * open)} 0 ${f(h)} Z" fill="#0b0705"/><path d="M0 1080 L1920 1080 L1920 ${f(1080 - h)} Q960 ${f(1080 - h - 160 * open)} 0 ${f(1080 - h)} Z" fill="#0b0705"/>`; }
SC.arrival = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur, tWide = lf(S, 1, .58);
    let out = '';
    if (t < tWide) {
      let pov = skyPOV(t);
      const faces = [
        { k: 'merchant', t0: L[1] + .1, a: [-300, 300], b: [500, 420], r: 50, face: 'anger', look: [.6, .5] },
        { k: 'woman', t0: L[1] + .5, a: [2200, 260], b: [1440, 380], r: -50, face: 'surprise', look: [-.6, .5] },
        { k: 'oldman', t0: L[1] + .9, a: [960, -400], b: [960, 200], r: 172, face: 'sad', look: [0, -.5] },
        { k: 'boy', t0: L[1] + 1.3, a: [2200, 900], b: [1500, 800], r: -28, face: 'joy', look: [-.6, -.3] },
      ];
      for (const fc of faces) {
        if (t < fc.t0) continue;
        const p = K(t, [[fc.t0, fc.a], [fc.t0 + 1.0, fc.b, eout5]]);
        const tilt = Math.sin(t * 1.4 + fc.r) * 4 + K(t, [[fc.t0 + .9, 8], [fc.t0 + 1.4, 0, eback]]);
        pov += g(T(p[0], p[1] + Math.sin(t * 1.5 + fc.r) * 6, 2.3, fc.r + tilt), headSVG(Object.assign({}, NPC[fc.k], { face: EMO[fc.face], look: fc.look, blink: blinkK(t, fc.r) })));
      }
      const blurAmt = Math.max(0, 14 * (1 - seg(t, .8, 3.2))) + Math.sin(clamp((t - 3.4) / .5) * Math.PI) * 8;
      if (blurAmt > .3) pov = `<defs><filter id="pblur"><feGaussianBlur stdDeviation="${f(blurAmt)}"/></filter></defs><g filter="url(#pblur)">${pov}</g>`;
      const openK = K(t, [[0, 0], [.8, 0], [1.6, .55], [2.2, .45], [3.1, 1], [3.4, 1], [3.55, .05], [3.75, 1], [tWide - .28, 1], [tWide, 0, ein]], esine);
      out += cam(pov, 960, 540, 1 + .04 * Math.sin(t * .6)) + lids(openK);
    }
    if (t > tWide) {
      let w = romeStreet(t, { px: 300 });
      const GY = 990;
      const crowd = [['woman', 400, 'surprise', -1], ['oldman', 640, 'sad', -1], ['boy', 1560, 'joy', 1], ['lady', 1760, 'surprise', 1]];
      for (const [k, x, fc, sd] of crowd) w += shadow(x, GY + 2, 90) + npc(k, { x, y: GY, s: .82, t, phase: x, yaw: sd * 30, face: EMO[fc], look: [-sd * .9, .4], blink: blinkK(t, x), tilt: Math.sin(t + x) * 3 });
      // merchant walks in (profile), stops, points and yells
      const tm = L[2] - .3, tStop = tm + 1.0;
      const mx = K(t, [[tm, 1460], [tStop, 1270, eout]]);
      const walking = t > tm && t < tStop, wc = walkCycle(walkPh(mx, 1460, .86), walking ? 1 - seg(t, tStop - .3, tStop) : 0);
      const yelling = t > tStop && t < lf(S, 2, .78);
      const pointK = eback(seg(t, tStop, tStop + .35));
      w += shadow(mx, GY + 2, 95) + npc('merchant', { x: mx, y: GY + wc.bob * .85, s: .86, t, yaw: K(t, [[tStop, -90], [tStop + .4, -45]]), legs: walking ? wc.legs : undefined, lean: yelling ? -6 + Math.sin(t * 10) * 2 : wc.lean, face: yelling ? mix(EMO.yell, EMO.anger, clamp(.5 - .5 * Math.sin(t * 17) * Math.sin(t * 5.3 + 1))) : EMO.anger, look: [-.9, .3], blink: blinkK(t, 3), headY: yelling ? Math.sin(t * 17) * 4 : 0, arms: t > tStop ? { L: { a: [lerp(-12, -88, pointK) + Math.sin(t * 12) * 4 * yelling, 0] }, R: { a: [30, -60] } } : wc.arms, hands: { L: t > tStop ? 'point' : 'fist' } });
      // hero: lying -> sits up -> looks around -> recoils -> thinks
      const tt = t - tWide, sit = eback(seg(tt, .6, 1.9));
      const hyA = T2 => K(T2, [[tWide + 1.9, 0], [tWide + 2.3, -55, eback], [tWide + 3.0, -55], [tWide + 3.4, 40, eback], [tStop - .2, 40], [tStop, 30]]) + Math.sin((T2 - tWide) * 18) * 14 * (1 - seg(T2 - tWide, 1.9, 2.5)) * seg(T2 - tWide, 1.5, 1.9);
      const recoil = eout(seg(t, tStop, tStop + .3)) * (1 - eio(seg(t, lf(S, 2, .78), lf(S, 2, .95))));
      const thinking = t > lf(S, 2, .82);
      const ho = {
        x: 960, s: .9, t, ground: false, yaw: lerp(60, 20, sit), legs: { L: [86, -4], R: [80, 2] }, lean: lerp(-84, -8, sit) - recoil * 14,
        arms: thinking ? { L: { a: [-30, 20] }, R: { to: [26, -628] } } : { L: { a: [lerp(-40, -34, sit), lerp(10, 26, sit)] }, R: { a: [lerp(150, 36, sit) + recoil * 60, lerp(0, 20, sit)] } },
        hands: thinking ? { R: 'thumb' } : {},
        face: E(t, [[tWide, 'dazed'], [tWide + 2.0, 'surprise'], [tWide + 2.6, 'neutral'], [tStop, 'fear'], [lf(S, 2, .82), 'think']]),
        headYaw: hyA(t),
        look: K(t, [[tWide + 2.0, [0, -.3]], [tWide + 2.4, [-.8, 0]], [tWide + 3.3, [.8, 0]], [lf(S, 2, .82), [.4, -.6]]]), ...turnFX(t, hyA, 2), wave: .4, capeLen: -190, idle: 0,
      };
      ho.y = GY - 4 + (345 - 40) * .9;
      w += shadow(1040, GY + 2, 170) + hero(ho);
      if (sit < .3) for (let i = 0; i < 3; i++) { const a = t * 3 + i * 2.1; w += sparkle(930 + Math.cos(a) * 90, 820 + Math.sin(a) * 26, .4, a * 40, .9); }
      if (yelling) { const k = pop(t, tStop, .4), [hx, hy] = shake(t, 4); w += g(T(1470 + hx, 330 + hy, k), `<path d="${smooth([[-230, -90], [230, -95], [250, 60], [40, 70], [10, 140], [-20, 70], [-240, 64]], true, .25)}" fill="#fff" ${ink(5)}/>` + text('QUID FACIS?!', 0, -10, { size: 86, fill: '#a8322d' })); }
      const z = K(t, [[tWide, 1.35], [tWide + 3, 1.15], [D, 1.1]], esine);
      let wide = cam(w, 1030, K(t, [[tWide, 690], [tWide + 3, 650]]), z) + label('LATIN', 960, 130, t, lf(S, 2, .84), { size: 120 }) + label('(the language of Rome)', 960, 225, t, lf(S, 2, .9), { size: 52, fill: '#5d4a3a', sw: 8 });
      out = wide + (t < tWide + .4 ? lids(esine(seg(t, tWide + .05, tWide + .4))) : '');
    }
    if (t < .5) out += `<rect width="1920" height="1080" fill="#fffaf0" opacity="${f(1 - esine(t / .5))}"/>`;
    return out;
  },
  cues(S) { const L = S.L.map(l => l[0]); const tWide = lf(S, 1, .58), tm = L[2] - .3; return [[0, 'heartbeat', .6], [1.2, 'city', .5], [3.4, 'blink', .3], [L[1] + .1, 'murmur', .5], [tWide, 'whoosh', .25], [tm, 'steps', .4], [tm + 1.0, 'shout', .7], [lf(S, 2, .84), 'pop', .4]]; },
};

// ---------------------------------------------------------------- SCENE: TITLE
function titleCard(t, t0) {
  const k = eback(seg(t, t0, t0 + .7)), a = fadeI(t, t0, .25);
  let s = `<rect width="1920" height="1080" fill="#2a1a10" opacity="${f(.4 * a)}"/>`;
  let c = `<path d="M-760 -150 L760 -150 L800 -60 L760 30 L-760 30 L-800 -60 Z" fill="#8f2a26" ${ink(7)}/><path d="M-736 -128 L736 -128 L770 -60 L736 8 L-736 8 L-770 -60 Z" fill="none" stroke="#e8c26a" stroke-width="6"/>`;
  c += text('WHAT IF YOU WOKE UP', 0, -64, { size: 112, fill: '#fff6dc', stroke: '#4a1410', sw: 10, ls: 3 }) + text('IN ANCIENT ROME?', 0, 120, { size: 160, fill: '#e8c26a', stroke: '#3a1c0a', sw: 16, ls: 4 });
  const leaf = (x, side) => { let l = ''; for (let i = 0; i < 7; i++) { const an = rad(110 + i * 22), cx = x + Math.cos(an * side) * 120 * side, cy = 40 + Math.sin(an) * 120; l += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="34" ry="13" fill="#7f9a4a" ${ink(3.5)} transform="rotate(${f((110 + i * 22 + 90) * side)} ${f(cx)} ${f(cy)})"/>`; } return l; };
  c += leaf(-860, 1) + leaf(860, -1);
  s += g(T(960, 500, k * .92), c, `opacity="${f(a)}"`);
  for (let i = 0; i < 8; i++) { const tt = t - t0 - .4 - i * .12; if (tt > 0 && tt < 1.2) s += sparkle(200 + rnd(i) * 1520, 260 + rnd(i + 5) * 500, .8 * Math.sin(tt / 1.2 * Math.PI), tt * 90); }
  return s;
}
SC.title = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur, GY = 1000;
    let w = romeStreet(t, { px: 150 + t * 12 });
    const walkers = [['worker', -200, 80, .78, 90], ['lady', 2150, -64, .8, -90], ['soldier', -560, 90, .8, 90], ['oldman', 2350, -50, .8, -90], ['boy', -950, 120, .8, 90]];
    walkers.forEach(([k, x0, v, sc, yaw], i) => {
      const x = x0 + v * t, wc = walkCycle(walkPh(x, x0, sc, .9) + i, .9);
      if (x > -200 && x < 2150) w += shadow(x, GY - 20, 80) + npc(k, { x, y: GY - 22 + wc.bob * sc, s: sc, yaw, t, legs: wc.legs, arms: wc.arms, lean: wc.lean, face: EMO.neutral, blink: blinkK(t, i), phase: i });
    });
    // hero: gets up from sitting, looks around in awe, then checks the hourglass
    const up = eio(seg(t, .2, 1.3)), hop = Math.sin(seg(t, 1.2, 1.6) * Math.PI);
    const tLost = L[1], tShake = lf(S, 1, .3);
    const ho = { x: 960, s: 1.05, t, ground: false, wave: 1.1, wind: [-20, 0], capeLen: lerp(-190, 0, eio(seg(t, .2, 1.1))) };
    ho.legs = { L: [lerp(86, -6, up), lerp(-4, 2, up) + Math.sin(up * Math.PI) * -60], R: [lerp(80, 6, up), lerp(2, -2, up) - Math.sin(up * Math.PI) * 30] };
    ho.y = lerp(GY - 4 + 305 * 1.05 * .86, GY + 6, up) - hop * 30;
    ho.lean = lerp(-8, 0, up) + Math.sin(up * Math.PI) * 18;
    const yawT = tt => K(tt, [[1.6, 15], [lf(S, 0, .2), -60, eback], [lf(S, 0, .45), 60, eback], [lf(S, 0, .7), 0, eback]]);
    ho.yaw = yawT(t); Object.assign(ho, turnFX(t, yawT, 5)); ho.idle = up;
    ho.face = E(t, [[0, 'dazed'], [1.4, 'surprise'], [lf(S, 0, .45), 'joy'], [tLost, 'neutral'], [tShake, 'think'], [lf(S, 1, .75), 'sad']]);
    ho.look = K(t, [[1.6, [0, -.3]], [lf(S, 0, .45), [0, -.2]], [lf(S, 0, .7), [0, 0]], [tLost + .3, [.4, .3]]]);
    const shk = t > tShake && t < lf(S, 1, .8) ? Math.sin(t * 26) * 16 : 0;
    if (t < tLost) ho.arms = { L: { a: [K(t, [[lf(S, 0, .4), -12], [lf(S, 0, .5), -150]]), K(t, [[lf(S, 0, .4), 4], [lf(S, 0, .5), -10]])] }, R: { a: [K(t, [[lf(S, 0, .4), 12], [lf(S, 0, .5), 150]]), K(t, [[lf(S, 0, .4), -4], [lf(S, 0, .5), 10]])] } };
    else { const hp = K(t, [[tLost, [80, -420]], [tLost + .5, [60, -470]]]); ho.arms = { L: { a: [-12, 4] }, R: { to: [hp[0] + shk * .4, hp[1] + shk] } }; ho.frontExtra = g(`translate(${f(hp[0] + 34 + shk * .4)} ${f(hp[1] - 30 + shk)}) rotate(${f(shk * .8)}) scale(.62)`, hourglassSVG(1, 0, t)); }
    if (t > lf(S, 1, .75)) ho.lean = Math.sin(seg(t, lf(S, 1, .75), lf(S, 1, 1)) * Math.PI) * 6;
    w += shadow(960, GY + 8, 130) + hero(ho);
    const z = K(t, [[0, 1.8], [1.6, 1.6], [lf(S, 0, .45), 1.0], [tLost, 1.0], [tLost + 1.0, 1.35]], eio);
    const cy = K(t, [[0, 560], [1.6, 520], [lf(S, 0, .45), 540], [tLost, 540], [tLost + 1, 540]]);
    let out = cam(w, 960, cy, z);
    out += op(fadeIO(t, 0, S.L[1][0] + .2, .3), label('ROMA', 480, 200, t, lf(S, 0, .45), { size: 150, fill: '#a8322d', rot: -5 }) + label('100 AD', 1440, 200, t, lf(S, 0, .82), { size: 130, rot: 4 }));
    if (shk) out += text('*shake shake*', 1320, 470, { size: 50, fill: '#5d4a3a', rot: -10, sw: 8 });
    const tCard = S.L[1][1] + .3;
    if (t > tCard) out += titleCard(t, tCard);
    if (t < .5) out += `<rect width="1920" height="1080" fill="${PAL.bg}" opacity="${f(1 - esine(t / .5))}"/>`;
    if (t > D - .6) out += `<rect width="1920" height="1080" fill="#000" opacity="${f(esine(seg(t, D - .6, D)))}"/>`;
    return out;
  },
  cues(S) { const L = S.L.map(l => l[0]); return [[0, 'city', .55], [1.2, 'thud', .35], [lf(S, 0, .45), 'stamp', .5], [lf(S, 0, .82), 'stamp', .5], [lf(S, 1, .3), 'rattle', .5], [S.L[1][1] + .3, 'fanfare', .9]]; },
};

// ---------------------------------------------------------------- composition
let TL = null;
window.setTimeline = tl => { TL = tl; };
window.allCues = () => { const out = []; TL.forEach(sc => { if (!SC[sc.id]) return; SC[sc.id].cues({ dur: sc.dur, L: sc.lines }).forEach(c => out.push([+(sc.start + c[0]).toFixed(3), c[1], c[2], sc.id])); }); return out; };
window.frameSVG = (T0) => {
  UID = 0;
  let sc = TL[TL.length - 1];
  for (const x of TL) if (T0 >= x.start && T0 < x.start + x.dur) { sc = x; break; }
  if (!SC[sc.id]) return text('[ ' + sc.id + ' ]', 960, 540, { size: 80 });
  const t = T0 - sc.start; CAMT = T0;
  return DEFS + SC[sc.id].draw(t, { dur: sc.dur, L: sc.lines }) + `<image href="../assets/paper.jpg" x="0" y="0" width="1920" height="1080" opacity=".28" style="mix-blend-mode:multiply"/>`;
};

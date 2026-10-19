// v2 drawing + animation library: smooth curves, parametric face, keyframed poses.
const W = 1920, H = 1080;
const C = {
  ink: '#1d1a17', inkSoft: '#2b241f',
  skin: '#ffffff', skinSh: '#ece8e2',
  hair: '#4a2e1d', hairTop: '#5c3b27', hairDark: '#2a180d', hairHi: '#76503a',
  tunic: '#f4eee2', tunicSh: '#d9d0c0', tunicFold: '#c9bfae',
  cape: '#6c2a27', capeHi: '#86393a', capeSh: '#4a1a19',
  belt: '#7a5232', beltSh: '#5b3b22', boot: '#80573a', bootHi: '#9a6c4a', bootSh: '#5e3d26',
  bronze: '#b58d45', bronzeHi: '#dcbc74', bronzeSh: '#8a6a2e',
  steel: '#c9cdd2', steelSh: '#959ba3', red: '#a8322d', gold: '#e8c26a',
  wood: '#8a5a34', woodHi: '#a8754a', woodSh: '#5f3c22', mouth: '#3a1814', tongue: '#b8625a',
};
const LW = 5.5;

// ---------------------------------------------------------------- math / easing
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const esine = k => -(Math.cos(Math.PI * k) - 1) / 2;
const eout = k => 1 - Math.pow(1 - k, 3);
const eout5 = k => 1 - Math.pow(1 - k, 5);
const ein = k => k * k * k;
const eback = k => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const rad = d => d * Math.PI / 180;
const f = n => Math.round(n * 10) / 10;
const rnd = n => { const s = Math.sin(n * 91.345 + 47.853) * 43758.5453; return s - Math.floor(s); };
const noise1 = x => { const i = Math.floor(x), fr = x - i, h = n => rnd(n * 1.37 + 3.1); const u = fr * fr * (3 - 2 * fr); return lerp(h(i), h(i + 1), u) * 2 - 1; };
const pop = (t, t0, d = .45) => eback(seg(t, t0, t0 + d));
const fadeI = (t, t0, d = .4) => esine(seg(t, t0, t0 + d));
const fadeIO = (t, a, b, d = .4) => Math.min(fadeI(t, a, d), 1 - esine(seg(t, b - d, b)));

// mix any value: numbers, arrays, objects (recursive)
function mix(a, b, k) {
  if (a === undefined) return b; if (b === undefined) return a;
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * k;
  if (Array.isArray(a) && Array.isArray(b)) return a.map((v, i) => mix(v, b[i], k));
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const o = {}; for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) o[key] = mix(a[key], b[key], k); return o;
  }
  return k < .5 ? a : b;
}
// keyframes: [[t, value, ease?], ...] -> smooth interpolation, holds at ends
function K(t, keys, ease = eio) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, v0] = keys[i], [t1, v1, e] = keys[i + 1];
    if (t < t1) return mix(v0, v1, (e || ease)((t - t0) / (t1 - t0)));
  }
  return keys[keys.length - 1][1];
}
// state changes: [[t, value], ...]; each change blends in over d seconds
function S(t, list, d = .3, ease = eio) {
  let i = -1; for (let j = 0; j < list.length; j++) if (t >= list[j][0]) i = j;
  if (i < 0) return list[0][1];
  const dd = list[i][2] || d;
  if (i > 0 && t < list[i][0] + dd) return mix(list[i - 1][1], list[i][1], ease((t - list[i][0]) / dd));
  return list[i][1];
}

// ---------------------------------------------------------------- svg helpers
let UID = 0; const uid = p => `${p}${++UID}`;
const g = (tr, inner, extra = '') => `<g transform="${tr}" ${extra}>${inner}</g>`;
const T = (x, y, s = 1, r = 0) => `translate(${f(x)} ${f(y)}) rotate(${f(r)}) scale(${f(s * 1000) / 1000})`;
const ink = (w = LW, c = C.ink) => `stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const P = pts => pts.map(p => f(p[0]) + ' ' + f(p[1])).join(' ');
// smooth closed/open curve through points (Catmull-Rom -> cubic)
function smooth(pts, closed = true, tension = .5) {
  const n = pts.length; if (n < 2) return '';
  const get = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) * tension / 3, p1[1] + (p2[1] - p0[1]) * tension / 3];
    const c2 = [p2[0] - (p3[0] - p1[0]) * tension / 3, p2[1] - (p3[1] - p1[1]) * tension / 3];
    d += ` C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + (closed ? ' Z' : '');
}
// tuft path: alternating valley/tip points joined by bent quadratic curves
function tufts(pts, bendOut = .16, bendIn = -.1) {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
    const nx = dy / L, ny = -dx / L, k = (a[2] === 'v' ? bendOut : bendIn) * L;
    d += ` Q${f((a[0] + b[0]) / 2 + nx * k)} ${f((a[1] + b[1]) / 2 + ny * k)} ${f(b[0])} ${f(b[1])}`;
  }
  return d + ' Z';
}
function text(str, x, y, o = {}) {
  const p = Object.assign({ size: 80, fill: C.ink, font: 'Gochi Hand', anchor: 'middle', stroke: '#fbf8f1', sw: 0, rot: 0, s: 1, op: 1, ls: 0 }, o);
  const st = p.sw ? `stroke="${p.stroke}" stroke-width="${p.sw}" paint-order="stroke" stroke-linejoin="round"` : '';
  return `<g transform="${T(x, y, p.s, p.rot)}" opacity="${f(p.op * 100) / 100}"><text x="0" y="0" font-family="${p.font}" font-size="${p.size}" fill="${p.fill}" text-anchor="${p.anchor}" dominant-baseline="middle" letter-spacing="${p.ls}" ${st}>${str}</text></g>`;
}

// ---------------------------------------------------------------- FACE
const FACE = {
  neutral: { eye: 1, happy: 0, wide: 0, squeeze: 0, bL: [0, 0, 0], bR: [0, 0, 0], m: { w: 22, smile: .35, open: 0, skew: 0, teeth: 0 } },
  smile: { eye: 1, happy: 0, wide: 0, squeeze: 0, bL: [-2, -4, 0], bR: [-2, -4, 0], m: { w: 30, smile: 1, open: 0, skew: 0, teeth: 0 } },
  grin: { eye: 1, happy: 0, wide: 0, squeeze: 0, bL: [-4, -6, 0], bR: [-4, -6, 0], m: { w: 40, smile: 1, open: .7, skew: 0, teeth: 0 } },
  joy: { eye: 1, happy: 1, wide: 0, squeeze: 0, bL: [-8, -6, 0], bR: [-8, -6, 0], m: { w: 42, smile: 1, open: .8, skew: 0, teeth: 0 } },
  smug: { eye: 1, happy: 0, wide: 0, squeeze: 0, bL: [-10, -8, 0], bR: [4, 16, 1], m: { w: 40, smile: .9, open: .6, skew: .55, teeth: 0 } },
  smirk: { eye: 1, happy: 0, wide: 0, squeeze: 0, bL: [-6, -6, 0], bR: [2, 10, 0], m: { w: 28, smile: .7, open: 0, skew: .8, teeth: 0 } },
  curious: { eye: 1, happy: 0, wide: 0, squeeze: 0, bL: [-12, -4, 0], bR: [-2, 4, 0], m: { w: 14, smile: .2, open: .25, skew: 0, teeth: 0 } },
  surprised: { eye: 1, happy: 0, wide: 1, squeeze: 0, bL: [-16, 0, 0], bR: [-16, 0, 0], m: { w: 13, smile: 0, open: .85, skew: 0, teeth: 0 } },
  worried: { eye: 1, happy: 0, wide: 0, squeeze: 0, bL: [-8, -16, 0], bR: [-8, -16, 0], m: { w: 22, smile: -.6, open: .12, skew: 0, teeth: 0 } },
  scared: { eye: 1, happy: 0, wide: 1, squeeze: 0, bL: [-12, -18, 0], bR: [-12, -18, 0], m: { w: 30, smile: -.7, open: .5, skew: 0, teeth: .9 } },
  angry: { eye: 1, happy: 0, wide: 0, squeeze: 0, bL: [4, 20, 1], bR: [4, 20, 1], m: { w: 26, smile: -.7, open: 0, skew: 0, teeth: 0 } },
  yell: { eye: 1, happy: 0, wide: 0, squeeze: 0, bL: [4, 22, 1], bR: [4, 22, 1], m: { w: 34, smile: -.3, open: .9, skew: 0, teeth: 0 } },
  disgust: { eye: .55, happy: 0, wide: 0, squeeze: 0, bL: [2, 12, 0], bR: [-6, -8, 0], m: { w: 26, smile: -.8, open: .15, skew: -.6, teeth: 0 } },
  grimace: { eye: 1, happy: 0, wide: 0, squeeze: 1, bL: [2, -14, 0], bR: [2, -14, 0], m: { w: 34, smile: -.2, open: .4, skew: 0, teeth: 1 } },
  sleepy: { eye: 0, happy: 0, wide: 0, squeeze: 0, bL: [2, 0, 0], bR: [2, 0, 0], m: { w: 16, smile: .1, open: 0, skew: 0, teeth: 0 } },
  dazed: { eye: .45, happy: 0, wide: 0, squeeze: 0, bL: [-4, -8, 0], bR: [2, 6, 0], m: { w: 20, smile: -.2, open: .25, skew: .3, teeth: 0 } },
  uhoh: { eye: 1, happy: 0, wide: .6, squeeze: 0, bL: [-12, -16, 0], bR: [-12, -16, 0], m: { w: 30, smile: -.5, open: .2, skew: .2, teeth: .8 } },
  talk: { eye: 1, happy: 0, wide: 0, squeeze: 0, bL: [-2, -2, 0], bR: [-2, -2, 0], m: { w: 26, smile: .4, open: .45, skew: 0, teeth: 0 } },
};

function brow(side, b) { // b = [raiseY, tilt(+ = inner down), crease]
  const [ry, tilt] = b, cx = side * 40, cy = -30 + ry;
  const half = 21;
  const a = rad(tilt) * side * -1; // rotate so inner end (toward center) goes down when tilt>0
  const pt = (u, v) => { const x = u * half, y = v; return [cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)]; };
  // tapered crescent: thick in the middle
  const top = [pt(-1, 1), pt(-.5, -7), pt(0, -9), pt(.5, -7.5), pt(1, 0)];
  const bot = [pt(1, 1.5), pt(.5, 1.2), pt(0, 1), pt(-.5, 2.2), pt(-1, 2.2)];
  let s = `<path d="${smooth(top.concat(bot), true, .4)}" fill="${C.ink}"/>`;
  if (b[2] > .3) { const c = pt(side < 0 ? 1.1 : -1.1, -2); s += `<path d="M${f(c[0])} ${f(c[1] - 12)} q${-side * 3} 6 0 12" fill="none" ${ink(3)} opacity="${f(b[2])}"/>`; }
  return s;
}
function eyesSVG(F, look, blink) {
  const open = clamp(F.eye * (1 - blink));
  const lx = look[0] * 9, ly = look[1] * 6;
  let s = '';
  for (const side of [-1, 1]) {
    const cx = side * 40 + lx, cy = 8 + ly;
    const solid = 1 - clamp(Math.max(F.happy, F.squeeze, F.wide) * 2);
    const wk = clamp(F.wide * 2 - .3), hk = clamp(F.happy * 2 - .3), qk = clamp(F.squeeze * 2 - .3);
    if (solid > .01) {
      if (open > .12) s += `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="10.5" ry="${f(15 * open)}" fill="${C.ink}" opacity="${f(solid)}"/>`;
      else s += `<path d="M${f(cx - 11)} ${f(cy + 2)} Q${f(cx)} ${f(cy + 5)} ${f(cx + 11)} ${f(cy + 2)}" fill="none" ${ink(5)} opacity="${f(solid)}"/>`;
    }
    if (hk > .01) s += `<path d="M${f(cx - 12)} ${f(cy + 5)} Q${f(cx)} ${f(cy - 14)} ${f(cx + 12)} ${f(cy + 5)}" fill="none" ${ink(5.5)} opacity="${f(hk)}"/>`;
    if (qk > .01) s += `<path d="M${f(cx - 11 * side)} ${f(cy - 10)} L${f(cx + 9 * side)} ${f(cy)} L${f(cx - 11 * side)} ${f(cy + 10)}" fill="none" ${ink(5.5)} opacity="${f(qk)}"/>`;
    if (wk > .01) { const r = 15 * Math.max(.2, open); s += `<g opacity="${f(wk)}"><ellipse cx="${f(cx)}" cy="${f(cy)}" rx="15" ry="${f(r * 1.1)}" fill="#fff" ${ink(3.5)}/><circle cx="${f(cx + lx * .25)}" cy="${f(cy + ly * .25)}" r="${f(6.5 * Math.min(1, open * 1.5))}" fill="${C.ink}"/></g>`; }
  }
  return s;
}
function mouthSVG(m, look) {
  const mx = look[0] * 7, my = 42 + look[1] * 4;
  const w = m.w, sm = m.smile, op = m.open, sk = m.skew;
  const cL = [-w, -sm * 11 - sk * 9], cR = [w, -sm * 11 + sk * 9];
  const u0 = sm * (9 - 7 * clamp(op * 1.4)) + sk * 0;
  const lo = u0 + op * 34 + Math.max(0, sm) * op * 6;
  const qy = (a, mid, b, u) => { const k = (u + 1) / 2; return (1 - k) * (1 - k) * a + 2 * (1 - k) * k * mid + k * k * b; };
  // control so curve passes through mid at u=0: c = 2*mid - (a+b)/2
  const ctrlU = 2 * u0 - (cL[1] + cR[1]) / 2;
  const tr = `translate(${f(mx)} ${f(my)})`;
  if (op < .06) return `<path transform="${tr}" d="M${f(cL[0])} ${f(cL[1])} Q0 ${f(ctrlU)} ${f(cR[0])} ${f(cR[1])}" fill="none" ${ink(5.5)}/>`;
  const up = (cL[1] + cR[1]) / 2 + (u0 - (cL[1] + cR[1]) / 2) * 1.33;
  const d = `M${f(cL[0])} ${f(cL[1])} C${f(-w * .45)} ${f(up)} ${f(w * .45)} ${f(up)} ${f(cR[0])} ${f(cR[1])} C${f(w * .9)} ${f(lo * 1.3)} ${f(-w * .9)} ${f(lo * 1.3)} ${f(cL[0])} ${f(cL[1])} Z`;
  const id = uid('mc');
  let s = `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${C.mouth}"/>`;
  s += `<g clip-path="url(#${id})">`;
  s += `<ellipse cx="${f(w * .18)}" cy="${f(lo * .95)}" rx="${f(w * .5)}" ry="${f(5 + op * 11)}" fill="${C.tongue}"/>`;
  if (m.teeth > .01) s += `<rect x="${f(-w)}" y="${f(Math.min(cL[1], cR[1]) - 12)}" width="${f(2 * w)}" height="${f(u0 - Math.min(cL[1], cR[1]) + 12 + op * 14)}" fill="#fff" opacity="${f(m.teeth)}"/>`;
  s += `</g><path d="${d}" fill="none" ${ink(5)}/>`;
  return `<g transform="${tr}">${s}</g>`;
}

// ---------------------------------------------------------------- HAIR STYLES (units: head R = 100)
const HERO_HAIR = [
  [-97, -36, 'v'], [-132, -70, 't'], [-104, -86, 'v'], [-130, -124, 't'], [-90, -118, 'v'], [-104, -160, 't'], [-64, -138, 'v'],
  [-56, -182, 't'], [-28, -148, 'v'], [-2, -186, 't'], [16, -152, 'v'], [50, -180, 't'], [56, -144, 'v'], [100, -156, 't'],
  [92, -120, 'v'], [138, -116, 't'], [110, -90, 'v'], [142, -60, 't'], [112, -58, 'v'], [128, 4, 't'], [100, -30, 'v'],
  [88, -56, 'v'], [72, -34, 't'], [60, -72, 'v'], [44, -52, 't'], [32, -84, 'v'], [14, -58, 't'], [-2, -88, 'v'],
  [-18, -62, 't'], [-34, -88, 'v'], [-52, -54, 't'], [-62, -84, 'v'], [-82, -44, 't'], [-88, -70, 'v'], [-104, -14, 't'],
];
// inner lock edges (curved, follow the tufts)
const HERO_STRANDS = [
  [[-70, -100], [-92, -112], [-112, -118]], [[-40, -110], [-52, -140], [-50, -170]], [[0, -118], [2, -150], [0, -176]],
  [[36, -112], [46, -146], [48, -170]], [[66, -100], [90, -122], [96, -148]], [[88, -76], [116, -84], [132, -108]],
  [[96, -46], [112, -36], [120, -10]], [[-20, -100], [-14, -80], [-16, -66]], [[30, -104], [36, -80], [42, -56]], [[-60, -96], [-70, -70], [-80, -48]],
];
function hairHero(col) {
  let s = '<g transform="translate(0 -6) scale(1 .9)">';
  s += `<path d="${tufts(HERO_HAIR, .2, -.05)}" fill="${col.base}" ${ink(LW * 1.15)}/>`;
  for (const st of HERO_STRANDS.slice(0, 8)) s += `<path d="M${P([st[0]])} Q${P([st[1]])} ${P([st[2]])}" fill="none" stroke="${col.dark}" stroke-width="3.4" stroke-linecap="round" opacity=".65"/>`;
  s += `<path d="M-44 -136 Q-30 -150 -12 -158 M30 -146 Q44 -150 58 -156 M-96 -98 Q-104 -104 -112 -110" fill="none" stroke="${col.hi}" stroke-width="4.5" stroke-linecap="round" opacity=".55"/>`;
  return s + '</g>';
}
function hairGeneric(style, col) {
  let s = '';
  if (style === 'short') {
    const pts = [[-96, -20, 'v'], [-108, -60, 't'], [-90, -78, 'v'], [-96, -112, 't'], [-62, -112, 'v'], [-50, -138, 't'], [-20, -122, 'v'], [8, -142, 't'], [26, -120, 'v'], [58, -134, 't'], [66, -108, 'v'], [98, -110, 't'], [92, -80, 'v'], [110, -48, 't'], [96, -26, 'v'], [80, -56, 'v'], [50, -48, 't'], [36, -70, 'v'], [10, -52, 't'], [-6, -74, 'v'], [-34, -52, 't'], [-50, -74, 'v'], [-80, -50, 't']];
    s += `<path d="${tufts(pts, .14, -.06)}" fill="${col.base}" ${ink()}/>`;
  } else if (style === 'curly') {
    let d = ''; const n = 13;
    for (let i = 0; i < n; i++) { const a = rad(195 + i * 150 / (n - 1)); d += `<circle cx="${f(Math.cos(a) * 92)}" cy="${f(Math.sin(a) * 92 - 6)}" r="28" fill="${col.base}" ${ink(LW)}/>`; }
    s += d + `<path d="M-92 -10 Q-96 -80 -40 -108 Q0 -120 40 -108 Q96 -80 92 -10 Q60 -50 0 -56 Q-60 -50 -92 -10 Z" fill="${col.base}"/>`;
  } else if (style === 'bald') {
    s += `<path d="M-98 -6 Q-104 -40 -88 -54 Q-80 -30 -84 0 Z M98 -6 Q104 -40 88 -54 Q80 -30 84 0 Z" fill="${col.base}" ${ink(4)}/>`;
    s += `<path d="M-40 -84 Q-10 -96 20 -90" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".0"/>`;
  } else if (style === 'bun' || style === 'long') {
    if (style === 'bun') s += `<circle cx="0" cy="-118" r="40" fill="${col.base}" ${ink()}/><path d="M-26 -126 Q0 -146 26 -126" fill="none" stroke="${col.dark}" stroke-width="3"/>`;
    if (style === 'long') s += `<path d="M-96 -40 Q-130 60 -110 170 Q-80 180 -66 150 Q-80 60 -70 -10 Z M96 -40 Q130 60 110 170 Q80 180 66 150 Q80 60 70 -10 Z" fill="${col.base}" ${ink()}/>`;
    s += `<path d="M-98 -6 Q-110 -110 0 -104 Q110 -110 98 -6 Q86 -40 60 -58 Q20 -48 0 -70 Q-20 -48 -60 -58 Q-86 -40 -98 -6 Z" fill="${col.base}" ${ink()}/>`;
    s += `<path d="M0 -100 Q4 -84 0 -70" fill="none" stroke="${col.dark}" stroke-width="3"/><path d="M-50 -88 Q-30 -96 -12 -94 M14 -94 Q34 -96 52 -88" fill="none" stroke="${col.dark}" stroke-width="3" opacity=".7"/>`;
  } else if (style === 'wreath') {
    s += hairGeneric('short', col);
    for (let i = 0; i < 9; i++) { const a = rad(200 + i * 17.5); s += `<ellipse cx="${f(Math.cos(a) * 96)}" cy="${f(Math.sin(a) * 96 - 4)}" rx="16" ry="7" fill="#7f9a4a" ${ink(3)} transform="rotate(${f(200 + i * 17.5 + 60)} ${f(Math.cos(a) * 96)} ${f(Math.sin(a) * 96 - 4)})"/>`; }
  }
  return s;
}
const HAIRCOL = {
  hero: { base: C.hair, top: C.hairTop, dark: C.hairDark, hi: C.hairHi },
  black: { base: '#2a2422', top: '#3a3230', dark: '#121010', hi: '#58504c' },
  blond: { base: '#c9984f', top: '#d9ab62', dark: '#8e6630', hi: '#ebc888' },
  grey: { base: '#a9a5a0', top: '#bdb9b4', dark: '#77736e', hi: '#d6d3cf' },
  red: { base: '#9a4a2a', top: '#ae5a36', dark: '#5e2a14', hi: '#c97a52' },
  brown: { base: '#6b4a32', top: '#7c583e', dark: '#3e2818', hi: '#957058' },
};

// ---------------------------------------------------------------- HEAD
function headSVG(o) {
  const F = o.face || FACE.neutral, look = o.look || [0, 0];
  const R = 100;
  let s = '';
  if (o.hairStyle === 'long') s += hairGeneric('long', o.hairCol || HAIRCOL.brown);
  s += `<ellipse cx="0" cy="0" rx="${R}" ry="${R * .97}" fill="${C.skin}" ${ink(LW * 1.1)}/>`;
  s += `<path d="M-84 42 Q-60 88 0 94 Q-50 80 -72 40 Z" fill="${C.skinSh}" opacity=".9"/>`;
  if (o.blush) s += `<ellipse cx="-58" cy="36" rx="17" ry="9" fill="#f1a9a0" opacity="${f(o.blush)}"/><ellipse cx="58" cy="36" rx="17" ry="9" fill="#f1a9a0" opacity="${f(o.blush)}"/>`;
  s += eyesSVG(F, look, o.blink || 0);
  s += brow(-1, F.bL) + brow(1, F.bR);
  s += mouthSVG(F.m, look);
  if (o.beard) s += `<path d="M-86 30 Q-80 110 0 118 Q80 110 86 30 Q60 70 30 76 Q0 66 -30 76 Q-60 70 -86 30 Z" fill="${(o.hairCol || HAIRCOL.black).base}" ${ink(4)}/>` + mouthSVG(F.m, look);
  if (o.mustache) s += `<path d="M-34 40 Q-16 28 0 36 Q16 28 34 40 Q16 48 0 42 Q-16 48 -34 40 Z" fill="${(o.hairCol || HAIRCOL.black).base}" ${ink(2.5)}/>`;
  const hs = o.hairStyle || 'hero';
  if (o.helmet) s += helmetSVG(o.crest);
  else if (hs === 'hero') s += hairHero(o.hairCol || HAIRCOL.hero);
  else if (hs !== 'long') s += hairGeneric(hs, o.hairCol || HAIRCOL.black);
  else s += hairGeneric('bun', o.hairCol || HAIRCOL.brown).replace(/<circle[^>]*\/>/, '');
  if (o.sweat) s += `<path d="M96 -40 Q110 -16 103 -4 Q90 2 86 -12 Q86 -24 96 -40 Z" fill="#9fd0ef" ${ink(3)} opacity="${f(clamp(o.sweat))}"/>`;
  return s;
}
function helmetSVG(crest) {
  let s = '';
  if (crest) s += `<path d="M-30 -110 Q0 -190 30 -110 Z" fill="${C.red}" ${ink(4)}/>`;
  s += `<path d="M-112 18 Q-124 30 -128 10 Q-122 -2 -106 -4 Z M112 18 Q124 30 128 10 Q122 -2 106 -4 Z" fill="${C.steel}" ${ink(4.5)}/>`;
  s += `<path d="M-106 -2 Q-114 -134 0 -136 Q114 -134 106 -2 Q60 -20 0 -20 Q-60 -20 -106 -2 Z" fill="${C.steel}" ${ink(LW)}/>`;
  s += `<path d="M-64 -104 Q-30 -124 14 -122" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".55"/>`;
  s += `<path d="M-108 -10 Q0 -42 108 -10 L110 6 Q0 -26 -110 6 Z" fill="${C.bronze}" ${ink(4)}/>`;
  s += `<path d="M-104 0 L-78 2 Q-74 42 -88 70 Q-102 58 -106 32 Z M104 0 L78 2 Q74 42 88 70 Q102 58 106 32 Z" fill="${C.bronze}" ${ink(4.5)}/>`;
  return s;
}

// ---------------------------------------------------------------- BODY
// limb: two-bone forward kinematics. angles in degrees, 0 = straight down, + toward +x
function fk(o, a1, a2, l1, l2) {
  const e = [o[0] + Math.sin(rad(a1)) * l1, o[1] + Math.cos(rad(a1)) * l1];
  return [e, [e[0] + Math.sin(rad(a1 + a2)) * l2, e[1] + Math.cos(rad(a1 + a2)) * l2]];
}
// two-bone IK: returns [a1, a2] reaching target; bend = +1/-1 elbow side
function ik(o, tgt, l1, l2, bend = 1) {
  let dx = tgt[0] - o[0], dy = tgt[1] - o[1]; let d = Math.hypot(dx, dy);
  d = clamp(d, Math.abs(l1 - l2) + .01, l1 + l2 - .01);
  const base = Math.atan2(dx, dy); // angle from down
  const cosA = (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d);
  const A = Math.acos(clamp(cosA, -1, 1));
  const a1 = base + bend * A;
  const cosB = (l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2);
  const a2 = -bend * (Math.PI - Math.acos(clamp(cosB, -1, 1)));
  return [a1 * 180 / Math.PI, a2 * 180 / Math.PI];
}
const HIP = -205, SHO = [[-74, -362], [74, -362]], UA = 72, FA = 68, TH = 88, SH = 87;

function bootSVG(x, y, ang, dir, o) {
  return g(`translate(${f(x)} ${f(y)}) rotate(${f(-ang)}) scale(${dir} 1)`,
    `<path d="M-19 -58 L19 -58 Q22 -20 20 6 Q44 6 50 18 Q54 30 40 31 L-22 31 Q-26 0 -19 -58 Z" fill="${o.bootCol || C.boot}" ${ink(LW * .9)}/>` +
    `<path d="M10 -50 Q14 -10 12 8 Q30 10 40 20" fill="none" stroke="${C.bootHi}" stroke-width="5" opacity=".45" stroke-linecap="round"/>` +
    `<path d="M-21 25 L48 25 Q50 31 40 31 L-22 31 Z" fill="${C.bootSh}"/>` +
    `<path d="M-23 -64 Q0 -70 23 -64 L22 -44 Q0 -48 -22 -44 Z" fill="${o.bootCol ? o.bootCol : C.bootHi}" ${ink(LW * .8)}/>`);
}
function handSVG(p, ang, o) {
  return g(`translate(${f(p[0])} ${f(p[1])}) rotate(${f(-ang)})`, `<path d="M-13 -6 Q-15 14 0 17 Q15 14 13 -6 Q12 -14 0 -14 Q-12 -14 -13 -6 Z" fill="${C.ink}"/><ellipse cx="${o.thumb || 10}" cy="-2" rx="6" ry="8" fill="${C.ink}" transform="rotate(-25)"/>`);
}
function tunicPath(len = 0) {
  const hem = -200 + len;
  return smooth([[-24, -420], [0, -414], [24, -420], [62, -410], [84, -394], [98, -360], [100, -342], [70, -334], [66, -330],
    [70, -260], [76, hem], [40, hem + 6], [6, hem + 2], [-30, hem + 7], [-76, hem], [-70, -260],
    [-66, -330], [-70, -334], [-100, -342], [-98, -360], [-84, -394], [-62, -410]], true, .35);
}
function capeBack(o) {
  const t = o.t || 0, wv = o.wave == null ? 1 : o.wave, wind = o.wind || 0;
  const b = (x, y, i) => [x + Math.sin(t * 2.4 + i * 1.1) * 5 * wv + wind * (1 + i * .1) * 14, y + Math.cos(t * 2.1 + i) * 3 * wv];
  const len = o.capeLen || 0;
  const pts = [[-58, -410], [-98, -330], b(-122, -240 + len * .5, 1), b(-140, -118 + len, 2), b(-112, -104 + len, 3), b(-92, -126 + len, 4), b(-52, -96 + len, 5), b(-20, -120 + len, 6), b(22, -94 + len, 7), b(58, -124 + len, 8), b(96, -100 + len, 9), b(146, -112 + len, 10), b(122, -240 + len * .5, 11), [98, -330], [58, -410]];
  let s = `<path d="${smooth(pts, true, .3)}" fill="${o.capeCol || C.cape}" ${ink(LW)}/>`;
  s += `<path d="${smooth([[-58, -400], [-92, -320], b(-112, -230, 1), b(-126, -150 + len, 2), b(-100, -128 + len, 3), [-80, -240], [-62, -340]], true, .45)}" fill="${o.capeSh || C.capeSh}" opacity=".75"/>`;
  s += `<path d="${smooth([[64, -390], b(96, -260, 4), b(118, -150 + len, 9)], false, .5)}" fill="none" stroke="${o.capeHi || C.capeHi}" stroke-width="7" stroke-linecap="round" opacity=".6"/>`;
  s += `<path d="${smooth([[-40, -370], b(-70, -250, 3), b(-84, -150 + len, 5)], false, .5)}" fill="none" stroke="${o.capeSh || C.capeSh}" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
  return s;
}
function capeFront(o) {
  const col = o.capeCol || C.cape;
  let s = `<path d="${smooth([[-96, -350], [-90, -392], [-56, -420], [0, -432], [56, -420], [90, -392], [96, -350], [80, -356], [60, -382], [26, -398], [0, -400], [-26, -398], [-60, -382], [-80, -356]], true, .4)}" fill="${col}" ${ink(LW)}/>`;
  s += `<path d="M-74 -394 Q-40 -416 -8 -420" fill="none" stroke="${o.capeHi || C.capeHi}" stroke-width="6" stroke-linecap="round" opacity=".7"/>`;
  s += `<path d="M30 -404 Q58 -398 80 -372" fill="none" stroke="${o.capeSh || C.capeSh}" stroke-width="4" stroke-linecap="round" opacity=".8"/>`;
  s += `<circle cx="-30" cy="-398" r="13" fill="${C.bronze}" ${ink(4)}/><circle cx="-34" cy="-402" r="5" fill="${C.bronzeHi}"/>`;
  return s;
}
function togaSVG() {
  return `<path d="${smooth([[-70, -410], [20, -420], [80, -330], [70, -150], [-76, -170], [-84, -280]], true, .4)}" fill="#f7f4ec" ${ink(LW)}/>` +
    `<path d="M-60 -400 Q20 -300 66 -170 M-40 -405 Q30 -330 74 -250 M-74 -260 Q-10 -230 60 -190" fill="none" stroke="#d8d2c4" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="M-70 -406 Q0 -360 70 -300" fill="none" stroke="#9c2a2a" stroke-width="9" stroke-linecap="round"/>`;
}

/* person(o): full figure, feet at (x,y)
   o.arms: {L:{a:[a1,a2]} | {to:[x,y], bend}, R:...}; o.legs {L:[hip,knee], R:[...]} ; o.face, o.look, o.blink
   o.lean (deg), o.tilt (head deg), o.headY, o.breath (0..1 phase), o.squash
*/
function person(o) {
  const p = Object.assign({ x: 0, y: 0, s: 1, flip: false, rot: 0, lean: 0, tilt: 0, headY: 0, headX: 0, t: 0, squash: 1, ground: true, cape: true, tunicCol: C.tunic, tunicSh: C.tunicSh, belt: true, toes: 'out', legsVisible: true, beltCol: C.belt }, o);
  const arms = p.arms || {}, legs = p.legs || {};
  const L = legs.L || [-7, 2], R = legs.R || [7, -2];
  const lg = [[-24, L], [24, R]].map(([hx, a]) => { const [k, ft] = fk([hx, HIP], a[0], a[1], TH, SH); return { hx, k, ft, ang: a[0] + a[1] }; });
  let dy = 0; if (p.ground) dy = -(Math.max(lg[0].ft[1], lg[1].ft[1]) + 31);
  const breathe = Math.sin((p.t + (p.phase || 0)) * 2.2) * 2.2;
  const armAng = (side, A) => {
    if (!A) return side < 0 ? [-9, 10] : [9, -10];
    if (A.to) { const o = SHO[side < 0 ? 0 : 1]; return ik(o, A.to, UA, FA, A.bend == null ? (side < 0 ? 1 : -1) : A.bend); }
    return A.a;
  };
  const aL = armAng(-1, arms.L), aR = armAng(1, arms.R);
  const AL = fk(SHO[0], aL[0], aL[1], UA, FA), AR = fk(SHO[1], aR[0], aR[1], UA, FA);
  // pieces
  let back = '';
  if (p.cape) back += capeBack(p);
  if (p.backExtra) back += p.backExtra;
  let legsS = '';
  if (p.legsVisible) for (const l of lg) {
    legsS += `<path d="M${l.hx} ${HIP} L${f(l.k[0])} ${f(l.k[1])} L${f(l.ft[0])} ${f(l.ft[1])}" fill="none" ${ink(LW * 1.25)}/>`;
    const dir = p.toes === 'out' ? (l.hx < 0 ? -1 : 1) : 1;
    legsS += bootSVG(l.ft[0], l.ft[1], l.ang, dir, p);
  }
  let torso = '';
  if (p.dress) torso += `<path d="${smooth([[-24, -420], [24, -420], [62, -410], [90, -380], [96, -344], [68, -334], [76, -200], [96, -40], [0, -30], [-96, -40], [-76, -200], [-68, -334], [-96, -344], [-90, -380], [-62, -410]], true, .35)}" fill="${p.tunicCol}" ${ink(LW)}/><path d="M30 -330 Q50 -200 70 -50 M-10 -300 Q-14 -160 -20 -40" fill="none" stroke="${p.tunicSh}" stroke-width="5" stroke-linecap="round"/>`;
  else {
    torso += `<path d="${tunicPath(p.tunicLen || 0)}" fill="${p.tunicCol}" ${ink(LW)}/>`;
    torso += `<path d="${smooth([[30, -400], [58, -396], [66, -330], [70, -230], [72, -200 + (p.tunicLen || 0)], [52, -192 + (p.tunicLen || 0)], [44, -300]], true, .4)}" fill="${p.tunicSh}" opacity=".7"/>`;
    torso += `<path d="M-30 -270 Q-34 -230 -40 -206 M18 -268 Q22 -232 30 -204" fill="none" stroke="${p.tunicSh}" stroke-width="4" stroke-linecap="round"/>`;
    torso += `<path d="M-90 -350 Q-80 -346 -70 -346 M90 -350 Q80 -346 70 -346" fill="none" stroke="${p.tunicSh}" stroke-width="4" stroke-linecap="round"/>`;
  }
  torso += `<path d="M-10 -414 L0 -394 L10 -414" fill="none" ${ink(3)}/>`;
  if (p.belt) torso += `<path d="M-70 -300 Q0 -288 70 -300 L71 -282 Q0 -270 -71 -282 Z" fill="${p.beltCol}" ${ink(4.5)}/><path d="M-60 -287 Q0 -277 60 -287" fill="none" stroke="${C.beltSh}" stroke-width="4" opacity=".6"/>`;
  if (p.armor) torso += armorSVG();
  if (p.toga) torso += togaSVG();
  if (p.apron) torso += `<path d="${smooth([[-56, -296], [56, -296], [60, -200], [0, -190], [-60, -200]], true, .3)}" fill="${p.apron}" ${ink(4)}/>`;
  if (p.cape) torso += capeFront(p);
  const arm = (sp, A) => `<path d="M${sp[0]} ${sp[1]} L${f(A[0][0])} ${f(A[0][1])} L${f(A[1][0])} ${f(A[1][1])}" fill="none" ${ink(LW * 1.25)}/>`;
  const held = (A, ang, item) => item ? g(`translate(${f(A[1][0])} ${f(A[1][1])}) rotate(${f(item.r || 0)}) scale(${item.s || 1})`, item.svg) : '';
  let armsS = arm(SHO[0], AL) + arm(SHO[1], AR);
  let props = (p.holdL && p.holdL.behind ? '' : held(AL, 0, p.holdL)) + (p.holdR && p.holdR.behind ? '' : held(AR, 0, p.holdR));
  props += p.frontExtra || '';
  let hands = handSVG(AL[1], aL[0] + aL[1], { thumb: 10 }) + handSVG(AR[1], aR[0] + aR[1], { thumb: -10 });
  const neck = `<path d="M0 -450 L0 -416" ${ink(LW * 1.2)}/>`;
  const head = g(`translate(${f(p.headX)} ${f(-540 + p.headY + breathe * .6)}) rotate(${f(p.tilt)}) scale(.95)`, headSVG(p));
  const upperRot = `rotate(${f(p.lean)} 0 ${HIP})`;
  const torsoG = g(`${upperRot} translate(0 ${f(breathe * .5)})`, torso + neck + head + armsS + props + hands);
  const backG = g(upperRot, back);
  const sx = (p.flip ? -1 : 1) * p.s, sy = p.s * p.squash;
  return g(`translate(${f(p.x)} ${f(p.y)}) rotate(${f(p.rot)}) scale(${f(sx * 1000) / 1000} ${f(sy * 1000) / 1000}) translate(0 ${f(dy)})`, backG + legsS + torsoG);
}
function armorSVG() {
  let s = '';
  for (let i = 4; i >= 0; i--) { const y = -392 + i * 26, w = 70 - i * 1.5; s += `<path d="M${-w} ${y} Q0 ${y - 6} ${w} ${y} L${w - 2} ${y + 30} Q0 ${y + 24} ${-w + 2} ${y + 30} Z" fill="${i % 2 ? C.steel : '#d7dbdf'}" ${ink(4)}/>`; }
  s += `<path d="M-74 -398 Q-108 -390 -104 -346 L-74 -354 Z M74 -398 Q108 -390 104 -346 L74 -354 Z" fill="${C.steel}" ${ink(4)}/>`;
  return s;
}
// walk cycle (side-ish): returns {arms, legs, bob}
function walk(ph, amp = 1) {
  const s = Math.sin(ph), c = Math.cos(ph);
  return {
    legs: { L: [s * 24 * amp, -Math.max(0, -c) * 36 * amp - 3], R: [-s * 24 * amp, -Math.max(0, c) * 36 * amp - 3] },
    arms: { L: { a: [-s * 20 * amp + 6, 18 * amp] }, R: { a: [s * 20 * amp - 6, 18 * amp] } },
    bob: -Math.abs(Math.cos(ph)) * 8 * amp,
  };
}
const blinkK = (t, seed = 0) => { const per = 3.4 + rnd(seed) * 1.6, k = ((t + seed * 1.7) % per) / .16; return k < 1 ? Math.sin(k * Math.PI) : 0; };
// soft hatched ground shadow (like the reference art)
function shadow(x, y, w = 120, op = .16) {
  let s = `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${w}" ry="${f(w * .14)}" fill="#3a2f28" opacity="${op}"/>`;
  for (let i = 0; i < 5; i++) s += `<path d="M${f(x - w * (.9 - i * .08))} ${f(y - 4 + i * 3)} l${f(w * (1.8 - i * .16))} 0" stroke="#3a2f28" stroke-width="2" opacity="${f(op * .9)}"/>`;
  return s;
}
// global soft light/vignette overlay
function vignette(op = .35, col = '#2a1a0e') {
  const id = uid('vg');
  return `<defs><radialGradient id="${id}" cx="50%" cy="50%" r="75%"><stop offset=".55" stop-color="${col}" stop-opacity="0"/><stop offset="1" stop-color="${col}" stop-opacity="${op}"/></radialGradient></defs><rect width="1920" height="1080" fill="url(#${id})"/>`;
}

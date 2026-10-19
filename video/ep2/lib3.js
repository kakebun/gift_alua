// v3 character rig — built strictly from the character spec (stickman hybrid, flat fills, uniform ink line).
// Units: head diameter D = 200 (R = 100). Feet on y = 0, up is negative. Height ~4.1 heads.
const W = 1920, H = 1080;
const PAL = {
  ink: '#1A1A1A', head: '#FFFFFF', hair: '#4A3222', hairTex: '#36241a', tunic: '#F2EDE2', tunicLine: '#cfc6b6',
  belt: '#6B4A30', cape: '#6E2A2A', capeLine: '#521d1d', brooch: '#B8893A', boot: '#7A5636', bootLine: '#5c3f27',
  blade: '#C9CDD2', bladeLine: '#9aa0a7', guard: '#A57A4A', grip: '#6B4A30', mouth: '#8B2E2E', tongue: '#b8605a', bg: '#FAF7F0',
};
const LINE = 6.5; // uniform ink width (character units)

// ---------------------------------------------------------------- math / easing / keys
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const esine = k => -(Math.cos(Math.PI * k) - 1) / 2;
const eout = k => 1 - Math.pow(1 - k, 3);
const eout5 = k => 1 - Math.pow(1 - k, 5);
const ein = k => k * k * k;
const eback = k => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const eelastic = k => k <= 0 ? 0 : k >= 1 ? 1 : Math.pow(2, -9 * k) * Math.sin((k * 10 - .75) * (2 * Math.PI / 3.2)) + 1;
const rad = d => d * Math.PI / 180;
const f = n => Math.round(n * 10) / 10;
const rnd = n => { const s = Math.sin(n * 91.345 + 47.853) * 43758.5453; return s - Math.floor(s); };
const noise1 = x => { const i = Math.floor(x), fr = x - i, h = n => rnd(n * 1.37 + 3.1); const u = fr * fr * (3 - 2 * fr); return lerp(h(i), h(i + 1), u) * 2 - 1; };
const pop = (t, t0, d = .45) => eback(seg(t, t0, t0 + d));
const fadeI = (t, t0, d = .4) => esine(seg(t, t0, t0 + d));
const fadeIO = (t, a, b, d = .4) => Math.min(fadeI(t, a, d), 1 - esine(seg(t, b - d, b)));
function mix(a, b, k) {
  if (a === undefined) return b; if (b === undefined) return a;
  if (typeof a === 'number' && typeof b === 'number') return a + (b - a) * k;
  if (Array.isArray(a) && Array.isArray(b)) return a.map((v, i) => mix(v, b[i], k));
  if (a && b && typeof a === 'object' && typeof b === 'object') { const o = {}; for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) o[key] = mix(a[key], b[key], k); return o; }
  return k < .5 ? a : b;
}
// keyframes [[t, v, ease?]...]
function K(t, keys, ease = eio) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 0; i < keys.length - 1; i++) { const [t0, v0] = keys[i], [t1, v1, e] = keys[i + 1]; if (t < t1) return mix(v0, v1, (e || ease)((t - t0) / (t1 - t0))); }
  return keys[keys.length - 1][1];
}
// state switches [[t, v, dur?]...] blended over d
function S(t, list, d = .3, ease = eio) {
  let i = -1; for (let j = 0; j < list.length; j++) if (t >= list[j][0]) i = j;
  if (i < 0) return list[0][1];
  const dd = list[i][2] || d;
  if (i > 0 && t < list[i][0] + dd) return mix(list[i - 1][1], list[i][1], ease((t - list[i][0]) / dd));
  return list[i][1];
}
// damped follow (overlapping action): value lags behind target signal
const lag = (fn, t, delay = .08) => fn(t - delay);

// ---------------------------------------------------------------- svg helpers
let UID = 0; const uid = p => `${p}${++UID}`;
const g = (tr, inner, extra = '') => `<g transform="${tr}" ${extra}>${inner}</g>`;
const T = (x, y, s = 1, r = 0) => `translate(${f(x)} ${f(y)}) rotate(${f(r)}) scale(${f(s * 1000) / 1000})`;
const ink = (w = LINE, c = PAL.ink) => `stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
const op = (v, inner) => v <= 0.001 ? '' : v >= .999 ? inner : `<g opacity="${f(v * 1000) / 1000}">${inner}</g>`;
const P = pts => pts.map(p => f(p[0]) + ' ' + f(p[1])).join(' ');
function smooth(pts, closed = true, tension = .5) {
  const n = pts.length; if (n < 2) return '';
  const get = i => closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))];
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`; const last = closed ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
    d += ` C${f(p1[0] + (p2[0] - p0[0]) * tension / 3)} ${f(p1[1] + (p2[1] - p0[1]) * tension / 3)} ${f(p2[0] - (p3[0] - p1[0]) * tension / 3)} ${f(p2[1] - (p3[1] - p1[1]) * tension / 3)} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + (closed ? ' Z' : '');
}
// spiky-lock path: points alternate valley/tip; edges slightly bowed
function locks(pts, bow = .12) {
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, k = (a[2] === 'v' ? bow : -bow * .35) * L;
    d += ` Q${f((a[0] + b[0]) / 2 + dy / L * k)} ${f((a[1] + b[1]) / 2 - dx / L * k)} ${f(b[0])} ${f(b[1])}`;
  }
  return d + ' Z';
}
function text(str, x, y, o = {}) {
  const p = Object.assign({ size: 80, fill: PAL.ink, font: 'Gochi Hand', anchor: 'middle', stroke: PAL.bg, sw: 0, rot: 0, s: 1, op: 1, ls: 0 }, o);
  const st = p.sw ? `stroke="${p.stroke}" stroke-width="${p.sw}" paint-order="stroke" stroke-linejoin="round"` : '';
  return `<g transform="${T(x, y, p.s, p.rot)}" opacity="${f(p.op * 100) / 100}"><text x="0" y="0" font-family="${p.font}" font-size="${p.size}" fill="${p.fill}" text-anchor="${p.anchor}" dominant-baseline="middle" letter-spacing="${p.ls}" ${st}>${str}</text></g>`;
}
// hatched ground shadow (always under the feet)
function shadow(x, y, w = 120, opv = .55) {
  let s = '';
  for (let i = 0; i < 7; i++) { const yy = y - 6 + i * 3.4, ww = w * (1 - Math.abs(i - 3) * .17); s += `<path d="M${f(x - ww + (i % 2) * 8)} ${f(yy)} L${f(x + ww - (i % 3) * 6)} ${f(yy)}" stroke="#6d6258" stroke-width="2" opacity="${f(opv * (.6 + rnd(i) * .4))}" stroke-linecap="round"/>`; }
  return s;
}

// ---------------------------------------------------------------- HAIR (3 key views, same point count, morphable)
const HAIR_F = {
  out: [[-102, 36, 't'], [-96, 6, 'v'], [-126, -26, 't'], [-104, -46, 'v'], [-118, -78, 'v'], [-96, -116, 't'], [-76, -98, 'v'], [-60, -122, 'v'], [-44, -150, 't'], [-14, -122, 'v'], [10, -136, 'v'], [48, -152, 't'], [52, -122, 'v'], [90, -118, 'v'], [142, -102, 't'], [104, -78, 'v'], [132, -46, 't'], [102, -34, 'v'], [112, 6, 't']],
  inn: [[94, -20, 'v'], [78, -26, 't'], [66, -58, 'v'], [50, -30, 't'], [34, -62, 'v'], [26, -58, 'v'], [10, -36, 't'], [-8, -64, 'v'], [-24, -40, 't'], [-40, -66, 'v'], [-58, -36, 't'], [-70, -60, 'v'], [-82, -48, 'v'], [-92, 6, 't']],
  tex: [[[-62, -96], [-46, -112]], [[14, -112], [40, -120]], [[70, -96], [96, -94]], [[-24, -88], [-6, -98]]],
};
const HAIR_P = { // facing +x
  out: [[-62, 66, 't'], [-80, 40, 'v'], [-128, 30, 't'], [-106, 4, 'v'], [-126, -30, 'v'], [-146, -60, 't'], [-108, -74, 'v'], [-108, -104, 'v'], [-100, -140, 't'], [-62, -120, 'v'], [-30, -132, 'v'], [0, -152, 't'], [20, -120, 'v'], [60, -116, 'v'], [112, -100, 't'], [82, -74, 'v'], [116, -56, 't'], [90, -46, 'v'], [106, -26, 't']],
  inn: [[84, -40, 'v'], [72, -20, 't'], [60, -48, 'v'], [44, -18, 't'], [30, -44, 'v'], [20, -36, 'v'], [10, -8, 't'], [-4, -26, 'v'], [-16, 8, 't'], [-30, -6, 'v'], [-38, 30, 't'], [-52, 16, 'v'], [-60, 30, 'v'], [-58, 70, 't']],
  tex: [[[-84, -56], [-64, -78]], [[-34, -100], [-4, -112]], [[30, -98], [60, -94]], [[-92, -6], [-72, -26]]],
};
const HAIR_B = {
  out: [[-104, 40, 't'], [-98, 8, 'v'], [-128, -22, 't'], [-104, -44, 'v'], [-120, -78, 'v'], [-100, -118, 't'], [-76, -100, 'v'], [-58, -124, 'v'], [-40, -150, 't'], [-12, -124, 'v'], [12, -136, 'v'], [46, -150, 't'], [52, -122, 'v'], [88, -120, 'v'], [132, -100, 't'], [102, -76, 'v'], [130, -44, 't'], [102, -30, 'v'], [106, 34, 't']],
  inn: [[96, 20, 'v'], [84, 50, 't'], [66, 30, 'v'], [50, 58, 't'], [34, 32, 'v'], [24, 36, 'v'], [10, 62, 't'], [-6, 34, 'v'], [-22, 60, 't'], [-38, 32, 'v'], [-56, 56, 't'], [-70, 30, 'v'], [-84, 28, 'v'], [-98, 48, 't']],
  tex: [[[-60, -60], [-24, -80]], [[10, -44], [48, -62]], [[-40, -4], [-4, -14]], [[40, 6], [70, -12]]],
};
function hairAt(yaw) { // yaw in degrees, 0 front, 90 facing +x, 180 back; negative = facing -x (mirror)
  const a = Math.abs(yaw) % 360, m = yaw < 0 ? -1 : 1;
  let h;
  if (a <= 90) h = mix(HAIR_F, HAIR_P, esine(a / 90));
  else if (a <= 180) h = mix(HAIR_P, HAIR_B, esine((a - 90) / 90));
  else h = mix(HAIR_B, HAIR_F, esine((a - 180) / 180));
  if (m < 0) { const mir = p => [-p[0], p[1], p[2]]; h = { out: h.out.map(mir), inn: h.inn.map(mir), tex: h.tex.map(l => l.map(mir)) }; }
  return h;
}
function hairSVG(yaw, col = PAL.hair, tex = PAL.hairTex) {
  const h = hairAt(yaw);
  let s = `<path d="${locks(h.out.concat(h.inn), .14)}" fill="${col}" ${ink()}/>`;
  for (const l of h.tex) s += `<path d="M${P([l[0]])} L${P([l[1]])}" stroke="${tex}" stroke-width="3" stroke-linecap="round" opacity=".55"/>`;
  return s;
}

// ---------------------------------------------------------------- FACE (spec emotions)
// brow: [show, y, tilt(+ inner down)]; mouth: {w, curve, open, round, wob, tongue}; eyes: {open, happy}
const EMO = {
  neutral: { bL: [0, 0, 0], bR: [0, 0, 0], e: { open: 1, happy: 0 }, m: { w: 26, curve: 0, open: 0, round: 0, wob: 0, tongue: 0 } },
  smile: { bL: [0, 0, 0], bR: [0, 0, 0], e: { open: 1, happy: 0 }, m: { w: 28, curve: 1, open: 0, round: 0, wob: 0, tongue: 0 } },
  joy: { bL: [1, -10, -6], bR: [1, -10, -6], e: { open: 1, happy: 1 }, m: { w: 44, curve: .4, open: 1, round: 0, wob: 0, tongue: .8 } },
  grin: { bL: [1, -6, -4], bR: [1, -6, -4], e: { open: 1, happy: 0 }, m: { w: 40, curve: .4, open: .9, round: 0, wob: 0, tongue: .7 } },
  anger: { bL: [1, 2, 22], bR: [1, 2, 22], e: { open: 1, happy: 0 }, m: { w: 22, curve: -.6, open: 0, round: 0, wob: 0, tongue: 0 } },
  yell: { bL: [1, 0, 24], bR: [1, 0, 24], e: { open: 1, happy: 0 }, m: { w: 36, curve: -.2, open: .9, round: .2, wob: .2, tongue: .5 } },
  think: { bL: [1, 4, 10], bR: [1, -8, -4], e: { open: 1, happy: 0 }, m: { w: 14, curve: -.1, open: 0, round: 0, wob: 0, tongue: 0, x: 8 } },
  surprise: { bL: [1, -16, -2], bR: [1, -16, -2], e: { open: 1, happy: 0 }, m: { w: 13, curve: 0, open: .7, round: 1, wob: 0, tongue: 0 } },
  sad: { bL: [1, -6, -18], bR: [1, -6, -18], e: { open: 1, happy: 0 }, m: { w: 22, curve: -1, open: 0, round: 0, wob: 0, tongue: 0 } },
  fear: { bL: [1, -10, -20], bR: [1, -10, -20], e: { open: 1, happy: 0 }, m: { w: 30, curve: -.3, open: .8, round: .6, wob: 1, tongue: .5 } },
  smug: { bL: [1, -10, -4], bR: [1, 0, 16], e: { open: 1, happy: 0 }, m: { w: 30, curve: .9, open: 0, round: 0, wob: 0, tongue: 0, x: 4 } },
  sleepy: { bL: [0, 0, 0], bR: [0, 0, 0], e: { open: 0, happy: 0 }, m: { w: 18, curve: 0, open: 0, round: 0, wob: 0, tongue: 0 } },
  dazed: { bL: [1, -4, -10], bR: [1, 4, 8], e: { open: .55, happy: 0 }, m: { w: 18, curve: -.3, open: 0, round: 0, wob: 0, tongue: 0, x: 4 } },
};
// project a point on the head sphere (front-facing coords) by yaw (deg). returns [x, y, depth 0..1]
function proj(x, y, yaw) {
  const z = Math.sqrt(Math.max(0, 100 * 100 - x * x - y * y)), a = rad(yaw);
  return [x * Math.cos(a) + 60 * Math.sin(a), y, (-x * Math.sin(a) + z * Math.cos(a)) / 100 + Math.abs(Math.sin(a)) * .55];
}
function faceSVG(F, yaw, look, blink) {
  let s = '';
  const lx = look[0] * 8, ly = look[1] * 6;
  for (const side of [-1, 1]) {
    const [x, y, d] = proj(side * 38 + lx, 6 + ly, yaw);
    const vis = clamp((d - .12) / .2); if (vis <= 0) continue;
    const sq = clamp(d * 1.25, .35, 1);
    const open = clamp(F.e.open * (1 - blink));
    const hk = clamp(F.e.happy * 2 - .4), sk = 1 - clamp(F.e.happy * 2);
    if (sk > 0) {
      if (open > .15) s += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(8.5 * sq)}" ry="${f(13 * open)}" fill="${PAL.ink}" opacity="${f(vis * sk)}"/>`;
      else s += `<path d="M${f(x - 10 * sq)} ${f(y + 2)} L${f(x + 10 * sq)} ${f(y + 2)}" ${ink(5)} opacity="${f(vis * sk)}"/>`;
    }
    if (hk > 0) s += `<path d="M${f(x - 11 * sq)} ${f(y + 4)} Q${f(x)} ${f(y - 12)} ${f(x + 11 * sq)} ${f(y + 4)}" fill="none" ${ink(5.5)} opacity="${f(vis * hk)}"/>`;
    const b = side < 0 ? F.bL : F.bR;
    if (b[0] > .01) {
      const [bx, by] = proj(side * 36 + lx * .5, -26 + b[1], yaw);
      const a = rad(b[2]) * -side, hw = 15 * sq;
      s += `<path d="M${f(bx - hw * Math.cos(a))} ${f(by - hw * Math.sin(a))} L${f(bx + hw * Math.cos(a))} ${f(by + hw * Math.sin(a))}" ${ink(6)} opacity="${f(vis * b[0])}"/>`;
    }
  }
  // mouth
  const m = F.m; const [mx, my, md] = proj((m.x || 0) + lx * .8, 48 + ly * .6, yaw);
  const mv = clamp((md - .05) / .2);
  if (mv > 0) {
    const w = m.w * clamp(md * 1.2, .3, 1);
    if (m.open < .06) s += `<path d="M${f(mx - w)} ${f(my - m.curve * 6)} Q${f(mx)} ${f(my + m.curve * 12)} ${f(mx + w)} ${f(my - m.curve * 6)}" fill="none" ${ink(5.5)} opacity="${f(mv)}"/>`;
    else {
      const h = m.open * Math.max(w, 14) * 1.05, top = my - m.curve * 4, rd = m.round, wb = m.wob;
      const tl = top - rd * h * .55;
      const d = `M${f(mx - w)} ${f(top + wb * 3)} C${f(mx - w * .5)} ${f(tl)} ${f(mx + w * .5)} ${f(tl - wb * 4)} ${f(mx + w)} ${f(top - wb * 2)} C${f(mx + w)} ${f(top + h * .9)} ${f(mx - w)} ${f(top + h * .9 + wb * 5)} ${f(mx - w)} ${f(top + wb * 3)} Z`;
      const id = uid('mo');
      s += `<clipPath id="${id}"><path d="${d}"/></clipPath><path d="${d}" fill="${PAL.mouth}" opacity="${f(mv)}"/>`;
      if (m.tongue > .05) s += `<g clip-path="url(#${id})"><ellipse cx="${f(mx + w * .1)}" cy="${f(top + h * .72)}" rx="${f(w * .55)}" ry="${f(h * .32)}" fill="${PAL.tongue}" opacity="${f(m.tongue * mv)}"/></g>`;
      s += `<path d="${d}" fill="none" ${ink(5)} opacity="${f(mv)}"/>`;
    }
  }
  return s;
}
// head: circle + face + hair. o.hair: 'hero' | npc style
function headSVG(o) {
  const yaw = o.headYaw || 0, F = o.face || EMO.neutral, look = o.look || [0, 0];
  let s = '';
  const npcBack = o.hairStyle && o.hairStyle !== 'hero' ? npcHairBack(o.hairStyle, yaw, o.hairCol) : '';
  s += npcBack;
  s += `<circle cx="0" cy="0" r="100" fill="${PAL.head}" ${ink()}/>`;
  s += faceSVG(F, yaw, look, o.blink || 0);
  if (o.beard) s += npcBeard(yaw, o.hairCol || '#2b2523');
  if (o.mustache) { const [x, y, d] = proj(0, 34, yaw); if (d > .2) s += `<path d="M${f(x - 26)} ${f(y + 4)} Q${f(x - 12)} ${f(y - 8)} ${f(x)} ${f(y)} Q${f(x + 12)} ${f(y - 8)} ${f(x + 26)} ${f(y + 4)} Q${f(x)} ${f(y + 6)} ${f(x - 26)} ${f(y + 4)} Z" fill="${o.hairCol || '#2b2523'}" ${ink(3)}/>`; }
  if (o.helmet) s += helmetSVG(yaw, o.crest);
  else if (!o.hairStyle || o.hairStyle === 'hero') s += hairSVG(yaw);
  else s += npcHairFront(o.hairStyle, yaw, o.hairCol);
  return s;
}
// NPC hair: simple shapes, shifted toward the back of the head as it turns
function npcHairFront(style, yaw, col = '#2b2523') {
  const a = rad(yaw), sh = -Math.sin(a) * 26, sx = 1 - Math.abs(Math.sin(a)) * .15, back = Math.cos(a) < 0;
  const tr = `translate(${f(sh)} 0) scale(${f(sx)} 1)`;
  if (style === 'short') return g(tr, `<path d="${locks([[-98, -6, 't'], [-96, -40, 'v'], [-110, -70, 't'], [-80, -86, 'v'], [-74, -116, 't'], [-40, -106, 'v'], [-14, -124, 't'], [10, -104, 'v'], [44, -118, 't'], [56, -94, 'v'], [92, -96, 't'], [90, -68, 'v'], [106, -40, 't'], [96, -12, 'v'], [80, -40, 'v'], [50, -48, 't'], [30, -64, 'v'], [4, -50, 't'], [-20, -66, 'v'], [-46, -48, 't'], [-66, -62, 'v'], [-84, -36, 't']].map(p => back ? [p[0], p[1] < -50 ? p[1] : p[1] + 70, p[2]] : p), .1)}" fill="${col}" ${ink()}/>`);
  if (style === 'curly') { let c = ''; for (let i = 0; i < 11; i++) { const an = rad(200 + i * 14); c += `<circle cx="${f(Math.cos(an) * 90)}" cy="${f(Math.sin(an) * 90 - 8)}" r="26" fill="${col}" ${ink()}/>`; } return g(tr, c + `<path d="M-96 -20 Q-90 -100 0 -110 Q90 -100 96 -20 Q50 -60 0 -62 Q-50 -60 -96 -20 Z" fill="${col}"/>`); }
  if (style === 'bald') return g(tr, `<path d="M-100 -4 Q-108 -38 -90 -52 Q-82 -28 -86 4 Z M100 -4 Q108 -38 90 -52 Q82 -28 86 4 Z" fill="${col}" ${ink(4.5)}/>`);
  if (style === 'bun' || style === 'long') return g(tr, `<path d="M-100 -4 Q-112 -112 0 -108 Q112 -112 100 -4 Q86 -44 56 -62 Q20 -50 0 -72 Q-20 -50 -56 -62 Q-86 -44 -100 -4 Z" fill="${col}" ${ink()}/>` + (style === 'bun' ? `<circle cx="0" cy="-118" r="38" fill="${col}" ${ink()}/>` : ''));
  return '';
}
function npcHairBack(style, yaw, col = '#2b2523') {
  if (style !== 'long') return '';
  const sh = -Math.sin(rad(yaw)) * 26;
  return g(`translate(${f(sh)} 0)`, `<path d="M-96 -40 Q-130 60 -108 180 Q-80 190 -64 160 Q-78 60 -70 -10 Z M96 -40 Q130 60 108 180 Q80 190 64 160 Q78 60 70 -10 Z" fill="${col}" ${ink()}/>`);
}
function npcBeard(yaw, col) {
  const sh = Math.sin(rad(yaw)) * 30;
  return g(`translate(${f(sh)} 0)`, `<path d="M-84 34 Q-76 112 0 118 Q76 112 84 34 Q60 64 30 70 Q0 60 -30 70 Q-60 64 -84 34 Z" fill="${col}" ${ink(5)}/>`);
}
function helmetSVG(yaw, crest) {
  const sh = -Math.sin(rad(yaw)) * 10;
  let s = crest ? `<path d="M-120 -112 Q0 -190 120 -112 Q0 -140 -120 -112 Z" fill="#a8322d" ${ink(5)}/>` : '';
  s += `<path d="M-108 0 Q-114 -132 0 -134 Q114 -132 108 0 Q60 -18 0 -18 Q-60 -18 -108 0 Z" fill="${PAL.blade}" ${ink()}/>`;
  s += `<path d="M-110 -6 Q0 -38 110 -6 L110 8 Q0 -24 -110 8 Z" fill="${PAL.brooch}" ${ink(4.5)}/>`;
  s += `<path d="M-104 4 L-80 6 Q-76 44 -90 70 Q-104 56 -106 30 Z M104 4 L80 6 Q76 44 90 70 Q104 56 106 30 Z" fill="${PAL.brooch}" ${ink(5)}/>`;
  return g(`translate(${f(sh)} 0)`, s);
}

// ---------------------------------------------------------------- body pieces
// two-bone forward / inverse kinematics; angles in degrees, 0 = straight down, + toward +x
function fk(o, a1, a2, l1, l2) { const e = [o[0] + Math.sin(rad(a1)) * l1, o[1] + Math.cos(rad(a1)) * l1]; return [e, [e[0] + Math.sin(rad(a1 + a2)) * l2, e[1] + Math.cos(rad(a1 + a2)) * l2]]; }
function ik(o, tgt, l1, l2, bend = 1) {
  const dx = tgt[0] - o[0], dy = tgt[1] - o[1]; const d = clamp(Math.hypot(dx, dy), Math.abs(l1 - l2) + .01, l1 + l2 - .01);
  const base = Math.atan2(dx, dy), A = Math.acos(clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1));
  const B = Math.acos(clamp((l1 * l1 + l2 * l2 - d * d) / (2 * l1 * l2), -1, 1));
  return [(base + bend * A) * 180 / Math.PI, (-bend * (Math.PI - B)) * 180 / Math.PI];
}
const RIG = { headY: -720, neckTop: -622, neckBase: -598, shoY: -556, shoX: 104, UA: 92, FA: 92, hipY: -345, hipX: 38, TH: 122, SH: 123 };

function bootSVG(x, y, ang, toe, col = PAL.boot) {
  // toe: -1..1 (facing direction); 0 = front view. ankle point at cuff top.
  const tx = toe * 34, fw = 30 + (1 - Math.abs(toe)) * 6;
  const d = smooth([[-fw + 6, 0], [fw - 6, 0], [fw - 2, 60], [fw + 2 + Math.max(0, tx), 82], [fw + Math.max(0, tx), 100], [-fw + Math.min(0, tx), 100], [-fw - 2 + Math.min(0, tx), 82], [-fw + 2, 60]], true, .35);
  return g(`translate(${f(x)} ${f(y)}) rotate(${f(-ang * .6)})`,
    `<path d="${d}" fill="${col}" ${ink()}/>` +
    `<path d="${smooth([[-fw - 6, -6], [fw + 6, -6], [fw + 8, 30], [-fw - 8, 30]], true, .3)}" fill="${col}" ${ink()}/>` +
    `<path d="M${f(-fw + 10)} 72 Q0 76 ${f(fw - 10)} 72" fill="none" stroke="${PAL.bootLine}" stroke-width="3" opacity=".6"/>`);
}
function handSVG(p, kind = 'fist', ang = 0) {
  let s = `<circle cx="${f(p[0])}" cy="${f(p[1])}" r="19" fill="${PAL.ink}"/>`;
  if (kind === 'point') s += `<path d="M${f(p[0])} ${f(p[1])} L${f(p[0] + Math.sin(rad(ang)) * 46)} ${f(p[1] + Math.cos(rad(ang)) * 46)}" ${ink(9)}/>`;
  if (kind === 'thumb') s += `<path d="M${f(p[0] + 8)} ${f(p[1] - 6)} L${f(p[0] + 18)} ${f(p[1] - 36)}" ${ink(10)}/>`;
  return s;
}
function swordSVG(ang = 0) { // grip at origin (hand); ang: blade direction, 0 = blade up
  return g(`rotate(${f(ang)})`,
    `<path d="M-13 -46 L13 -46 L11 -336 L0 -372 L-11 -336 Z" fill="${PAL.blade}" ${ink(5)}/><path d="M0 -60 L0 -330" stroke="${PAL.bladeLine}" stroke-width="3"/>` +
    `<rect x="-46" y="-50" width="92" height="15" rx="5" fill="${PAL.guard}" ${ink(5)}/>` +
    `<rect x="-9" y="-36" width="18" height="70" rx="6" fill="${PAL.grip}" ${ink(5)}/><circle cx="0" cy="44" r="13" fill="${PAL.grip}" ${ink(5)}/>`);
}

// cape: curved panel behind the back, projected by yaw; wind = [wx, wy] in screen units
function capePanel(yaw, o) {
  const a = rad(yaw), c = Math.cos(a), sn = Math.sin(a), t = o.t || 0, wind = o.wind || [0, 0], wave = o.wave == null ? 1 : o.wave;
  const top = -572, bot = -140 + (o.capeLen || 0);
  const pt = (u, v) => { // u -1..1 across the back, v 0 (shoulders) .. 1 (hem)
    const half = lerp(100, 140, v), x = u * half, z = (-150 + 105 * u * u) * lerp(.4, 1, Math.min(1, v * 1.6)) - v * 20;
    let X = x * c + z * sn, Y = lerp(top, bot, v);
    const k = Math.pow(v, 1.4);
    X += wind[0] * k * (1 + .25 * Math.sin(t * 7 + u * 3)) + Math.sin(t * 2.3 + u * 2.5 + v * 3) * 6 * wave * v;
    Y += wind[1] * k * (1 + .2 * Math.sin(t * 6 + u * 2)) + Math.cos(t * 2 + u * 3) * 3 * wave * v;
    return [X, Y];
  };
  const JAG = [1, .9, .97, .85, 1.02, .93, .99, .84, .96, .9, 1.01, .87, .98, .92, 1];
  const N = 14, jv = i => JAG[i % JAG.length], ju = i => 1 - 2 * (i + (i > 0 && i < N ? (rnd(i + 2) - .5) * .35 : 0)) / N;
  const half = (side) => { // side -1: u in [-1,0], +1: u in [0,1]
    const pts = [];
    for (let i = 0; i <= 6; i++) pts.push(pt(side, i / 6));                    // outer edge down
    const idx = []; for (let i = 0; i <= N; i++) { const u = ju(i); if (side > 0 ? u >= -0.001 : u <= 0.001) idx.push(i); }
    const bottom = idx.map(i => pt(ju(i), jv(i)));
    if (side > 0) bottom.reverse();
    // bottom goes from outer edge toward the center
    pts.push(...(side < 0 ? bottom.slice().reverse() : bottom).slice(1));
    for (let i = 6; i >= 0; i--) pts.push(pt(0, i / 6 * .985));                  // center line up
    return pts;
  };
  const left = half(-1), right = half(1);
  // far half first (the half whose center line is nearer the viewer is drawn last)
  let s = '';
  const order = sn >= 0 ? [right, left] : [left, right];
  for (const h of order) s += `<path d="M${h.map(q => f(q[0]) + ' ' + f(q[1])).join(' L')} Z" fill="${PAL.cape}"/>`;
  // outlines: outer edges + ragged bottom + top, and the back silhouette when turned
  const edge = side => { const e = []; for (let i = 0; i <= 6; i++) e.push(pt(side, i / 6)); return e; };
  const bottomAll = []; for (let i = 0; i <= N; i++) bottomAll.push(pt(ju(i), jv(i)));
  s += `<path d="${smooth(edge(-1), false, .2)}" fill="none" ${ink()}/><path d="${smooth(edge(1), false, .2)}" fill="none" ${ink()}/>`;
  s += `<path d="M${bottomAll.map(q => f(q[0]) + ' ' + f(q[1])).join(' L')}" fill="none" ${ink()}/>`;
  const sv = clamp(Math.abs(sn) * 2.2 - .9);
  if (sv > 0) { const cl = []; for (let i = 0; i <= 6; i++) cl.push(pt(0, i / 6 * .985)); s += `<path d="${smooth(cl, false, .2)}" fill="none" ${ink()} opacity="${f(sv)}"/>`; }
  for (const u of [-.55, -.2, .25, .6]) { const p0 = pt(u, .25), p1 = pt(u * 1.05, .62), p2 = pt(u * 1.1, .86); s += `<path d="M${P([p0])} Q${P([p1])} ${P([p2])}" fill="none" stroke="${PAL.capeLine}" stroke-width="3.5" stroke-linecap="round" opacity=".7"/>`; }
  return s;
}
function collarSVG(yaw) {
  const a = rad(yaw), c = Math.cos(a), sn = Math.sin(a), sx = lerp(1, .62, Math.abs(sn)), sh = -sn * 26;
  if (c < -.25) { // back: gathered hood fold at the top of the cape
    return g(`translate(${f(sh * .5)} 0) scale(${f(sx)} 1)`, `<path d="${smooth([[-96, -560], [-70, -606], [0, -620], [70, -606], [96, -560], [40, -548], [0, -540], [-40, -548]], true, .45)}" fill="${PAL.cape}" ${ink()}/><path d="M-40 -592 Q-10 -570 -6 -548 M30 -596 Q22 -570 30 -550" fill="none" stroke="${PAL.capeLine}" stroke-width="3.5" stroke-linecap="round"/>`);
  }
  return g(`translate(${f(sh)} 0) scale(${f(sx)} 1)`, `<path d="${smooth([[-132, -536], [-114, -594], [-66, -628], [0, -636], [66, -628], [114, -594], [132, -536], [108, -534], [78, -564], [36, -584], [0, -588], [-36, -584], [-78, -564], [-108, -534]], true, .4)}" fill="${PAL.cape}" ${ink()}/><path d="M-96 -580 Q-70 -600 -40 -600 M44 -604 Q80 -598 104 -572 M-20 -616 Q0 -606 22 -616" fill="none" stroke="${PAL.capeLine}" stroke-width="3.5" stroke-linecap="round"/>`);
}
function tunicSVG(yaw, o) {
  const a = rad(yaw), c = Math.cos(a), sn = Math.sin(a);
  const bw = lerp(96, 58, Math.abs(sn)), nw = lerp(26, 20, Math.abs(sn)), hem = RIG.hipY;
  const col = o.tunicCol || PAL.tunic, line = o.tunicLine || PAL.tunicLine;
  const len = o.dress ? 300 : 0;
  let s = `<path d="${smooth([[-nw, -600], [nw, -600], [bw - 18, -592], [bw, -556], [bw + 2, -470], [bw + 6 + len * .15, hem + len], [bw * .4, hem + 6 + len], [-bw * .2, hem + 2 + len], [-bw - 6 - len * .15, hem + len], [-bw - 2, -470], [-bw, -556], [-bw + 18, -592]], true, .22)}" fill="${col}" ${ink()}/>`;
  // side slits, fold lines
  if (!o.dress) s += `<path d="M${f(bw - 10)} ${hem + 2} L${f(bw - 14)} ${hem - 26} M${f(-bw + 10)} ${hem + 2} L${f(-bw + 14)} ${hem - 26}" ${ink(4)}/>`;
  s += `<path d="M${f(-bw * .35 + sn * 10)} -430 Q${f(-bw * .4 + sn * 10)} -390 ${f(-bw * .3 + sn * 10)} -360 M${f(bw * .3 + sn * 10)} -428 Q${f(bw * .36 + sn * 10)} -392 ${f(bw * .28 + sn * 10)} -364 M${f(-bw * .2)} -540 Q${f(-bw * .1)} -520 ${f(-bw * .25)} -500" fill="none" stroke="${line}" stroke-width="3.5" stroke-linecap="round"/>`;
  // V neck + lace (front only)
  const vk = clamp(c * 1.6);
  if (vk > 0 && !o.noVneck) { const vx = sn * 40; s += `<path d="M${f(vx - 14)} -598 L${f(vx)} -566 L${f(vx + 14)} -598 M${f(vx)} -566 L${f(vx)} -548 M${f(vx - 6)} -578 L${f(vx + 6)} -578" fill="none" ${ink(4)} opacity="${f(vk)}"/>`; }
  // belt: cloth band, sags at the front
  if (o.belt !== false) { const sag = 10 * clamp(c + .3); s += `<path d="M${f(-bw - 3)} -464 Q0 ${f(-458 + sag)} ${f(bw + 3)} -464 L${f(bw + 3)} -440 Q0 ${f(-434 + sag)} ${f(-bw - 3)} -440 Z" fill="${o.beltCol || PAL.belt}" ${ink(5)}/>`; }
  if (o.apron) s += `<path d="${smooth([[-bw * .7, -440], [bw * .7, -440], [bw * .75, -350], [-bw * .75, -350]], true, .2)}" fill="${o.apron}" ${ink(5)}/>`;
  if (o.toga) s += `<path d="${smooth([[-bw, -596], [bw * .2, -604], [bw + 4, -500], [bw + 6, hem + 30], [-bw - 6, hem + 10], [-bw - 4, -480]], true, .3)}" fill="#f7f4ec" ${ink()}/><path d="M${f(-bw * .8)} -590 Q0 -480 ${f(bw)} ${hem + 30} M${f(-bw)} -470 Q0 -430 ${f(bw)} -380" fill="none" stroke="#d8d2c4" stroke-width="4"/><path d="M${f(-bw * .9)} -592 Q${f(-bw * .1)} -540 ${f(bw * .9)} -470" fill="none" stroke="#9c2a2a" stroke-width="9" stroke-linecap="round"/>`;
  if (o.armor) { for (let i = 4; i >= 0; i--) { const y = -592 + i * 30; s += `<path d="M${f(-bw - 2)} ${y} Q0 ${y - 6} ${f(bw + 2)} ${y} L${f(bw)} ${y + 34} Q0 ${y + 28} ${f(-bw)} ${y + 34} Z" fill="${i % 2 ? PAL.blade : '#dadde1'}" ${ink(4.5)}/>`; } }
  return s;
}
function sleeveSVG(side, yaw, o, armAngle) { // short wide sleeve with a flat cut, follows the upper arm a little
  const col = o.tunicCol || PAL.tunic;
  let an = ((armAngle + 540) % 360) - 180; // normalize to [-180, 180]
  const r = clamp(an * side, -20, 160) * (an * side > 60 ? .8 : .55) * side;
  return g(`rotate(${f(r)} 0 -10)`, `<path d="M${-side * 22} -44 L${side * 22} -44 Q${side * 40} -40 ${side * 46} -20 L${side * 52} 46 L${-side * 6} 56 L${-side * 20} 20 Z" fill="${col}" ${ink()}/><path d="M${side * 30} 30 L${side * 34} 44" stroke="${o.tunicLine || PAL.tunicLine}" stroke-width="3"/>`);
}

/* hero(o): the main character (and NPCs via options), feet at (x, y)
   yaw: body turn in degrees (0 front, 90 facing screen right, 180 back, -90 facing left)
   headYaw: extra head turn added to yaw; arms: {L:{a:[a1,a2]}|{to:[x,y],bend}, R:...}; legs {L:[hip,knee], R:[...]}
   hands {L:'fist'|'point'|'thumb', R:...}; sword: {hand:'R'|'L', ang} ; face (EMO.x), look, blink
*/
function hero(o) {
  const p = Object.assign({ x: 0, y: 0, s: 1, yaw: 0, headYaw: 0, rot: 0, lean: 0, tilt: 0, headY: 0, t: 0, squash: 1, ground: true, cape: true, phase: 0 }, o);
  const yaw = p.yaw, a = rad(yaw), c = Math.cos(a), sn = Math.sin(a);
  const legs = p.legs || {}, arms = p.arms || {};
  // legs: hips projected by yaw
  const hipL = [-RIG.hipX * c, RIG.hipY], hipR = [RIG.hipX * c, RIG.hipY];
  const lg = [['L', hipL, legs.L || [-5, 2], RIG.hipX * sn], ['R', hipR, legs.R || [5, -2], -RIG.hipX * sn]].map(([n, h, an, depth]) => { const [k, ft] = fk(h, an[0], an[1], RIG.TH, RIG.SH); return { n, h, k, ft, ang: an[0] + an[1], depth }; });
  let dy = 0; if (p.ground) dy = -(Math.max(lg[0].ft[1], lg[1].ft[1]) + 100);
  const breathe = Math.sin(p.t * 2.1 + p.phase) * 2.5;
  // arms
  const shL = [-RIG.shoX * c, RIG.shoY], shR = [RIG.shoX * c, RIG.shoY];
  const angOf = (side, A, sh) => !A ? (side < 0 ? [-12, 4] : [12, -4]) : A.to ? ik(sh, A.to, RIG.UA, RIG.FA, A.bend == null ? (side < 0 ? 1 : -1) : A.bend) : A.a;
  const aL = angOf(-1, arms.L, shL), aR = angOf(1, arms.R, shR);
  const AL = fk(shL, aL[0], aL[1], RIG.UA, RIG.FA), AR = fk(shR, aR[0], aR[1], RIG.UA, RIG.FA);
  const armD = { L: RIG.shoX * sn, R: -RIG.shoX * sn }; // depth: + toward camera
  const toe = clamp(sn * 1.3, -1, 1);
  const line = (pts, w = LINE) => `<path d="M${pts.map(q => f(q[0]) + ' ' + f(q[1])).join(' L')}" fill="none" ${ink(w)}/>`;
  const legS = l => line([l.h, l.k, l.ft]) + bootSVG(l.ft[0], l.ft[1], l.ang, toe, p.bootCol);
  const handKind = n => (p.hands && p.hands[n]) || 'fist';
  const swordAt = n => p.sword && p.sword.hand === n ? g(`translate(${f((n === 'L' ? AL : AR)[1][0])} ${f((n === 'L' ? AL : AR)[1][1])})`, swordSVG(p.sword.ang || 0)) : '';
  const armS = (n, sh, A, ang) => {
    let s = '';
    s += line([sh, A[0], A[1]]);
    s += sleeves[n];
    if (p.sword && p.sword.hand === n && p.sword.layer !== 'back') s += swordAt(n);
    if (n === 'L' && p.holdL) s += g(`translate(${f(A[1][0])} ${f(A[1][1])})`, p.holdL);
    if (n === 'R' && p.holdR) s += g(`translate(${f(A[1][0])} ${f(A[1][1])})`, p.holdR);
    s += handSVG(A[1], handKind(n), ang[0] + ang[1]);
    return s;
  };
  const sleeves = { L: g(`translate(${f(shL[0])} ${f(shL[1])})`, sleeveSVG(-1, yaw, p, aL[0])), R: g(`translate(${f(shR[0])} ${f(shR[1])})`, sleeveSVG(1, yaw, p, aR[0])) };
  // assemble by depth
  const capeBack = c > -.2;
  const cape = p.cape ? capePanel(yaw, p) : '';
  const collar = p.cape ? collarSVG(yaw) : '';
  const brooch = p.cape && c > -.1 ? (() => { const bx = sn * 44; return `<circle cx="${f(bx)}" cy="-588" r="16" fill="${PAL.brooch}" ${ink(5)}/><circle cx="${f(bx)}" cy="-588" r="8" fill="none" stroke="#8a6526" stroke-width="3"/>`; })() : '';
  const torso = tunicSVG(yaw, p);
  const neck = `<path d="M0 ${RIG.neckTop + 4} L0 ${RIG.neckBase}" ${ink(LINE + 1)}/>`;
  const head = g(`translate(${f(sn * 6)} ${f(RIG.headY + p.headY + breathe * .5)}) rotate(${f(p.tilt)})`, headSVG(Object.assign({}, p, { headYaw: yaw + p.headYaw })));
  const order = [];
  const farArm = n => (p.armLayer && p.armLayer[n]) ? p.armLayer[n] === 'back' : armD[n] < -60;
  const far = d => d < -15;
  // back layer
  let back = '';
  if (p.cape && capeBack) back += cape;
  if (p.sword && p.sword.layer === 'back') back += swordAt(p.sword.hand);
  for (const n of ['L', 'R']) if (farArm(n)) back += armS(n, n === 'L' ? shL : shR, n === 'L' ? AL : AR, n === 'L' ? aL : aR);
  const legsSorted = lg.slice().sort((x, y) => x.depth - y.depth);
  let legsS = legsSorted.map(legS).join('');
  let mid = torso;
  if (p.cape && !capeBack) mid += cape;
  mid += collar + brooch + neck;
  let front = '';
  for (const n of ['L', 'R']) if (!farArm(n)) front += armS(n, n === 'L' ? shL : shR, n === 'L' ? AL : AR, n === 'L' ? aL : aR);
  if (p.frontExtra) front += p.frontExtra;
  const upper = `rotate(${f(p.lean)} 0 ${RIG.hipY})`;
  const body = g(upper, back) + legsS + g(`${upper} translate(0 ${f(breathe * .4)})`, mid + head + front);
  const sx = p.s, sy = p.s * p.squash;
  return g(`translate(${f(p.x)} ${f(p.y)}) rotate(${f(p.rot)}) scale(${f(sx * 1000) / 1000} ${f(sy * 1000) / 1000}) translate(0 ${f(dy)})`, body, p.noWobble ? '' : 'filter="url(#wob)"');
}

// cycles (profile, facing +x): returns legs/arms/bob/lean
function walkCycle(ph, amp = 1) {
  const s = Math.sin(ph), c = Math.cos(ph);
  return {
    legs: { L: [s * 26 * amp, -Math.max(0, -c) * 42 * amp - 4], R: [-s * 26 * amp, -Math.max(0, c) * 42 * amp - 4] },
    arms: { L: { a: [-s * 24 * amp, 14 + 10 * amp] }, R: { a: [s * 24 * amp, 14 + 10 * amp] } },
    bob: -Math.abs(Math.cos(ph)) * 10 * amp, lean: 3 * amp,
  };
}
function runCycle(ph, amp = 1) {
  const s = Math.sin(ph), c = Math.cos(ph);
  return {
    legs: { L: [s * 38 * amp, -Math.max(0, -c) * 85 * amp - 8], R: [-s * 38 * amp, -Math.max(0, c) * 85 * amp - 8] },
    arms: { L: { a: [-s * 55 * amp, 70 * amp] }, R: { a: [s * 55 * amp, 70 * amp] } },
    bob: -Math.abs(Math.sin(ph)) * 26 * amp, lean: 12 * amp,
  };
}
const blinkK = (t, seed = 0) => { const per = 3.2 + rnd(seed) * 1.8, k = ((t + seed * 1.7) % per) / .15; return k < 1 ? Math.sin(k * Math.PI) : 0; };
// global defs: subtle static "hand-drawn" wobble for ink lines
const DEFS = `<defs><filter id="wob" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="1" seed="4"/><feDisplacementMap in="SourceGraphic" scale="2.2"/></filter></defs>`;

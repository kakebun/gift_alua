// Drawing library: helpers, the POV History hero, props.
const W = 1920, H = 1080;
const C = {
  ink: '#1c1a19', paper: '#fbf8f1', skin: '#ffffff',
  hair: '#4b2e1c', hairHi: '#6b4430',
  tunic: '#f3ede1', tunicSh: '#ddd3c1',
  cape: '#6e2627', capeSh: '#4d1a1b',
  belt: '#7a5232', boot: '#7d5434', bootSh: '#5c3c24',
  bronze: '#b8913f', bronzeSh: '#8f6d2b',
  steel: '#c7cbd0', steelSh: '#969ca4',
  red: '#a8322d', gold: '#e8c26a', wood: '#8a5a34', woodSh: '#6a4224',
  dirt: '#a07a52', dirtSh: '#7d5b3b', grass: '#9bb06a',
};
const SW = 6;

const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const eio = k => k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
const eout = k => 1 - Math.pow(1 - k, 3);
const ein = k => k * k * k;
const eback = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
const eelastic = k => k === 0 ? 0 : k === 1 ? 1 : Math.pow(2, -10 * k) * Math.sin((k * 10 - .75) * (2 * Math.PI / 3)) + 1;
const pop = (t, t0, d = .35) => eback(seg(t, t0, t0 + d));
const rad = d => d * Math.PI / 180;
const f = n => (Math.round(n * 10) / 10);
const noise1 = x => { // smooth 1D value noise
  const i = Math.floor(x), fr = x - i;
  const h = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const u = fr * fr * (3 - 2 * fr);
  return lerp(h(i), h(i + 1), u) * 2 - 1;
};
const rnd = n => { const s = Math.sin(n * 91.345 + 47.853) * 43758.5453; return s - Math.floor(s); };

const g = (tr, inner, extra = '') => `<g transform="${tr}" ${extra}>${inner}</g>`;
const T = (x, y, s = 1, r = 0) => `translate(${f(x)} ${f(y)}) rotate(${f(r)}) scale(${s})`;
const pathD = pts => 'M' + pts.map(p => f(p[0]) + ' ' + f(p[1])).join(' L') + ' Z';
const ink = (w = SW) => `stroke="${C.ink}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

function text(str, x, y, o = {}) {
  const p = Object.assign({ size: 80, fill: C.ink, font: 'Gochi Hand', anchor: 'middle', stroke: C.paper, sw: 0, rot: 0, s: 1, op: 1, weight: 'normal', ls: 0 }, o);
  const st = p.sw ? `stroke="${p.stroke}" stroke-width="${p.sw}" paint-order="stroke" stroke-linejoin="round"` : '';
  return `<g transform="${T(x, y, p.s, p.rot)}" opacity="${p.op}"><text x="0" y="0" font-family="${p.font}" font-size="${p.size}" font-weight="${p.weight}" fill="${p.fill}" text-anchor="${p.anchor}" dominant-baseline="middle" letter-spacing="${p.ls}" ${st}>${str}</text></g>`;
}

// ---------------- HERO ----------------
const HAIR = [[-96, 6], [-112, -22], [-96, -30], [-120, -62], [-92, -70], [-106, -106], [-70, -98], [-68, -136], [-38, -112], [-14, -150], [6, -116], [38, -144], [44, -110], [82, -124], [76, -90], [116, -94], [94, -62], [120, -44], [96, -26], [104, 4], [84, -14],
  [80, -40], [60, -32], [50, -58], [30, -40], [14, -64], [-4, -42], [-20, -66], [-36, -44], [-54, -62], [-64, -36], [-82, -48], [-90, -14]];

function brows(kind) {
  // [innerDy, outerDy] per side; positive = down
  const B = { neutral: [0, 0], angry: [12, -8], worried: [-10, 8], raised: [-14, -14], sad: [-8, 10], smug: null, focus: [8, -2] };
  let L = B[kind] || B.neutral, R = L;
  if (kind === 'smug') { L = [10, -6]; R = [-12, -12]; }
  const one = (side, d) => {
    const xi = side * 14, xo = side * 48, y = -30;
    return `<path d="M${xi} ${y + d[0]} Q${side * 31} ${y - 8 + (d[0] + d[1]) / 2} ${xo} ${y + d[1]}" fill="none" ${ink(7.5)}/>`;
  };
  return one(-1, L) + one(1, R);
}

function eyes(kind, blink, lx, ly) {
  const e = (x) => {
    const cx = x + lx, cy = 8 + ly;
    if (blink > .5 || kind === 'closed') return `<path d="M${cx - 11} ${cy} L${cx + 11} ${cy}" ${ink(6)}/>`;
    if (kind === 'happy') return `<path d="M${cx - 12} ${cy + 4} Q${cx} ${cy - 12} ${cx + 12} ${cy + 4}" fill="none" ${ink(6)}/>`;
    if (kind === 'squeeze') { const s = x < 0 ? 1 : -1; return `<path d="M${cx - 11 * s} ${cy - 9} L${cx + 9 * s} ${cy} L${cx - 11 * s} ${cy + 9}" fill="none" ${ink(6)}/>`; }
    if (kind === 'wide') return `<circle cx="${cx}" cy="${cy}" r="16" fill="#fff" ${ink(4)}/><circle cx="${cx + lx * .3}" cy="${cy + ly * .3}" r="6.5" fill="${C.ink}"/>`;
    if (kind === 'tired') return `<ellipse cx="${cx}" cy="${cy + 3}" rx="9" ry="8" fill="${C.ink}"/><path d="M${cx - 14} ${cy - 3} L${cx + 14} ${cy - 3}" ${ink(5)}/>`;
    return `<ellipse cx="${cx}" cy="${cy}" rx="9.5" ry="12.5" fill="${C.ink}"/><circle cx="${cx + 3}" cy="${cy - 4}" r="2.6" fill="#fff"/>`;
  };
  return e(-31) + e(31);
}

function mouth(kind, lx, open = 0) {
  const x = lx * .7, y = 50;
  const dark = '#3b1615', tongue = '#c9615c';
  switch (kind) {
    case 'grin': return `<g transform="translate(${x} ${y})"><path d="M-38 -8 Q0 -4 38 -8 Q32 34 0 36 Q-32 34 -38 -8 Z" fill="${dark}" ${ink(5)}/><path d="M-20 22 Q0 10 20 22 Q14 33 0 34 Q-14 33 -20 22 Z" fill="${tongue}"/></g>`;
    case 'frown': return `<path d="M${x - 26} ${y + 14} Q${x} ${y - 6} ${x + 26} ${y + 14}" fill="none" ${ink(6)}/>`;
    case 'o': return `<ellipse cx="${x}" cy="${y + 6}" rx="${11 + open * 6}" ry="${14 + open * 10}" fill="${dark}" ${ink(5)}/>`;
    case 'flat': return `<path d="M${x - 20} ${y + 6} L${x + 20} ${y + 6}" ${ink(6)}/>`;
    case 'grimace': return `<g transform="translate(${x} ${y + 6})"><rect x="-36" y="-14" width="72" height="28" rx="12" fill="#fff" ${ink(5)}/><path d="M-34 0 L34 0 M-18 -13 L-18 13 M0 -14 L0 14 M18 -13 L18 13" ${ink(3)}/></g>`;
    case 'wavy': return `<path d="M${x - 32} ${y + 6} q8 -9 16 0 t16 0 t16 0 t16 0" fill="none" ${ink(6)}/>`;
    case 'smirk': return `<path d="M${x - 24} ${y + 4} Q${x + 6} ${y + 16} ${x + 30} ${y - 8}" fill="none" ${ink(6)}/>`;
    case 'yawn': return `<ellipse cx="${x}" cy="${y + 10}" rx="${18 + open * 4}" ry="${24 + open * 6}" fill="${dark}" ${ink(5)}/><ellipse cx="${x}" cy="${y + 24 + open * 4}" rx="10" ry="6" fill="${tongue}"/>`;
    case 'chew': { const k = open; return `<path d="M${x - 18} ${y + 6 + k * 4} Q${x} ${y + 12 - k * 6} ${x + 18} ${y + 6 + k * 4}" fill="none" ${ink(6)}/>`; }
    case 'talk': return `<g transform="translate(${x} ${y})"><path d="M-30 -6 Q0 -2 30 -6 Q24 ${10 + open * 24} 0 ${12 + open * 24} Q-24 ${10 + open * 24} -30 -6 Z" fill="${dark}" ${ink(5)}/></g>`;
    default: return `<path d="M${x - 30} ${y - 6} Q${x} ${y + 20} ${x + 30} ${y - 6}" fill="none" ${ink(6)}/>`; // smile
  }
}

function helmetSVG(crest) {
  let s = '';
  if (crest) {
    s += `<path d="M-130 -118 Q0 -190 130 -118 Q0 -150 -130 -118 Z" fill="${C.red}" ${ink(5)}/>`;
    for (let i = -6; i <= 6; i++) s += `<path d="M${i * 19} ${-142 - Math.cos(i / 6) * 8} L${i * 21} ${-125}" stroke="#7d201c" stroke-width="3"/>`;
  }
  s += `<path d="M-112 18 L-120 28 Q-124 8 -104 -2 Z" fill="${C.steel}" ${ink(5)}/><path d="M112 18 L120 28 Q124 8 104 -2 Z" fill="${C.steel}" ${ink(5)}/>`; // neck guard flares
  s += `<path d="M-102 -2 Q-110 -128 0 -128 Q110 -128 102 -2 Q60 -18 0 -18 Q-60 -18 -102 -2 Z" fill="${C.steel}" ${ink(SW)}/>`;
  s += `<path d="M-60 -98 Q-30 -116 10 -114" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".6"/>`;
  s += `<path d="M-104 -10 Q0 -40 104 -10 L106 4 Q0 -24 -106 4 Z" fill="${C.bronze}" ${ink(4)}/>`; // brow band
  s += `<circle cx="0" cy="-128" r="11" fill="${C.bronze}" ${ink(4)}/>`;
  s += `<path d="M-100 0 L-74 2 Q-70 40 -84 66 Q-98 54 -102 30 Z" fill="${C.bronze}" ${ink(5)}/><path d="M100 0 L74 2 Q70 40 84 66 Q98 54 102 30 Z" fill="${C.bronze}" ${ink(5)}/>`; // cheek guards
  return s;
}

function headSVG(p) {
  const lx = (p.look || [0, 0])[0] * 12, ly = (p.look || [0, 0])[1] * 8;
  let s = '';
  s += `<circle cx="0" cy="0" r="92" fill="${C.skin}" ${ink(SW)}/>`;
  if (p.blush) s += `<ellipse cx="-56" cy="34" rx="16" ry="9" fill="#f0a8a0" opacity="${p.blush}"/><ellipse cx="56" cy="34" rx="16" ry="9" fill="#f0a8a0" opacity="${p.blush}"/>`;
  if (p.helmet) s += helmetSVG(p.crest);
  else if (p.hair !== 'none') {
    s += `<path d="${pathD(HAIR)}" fill="${p.hair || C.hair}" ${ink(5)}/>`;
    s += `<path d="M-60 -80 L-40 -60 M8 -96 L14 -72 M50 -88 L56 -70 M-20 -100 L-14 -80" stroke="${C.ink}" stroke-width="3" opacity=".55" stroke-linecap="round"/>`;
  }
  s += brows(p.brow || 'neutral');
  s += eyes(p.eyes || 'open', p.blink || 0, lx, ly);
  s += mouth(p.mouth || 'smile', lx, p.open || 0);
  if (p.mustache) s += `<path d="M-30 36 Q-14 26 0 34 Q14 26 30 36 Q14 44 0 38 Q-14 44 -30 36 Z" fill="${C.ink}"/>`;
  if (p.sweat) s += `<path d="M78 -26 Q90 -6 84 4 Q72 8 70 -4 Q70 -14 78 -26 Z" fill="#8fc6ea" ${ink(3)} opacity="${p.sweat}"/>`;
  if (p.sweat > 1.2) s += `<path d="M-84 -10 Q-74 8 -80 16 Q-92 18 -92 8 Q-92 0 -84 -10 Z" fill="#8fc6ea" ${ink(3)}/>`;
  return s;
}

const blinkAt = t => { const k = (t + 0.37) % 3.7; return k < 0.12 ? 1 : 0; };

// limb helper: returns [elbow, hand]
function limb(ox, oy, a1, a2, l1, l2) {
  const e = [ox + Math.sin(rad(a1)) * l1, oy + Math.cos(rad(a1)) * l1];
  const h = [e[0] + Math.sin(rad(a1 + a2)) * l2, e[1] + Math.cos(rad(a1 + a2)) * l2];
  return [e, h];
}

function boot(x, y, ang, flip) {
  return g(`translate(${f(x)} ${f(y)}) rotate(${f(-ang)}) scale(${flip ? -1 : 1} 1)`,
    `<path d="M-17 -40 L17 -40 L17 4 Q40 4 42 14 Q44 24 32 24 L-19 24 Q-22 0 -17 -40 Z" fill="${C.boot}" ${ink(5)}/><path d="M-19 -42 L19 -42 L19 -28 L-19 -28 Z" fill="${C.bootSh}" ${ink(4)}/>`);
}

// props held in hand. Drawn at hand pos, rotated by forearm angle a (deg from down).
const PROPS = {
  hourglass: (k) => {
    const sand = k.sand == null ? .5 : k.sand;
    return `<g transform="translate(0 -70) rotate(${k.rot || 0})"><rect x="-38" y="-62" width="76" height="12" rx="4" fill="${C.wood}" ${ink(4)}/><rect x="-38" y="50" width="76" height="12" rx="4" fill="${C.wood}" ${ink(4)}/>
      <path d="M-28 -50 Q-28 -10 -4 0 Q-28 10 -28 50 L28 50 Q28 10 4 0 Q28 -10 28 -50 Z" fill="#eef4f6" ${ink(4)}/>
      <path d="M${-22 * (1 - sand) - 4} ${-46 + 40 * sand} L${22 * (1 - sand) + 4} ${-46 + 40 * sand} L3 -2 L-3 -2 Z" fill="#d6b26e" opacity="${1 - sand > .02 ? 1 : 0}"/>
      <path d="M-24 47 Q0 ${47 - 40 * sand} 24 47 Z" fill="#d6b26e"/><path d="M0 0 L0 46" stroke="#d6b26e" stroke-width="2.5" opacity="${sand < .98 ? 1 : 0}"/></g>`;
  },
  sword: () => `<g transform="rotate(180)"><rect x="-6" y="-4" width="12" height="34" rx="4" fill="${C.wood}" ${ink(4)}/><rect x="-24" y="-12" width="48" height="10" rx="4" fill="${C.bronze}" ${ink(4)}/><path d="M-10 -12 L10 -12 L8 -150 L0 -172 L-8 -150 Z" fill="${C.steel}" ${ink(4)}/><path d="M0 -20 L0 -155" stroke="${C.steelSh}" stroke-width="3"/><circle cx="0" cy="32" r="8" fill="${C.bronze}" ${ink(4)}/></g>`,
  spoon: () => `<g transform="rotate(180)"><path d="M0 0 L0 -70" stroke="${C.wood}" stroke-width="8" stroke-linecap="round"/><ellipse cx="0" cy="-84" rx="13" ry="18" fill="${C.wood}" ${ink(4)}/></g>`,
  spoonFull: () => `<g transform="rotate(180)"><path d="M0 0 L0 -70" stroke="${C.wood}" stroke-width="8" stroke-linecap="round"/><ellipse cx="0" cy="-84" rx="13" ry="18" fill="${C.wood}" ${ink(4)}/><ellipse cx="0" cy="-90" rx="12" ry="10" fill="#d8c9a4" ${ink(3)}/></g>`,
  bowl: () => `<g transform="translate(0 -6)"><path d="M-62 -10 Q-58 46 0 48 Q58 46 62 -10 Z" fill="${C.wood}" ${ink(5)}/><ellipse cx="0" cy="-10" rx="62" ry="14" fill="#d8c9a4" ${ink(5)}/><path d="M-30 -12 q6 -6 12 0 M10 -8 q6 -6 12 0" stroke="#b8a77f" stroke-width="3" fill="none"/></g>`,
  cup: () => `<g transform="translate(0 -30)"><path d="M-30 -36 L30 -36 L24 34 Q0 42 -24 34 Z" fill="#c9875a" ${ink(5)}/><ellipse cx="0" cy="-36" rx="30" ry="8" fill="#9b4a52" ${ink(4)}/><path d="M30 -20 Q52 -16 46 6 Q40 18 26 14" fill="none" ${ink(5)}/></g>`,
  shovel: () => `<g transform="rotate(180)"><path d="M0 60 L0 -150" stroke="${C.wood}" stroke-width="11" stroke-linecap="round"/><path d="M0 60 L0 -150" stroke="${C.ink}" stroke-width="2" opacity=".4"/><path d="M-30 -146 L30 -146 L28 -200 Q0 -226 -28 -200 Z" fill="${C.steel}" ${ink(5)}/><rect x="-18" y="56" width="36" height="12" rx="5" fill="${C.wood}" ${ink(4)}/></g>`,
  vine: () => `<g transform="rotate(180)"><path d="M0 40 Q6 -20 -2 -70 Q-8 -120 4 -170" fill="none" stroke="${C.woodSh}" stroke-width="12" stroke-linecap="round"/><path d="M0 40 Q6 -20 -2 -70 Q-8 -120 4 -170" fill="none" stroke="${C.wood}" stroke-width="7" stroke-linecap="round"/><circle cx="2" cy="-40" r="6" fill="${C.woodSh}"/><circle cx="-6" cy="-110" r="6" fill="${C.woodSh}"/></g>`,
  pilum: () => `<g transform="rotate(180)"><path d="M0 120 L0 -120" stroke="${C.wood}" stroke-width="9" stroke-linecap="round"/><path d="M0 -120 L0 -230" stroke="${C.steelSh}" stroke-width="5"/><path d="M-7 -230 L0 -252 L7 -230 Z" fill="${C.steel}" ${ink(3)}/><rect x="-8" y="-128" width="16" height="20" fill="${C.bronze}" ${ink(3)}/></g>`,
  coin: () => `<circle cx="0" cy="-14" r="18" fill="#d9dce0" ${ink(4)}/><circle cx="0" cy="-14" r="10" fill="none" stroke="#9aa0a6" stroke-width="3"/>`,
  shieldHold: () => scutum(0, 0, 1),
};

function scutum(x, y, s = 1, r = 0) {
  return g(T(x, y, s, r), `<path d="M-82 -140 Q-100 0 -82 140 L82 140 Q100 0 82 -140 Z" fill="${C.red}" ${ink(SW)}/>
    <path d="M-66 -124 Q-82 0 -66 124 L66 124 Q82 0 66 -124 Z" fill="none" stroke="${C.gold}" stroke-width="7"/>
    <path d="M-60 -10 L-26 -40 L-40 -6 L-10 -20 M60 -10 L26 -40 L40 -6 L10 -20 M-60 10 L-26 40 L-40 6 L-10 20 M60 10 L26 40 L40 6 L10 20" fill="none" stroke="${C.gold}" stroke-width="7" stroke-linejoin="round"/>
    <circle cx="0" cy="0" r="26" fill="${C.bronze}" ${ink(5)}/><circle cx="-7" cy="-7" r="8" fill="#e6c77a"/>`);
}

function packSVG() { // furca pole with bundle, pot and tools; local origin = top of pole near hand
  return `<path d="M0 0 L-150 -170" stroke="${C.wood}" stroke-width="11" stroke-linecap="round"/>
    <path d="M-150 -170 L-190 -170" stroke="${C.wood}" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="-160" cy="-140" rx="44" ry="38" fill="#c9b48a" ${ink(5)}/><path d="M-196 -150 Q-160 -128 -124 -150" fill="none" ${ink(3)}/>
    <path d="M-126 -110 Q-126 -78 -100 -78 Q-74 -78 -74 -110 Z" fill="#555" ${ink(4)}/><path d="M-130 -112 L-70 -112" ${ink(5)}/>
    <path d="M-196 -128 L-208 -60" stroke="${C.wood}" stroke-width="7"/><path d="M-222 -66 L-196 -54 L-200 -70 Z" fill="${C.steel}" ${ink(3)}/>
    <path d="M-110 -150 L-94 -150 L-94 -120 L-110 -120 Z" fill="#a46b3b" ${ink(3)}/>`;
}

function armorSVG() {
  let s = '';
  const bands = [-338, -312, -288, -264, -240];
  for (let i = bands.length - 1; i >= 0; i--) {
    const y = bands[i], wd = 56 - i * 1.5;
    s += `<path d="M${-wd} ${y} L${wd} ${y} L${wd - 2} ${y + 28} L${-wd + 2} ${y + 28} Z" fill="${i % 2 ? C.steel : '#d2d6da'}" ${ink(4)}/>`;
  }
  s += `<path d="M-60 -346 Q-92 -340 -90 -300 L-62 -306 Z" fill="${C.steel}" ${ink(4)}/><path d="M60 -346 Q92 -340 90 -300 L62 -306 Z" fill="${C.steel}" ${ink(4)}/>`;
  s += `<path d="M-22 -346 L22 -346 L16 -326 L-16 -326 Z" fill="${C.bronze}" ${ink(3)}/>`;
  s += `<rect x="-58" y="-216" width="116" height="14" rx="4" fill="${C.belt}" ${ink(4)}/>`;
  for (let i = -2; i <= 2; i++) s += `<path d="M${i * 10} -202 L${i * 10} -168" stroke="${C.belt}" stroke-width="5"/><circle cx="${i * 10}" cy="-166" r="3.5" fill="${C.bronze}"/>`;
  return s;
}

/*
 hero(o): full-body character, feet on (x,y).
 arms: aL/aR = [shoulderAngle, elbowBend] (deg, 0 = straight down, + = toward +x)
 legs: lL/lR = [hipAngle, kneeBend]
*/
function hero(o) {
  const p = Object.assign({
    x: 0, y: 0, s: 1, flip: false, rot: 0, lean: 0, tilt: 0,
    aL: [12, -6], aR: [-12, 6], lL: [4, 0], lR: [-4, 0],
    brow: 'neutral', eyes: 'open', mouth: 'smile', look: [0, 0], blink: 0, open: 0,
    helmet: false, crest: false, armor: false, shield: 0, pack: false, hair: C.hair,
    cape: true, capeColor: C.cape, capeSh: C.capeSh, wave: 0, t: 0,
    holdR: null, holdL: null, propK: {}, squash: 1, ground: true, sweat: 0, mustache: false, legShake: 0, scabbard: false,
    tunic: C.tunic, blush: 0,
  }, o);
  const hip = -167;
  // legs
  const legs = [[-20, p.lL], [20, p.lR]].map(([hx, a]) => {
    const sh = p.legShake ? Math.sin(p.t * 50 + hx) * p.legShake : 0;
    const [k, ft] = limb(hx, hip, a[0], a[1] + sh, 75, 72);
    return { hx, k, ft, a: a[0] + a[1] + sh };
  });
  let dy = 0;
  if (p.ground) { const low = Math.max(legs[0].ft[1], legs[1].ft[1]); dy = -(low + 24); }
  const upperRot = p.lean;
  const sh = [[-70, -292], [70, -292]];
  const armL = limb(sh[0][0], sh[0][1], p.aL[0], p.aL[1], 66, 62);
  const armR = limb(sh[1][0], sh[1][1], p.aR[0], p.aR[1], 66, 62);

  let back = '', front = '';
  // cape (behind)
  if (p.cape) {
    const wv = i => Math.sin(p.t * 3 + i * 1.3) * p.wave;
    const cp = [[-54, -344], [54, -344], [80 + wv(1) * .3, -250], [96 + wv(2), -120], [70 + wv(3), -128], [50 + wv(4), -100], [20 + wv(5), -118], [-14 + wv(6), -96], [-46 + wv(7), -116], [-70 + wv(8), -102], [-100 + wv(9), -122], [-82 + wv(1) * .3, -250]];
    back += `<path d="${pathD(cp)}" fill="${p.capeColor}" ${ink(SW)}/><path d="M-70 -250 Q-80 -170 -86 -118 L-60 -110 Q-62 -190 -54 -250 Z" fill="${p.capeSh}" opacity=".7"/>`;
  }
  if (p.pack) back = g(`translate(-10 -250) scale(-1 1)`, packSVG()) + back;
  // legs
  let legsS = '';
  for (const L of legs) {
    legsS += `<path d="M${L.hx} ${hip} L${f(L.k[0])} ${f(L.k[1])} L${f(L.ft[0])} ${f(L.ft[1])}" fill="none" ${ink(7)}/>`;
    legsS += boot(L.ft[0], L.ft[1], L.a, p.flip && false);
  }
  // torso
  let torso = `<path d="M-22 -350 L22 -350 L52 -342 Q66 -336 74 -318 L86 -290 L60 -280 L54 -296 L56 -176 L32 -170 L12 -177 L-10 -169 L-34 -177 L-56 -172 L-54 -296 L-60 -280 L-86 -290 L-74 -318 Q-66 -336 -52 -342 Z" fill="${p.tunic}" ${ink(SW)}/>`;
  torso += `<path d="M20 -340 L44 -300 L46 -178 L30 -174 Z" fill="${C.tunicSh}" opacity=".55"/>`;
  torso += `<path d="M-10 -348 L0 -322 L10 -348" fill="none" ${ink(3)}/>`;
  torso += `<rect x="-55" y="-252" width="110" height="15" rx="4" fill="${C.belt}" ${ink(4)}/>`;
  if (p.armor) torso += armorSVG();
  if (p.cape) torso += `<path d="M-60 -344 Q-40 -312 0 -318 Q40 -312 60 -344 Q30 -360 0 -356 Q-30 -360 -60 -344 Z" fill="${p.capeColor}" ${ink(5)}/><circle cx="42" cy="-334" r="13" fill="${C.bronze}" ${ink(4)}/>`;
  if (p.scabbard) torso += `<g transform="translate(-50 -232) rotate(18)"><rect x="-9" y="0" width="18" height="110" rx="6" fill="#5a3a24" ${ink(4)}/><rect x="-14" y="-14" width="28" height="12" rx="4" fill="${C.bronze}" ${ink(3)}/><rect x="-6" y="-40" width="12" height="28" rx="4" fill="${C.wood}" ${ink(3)}/></g>`;
  // arms
  const armPath = (sp, A) => `<path d="M${sp[0]} ${sp[1]} L${f(A[0][0])} ${f(A[0][1])} L${f(A[1][0])} ${f(A[1][1])}" fill="none" ${ink(7)}/>`;
  const hand = A => `<circle cx="${f(A[1][0])}" cy="${f(A[1][1])}" r="15" fill="${C.ink}"/>`;
  const prop = (A, name, aa) => {
    if (!name) return '';
    const fn = PROPS[name];
    const ang = name === 'hourglass' || name === 'bowl' || name === 'cup' || name === 'coin' || name === 'shieldHold' ? 0 : -(aa);
    const extra = A === armL ? (p.propRotL || 0) : (p.propRotR || 0);
    const ps = A === armL ? (p.propSL || 1) : (p.propSR || 1);
    let inner = fn(p.propK);
    if (name === 'pilum' && p.twoPila) inner += g('translate(18 6)', fn(p.propK));
    return g(`translate(${f(A[1][0])} ${f(A[1][1])}) rotate(${f(ang + extra)}) scale(${ps})`, inner);
  };
  let arms = '';
  arms += armPath(sh[0], armL) + armPath(sh[1], armR);
  let held = prop(armL, p.holdL, p.aL[0] + p.aL[1]) + prop(armR, p.holdR, p.aR[0] + p.aR[1]);
  let hands = hand(armL) + hand(armR);
  let shieldS = p.shield ? g(`translate(${f(armL[1][0] + 10)} ${f(armL[1][1] - 20)})`, scutum(0, 0, .82 * p.shield)) : '';
  // head
  const headS = g(`translate(0 -455) rotate(${p.tilt})`, headSVG(p));
  const neck = `<path d="M0 -365 L0 -348" ${ink(7)}/>`;
  const capeG = g(`rotate(${f(upperRot)} 0 ${hip})`, back);
  const upper = g(`rotate(${f(upperRot)} 0 ${hip})`, torso + neck + headS + arms + held + hands + shieldS);
  const body = capeG + legsS + upper;
  const sx = (p.flip ? -1 : 1) * p.s, sy = p.s * p.squash;
  return g(`translate(${f(p.x)} ${f(p.y)}) rotate(${f(p.rot)}) scale(${f(sx * 1000) / 1000} ${f(sy * 1000) / 1000}) translate(0 ${f(dy)})`, body);
}

// walk cycle pose
function walkPose(ph, amp = 1) {
  const s = Math.sin(ph), c = Math.cos(ph);
  return {
    lL: [s * 26 * amp, -Math.max(0, -c) * 40 * amp - 4], lR: [-s * 26 * amp, -Math.max(0, c) * 40 * amp - 4],
    aL: [-s * 22 * amp + 8, 20 * amp], aR: [s * 22 * amp - 8, 20 * amp],
  };
}

// soft shadow under character
const shadow = (x, y, w = 120, op = .18) => `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${w}" ry="${w * .16}" fill="#000" opacity="${op}"/>`;

// generic sleeping/other head
function otherHead(x, y, s, o) {
  return g(T(x, y, s, o.rot || 0), headSVG(Object.assign({ hair: '#2b2b2b' }, o)));
}

function swirl(cx, cy, r, t, op = 1) {
  let s = `<defs><radialGradient id="sw" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff6d8"/><stop offset=".55" stop-color="#f1d58e"/><stop offset=".9" stop-color="#d9ae55"/><stop offset="1" stop-color="#e6c26f" stop-opacity="0"/></radialGradient></defs>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 1.12}" fill="url(#sw)" opacity="${op * .5}"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sw)" opacity="${op}"/>`;
  let arcs = '';
  for (let i = 0; i < 9; i++) {
    const rr = r * (0.2 + i * 0.09), a0 = t * (60 + i * 12) + i * 40;
    arcs += `<path d="M${rr} 0 A${rr} ${rr} 0 0 1 ${f(rr * Math.cos(rad(200)))} ${f(rr * Math.sin(rad(200)))}" fill="none" stroke="#fffaf0" stroke-width="${6 + i}" stroke-linecap="round" opacity=".45" transform="rotate(${f(a0)})"/>`;
  }
  s += g(`translate(${cx} ${cy})`, arcs, `opacity="${op}"`);
  s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#c79a42" stroke-width="5" opacity="${op * .8}"/>`;
  return s;
}

function campfire(x, y, t, s = 1) {
  let fl = '';
  const flame = (dx, h, w, col, ph) => {
    const k = 1 + noise1(t * 6 + ph) * .18, sx = noise1(t * 4 + ph * 3) * 10;
    return `<path d="M${dx - w} 0 Q${dx - w} ${-h * .5 * k} ${dx + sx} ${-h * k} Q${dx + w} ${-h * .5 * k} ${dx + w} 0 Z" fill="${col}"/>`;
  };
  fl += flame(0, 170, 62, '#e8662c', 1) + flame(-30, 120, 40, '#e8662c', 2) + flame(34, 130, 40, '#e8662c', 3);
  fl += flame(0, 120, 42, '#f4a43a', 4) + flame(-22, 80, 26, '#f4a43a', 5) + flame(24, 90, 26, '#f4a43a', 6);
  fl += flame(0, 70, 24, '#ffe08a', 7);
  let logs = `<g><rect x="-90" y="-14" width="180" height="26" rx="12" fill="${C.wood}" ${ink(5)} transform="rotate(12)"/><rect x="-90" y="-14" width="180" height="26" rx="12" fill="${C.woodSh}" ${ink(5)} transform="rotate(-12)"/></g>`;
  let sparks = '';
  for (let i = 0; i < 6; i++) { const ph = (t * .7 + i / 6) % 1; sparks += `<circle cx="${f(Math.sin(i * 7 + ph * 6) * 40)}" cy="${f(-60 - ph * 220)}" r="${3 * (1 - ph) + 1}" fill="#ffd27a" opacity="${1 - ph}"/>`; }
  return g(T(x, y, s), fl + logs + sparks);
}

function tentShape(x, y, s = 1, col = '#d8c39c', dark = '#b49c72') {
  return g(T(x, y, s), `<path d="M-120 0 L0 -150 L120 0 Z" fill="${col}" ${ink(5)}/><path d="M0 -150 L-26 0 L26 0 Z" fill="${dark}" ${ink(4)}/><path d="M-120 0 L120 0" ${ink(5)}/>`);
}

function mule(x, y, s, t, o = {}) {
  const bl = blinkAt(t + 1.3);
  const leg = (lx) => `<path d="M${lx} -100 L${lx} -10" ${ink(8)}/><rect x="${lx - 10}" y="-14" width="20" height="14" rx="4" fill="${C.ink}"/>`;
  let s2 = leg(-70) + leg(-40) + leg(60) + leg(85);
  s2 += `<path d="M-110 -140 Q-120 -100 -136 -86" fill="none" ${ink(6)}/><path d="M-140 -92 l-8 14 l14 -4 z" fill="${C.ink}"/>`;
  s2 += `<ellipse cx="0" cy="-140" rx="120" ry="58" fill="#a59a8e" ${ink(SW)}/>`;
  if (o.pack) s2 += `<ellipse cx="-10" cy="-196" rx="56" ry="30" fill="#c9b48a" ${ink(5)}/><path d="M-30 -170 L-34 -120 M20 -170 L24 -120" ${ink(4)}/>`;
  s2 += `<path d="M90 -170 Q130 -240 150 -230 Q190 -220 190 -170 Q186 -140 150 -150 Q120 -150 104 -130 Z" fill="#a59a8e" ${ink(SW)}/>`;
  s2 += `<path d="M140 -232 Q128 -320 150 -326 Q164 -290 156 -232 Z" fill="#a59a8e" ${ink(5)}/><path d="M164 -228 Q170 -316 192 -312 Q192 -276 176 -226 Z" fill="#a59a8e" ${ink(5)}/>`;
  s2 += `<ellipse cx="182" cy="-162" rx="14" ry="10" fill="#d6cbbd" ${ink(3)}/>`;
  s2 += bl ? `<path d="M152 -200 L166 -200" ${ink(5)}/>` : `<ellipse cx="160" cy="-200" rx="7" ry="9" fill="${C.ink}"/>`;
  return g(T(x, y, s), s2);
}

function coinSVG(x, y, s = 1, r = 0, tilt = 1) {
  return g(T(x, y, s, r), `<ellipse cx="0" cy="0" rx="${f(30 * tilt)}" ry="30" fill="#d9dce0" ${ink(5)}/><ellipse cx="0" cy="0" rx="${f(20 * tilt)}" ry="20" fill="none" stroke="#9aa0a6" stroke-width="4"/><path d="M${f(-6 * tilt)} -10 Q${f(8 * tilt)} -8 ${f(6 * tilt)} 4 Q${f(4 * tilt)} 12 ${f(-6 * tilt)} 10" fill="none" stroke="#8a9096" stroke-width="3"/>`);
}

function bubble(x, y, w, h, tailX, tailY, inner, op = 1, s = 1) { // thought bubble
  let c = `<ellipse cx="0" cy="0" rx="${w / 2}" ry="${h / 2}" fill="#fff" ${ink(5)}/>`;
  c += `<circle cx="${f(tailX * .55)}" cy="${f(tailY * .55)}" r="16" fill="#fff" ${ink(4)}/><circle cx="${f(tailX * .8)}" cy="${f(tailY * .8)}" r="10" fill="#fff" ${ink(4)}/>`;
  return g(T(x, y, s), c + inner, `opacity="${op}"`);
}

function arrow(x1, y1, x2, y2, w = 5) {
  const a = Math.atan2(y2 - y1, x2 - x1), hl = 22;
  const mx = (x1 + x2) / 2 + (y2 - y1) * .15, my = (y1 + y2) / 2 - (x2 - x1) * .15;
  return `<path d="M${x1} ${y1} Q${f(mx)} ${f(my)} ${x2} ${y2}" fill="none" ${ink(w)}/><path d="M${f(x2 - hl * Math.cos(a - .5))} ${f(y2 - hl * Math.sin(a - .5))} L${x2} ${y2} L${f(x2 - hl * Math.cos(a + .5))} ${f(y2 - hl * Math.sin(a + .5))}" fill="none" ${ink(w)}/>`;
}

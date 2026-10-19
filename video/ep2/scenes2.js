// Episode 2: "What If You Woke Up in Ancient Rome?" — scenes
const cam = (inner, cx, cy, z, rot = 0) => g(`translate(960 540) rotate(${f(rot)}) scale(${f(z * 1000) / 1000}) translate(${f(-cx)} ${f(-cy)})`, inner);
const shake = (t, a) => [noise1(t * 23) * a, noise1(t * 23 + 40) * a];
const lf = (S, i, fr) => S.L[i][0] + (S.L[i][1] - S.L[i][0]) * fr;
const op = (v, inner) => v <= 0.001 ? '' : v >= .999 ? inner : `<g opacity="${f(v * 1000) / 1000}">${inner}</g>`;
const label = (str, x, y, t, t0, o = {}) => t < t0 ? '' : text(str, x, y, Object.assign({ s: pop(t, t0, .5), sw: 12 }, o, { op: (o.op == null ? 1 : o.op) * fadeI(t, t0, .15) }));
// convert world point -> person-local point (for IK targets)
function toLocal(o, wx, wy) {
  const s = o.s || 1, lean = o.lean || 0;
  let lx = (wx - o.x) / s * (o.flip ? -1 : 1), ly = (wy - o.y) / s;
  const a = rad(-lean * (o.flip ? 1 : 1)), cy = HIP;
  const dx = lx, dy = ly - cy;
  return [dx * Math.cos(a) - dy * Math.sin(a), dx * Math.sin(a) + dy * Math.cos(a) + cy];
}
const NPC = {
  merchant: { hairStyle: 'short', hairCol: HAIRCOL.black, mustache: true, cape: false, tunicCol: '#b8773f', tunicSh: '#99602f', apron: '#eadfc6' },
  woman: { hairStyle: 'long', hairCol: HAIRCOL.brown, cape: false, dress: true, tunicCol: '#86a3bb', tunicSh: '#6d8aa2', belt: false },
  oldman: { hairStyle: 'bald', hairCol: HAIRCOL.grey, beard: true, cape: false, toga: true, tunicCol: '#efe9dc' },
  boy: { hairStyle: 'curly', hairCol: HAIRCOL.blond, cape: false, tunicCol: '#8aa36a', tunicSh: '#728a54', s: .78 },
  lady: { hairStyle: 'bun', hairCol: HAIRCOL.black, cape: false, dress: true, tunicCol: '#c98d86', tunicSh: '#ad716b', belt: false },
  worker: { hairStyle: 'short', hairCol: HAIRCOL.red, cape: false, beard: true, tunicCol: '#9c8a6e', tunicSh: '#83725a' },
  soldier: { helmet: true, armor: true, capeCol: '#9c2a2a', tunicCol: '#b8473f', tunicSh: '#963630' },
};
const npc = (kind, o) => person(Object.assign({}, NPC[kind], o, { s: (o.s || 1) * (NPC[kind].s || 1) }));

// ---------------------------------------------------------------- PROPS
function hourglassSVG(sand = .3, glow = 0, t = 0, flipK = 0) {
  let s = '';
  if (glow > .01) {
    const id = uid('hgl'), pulse = 1 + Math.sin(t * 5) * .06;
    s += `<defs><radialGradient id="${id}"><stop offset="0" stop-color="#fff3b0" stop-opacity="${f(.9 * glow)}"/><stop offset=".4" stop-color="#ffcf5a" stop-opacity="${f(.45 * glow)}"/><stop offset="1" stop-color="#ffb02e" stop-opacity="0"/></radialGradient></defs>`;
    s += `<circle cx="0" cy="0" r="${f(170 * pulse * (.6 + glow * .6))}" fill="url(#${id})"/>`;
  }
  const cap = y => `<path d="M-46 ${y - 9} Q-50 ${y} -46 ${y + 9} L46 ${y + 9} Q50 ${y} 46 ${y - 9} Z" fill="${C.wood}" ${ink(4.5)}/><path d="M-40 ${y - 3} L40 ${y - 3}" stroke="${C.woodHi}" stroke-width="4" opacity=".7"/>`;
  s += `<path d="M-34 -64 L-34 64 M34 -64 L34 64" stroke="${C.woodSh}" stroke-width="7" stroke-linecap="round"/>`;
  s += `<path d="M-28 -64 Q-28 -16 -5 0 Q-28 16 -28 64 L28 64 Q28 16 5 0 Q28 -16 28 -64 Z" fill="#eef5f6" fill-opacity=".85" ${ink(4)}/>`;
  const col = glow > .01 ? `rgb(${f(214 + 41 * glow)},${f(178 + 50 * glow)},${f(110 + 40 * glow)})` : '#d6b26e';
  const top = 1 - sand;
  if (top > .02) s += `<path d="M${f(-24 * Math.sqrt(top))} ${f(-6 - 52 * top)} Q0 ${f(-10 - 56 * top)} ${f(24 * Math.sqrt(top))} ${f(-6 - 52 * top)} L4 -3 L-4 -3 Z" fill="${col}"/>`;
  s += `<path d="M-24 60 Q0 ${f(60 - 50 * sand)} 24 60 Z" fill="${col}"/>`;
  if (sand < .99 && top > .01) s += `<path d="M0 -2 L0 58" stroke="${col}" stroke-width="3"/>`;
  s += `<path d="M-18 -54 Q-20 -30 -10 -14" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
  s += cap(-70) + cap(70);
  if (glow > .2) for (let i = 0; i < 6; i++) { const a = t * 1.6 + i * 1.05, r = 70 + Math.sin(t * 2 + i) * 14; s += `<circle cx="${f(Math.cos(a) * r)}" cy="${f(Math.sin(a) * r * .7)}" r="${f(2.5 + (i % 3))}" fill="#fff6c9" opacity="${f(glow * (.5 + .5 * Math.sin(t * 6 + i)))}"/>`; }
  return s;
}
function sparkle(x, y, s, rot = 0, opv = 1) {
  return op(opv, g(T(x, y, s, rot), `<path d="M0 -30 Q4 -4 30 0 Q4 4 0 30 Q-4 4 -30 0 Q-4 -4 0 -30 Z" fill="#fff8d6"/>`));
}
function chestSVG(lidK = 1) {
  let s = '';
  s += g(`translate(0 -150) rotate(${f(-100 * lidK)} -150 0)`, `<path d="M-150 -60 Q0 -110 150 -60 L150 0 L-150 0 Z" fill="${C.woodSh}" ${ink(5)}/><path d="M-90 -80 L-90 0 M90 -80 L90 0" stroke="#3b2414" stroke-width="10"/>`);
  s += `<path d="M-150 -150 L150 -150 L150 0 L-150 0 Z" fill="${C.wood}" ${ink(5)}/>`;
  s += `<path d="M-144 -146 L144 -146 L144 -128 L-144 -128 Z" fill="#2e1c10"/>`;
  for (let i = 0; i < 3; i++) s += `<path d="M-150 ${-110 + i * 40} L150 ${-110 + i * 40}" stroke="${C.woodSh}" stroke-width="3" opacity=".7"/>`;
  s += `<path d="M-100 -150 L-100 0 M100 -150 L100 0" stroke="#6d6a66" stroke-width="12"/><path d="M-100 -150 L-100 0 M100 -150 L100 0" stroke="${C.ink}" stroke-width="2" opacity=".5"/>`;
  s += `<rect x="-18" y="-120" width="36" height="40" rx="6" fill="${C.bronze}" ${ink(4)}/><circle cx="0" cy="-104" r="5" fill="${C.ink}"/>`;
  return s;
}
function boxSVG(w, h, col = '#c79a62') {
  return `<rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" rx="4" fill="${col}" ${ink(4.5)}/><path d="M${-w / 2 + 6} ${-h * .5} L${w / 2 - 6} ${-h * .5}" stroke="#a87f4c" stroke-width="3"/><rect x="-14" y="${-h}" width="28" height="${h * .45}" fill="#e3c99a" opacity=".8"/>`;
}

// ---------------------------------------------------------------- BACKGROUNDS
function atticBG(t, k = {}) {
  const glow = k.glow || 0;
  let s = `<defs><linearGradient id="atw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2f2119"/><stop offset="1" stop-color="#6b4b34"/></linearGradient>
    <linearGradient id="atsun" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffcf7d"/><stop offset=".55" stop-color="#ff9a6a"/><stop offset="1" stop-color="#c46a8f"/></linearGradient>
    <linearGradient id="atbeam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd38a" stop-opacity=".42"/><stop offset="1" stop-color="#ffd38a" stop-opacity="0"/></linearGradient>
    <radialGradient id="atwin" cx="1300" cy="330" r="380" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffb46b" stop-opacity=".45"/><stop offset="1" stop-color="#ffb46b" stop-opacity="0"/></radialGradient></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#atw)"/>`;
  for (let i = 0; i < 12; i++) s += `<path d="M${120 + i * 150} 0 L${120 + i * 150} 830" stroke="#2a1c13" stroke-width="3" opacity=".35"/>`;
  s += `<rect width="1920" height="1080" fill="url(#atwin)"/>`;
  // window
  s += `<circle cx="1300" cy="330" r="112" fill="url(#atsun)"/><circle cx="1300" cy="330" r="112" fill="none" stroke="${C.woodSh}" stroke-width="22"/><circle cx="1300" cy="330" r="112" fill="none" ${ink(5)}/><circle cx="1300" cy="330" r="124" fill="none" ${ink(4)}/>`;
  s += `<path d="M1300 218 L1300 442 M1188 330 L1412 330" stroke="${C.woodSh}" stroke-width="12"/><path d="M1232 280 Q1260 250 1300 245" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".5"/>`;
  s += `<path d="M1190 228 Q1215 238 1222 262 M1190 228 L1240 230 M1190 228 L1204 276" fill="none" stroke="#d9d0c3" stroke-width="2" opacity=".5"/>`;
  // roof planes and rafters
  s += `<path d="M0 0 L780 0 L0 760 Z" fill="#3a271a" ${ink(5)}/><path d="M1920 0 L1140 0 L1920 760 Z" fill="#3a271a" ${ink(5)}/>`;
  for (let i = 1; i < 6; i++) { s += `<path d="M${i * 130} 0 L0 ${i * 127}" stroke="#2a1b12" stroke-width="3" opacity=".6"/><path d="M${1920 - i * 130} 0 L1920 ${i * 127}" stroke="#2a1b12" stroke-width="3" opacity=".6"/>`; }
  s += `<path d="M640 0 L680 0 L0 690 L0 640 Z" fill="${C.wood}" ${ink(5)}/><path d="M1280 0 L1240 0 L1920 690 L1920 640 Z" fill="${C.wood}" ${ink(5)}/>`;
  s += `<rect x="560" y="0" width="800" height="44" fill="${C.woodSh}" ${ink(5)}/>`;
  // floor
  s += `<rect y="830" width="1920" height="250" fill="#5a3c28"/><path d="M0 830 L1920 830" ${ink(5)}/>`;
  for (let i = 0; i < 5; i++) s += `<path d="M0 ${872 + i * 48} L1920 ${872 + i * 48}" stroke="#432c1d" stroke-width="3"/>`;
  for (let i = 0; i < 18; i++) { const r = Math.floor(i / 4); s += `<path d="M${f((rnd(i) * 1920))} ${832 + r * 48} l0 40" stroke="#432c1d" stroke-width="3"/>`; }
  // beam of light
  s += `<path d="M1210 300 L1390 360 L1180 1000 L620 1000 Z" fill="url(#atbeam)"/>`;
  // dust
  for (let i = 0; i < 26; i++) {
    const u = (rnd(i) + t * .012 * (1 + rnd(i + 3))) % 1, v = rnd(i + 9);
    const x = lerp(lerp(1220, 1380, v), lerp(640, 1180, v), u) + Math.sin(t * .7 + i) * 18, y = lerp(320, 980, u) + Math.cos(t * .5 + i) * 10;
    s += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(1.6 + rnd(i + 5) * 2.2)}" fill="#ffe6b0" opacity="${f(.25 + .45 * Math.sin(t * 1.3 + i) ** 2)}"/>`;
  }
  // hanging bulb
  const sw = Math.sin(t * 1.1) * 3 + (k.wind || 0) * Math.sin(t * 9) * 6;
  s += g(`translate(600 44) rotate(${f(sw)})`, `<path d="M0 0 L0 220" stroke="${C.ink}" stroke-width="3"/><rect x="-12" y="216" width="24" height="18" fill="#6d6a66" ${ink(3)}/><path d="M-20 236 Q-24 272 0 280 Q24 272 20 236 Z" fill="#f0e2b6" fill-opacity=".85" ${ink(3.5)}/>`);
  // props: boxes stack, covered painting, lamp
  const rat = k.wind ? (i) => Math.sin(t * 28 + i) * k.wind * 3 : () => 0;
  s += g(`translate(${f(250 + rat(1))} 900)`, boxSVG(240, 170));
  s += g(`translate(${f(270 + rat(2))} 730) rotate(${f(-3 + rat(3) * .3)})`, boxSVG(200, 140, '#b98d58'));
  s += g(`translate(${f(240 + rat(4))} 590) rotate(${f(4 + rat(5) * .3)})`, boxSVG(150, 110, '#cfa46c'));
  s += g(`translate(${f(520 + rat(6))} 900) rotate(-8)`, `<path d="M-90 0 L-70 -300 L90 -300 L110 0 Z" fill="#d9d2c4" ${ink(5)}/><path d="M-60 -280 Q-40 -150 -70 0 M20 -300 Q40 -150 10 0 M70 -290 Q60 -150 90 0" fill="none" stroke="#bdb5a6" stroke-width="5"/>`);
  return s;
}

function cloud(x, y, s, opv = .9) {
  return g(T(x, y, s), `<path d="M-120 20 Q-130 -20 -90 -26 Q-80 -70 -30 -60 Q-6 -96 40 -70 Q90 -80 96 -30 Q136 -24 126 20 Z" fill="#fffaf2" opacity="${opv}"/>`);
}
function skyPOV(t) {
  let s = `<defs><linearGradient id="psky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fb7dd"/><stop offset="1" stop-color="#d9ecf4"/></linearGradient></defs><rect width="1920" height="1080" fill="url(#psky)"/>`;
  s += cloud(500 + t * 14, 300, 1.5) + cloud(1400 + t * 10, 520, 1.1, .8) + cloud(1050 + t * 8, 200, .8, .7);
  // building walls seen from below, converging to the center
  const wall = (side) => {
    const sx = side < 0 ? 0 : 1920, inner = side < 0 ? 520 : 1400;
    let w = `<path d="M${sx} 0 L${inner} 0 L${lerp(inner, 960, .35)} 1080 L${sx} 1080 Z" fill="${side < 0 ? '#d9a066' : '#e2c48e'}" ${ink(5)}/>`;
    w += `<path d="M${sx} 0 L${inner} 0 L${lerp(inner, 960, .35)} 1080 L${sx} 1080 Z" fill="#000" opacity=".08"/>`;
    for (let i = 0; i < 4; i++) {
      const y = 140 + i * 230, k = y / 1080, ix = lerp(inner, lerp(inner, 960, .35), k);
      const x0 = side < 0 ? ix - 210 : ix + 70, wd = 130;
      w += `<path d="M${f(x0)} ${y} l${wd} ${f(side * 12)} l0 120 l${-wd} ${f(-side * 12)} Z" fill="#4a3426" ${ink(4)}/><path d="M${f(x0 + wd / 2)} ${f(y + side * 6)} l0 120" stroke="${C.woodSh}" stroke-width="6"/>`;
    }
    return w;
  };
  s += wall(-1) + wall(1);
  // laundry line
  const sag = 60 + Math.sin(t) * 5;
  s += `<path d="M560 230 Q960 ${230 + sag} 1360 230" fill="none" stroke="#5d4a3a" stroke-width="3"/>`;
  [[700, '#c96a5a'], [880, '#e9e1cf'], [1080, '#7d9bb5'], [1220, '#d9b45a']].forEach(([x, c], i) => { const yy = 230 + sag * (1 - Math.pow((x - 960) / 400, 2)) - 4; s += g(`translate(${x} ${f(yy)}) rotate(${f(Math.sin(t * 2 + i) * 4)})`, `<path d="M-40 0 L40 0 L36 90 L-36 90 Z" fill="${c}" ${ink(4)}/>`); });
  const bx = (t * 160) % 2600 - 300; s += g(`translate(${f(bx)} ${f(420 + Math.sin(t * 2) * 20)})`, `<path d="M-20 0 Q-10 ${f(-12 + Math.sin(t * 14) * 8)} 0 0 Q10 ${f(-12 + Math.sin(t * 14) * 8)} 20 0" fill="none" ${ink(4)}/>`);
  return s;
}

const BLD = [];
(() => { let x = -300; const cols = ['#d9a066', '#c8734e', '#ead9b5', '#e3c07a', '#d48a5e', '#e6cfa2', '#c9925a']; let i = 0; while (x < 2600) { const w = 250 + rnd(i) * 140, h = 380 + rnd(i + 50) * 260; BLD.push({ x, w, h, col: cols[i % cols.length], i, shop: rnd(i + 7) > .3, bal: rnd(i + 11) > .45, awn: ['#b8473f', '#3f6f8f', '#c99a3a', '#5f8a4a'][i % 4] }); x += w; i++; } })();
function building(b, base, t) {
  const { x, w, h, col } = b;
  let s = `<rect x="${f(x)}" y="${f(base - h)}" width="${f(w)}" height="${f(h)}" fill="${col}" ${ink(5)}/>`;
  s += `<rect x="${f(x + w * .78)}" y="${f(base - h)}" width="${f(w * .22)}" height="${f(h)}" fill="#000" opacity=".07"/>`;
  s += `<path d="M${f(x - 14)} ${f(base - h)} L${f(x + w + 14)} ${f(base - h)} L${f(x + w + 4)} ${f(base - h - 26)} L${f(x - 4)} ${f(base - h - 26)} Z" fill="#b8573a" ${ink(4.5)}/>`;
  for (let k = 0; k < Math.floor(w / 30); k++) s += `<path d="M${f(x - 4 + k * 30 + 15)} ${f(base - h - 24)} q-4 12 0 24" fill="none" stroke="#8f3f28" stroke-width="3"/>`;
  const floors = Math.floor((h - 170) / 120);
  for (let fl = 0; fl < floors; fl++) {
    const y = base - h + 60 + fl * 120, n = Math.max(2, Math.floor(w / 100));
    for (let j = 0; j < n; j++) {
      const wx = x + (j + .5) * w / n - 22;
      s += `<rect x="${f(wx)}" y="${f(y)}" width="44" height="62" fill="#4b3325" ${ink(4)}/>`;
      if ((b.i + j + fl) % 3 === 0) s += `<path d="M${f(wx - 16)} ${f(y)} l16 0 l0 62 l-16 0 Z M${f(wx + 44)} ${f(y)} l16 0 l0 62 l-16 0 Z" fill="#7a8f5a" ${ink(3)}/>`;
      else s += `<path d="M${f(wx + 22)} ${f(y)} l0 62" stroke="${C.woodSh}" stroke-width="4"/>`;
      if ((b.i + j * 2 + fl) % 4 === 1) s += `<ellipse cx="${f(wx + 22)}" cy="${f(y + 66)}" rx="30" ry="10" fill="#6f8a4a" ${ink(3)}/><rect x="${f(wx + 6)}" y="${f(y + 62)}" width="32" height="14" fill="#b8573a" ${ink(3)}/>`;
    }
    if (b.bal && fl === 1) s += `<rect x="${f(x + 20)}" y="${f(y + 72)}" width="${f(w - 40)}" height="14" fill="${C.wood}" ${ink(4)}/>` + Array.from({ length: Math.floor((w - 40) / 22) }, (_, k) => `<path d="M${f(x + 30 + k * 22)} ${f(y + 86)} l0 30" stroke="${C.woodSh}" stroke-width="5"/>`).join('') + `<path d="M${f(x + 20)} ${f(y + 116)} L${f(x + w - 20)} ${f(y + 116)}" ${ink(4)}/>`;
  }
  if (b.shop) {
    const sx = x + w * .14, sw = w * .72;
    s += `<path d="M${f(sx)} ${base} L${f(sx)} ${base - 120} Q${f(sx + sw / 2)} ${base - 175} ${f(sx + sw)} ${base - 120} L${f(sx + sw)} ${base} Z" fill="#3a271c" ${ink(4.5)}/>`;
    const wv = Math.sin(t * 2 + b.i) * 2;
    let aw = ''; const n = 6; for (let k = 0; k < n; k++) aw += `<path d="M${f(sx - 14 + k * (sw + 28) / n)} ${base - 175} L${f(sx - 14 + (k + 1) * (sw + 28) / n)} ${base - 175} L${f(sx - 14 + (k + 1) * (sw + 28) / n + wv)} ${base - 130} L${f(sx - 14 + k * (sw + 28) / n + wv)} ${base - 130} Z" fill="${k % 2 ? '#f3ead8' : b.awn}"/>`;
    s += aw + `<path d="M${f(sx - 14)} ${base - 175} L${f(sx + sw + 14)} ${base - 175} L${f(sx + sw + 14 + wv)} ${base - 130} L${f(sx - 14 + wv)} ${base - 130} Z" fill="none" ${ink(4)}/>`;
    s += `<rect x="${f(sx + 10)}" y="${base - 60}" width="${f(sw - 20)}" height="60" fill="#c9a77a" ${ink(4)}/>`;
  }
  return s;
}
function farRome(op = 1) {
  let s = `<g opacity="${op}">`;
  s += `<path d="M0 640 Q200 560 420 600 Q700 520 980 590 Q1300 530 1600 600 Q1800 570 1920 600 L1920 760 L0 760 Z" fill="#c9d3b8"/>`;
  // Colosseum
  s += `<g transform="translate(1430 640)"><path d="M-230 0 L-230 -150 Q0 -190 230 -150 L230 0 Z" fill="#d8c7a8" stroke="#a8977c" stroke-width="3"/>`;
  for (let r = 0; r < 3; r++) for (let k = 0; k < 12; k++) s += `<path d="M${-210 + k * 36} ${-12 - r * 46} l0 -26 q12 -14 24 0 l0 26 Z" fill="#a8977c"/>`;
  s += `</g>`;
  // aqueduct
  s += `<g transform="translate(120 650)">`; for (let k = 0; k < 9; k++) s += `<path d="M${k * 70} 0 l0 -80 q35 -36 70 0 l0 80" fill="none" stroke="#bfae90" stroke-width="10"/>`; s += `<rect x="-6" y="-130" width="650" height="18" fill="#bfae90"/></g>`;
  // temple
  s += `<g transform="translate(860 640)"><path d="M-120 -150 L0 -200 L120 -150 Z" fill="#e2d6bf" stroke="#b3a68d" stroke-width="3"/>`; for (let k = 0; k < 6; k++) s += `<rect x="${-110 + k * 42}" y="-150" width="14" height="150" fill="#e2d6bf" stroke="#b3a68d" stroke-width="2"/>`; s += `</g>`;
  for (let k = 0; k < 7; k++) { const x = 300 + k * 230; s += `<path d="M${x} 650 Q${x - 18} 580 ${x} 500 Q${x + 18} 580 ${x} 650 Z" fill="#8fa070"/>`; }
  return s + `</g>`;
}
function romeStreet(t, o = {}) {
  const base = o.base || 840;
  let s = `<defs><linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8cc3e3"/><stop offset=".7" stop-color="#f4e7cb"/></linearGradient>
  <pattern id="cob" width="64" height="40" patternUnits="userSpaceOnUse"><rect width="64" height="40" fill="#b7a58a"/><rect x="3" y="3" width="26" height="15" rx="7" fill="#cdbca0" stroke="#8a7a62" stroke-width="2"/><rect x="35" y="3" width="26" height="15" rx="7" fill="#c4b296" stroke="#8a7a62" stroke-width="2"/><rect x="-13" y="22" width="26" height="15" rx="7" fill="#c9b89b" stroke="#8a7a62" stroke-width="2"/><rect x="19" y="22" width="26" height="15" rx="7" fill="#d1c1a5" stroke="#8a7a62" stroke-width="2"/><rect x="51" y="22" width="26" height="15" rx="7" fill="#c4b296" stroke="#8a7a62" stroke-width="2"/></pattern></defs>`;
  s += `<rect width="1920" height="1080" fill="url(#rsky)"/>`;
  s += `<circle cx="1650" cy="170" r="90" fill="#fff1c4" opacity=".55"/><circle cx="1650" cy="170" r="62" fill="#fff4d2"/>`;
  s += cloud(260 + t * 6, 160, 1.2, .85) + cloud(1100 + t * 4, 110, .9, .7);
  s += farRome(.75);
  const px = o.px || 0;
  let bl = ''; for (const b of BLD) if (b.x - px < 2000 && b.x + b.w - px > -100) bl += building(b, base, t);
  s += g(`translate(${f(-px)} 0)`, bl);
  // laundry between some buildings
  s += `<rect y="${base}" width="1920" height="${1080 - base}" fill="url(#cob)"/><rect y="${base}" width="1920" height="26" fill="#d6c7ab" ${ink(4)}/>`;
  s += `<rect y="${base + 26}" width="1920" height="1080" fill="#000" opacity=".05"/>`;
  return s;
}

// ---------------------------------------------------------------- SCENE: ATTIC
const SC = {};
SC.attic = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    const tFind = lf(S, 0, .72), tA2 = L[1] - .4, tFlip = L[2] + .55, tPortal = L[3] - .25, tSuck = L[3] + .55;
    const glow = clamp(seg(t, L[1] - .2, L[1] + 1.2) * .8 + seg(t, tFlip, tFlip + 1.2) * .6);
    const wind = seg(t, tFlip + .3, tPortal + .4) * .8 + seg(t, tPortal, tSuck) * .8;
    let world = atticBG(t, { wind });
    world += g('translate(1090 960) scale(.95)', chestSVG(1));
    if (t > tFind - .3 && t < tA2 + .6) world += sparkle(1080 + Math.sin(t * 3) * 10, 800, .9 + Math.sin(t * 8) * .25, t * 60, fadeIO(t, tFind - .3, tA2 + .6, .3));
    // --- hero
    const shot2 = t >= tA2;
    let o = { x: 800, y: 990, s: .95, t, blink: blinkK(t, 1), face: FACE.neutral, wind: wind * 2.5, wave: 1 + wind * 2 };
    if (!shot2) {
      o.x = 880; o.lean = K(t, [[0, 20], [tFind, 20], [tFind + .7, 6]]);
      const r1 = toLocal(o, 1050 + noise1(t * 2.2) * 40, 860 + noise1(t * 3 + 4) * 20), r2 = toLocal(o, 1120 + noise1(t * 2.5 + 9) * 40, 870 + noise1(t * 2.7 + 2) * 20);
      const look = toLocal(o, 1080, 790);
      o.arms = { L: { to: K(t, [[0, r1], [tFind, r1], [tFind + .7, toLocal(o, 1060, 760)]]) }, R: { to: K(t, [[0, r2], [tFind, r2], [tFind + .7, toLocal(o, 1110, 760)]]) } };
      o.face = S2(t, [[0, FACE.neutral], [lf(S, 0, .3), FACE.sleepy], [lf(S, 0, .42), FACE.neutral], [tFind, FACE.curious]]);
      o.look = [.8, .5];
    } else {
      // standing, holding the hourglass in front of the chest
      o.x = 860; o.lean = 0;
      const flip = eback(seg(t, tFlip, tFlip + .9));
      const hgx = 0, hgy = -330;
      const ang = flip * 180;
      const hand = s2 => [hgx + Math.cos(rad(ang)) * 54 * s2, hgy + Math.sin(rad(ang)) * 54 * s2];
      o.arms = { L: { to: hand(-1), bend: 1 }, R: { to: hand(1), bend: -1 } };
      o.face = S2(t, [[tA2, FACE.curious], [lf(S, 1, .55), FACE.surprised], [lf(S, 1, .85), FACE.joy], [L[2], FACE.smirk], [tFlip, FACE.smug], [tPortal + .1, FACE.uhoh], [tSuck - .2, FACE.scared]]);
      o.look = K(t, [[tA2, [0, .2]], [L[2], [0, .3]], [tPortal + .2, [-.6, -.4]], [tSuck - .3, [0, 0]]]);
      o.holdHG = g(`translate(${hgx} ${hgy}) rotate(${f(ang)})`, hourglassSVG(t < tFlip ? .32 : 1 - clamp(seg(t, tFlip + .9, D) * 1.5) * .7, glow, t));
      o.headY = Math.sin(t * 1.4) * 2;
    }
    if (shot2) o.frontExtra = o.holdHG;
    let heroS = person(o);
    // portal + suck
    const portalK = eout(seg(t, tPortal, tPortal + .7));
    if (portalK > 0) world += portalSVG(860, 470, 520 * portalK, t, portalK);
    const suck = ein(seg(t, tSuck, tSuck + 1.1));
    if (suck > 0) heroS = g(`translate(860 ${f(lerp(650, 470, suck))}) rotate(${f(suck * 600)}) scale(${f(1 - suck * .98)}) translate(-860 -650)`, heroS);
    world += heroS;
    // light on hero face from hourglass
    if (shot2 && glow > 0) world += `<defs><radialGradient id="fl"><stop offset="0" stop-color="#ffd27a" stop-opacity="${f(glow * .3)}"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient></defs><circle cx="860" cy="620" r="340" fill="url(#fl)"/>`;
    // camera
    let z, cx, cy;
    if (!shot2) { z = lerp(1, 1.12, esine(seg(t, 0, tA2))); cx = lerp(960, 960, 0); cy = lerp(540, 600, esine(seg(t, 0, tA2))); }
    else {
      z = K(t, [[tA2, 1.85], [L[2], 1.75], [tPortal, 1.6], [tPortal + .6, 1.05], [D, 1.15]]);
      cx = K(t, [[tA2, 860], [tPortal, 860], [tPortal + .6, 900]]); cy = K(t, [[tA2, 560], [tPortal, 580], [tPortal + .6, 520]]);
    }
    const [sx, sy] = shake(t, 10 * seg(t, tPortal, tPortal + .4) * (1 - seg(t, tSuck + .8, D)));
    let out = cam(world, cx + sx, cy + sy, z);
    out += vignette(.55);
    // cross-dissolve between shot 1 and 2
    if (t > tA2 - .45 && t < tA2) out = out; // handled by short dip
    const dip = Math.sin(clamp((t - (tA2 - .25)) / .5) * Math.PI) * .9;
    if (dip > 0) out += `<rect width="1920" height="1080" fill="#1a110b" opacity="${f(dip)}"/>`;
    const white = seg(t, tSuck + .6, tSuck + 1.0);
    if (white > 0) out += `<rect width="1920" height="1080" fill="#fffaf0" opacity="${f(white)}"/>`;
    if (t < .8) out += `<rect width="1920" height="1080" fill="#000" opacity="${f(1 - esine(t / .8))}"/>`;
    return out;
  },
  cues(S) { const L = S.L.map(l => l[0]); const tFlip = L[2] + .55, tPortal = L[3] - .25, tSuck = L[3] + .55; return [[0, 'amb_attic', .5], [.6, 'rummage', .4], [lf(S, 0, .45), 'rummage', .4], [lf(S, 0, .72) - .3, 'glint', .6], [L[1] - .2, 'shimmer', .6], [tFlip, 'whoosh', .5], [tFlip + .3, 'swell', .7], [tPortal, 'portal', .9], [tSuck, 'suck', .8], [tSuck + .8, 'boom', .7]]; },
};
// expression state helper (0.35s smooth blend)
const S2 = (t, list) => S(t, list, .35);
function portalSVG(cx, cy, r, t, k) {
  const id = uid('pg');
  let s = `<defs><radialGradient id="${id}"><stop offset="0" stop-color="#fffbe6"/><stop offset=".35" stop-color="#ffe08a"/><stop offset=".75" stop-color="#e2a83c"/><stop offset="1" stop-color="#c98a2a" stop-opacity="0"/></radialGradient></defs>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${f(r * 1.15)}" fill="url(#${id})" opacity="${f(k)}"/>`;
  let arcs = '';
  for (let i = 0; i < 14; i++) {
    const rr = r * (.12 + i * .062), a0 = t * (140 + i * 18) + i * 47, len = 120 + (i % 3) * 40;
    arcs += `<path d="M${f(rr)} 0 A${f(rr)} ${f(rr)} 0 0 1 ${f(rr * Math.cos(rad(len)))} ${f(rr * Math.sin(rad(len)))}" fill="none" stroke="#fff8e0" stroke-width="${f(5 + i * .8)}" stroke-linecap="round" opacity=".55" transform="rotate(${f(a0)})"/>`;
  }
  s += g(`translate(${cx} ${cy})`, arcs, `opacity="${f(k)}"`);
  return s;
}

// ---------------------------------------------------------------- SCENE: ARRIVAL
function lids(open, blur = 0) { // eyelids: open 0..1
  const h = (1 - open) * 560;
  return `<path d="M0 0 L1920 0 L1920 ${f(h)} Q960 ${f(h + 160 * open)} 0 ${f(h)} Z" fill="#0b0705"/><path d="M0 1080 L1920 1080 L1920 ${f(1080 - h)} Q960 ${f(1080 - h - 160 * open)} 0 ${f(1080 - h)} Z" fill="#0b0705"/>`;
}
SC.arrival = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    const tWide = lf(S, 1, .55);
    let out = '';
    if (t < tWide + .6) {
      let pov = skyPOV(t);
      // faces leaning in
      const lean = (t0, from, to) => K(t, [[t0, from], [t0 + 1.1, to]], eout5);
      const faces = [
        { k: 'merchant', t0: L[1] + .1, a: [-300, 300], b: [480, 400], r: 55, face: FACE.angry, look: [.6, .5] },
        { k: 'woman', t0: L[1] + .5, a: [2200, 260], b: [1450, 360], r: -55, face: FACE.curious, look: [-.6, .5] },
        { k: 'oldman', t0: L[1] + .9, a: [960, -400], b: [960, 190], r: 172, face: FACE.worried, look: [0, -.5] },
        { k: 'boy', t0: L[1] + 1.3, a: [2200, 900], b: [1500, 800], r: -30, face: FACE.grin, look: [-.6, -.3] },
      ];
      for (const fc of faces) {
        if (t < fc.t0) continue;
        const p = lean(fc.t0, fc.a, fc.b);
        const bob = Math.sin(t * 1.5 + fc.r) * 6;
        pov += g(T(p[0], p[1] + bob, 2.2, fc.r), headSVG(Object.assign({}, NPC[fc.k], { face: fc.face, look: fc.look, blink: blinkK(t, fc.r) })));
      }
      const blurAmt = Math.max(0, 14 * (1 - seg(t, .8, 3.2))) + Math.sin(clamp((t - 3.4) / .5) * Math.PI) * 8;
      if (blurAmt > .3) pov = `<defs><filter id="pblur"><feGaussianBlur stdDeviation="${f(blurAmt)}"/></filter></defs><g filter="url(#pblur)">${pov}</g>`;
      const openK = K(t, [[0, 0], [.8, 0], [1.6, .55], [2.2, .45], [3.1, 1], [3.4, 1], [3.6, .05], [3.8, 1]], esine);
      out += cam(pov, 960, 540, 1 + .04 * Math.sin(t * .6)) + lids(openK) + vignette(.4, '#000');
    }
    if (t > tWide) {
      const tt = t - tWide;
      let w = romeStreet(t, { px: 300 });
      const GY = 990;
      // crowd around the hero
      const crowd = [
        ['woman', 400, 1, FACE.curious, [1, .4]], ['oldman', 640, 1, FACE.worried, [1, .5]], ['boy', 1540, 1, FACE.grin, [-1, .5]], ['lady', 1740, 1, FACE.surprised, [-1, .3]],
      ];
      for (const [k, x, sc, fc, lk] of crowd) w += shadow(x, GY + 2, 90) + npc(k, { x, y: GY, s: .82 * sc, t, phase: x, face: fc, look: lk, blink: blinkK(t, x), tilt: Math.sin(t + x) * 3, arms: { L: { a: [-8 + Math.sin(t * 1.3 + x) * 3, 12] }, R: { a: [8, -12] } } });
      // merchant steps in and shouts
      const tm = L[2] - .2;
      const mx = K(t, [[tm, 1420], [tm + .9, 1290]]);
      const shout = t > tm + .9 && t < L[2] + (S.L[2][1] - L[2]) * .75;
      const wk = t > tm && t < tm + .9 ? walk((t - tm) * 9, .8) : null;
      w += shadow(mx, GY + 2, 95) + npc('merchant', Object.assign({ x: mx, y: GY + (wk ? wk.bob * .8 : 0), s: .86, flip: true, t, face: shout ? S2(t, [[tm + .9, FACE.yell]]) : FACE.angry, look: [1, .3], blink: blinkK(t, 3), lean: shout ? 8 + Math.sin(t * 9) * 1.5 : 0, toes: wk ? 'right' : 'out' }, wk ? { legs: wk.legs, arms: wk.arms } : { arms: { L: { a: [-60 + Math.sin(t * 7) * 8, -40] }, R: { a: [20, -30] } } }));
      // hero: lying -> sitting up
      const sit = eio(seg(tt, .7, 2.0));
      const recoil = shout ? eout(seg(t, tm + .9, tm + 1.3)) : 0;
      const ho = {
        x: 980, y: GY - 2, s: .9, t, ground: false, toes: 'right',
        legs: { L: [86, -4], R: [80, 2] }, lean: lerp(-84, -8, sit) - recoil * 12,
        arms: { L: { a: [lerp(-40, -30, sit), lerp(10, 20, sit)] }, R: { a: [lerp(150, 34, sit), lerp(0, 20, sit)] } },
        face: S2(t, [[tWide, FACE.dazed], [tWide + 2.2, FACE.curious], [tm + .9, FACE.surprised], [lf(S, 2, .8), FACE.dazed]]),
        look: K(t, [[tWide + 2.0, [0, -.4]], [tWide + 2.6, [-.8, 0]], [tWide + 3.4, [.8, 0]], [tm + .6, [.9, 0]]]), blink: blinkK(t, 2), wave: .5,
      };
      ho.y = GY - 2 + 167 * .9 - 36 * .9; // hips on the ground
      w += shadow(1040, GY + 2, 170) + person(ho);
      if (sit < .2) for (let i = 0; i < 3; i++) { const a = t * 3 + i * 2.1; w += sparkle(940 + Math.cos(a) * 80, 820 + Math.sin(a) * 26, .45, a * 40, .8); }
      if (shout) {
        const k = pop(t, tm + .9, .4), [hx, hy] = shake(t, 4);
        w += g(T(1480 + hx, 330 + hy, k), `<path d="${smooth([[-230, -90], [230, -95], [250, 60], [40, 70], [10, 140], [-20, 70], [-240, 64]], true, .25)}" fill="#fff" ${ink(5)}/>` + text('QUID FACIS?!', 0, -10, { size: 86, fill: C.red }));
      }
      const z = K(t, [[tWide, 1.35], [tWide + 3, 1.15], [D, 1.08]], esine);
      let wide = cam(w, 1030, K(t, [[tWide, 690], [tWide + 3, 650]]), z) + vignette(.3) + label('LATIN', 960, 130, t, lf(S, 2, .82), { size: 120 }) + label('(the language of Rome)', 960, 225, t, lf(S, 2, .9), { size: 52, fill: '#5d4a3a', sw: 8 });
      out = t < tWide + .6 ? out + op(esine(seg(t, tWide, tWide + .6)), wide) : wide;
    }
    return out;
  },
  cues(S) { const L = S.L.map(l => l[0]); const tWide = lf(S, 1, .55), tm = L[2] - .2; return [[0, 'heartbeat', .6], [1.2, 'city', .5], [3.4, 'blink', .3], [L[1] + .1, 'murmur', .5], [tWide, 'whoosh', .25], [tm, 'steps', .4], [tm + .9, 'shout', .7], [lf(S, 2, .82), 'pop', .4]]; },
};

// ---------------------------------------------------------------- SCENE: TITLE
function titleCard(t, t0) {
  const k = eback(seg(t, t0, t0 + .7)), opv = fadeI(t, t0, .25);
  let s = `<rect width="1920" height="1080" fill="#1d120b" opacity="${f(.45 * opv)}"/>`;
  let c = '';
  c += `<path d="M-760 -150 L760 -150 L800 -60 L760 30 L-760 30 L-800 -60 Z" fill="#8f2a26" ${ink(7)}/><path d="M-736 -128 L736 -128 L770 -60 L736 8 L-736 8 L-770 -60 Z" fill="none" stroke="${C.gold}" stroke-width="6"/>`;
  c += text('WHAT IF YOU WOKE UP', 0, -64, { size: 112, fill: '#fff6dc', stroke: '#4a1410', sw: 10, ls: 3 });
  c += text('IN ANCIENT ROME?', 0, 120, { size: 160, fill: C.gold, stroke: '#3a1c0a', sw: 16, ls: 4 });
  const leaf = (x, side) => { let l = ''; for (let i = 0; i < 7; i++) { const a = rad(110 + i * 22) * side; l += `<ellipse cx="${f(x + Math.cos(a) * 120 * side)}" cy="${f(40 + Math.sin(rad(110 + i * 22)) * 120)}" rx="34" ry="13" fill="#7f9a4a" ${ink(3.5)} transform="rotate(${f((110 + i * 22 + 90) * side)} ${f(x + Math.cos(a) * 120 * side)} ${f(40 + Math.sin(rad(110 + i * 22)) * 120)})"/>`; } return l; };
  c += leaf(-860, 1) + leaf(860, -1);
  s += g(T(960, 500, k * .92), c, `opacity="${f(opv)}"`);
  for (let i = 0; i < 8; i++) { const tt = t - t0 - .4 - i * .12; if (tt > 0 && tt < 1.2) s += sparkle(200 + rnd(i) * 1520, 260 + rnd(i + 5) * 500, .8 * Math.sin(tt / 1.2 * Math.PI), tt * 90); }
  return s;
}
SC.title = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    const GY = 1000;
    let w = romeStreet(t, { px: 150 + t * 14 });
    // passers-by
    const walkers = [
      ['worker', -200, 70, .78, false], ['lady', 2100, -60, .8, true], ['soldier', -500, 90, .8, false], ['oldman', 2300, -45, .8, true], ['boy', -900, 120, .8, false],
    ];
    walkers.forEach(([k, x0, v, sc, fl], i) => {
      const x = x0 + v * t * (fl ? 1 : 1), ph = t * (Math.abs(v) / 11) + i;
      const wk = walk(ph, .9);
      if (x > -200 && x < 2150) w += shadow(x, GY - 20, 80) + npc(k, { x, y: GY - 22 + wk.bob, s: sc, flip: fl, t, legs: wk.legs, arms: wk.arms, toes: 'right', face: FACE.neutral, look: [1, 0], blink: blinkK(t, i), phase: i });
    });
    // hero standing in the middle of the street
    const tLost = L[1];
    const shakeHG = t > lf(S, 1, .35) && t < lf(S, 1, 1) ? Math.sin(t * 22) * 14 : 0;
    const ho = {
      x: 960, y: GY + 10, s: 1.05, t, blink: blinkK(t, 5), wave: 1.2, wind: .3,
      face: S2(t, [[0, FACE.curious], [lf(S, 0, .1), FACE.surprised], [lf(S, 0, .45), FACE.joy], [tLost, FACE.worried], [lf(S, 1, .6), FACE.uhoh]]),
      look: K(t, [[0, [-.7, -.3]], [1.5, [.7, -.3]], [3, [0, 0]]]),
      arms: t < tLost ? { L: { a: [-12, 10] }, R: { a: [K(t, [[lf(S, 0, .45), 10], [lf(S, 0, .55), 150]]), K(t, [[lf(S, 0, .45), -10], [lf(S, 0, .55), 10]])] } } : { L: { a: [-10, 10] }, R: { to: [70 + shakeHG * .3, -330 + shakeHG], bend: -1 } },
    };
    if (t > tLost) ho.frontExtra = g(`translate(${f(ho.arms.R.to[0] + 34)} ${f(ho.arms.R.to[1] - 10)}) rotate(${f(shakeHG)}) scale(.75)`, hourglassSVG(1, 0, t));
    w += shadow(960, GY + 12, 130) + person(ho);
    const z = K(t, [[0, 1.7], [lf(S, 0, .45), 1.0], [tLost, 1.0], [tLost + 1.2, 1.25]], eio);
    const cy = K(t, [[0, 640], [lf(S, 0, .45), 540], [tLost, 540], [tLost + 1.2, 600]]);
    let out = cam(w, 960, cy, z) + vignette(.3);
    const lo = fadeIO(t, 0, S.L[1][1] + .4, .3);
    out += op(lo, label('ROMA', 480, 200, t, lf(S, 0, .45), { size: 150, fill: C.red, rot: -5 }) + label('100 AD', 1440, 200, t, lf(S, 0, .82), { size: 130, rot: 4 }));
    if (t > lf(S, 1, .35) && t < lf(S, 1, 1)) out += text('*shake shake*', 1320, 520, { size: 50, fill: '#5d4a3a', rot: -10, sw: 8 });
    const tCard = S.L[1][1] + .3;
    if (t > tCard) out += titleCard(t, tCard);
    if (t < .5) out += `<rect width="1920" height="1080" fill="#fbf8f1" opacity="${f(1 - esine(t / .5))}"/>`;
    if (t > D - .6) out += `<rect width="1920" height="1080" fill="#000" opacity="${f(esine(seg(t, D - .6, D)))}"/>`;
    return out;
  },
  cues(S) { const L = S.L.map(l => l[0]); return [[0, 'city', .55], [lf(S, 0, .45), 'stamp', .5], [lf(S, 0, .82), 'stamp', .5], [lf(S, 1, .35), 'rattle', .5], [S.L[1][1] + .3, 'fanfare', .9]]; },
};

// ---------------------------------------------------------------- composition
let TL = null;
window.setTimeline = tl => { TL = tl; };
window.allCues = (upto) => { const out = []; TL.forEach(sc => { if (!SC[sc.id]) return; SC[sc.id].cues({ dur: sc.dur, L: sc.lines }).forEach(c => out.push([+(sc.start + c[0]).toFixed(3), c[1], c[2], sc.id])); }); return out; };
window.frameSVG = (T0) => {
  UID = 0;
  let sc = TL[TL.length - 1];
  for (const x of TL) if (T0 >= x.start && T0 < x.start + x.dur) { sc = x; break; }
  if (!SC[sc.id]) return text('[ ' + sc.id + ' ]', 960, 540, { size: 80 });
  const t = T0 - sc.start;
  let s = SC[sc.id].draw(t, { dur: sc.dur, L: sc.lines });
  // first frames of arrival come from white
  if (sc.id === 'arrival' && t < .5) s += `<rect width="1920" height="1080" fill="#fffaf0" opacity="${f(1 - esine(t / .5))}"/>`;
  return s + `<image href="../assets/paper.jpg" x="0" y="0" width="1920" height="1080" opacity=".22" style="mix-blend-mode:multiply"/>`;
};

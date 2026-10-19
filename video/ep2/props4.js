// Shared props/backgrounds for episode 2 scenes 4-13 (flat fills, uniform ink lines).
const INK = PAL.ink;
const lineP = (pts, w = 5, c = INK) => `<path d="M${pts.map(p => f(p[0]) + ' ' + f(p[1])).join(' L')}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const rect = (x, y, w, h, fill, sw = 5, rx = 0) => `<rect x="${f(x)}" y="${f(y)}" width="${f(w)}" height="${f(h)}" rx="${rx}" fill="${fill}" ${ink(sw)}/>`;
const circ = (x, y, r, fill, sw = 5) => `<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}" fill="${fill}" ${ink(sw)}/>`;
const poly = (pts, fill, sw = 5) => `<path d="M${pts.map(p => f(p[0]) + ' ' + f(p[1])).join(' L')} Z" fill="${fill}" ${ink(sw)}/>`;
const fadeRect = (a, col = '#000') => a <= 0.001 ? '' : `<rect x="-200" y="-200" width="2320" height="1480" fill="${col}" opacity="${f(Math.min(1, a) * 1000) / 1000}"/>`;
// crossfade between two shot renderers around tCut
function xfade(t, tCut, A, B, d = .35) {
  if (t < tCut - d / 2) return A();
  if (t > tCut + d / 2) return B();
  const k = esine((t - (tCut - d / 2)) / d);
  return A() + op(k, B());
}
// pick the shot for time t: shots = [[t0, fn], ...]; quick crossfade (d) between consecutive shots
function shots(t, list, d = .3) {
  let i = 0; for (let j = 0; j < list.length; j++) if (t >= list[j][0] - d / 2) i = j;
  if (i > 0 && t < list[i][0] + d / 2) return xfade(t, list[i][0], list[i - 1][1], list[i][1], d);
  return list[i][1]();
}
// card label with a coloured tab (for facts)
function factCard(str, x, y, t, t0, o = {}) {
  if (t < t0) return '';
  const k = pop(t, t0, .5), w = o.w || (str.length * (o.size || 56) * .52 + 70), h = (o.size || 56) * 1.5;
  const col = o.col || '#fff8e6';
  return g(T(x, y, k, o.rot || 0), `<rect x="${f(-w / 2)}" y="${f(-h / 2)}" width="${f(w)}" height="${f(h)}" rx="18" fill="${col}" ${ink(5)}/>` + text(str, 0, 2, { size: o.size || 56, fill: o.fill || PAL.ink, font: o.font || 'Gochi Hand' }), `opacity="${f(fadeI(t, t0, .12))}"`);
}
// animated counter text
const counter = (t, t0, t1, from, to, fmt = n => Math.round(n).toLocaleString('en-US')) => fmt(lerp(from, to, eout(seg(t, t0, t1))));
// small sound-word
function sfxWord(str, x, y, t, t0, dur = 1, o = {}) {
  if (t < t0 || t > t0 + dur) return '';
  const k = pop(t, t0, .3), a = 1 - seg(t, t0 + dur - .25, t0 + dur), [sx, sy] = [noise1(t * 25) * (o.shake || 3), noise1(t * 25 + 7) * (o.shake || 3)];
  return text(str, x + sx, y + sy, Object.assign({ size: 80, fill: '#a8322d', sw: 12, rot: -8, s: k, op: a }, o));
}

// ---------------------------------------------------------------- architecture
function column(x, yTop, yBot, w = 40, col = '#efe6d2') {
  let s = rect(x - w / 2, yTop + 18, w, yBot - yTop - 36, col, 5);
  for (let i = 1; i < 4; i++) s += `<path d="M${f(x - w / 2 + i * w / 4)} ${f(yTop + 24)} L${f(x - w / 2 + i * w / 4)} ${f(yBot - 22)}" stroke="#cbbfa6" stroke-width="3"/>`;
  s += rect(x - w / 2 - 10, yTop, w + 20, 20, col, 5) + rect(x - w / 2 - 10, yBot - 20, w + 20, 20, col, 5);
  return s;
}
function temple(x, yBase, s = 1, o = {}) {
  const n = o.cols || 6, W = 520, H = 330, col = o.col || '#efe6d2';
  let t = poly([[-W / 2 - 30, -H - 10], [0, -H - 120], [W / 2 + 30, -H - 10]], o.roof || '#e2d5ba');
  t += `<path d="M-130 ${-H - 40} L0 ${-H - 95} L130 ${-H - 40}" fill="none" stroke="#cbbfa6" stroke-width="4"/>`;
  t += rect(-W / 2 - 30, -H - 10, W + 60, 34, col);
  for (let i = 0; i < n; i++) t += column(-W / 2 + 30 + i * (W - 60) / (n - 1), -H + 24, -40, 38, col);
  t += rect(-W / 2 - 50, -40, W + 100, 22, col) + rect(-W / 2 - 70, -18, W + 140, 18, col);
  if (o.label) t += text(o.label, 0, -H + 6, { size: 30, font: 'Patrick Hand', fill: '#6b5a40' });
  return g(T(x, yBase, s), t);
}
function wallBricks(x, y, w, h, col = '#e3c99a', line = '#c6a978') {
  let s = rect(x, y, w, h, col, 5);
  const id = uid('wb'); let b = '';
  for (let r = 0; r * 34 < h; r++) { b += `<path d="M${x} ${y + r * 34} L${x + w} ${y + r * 34}" stroke="${line}" stroke-width="3"/>`; for (let c = (r % 2) * 40; c < w; c += 80) b += `<path d="M${x + c} ${y + r * 34} L${x + c} ${y + r * 34 + 34}" stroke="${line}" stroke-width="3"/>`; }
  return s + `<clipPath id="${id}"><rect x="${x}" y="${y}" width="${w}" height="${h}"/></clipPath><g clip-path="url(#${id})">${b}</g>` + rect(x, y, w, h, 'none', 5);
}
function sky(col = '#b4dbef', sun = true, t = 0) {
  let s = `<rect x="-200" y="-200" width="2320" height="1480" fill="${col}"/>`;
  if (sun) s += `<circle cx="1650" cy="170" r="66" fill="#fff1c4" ${ink(4)}/>`;
  s += cloud(300 + t * 6, 170, 1.0) + cloud(1150 + t * 4, 120, .75);
  return s;
}
function nightSky(t, moon = true) {
  let s = `<rect x="-200" y="-200" width="2320" height="1480" fill="#1d2440"/>`;
  for (let i = 0; i < 70; i++) s += `<circle cx="${f(rnd(i) * 1920)}" cy="${f(rnd(i + 3) * 600)}" r="${f(1.5 + rnd(i + 5) * 2.2)}" fill="#fff6d8" opacity="${f(.4 + .6 * Math.abs(Math.sin(t * (1 + rnd(i)) + i)))}"/>`;
  if (moon) s += `<circle cx="1600" cy="160" r="60" fill="#f4efd8" ${ink(4)}/><circle cx="1582" cy="146" r="10" fill="#dcd5bb"/><circle cx="1620" cy="180" r="8" fill="#dcd5bb"/>`;
  return s;
}
const COBDEF = `<defs><pattern id="cob2" width="64" height="40" patternUnits="userSpaceOnUse"><rect width="64" height="40" fill="#bfae92"/><rect x="3" y="3" width="26" height="15" rx="7" fill="#d4c4a8" stroke="#8a7a62" stroke-width="2"/><rect x="35" y="3" width="26" height="15" rx="7" fill="#cbb99d" stroke="#8a7a62" stroke-width="2"/><rect x="-13" y="22" width="26" height="15" rx="7" fill="#cfbfa2" stroke="#8a7a62" stroke-width="2"/><rect x="19" y="22" width="26" height="15" rx="7" fill="#d8c9ad" stroke="#8a7a62" stroke-width="2"/><rect x="51" y="22" width="26" height="15" rx="7" fill="#cbb99d" stroke="#8a7a62" stroke-width="2"/></pattern></defs>`;
const cobble = (y, col = 'url(#cob2)') => COBDEF + `<rect x="-200" y="${y}" width="2320" height="900" fill="${col}"/><rect x="-200" y="${y}" width="2320" height="22" fill="#ddcfb4" ${ink(4)}/>`;

// ---------------------------------------------------------------- crowds
const SKIN = '#ffffff';
const CROWD_COLS = ['#b8773f', '#86a3bb', '#8aa36a', '#c98d86', '#9c8a6e', '#d9c56a', '#efe9dc', '#7d6b9c', '#c96a5a'];
const HAIRS = ['#2b2523', '#6b4a32', '#c9984f', '#9a4a2a', '#a9a5a0', '#3d2a1e'];
// simple seated/standing spectator (head + shoulders), cheap to draw in big numbers
function spectator(x, y, s, i, t, mood = 0) {
  const bob = Math.sin(t * (4 + rnd(i) * 3) + i) * 6 * mood, arm = mood > .5 && rnd(i + 9) > .5;
  const body = CROWD_COLS[Math.floor(rnd(i + 1) * CROWD_COLS.length)], hair = HAIRS[Math.floor(rnd(i + 2) * HAIRS.length)];
  let p = `<path d="M-40 40 Q-40 -6 0 -6 Q40 -6 40 40 Z" fill="${body}" ${ink(4)}/>`;
  if (arm) { const a = Math.sin(t * 8 + i) * 18; p += `<path d="M24 4 L${f(40 + a * .3)} -50" ${ink(4)}/><circle cx="${f(40 + a * .3)}" cy="-52" r="8" fill="${INK}"/>`; }
  p += `<circle cx="0" cy="-38" r="30" fill="${SKIN}" ${ink(4)}/>`;
  p += `<path d="M-30 -42 Q-30 -72 0 -72 Q30 -72 30 -42 Q16 -56 0 -54 Q-16 -56 -30 -42 Z" fill="${hair}" ${ink(3)}/>`;
  const happy = mood > .5;
  p += happy ? `<path d="M-14 -36 q4 -6 8 0 M6 -36 q4 -6 8 0" fill="none" ${ink(3)}/><path d="M-10 -24 Q0 -12 10 -24 Z" fill="${PAL.mouth}" ${ink(2.5)}/>` : `<circle cx="-10" cy="-38" r="3.5" fill="${INK}"/><circle cx="10" cy="-38" r="3.5" fill="${INK}"/><path d="M-7 -24 L7 -24" ${ink(2.5)}/>`;
  return g(T(x, y + bob, s), p);
}
function crowdRows(x0, x1, y0, rows, rowH, s, t, seed = 0, mood = 0, gap = 70) {
  let out = '';
  for (let r = 0; r < rows; r++) for (let x = x0 + (r % 2) * gap / 2; x < x1; x += gap * s / .8) out += spectator(x + (rnd(seed + r * 31 + x) - .5) * 10, y0 + r * rowH, s, seed + r * 997 + Math.round(x), t, mood);
  return out;
}
// walking NPC helper (profile), no foot sliding
function walker(kind, x0, v, t, y, s, i = 0, o = {}) {
  const x = x0 + v * t, wc = walkCycle(Math.abs(v * t) / (STRIDE * s) * Math.PI + i, .9);
  return { x, svg: shadow(x, y + 4, 70 * s / .8) + npc(kind, Object.assign({ x, y: y + wc.bob * s, s, yaw: v > 0 ? 90 : -90, t, legs: wc.legs, arms: wc.arms, lean: wc.lean, face: EMO.neutral, blink: blinkK(t, i), phase: i }, o)) };
}

// ---------------------------------------------------------------- objects
function coin(x, y, s, kind = 'sestertius', rot = 0, tilt = 1) {
  const c = { as: ['#b87a45', '#8f5a2e'], sestertius: ['#e0b851', '#b08a2e'], denarius: ['#d9dce0', '#9aa0a6'] }[kind];
  return g(T(x, y, s, rot), `<ellipse cx="0" cy="0" rx="${f(40 * tilt)}" ry="40" fill="${c[0]}" ${ink(5)}/><ellipse cx="0" cy="0" rx="${f(28 * tilt)}" ry="28" fill="none" stroke="${c[1]}" stroke-width="4"/><path d="M${f(-8 * tilt)} -14 Q${f(10 * tilt)} -12 ${f(8 * tilt)} 4 Q${f(6 * tilt)} 14 ${f(-8 * tilt)} 12" fill="none" stroke="${c[1]}" stroke-width="4"/>`);
}
function flame(x, y, s, t, seed = 0) {
  const fl = (dx, h, w, col, ph) => { const k = 1 + noise1(t * 6 + ph + seed) * .2, sx = noise1(t * 4 + ph * 3 + seed) * 10; return `<path d="M${dx - w} 0 Q${dx - w} ${f(-h * .5 * k)} ${f(dx + sx)} ${f(-h * k)} Q${dx + w} ${f(-h * .5 * k)} ${dx + w} 0 Z" fill="${col}" ${col === '#e8662c' ? ink(4) : ''}/>`; };
  return g(T(x, y, s), fl(0, 170, 62, '#e8662c', 1) + fl(-30, 120, 40, '#e8662c', 2) + fl(34, 130, 40, '#e8662c', 3) + fl(0, 120, 42, '#f4a43a', 4) + fl(0, 70, 24, '#ffe08a', 7));
}
function smoke(x, y, t, n = 5, s = 1, col = '#8d8580') {
  let out = '';
  for (let i = 0; i < n; i++) { const ph = (t * .45 + i / n) % 1; out += circ(x + Math.sin(i * 2 + t) * 30 * ph + i * 6, y - ph * 320 * s, (30 + ph * 70) * s, col, 4).replace('<circle', `<circle opacity="${f((1 - ph) * .85)}"`); }
  return out;
}
function steam(x, y, t, n = 4, s = 1) {
  let out = '';
  for (let i = 0; i < n; i++) { const ph = (t * .4 + i / n) % 1; out += `<path d="M${f(x + i * 40 - n * 20)} ${f(y - ph * 160 * s)} q14 -24 0 -48 q-14 -24 0 -48" fill="none" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity="${f(Math.sin(ph * Math.PI) * .8)}"/>`; }
  return out;
}
function amphora(x, y, s, col = '#c9875a', rot = 0) {
  return g(T(x, y, s, rot), `<path d="M-14 -150 L14 -150 L12 -120 Q60 -100 52 -40 Q40 10 0 30 Q-40 10 -52 -40 Q-60 -100 -12 -120 Z" fill="${col}" ${ink(5)}/><path d="M-12 -130 Q-44 -130 -40 -96 M12 -130 Q44 -130 40 -96" fill="none" ${ink(5)}/><path d="M-40 -60 L40 -60" stroke="#a8693f" stroke-width="4"/>`);
}
function bucket(x, y, s, water = true) {
  return g(T(x, y, s), `<path d="M-34 -60 L34 -60 L28 0 L-28 0 Z" fill="#8a5a34" ${ink(5)}/>` + (water ? `<ellipse cx="0" cy="-60" rx="34" ry="8" fill="#7fb7dd" ${ink(3)}/>` : '') + `<path d="M-34 -60 Q0 -110 34 -60" fill="none" ${ink(4)}/><path d="M-30 -30 L30 -30" stroke="#5f3c22" stroke-width="4"/>`);
}
function scroll(x, y, s, w = 220, h = 140, inner = '', rot = 0) {
  return g(T(x, y, s, rot), `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" fill="#f1e2b8" ${ink(5)}/><rect x="${-w / 2 - 14}" y="${-h / 2 - 16}" width="${w + 28}" height="22" rx="11" fill="#d9c391" ${ink(5)}/><rect x="${-w / 2 - 14}" y="${h / 2 - 6}" width="${w + 28}" height="22" rx="11" fill="#d9c391" ${ink(5)}/>` + inner);
}
// cart with spoked wheels (wheel angle from distance travelled)
function cart(x, y, s, dist, load = '#c9b48a', animal = 'ox', t = 0) {
  const ang = dist / (60 * s) * 57.3;
  const wheel = (wx) => g(`translate(${wx} -60) rotate(${f(ang)})`, circ(0, 0, 60, '#8a5a34', 6) + circ(0, 0, 44, 'none', 4) + [0, 45, 90, 135].map(a => `<path d="M${f(Math.cos(rad(a)) * 44)} ${f(Math.sin(rad(a)) * 44)} L${f(-Math.cos(rad(a)) * 44)} ${f(-Math.sin(rad(a)) * 44)}" stroke="${INK}" stroke-width="5"/>`).join('') + circ(0, 0, 10, '#5f3c22', 4));
  let c = rect(-180, -170, 360, 70, '#a0714a') + `<path d="M-160 -170 Q-150 -260 -60 -270 Q60 -290 150 -250 Q180 -220 170 -170 Z" fill="${load}" ${ink(5)}/>` + `<path d="M-100 -230 L-60 -175 M10 -265 L20 -175 M110 -240 L90 -175" stroke="#a89670" stroke-width="4"/>`;
  c += lineP([[180, -140], [330, -150]], 7) + wheel(-90) + wheel(90);
  // ox / mule pulling
  const step = Math.sin(dist / (70 * s));
  const leg = (lx, ph) => `<path d="M${lx} -120 L${f(lx + Math.sin(ph) * 16)} -14" ${ink(8)}/><rect x="${f(lx - 10 + Math.sin(ph) * 16)}" y="-18" width="22" height="16" rx="4" fill="${INK}"/>`;
  let a = leg(-70, step * 1.2) + leg(-40, -step * 1.2) + leg(60, -step * 1.2) + leg(85, step * 1.2);
  a += `<ellipse cx="0" cy="-150" rx="120" ry="58" fill="${animal === 'ox' ? '#8f6a4a' : '#a59a8e'}" ${ink(6)}/>`;
  a += `<path d="M90 -180 Q140 -230 170 -210 Q200 -190 190 -160 Q180 -130 140 -140 Q110 -140 100 -130 Z" fill="${animal === 'ox' ? '#8f6a4a' : '#a59a8e'}" ${ink(6)}/>`;
  if (animal === 'ox') a += `<path d="M150 -215 Q140 -260 116 -262 M168 -212 Q186 -256 210 -254" fill="none" stroke="#efe6d2" stroke-width="10" stroke-linecap="round"/><path d="M150 -215 Q140 -260 116 -262 M168 -212 Q186 -256 210 -254" fill="none" ${ink(3)}/>`;
  else a += `<path d="M140 -222 Q128 -310 150 -316 Q164 -280 156 -222 Z M164 -218 Q170 -306 192 -302 Q192 -266 176 -216 Z" fill="#a59a8e" ${ink(5)}/>`;
  a += `<ellipse cx="160" cy="-190" rx="7" ry="9" fill="${INK}"/><path d="M-118 -160 Q-140 -110 -150 -80" fill="none" ${ink(6)}/>`;
  return g(T(x, y, s), c + g('translate(450 0)', a));
}
// side-view horse, galloping phase ph
function horse(x, y, s, ph, col = '#9a6a44', mane = '#3d2a1e') {
  const sw = Math.sin(ph), cw = Math.cos(ph);
  const leg = (hx, a1, a2) => { const k = [hx + Math.sin(rad(a1)) * 60, -110 + Math.cos(rad(a1)) * 60], ft = [k[0] + Math.sin(rad(a1 + a2)) * 60, k[1] + Math.cos(rad(a1 + a2)) * 60]; return `<path d="M${hx} -110 L${f(k[0])} ${f(k[1])} L${f(ft[0])} ${f(ft[1])}" ${ink(9)}/><rect x="${f(ft[0] - 9)}" y="${f(ft[1] - 4)}" width="18" height="12" rx="3" fill="${INK}"/>`; };
  let h = leg(-80, -sw * 40 - 10, 30 + cw * 30) + leg(-60, -sw * 40 + 20, 40) + leg(70, sw * 45, -20 - cw * 30) + leg(90, sw * 45 - 25, -40);
  h += `<ellipse cx="0" cy="-150" rx="130" ry="56" fill="${col}" ${ink(6)}/>`;
  h += `<path d="M90 -170 Q150 -260 180 -250 Q230 -240 240 -200 Q246 -176 220 -176 Q190 -190 170 -170 Q140 -140 110 -130 Z" fill="${col}" ${ink(6)}/>`;
  h += `<path d="M150 -250 Q120 -220 100 -170 Q120 -200 160 -230 Z" fill="${mane}" ${ink(4)}/><path d="M176 -256 l8 -26 l10 24 Z" fill="${col}" ${ink(4)}/>`;
  h += `<ellipse cx="196" cy="-222" rx="6" ry="8" fill="${INK}"/><path d="M-128 -170 Q-180 ${f(-160 + sw * 20)} -200 ${f(-110 + cw * 20)}" fill="none" stroke="${mane}" stroke-width="14" stroke-linecap="round"/>`;
  return g(T(x, y - Math.abs(sw) * 14 * s, s, -cw * 2), h);
}
function chariot(x, y, s, dist, team = '#b8473f', driver = true, t = 0, horses = true) {
  const ang = dist / (56 * s) * 57.3;
  const wheel = g(`translate(-40 -56) rotate(${f(ang)})`, circ(0, 0, 56, '#8a5a34', 6) + [0, 60, 120].map(a => `<path d="M${f(Math.cos(rad(a)) * 46)} ${f(Math.sin(rad(a)) * 46)} L${f(-Math.cos(rad(a)) * 46)} ${f(-Math.sin(rad(a)) * 46)}" stroke="${INK}" stroke-width="5"/>`).join('') + circ(0, 0, 10, '#5f3c22', 4));
  let c = '';
  if (driver) c += g('translate(-30 -150) scale(.42)', npc('worker', { x: 0, y: 0, s: 1, yaw: 90, t, face: EMO.yell, tunicCol: team, arms: { R: { a: [70, -10] }, L: { a: [60, -10] } }, cape: false, legsVisible: true }));
  c += `<path d="M-110 -150 Q-120 -60 -60 -50 L40 -50 L60 -150 Q0 -170 -110 -150 Z" fill="${team}" ${ink(6)}/><path d="M-90 -130 Q-20 -140 40 -130" fill="none" stroke="#e8c26a" stroke-width="6"/>`;
  c += wheel + lineP([[40, -90], [210, -120]], 7);
  if (horses) c += horse(330, 0, .9, dist / (90 * s), '#9a6a44') + horse(270, 6, .9, dist / (90 * s) + 1.3, '#7a5236');
  else c = c.replace(lineP([[40, -90], [210, -120]], 7), '');
  return g(T(x, y, s), c);
}
// statue on pedestal (pose via hero rig, monochrome look)
function statue(x, y, s, o = {}) {
  const st = Object.assign({ x: 0, y: -120, s: 1, t: 0, idle: 0, cape: false, tunicCol: '#ece8e0', tunicLine: '#c9c3b6', hairStyle: o.hair || 'curly', hairCol: '#d8d2c6', bootCol: '#d8d2c6', face: EMO.neutral, noWobble: true, blink: 0 }, o);
  return g(T(x, y, s), rect(-120, -120, 240, 120, '#e8e0cc') + rect(-140, -140, 280, 26, '#e8e0cc') + hero(st) + (o.label ? text(o.label, 0, -60, { size: 40, font: 'Patrick Hand', fill: '#5d4a3a' }) : ''));
}

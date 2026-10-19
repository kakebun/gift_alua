// Scenes 4-7: streets, food, forum, gods
const MAX = (t, o) => hero(Object.assign({ t, blink: blinkK(t, 2) }, o));
const inPlace = (t, v, s, amp = 1) => walkCycle(t * v / (STRIDE * s) * Math.PI, amp);
const plaster = (x, y, w, h, col = '#e8c98a') => rect(x, y, w, h, col) + hatch(x + w * .82, y, w * .18, h, 18, '#000', .08);
function windowBox(x, y, w = 70, h = 90, open = 0, shutter = '#7a8f5a') {
  let s = rect(x, y, w, h, '#3d2a1e', 5);
  const sw = w / 2 * (1 - open * .85);
  s += rect(x, y, sw, h, shutter, 4) + rect(x + w - sw, y, sw, h, shutter, 4);
  return s;
}

// ---------------------------------------------------------------- STREETS
SC.streets = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    return shots(t, [
      [0, () => this.crowd(t, S)],
      [L[1] - .2, () => this.tower(t, S)],
      [L[2] - .2, () => this.section(t, S)],
      [L[3] - .2, () => this.pot(t, S)],
      [L[4] - .2, () => this.court(t, S)],
      [L[5] - .2, () => this.night(t, S)],
      [L[6] - .2, () => this.bed(t, S)],
    ]) + (t < .4 ? fadeRect(1 - t / .4, '#000') : '') + (t > D - .4 ? fadeRect(seg(t, D - .4, D), '#000') : '');
  },
  crowd(t, S) {
    const L = S.L.map(l => l[0]), V = 95, GY = 1010;
    let w = romeStreet(t, { px: 200 + t * V });
    const back = [['lady', 2200, -70, .62, 3], ['worker', -300, 60, .62, 4], ['oldman', 2600, -55, .62, 5], ['merchant', 700, -80, .62, 6], ['boy', 3000, -90, .55, 7], ['woman', 1500, -60, .62, 8]];
    for (const [k, x0, v, s, i] of back) { const r = walker(k, x0 - 1000 * 0, v - V, t, 900, s, i); if (r.x > -200 && r.x < 2150) w += r.svg; }
    const front = [['merchant', 2400, -120, .82, 11], ['woman', 2900, -60, .82, 12], ['soldier', -700, 40, .82, 13], ['lady', 3400, -100, .82, 14], ['oldman', 4000, -50, .82, 15], ['worker', -1500, 60, .82, 16]];
    const wc = inPlace(t, V, .85);
    const hy = Math.sin(t * .9) * 45;
    w += shadow(900, GY + 4, 90) + MAX(t, { x: 900, y: GY + wc.bob * .85, s: .85, yaw: 90, headYaw: -hy - 20, legs: wc.legs, arms: wc.arms, lean: wc.lean, idle: 0, face: E(t, [[0, 'surprise'], [2.5, 'joy'], [5, 'smile']]), look: [0, -.3], wave: 1.2, wind: [-25, 0] });
    for (const [k, x0, v, s, i] of front) { const r = walker(k, x0, v - V, t, GY + 30, s, i); if (r.x > -250 && r.x < 2200) w += r.svg; }
    let out = cam(w, 960, 560, 1.05);
    out += factCard('ROMA: ~1,000,000 people', 960, 120, t, lf(S, 0, .55), { size: 64 });
    return out;
  },
  tower(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[1] - .2, t1 = L[2] - .2;
    // tall insula, camera tilts up from the street to the roof
    let w = `<rect x="-400" y="-1700" width="2800" height="3200" fill="#b4dbef"/>` + cloud(300, -600, 1.2) + cloud(1500, -900, 1) + cloud(1600, 200, .8);
    const top = -1100, base = 1000, x0 = 560, x1 = 1360;
    w += plaster(x0, top, x1 - x0, base - top, '#e6bf86');
    w += poly([[x0 - 40, top], [x1 + 40, top], [x1, top - 70], [x0, top - 70]], '#c0603f');
    for (let fl = 0; fl < 7; fl++) {
      const y = base - 200 - fl * 290;
      if (fl === 0) { w += rect(x0 + 60, base - 210, 300, 210, '#3a271c') + rect(x0 + 440, base - 210, 300, 210, '#3a271c'); continue; }
      for (let j = 0; j < 4; j++) w += windowBox(x0 + 70 + j * 180, y + 40, 80, 110, 0, (fl + j) % 3 ? '#7a8f5a' : '#8a5f3e');
      if (fl % 2 === 1) w += rect(x0 + 20, y + 160, x1 - x0 - 40, 16, '#8a5f3e', 4);
      w += text(['', 'I', 'II', 'III', 'IV', 'V', 'VI'][fl], x1 + 70, y + 100, { size: 64, font: 'Patrick Hand', fill: '#5d4a3a', op: fadeI(t, lerp(t0 + .4, t1 - 1.5, fl / 6), .3) });
    }
    w += cobble(base);
    w += shadow(380, base + 4, 70) + MAX(t, { x: 380, y: base, s: .7, yaw: 25, face: E(t, [[t0, 'neutral'], [t0 + 1.5, 'surprise']]), headYaw: 0, look: [.3, -1], tilt: -10, arms: { L: { a: [-12, 4] }, R: { a: [12, -4] } } });
    const cy = K(t, [[t0 + .3, 600], [t1 - .5, -620]], eio);
    let out = cam(w, 960, cy, 1);
    out += factCard('INSULA = apartment block', 960, 110, t, lf(S, 1, .45), { size: 60 });
    out += factCard('6-7 floors!', 1500, 950, t, lf(S, 1, .78), { size: 60, rot: -4, col: '#ffe9a8' });
    if (t > lf(S, 1, .1) && t < lf(S, 1, .45)) out += factCard('VILLA?  ✗', 380, 950, t, lf(S, 1, .1), { size: 54, rot: 3 });
    return out;
  },
  section(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[2] - .2, t1 = L[3] - .2;
    const FH = 260, base = 1500, X0 = 360, X1 = 1300, SX = 1300, SW = 260;
    let w = `<rect x="-400" y="-1200" width="2800" height="3200" fill="#b4dbef"/>`;
    w += cobble(base);
    // building cut-away
    const fls = 6, roomCols = ['#c9a77a', '#e8d2a8', '#e2c99c', '#d8bd8e', '#cdb083', '#c2a478'];
    for (let k = 0; k < fls; k++) {
      const y = base - (k + 1) * FH;
      w += rect(X0, y, X1 - X0, FH, roomCols[k]);
      w += rect(X0, y + FH - 14, X1 - X0, 14, '#8a5f3e', 4);
      if (k === 0) { w += amphora(X0 + 140, base - 14, .8) + amphora(X0 + 230, base - 14, .7, '#b8773f') + rect(X0 + 380, base - 110, 260, 96, '#a0714a') + text('TABERNA (shop)', X0 + 510, y + 60, { size: 40, font: 'Patrick Hand' }); continue; }
      // furniture gets poorer higher up
      const rich = (6 - k) / 5;
      w += rect(X0 + 80, y + FH - 80, 200 * (.6 + rich * .4), 66, '#f3ece0') + rect(X0 + 70, y + FH - 100, 40, 86, '#8a5f3e', 4);
      if (rich > .5) w += rect(X0 + 420, y + 60, 120, 90, '#d9c391') + amphora(X0 + 640, y + FH - 14, .55);
      else w += `<path d="M${X0 + 500} ${y + 30} l20 40 l-14 30 l24 40" fill="none" ${ink(4)}/>`; // crack
      w += windowBox(X1 - 170, y + 60, 70, 90, 0);
    }
    w += poly([[X0 - 40, base - fls * FH], [X1 + 40, base - fls * FH], [X1, base - fls * FH - 70], [X0, base - fls * FH - 70]], '#c0603f');
    w += rect(X0, base - fls * FH, X1 - X0, fls * FH, 'none', 7);
    // stairs on the right
    const stair = k => { const y0 = base - k * FH, y1 = y0 - FH, l = k % 2 === 0; return l ? [[SX + 20, y0 - 14], [SX + SW - 20, y1 - 14]] : [[SX + SW - 20, y0 - 14], [SX + 20, y1 - 14]]; };
    w += rect(SX, base - fls * FH, SW, fls * FH, '#d9c4a0', 5);
    for (let k = 0; k < fls - 1; k++) { const [a, b] = stair(k); w += lineP([a, b], 10, '#8a5f3e') + lineP([a, b], 3); }
    // rent tags (cheaper higher up)
    const tagT = k => lerp(t0 + .5, lf(S, 2, .3), (k - 1) / 4);
    for (let k = 1; k < fls; k++) { const n = 6 - k; if (t > tagT(k)) w += g(T(X0 - 150, base - k * FH - FH / 2, pop(t, tagT(k), .4)), rect(-110, -40, 220, 80, '#fff8e6', 5, 14) + Array.from({ length: n }, (_, i) => coin(-80 + i * 40, 0, .42, 'sestertius')).join('')); }
    // Max climbs with a water bucket
    const climb = clamp(seg(t, t0 + .4, lf(S, 2, .72)) * (fls - 1));
    const k = Math.min(fls - 2, Math.floor(climb)), u = climb - k, [a, b] = stair(k);
    const mx = lerp(a[0], b[0], u), my = lerp(a[1], b[1], u), dir = b[0] > a[0] ? 90 : -90;
    const moving = climb > 0 && climb < fls - 1, wc = walkCycle(climb * 7, moving ? .9 : 0);
    const ms = .4, tired = clamp(climb / 4);
    const atTop = climb >= fls - 1;
    w += MAX(t, { x: mx, y: my, s: ms, yaw: atTop ? K(t, [[lf(S, 2, .74), dir], [lf(S, 2, .8), 20]]) : dir, legs: wc.legs, lean: moving ? 10 + tired * 8 : 0, idle: 0, arms: { L: wc.arms.L, R: { a: [8, -6] } }, holdR: g('translate(0 34) scale(1.4)', bucket(0, 60, 1, true)), face: atTop ? E(t, [[lf(S, 2, .78), 'surprise'], [lf(S, 2, .86), 'fear']]) : E(t, [[t0, 'neutral'], [t0 + 2, 'sad']]), sweat: tired, look: atTop ? [0, .8] : [0, 0] });
    // fire at the bottom
    const fk = seg(t, lf(S, 2, .78), lf(S, 2, .95));
    if (fk > 0) { w += flame(X0 + 200, base - 14, .9 * fk, t) + flame(X0 + 520, base - 14, 1.1 * fk, t, 3) + smoke(X0 + 350, base - 200, t, 6, 1.4 * fk); }
    const cy = lerp(base - 300, my - 120, clamp(seg(t, t0 + .3, t0 + 1.2))) ;
    const zz = K(t, [[t0, .95], [t0 + 1.2, 1.5], [lf(S, 2, .76), 1.5], [lf(S, 2, .86), .95]], eio);
    let out = cam(w, K(t, [[t0, 900], [t0 + 1.2, 1300], [lf(S, 2, .76), 1300], [lf(S, 2, .86), 900]], eio), K(t, [[lf(S, 2, .76), Math.min(cy, base - 300)], [lf(S, 2, .86), base - 3 * FH]], eio), zz);
    out += factCard('No elevator', 1540, 160, t, lf(S, 2, .42), { size: 52, rot: 4 }) + factCard('No running water', 1500, 270, t, lf(S, 2, .55), { size: 52, rot: -3 });
    if (fk > 0) out += factCard('FIRE!', 360, 900, t, lf(S, 2, .8), { size: 70, fill: '#a8322d', col: '#ffe0b0' });
    out += factCard('Higher = cheaper rent', 520, 100, t, lf(S, 2, .05), { size: 56 });
    return out;
  },
  pot(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[3] - .2, t1 = L[4] - .2, GY = 1000;
    const tStop = lf(S, 3, .55), tSplash = lf(S, 3, .62);
    const walking = t < tStop, V = 90, px = (Math.min(t, tStop) - t0) * V, pxStop = (tStop - t0) * V, WX = 1000 + pxStop;
    let w = sky('#b4dbef', true, t);
    let fac = plaster(-400, 0, 3400, GY - 0, '#e9cd96');
    for (let j = 0; j < 10; j++) fac += windowBox(-200 + j * 330, 140, 90, 120, 0) + windowBox(-200 + j * 330, 470, 90, 120, 0, '#8a5f3e');
    // the dangerous window (world x 1060 in facade coords)
    const open = eout(seg(t, tSplash - 1.0, tSplash - .7));
    fac += windowBox(WX - 45, 140, 90, 120, open);
    const tip = eio(seg(t, tSplash - .7, tSplash - .45));
    if (open > .1) fac += g(`translate(${WX} 230) rotate(${f(tip * 110)})`, `<path d="M-30 -20 Q-34 30 0 34 Q34 30 30 -20 Z" fill="#b8773f" ${ink(4)}/><circle cx="-26" cy="-6" r="13" fill="${INK}"/>`);
    // falling slop
    const fall = seg(t, tSplash - .45, tSplash);
    if (fall > 0 && fall < 1) fac += `<path d="M${f(WX + 20)} ${f(240 + fall * 700)} q-26 40 0 70 q26 -30 0 -70 Z" fill="#8a6a3a" ${ink(4)}/><path d="M${WX + 20} ${f(250 + fall * 640)} l0 ${f(-60 * (1 - fall))}" stroke="#8a6a3a" stroke-width="10"/>`;
    if (t > tSplash) { const k = eout(seg(t, tSplash, tSplash + .3)); fac += `<ellipse cx="${WX + 20}" cy="${GY + 10}" rx="${f(120 * k)}" ry="${f(20 * k)}" fill="#8a6a3a" ${ink(4)}/>`; for (let i = 0; i < 6; i++) { const kk = seg(t, tSplash, tSplash + .6); if (kk < 1) fac += circ(WX + 20 + Math.cos(i) * 140 * kk, GY - Math.sin(kk * Math.PI) * 120 * (.5 + rnd(i)), 10, '#8a6a3a', 3); } }
    fac += cobble(GY);
    w += g(`translate(${f(-px)} 0)`, fac);
    const mxW = 1180 - (px - 100 - (tStop - t0) * V) * 0; // Max fixed on screen
    const wc = inPlace(t, V, .9, walking ? 1 : 0);
    const turn = K(t, [[tSplash + .2, 90], [tSplash + .6, -40, eback]]);
    w += shadow(1150, GY + 4, 95) + MAX(t, { x: 1150, y: GY + (walking ? wc.bob * .9 : 0), s: .9, yaw: walking ? 90 : turn, legs: walking ? wc.legs : undefined, arms: walking ? wc.arms : { L: { a: [-12, 4] }, R: { a: [12, -4] } }, lean: walking ? wc.lean : 0, idle: walking ? 0 : 1, face: E(t, [[t0, 'smile'], [tSplash + .3, 'surprise'], [tSplash + 1.0, 'disgust' in EMO ? 'disgust' : 'fear'], [tSplash + 1.6, 'anger']]), look: [0, .4], wave: 1.1 });
    let out = cam(w, 960, 520, 1.05);
    out += sfxWord('SPLAT!', 1000, 760, t, tSplash, 1.2, { size: 110 });
    out += factCard('Watch your head!', 960, 110, t, lf(S, 3, .05), { size: 60 });
    return out;
  },
  court(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[4] - .2, GY = 1000;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#ead9b5"/>` + column(300, 120, GY, 70) + column(1620, 120, GY, 70) + rect(-200, GY, 2320, 400, '#c9b48a');
    w += rect(640, GY - 300, 200, 300, '#8a5f3e');
    w += npc('oldman', { x: 740, y: GY - 60, s: .8, t, yaw: 20, face: E(t, [[t0, 'neutral'], [lf(S, 4, .55), 'think'], [lf(S, 4, .8), 'anger']]), arms: { R: { a: [60, -50] }, L: { a: [-20, 10] } }, holdR: scroll(0, -10, .5, 160, 100) });
    w += rect(540, GY - 230, 400, 230, '#a0714a') + rect(520, GY - 250, 440, 30, '#8a5f3e') + text('IUDEX', 740, GY - 120, { size: 44, fill: '#f3e3c0' });
    // window owner pays
    const pay = lf(S, 4, .85);
    w += shadow(1500, GY + 4, 90) + npc('worker', { x: 1500, y: GY, s: .85, t, yaw: -40, face: t > pay ? EMO.sad : EMO.fear, arms: { L: t > pay - .3 ? { a: [-70, -10] } : { a: [-12, 4] } }, sweat: 1 });
    w += shadow(1150, GY + 4, 95) + MAX(t, { x: 1150, y: GY, s: .9, yaw: K(t, [[t0, -20], [lf(S, 4, .6), 30]]), face: E(t, [[t0, 'anger'], [lf(S, 4, .5), 'smug'], [pay + .3, 'joy']]), arms: { L: { a: [K(t, [[t0, -12], [t0 + .5, -85]]), 0] }, R: t > pay + .4 ? { a: [130, 20] } : { a: [12, -4] } }, hands: { L: t < pay ? 'point' : 'fist' } });
    // brown stain on Max's tunic, coins fly to Max
    for (let i = 0; i < 4; i++) { const k = seg(t, pay + i * .12, pay + i * .12 + .6); if (k > 0 && k < 1) w += coin(lerp(1440, 1180, k), lerp(720, 520, k) - Math.sin(k * Math.PI) * 160, .5, 'sestertius', k * 400); }
    let out = cam(w, 1000, 560, 1.0);
    out += factCard('Roman law: "actio de effusis et deiectis"', 960, 110, t, lf(S, 4, .45), { size: 52 });
    out += factCard('(you could sue for things thrown from windows)', 960, 200, t, lf(S, 4, .6), { size: 38, col: '#fff' });
    return out;
  },
  night(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[5] - .2, t1 = L[6] - .2;
    const nk = esine(seg(t, lf(S, 5, .4), lf(S, 5, .7)));
    let day = romeStreet(t, { px: 900 });
    let out = day;
    // day: no-carts sign
    out += factCard('DAY: carts banned ☀', 960, 140, t, lf(S, 5, .05), { size: 60, op: 1 });
    out = op(1 - nk, out);
    let night = nightSky(t) + g('translate(0 0)', BLD.filter(b => b.x - 900 < 2000 && b.x + b.w - 900 > -100).map(b => building(Object.assign({}, b, { col: '#4a4a6a', shop: false, bal: false }), 840, t)).join('').replace(/translate\(0 0\)/, ''));
    night = nightSky(t) + g(`translate(-900 0)`, BLD.filter(b => b.x - 900 < 2000 && b.x + b.w - 900 > -100).map(b => building(Object.assign({}, b, { col: ['#3e4466', '#474d70', '#3a3f5e'][b.i % 3], shop: false }), 840, t)).join('')) + cobble(840, '#5a5a70');
    for (let j = 0; j < 4; j++) night += flatGlow(200 + j * 520, 520, 90, '#ffd27a', .5) + rect(190 + j * 520, 500, 20, 40, '#ffd27a', 3);
    const c1 = -700 + (t - lf(S, 5, .6)) * 330, c2 = -1600 + (t - lf(S, 5, .6)) * 330;
    night += cart(c1, 1000, .7, (t - lf(S, 5, .6)) * 330, '#c9b48a', 'ox', t) + cart(c2, 1000, .7, (t - lf(S, 5, .6)) * 330 + 40, '#a8c08a', 'mule', t);
    out += op(nk, night + factCard('NIGHT: deliveries!', 960, 140, t, lf(S, 5, .72), { size: 60 }) + sfxWord('CLATTER!', 1300, 520, t, lf(S, 5, .85), 2, { size: 90 }));
    return out;
  },
  bed(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[6] - .2, D = S.dur;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#3e3550"/>` + rect(-200, 820, 2320, 600, '#2e2840');
    // window with passing carts
    w += rect(1180, 180, 420, 300, '#1d2440', 6);
    w += `<clipPath id="bw"><rect x="1180" y="180" width="420" height="300"/></clipPath><g clip-path="url(#bw)">${cart(1100 + ((t - t0) * 260) % 900, 470, .35, (t - t0) * 260, '#8a7a5a', 'ox', t)}</g>`;
    w += lineP([[1390, 180], [1390, 480]], 8, '#5a4a6a') + lineP([[1180, 330], [1600, 330]], 8, '#5a4a6a');
    // bed + Max under a blanket
    w += rect(380, 700, 640, 120, '#8a5f3e') + rect(380, 610, 120, 210, '#8a5f3e');
    const pil = K(t, [[lf(S, 6, .6), 0], [lf(S, 6, .75), 1, eback]]);
    w += g(T(560, 600, .95, -80 + Math.sin(t * 8) * 2 * (1 - pil)), headSVG({ face: E(t, [[t0, 'neutral'], [t0 + .6, 'surprise'], [lf(S, 6, .5), 'anger']]), look: [.6, 0], blink: 0 }));
    w += `<path d="M600 700 Q800 590 1010 650 L1020 720 L600 720 Z" fill="#6b7fa8" ${ink(5)}/>`;
    if (pil > 0) w += g(T(lerp(820, 580, pil), lerp(520, 580, pil), 1.1, -10 + pil * 10), `<rect x="-110" y="-60" width="220" height="120" rx="40" fill="#efe9dc" ${ink(5)}/>`);
    let out = cam(w, 980, 520, 1.1);
    out += sfxWord('CLANK!', 1450, 140, t, t0 + .4, .9) + sfxWord('MOOO!', 1700, 560, t, t0 + 1.1, .9, { rot: 6 }) + sfxWord('HEY! MOVE!', 1250, 640, t, t0 + 1.8, 1.0, { size: 64 }) + sfxWord('BANG!', 1500, 300, t, t0 + 2.7, .9);
    return out;
  },
  cues(S) {
    const L = S.L.map(l => l[0]);
    const tSplash = lf(S, 3, .62), pay = lf(S, 4, .85);
    return [[0, 'city', .55], [lf(S, 0, .55), 'pop', .4], [lf(S, 1, .45), 'pop', .4], [lf(S, 1, .78), 'pop', .4], [L[2], 'steps', .3], [lf(S, 2, .3), 'steps', .3], [lf(S, 2, .42), 'pop', .3], [lf(S, 2, .55), 'pop', .3], [lf(S, 2, .78), 'fire', .6],
      [tSplash - 1.0, 'creak', .4], [tSplash, 'splat', .7], [lf(S, 4, .45), 'pop', .4], [pay, 'coins', .5], [lf(S, 5, .4), 'swell', .3], [lf(S, 5, .6), 'cart', .6], [lf(S, 5, .85), 'clank', .4],
      [L[6] + .2, 'clank', .5], [L[6] + .9, 'moo', .5], [L[6] + 1.6, 'shout', .4], [L[6] + 2.5, 'thud', .5]];
  },
};

// ---------------------------------------------------------------- FOOD
SC.food = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    return shots(t, [
      [0, () => this.hungry(t, S)],
      [L[1] - .2, () => this.coins(t, S)],
      [L[2] - .2, () => this.find(t, S)],
      [L[3] - .2, () => this.bar(t, S)],
      [L[5] - .2, () => this.garum(t, S)],
      [L[6] - .2, () => this.ketchup(t, S)],
      [L[7] - .2, () => this.salty(t, S)],
    ]) + (t < .4 ? fadeRect(1 - t / .4, '#000') : '') + (t > D - .3 ? fadeRect(seg(t, D - .3, D), '#000') : '');
  },
  hungry(t, S) {
    const L = S.L.map(l => l[0]), GY = 1000, tPurse = lf(S, 0, .55);
    let w = romeStreet(t, { px: 1400 });
    const growl = Math.sin(seg(t, .4, 1.8) * Math.PI);
    const purse = t > tPurse;
    const flip = eio(seg(t, tPurse + .2, tPurse + .6));
    w += shadow(960, GY + 4, 110) + MAX(t, {
      x: 960, y: GY, s: 1, yaw: 0, face: E(t, [[0, 'neutral'], [.5, 'sad'], [tPurse, 'surprise'], [tPurse + .9, 'sad']]),
      arms: purse ? { L: { a: [-12, 4] }, R: { to: [90, -470 - flip * 40] } } : { L: { to: [-40, -420] }, R: { to: [40, -400] } },
      holdR: purse ? g(`rotate(${f(flip * 170)})`, `<path d="M-30 0 Q-40 50 0 56 Q40 50 30 0 Q14 -14 0 -10 Q-14 -14 -30 0 Z" fill="#b8773f" ${ink(4)}/><path d="M-20 -4 Q0 8 20 -4" fill="none" ${ink(3)}/>`) : '', squash: 1 - growl * .02,
    });
    for (let i = 0; i < 3; i++) if (growl > .05) w += `<path d="M${f(900 - i * 30)} ${f(560 + i * 20)} q-20 -10 -40 0" fill="none" ${ink(4)} opacity="${f(growl)}"/><path d="M${f(1020 + i * 30)} ${f(560 + i * 20)} q20 -10 40 0" fill="none" ${ink(4)} opacity="${f(growl)}"/>`;
    // moth flies out of the empty purse
    const mk = seg(t, tPurse + .6, tPurse + 3);
    if (mk > 0 && mk < 1) { const mx = 1060 + mk * 500, my = 520 - mk * 300 + Math.sin(mk * 20) * 30, fl = Math.sin(t * 40) * .6; w += g(T(mx, my, 1), `<ellipse cx="-12" cy="0" rx="16" ry="${f(10 + fl * 8)}" fill="#cfc6b4" ${ink(3)}/><ellipse cx="12" cy="0" rx="16" ry="${f(10 - fl * 8)}" fill="#cfc6b4" ${ink(3)}/><ellipse cx="0" cy="0" rx="5" ry="12" fill="${INK}"/>`); }
    let out = cam(w, 960, 540, 1.0);
    out += sfxWord('GRRRR...', 1250, 520, t, .5, 1.4, { size: 80, fill: '#6b4a30' });
    out += factCard('Problem #1: hungry', 520, 120, t, lf(S, 0, .05), { size: 54 }) + factCard('Problem #2: no money', 1400, 120, t, lf(S, 0, .5), { size: 54 });
    return out;
  },
  coins(t, S) {
    const L = S.L.map(l => l[0]);
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#f1e2b8"/>` + hatch(0, 0, 1920, 1080, 40, '#8a6a3a', .05);
    const items = [['as', 'AS', 'bronze', lf(S, 1, .38)], ['sestertius', 'SESTERTIUS', 'brass', lf(S, 1, .58)], ['denarius', 'DENARIUS', 'silver', lf(S, 1, .82)]];
    items.forEach(([k, name, mat, t0], i) => {
      if (t < t0) return;
      const x = 480 + i * 480, sp = Math.cos(eout(seg(t, t0, t0 + .9)) * Math.PI * 2), kk = pop(t, t0, .5);
      w += coin(x, 480, 2.4 * kk, k, 0, Math.max(.2, Math.abs(sp))) + text(name, x, 700, { size: 64, op: fadeI(t, t0 + .2) }) + text(`(${mat})`, x, 770, { size: 44, fill: '#6b5a40', op: fadeI(t, t0 + .3) });
    });
    w += text('Roman money', 960, 150, { size: 90, op: fadeI(t, L[1] - .1) });
    return w;
  },
  find(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[2] - .2, GY = 1000, tSpot = lf(S, 2, .2), tPick = lf(S, 2, .38), tUp = lf(S, 2, .55);
    let w = romeStreet(t, { px: 1800 });
    const cx = 1150;
    if (t < tPick + .2) w += coin(cx, GY + 30, .45, 'sestertius', 0, .5) + sparkle(cx + 10, GY + 10, .7 * (.6 + Math.sin(t * 9) * .4), t * 80);
    const walkK = t < tSpot ? 1 : 0, mx = K(t, [[t0, 700], [tSpot, 900, eout]]), wc = walkCycle(walkPh(mx, 700, 1), walkK);
    const crouch = Math.sin(seg(t, tPick - .4, tUp) * Math.PI);
    const raise = eback(seg(t, tUp, tUp + .5));
    const o = { x: mx, y: GY + wc.bob + crouch * 120, s: 1, yaw: K(t, [[tSpot, 90], [tSpot + .3, 40]]), legs: walkK ? wc.legs : { L: [-10 - crouch * 40, crouch * 80], R: [14 + crouch * 30, crouch * 70] }, lean: walkK ? wc.lean : crouch * 26, idle: 0,
      face: E(t, [[t0, 'neutral'], [tSpot, 'surprise'], [tUp, 'joy']]), look: t < tUp ? [.8, .9] : [.3, -.4], arms: { L: { a: [-12, 4] }, R: crouch > .3 ? { to: [230, -120] } : raise > 0 ? { a: [lerp(20, 160, raise), lerp(-10, 10, raise)] } : { a: [12, -4] } } };
    if (t > tPick + .2) o.holdR = g('translate(0 -10)', coin(0, 0, .45, 'sestertius'));
    w += shadow(mx, GY + 4, 100) + MAX(t, o);
    if (t > tUp) for (let i = 0; i < 6; i++) { const a = i * 60 + t * 40, r = 70 + Math.sin(t * 6 + i) * 10; w += sparkle(mx + 150 + Math.cos(rad(a)) * r, 160 + Math.sin(rad(a)) * r, .5, a); }
    let out = cam(w, 980, 600, 1.12);
    out += factCard('+1 SESTERTIUS', 1500, 140, t, tUp + .2, { size: 64, col: '#ffe9a8' });
    out += factCard('= one cheap meal', 1500, 240, t, lf(S, 2, .8), { size: 48 });
    return out;
  },
  bar(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[3] - .2, GY = 1000;
    let w = romeStreet(t, { px: 2300 });
    // thermopolium counter (L-shaped, marble), clay pots in holes
    w += plaster(300, 360, 1320, 480, '#c96a5a') + `<path d="M300 360 L1620 360" ${ink(5)}/>`;
    w += text('THERMOPOLIUM', 700, 420, { size: 60, fill: '#fff6dc', stroke: '#5a1f1a', sw: 8 });
    // painted wall frescos
    w += rect(400, 480, 200, 130, '#e8c98a') + `<path d="M420 600 Q500 510 580 600" fill="none" stroke="#7f9a4a" stroke-width="8"/>` + rect(1300, 470, 200, 130, '#e8c98a') + circ(1400, 535, 36, '#c99a3a');
    // vendor behind counter
    w += npc('merchant', { x: 1060, y: 990, s: .8, t, yaw: 0, face: E(t, [[t0, 'smile'], [lf(S, 3, .6), 'joy']]), arms: { L: { a: [-12, 4] }, R: { a: [K(t, [[t0, 20], [t0 + .5, 150]]) + Math.sin(t * 8) * 15, 10] } } });
    w += rect(360, 800, 1200, 200, '#efe9dc', 6) + hatch(360, 800, 1200, 200, 30, '#9c8a6e', .08);
    const pots = [520, 760, 1000, 1240];
    for (const x of pots) w += `<ellipse cx="${x}" cy="800" rx="70" ry="20" fill="#3a2418" ${ink(5)}/><ellipse cx="${x}" cy="796" rx="56" ry="13" fill="#9c5a3a"/>`;
    // menu items pop above pots
    const items = [['lentils', i => `<ellipse cx="0" cy="0" rx="60" ry="22" fill="#8a5a34" ${ink(4)}/><ellipse cx="0" cy="-6" rx="52" ry="14" fill="#c9a24a" ${ink(3)}/>` + Array.from({ length: 8 }, (_, k) => `<circle cx="${-40 + k * 11}" cy="${-8 + (k % 2) * 4}" r="4" fill="#9a7a2a"/>`).join('')],
      ['bread', i => `<circle cx="0" cy="-10" r="52" fill="#d9a65a" ${ink(4)}/><path d="M0 -60 L0 40 M-50 -10 L50 -10 M-36 -46 L36 26 M36 -46 L-36 26" stroke="#a8763a" stroke-width="4"/>`],
      ['cheese', i => `<path d="M-60 20 L60 20 L60 -20 L-40 -40 Z" fill="#f3d26a" ${ink(4)}/><circle cx="10" cy="0" r="8" fill="#d9b04a"/><circle cx="-24" cy="-14" r="6" fill="#d9b04a"/>`],
      ['olives', i => Array.from({ length: 5 }, (_, k) => `<ellipse cx="${-40 + k * 20}" cy="${(k % 2) * -14}" rx="14" ry="18" fill="${k % 2 ? '#5a6b3a' : '#2e2a2a'}" ${ink(3)}/>`).join('')]];
    items.forEach(([name, svg], i) => { const tt = lf(S, 4, .25 + i * .18); if (t > tt) w += g(T(pots[i], 690 - Math.sin(seg(t, tt, tt + .5) * Math.PI) * 30, pop(t, tt, .4)), svg(i)) + text(name, pots[i], 620, { size: 44, fill: '#fff6dc', stroke: '#3a1f1a', sw: 8, op: fadeI(t, tt) }); });
    // Max walks up to the counter, pays
    const mx = K(t, [[t0, 1950], [t0 + 2.2, 1500, eout]]), walking = t < t0 + 2.2, wc = walkCycle(walkPh(mx, 1950, 1), walking ? 1 - seg(t, t0 + 1.8, t0 + 2.2) : 0);
    const pay = lf(S, 3, .75);
    w += shadow(mx, GY + 4, 110) + MAX(t, { x: mx, y: GY + wc.bob, s: 1, yaw: walking ? -90 : -30, legs: walking ? wc.legs : undefined, arms: walking ? wc.arms : (t > pay - .3 && t < pay + .4 ? { R: { a: [12, -4] }, L: { a: [-80, -10] } } : undefined), lean: walking ? wc.lean : 0, idle: walking ? 0 : 1, face: E(t, [[t0, 'smile'], [L[4], 'joy']]), look: [-.6, 0], wind: walking ? [20, 0] : [0, 0] });
    { const k = seg(t, pay, pay + .6); if (k > 0 && k < 1) w += coin(lerp(1360, 1000, k), lerp(560, 640, k) - Math.sin(k * Math.PI) * 160, .5, 'sestertius', k * 500); }
    let out = cam(w, K(t, [[t0, 1100], [t0 + 2.5, 1000]]), 600, K(t, [[t0, 1.0], [L[4], 1.08]], esine));
    out += factCard('Roman street food bar', 960, 100, t, lf(S, 3, .35), { size: 56 });
    return out;
  },
  garum(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[5] - .2;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#c96a5a"/>` + rect(-200, 760, 2320, 500, '#efe9dc', 6);
    const tip = eio(seg(t, t0 + .4, t0 + 1.0));
    w += g(T(760, 500, 1.6, -tip * 70), amphora(0, 0, 1, '#b8773f'));
    // stream of garum
    if (tip > .9 && t < lf(S, 5, .8)) w += `<path d="M640 420 Q700 520 900 640" fill="none" stroke="#7a5a2a" stroke-width="16" stroke-linecap="round"/>`;
    w += `<path d="M820 650 Q900 720 1000 650 Z" fill="#8a5a34" ${ink(5)}/><ellipse cx="910" cy="650" rx="92" ry="20" fill="#c9a24a" ${ink(4)}/>`;
    // fish skeleton + flies
    const fk = pop(t, lf(S, 5, .45), .5);
    if (fk > 0) w += g(T(1400, 330, fk * 1.2), `<path d="M-150 0 L120 0" ${ink(8)}/>` + Array.from({ length: 6 }, (_, i) => `<path d="M${-110 + i * 40} -50 Q${-100 + i * 40} 0 ${-110 + i * 40} 50" fill="none" ${ink(6)}/>`).join('') + `<path d="M120 0 L200 -60 L200 60 Z" fill="#fff" ${ink(6)}/><path d="M-150 0 L-220 -50 L-220 50 Z" fill="#fff" ${ink(6)}/><circle cx="160" cy="-10" r="8" fill="${INK}"/>`);
    for (let i = 0; i < 4; i++) if (fk > 0) { const a = t * 6 + i * 1.6; w += circ(1400 + Math.cos(a) * 200, 330 + Math.sin(a * 1.3) * 90, 8, INK, 2) + `<ellipse cx="${f(1400 + Math.cos(a) * 200 - 6)}" cy="${f(330 + Math.sin(a * 1.3) * 90 - 10)}" rx="8" ry="5" fill="#fff" ${ink(2)}/>`; }
    w += MAX(t, { x: 330, y: 1500, s: 1.25, ground: false, yaw: 30, face: E(t, [[t0, 'smile'], [lf(S, 5, .5), 'disgust'], [lf(S, 5, .7), 'fear']]), look: [.8, 0], lean: -4 });
    let out = cam(w, 960, 540, 1);
    out += factCard('GARUM', 960, 110, t, lf(S, 5, .1), { size: 80, col: '#ffe9a8' }) + factCard('= fermented fish guts', 1400, 600, t, lf(S, 5, .55), { size: 52 });
    return out;
  },
  ketchup(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[6] - .2;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#f1e2b8"/>`;
    w += g(T(560, 640, 1.6 * pop(t, t0 + .1)), amphora(0, 0, 1, '#b8773f')) + text('GARUM', 560, 820, { size: 64 });
    w += text('=', 960, 520, { size: 200, op: fadeI(t, t0 + .5) });
    const kb = pop(t, t0 + .8);
    if (kb > 0) w += g(T(1360, 640, 1.6 * kb), `<path d="M-50 0 L50 0 L54 -170 Q50 -200 20 -210 L20 -250 L-20 -250 L-20 -210 Q-50 -200 -54 -170 Z" fill="#c8302a" ${ink(5)}/><rect x="-24" y="-280" width="48" height="34" fill="#f3ece0" ${ink(4)}/><rect x="-40" y="-150" width="80" height="70" fill="#f3ece0" ${ink(4)}/>`) + text('KETCHUP', 1360, 820, { size: 64 });
    return w + text('Roman favourite sauce', 960, 140, { size: 72, op: fadeI(t, t0) });
  },
  salty(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[7] - .2, D = S.dur, GY = 1000;
    const tTaste = t0 + .7, tSalt = lf(S, 7, .25), tDrink = lf(S, 7, .7);
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#c96a5a"/>` + rect(-200, 820, 2320, 500, '#efe9dc', 6);
    const spoon = Math.sin(seg(t, t0 + .2, tTaste + .3) * Math.PI);
    const drink = eio(seg(t, tDrink, tDrink + .4));
    const shk = t > tSalt && t < tDrink ? 8 : 0, [sx, sy] = shake(t, shk);
    w += MAX(t, { x: 960 + sx, y: 1350 + sy, s: 1.3, ground: false, yaw: 0, face: E(t, [[t0, 'smile'], [tTaste, 'neutral'], [tSalt - .3, 'surprise'], [tSalt, { ...EMO.fear, e: { open: 1, happy: 0 } }], [tSalt + .2, 'yell']]),
      eyes: undefined, sweat: t > tSalt ? 1.5 : 0, arms: { L: drink > 0 ? { to: [-20, -760 + (1 - drink) * 200] } : { to: [-120, -360] }, R: { to: [lerp(150, 30, spoon), lerp(-360, -690, spoon)] } },
      holdR: `<path d="M0 0 L0 -60" stroke="#8a5a34" stroke-width="8"/><ellipse cx="0" cy="-70" rx="14" ry="10" fill="#8a5a34" ${ink(3)}/>`,
      holdL: drink > 0 ? g(`rotate(${f(-drink * 120)})`, `<path d="M-50 -20 L50 -20 L40 120 L-40 120 Z" fill="#c9875a" ${ink(5)}/><ellipse cx="0" cy="-20" rx="50" ry="12" fill="#7fb7dd" ${ink(4)}/>`) : `<path d="M-60 -10 Q-60 40 0 44 Q60 40 60 -10 Z" fill="#8a5a34" ${ink(4)}/>` });
    // salt crystals burst
    if (t > tSalt) for (let i = 0; i < 10; i++) { const k = seg(t, tSalt, tSalt + .8), a = i * 36; if (k < 1) w += `<rect x="${f(960 + Math.cos(rad(a)) * (100 + k * 400))}" y="${f(300 + Math.sin(rad(a)) * (100 + k * 300))}" width="18" height="18" fill="#fff" ${ink(3)} transform="rotate(${f(a + k * 200)} ${f(960 + Math.cos(rad(a)) * (100 + k * 400))} ${f(300 + Math.sin(rad(a)) * (100 + k * 300))})"/>`; }
    let out = cam(w, 960, 520, 1);
    out += sfxWord('SALTY!!!', 960, 140, t, tSalt, 2.4, { size: 130, shake: 8 });
    out += sfxWord('GULP GULP GULP', 1450, 420, t, tDrink + .2, 1.5, { size: 60, fill: '#3f6f8f' });
    return out;
  },
  cues(S) {
    const L = S.L.map(l => l[0]);
    return [[0, 'city', .5], [.5, 'growl', .7], [lf(S, 0, .55) + .6, 'flutter', .4], [lf(S, 1, .38), 'coin', .6], [lf(S, 1, .58), 'coin', .6], [lf(S, 1, .82), 'coin', .6], [lf(S, 2, .2), 'glint', .6], [lf(S, 2, .55), 'sparkle', .5],
      [L[3] - .2, 'steps', .4], [lf(S, 3, .75), 'coin', .5], ...[0, 1, 2, 3].map(i => [lf(S, 4, .25 + i * .18), 'pop', .4]), [L[5] + .2, 'pour', .6], [lf(S, 5, .45), 'buzz', .4], [L[6] + .1, 'pop', .3], [L[6] + .8, 'pop', .3],
      [lf(S, 7, .45), 'shout', .6], [lf(S, 7, .85) + .2, 'gulp', .6]];
  },
};

// ---------------------------------------------------------------- FORUM
function basilica(x, y, s) {
  let b = rect(-420, -300, 840, 300, '#efe6d2');
  for (let i = 0; i < 6; i++) b += `<path d="M${-380 + i * 135} 0 L${-380 + i * 135} -150 Q${-330 + i * 135} -220 ${-280 + i * 135} -150 L${-280 + i * 135} 0 Z" fill="#6b5a40" ${ink(4)}/>`;
  for (let i = 0; i < 6; i++) b += `<path d="M${-370 + i * 135} -200 L${-370 + i * 135} -260 Q${-330 + i * 135} -290 ${-290 + i * 135} -260 L${-290 + i * 135} -200 Z" fill="#6b5a40" ${ink(3)}/>`;
  b += poly([[-450, -300], [450, -300], [400, -360], [-400, -360]], '#c0603f');
  return g(T(x, y, s), b);
}
function curia(x, y, s) {
  let c = wallBricks(-200, -420, 400, 420, '#c9875a', '#a8693f');
  c += poly([[-230, -420], [0, -520], [230, -420]], '#c0603f') + rect(-90, -260, 180, 260, '#5a3a24') + lineP([[0, -260], [0, 0]], 4);
  c += rect(-240, -10, 480, 16, '#efe6d2');
  return g(T(x, y, s), c);
}
SC.forum = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    return shots(t, [
      [0, () => this.square(t, S)],
      [L[1] - .2, () => this.pan(t, S)],
      [L[2] - .2, () => this.lawyer(t, S)],
      [L[3] - .2, () => this.graffiti(t, S)],
      [L[4] - .2, () => this.quote(t, S)],
      [L[5] - .2, () => this.maxwrites(t, S)],
    ]) + (t < .4 ? fadeRect(1 - t / .4, '#000') : '') + (t > D - .3 ? fadeRect(seg(t, D - .3, D), '#000') : '');
  },
  plaza(t, px = 0) {
    let w = sky('#b4dbef', true, t);
    w += g(`translate(${f(-px)} 0)`, temple(300, 760, .9, { cols: 6 }) + basilica(1050, 760, .8) + curia(1700, 760, .9) + temple(2300, 760, .8, { cols: 4 }) + temple(-400, 760, .7, { cols: 4 }));
    w += rect(-200, 760, 2320, 600, '#e6dcc6') + hatch(-200, 760, 2320, 600, 60, '#b3a68d', .12);
    for (let i = 0; i < 12; i++) w += `<path d="M${-200 + i * 200 - (px * .5) % 200} 760 L${-600 + i * 260 - (px * .5) % 200} 1080" stroke="#cbbfa6" stroke-width="3"/>`;
    return w;
  },
  square(t, S) {
    const L = S.L.map(l => l[0]), GY = 980;
    let w = this.plaza(t, 0);
    const ppl = [['oldman', -200, 40, .6, 1], ['lady', 2100, -50, .6, 2], ['merchant', 2400, -60, .6, 3], ['worker', -600, 50, .6, 4], ['woman', 2800, -40, .6, 5]];
    for (const [k, x0, v, s, i] of ppl) { const r = walker(k, x0, v, t, 900, s, i); if (r.x > -200 && r.x < 2150) w += r.svg; }
    const mx = K(t, [[0, -150], [4.5, 760, k => 1 - (1 - k) * (1 - k)]]), walking = t < 4.5, wc = walkCycle(walkPh(mx, -150, .75), walking ? 1 - seg(t, 4.1, 4.5) : 0);
    w += shadow(mx, GY + 4, 80) + MAX(t, { x: mx, y: GY + wc.bob * .75, s: .75, yaw: walking ? 90 : 20, legs: walking ? wc.legs : undefined, arms: walking ? wc.arms : { L: { a: [-150, -10] }, R: { a: [150, 10] } }, lean: walking ? wc.lean : 0, idle: walking ? 0 : 1, face: E(t, [[0, 'smile'], [4.5, 'joy']]), look: [0, -.4] });
    let out = cam(w, K(t, [[0, 820], [5, 960]]), 560, K(t, [[0, 1.15], [5, 1.0]], esine));
    out += factCard('FORUM ROMANUM', 960, 110, t, lf(S, 0, .4), { size: 70, col: '#ffe9a8' });
    return out;
  },
  pan(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[1] - .2;
    const px = K(t, [[t0, -400], [lf(S, 1, .3), -400], [lf(S, 1, .55), 300], [lf(S, 1, .85), 900]], eio);
    let w = this.plaza(t, px);
    // senators walk into the curia
    for (let i = 0; i < 3; i++) { const sx = 1500 - px + (t - t0) * 60 - i * 150; if (sx < 1700 - px) w += shadow(sx, 924, 60) + npc('oldman', { x: sx, y: 920 + walkCycle((t - t0) * 4 + i).bob * .55, s: .55, yaw: 90, t, legs: walkCycle((t - t0) * 4 + i).legs, arms: walkCycle((t - t0) * 4 + i).arms, face: EMO.neutral, phase: i, hairCol: ['#a9a5a0', '#2b2523', '#6b4a32'][i] }); }
    let out = cam(w, 960, 520, 1);
    out += factCard('TEMPLES', 300 - px, 220, t, lf(S, 1, .2), { size: 56 });
    out += factCard('LAW COURTS (basilica)', 1050 - px, 260, t, lf(S, 1, .38), { size: 52 });
    out += factCard('SENATE HOUSE (curia)', 1700 - px, 200, t, lf(S, 1, .55), { size: 52, col: '#ffe9a8' });
    return out;
  },
  lawyer(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[2] - .2, GY = 980;
    let w = this.plaza(t, 300);
    // rostra platform
    w += rect(560, 790, 800, 120, '#e2d5ba') + rect(540, 770, 840, 30, '#efe6d2') + Array.from({ length: 4 }, (_, i) => `<path d="M${640 + i * 200} 820 l40 0 l-20 50 Z" fill="#7a7672" ${ink(3)}/>`).join('');
    const gest = Math.sin(t * 3.2), talk = .5 + .5 * Math.sin(t * 13);
    w += shadow(820, 774, 70) + npc('oldman', { x: 820, y: 770, s: .7, t, yaw: 30, face: mix(EMO.yell, EMO.talk, talk), arms: { L: { a: [-60 - gest * 40, -20] }, R: { a: [100 + gest * 30, 20] } }, hands: { R: gest > .3 ? 'point' : 'fist' } });
    w += shadow(1150, 774, 70) + npc('merchant', { x: 1150, y: 770, s: .7, t, yaw: -30, face: E(t, [[t0, 'anger'], [t0 + 3, 'yell']]), arms: { L: { a: [-12, 4] }, R: { a: [30 + Math.sin(t * 4) * 20, -60] } } });
    // crowd watching
    w += crowdRows(150, 1850, 960, 2, 70, .85, t, 40, .7);
    // Max in the crowd eating olives like popcorn
    const eat = Math.max(0, Math.sin(t * 3)) ;
    w += MAX(t, { x: 1560, y: 1300, s: .8, ground: false, yaw: -20, face: E(t, [[t0, 'smile'], [t0 + 2, 'grin']]), arms: { L: { to: [-60, -440] }, R: { to: [lerp(60, 20, eat), lerp(-440, -650, eat)] } }, holdL: `<path d="M-40 -10 Q-40 30 0 32 Q40 30 40 -10 Z" fill="#8a5a34" ${ink(4)}/><circle cx="-14" cy="-12" r="9" fill="#5a6b3a" ${ink(2)}/><circle cx="10" cy="-12" r="9" fill="#2e2a2a" ${ink(2)}/>`, look: [-.6, -.3] });
    let out = cam(w, 960, 560, 1.0);
    // TV overlay
    const tv = fadeI(t, lf(S, 2, .7), .3);
    if (tv > 0) out += op(tv, `<rect x="40" y="40" width="1840" height="1000" rx="40" fill="none" stroke="${INK}" stroke-width="22"/>` + circ(140, 120, 22, '#e23a2a', 4) + text('LIVE', 230, 122, { size: 56, font: 'Patrick Hand', fill: '#e23a2a' }) + factCard('ancient reality TV', 1500, 980, t, lf(S, 2, .72), { size: 56, col: '#ffe9a8' }));
    return out;
  },
  graffiti(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[3] - .2, GY = 1000;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#ecd9b0"/>` + hatch(0, 0, 1920, 1000, 50, '#a8875a', .08) + cobble(GY);
    const items = [
      [lf(S, 3, .3), 330, 260, 'VOTE GAIUS FOR AEDILE!', -4, '#a8322d'],
      [lf(S, 3, .45), 1180, 230, 'GAIUS IS A FOOL', 5, INK],
      [lf(S, 3, .6), 420, 560, 'MARCUS ♥ JULIA', -3, '#a8322d'],
      [lf(S, 3, .75), 1200, 560, 'HA HA HA', 2, INK]];
    for (const [tt, x, y, str, r, col] of items) if (t > tt) { const k = seg(t, tt, tt + .5); const shown = str.slice(0, Math.ceil(str.length * k)); w += text(shown, x - str.length * 14, y, { size: 64, font: 'Gochi Hand', fill: col, rot: r, anchor: 'start' }); }
    if (t > lf(S, 3, .5)) w += g(T(980, 420, pop(t, lf(S, 3, .5))), `<circle cx="0" cy="0" r="70" fill="none" ${ink(5)}/><circle cx="-22" cy="-10" r="6" fill="${INK}"/><circle cx="22" cy="-10" r="6" fill="${INK}"/><path d="M-30 30 Q0 10 30 30" fill="none" ${ink(5)}/><path d="M-20 -70 L-30 -110 M0 -70 L0 -115 M20 -70 L30 -110" ${ink(5)}/>`);
    w += shadow(1720, GY + 4, 100) + MAX(t, { x: 1720, y: GY, s: .9, yaw: -40, face: E(t, [[t0, 'curious' in EMO ? 'curious' : 'think'], [lf(S, 3, .5), 'smile'], [lf(S, 3, .8), 'joy']]), look: [-.8, -.3], arms: { L: t > lf(S, 3, .8) ? { to: [-20, -420] } : { a: [-12, 4] }, R: { a: [12, -4] } } });
    return cam(w, 960, 540, 1) + factCard('Graffiti everywhere', 960, 1000, t, t0 + .2, { size: 56 });
  },
  quote(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[4] - .2;
    const crack = seg(t, lf(S, 4, .7), lf(S, 4, .95)), [sx, sy] = shake(t, crack > 0 && crack < 1 ? 5 : 0);
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#ecd9b0"/>` + hatch(0, 0, 1920, 1080, 50, '#a8875a', .08);
    const lines = ['ADMIROR, O PARIES, TE NON CECIDISSE,', 'QUI TOT SCRIPTORUM TAEDIA SUSTINEAS'];
    lines.forEach((str, i) => { const k = seg(t, t0 + .4 + i * 1.6, t0 + 1.9 + i * 1.6); w += text(str.slice(0, Math.ceil(str.length * k)), 160, 330 + i * 120, { size: 70, anchor: 'start', fill: '#3a2a1e' }); });
    if (crack > 0) w += `<path d="M960 0 L930 120 L990 220 L940 330 L1000 470 L960 560" fill="none" ${ink(6)} stroke-dasharray="700" stroke-dashoffset="${f(700 * (1 - crack))}"/><path d="M990 220 L1080 260 M940 330 L860 380" fill="none" ${ink(5)} opacity="${f(crack)}"/>`;
    let out = g(`translate(${f(sx)} ${f(sy)})`, w);
    out += factCard('"I\'m amazed, O wall, that you haven\'t collapsed', 960, 720, t, lf(S, 4, .45), { size: 46, col: '#fff' });
    out += factCard('under the weight of so much boring writing."', 960, 810, t, lf(S, 4, .5), { size: 46, col: '#fff' });
    out += factCard('— a real wall in Pompeii', 1450, 950, t, lf(S, 4, .65), { size: 44, col: '#ffe9a8' });
    return out;
  },
  maxwrites(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[5] - .2, D = S.dur, GY = 1000;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#ecd9b0"/>` + hatch(0, 0, 1920, 1000, 50, '#a8875a', .08) + cobble(GY);
    w += text('GAIUS IS A FOOL', 1450, 200, { size: 54, rot: 5 }) + text('VOTE GAIUS', 1450, 330, { size: 54, fill: '#a8322d', rot: -4 });
    const k = seg(t, t0 + .3, D - .8), str = 'MAX WAS HERE';
    const wr = Math.sin(t * 22) * 12 * (k > 0 && k < 1);
    w += text(str.slice(0, Math.ceil(str.length * k)), 640, 470, { size: 90, anchor: 'start', fill: '#2b2523', rot: -3 });
    const done = k >= 1;
    w += shadow(560, GY + 4, 100) + MAX(t, { x: 560, y: GY, s: 1, yaw: done ? K(t, [[D - .8, 60], [D - .4, 10]]) : 60, face: done ? EMO.smug : EMO.think, look: done ? [0, 0] : [.8, -.3], arms: done ? { R: { a: [12, -4] }, L: { a: [-12, 4] } } : { R: { to: [lerp(150, 420, k) + wr, -620 + wr * .5] }, L: { a: [-12, 4] } }, holdR: done ? '' : `<rect x="-6" y="-30" width="12" height="40" rx="4" fill="#2b2523" ${ink(3)}/>` });
    return cam(w, 900, 560, 1.05);
  },
  cues(S) {
    const L = S.L.map(l => l[0]);
    return [[0, 'city', .5], [lf(S, 0, .4), 'pop', .4], [lf(S, 1, .2), 'pop', .3], [lf(S, 1, .38), 'pop', .3], [lf(S, 1, .55), 'pop', .3], [L[2], 'murmur', .5], [lf(S, 2, .7), 'tvbeep', .5],
      ...[.3, .45, .6, .75].map(k => [lf(S, 3, k), 'scribble', .4]), [L[4] + .2, 'scribble', .4], [L[4] + 1.8, 'scribble', .4], [lf(S, 4, .7), 'rumble', .6], [L[5], 'scribble', .5], [S.dur - .7, 'sparkle', .3]];
  },
};

// ---------------------------------------------------------------- GODS
SC.gods = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    return shots(t, [
      [0, () => this.pantheon(t, S)],
      [L[1] - .2, () => this.priest(t, S)],
      [L[2] - .2, () => this.lararium(t, S)],
      [L[3] - .2, () => this.storm(t, S)],
    ]) + (t < .4 ? fadeRect(1 - t / .4, '#000') : '') + (t > D - .3 ? fadeRect(seg(t, D - .3, D), '#000') : '');
  },
  pantheon(t, S) {
    const L = S.L.map(l => l[0]), GY = 1000;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#d9c9a8"/>`;
    for (let i = 0; i < 6; i++) w += column(120 + i * 336, 0, 820, 70);
    w += rect(-200, 820, 2320, 600, '#c9b48a');
    const bolt = `<path d="M0 -60 L-24 0 L4 0 L-16 60 L30 -16 L4 -16 L24 -60 Z" fill="#f3d26a" ${ink(4)}/>`;
    const spear = `<path d="M0 60 L0 -200" stroke="#8a5a34" stroke-width="8"/><path d="M-12 -200 L0 -240 L12 -200 Z" fill="${PAL.blade}" ${ink(4)}/>`;
    const heart = `<path d="M0 30 C-60 -10 -40 -60 0 -30 C40 -60 60 -10 0 30 Z" fill="#e06a7a" ${ink(4)}/>`;
    const feather = `<path d="M0 40 Q-30 -40 0 -110 Q30 -40 0 40 Z" fill="#3f8f8a" ${ink(4)}/><circle cx="0" cy="-60" r="14" fill="#2a4a8a" ${ink(3)}/>`;
    const gods = [['JUPITER', 'bald', true, { R: { a: [150, 10] } }, bolt, 'R'], ['JUNO', 'bun', false, { R: { a: [40, -40] } }, feather, 'R'], ['MARS', 'short', false, { R: { a: [20, -10] } }, spear, 'R'], ['VENUS', 'long', false, { L: { a: [-40, 40] } }, heart, 'L']];
    gods.forEach(([name, hair, beard, arms, prop, hand], i) => {
      const tt = lf(S, 0, .42 + i * .13); if (t < tt) return;
      const k = pop(t, tt, .5);
      w += g(T(330 + i * 420, 830, k), statue(0, 0, .55, { hair, beard, arms, [hand === 'R' ? 'holdR' : 'holdL']: g('scale(2)', prop), helmet: name === 'MARS', dress: name !== 'JUPITER' && name !== 'MARS', label: '' }) + text(name, 0, 40, { size: 50, fill: '#3a2a1e' }));
    });
    w += shadow(960, GY + 70, 80) + MAX(t, { x: 960, y: GY + 70, s: .55, yaw: 180, face: EMO.surprise, idle: 1 });
    let out = cam(w, 960, K(t, [[0, 420], [lf(S, 0, .4), 540]]), K(t, [[0, 1.3], [lf(S, 0, .4), 1.0]], esine));
    out += factCard('Many gods...', 960, 100, t, .8, { size: 60 });
    return out;
  },
  priest(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[1] - .2, GY = 1000;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#d9c9a8"/>` + column(200, 0, 820, 70) + column(1720, 0, 820, 70) + rect(-200, 820, 2320, 600, '#c9b48a');
    w += rect(760, 700, 400, 140, '#efe6d2') + rect(740, 680, 440, 30, '#e2d5ba') + flame(1100, 680, .4, t);
    // liver model (bronze "Piacenza liver" style) with a grid
    const exam = Math.sin(t * 2.4) * 10;
    w += g(T(930, 650, 1), `<path d="M-120 0 Q-130 -60 -40 -70 Q60 -80 110 -40 Q140 -10 100 10 Q0 30 -120 0 Z" fill="#a0603a" ${ink(5)}/><path d="M-80 -50 L-70 10 M-20 -66 L-10 18 M40 -64 L40 16 M-110 -20 L120 -20" stroke="#6b3a20" stroke-width="3"/>`);
    w += shadow(700, GY + 4, 90) + npc('oldman', { x: 700, y: GY, s: .85, t, yaw: 45, face: E(t, [[t0, 'think'], [lf(S, 1, .6), 'surprise']]), look: [.6, .8], arms: { R: { to: [lerp(200, 240, .5) + exam, -420] }, L: { a: [-20, 10] } }, hands: { R: 'point' } });
    // nervous sheep
    const sh = Math.sin(t * 30) * 3;
    w += g(T(1450 + sh, 980, 1), `<path d="M-40 -60 L-40 0 M-10 -60 L-10 0 M40 -60 L40 0 M60 -60 L60 0" ${ink(8)}/>` + Array.from({ length: 7 }, (_, i) => circ(-60 + i * 22, -110 + (i % 2) * 14, 40, '#f3efe6', 4)).join('') + `<ellipse cx="100" cy="-130" rx="44" ry="34" fill="#3a3330" ${ink(4)}/><circle cx="112" cy="-138" r="10" fill="#fff"/><circle cx="114" cy="-136" r="5" fill="${INK}"/><path d="M96 -100 Q112 -92 126 -100" fill="none" stroke="#fff" stroke-width="4"/>` + `<path d="M140 -170 Q156 -186 150 -150 Z" fill="#9fd0ef" ${ink(3)}/>`);
    w += shadow(1220, GY + 4, 80) + MAX(t, { x: 1230, y: GY, s: .85, yaw: -40, face: E(t, [[t0, 'surprise'], [lf(S, 1, .5), 'disgust' in EMO ? 'disgust' : 'sad']]), look: [-.6, .5], lean: -6 });
    let out = cam(w, 1000, 560, 1.05);
    out += factCard('HARUSPEX: reading signs from the gods', 960, 110, t, lf(S, 1, .25), { size: 52 });
    return out;
  },
  lararium(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[2] - .2, GY = 1000;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#c96a5a"/>` + rect(-200, 820, 2320, 600, '#8a5f3e') + rect(-200, 300, 2320, 12, '#e8c98a', 0);
    // lararium niche
    w += g(T(960, 640, 1), poly([[-200, -260], [0, -360], [200, -260]], '#efe6d2') + rect(-180, -260, 360, 300, '#efe6d2') + rect(-150, -230, 300, 240, '#d9a066') +
      g('translate(-70 0) scale(.28)', statue(0, 0, 1, { hair: 'curly', arms: { R: { a: [150, 0] } }, noWobble: true })) + g('translate(70 0) scale(.28)', statue(0, 0, 1, { hair: 'curly', arms: { L: { a: [-150, 0] } } })) + rect(-200, 40, 400, 30, '#efe6d2'));
    w += flame(960, 700, .25, t) + `<path d="M920 700 Q960 730 1000 700 Z" fill="#c9875a" ${ink(4)}/>`;
    const bow = .5 + .5 * Math.sin(t * 1.6);
    w += shadow(520, GY + 4, 80) + npc('woman', { x: 520, y: GY, s: .85, t, yaw: 50, lean: 14 * bow, face: EMO.sleepy, arms: { L: { to: [60, -560] }, R: { to: [90, -560] } } });
    w += shadow(700, GY + 4, 60) + npc('boy', { x: 700, y: GY, s: .85, t, yaw: 50, lean: 14 * bow, face: EMO.sleepy, arms: { L: { to: [60, -560] }, R: { to: [90, -560] } } });
    const copy = seg(t, t0 + 1.5, t0 + 2.2);
    w += shadow(1400, GY + 4, 90) + MAX(t, { x: 1400, y: GY, s: .9, yaw: -50, lean: 16 * bow * copy, face: E(t, [[t0, 'curious' in EMO ? 'curious' : 'think'], [t0 + 1.6, 'sleepy']]), look: [-.8, 0], arms: copy > .5 ? { L: { to: [-60, -560] }, R: { to: [-90, -560] } } : undefined });
    let out = cam(w, 960, 560, 1.0);
    out += factCard('LARARIUM: shrine for household spirits (lares)', 960, 110, t, lf(S, 2, .45), { size: 50 });
    return out;
  },
  storm(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[3] - .2, D = S.dur, GY = 1000, tBolt = lf(S, 3, .78);
    const dark = esine(seg(t, t0 + .3, tBolt - .5));
    let w = romeStreet(t, { px: 600 }) + fadeRect(dark * .55, '#1d2440');
    // storm cloud gathers over Max
    const ck = eout(seg(t, t0 + .4, tBolt - .3));
    w += g(T(1000, 180, .6 + ck * .9), `<path d="M-200 40 Q-220 -30 -150 -40 Q-140 -110 -60 -100 Q-20 -160 60 -110 Q150 -130 160 -50 Q230 -40 210 40 Z" fill="#5a5a70" ${ink(6)}/>`, `opacity="${f(ck)}"`);
    const flash = t > tBolt && t < tBolt + .35;
    if (flash) w += `<path d="M1000 260 L940 520 L1010 520 L930 ${GY}" fill="none" stroke="#fff6a0" stroke-width="26" stroke-linejoin="round"/><path d="M1000 260 L940 520 L1010 520 L930 ${GY}" fill="none" ${ink(6)}/>`;
    const jump = Math.sin(seg(t, tBolt, tBolt + .5) * Math.PI);
    const charred = t > tBolt;
    w += shadow(1240, GY + 4, 100) + MAX(t, { x: 1240, y: GY - jump * 160, s: 1, yaw: -20, face: E(t, [[t0, 'smile'], [t0 + 1.2, 'think'], [tBolt, 'fear'], [tBolt + 1.2, 'sad']]), look: [0, -.8], arms: jump > .1 ? { L: { a: [-150, -10] }, R: { a: [150, 10] } } : undefined, legs: jump > .1 ? { L: [-30, 40], R: [30, -40] } : undefined });
    if (charred) w += smoke(1240, 140, t, 4, .6, '#5a5a5a');
    let out = cam(w, 1080, 540, 1.05);
    if (flash) out += fadeRect(.7 * (1 - seg(t, tBolt, tBolt + .35)), '#fffbe0');
    out += sfxWord('KRAKOOOM!', 960, 160, t, tBolt, 1.5, { size: 120, fill: '#3f4f8f' });
    out += factCard("Don't anger the gods!", 960, 980, t, lf(S, 3, .4), { size: 60 });
    return out;
  },
  cues(S) {
    const L = S.L.map(l => l[0]);
    return [[0, 'shimmer', .4], ...[0, 1, 2, 3].map(i => [lf(S, 0, .42 + i * .13), 'pop', .4]), [L[1] - .1, 'whoosh', .2], [lf(S, 1, .3), 'baa', .5], [L[2] - .1, 'whoosh', .2], [lf(S, 3, .2), 'rumble', .4], [lf(S, 3, .78), 'thunder', .9]];
  },
};

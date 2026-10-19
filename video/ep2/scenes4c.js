// Scenes 11-13: dangers, choice, outro
function vigil(o) { return npc('soldier', Object.assign({ helmet: false, armor: false, hairStyle: 'short', hairCol: '#2b2523', capeCol: '#9c2a2a', tunicCol: '#b8473f', tunicLine: '#963630' }, o)); }
function insulaFront(x, y, s, o = {}) {
  let b = plaster(-300, -900, 600, 900, o.col || '#e6bf86');
  b += poly([[-330, -900], [330, -900], [300, -960], [-300, -960]], '#c0603f');
  for (let fl = 0; fl < 5; fl++) for (let j = 0; j < 3; j++) b += windowBox(-230 + j * 180, -820 + fl * 160, 80, 100, 0, (fl + j) % 2 ? '#7a8f5a' : '#8a5f3e');
  b += rect(-240, -150, 480, 150, '#3a271c');
  if (o.cracks) b += `<path d="M-120 -700 l30 60 l-20 50 l40 70 M140 -500 l-30 40 l30 60" fill="none" ${ink(5)}/>`;
  return g(T(x, y, s, o.rot || 0), b);
}
function modernCity(x0, x1, GY) {
  let s = rect(x0, -200, x1 - x0, 1500, '#cfe6f5', 0);
  const cols = ['#9ab0c8', '#b8c4d4', '#8aa0b8', '#c8d0dc'];
  for (let i = 0; i < 6; i++) { const bx = x0 + 20 + i * (x1 - x0) / 6, h = 380 + rnd(i + 30) * 420, w = (x1 - x0) / 6 - 30; s += rect(bx, GY - h, w, h, cols[i % 4]); for (let r = 0; r < Math.floor(h / 70) - 1; r++) for (let c = 0; c < 3; c++) s += rect(bx + 14 + c * (w - 28) / 3, GY - h + 30 + r * 70, (w - 28) / 3 - 12, 40, '#e8f4ff', 3); }
  return s + rect(x0, GY, x1 - x0, 400, '#8a8f96', 5) + `<path d="M${x0} ${GY + 60} L${x1} ${GY + 60}" stroke="#fff" stroke-width="8" stroke-dasharray="60 50"/>`;
}

// ---------------------------------------------------------------- DANGERS
SC.dangers = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    return shots(t, [
      [0, () => this.dusk(t, S)],
      [L[1] - .2, () => this.fire(t, S)],
      [L[2] - .2, () => this.collapse(t, S)],
      [L[3] - .2, () => this.dark(t, S)],
      [L[4] - .2, () => this.doctor(t, S)],
    ]) + (t < .4 ? fadeRect(1 - t / .4, '#000') : '') + (t > D - .4 ? fadeRect(seg(t, D - .4, D), '#000') : '');
  },
  dusk(t, S) {
    const GY = 1000;
    let w = romeStreet(t, { px: 4200 }) + fadeRect(.25 * seg(t, .5, 3.5), '#3a2a5a');
    w += shadow(960, GY + 4, 110) + MAX(t, { x: 960, y: GY, s: 1, yaw: 0, face: E(t, [[0, 'joy'], [1.6, 'neutral'], [2.6, 'worried' in EMO ? 'worried' : 'sad']]), arms: { L: { a: [K(t, [[0, -150], [1.6, -12]]), -10] }, R: { a: [K(t, [[0, 150], [1.6, 12]]), 10] } } });
    return cam(w, 960, 540, K(t, [[0, 1], [4, 1.15]], eio));
  },
  fire(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[1] - .2, GY = 1000;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#4a3a5a"/>` + insulaFront(700, GY, 1);
    // flames from windows + smoke
    for (const [x, y, s] of [[520, 420, .5], [700, 260, .6], [880, 420, .5], [700, 580, .45]]) w += flame(x, y, s * eout(seg(t, t0, t0 + 1)), t, x);
    w += smoke(700, 120, t, 6, 1.6, '#5a5260');
    w += flatGlow(700, 450, 520, '#ff9a4a', .5) + cobble(GY);
    // bucket chain
    const pass = (t * 1.3) % 1;
    const chain = [1050, 1250, 1450, 1650];
    chain.forEach((x, i) => {
      const reach = Math.sin((pass + i * .25) * Math.PI * 2);
      w += shadow(x, GY + 4, 70) + (i === 2 ? MAX(t, { x, y: GY, s: .78, yaw: -70, face: E(t, [[t0, 'fear'], [t0 + 2, 'anger']]), arms: { L: { a: [-60 - reach * 30, -20] }, R: { a: [-50 - reach * 30, -20] } }, sweat: 1, wind: [30, 0] })
        : vigil({ x, y: GY, s: .78, yaw: -70, t, face: EMO.anger, arms: { L: { a: [-60 - reach * 30, -20] }, R: { a: [-50 - reach * 30, -20] } }, phase: i }));
    });
    for (let i = 0; i < 4; i++) { const u = (pass + i / 4) % 1; w += bucket(lerp(1650, 1000, u), 640 - Math.sin(u * Math.PI * 4) * 20, .9); }
    let out = cam(w, 1000, 540, 1);
    out += factCard('Fires all the time!', 520, 980, t, t0 + .5, { size: 56, col: '#ffe0b0' });
    out += factCard('VIGILES: firefighters & night watch', 1300, 120, t, lf(S, 1, .55), { size: 50 });
    return out;
  },
  collapse(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[2] - .2, GY = 1000, tC = lf(S, 2, .45);
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#c9b8d8"/>` + cobble(GY);
    const wob = t < tC ? Math.sin(t * 9) * 2.5 * seg(t, t0, tC) : 0;
    const fall = ein(seg(t, tC, tC + .7));
    if (fall < 1) w += g(`translate(760 ${GY}) scale(1 ${f(1 - fall * .95)}) rotate(${f(wob + fall * 8)}) translate(-760 ${-GY})`, insulaFront(760, GY, 1, { cracks: true, rot: 4 }));
    const dk = seg(t, tC + .3, tC + 2.5);
    if (dk > 0 && dk < 1) for (let i = 0; i < 10; i++) w += circ(760 + (i - 5) * 80 * (1 + dk), GY - 80 - Math.sin(i) * 60 - dk * 200, 80 + dk * 100, '#d8c9a8', 5).replace('<circle', `<circle opacity="${f(1 - dk)}"`);
    if (t > tC + .7) w += Array.from({ length: 8 }, (_, i) => rect(500 + i * 70, GY - 40 - (i % 3) * 30, 90, 40, i % 2 ? '#e6bf86' : '#c0603f', 4)).join('');
    const jump = Math.sin(seg(t, tC, tC + .5) * Math.PI);
    w += shadow(1450, GY + 4, 100) + MAX(t, { x: 1450 + seg(t, tC, tC + .5) * 120, y: GY - jump * 120, s: 1, yaw: -40, face: E(t, [[t0, 'think'], [tC - .5, 'fear'], [tC + 1.5, 'sad']]), look: [-.8, -.4], arms: jump > .1 ? { L: { a: [-150, 0] }, R: { a: [150, 0] } } : undefined });
    const [sx, sy] = shake(t, 12 * (t > tC ? 1 - seg(t, tC, tC + 1.2) : 0));
    let out = cam(w, 1000 + sx, 540 + sy, 1);
    out += sfxWord('CREEEAK...', 760, 160, t, t0 + .5, 1.6, { size: 70, fill: '#5d4a3a' }) + sfxWord('CRASH!!', 760, 300, t, tC + .3, 1.4, { size: 130 });
    return out;
  },
  dark(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[3] - .2, GY = 1000, tTorch = lf(S, 3, .38), tGrab = lf(S, 3, .72);
    let w = romeStreet(t, { px: 5000 }) + fadeRect(.6, '#101428');
    const torch = t > tTorch;
    const mx = 960;
    const grab = seg(t, tGrab, tGrab + .5), tug = Math.sin(seg(t, tGrab + .5, tGrab + 1.6) * Math.PI * 4) * 20 * (t > tGrab + .5 && t < tGrab + 1.6 ? 1 : 0);
    w += shadow(mx, GY + 4, 110) + MAX(t, { x: mx, y: GY, s: 1, yaw: 0, face: E(t, [[t0, 'fear'], [tTorch, 'think'], [tGrab, 'surprise'], [tGrab + .5, 'anger']]), look: K(t, [[tTorch, [0, 0]], [tTorch + 1, [-.8, 0]], [tTorch + 2, [.8, 0]], [tGrab, [-.6, .4]]]),
      arms: { R: torch ? { a: [150, 10] } : { a: [12, -4] }, L: t > tGrab ? { to: [-90 + tug * .5, -380] } : { a: [-12, 4] } },
      holdR: torch ? `<path d="M0 0 L0 -110" stroke="#8a5a34" stroke-width="12" stroke-linecap="round"/>` + flame(0, -110, .35, t) : '',
      holdL: t > tGrab ? `<path d="M-30 0 Q-40 50 0 56 Q40 50 30 0 Q14 -14 0 -10 Q-14 -14 -30 0 Z" fill="#b8773f" ${ink(4)}/>` : '' });
    // thief's arm from the darkness
    if (t > tGrab - .3) { const ax = lerp(400, 790 + tug * .5, eout(grab)); w += `<path d="M300 560 L${f(ax)} 620" ${ink(LINE * 1.2)}/><circle cx="${f(ax)}" cy="620" r="18" fill="${INK}"/>`; }
    // darkness with a light hole around the torch
    const rLight = torch ? 380 + Math.sin(t * 9) * 12 : 0;
    const id = uid('dk');
    let dark = `<defs><mask id="${id}"><rect x="-200" y="-200" width="2320" height="1480" fill="white"/>${torch ? `<circle cx="${mx + 150}" cy="260" r="${f(rLight)}" fill="black"/>` : ''}</mask></defs><rect x="-200" y="-200" width="2320" height="1480" fill="#05060c" mask="url(#${id})"/>`;
    if (torch) dark += `<circle cx="${mx + 150}" cy="260" r="${f(rLight)}" fill="#ffb060" opacity=".14"/>`;
    // eyes in the dark
    const eyes = [[300, 500, 0], [1550, 420, 1.3], [1700, 700, 2.1], [200, 300, .6]];
    for (const [x, y, ph] of eyes) { const bl = blinkK(t, ph * 3); if (t > t0 + ph * .5) dark += `<ellipse cx="${x}" cy="${y}" rx="12" ry="${f(14 * (1 - bl))}" fill="#fff"/><ellipse cx="${x + 40}" cy="${y}" rx="12" ry="${f(14 * (1 - bl))}" fill="#fff"/>`; }
    if (!torch) { const bl = blinkK(t, 4); dark += `<ellipse cx="${mx - 38}" cy="${GY - 712}" rx="10" ry="${f(13 * (1 - bl))}" fill="#fff"/><ellipse cx="${mx + 38}" cy="${GY - 712}" rx="10" ry="${f(13 * (1 - bl))}" fill="#fff"/>`; }
    w += dark;
    let out = cam(w, 960, 540, 1);
    out += factCard('No street lights', 960, 110, t, lf(S, 3, .2), { size: 58, col: '#3a3a5a', fill: '#fff' });
    out += sfxWord('HEY!!', 700, 420, t, tGrab + .4, 1, { size: 90 });
    return out;
  },
  doctor(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[4] - .2, GY = 1000;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#e9dcc0"/>` + rect(-200, 820, 2320, 600, '#c9b48a');
    w += rect(200, 300, 360, 300, '#a0714a') + Array.from({ length: 5 }, (_, i) => `<path d="M${250 + i * 60} 340 l0 70" stroke="${PAL.blade}" stroke-width="8"/><path d="M${250 + i * 60} 340 l0 70" fill="none" ${ink(2)}/>`).join('') + amphora(300, 590, .5) + amphora(440, 590, .45, '#7f9a4a');
    const bandage = seg(t, lf(S, 4, .5), lf(S, 4, .7));
    w += shadow(900, GY + 4, 90) + npc('oldman', { x: 900, y: GY, s: .9, t, yaw: 40, face: E(t, [[t0, 'think'], [lf(S, 4, .45), 'neutral'], [lf(S, 4, .8), 'sad']]), arms: { R: { to: [200, -440] }, L: t > lf(S, 4, .82) ? { a: [-120, -60] } : { a: [-12, 4] } }, holdR: bandage > 0 ? `<rect x="-6" y="-30" width="40" height="18" fill="#fff" ${ink(3)}/>` : `<path d="M0 0 L0 -40 L6 -60" fill="none" stroke="${PAL.blade}" stroke-width="6"/>` });
    // Max shows a tiny cut on his hand
    w += shadow(1300, GY + 4, 100) + MAX(t, { x: 1300, y: GY, s: 1, yaw: -30, face: E(t, [[t0, 'sad'], [lf(S, 4, .4), 'fear'], [lf(S, 4, .85), 'fear']]), arms: { L: { to: [-200, -460] } }, holdL: bandage > 0 ? `<rect x="-24" y="-12" width="${f(48 * bandage)}" height="24" fill="#fff" ${ink(3)}/>` : `<path d="M-14 -8 L10 6" stroke="#c8302a" stroke-width="5"/>`, sweat: 1 });
    let out = cam(w, 1050, 560, 1.05);
    out += factCard('Doctors: yes.  Antibiotics: NO.', 960, 110, t, lf(S, 4, .3), { size: 56 });
    out += factCard('even a small cut could be serious', 1100, 990, t, lf(S, 4, .65), { size: 48, col: '#ffe0b0' });
    return out;
  },
  cues(S) {
    const L = S.L.map(l => l[0]);
    return [[0, 'sting', .5], [L[1] - .2, 'fire', .8], [L[1] + .4, 'water', .4], [L[2], 'creak', .7], [lf(S, 2, .45) + .3, 'crash', 1], [L[3], 'wind', .4], [lf(S, 3, .38), 'whoosh', .4], [lf(S, 3, .72), 'shout', .5], [L[4], 'pop', .3]];
  },
};

// ---------------------------------------------------------------- CHOICE
SC.choice = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    return shots(t, [
      [0, () => this.salve(t, S)],
      [lf(S, 0, .38), () => this.yum(t, S)],
      [lf(S, 0, .7), () => this.fan(t, S)],
      [L[1] - .2, () => this.glow(t, S)],
      [L[2] - .2, () => this.sand(t, S)],
      [L[3] - .2, () => this.split(t, S)],
      [L[5] - .2, () => this.flip(t, S)],
    ]) + (t < .4 ? fadeRect(1 - t / .4, '#000') : '');
  },
  salve(t, S) {
    const GY = 1000;
    let w = romeStreet(t, { px: 1200 });
    const wave = Math.sin(t * 8) * 20;
    w += shadow(760, GY + 4, 100) + MAX(t, { x: 760, y: GY, s: 1, yaw: 40, face: EMO.joy, arms: { R: { a: [150 + wave, 10] } } });
    w += shadow(1300, GY + 4, 90) + npc('merchant', { x: 1300, y: GY, s: .95, t, yaw: -40, face: EMO.smile, arms: { L: { a: [-150 - wave, -10] } } });
    w += g(T(760, 200, pop(t, .6)), `<path d="M-150 -60 Q0 -80 150 -60 Q170 0 150 50 L60 60 L20 120 L10 60 Q-150 60 -150 50 Q-170 0 -150 -60 Z" fill="#fff" ${ink(5)}/>` + text('SALVE!', 0, 0, { size: 70 }));
    return cam(w, 1000, 560, 1.05) + factCard('a few words of Latin', 1400, 980, t, 1.4, { size: 52 });
  },
  yum(t, S) {
    const t0 = lf(S, 0, .38);
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#c96a5a"/>` + rect(-200, 800, 2320, 600, '#efe9dc', 6);
    w += MAX(t, { x: 960, y: 1300, s: 1.15, ground: false, yaw: 0, face: E(t, [[t0, 'smile'], [t0 + 1.2, 'joy']]), arms: { L: { to: [-100, -360] }, R: { a: [140, -30] } }, hands: { R: 'thumb' }, holdL: `<path d="M-60 -10 Q-60 40 0 44 Q60 40 60 -10 Z" fill="#8a5a34" ${ink(4)}/>` });
    w += g(T(500, 760, 1.2), amphora(0, 0, 1, '#b8773f')) + text('GARUM', 500, 840, { size: 50, fill: '#fff6dc', stroke: '#3a1f1a', sw: 8 });
    return cam(w, 960, 540, 1) + factCard('...the best garum in town', 1400, 160, t, t0 + .5, { size: 52 });
  },
  fan(t, S) {
    const t0 = lf(S, 0, .7);
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#d9c9a8"/>` + crowdRows(-100, 2020, 260, 5, 150, .95, t, 1300, 1);
    w += MAX(t, { x: 960, y: 1450, s: 1.05, ground: false, yaw: 0, face: E(t, [[t0, 'joy'], [t0 + 1.5, 'yell']]), arms: { L: { a: [-150 + Math.sin(t * 9) * 15, -10] }, R: { a: [150 - Math.sin(t * 9) * 15, 10] } }, frontExtra: `<path d="M-60 -600 Q0 -560 60 -600 L56 -570 Q0 -536 -56 -570 Z M30 -580 L50 -470 L80 -480 L56 -580 Z" fill="#5f8a4a" ${ink(4)}/>` });
    return cam(w, 960, 540, 1) + factCard('and a favourite team: GREENS!', 960, 120, t, t0 + .3, { size: 56, col: '#d6ecc0' });
  },
  glow(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[1] - .2;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#2e2840"/>` + rect(-200, 820, 2320, 600, '#231e33');
    w += rect(1180, 180, 420, 300, '#1d2440', 6) + `<circle cx="1480" cy="260" r="40" fill="#f4efd8" ${ink(4)}/>` + lineP([[1390, 180], [1390, 480]], 8, '#5a4a6a') + lineP([[1180, 330], [1600, 330]], 8, '#5a4a6a');
    w += rect(380, 700, 640, 120, '#5a3a24') + rect(380, 610, 120, 210, '#5a3a24');
    const up = eback(seg(t, lf(S, 1, .6), lf(S, 1, .9)));
    w += g(T(lerp(560, 640, up), lerp(600, 460, up), .95, lerp(-80, 0, up)), headSVG({ face: E(t, [[t0, EMO.sleepy], [lf(S, 1, .45), 'neutral'], [lf(S, 1, .65), 'surprise']]), look: [.8, .3], blink: 0 }));
    w += `<path d="M600 700 Q800 590 1010 650 L1020 720 L600 720 Z" fill="#4a5a80" ${ink(5)}/>`;
    // glowing bag
    const gl = .6 + .4 * Math.sin(t * 5);
    w += flatGlow(1200, 880, 200, '#ffd66b', gl) + `<path d="M1140 900 Q1120 820 1170 800 Q1200 790 1230 800 Q1280 820 1260 900 Z" fill="#b8773f" ${ink(5)}/><path d="M1170 800 Q1200 770 1230 800" fill="none" ${ink(4)}/>`;
    for (let i = 0; i < 5; i++) { const a = t * 2 + i * 1.3; w += sparkle(1200 + Math.cos(a) * 120, 820 + Math.sin(a) * 60, .35, a * 50); }
    return cam(w, 960, 540, 1.05);
  },
  sand(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[2] - .2;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#1d1830"/>`;
    w += g(T(960, 520, 3.2), hourglassSVG(.3 + (t - t0) * .08, 1, t));
    w += g(T(380, 900, 1.3), headSVG({ face: E(t, [[t0, 'surprise'], [t0 + 1.5, 'fear']]), look: [.8, -.6], headYaw: 30 }));
    return cam(w, 960, 540, K(t, [[t0, 1], [L[3], 1.12]], eio)) + factCard('The sand is moving again...', 1300, 960, t, t0 + .8, { size: 52, col: '#3a3050', fill: '#fff' });
  },
  split(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[3] - .2, tR = L[4] - .2, GY = 1000;
    // left: stay -> legion
    const lw = 960, inL = eout(seg(t, t0, t0 + .6)), inR = eout(seg(t, tR, tR + .6));
    let left = `<rect x="-200" y="-200" width="1160" height="1480" fill="#f6d9a8"/>` + rect(-200, 820, 1160, 600, '#d9c18f');
    const wc = walkCycle((t - t0) * 6.5);
    left += `<circle cx="160" cy="200" r="60" fill="#ffe2a0" ${ink(4)}/>`;
    for (let i = 0; i < 3; i++) left += shadow(200 + i * 260, 1004, 70) + npc('soldier', { x: 200 + i * 260, y: 1000 + walkCycle((t - t0) * 6.5 + i).bob * .6, s: .6, yaw: 90, t, legs: walkCycle((t - t0) * 6.5 + i).legs, arms: walkCycle((t - t0) * 6.5 + i).arms, face: EMO.neutral, phase: i });
    left += shadow(480, 1004, 80) + MAX(t, { x: 480, y: 1000 + wc.bob * .75, s: .75, yaw: 90, helmet: true, armor: true, legs: wc.legs, arms: wc.arms, lean: wc.lean, face: E(t, [[t0, 'smile'], [lf(S, 3, .7), { ...EMO.sad, m: { ...EMO.sad.m, wob: .5 } }]]), sweat: seg(t, lf(S, 3, .6), lf(S, 3, .8)), idle: 0 });
    left += factCard('STAY: join the legion', 480, 110, t, t0 + .3, { size: 52 }) + factCard('25 years of marching!', 480, 220, t, lf(S, 3, .65), { size: 46, col: '#ffe0b0' });
    // right: go home -> modern comforts
    let right = modernCity(960, 2120, 820);
    right += g(T(1250, 300, 1), `<path d="M0 0 L60 0 L60 40" fill="none" ${ink(8)}/><ellipse cx="60" cy="60" rx="50" ry="22" fill="#c9cdd2" ${ink(5)}/>` + Array.from({ length: 6 }, (_, i) => { const k = ((t * 2) + i / 6) % 1; return `<path d="M${30 + i * 12} ${80 + k * 120} l0 24" stroke="#7fb7dd" stroke-width="6" stroke-linecap="round" opacity="${f(1 - k)}"/>`; }).join('') + steam(60, 120, t, 3, .8));
    right += g(T(1780, 380, 1), `<rect x="-50" y="-60" width="100" height="120" rx="30" fill="#fff" ${ink(5)}/><circle cx="0" cy="0" r="18" fill="#cfd3d8" ${ink(4)}/><path d="M50 -10 L50 140 L-10 140" fill="#fff" ${ink(5)}/>`);
    right += shadow(1450, 1004, 90) + MAX(t, { x: 1450, y: 1000, s: .8, yaw: -20, face: E(t, [[tR, 'joy'], [tR + 1.5, { ...EMO.joy, e: { open: 1, happy: 1 } }]]), arms: { R: { to: [60, -660] } }, holdR: g('rotate(-20)', `<path d="M0 0 L-60 -140 L60 -140 Z" fill="#f3c25a" ${ink(5)}/><path d="M-60 -140 L60 -140" stroke="#c8822a" stroke-width="14"/><circle cx="-12" cy="-90" r="12" fill="#c8302a" ${ink(3)}/><circle cx="14" cy="-110" r="10" fill="#c8302a" ${ink(3)}/>`) });
    right += factCard('GO HOME:', 1440, 110, t, tR + .2, { size: 52 }) + factCard('hot showers · toilet paper · PIZZA', 1440, 220, t, lf(S, 4, .3), { size: 42, col: '#e8f4ff' });
    let out = g(`translate(${f(-lw * (1 - inL))} 0)`, `<clipPath id="lc"><rect x="-200" y="-200" width="1160" height="1480"/></clipPath><g clip-path="url(#lc)">${left}</g>`);
    out += `<rect x="960" y="-200" width="1160" height="1480" fill="#1d1830"/>`;
    if (inR > 0) out += g(`translate(${f(lw * (1 - inR))} 0)`, `<clipPath id="rc"><rect x="960" y="-200" width="1160" height="1480"/></clipPath><g clip-path="url(#rc)">${right}</g>`);
    out += `<path d="M960 -10 L960 1090" ${ink(10)}/>` + (t < tR ? text('?', 1440, 540, { size: 300, fill: '#fff', op: .8 }) : '');
    return out;
  },
  flip(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[5] - .2, D = S.dur, tF = lf(S, 5, .6);
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#2e2840"/>` + rect(-200, 820, 2320, 600, '#231e33');
    const antic = Math.sin(seg(t, tF - .5, tF) * Math.PI) * (t < tF ? 1 : 0), fl = eback(seg(t, tF, tF + .7));
    const hx = 0, hy = -470 - antic * 30 - Math.sin(seg(t, tF, tF + .5) * Math.PI) * 70, ang = fl * 180;
    const hand = s2 => [hx + Math.cos(rad(ang)) * 56 * s2, hy + Math.sin(rad(ang)) * 56 * s2];
    const portal = eout(seg(t, tF + .5, tF + 1.2));
    if (portal > 0) w += portalSVG(960, 520, 640 * portal, t, portal);
    w += shadow(960, 1004, 110) + MAX(t, { x: 960, y: 1000, s: 1, yaw: 0, face: E(t, [[t0, 'think'], [t0 + .6, 'smug'], [tF + .3, 'grin']]), arms: { L: { to: hand(-1), fore: .55, upper: .95 }, R: { to: hand(1), fore: .55, upper: .95 } }, frontExtra: g(`translate(${hx} ${f(hy)}) rotate(${f(ang)})`, hourglassSVG(.3, .9, t)), wave: 1 + portal * 2, wind: [-portal * 60, -portal * 30] });
    let out = cam(w, 960, 520, K(t, [[t0, 1.3], [tF, 1.1], [D, 1.0]], eio));
    out += fadeRect(seg(t, D - .5, D), '#fffaf0');
    return out;
  },
  cues(S) {
    const L = S.L.map(l => l[0]), tF = lf(S, 5, .6);
    return [[0, 'city', .4], [.6, 'pop', .4], [lf(S, 0, .38), 'pop', .2], [lf(S, 0, .7), 'crowd', .6], [L[1] - .2, 'shimmer', .5], [L[2], 'swell', .5], [L[3], 'march', .5], [L[4], 'pop', .4], [tF, 'whoosh', .5], [tF + .5, 'portal', .9], [S.dur - .5, 'boom', .6]];
  },
};

// ---------------------------------------------------------------- OUTRO
SC.outro = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur, GY = 1000;
    let w = `<clipPath id="ol"><rect x="-200" y="-200" width="1160" height="1480"/></clipPath><g clip-path="url(#ol)">${romeStreet(t, { px: 600 })}</g>` + `<clipPath id="or"><rect x="960" y="-200" width="1160" height="1480"/></clipPath><g clip-path="url(#or)">${modernCity(960, 2120, 840)}</g>` + `<path d="M960 -10 L960 1090" ${ink(10)}/>`;
    w += text('ROME?', 480, 120, { size: 90, fill: '#a8322d', sw: 10, stroke: '#fff' }) + text('HOME?', 1440, 120, { size: 90, fill: '#3f6f8f', sw: 10, stroke: '#fff' });
    const shrug = Math.sin(seg(t, .4, 1.6) * Math.PI);
    const tSub = L[1] + .3, tClick = L[1] + 2.0;
    w += shadow(960, GY + 4, 110) + MAX(t, { x: 960, y: GY, s: 1, yaw: 0, face: E(t, [[0, 'think'], [1.4, 'smile'], [tClick, 'joy'], [D - 1.6, 'smug']]), arms: t < 2 ? { L: { a: [-90 - shrug * 30, -60 * shrug] }, R: { a: [90 + shrug * 30, 60 * shrug] } } : t < L[1] ? { R: { a: [100, -10] } } : undefined, hands: { R: t > 2 && t < L[1] ? 'point' : 'fist' }, headY: -shrug * 10 });
    let out = w;
    // comment card
    if (t > 2 && t < L[1] + .2) { const k = pop(t, 2); out += g(T(1480, 640, k), `<rect x="-300" y="-110" width="600" height="220" rx="26" fill="#fff" ${ink(6)}/>` + circ(-220, -30, 42, '#e9e1cf', 4) + `<rect x="-150" y="-60" width="${f(360 * clamp((t - 2.3) * 1.2))}" height="20" rx="10" fill="#cfc6b4"/><rect x="-150" y="-14" width="${f(280 * clamp((t - 2.8) * 1.2))}" height="20" rx="10" fill="#cfc6b4"/>` + text('comments ↓', 0, 70, { size: 46, fill: '#6b5a40' })); }
    // subscribe button + cursor click
    if (t > tSub) {
      const k = pop(t, tSub), done = t > tClick, press = 1 - Math.sin(seg(t, tClick - .05, tClick + .2) * Math.PI) * .08;
      out += g(T(1460, 760, k * press), `<rect x="-250" y="-66" width="500" height="132" rx="66" fill="${done ? '#9b9b9b' : '#d62e2e'}" ${ink(6)}/>` + text(done ? 'SUBSCRIBED ✓' : 'SUBSCRIBE', 0, 4, { size: 64, fill: '#fff', font: 'Patrick Hand' }));
      const ck = eio(seg(t, tSub + .5, tClick));
      out += g(T(lerp(1800, 1500, ck), lerp(1000, 790, ck), 1, -20), `<path d="M0 0 L0 70 L18 54 L32 84 L44 78 L30 50 L54 50 Z" fill="#fff" ${ink(5)}/>`);
      if (done) for (let i = 0; i < 8; i++) { const a = i * 45, kk = eout(seg(t, tClick, tClick + .5)); out += `<path d="M${f(1460 + Math.cos(rad(a)) * 280 * (1 + kk * .2))} ${f(760 + Math.sin(rad(a)) * 130 * (1 + kk * .5))} l${f(Math.cos(rad(a)) * 30)} ${f(Math.sin(rad(a)) * 30)}" ${ink(6)} opacity="${f(1 - seg(t, tClick + .3, tClick + .7))}"/>`; }
    }
    // the hourglass glints in Max's hand at the very end
    if (t > D - 2.2) out += g(T(1130, 640, .6 * pop(t, D - 2.2)), hourglassSVG(.5, .8, t)) + sparkle(1150, 560, .8 * Math.sin(seg(t, D - 1.6, D - 1) * Math.PI), t * 90);
    if (t < .5) out += fadeRect(1 - t / .5, '#fffaf0');
    if (t > D - .7) out += fadeRect(seg(t, D - .7, D), '#000');
    return out;
  },
  cues(S) { const L = S.L.map(l => l[0]); return [[0, 'magic', .4], [2, 'pop', .4], [2.3, 'type', .4], [L[1] + .3, 'pop', .4], [L[1] + 2.0, 'click', .7], [L[1] + 2.05, 'sparkle', .5], [S.dur - 1.6, 'glint', .6]]; },
};

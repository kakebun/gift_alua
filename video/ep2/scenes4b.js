// Scenes 8-10: baths, colosseum, circus
const seatedY = (benchTop, s) => benchTop + (345 - 6) * s;
const SEAT = { L: [84, -84], R: [80, -80] };
function pool(x, y, w, h, t, col = '#7fc0d8') {
  let s = rect(x, y, w, h, col, 6);
  for (let i = 0; i < 5; i++) { const yy = y + 20 + i * (h - 30) / 5, ph = t * 2 + i; s += `<path d="M${x + 30} ${f(yy)} ${Array.from({ length: Math.floor((w - 60) / 60) }, (_, k) => `q15 ${f(-6 * Math.sin(ph + k))} 30 0 t30 0`).join(' ')}" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/>`; }
  return s;
}
const bathWall = (col = '#e9d6b0') => `<rect x="-200" y="-200" width="2320" height="1480" fill="${col}"/>` + column(140, 60, 820, 70) + column(1780, 60, 820, 70) + `<path d="M140 60 Q960 -120 1780 60" fill="none" ${ink(8)}/>`;
function bathHouse(x, y, s) {
  let b = rect(-600, -360, 1200, 360, '#efe6d2');
  b += `<path d="M-300 -360 Q0 -620 300 -360 Z" fill="#d8c9a8" ${ink(6)}/><path d="M-560 -360 Q-440 -470 -320 -360 Z M320 -360 Q440 -470 560 -360 Z" fill="#d8c9a8" ${ink(5)}/>`;
  for (let i = 0; i < 7; i++) b += column(-520 + i * 173, -340, 0, 50);
  b += rect(-620, -10, 1240, 20, '#efe6d2') + text('THERMAE', 0, -300, { size: 60, fill: '#6b5a40' });
  return g(T(x, y, s), b);
}

// ---------------------------------------------------------------- BATHS
SC.baths = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    return shots(t, [
      [0, () => this.dusty(t, S)],
      [L[1] - .2, () => this.outside(t, S)],
      [L[2] - .2, () => this.rooms(t, S)],
      [L[3] - .2, () => this.strigil(t, S)],
      [L[4] - .2, () => this.social(t, S)],
      [L[5] - .2, () => this.door(t, S)],
      [L[6] - .2, () => this.latrine(t, S)],
      [L[8] - .2, () => this.leave(t, S)],
    ]) + (t < .4 ? fadeRect(1 - t / .4, '#000') : '') + (t > D - .4 ? fadeRect(seg(t, D - .4, D), '#000') : '');
  },
  dusty(t, S) {
    const GY = 1000, tS = 2.2;
    let w = romeStreet(t, { px: 2800 });
    const antic = eio(seg(t, tS - .7, tS)), sneeze = eback(seg(t, tS, tS + .25)) * (1 - seg(t, tS + .6, tS + 1.2));
    w += shadow(960, GY + 4, 110) + MAX(t, { x: 960, y: GY, s: 1, yaw: 0, tilt: -antic * 12 * (1 - sneeze) + sneeze * 14, lean: -antic * 6 + sneeze * 10, face: t < tS ? mix(EMO.neutral, EMO.surprise, antic) : (t < tS + .6 ? { ...EMO.yell, e: { open: 0, happy: 0 } } : EMO.sad), squash: 1 - sneeze * .05 });
    // dust spots on Max + dust cloud on sneeze
    for (let i = 0; i < 9; i++) w += `<circle cx="${f(900 + rnd(i) * 120)}" cy="${f(400 + rnd(i + 4) * 500)}" r="${f(6 + rnd(i + 2) * 8)}" fill="#a08a6a" opacity=".7"/>`;
    const dk = seg(t, tS, tS + 1.4);
    if (dk > 0 && dk < 1) for (let i = 0; i < 8; i++) w += circ(960 + Math.cos(i * .8) * dk * 300, 300 + Math.sin(i * 1.7) * dk * 120 - dk * 60, 30 + dk * 50, '#cdb894', 4).replace('<circle', `<circle opacity="${f(1 - dk)}"`);
    let out = cam(w, 960, 540, 1);
    out += sfxWord('AAA-CHOO!', 1300, 300, t, tS, 1.2, { size: 100 });
    out += factCard('Time for the baths!', 960, 980, t, S.L[0][0] + 2.6, { size: 60, col: '#ffe9a8' });
    return out;
  },
  outside(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[1] - .2, GY = 1000;
    let w = sky('#b4dbef', true, t) + bathHouse(960, 860, 1.05) + cobble(860);
    const ppl = [['oldman', -100, 70, .55, 1], ['lady', -500, 70, .55, 2], ['worker', -900, 70, .55, 3], ['boy', -1300, 80, .5, 4], ['merchant', 2200, -70, .55, 5]];
    for (const [k, x0, v, s, i] of ppl) { const r = walker(k, x0, v, t - t0, 960, s, i); if (r.x > -200 && r.x < 2150) w += r.svg; }
    const r = walker('woman', -1700, 75, t - t0, 960, .55, 6); w += r.svg;
    const mx = -250 + (t - t0) * 120, wc = walkCycle(walkPh(mx, -250, .6), 1);
    w += shadow(mx, 1000, 60) + MAX(t, { x: mx, y: 1000 + wc.bob * .6, s: .6, yaw: 90, legs: wc.legs, arms: wc.arms, lean: wc.lean, idle: 0, face: EMO.joy });
    let out = cam(w, 960, 520, 1);
    out += factCard('Entry: cheap — sometimes FREE', 960, 110, t, lf(S, 1, .25), { size: 58 });
    out += factCard('everyone goes!', 1500, 980, t, lf(S, 1, .7), { size: 52, rot: -3, col: '#ffe9a8' });
    return out;
  },
  rooms(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[2] - .2, tB = lf(S, 2, .34), tC = lf(S, 2, .7);
    const room = (name, col, inner) => bathWall(col) + inner + text(name, 960, 120, { size: 70, fill: '#5d4a3a' });
    return shots(t, [
      [t0, () => { // tepidarium: warm & relaxing
        let w = room('TEPIDARIUM (warm)', '#ead9b5', pool(360, 760, 1200, 260, t, '#8cc8dc'));
        w += MAX(t, { x: 960, y: 1180, s: .9, ground: false, yaw: 0, face: E(t, [[t0, 'smile'], [t0 + 1, { ...EMO.smile, e: { open: 0, happy: 0 } }]]), arms: { L: { a: [-60, -30] }, R: { a: [60, 30] } }, tilt: Math.sin(t) * 3 });
        w += pool(360, 870, 1200, 150, t, '#8cc8dc').replace(/fill="#8cc8dc"/, 'fill="#8cc8dc" fill-opacity=".85"');
        return cam(w, 960, 560, 1);
      }],
      [tB, () => { // caldarium: hot, hypocaust under the floor
        let w = room('CALDARIUM (hot!)', '#f0c9a0', '');
        w += rect(300, 640, 1320, 160, '#8cc8dc') + steam(960, 620, t, 8, 1.4);
        w += MAX(t, { x: 960, y: 1080, s: .8, ground: false, yaw: 0, face: E(t, [[tB, 'surprise'], [tB + .6, 'sad']]), sweat: 1.5, arms: { L: { a: [-40, -20] }, R: { a: [40, 20] } } });
        w += rect(300, 720, 1320, 80, '#8cc8dc', 6);
        // cut-away floor: hypocaust pillars + fire
        w += rect(200, 800, 1520, 260, '#5a3a24', 6);
        for (let i = 0; i < 12; i++) w += rect(260 + i * 120, 820, 40, 230, '#c9875a', 4);
        w += flame(220, 1050, .55, t) + smoke(500, 1000, t, 3, .4, '#7a6a5a');
        w += factCard('HYPOCAUST: fires under the floor', 1200, 1000, t, tB + 1.2, { size: 46 });
        return cam(w, 960, 560, 1);
      }],
      [tC, () => { // frigidarium: cold plunge
        let w = room('FRIGIDARIUM (cold!)', '#cfe3ea', pool(360, 760, 1200, 260, t, '#6aa9c9'));
        const jump = seg(t, tC + .2, tC + 1.0), y = jump < 1 ? lerp(760, 1060, jump) - Math.sin(jump * Math.PI) * 180 : 1060, jx = lerp(330, 960, eio(jump));
        const inWater = jump >= 1, shiver = inWater ? Math.sin(t * 40) * 6 : 0;
        w += MAX(t, { x: jx + shiver, y, s: .7, ground: !inWater && jump === 0, yaw: 0, face: inWater ? { ...EMO.fear, m: { ...EMO.fear.m, wob: 1 } } : EMO.joy, arms: inWater ? { L: { to: [20, -470] }, R: { to: [-20, -460] } } : { L: { a: [-160, 0] }, R: { a: [160, 0] } }, legs: inWater ? undefined : { L: [-20, 40], R: [20, -40] } });
        w += pool(360, 880, 1200, 140, t, '#6aa9c9');
        const sp = seg(t, tC + 1.0, tC + 1.7);
        if (sp > 0 && sp < 1) for (let i = 0; i < 9; i++) w += circ(960 + (i - 4) * 50 * (1 + sp), 860 - Math.sin(sp * Math.PI) * (160 + (i % 3) * 60), 16, '#cfe8f3', 3);
        if (inWater) for (let i = 0; i < 5; i++) w += `<path d="M${880 + i * 40} 300 l10 -16 l10 16 l-10 16 Z" fill="#e8f6ff" ${ink(3)}/>`.replace('d="', `opacity="${f(.5 + .5 * Math.sin(t * 5 + i))}" d="`);
        let out = cam(w, 960, 540, .92);
        out += sfxWord('SPLASH!', 1300, 640, t, tC + 1.0, 1.0, { fill: '#3f6f8f' }) + sfxWord('brrrr!', 1300, 420, t, tC + 1.7, 1.6, { size: 70, fill: '#3f6f8f' });
        return out;
      }],
    ]);
  },
  strigil(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[3] - .2, tOil = lf(S, 3, .3), tScrape = lf(S, 3, .62);
    let w = bathWall('#ead9b5') + rect(-200, 820, 2320, 600, '#d9c9a8') + rect(500, 700, 900, 60, '#efe6d2');
    const oil = t > tOil && t < tScrape, scrape = t > tScrape;
    const sc = Math.sin(t * 7);
    w += MAX(t, { x: 960, y: seatedY(700, .95), s: .95, ground: false, yaw: 45, legs: SEAT, face: E(t, [[t0, 'think'], [tOil, 'smile'], [tScrape + .6, 'disgust']]),
      arms: oil ? { R: { to: [70, -470] }, L: { to: [-60, -520 + Math.sin(t * 3) * 10] } } : scrape ? { L: { a: [-60, -40] }, R: { to: [-60 + sc * 50, -470] } } : undefined,
      holdL: oil ? g(`rotate(${f(-140)})`, `<path d="M-20 -60 L20 -60 L26 10 Q0 30 -26 10 Z" fill="#7f9a4a" ${ink(4)}/><rect x="-8" y="-80" width="16" height="22" fill="#8a5a34" ${ink(3)}/>`) : '',
      holdR: scrape ? `<path d="M0 0 L0 -40 Q30 -90 70 -70" fill="none" stroke="#b58d45" stroke-width="12" stroke-linecap="round"/><path d="M0 0 L0 -40 Q30 -90 70 -70" fill="none" ${ink(3)}/>` : '' });
    if (oil) { const k = (t * 2) % 1; w += `<path d="M${f(860)} ${f(380 + k * 160)} q-8 14 0 22 q8 -8 0 -22 Z" fill="#c9b04a" ${ink(2)}/>`; for (let i = 0; i < 4; i++) w += sparkle(880 + i * 60, 500 + (i % 2) * 120, .35 * (.5 + .5 * Math.sin(t * 8 + i)), t * 50); }
    if (scrape) for (let i = 0; i < 3; i++) { const k = ((t - tScrape) * 1.2 + i / 3) % 1; w += circ(880 - k * 30, 560 + k * 300, 10, '#8a7a4a', 3); }
    let out = cam(w, 960, 520, 1.05);
    out += factCard('No soap!', 520, 130, t, t0 + .3, { size: 60 }) + factCard('olive oil', 1450, 300, t, tOil, { size: 54, col: '#e9f0c8' }) + factCard('STRIGIL (metal scraper)', 1400, 860, t, tScrape + .3, { size: 52, col: '#ffe9a8' });
    return out;
  },
  social(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[4] - .2;
    let w = bathWall('#e9d6b0') + rect(-200, 820, 2320, 600, '#d9c9a8');
    w += pool(600, 760, 720, 220, t);
    w += MAX(t, { x: 960, y: 1150, s: .7, ground: false, yaw: 0, face: EMO.joy, arms: { L: { a: [-12, 4] }, R: { a: [150 + Math.sin(t * 8) * 20, 10] } } });
    w += pool(600, 900, 720, 80, t);
    // wrestlers
    const push = Math.sin(t * 3) * 14;
    w += shadow(170, 1004, 60) + npc('worker', { x: 170 + push, y: 1000, s: .6, t, yaw: 70, lean: 20, face: EMO.anger, arms: { L: { a: [80, -10] }, R: { a: [90, -20] } } });
    w += shadow(350, 1004, 60) + npc('merchant', { x: 350 + push, y: 1000, s: .6, t, yaw: -70, lean: -20, face: EMO.yell, arms: { L: { a: [-80, 10] }, R: { a: [-90, 20] } } });
    w += factCard('exercise', 260, 360, t, lf(S, 4, .15), { size: 44 });
    // board game
    w += rect(1440, 880, 220, 30, '#a0714a') + Array.from({ length: 6 }, (_, i) => circ(1460 + i * 36, 872, 9, i % 2 ? '#fff' : INK, 2)).join('');
    w += npc('oldman', { x: 1400, y: seatedY(900, .55), s: .55, ground: false, t, yaw: 70, legs: SEAT, face: EMO.think, arms: { R: { to: [60, -630] } }, hands: { R: 'thumb' } });
    w += npc('boy', { x: 1720, y: seatedY(900, .55), s: .55, ground: false, t, yaw: -70, legs: SEAT, face: E(t, [[t0, 'smile'], [t0 + 3, 'joy']]) });
    w += factCard('games', 1560, 600, t, lf(S, 4, .3), { size: 44 });
    // gossip + business handshake (back row)
    w += npc('woman', { x: 540, y: 750, s: .45, t, yaw: 60, face: mix(EMO.talk, EMO.smile, .5 + .5 * Math.sin(t * 9)) }) + npc('lady', { x: 640, y: 750, s: .45, t, yaw: -60, face: EMO.surprise, arms: { L: { to: [-20, -630] } } });
    w += factCard('gossip', 590, 330, t, lf(S, 4, .45), { size: 40 });
    const shake2 = Math.sin(t * 10) * 8;
    w += npc('merchant', { x: 1380, y: 750, s: .45, t, yaw: 60, face: EMO.smile, arms: { R: { to: [150, -400 + shake2] } } }) + npc('oldman', { x: 1540, y: 750, s: .45, t, yaw: -60, face: EMO.smile, arms: { L: { to: [-150, -400 + shake2] } } });
    w += factCard('business', 1460, 330, t, lf(S, 4, .6), { size: 40 });
    return cam(w, 960, 560, 1);
  },
  door(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[5] - .2;
    let w = bathWall('#d9c4a0') + rect(-200, 820, 2320, 600, '#c9b48a');
    w += rect(760, 300, 400, 520, '#5a3a24') + rect(720, 270, 480, 40, '#8a5f3e') + text('LATRINA', 960, 245, { size: 70, fill: '#5d4a3a' });
    w += shadow(1400, 1004, 90) + MAX(t, { x: 1400, y: 1000, s: .9, yaw: -40, face: E(t, [[t0, 'curious'], [t0 + .7, 'fear']]), look: [-.8, -.2], sweat: 1 });
    const z = K(t, [[t0, 1.0], [L[6] - .2, 1.35]], eio);
    return cam(w, K(t, [[t0, 1100], [L[6] - .2, 1050]]), 560, z) + sfxWord('gulp.', 1500, 380, t, t0 + 1.0, 1.2, { size: 60, fill: PAL.ink, rot: 0 });
  },
  latrine(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[6] - .2, tSp = L[7] - .2;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#d9c4a0"/>` + rect(-200, 880, 2320, 600, '#bba57e');
    // long marble bench with holes
    w += rect(100, 690, 1720, 200, '#efe6d2', 6);
    for (let i = 0; i < 7; i++) w += `<path d="M${f(200 + i * 240)} 690 q40 30 80 0" fill="#3a2a1e" ${ink(4)}/>`;
    w += rect(100, 820, 1720, 30, '#7fb7dd', 4); // water channel
    const sitters = [['oldman', 220], ['merchant', 440], ['worker', 660], ['boy', 880], ['woman', 1100]];
    sitters.forEach(([k, x], i) => {
      const talk = .5 + .5 * Math.sin(t * 7 + i * 2);
      w += npc(k, { x, y: seatedY(690, .62), s: .62, ground: false, t, yaw: i % 2 ? -55 : 55, legs: SEAT, face: i === 2 && t > tSp ? EMO.smile : mix(EMO.talk, EMO.smile, talk), arms: k === 'worker' && t > tSp ? { R: { a: [lerp(20, 80, eout(seg(t, tSp, tSp + .5))), -20] } } : undefined, holdR: k === 'worker' && t > tSp ? sponge(t) : '', phase: i });
    });
    // Max standing in front, horrified
    const back = seg(t, tSp + 2.5, tSp + 4);
    w += shadow(1560, 1064, 100) + MAX(t, { x: 1560 + back * 160, y: 1060, s: 1, yaw: t > tSp ? -30 : 180 - 180 * eout(seg(t, t0 + 1.2, t0 + 1.8)), face: E(t, [[t0, 'surprise'], [t0 + 1.8, 'fear'], [tSp + .6, 'disgust'], [tSp + 2.6, 'fear']]), look: t > tSp ? [-.7, -.2] : [0, -.3], arms: t > tSp + 1 ? { L: { a: [-12, 4] }, R: { to: [40, -470] } } : undefined, sweat: t > tSp ? 1.5 : 0 });
    let out = cam(w, 960, 560, 1);
    out += factCard('No walls. No doors.', 960, 120, t, lf(S, 6, .45), { size: 58 });
    out += factCard('TERSORIUM: sponge on a stick', 960, 230, t, tSp + .8, { size: 52, col: '#ffe9a8' }) + factCard('(shared?!)', 1500, 360, t, lf(S, 7, .75), { size: 50, rot: 4 });
    return out;
  },
  leave(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[8] - .2, D = S.dur;
    let w = bathWall('#d9c4a0') + rect(-200, 820, 2320, 600, '#c9b48a');
    const mx = K(t, [[t0 + .5, 960], [D, 1700]], k => k);
    const wc = walkCycle(walkPh(mx, 960, .9) , .5);
    w += shadow(mx, 1004, 100) + MAX(t, { x: mx, y: 1000 + wc.bob * .5, s: .9, yaw: K(t, [[t0, 0], [t0 + .5, 60]]), legs: { L: [8 + wc.legs.L[0] * .4, -10], R: [-8 + wc.legs.R[0] * .4, 10] }, face: E(t, [[t0, 'think'], [t0 + .6, { ...EMO.smile, m: { ...EMO.smile.m, wob: .6 } }]]), arms: { L: { to: [-30, -380] }, R: { to: [30, -380] } }, sweat: 1 });
    return cam(w, 1100, 560, 1.05) + factCard('...maybe later.', 600, 200, t, t0 + .6, { size: 64 });
  },
  cues(S) {
    const L = S.L.map(l => l[0]);
    return [[0, 'city', .4], [1.5, 'inhale', .5], [2.2, 'sneeze', .7], [L[1], 'murmur', .4], [lf(S, 1, .25), 'pop', .3], [L[2], 'water', .5], [lf(S, 2, .34), 'sizzle', .4], [lf(S, 2, .7) + 1.0, 'splash', .8], [lf(S, 2, .7) + 1.7, 'shiver', .5],
      [lf(S, 3, .3), 'pour', .4], [lf(S, 3, .62), 'scrape', .5], [L[4], 'murmur', .5], [L[5], 'sting', .5], [L[6], 'murmur', .4], [L[7], 'squish', .5], [L[8], 'tiptoe', .5]];
  },
};
function sponge(t) { const d = (t * 1.5) % 1; return `<path d="M0 0 L0 -150" stroke="#8a5a34" stroke-width="8"/><ellipse cx="0" cy="-170" rx="34" ry="26" fill="#d9c56a" ${ink(4)}/><circle cx="-10" cy="-174" r="4" fill="#b8a040"/><circle cx="12" cy="-164" r="5" fill="#b8a040"/><path d="M0 ${f(-140 + d * 60)} q-6 10 0 16 q6 -6 0 -16 Z" fill="#7fb7dd" opacity="${f(1 - d)}"/>`; }

// ---------------------------------------------------------------- COLOSSEUM
function colosseumFacade(x, y, s, t) {
  let c = '';
  for (let r = 0; r < 4; r++) {
    const yy = -r * 150, h = 150;
    c += rect(-700, yy - h, 1400, h, r === 3 ? '#e2d3b4' : '#e9dcc0', 5);
    if (r < 3) for (let i = 0; i < 12; i++) c += `<path d="M${-660 + i * 112} ${yy} l0 -86 q34 -44 68 0 l0 86 Z" fill="#6b5a40" ${ink(4)}/>`;
    else for (let i = 0; i < 12; i++) c += rect(-650 + i * 112, yy - 110, 40, 40, '#6b5a40', 4);
  }
  for (let i = 0; i < 10; i++) c += `<path d="M${-640 + i * 140} -600 L${-640 + i * 140} -660" ${ink(4)}/><path d="M${-640 + i * 140} -660 l30 10 l-30 10" fill="#b8473f" ${ink(2)}/>`;
  return g(T(x, y, s), c);
}
function lionHead(x, y, s) { return g(T(x, y, s), `<circle cx="0" cy="0" r="80" fill="#b8773f" ${ink(5)}/>` + Array.from({ length: 10 }, (_, i) => `<path d="M${f(Math.cos(i * .63) * 70)} ${f(Math.sin(i * .63) * 70)} L${f(Math.cos(i * .63 + .3) * 100)} ${f(Math.sin(i * .63 + .3) * 100)} L${f(Math.cos(i * .63 + .63) * 70)} ${f(Math.sin(i * .63 + .63) * 70)}" fill="#8a5a2a" ${ink(3)}/>`).join('') + `<circle cx="0" cy="6" r="56" fill="#e0b060" ${ink(4)}/><circle cx="-18" cy="-4" r="6" fill="${INK}"/><circle cx="18" cy="-4" r="6" fill="${INK}"/><path d="M-10 18 L10 18 L0 28 Z" fill="${INK}"/><path d="M-16 36 Q0 46 16 36" fill="none" ${ink(3)}/>`); }
function gladiator(o) { // murmillo (helmet + scutum + gladius) or retiarius (trident + net)
  const ret = o.kind === 'retiarius';
  const base = Object.assign({ cape: false, tunicCol: ret ? '#c9a77a' : '#b8473f', tunicLine: '#8a5a3a', helmet: !ret, hairStyle: ret ? 'short' : undefined, hairCol: '#2b2523', face: EMO.anger }, o);
  if (ret) { base.holdR = `<g transform="rotate(${o.triAng == null ? -65 : o.triAng})"><path d="M0 60 L0 -260" stroke="#8a5a34" stroke-width="8"/><path d="M-26 -230 L-26 -280 M0 -230 L0 -290 M26 -230 L26 -280 M-26 -230 L26 -230" fill="none" stroke="${PAL.blade}" stroke-width="7"/><path d="M-26 -230 L-26 -280 M0 -230 L0 -290 M26 -230 L26 -280 M-26 -230 L26 -230" fill="none" ${ink(2)}/></g>`; }
  else { base.sword = { hand: 'R', ang: o.swordAng == null ? 60 : o.swordAng }; base.holdL = `<path d="M-60 -110 L60 -110 L60 110 L-60 110 Z" fill="#a8322d" ${ink(5)}/><circle cx="0" cy="0" r="22" fill="${PAL.brooch}" ${ink(4)}/>`; }
  return hero(base);
}
SC.colosseum = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    return shots(t, [
      [0, () => this.morning(t, S)],
      [L[1] - .2, () => this.facade(t, S)],
      [L[2] - .2, () => this.seats(t, S)],
      [L[3] - .2, () => this.schedule(t, S)],
      [lf(S, 3, .78), () => this.fight(t, S)],
      [L[5] - .2, () => this.roar(t, S)],
    ]) + (t < .4 ? fadeRect(1 - t / .4, '#000') : '') + (t > D - .4 ? fadeRect(seg(t, D - .4, D), '#000') : '');
  },
  morning(t, S) {
    const GY = 1000;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#f6c58f"/>` + `<circle cx="300" cy="${f(520 - t * 20)}" r="90" fill="#ffe2a0" ${ink(4)}/>`;
    w += g('translate(0 0)', romeStreet(t, { px: 3600 + t * 160 }).replace(/<rect width="1920" height="1080" fill="#b4dbef"\/>/, ''));
    w += fadeRect(.18, '#f08a4b');
    for (const [k, x0, v, s, i] of [['merchant', -300, 150, .7, 1], ['woman', -600, 140, .7, 2], ['boy', -100, 170, .6, 3], ['oldman', -900, 130, .7, 4], ['worker', -1200, 150, .7, 5]]) { const r = walker(k, x0, v - 60, t, 1000, s, i, { face: EMO.joy }); w += r.svg; }
    const rc = runCycle(t * 9);
    w += shadow(900, GY + 34, 80) + MAX(t, { x: 900, y: GY + 30 + rc.bob * .8, s: .8, yaw: 90, legs: rc.legs, arms: rc.arms, lean: rc.lean, idle: 0, face: EMO.joy, wind: [-120, -30] });
    return cam(w, 960, 540, 1) + factCard('Games at the amphitheater!', 960, 110, t, S.L[0][0] + 2.5, { size: 60, col: '#ffe9a8' });
  },
  facade(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[1] - .2;
    let w = sky('#b4dbef', true, t) + colosseumFacade(960, 900, 1.05, t) + cobble(900);
    w += crowdRows(100, 1820, 1000, 1, 60, .55, t, 70, .8, 60);
    let out = cam(w, 960, K(t, [[t0, 600], [L[2], 540]]), K(t, [[t0, 1.2], [L[2], 1.0]], eio));
    out += factCard(`${counter(t, lf(S, 1, .2), lf(S, 1, .6), 0, 50000)} spectators`, 960, 120, t, lf(S, 1, .2), { size: 70 });
    out += factCard('Entry: FREE', 1500, 980, t, lf(S, 1, .72), { size: 60, rot: -4, col: '#ffe9a8' });
    return out;
  },
  seats(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[2] - .2;
    let w = `<rect x="-400" y="-1400" width="2800" height="3000" fill="#b4dbef"/>`;
    const tiers = [['SENATORS', 1300, '#efe9dc'], ['KNIGHTS', 1000, '#d9c9a8'], ['CITIZENS', 650, '#cdbb98'], ['THE POOR (top rows)', 250, '#bba985']];
    w += rect(-400, 1500, 2800, 300, '#e6cf9c') + text('ARENA', 960, 1600, { size: 70, fill: '#8a6a3a' });
    tiers.slice().reverse().forEach(([name, y, col], ri) => { const i = 3 - ri;
      w += poly([[-400, y + 200 - i * 0], [2400, y + 200], [2400, y + (i === 3 ? -300 : -150)], [-400, y + (i === 3 ? -300 : -150)]], col);
      if (i === 0) for (let k = 0; k < 9; k++) w += npc('oldman', { x: 100 + k * 220, y: y + 160, s: .45, t, yaw: 0, face: EMO.smug, phase: k, hairCol: ['#a9a5a0', '#2b2523', '#6b4a32'][k % 3] });
      else w += crowdRows(60, 1880, y - 40 - (i === 3 ? 150 : 0), i === 3 ? 3 : 2, 90, .7, t, i * 100, .3);
      w += factCard(name, 960, y - (i === 3 ? 320 : 170), t, lerp(t0 + .5, lf(S, 2, .75), i / 3), { size: 54 });
    });
    // Max at the very top, squinting
    w += MAX(t, { x: 1500, y: 300, s: .55, yaw: 0, face: E(t, [[t0, 'neutral'], [lf(S, 2, .7), { ...EMO.think, e: { open: .35, happy: 0 } }]]), arms: { R: { to: [70, -760] } }, look: [0, .8] });
    const cy = K(t, [[t0 + .3, 1400], [lf(S, 2, .85), 200]], eio);
    return cam(w, 960, cy, K(t, [[lf(S, 2, .8), 1.0], [L[3] - .2, 1.25]], eio));
  },
  schedule(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[3] - .2;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#f1e2b8"/>` + hatch(0, 0, 1920, 1080, 40, '#8a6a3a', .05);
    const items = [['MORNING', 'animal hunts', lf(S, 3, .02), (x, y) => lionHead(x, y, 1.1)], ['NOON', 'executions', lf(S, 3, .25), (x, y) => g(T(x, y, 1.1), `<path d="M-60 -20 Q-60 -90 0 -90 Q60 -90 60 -20 Q60 20 30 30 L30 60 L-30 60 L-30 30 Q-60 20 -60 -20 Z" fill="#f3efe6" ${ink(5)}/><circle cx="-24" cy="-30" r="16" fill="${INK}"/><circle cx="24" cy="-30" r="16" fill="${INK}"/><path d="M-6 0 L0 -12 L6 0 Z" fill="${INK}"/>`)],
      ['AFTERNOON', 'GLADIATORS!', lf(S, 3, .55), (x, y) => g(T(x, y, 1), `<path d="M-90 -90 L90 90 M90 -90 L-90 90" stroke="${PAL.blade}" stroke-width="20" stroke-linecap="round"/><path d="M-90 -90 L90 90 M90 -90 L-90 90" fill="none" ${ink(4)}/>` + g('scale(.8)', helmetSVG(0, true)))]];
    items.forEach(([when, what, tt, icon], i) => { if (t < tt) return; const x = 380 + i * 580, k = pop(t, tt, .5); w += g(T(x, 480, k), icon(0, 0)) + text(when, x, 260, { size: 64, op: fadeI(t, tt) }) + text(what, x, 720, { size: 58, fill: i === 2 ? '#a8322d' : PAL.ink, op: fadeI(t, tt + .2) }); if (i < 2) w += text('→', x + 290, 480, { size: 90, op: fadeI(t, tt + .4) }); });
    return w;
  },
  fight(t, S) {
    const L = S.L.map(l => l[0]), t0 = lf(S, 3, .78), GY = 980, tClash = L[4] + 1.0, tFall = lf(S, 4, .35), tSpare = lf(S, 4, .6);
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#d9c9a8"/>` + crowdRows(-100, 2020, 120, 4, 85, .65, t, 300, .9) + rect(-200, 520, 2320, 40, '#a0714a', 5) + rect(-200, 560, 2320, 900, '#e6cf9c');
    for (let i = 0; i < 20; i++) w += circ(rnd(i) * 1920, 620 + rnd(i + 2) * 420, 3, '#cdb380', 0);
    // circling then clash
    const ph = (t - t0) * 1.6, fallen = t > tFall;
    const ax = 760 + Math.sin(ph) * 60 * (t < tClash ? 1 : 0), bx = 1160 - Math.sin(ph) * 60 * (t < tClash ? 1 : 0);
    const clash = Math.sin(seg(t, tClash - .3, tClash + .2) * Math.PI);
    w += shadow(ax, GY + 4, 90) + gladiator({ x: ax + clash * 60, y: GY, s: .85, yaw: 60, t, kind: 'murmillo', lean: clash * 10, swordAng: lerp(60, -20, clash), arms: { R: { a: [lerp(60, 120, clash), -20] }, L: { a: [30, -40] } }, face: EMO.anger });
    const fk = eout(seg(t, tFall, tFall + .4));
    w += shadow(bx, GY + 4, 90) + gladiator({ x: bx - clash * 40, y: GY, s: .85, yaw: -60, t, kind: 'retiarius', lean: fk * 75, triAng: lerp(-65, 40, fk), legs: fallen ? { L: [lerp(-5, 60, fk), lerp(2, -30, fk)], R: [lerp(5, 40, fk), lerp(-2, -10, fk)] } : undefined, face: fallen ? EMO.fear : EMO.anger, arms: fallen && t > tSpare ? { L: { a: [-170, 0] }, R: { a: [60, -10] } } : { R: { a: [-75, -15] }, L: { a: [-30, 30] } }, hands: { L: t > tSpare ? 'point' : 'fist' } });
    // the owner worries about his investment
    w += shadow(1650, GY + 4, 80) + npc('merchant', { x: 1650, y: GY, s: .75, t, yaw: -30, face: E(t, [[t0, 'smile'], [tFall, 'fear'], [tSpare + 1.2, 'joy']]), sweat: t > tFall ? 1.5 : 0, holdL: `<path d="M-40 -10 Q-50 60 0 64 Q50 60 40 -10 Q20 -24 0 -20 Q-20 -24 -40 -10 Z" fill="#b8773f" ${ink(4)}/>` + text('$', 0, 30, { size: 40, fill: '#ffe9a8' }) });
    let out = cam(w, 960, 560, 1);
    out += sfxWord('CLANG!', 960, 380, t, tClash, .8);
    out += factCard('Not always to the death!', 960, 1000, t, lf(S, 4, .15), { size: 58 }) + factCard('Gladiators were EXPENSIVE', 1450, 260, t, tSpare, { size: 50, col: '#ffe9a8' });
    return out;
  },
  roar(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[5] - .2;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#d9c9a8"/>`;
    for (let r = 0; r < 6; r++) w += rect(-200, 160 + r * 160, 2320, 30, '#c9b48a', 4);
    w += crowdRows(-100, 2020, 220, 6, 160, 1.0, t, 500, 1);
    w += MAX(t, { x: 960, y: 1500, s: 1.05, ground: false, yaw: 0, face: E(t, [[t0, 'joy'], [t0 + 1.5, 'yell'], [t0 + 3, 'joy']]), arms: { L: { a: [-150 + Math.sin(t * 9) * 15, -10] }, R: { a: [150 - Math.sin(t * 9) * 15, 10] } }, headY: Math.sin(t * 9) * 6 });
    const [sx, sy] = shake(t, 3);
    return cam(w, 960 + sx, 540 + sy, 1) + sfxWord('ROOOAAAR!', 960, 160, t, t0 + .4, 2.6, { size: 120 }) + factCard('louder than any stadium', 1450, 980, t, lf(S, 5, .55), { size: 52 });
  },
  cues(S) {
    const L = S.L.map(l => l[0]);
    return [[0, 'murmur', .5], [.4, 'steps', .4], [lf(S, 1, .2), 'pop', .4], [lf(S, 1, .72), 'stamp', .4], [L[2], 'whoosh', .2], [lf(S, 3, .02), 'roar_lion', .5], [lf(S, 3, .25), 'pop', .4], [lf(S, 3, .55), 'fanfare_s', .7],
      [L[4] + 1.0, 'clang', .8], [lf(S, 4, .35), 'thud', .6], [L[5] - .2, 'crowd', .9]];
  },
};

// ---------------------------------------------------------------- CIRCUS MAXIMUS
const TEAMS = [['REDS', '#b8473f'], ['WHITES', '#efe9dc'], ['BLUES', '#3f6f8f'], ['GREENS', '#5f8a4a']];
SC.circus = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    return shots(t, [
      [0, () => this.overview(t, S)],
      [L[2] - .2, () => this.teams(t, S)],
      [L[3] - .2, () => this.fans(t, S)],
      [L[4] - .2, () => this.race(t, S)],
      [L[5] - .2, () => this.rich(t, S)],
    ]) + (t < .4 ? fadeRect(1 - t / .4, '#000') : '') + (t > D - .4 ? fadeRect(seg(t, D - .4, D), '#000') : '');
  },
  overview(t, S) {
    const L = S.L.map(l => l[0]);
    let w = sky('#b4dbef', false, t) + rect(-200, 600, 2320, 900, '#9bb06a');
    // stands (crowd dots)
    w += `<path d="M120 380 L1800 380 Q1960 380 1960 620 Q1960 860 1800 860 L120 860 Z" fill="#d9c9a8" ${ink(6)}/>`;
    const fill = seg(t, L[1], lf(S, 1, .8));
    for (let i = 0; i < 260; i++) { if (rnd(i + 50) > fill) continue; const a = rnd(i) * 1.0, onTop = rnd(i + 1) > .5; const x = 160 + rnd(i + 2) * 1640, y = onTop ? 395 + rnd(i + 3) * 40 : 805 + rnd(i + 3) * 40; w += `<circle cx="${f(x)}" cy="${f(y + Math.sin(t * 6 + i) * 3)}" r="7" fill="${CROWD_COLS[i % CROWD_COLS.length]}"/>`; }
    w += `<path d="M200 460 L1760 460 Q1880 460 1880 620 Q1880 780 1760 780 L200 780 Z" fill="#e6cf9c" ${ink(5)}/>`;
    w += rect(420, 600, 1080, 40, '#efe6d2', 5) + `<path d="M960 600 L944 460 L960 440 L976 460 Z" fill="#e9dcc0" ${ink(4)}/>` + circ(420, 620, 26, '#c9b48a') + circ(1500, 620, 26, '#c9b48a');
    // tiny chariots running around the track
    for (let i = 0; i < 4; i++) { const u = (t * .12 + i * .06) % 1, ang = u * Math.PI * 2; const x = 960 + Math.cos(ang) * 760, y = 620 + Math.sin(ang) * 120; w += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="18" ry="10" fill="${TEAMS[i][1]}" ${ink(3)}/>`; }
    let out = cam(w, 1000, 620, K(t, [[0, 1.0], [L[1], .9]], eio));
    out += factCard('CIRCUS MAXIMUS', 960, 120, t, lf(S, 0, .55), { size: 70, col: '#ffe9a8' });
    out += factCard(`~${counter(t, L[1] + .5, lf(S, 1, .8), 0, 150000)} people`, 960, 990, t, L[1] + .3, { size: 64 });
    return out;
  },
  teams(t, S) {
    const L = S.L.map(l => l[0]);
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#f1e2b8"/>`;
    TEAMS.forEach(([name, col], i) => {
      const tt = lf(S, 2, .25 + i * .18); if (t < tt) return;
      const x = 300 + i * 440, k = pop(t, tt, .5), wv = Math.sin(t * 4 + i) * 6;
      w += g(T(x, 560, k), `<path d="M-6 -300 L-6 300" ${ink(10)}/><path d="M0 -290 Q100 ${f(-300 + wv)} 180 -280 L180 -40 Q100 ${f(-50 + wv)} 0 -40 Z" fill="${col}" ${ink(6)}/>` + text(name, 90, 60, { size: 54 }));
    });
    return w + text('Four teams', 960, 120, { size: 80 });
  },
  fans(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[3] - .2, GY = 1000;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#d9c9a8"/>` + crowdRows(-100, 2020, 200, 3, 110, .8, t, 900, .9) + rect(-200, 560, 2320, 900, '#c9b48a');
    // bettor with coins
    w += shadow(300, GY + 4, 70) + npc('merchant', { x: 300, y: GY, s: .7, t, yaw: 30, face: EMO.grin, arms: { R: { a: [110, -20] } }, holdR: coin(0, -10, .5, 'denarius') + coin(20, -30, .5, 'denarius') });
    w += factCard('betting', 300, 380, t, lf(S, 3, .15), { size: 46 });
    // curse tablet
    w += shadow(700, GY + 4, 70) + npc('lady', { x: 700, y: GY, s: .7, t, yaw: 30, face: EMO.anger, arms: { R: { to: [140, -420] }, L: { to: [120, -470] } }, holdL: `<rect x="-40" y="-30" width="80" height="60" fill="#9aa0a7" ${ink(4)}/><path d="M-30 -10 L30 -10 M-30 10 L20 10" stroke="${INK}" stroke-width="3"/>` });
    w += factCard('curse tablets', 700, 380, t, lf(S, 3, .35), { size: 46 });
    // brawl: dust cloud with limbs
    const bk = t > lf(S, 3, .6);
    if (bk) { const r = 140 + Math.sin(t * 14) * 10; w += g(T(1180, 860, pop(t, lf(S, 3, .6))), circ(0, 0, r, '#e2d3b4', 5) + circ(-90, 30, r * .7, '#e2d3b4', 5) + circ(100, 20, r * .7, '#e2d3b4', 5) + `<path d="M-40 -60 L-120 -160 M60 -40 L160 -140 M0 80 L-40 190" ${ink(6)}/><circle cx="-120" cy="-160" r="14" fill="${INK}"/><circle cx="160" cy="-140" r="14" fill="${INK}"/>` + text('★', 40, -120, { size: 50, fill: '#e8c26a' }) + text('!@#', -20, 10, { size: 50, fill: '#a8322d' })); w += factCard('street fights!', 1180, 600, t, lf(S, 3, .62), { size: 46 }); }
    // Max: green scarf, cheering
    w += shadow(1650, GY + 4, 90) + MAX(t, { x: 1650, y: GY, s: .9, yaw: -20, face: E(t, [[t0, 'joy'], [t0 + 2, 'yell'], [t0 + 4, 'joy']]), arms: { L: { a: [-150 + Math.sin(t * 8) * 20, -10] }, R: { a: [12, -4] } }, frontExtra: `<path d="M-60 -600 Q0 -560 60 -600 L56 -570 Q0 -536 -56 -570 Z M30 -580 L50 -470 L80 -480 L56 -580 Z" fill="#5f8a4a" ${ink(4)}/>` });
    w += factCard('GO GREENS!', 1650, 300, t, t0 + 1, { size: 54, col: '#d6ecc0' });
    return cam(w, 960, 560, 1);
  },
  race(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[4] - .2, tCrash = lf(S, 4, .62);
    const V = 520, d = (t - t0) * V;
    let w = sky('#b4dbef', false, t);
    // stands parallax + spina
    let st = '';
    for (let i = -1; i < 6; i++) st += crowdRows(i * 600 - (d * .3) % 600, i * 600 + 600 - (d * .3) % 600, 300, 2, 80, .6, t, 700 + i * 13, .9, 70);
    w += rect(-200, 240, 2320, 230, '#d9c9a8', 0) + st + rect(-200, 470, 2320, 20, '#a0714a', 4);
    w += rect(-200, 490, 2320, 1000, '#e6cf9c');
    for (let i = 0; i < 30; i++) { const x = ((i * 137 - d) % 2200 + 2200) % 2200 - 140; w += `<path d="M${f(x)} ${600 + (i % 5) * 90} l40 0" stroke="#cdb380" stroke-width="5" stroke-linecap="round"/>`; }
    // the turning post (meta) passes by
    const mx = 2400 - ((t - t0) * 600) % 3200;
    w += g(T(mx, 560, 1), `<path d="M-40 0 L-20 -200 L20 -200 L40 0 Z" fill="#e9dcc0" ${ink(5)}/><path d="M-20 -200 L0 -260 L20 -200 Z" fill="#c99a3a" ${ink(4)}/>`);
    // chariots (screen-space positions with small relative motion)
    const cars = [[TEAMS[0][1], 250, 700, .55], [TEAMS[3][1], 650, 860, .62], [TEAMS[2][1], 1000, 640, .5], [TEAMS[1][1], 120, 980, .68]];
    cars.forEach(([col, x, y, s], i) => {
      const xx = x + Math.sin(t * .8 + i) * 80;
      if (i === 2 && t > tCrash) {
        const k = seg(t, tCrash, tCrash + 1.2);
        w += g(T(xx + k * 200, y + 60, s, k * 40), chariot(0, 0, 1, d, col, false, t, false));
        w += g(T(xx + 240 + k * 500, y - Math.sin(k * Math.PI) * 200, s, k * 720), g('translate(0 0)', circ(0, 0, 56, '#8a5a34', 6) + [0, 60, 120].map(a => `<path d="M${f(Math.cos(rad(a)) * 46)} ${f(Math.sin(rad(a)) * 46)} L${f(-Math.cos(rad(a)) * 46)} ${f(-Math.sin(rad(a)) * 46)}" ${ink(5)}/>`).join('')));
        if (k < 1) w += smoke(xx + 150, y + 40, t, 5, 1.1 * (1 - k * .5), '#d9c9a8');
      } else w += chariot(xx, y, s, d + i * 50, col, true, t);
    });
    let out = cam(w, 960, 560, 1);
    out += sfxWord('CRASH!', 1300, 500, t, tCrash, 1.2, { size: 120 });
    out += factCard('Sharp turns!', 1500, 130, t, lf(S, 4, .2), { size: 56 });
    return out;
  },
  rich(t, S) {
    const L = S.L.map(l => l[0]), t0 = L[5] - .2, GY = 1000;
    let w = `<rect x="-200" y="-200" width="2320" height="1480" fill="#f1e2b8"/>` + rect(-200, 820, 2320, 600, '#e6cf9c');
    // coin rain
    for (let i = 0; i < 14; i++) { const k = ((t - t0) * .8 + rnd(i)) % 1; w += coin(200 + rnd(i + 1) * 1520, -60 + k * 900, .45, 'sestertius', k * 600, Math.abs(Math.cos(t * 5 + i))); }
    w += shadow(760, GY + 4, 100) + npc('worker', { x: 760, y: GY, s: 1, t, yaw: 15, tunicCol: '#5f8a4a', face: EMO.joy, arms: { L: { a: [-150, -10] }, R: { a: [40, -40] } }, holdR: `<path d="M-80 -20 Q-100 120 0 128 Q100 120 80 -20 Q40 -50 0 -40 Q-40 -50 -80 -20 Z" fill="#b8773f" ${ink(5)}/>` + text('$$$', 0, 60, { size: 48, fill: '#ffe9a8' }) });
    w += shadow(1350, GY + 4, 90) + npc('oldman', { x: 1350, y: GY, s: .9, t, yaw: -30, face: E(t, [[t0, 'surprise'], [t0 + 1.4, 'anger']]), look: [-.8, 0] });
    let out = cam(w, 1000, 540, 1);
    out += factCard('Diocles, a superstar charioteer:', 960, 110, t, t0 + .3, { size: 52 });
    out += factCard('~35,000,000 sesterces!', 960, 210, t, t0 + 1.1, { size: 64, col: '#ffe9a8' });
    out += factCard('(a senator, jealous)', 1450, 380, t, t0 + 2, { size: 42, rot: 3 });
    return out;
  },
  cues(S) {
    const L = S.L.map(l => l[0]);
    return [[0, 'crowd', .5], [lf(S, 0, .55), 'pop', .4], [L[1] + .3, 'pop', .4], ...[0, 1, 2, 3].map(i => [lf(S, 2, .25 + i * .18), 'pop', .4]), [L[3], 'crowd', .6], [lf(S, 3, .6), 'brawl', .6],
      [L[4] - .2, 'hooves', .8], [lf(S, 4, .62), 'crash', .9], [L[5], 'coins', .7], [L[5] + 1.0, 'coins', .5]];
  },
};

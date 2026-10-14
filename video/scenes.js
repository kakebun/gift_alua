// Scenes for "POV: You're a Roman Legionary". Each scene: draw(t, S) and cues(S).
// S = {dur, L:[[start,end],...]} with times local to the scene.

const cam = (inner, cx, cy, z, sx = 0, sy = 0) => g(`translate(${f(960 + sx)} ${f(540 + sy)}) scale(${f(z * 1000) / 1000}) translate(${f(-cx)} ${f(-cy)})`, inner);
const shake = (t, amp) => [noise1(t * 30) * amp, noise1(t * 30 + 50) * amp];
const fadeIn = (t, t0, d = .3) => clamp((t - t0) / d);
const within = (t, a, b) => t >= a && t < b;
const lineFrac = (S, i, fr) => S.L[i][0] + (S.L[i][1] - S.L[i][0]) * fr;
const label = (str, x, y, t, t0, o = {}) => t < t0 ? '' : text(str, x, y, Object.assign({ s: pop(t, t0), sw: 10 }, o));
const flash = (t, t0, d = .35) => { const k = seg(t, t0, t0 + d); return k > 0 && k < 1 ? `<rect width="1920" height="1080" fill="#fffdf5" opacity="${f((1 - k) * 100) / 100}"/>` : ''; };

const SCENES = {};

// ---------------------------------------------------------------- INTRO
SCENES.intro = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    let s = '';
    const zoomK = ein(seg(t, D - 1.3, D));
    const sw = swirl(960, 470, 380 * eback(seg(t, 0, .8)), t * (1 + zoomK * 6) + zoomK * 3, 1);
    const suited = t > L[1] + .35;
    let mood = { brow: 'smug', mouth: 'grin' };
    if (t > L[2] + .3) mood = { brow: 'worried', mouth: 'o', sweat: 1, eyes: 'open' };
    const flip = eio(seg(t, L[1], L[1] + .5));
    const sand = t < L[1] ? .2 + seg(t, 0, L[1]) * .7 : seg(t, L[1] + .5, D);
    const h = hero(Object.assign({
      x: 960, y: 1210 + (1 - eback(seg(t, .2, .8))) * 500, s: 1.18, t, blink: blinkAt(t),
      aL: [-70, -100 + Math.sin(t * 2) * 4], aR: [8, 10], holdL: 'hourglass', propK: { sand: flip > 0 && flip < 1 ? .5 : sand, rot: flip * 180 },
      helmet: suited, armor: suited, look: t > L[2] + .3 ? [-.4, -.3] : [0, 0],
    }, mood));
    let inner = sw + h;
    s += cam(inner, 960, 470 + zoomK * 0, 1 + zoomK * 5);
    if (!zoomK) {
      s += label('POV: You\'re a Roman Legionary', 960, 110, t, L[0], { size: 104 });
      s += label('100 AD', 960, 215, t, L[1] + .35, { size: 86, fill: C.red });
      if (t > L[2] + .3) s += label('Survival chance: ???', 1530, 640, t, L[2] + .6, { size: 60, rot: -6, fill: '#7a4a1a' });
    }
    s += flash(t, L[1] + .3, .5);
    if (zoomK > .6) s += `<rect width="1920" height="1080" fill="#fffaf0" opacity="${f(seg(zoomK, .6, 1))}"/>`;
    return s;
  },
  cues(S) { const L = S.L.map(l => l[0]); return [[.15, 'magic', .6], [.3, 'whoosh', .5], [L[0], 'pop', .5], [L[1] + .3, 'sparkle', .7], [L[1] + .35, 'clank', .4], [L[2] + .4, 'gulp', .6], [S.dur - 1.3, 'magic', .8]]; },
};

// ---------------------------------------------------------------- TENT
function tentBG(t, D) {
  const dawn = seg(t, 0, D);
  let s = `<rect width="1920" height="1080" fill="#4a3226"/>`;
  s += `<path d="M300 140 L1620 140 L1920 900 L0 900 Z" fill="#7a5238"/>`;
  for (let i = 0; i < 9; i++) { const x0 = 300 + i * 165, x1 = 0 + i * 240; s += `<path d="M${x0} 140 L${x1} 900" stroke="#5e3e2a" stroke-width="5" stroke-dasharray="14 12"/>`; }
  s += `<path d="M300 140 L1620 140" stroke="#3a261b" stroke-width="16"/>`;
  s += `<path d="M900 140 L1020 140 L1180 900 L740 900 Z" fill="#ffb86b" opacity="${f(.08 + dawn * .22)}"/>`;
  s += `<path d="M945 140 L975 140 L990 260 L930 260 Z" fill="#ffd9a0" opacity="${f(.4 + dawn * .5)}"/>`;
  s += `<rect y="900" width="1920" height="180" fill="#5a4030"/>`;
  return s;
}
SCENES.tent = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    const heads = 8, hi = 3, X = i => 220 + i * 211;
    const woke = t > L[1] + .25;
    const squeeze = eout(seg(t, L[3] + 1.6, L[3] + 2.0));
    let s = tentBG(t, D);
    const hairs = ['#2b2b2b', '#8a5a2b', '#1e1e1e', null, '#c48b3f', '#3d2a1e', '#5b5b5b', '#2a1a12'];
    let row = '';
    for (let i = 0; i < heads; i++) {
      let x = X(i), y = 690, r = (i % 2 ? 9 : -9);
      if (i === hi - 1) x += squeeze * 60; if (i === hi + 1) x -= squeeze * 60;
      if (i === hi) {
        const jump = woke ? -Math.sin(seg(t, L[1] + .25, L[1] + .7) * Math.PI) * 50 : 0;
        const o = woke ? { eyes: 'wide', brow: 'raised', mouth: 'o', open: .4 } : { eyes: 'closed', mouth: 'flat' };
        if (t > L[3] + 1.8) Object.assign(o, { eyes: 'open', brow: 'angry', mouth: 'flat', look: [0, 0] });
        row += g(`translate(${x} ${y + jump}) scale(${f(1 - squeeze * .14)} 1) rotate(${woke ? 0 : -8})`, headSVG(o));
      } else {
        const sn = Math.sin(t * 2 + i);
        row += otherHead(x, y, .95, { rot: r, hair: hairs[i], eyes: 'closed', mouth: i % 3 ? 'o' : 'flat', open: (sn + 1) * .15, brow: 'neutral' });
        if (i % 2 === 0) { const ph = (t * .5 + i * .3) % 1; row += text('Z', x + 50 + ph * 40, y - 110 - ph * 90, { size: 50 + ph * 20, op: f(1 - ph), fill: '#e8dcc6', font: 'Patrick Hand' }); }
      }
      if (t > L[3] && i !== hi) {
        const n = i < hi ? i + 1 : i;
        row += label(String(n), x, y - 150, t, L[3] + .05 + (n - 1) * .12, { size: 70, fill: '#fff3c4', stroke: '#3a261b', sw: 8 });
      }
    }
    // blanket
    let bl = 'M60 760';
    for (let i = 0; i <= 16; i++) bl += ` Q${f(60 + i * 112 - 56)} ${f(730 + Math.sin(t * 2 + i) * 6)} ${f(60 + i * 112)} 762`;
    row += `<path d="${bl} L1880 1100 L60 1100 Z" fill="#4f5f7d" ${ink(SW)}/>`;
    row += `<rect x="560" y="860" width="140" height="90" fill="#61739a" ${ink(4)} transform="rotate(-4 630 905)"/><rect x="1220" y="840" width="120" height="80" fill="#3f4d68" ${ink(4)} transform="rotate(5 1280 880)"/>`;
    s += row;
    if (t > L[3] + 2.0) s += label('8 men. 1 tent.', 960, 230, t, L[3] + 2.0, { size: 96, fill: '#fff3c4', stroke: '#3a261b', sw: 12 });
    // horn
    if (woke && t < L[2] + .5) {
      const k = seg(t, L[1] + .1, L[1] + 2.2);
      for (let i = 0; i < 3; i++) s += `<path d="M${1700 - i * 60 - k * 200} 300 Q${1640 - i * 60 - k * 200} 420 ${1700 - i * 60 - k * 200} 540" fill="none" stroke="#fff3c4" stroke-width="8" stroke-linecap="round" opacity="${f(1 - k)}"/>`;
      const [hx, hy] = shake(t, 8);
      s += text('TUUUUUT!', 1500 + hx, 230 + hy, { size: 120, fill: '#ffd38a', stroke: '#3a261b', sw: 12, rot: -8, s: pop(t, L[1] + .1), op: f(1 - seg(t, L[2], L[2] + .5)) });
    }
    // camera
    const z = lerp(2.1, 1, eio(seg(t, L[2] - .1, L[2] + 1.3)));
    const cx = lerp(X(hi), 960, eio(seg(t, L[2] - .1, L[2] + 1.3))), cy = lerp(650, 540, eio(seg(t, L[2] - .1, L[2] + 1.3)));
    const [sx, sy] = woke ? shake(t, 14 * (1 - seg(t, L[1] + .3, L[1] + 1.3))) : [0, 0];
    return cam(s, cx, cy, z, sx, sy);
  },
  cues(S) { const L = S.L.map(l => l[0]); const c = [[0, 'snore', .5], [L[1] + .1, 'horn', .8], [L[1] + .25, 'boing', .5], [L[2], 'whoosh', .35], [L[3] + 1.6, 'squish', .6]]; for (let n = 0; n < 7; n++) c.push([L[3] + .05 + n * .12, 'pop', .35]); return c; },
};

// ---------------------------------------------------------------- BREAKFAST
function campBG(t, o = {}) {
  let s = `<rect y="860" width="1920" height="220" fill="#eadcbc"/><path d="M0 860 L1920 860" ${ink(5)}/>`;
  for (let i = 0; i < 14; i++) { const x = (i * 157 + 40) % 1920; s += `<path d="M${x} 860 l6 -18 l6 18 l8 -14 l4 14" fill="none" stroke="#8a9a5a" stroke-width="4" stroke-linecap="round"/>`; }
  s += tentShape(1550, 860, .9) + tentShape(1790, 860, .75, '#e2d0aa', '#bfa57a') + tentShape(150, 860, .7, '#e2d0aa', '#bfa57a');
  return s;
}
function cauldron(x, y, t) {
  let s = `<path d="M-90 0 L0 -230 L90 0 M0 -230 L0 -150" fill="none" stroke="${C.woodSh}" stroke-width="10" stroke-linecap="round"/>`;
  s += `<path d="M-60 -150 Q-66 -60 0 -56 Q66 -60 60 -150 Z" fill="#3f3f44" ${ink(5)}/><ellipse cx="0" cy="-150" rx="62" ry="14" fill="#d8c9a4" ${ink(5)}/>`;
  for (let i = 0; i < 3; i++) { const ph = (t * .4 + i / 3) % 1; s += `<path d="M${-20 + i * 20} ${-170 - ph * 120} q12 -20 0 -40 q-12 -20 0 -40" fill="none" stroke="#c9c2b5" stroke-width="6" stroke-linecap="round" opacity="${f((1 - ph) * .7)}"/>`; }
  return g(`translate(${x} ${y})`, s) + campfire(x, y + 10, t, .45);
}
SCENES.breakfast = {
  draw(t, S) {
    const L = S.L.map(l => l[0]);
    let s = campBG(t) + cauldron(330, 870, t);
    const bite = (t0) => Math.sin(seg(t, t0, t0 + 1.0) * Math.PI);
    const b = Math.max(bite(L[0] + .6), bite(L[0] + 1.9));
    const drink = Math.sin(seg(t, L[1] + 2.2, L[1] + 3.4) * Math.PI);
    const cup = t > L[1] - .1;
    let o = { x: 1000, y: 930, s: 1.25, t, blink: blinkAt(t), mouth: 'smile' };
    o.aL = [lerp(-15, -5, drink), lerp(114, 160, drink)];
    o.holdL = cup ? 'cup' : 'bowl';
    o.aR = [lerp(-5, 22, b), lerp(70, -182, b)]; o.holdR = cup ? null : (b > .5 ? 'spoonFull' : 'spoon'); o.propSR = .8;
    if (t > L[0] + .9 && t < L[0] + 3.2) { o.mouth = 'chew'; o.open = (Math.sin(t * 16) + 1) / 2; }
    if (t > L[0] + 2.6 && t < L[1]) { o.mouth = 'wavy'; o.brow = 'worried'; }
    if (t > L[1] + 3.0) { o.eyes = 'squeeze'; o.mouth = 'grimace'; o.brow = 'angry'; }
    if (t > L[2] + .2) { o.eyes = 'open'; o.mouth = 'frown'; o.brow = 'sad'; o.look = [-.5, 0]; }
    if (t > L[1] + 3.0 && t < L[2]) { const [hx] = shake(t, 6); o.x += hx; }
    s += shadow(1000, 935, 130) + hero(o);
    if (t > L[1] + 3.0 && t < L[2] + .2) for (let i = 0; i < 3; i++) s += `<path d="M${880 - i * 20} ${380 + i * 40} q-20 10 -40 0" fill="none" ${ink(5)} transform="rotate(${-20 + i * 10} 860 420)"/><path d="M${1120 + i * 20} ${380 + i * 40} q20 10 40 0" fill="none" ${ink(5)} transform="rotate(${20 - i * 10} 1140 420)"/>`;
    if (!cup) { s += label('PULS', 640, 520, t, L[0] + .4, { size: 92 }); s += label('(grain porridge)', 640, 590, t, L[0] + .6, { size: 50, fill: '#6a5a46' }); if (t > L[0] + .5) s += arrow(700, 630, 860, 700); }
    else if (t < L[2]) { s += label('POSCA', 620, 470, t, L[1] + .3, { size: 92, fill: '#8a2f3a' }); s += label('= water + vinegar', 620, 545, t, L[1] + 1.2, { size: 54, fill: '#6a5a46' }); if (t > L[1] + .5) s += arrow(690, 600, 850, 680); }
    else {
      const l2 = S.L[2]; const fr = k => l2[0] + (l2[1] - l2[0]) * k;
      s += label('Delicious?', 520, 300, t, fr(0), { size: 80 });
      s += label('NO.', 520, 390, t, fr(.13), { size: 96, fill: C.red, rot: -8 });
      s += label('Free?', 1460, 300, t, fr(.25), { size: 80 });
      s += label('ALSO NO.', 1460, 390, t, fr(.36), { size: 96, fill: C.red, rot: 6 });
      if (t > fr(.55)) { const k = eout(seg(t, fr(.55), fr(.55) + .9)); s += coinSVG(lerp(1040, 1620, k), lerp(700, 640, k) - Math.sin(k * Math.PI) * 220, 1.4, k * 400); s += label('– from your pay', 1560, 760, t, fr(.62), { size: 64, fill: C.red }); }
    }
    return s;
  },
  cues(S) { const L = S.L.map(l => l[0]); const l2 = S.L[2], fr = k => l2[0] + (l2[1] - l2[0]) * k; return [[L[0] + .4, 'pop', .4], [L[0] + 1.0, 'slurp', .5], [L[0] + 2.0, 'slurp', .5], [L[0] + 2.6, 'yuck', .5], [L[1] - .1, 'pop', .4], [L[1] + 2.4, 'slurp', .5], [L[1] + 3.0, 'shiver', .6], [fr(.13), 'stamp', .6], [fr(.36), 'stamp', .6], [fr(.55), 'coin', .6]]; },
};

// ---------------------------------------------------------------- GEAR
const GEAR = [['Helmet', 2], ['Armor', 9], ['Shield', 7], ['2 Javelins', 4], ['Sword', 1], ['Pack', 7]];
SCENES.gear = {
  draw(t, S) {
    const L = S.L.map(l => l[0]);
    const land = i => L[i + 1] + .35;
    const has = i => t >= land(i);
    let kg = 0; GEAR.forEach((gq, i) => { kg += gq[1] * eout(seg(t, land(i), land(i) + .5)); });
    const n = GEAR.filter((_, i) => has(i)).length;
    let squash = 1; GEAR.forEach((_, i) => { const k = seg(t, land(i), land(i) + .45); if (k > 0 && k < 1) squash = Math.min(squash, 1 - Math.sin(k * Math.PI) * .08 * (1 - k)); });
    const HX = 760, HY = 940, HS = 1.25;
    const muleIn = eout(seg(t, L[8], L[8] + .9));
    let o = {
      x: HX, y: HY, s: HS, t, blink: blinkAt(t), squash,
      helmet: has(0), armor: has(1), shield: has(2) ? 1 : 0, holdR: has(3) ? 'pilum' : null, twoPila: true, propRotR: 180, scabbard: has(4), pack: has(5),
      aL: has(2) ? [-22, 10] : [12, 20], aR: has(3) ? [28, -6] : [-12, 6],
      lL: [6, -n * 2.5], lR: [-6, n * 2.5], legShake: n >= 4 ? (n - 3) * 2.2 : 0,
      brow: n >= 2 ? 'worried' : 'neutral', mouth: ['smile', 'smile', 'flat', 'frown', 'frown', 'grimace', 'grimace'][n], sweat: n >= 3 ? (n >= 5 ? 1.5 : 1) : 0,
      look: muleIn > .5 && t < lineFrac(S, 8, .62) ? [1, 0] : [0, 0],
    };
    if (t > lineFrac(S, 8, .62)) { o.brow = 'neutral'; o.mouth = 'flat'; o.eyes = 'tired'; }
    let s = `<path d="M0 945 L1920 945" ${ink(5)}/>` + shadow(HX, 948, 120);
    s += hero(o);
    // falling item
    GEAR.forEach((gq, i) => {
      const t0 = L[i + 1], k = seg(t, t0, land(i));
      if (k > 0 && k < 1) {
        const dy = -(1 - ein(k)) * 1000, sc = HS;
        let it = '';
        if (i === 0) it = g(`translate(${HX} ${HY - 455 * sc + dy}) scale(${sc})`, helmetSVG(false));
        if (i === 1) it = g(`translate(${HX} ${HY + dy}) scale(${sc})`, armorSVG());
        if (i === 2) it = scutum(HX - 80 * sc, HY - 220 * sc + dy, sc * .95);
        if (i === 3) it = g(`translate(${HX + 90 * sc} ${HY - 160 * sc + dy}) scale(${sc})`, PROPS.pilum() + g('translate(18 6)', PROPS.pilum()));
        if (i === 4) it = g(`translate(${HX - 50 * sc} ${HY - 240 * sc + dy}) rotate(18) scale(${sc})`, `<rect x="-9" y="0" width="18" height="110" rx="6" fill="#5a3a24" ${ink(4)}/><rect x="-14" y="-14" width="28" height="12" rx="4" fill="${C.bronze}" ${ink(3)}/>`);
        if (i === 5) it = g(`translate(${HX - 10 * sc} ${HY - 250 * sc + dy}) scale(${-sc} ${sc})`, packSVG());
        s += it;
      }
      if (t > land(i) && t < land(i) + 1.4) {
        const fade = 1 - seg(t, land(i) + 1.0, land(i) + 1.4);
        s += text(`${gq[0]}  +${gq[1]} kg`, HX + 400, 300 + (i % 2) * 80, { size: 70, s: pop(t, land(i)), op: f(fade), fill: C.ink, sw: 10 });
      }
    });
    // gauge
    const gop = 1 - seg(t, L[8], L[8] + .5);
    if (gop > 0 && t > L[0]) {
      const gx = 1560, gy0 = 820, gh = 520, fill = kg / 30 * gh;
      let gs = `<rect x="${gx - 50}" y="${gy0 - gh}" width="100" height="${gh}" rx="50" fill="#fff" ${ink(SW)}/>`;
      gs += `<clipPath id="gc"><rect x="${gx - 47}" y="${gy0 - gh + 3}" width="94" height="${gh - 6}" rx="47"/></clipPath>`;
      const col = kg > 22 ? C.red : kg > 10 ? '#e09a3a' : '#7aa860';
      gs += `<rect x="${gx - 50}" y="${f(gy0 - fill)}" width="100" height="${f(fill)}" fill="${col}" clip-path="url(#gc)"/>`;
      for (let i = 0; i <= 6; i++) gs += `<path d="M${gx + 50} ${gy0 - i * gh / 6} l22 0" ${ink(4)}/>` + text(String(i * 5), gx + 100, gy0 - i * gh / 6, { size: 36, font: 'Patrick Hand' });
      gs += `<circle cx="${gx}" cy="${gy0 + 40}" r="70" fill="${col}" ${ink(SW)}/>`;
      gs += text(`${Math.round(kg)}`, gx, gy0 + 40, { size: 70, fill: '#fff', stroke: C.ink, sw: 6 });
      gs += text('kg', gx, gy0 - gh - 50, { size: 56 });
      s += g(`translate(0 0)`, gs, `opacity="${f(gop * fadeIn(t, L[0]))}"`);
    }
    if (t > L[7] && t < L[8]) s += label('≈ 30 kg', 1180, 170, t, L[7] + .1, { size: 130, fill: C.red, rot: -4 });
    if (muleIn > 0) {
      s += shadow(1420 + (1 - muleIn) * 700, 948, 150) + mule(1420 + (1 - muleIn) * 700, 945, 1.2, t, { pack: true });
      s += label('"Marius\'s Mules"', 1200, 160, t, L[8] + .6, { size: 110, rot: -3 });
    }
    return s;
  },
  cues(S) { const L = S.L.map(l => l[0]); const c = [[L[0], 'pop', .3]]; GEAR.forEach((_, i) => { c.push([L[i + 1], 'whoosh', .35]); c.push([L[i + 1] + .35, i === 5 ? 'thud' : 'clank', .7]); }); c.push([L[7] + .1, 'stamp', .6]); c.push([L[8], 'hoof', .6]); c.push([L[8] + 1.2, 'heehaw', .55]); return c; },
};

// ---------------------------------------------------------------- MARCH
function landscape(t, speed, heat) {
  let s = '';
  const sunX = 300 + t * 70, sunR = 70 + heat * 40;
  s += `<circle cx="${f(sunX)}" cy="170" r="${f(sunR + 30)}" fill="#ffd77a" opacity=".25"/><circle cx="${f(sunX)}" cy="170" r="${f(sunR)}" fill="${heat > .5 ? '#ffb347' : '#ffd77a'}" ${ink(5)}/>`;
  for (let i = 0; i < 10; i++) { const a = i * 36 + t * 20; s += `<path d="M${f(sunX + Math.cos(rad(a)) * (sunR + 18))} ${f(170 + Math.sin(rad(a)) * (sunR + 18))} L${f(sunX + Math.cos(rad(a)) * (sunR + 45))} ${f(170 + Math.sin(rad(a)) * (sunR + 45))}" ${ink(5)}/>`; }
  const hills = (off, y, amp, col, per) => { let d = `M0 1080 L0 ${y}`; for (let x = 0; x <= 1920; x += 40) d += ` L${x} ${f(y - amp * (Math.sin((x + off) / per) * .6 + Math.sin((x + off) / (per * .43)) * .4))}`; return `<path d="${d} L1920 1080 Z" fill="${col}" ${ink(5)}/>`; };
  s += hills(t * speed * .1, 640, 60, '#dfe3c4', 260);
  s += hills(t * speed * .25, 740, 40, '#c8d29f', 180);
  // trees
  for (let i = 0; i < 8; i++) {
    const x = ((i * 330 - t * speed * .5) % 2640 + 2640) % 2640 - 360;
    s += `<g transform="translate(${f(x)} 790)"><path d="M0 0 L0 -40" stroke="${C.woodSh}" stroke-width="10"/><path d="M0 -40 Q-34 -110 0 -230 Q34 -110 0 -40 Z" fill="#6f8a4a" ${ink(5)}/></g>`;
  }
  s += `<rect y="820" width="1920" height="260" fill="#e2cc9f"/><path d="M0 820 L1920 820" ${ink(5)}/>`;
  for (let i = 0; i < 14; i++) { const x = ((i * 190 - t * speed) % 2660 + 2660) % 2660 - 200; s += `<ellipse cx="${f(x)}" cy="${990 + (i % 3) * 25}" rx="${16 + (i % 4) * 6}" ry="8" fill="#c4a87a" ${ink(3)}/>`; }
  if (heat > 0) for (let i = 0; i < 6; i++) s += `<path d="M${200 + i * 300} 700 q15 -20 0 -40 q-15 -20 0 -40" fill="none" stroke="#e8a050" stroke-width="5" stroke-linecap="round" opacity="${f(heat * .5 * (.5 + .5 * Math.sin(t * 5 + i)))}" transform="translate(0 ${f(-((t * 40 + i * 20) % 60))})"/>`;
  return s;
}
SCENES.march = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    const heat = eio(seg(t, L[2], L[2] + .8));
    const speed = 380;
    let s = landscape(t, speed, heat);
    const GY = 960;
    const soldier = (x, ph, extra) => shadow(x, GY + 4, 100) + hero(Object.assign({ x, y: GY + Math.abs(Math.sin(ph)) * -10, s: 1.12, t, ...walkPose(ph), helmet: true, armor: true, shield: 1, pack: true, scabbard: true, blink: blinkAt(t + x) }, extra));
    s += soldier(1580, t * 7.5 + 1.2, { mouth: 'flat', look: [1, 0] });
    const cIn = eout(seg(t, L[3] - .2, L[3] + 1.2));
    const whack = lineFrac(S, 3, .62);
    const hit = seg(t, whack, whack + .25);
    const jump = Math.sin(seg(t, whack + .1, whack + .6) * Math.PI) * 60;
    const hx = 860;
    let ho = { mouth: 'flat', brow: 'neutral', sweat: heat ? 1 + heat * .5 : 0 };
    if (t > L[1]) ho.mouth = 'frown';
    if (heat) { ho.eyes = 'tired'; ho.mouth = 'wavy'; ho.brow = 'worried'; }
    if (t > L[3] + .6) { ho.look = [-1, 0]; ho.eyes = 'open'; ho.mouth = 'flat'; }
    if (t > whack + .1) { ho.eyes = 'wide'; ho.mouth = 'grimace'; ho.brow = 'raised'; ho.look = [0, 0]; }
    if (t > whack + 1.3) { ho.eyes = 'open'; ho.mouth = 'smile'; ho.brow = 'worried'; }
    s += g(`translate(0 ${f(-jump)})`, soldier(hx, t * 7.5, ho));
    if (heat && t < L[3]) for (let i = 0; i < 4; i++) { const ph = (t * 1.5 + i / 4) % 1; s += `<circle cx="${f(hx - 80 - ph * 200)}" cy="${f(GY - 20 - ph * 50)}" r="${f(20 + ph * 40)}" fill="#d9c093" opacity="${f((1 - ph) * .6)}"/>`; }
    if (cIn > 0) {
      const cx = lerp(-250, 560, cIn);
      const stick = t > whack - .4 ? lerp(160, 60, eout(hit)) : 160;
      s += shadow(cx, GY + 4, 100) + hero({ x: cx, y: GY, s: 1.12, t, ...walkPose(t * 7.5 + 2.5), helmet: true, crest: true, armor: true, mustache: true, capeColor: '#9c2a2a', brow: 'angry', mouth: 'smirk', holdR: 'vine', aR: [stick, -20], blink: blinkAt(t + 2) });
      if (t > whack && t < whack + .9) { s += text('WHACK!', hx + 160, 240, { size: 110, fill: C.red, sw: 12, rot: -10, s: pop(t, whack) }); }
      if (t < whack) s += label('vine stick', cx + 120, 230, t, L[3] + 2.0, { size: 60, fill: '#6a4224', rot: -6 });
    }
    // counters
    const km = Math.round(30 * eio(seg(t, L[1], D)));
    const hrs = Math.min(5, Math.round(5 * eio(seg(t, L[1], D)) * 10) / 10);
    if (t > L[1]) {
      s += g(`translate(1680 110) scale(${f(pop(t, L[1]))})`, `<rect x="-200" y="-70" width="400" height="140" rx="26" fill="#fff" ${ink(SW)}/>` + text(`${km} km`, -40, 0, { size: 90 }) + `<circle cx="130" cy="0" r="40" fill="#fff" ${ink(5)}/><path d="M130 0 L130 -26 M130 0 L${f(130 + Math.cos(rad(t * 200)) * 22)} ${f(Math.sin(rad(t * 200)) * 22)}" ${ink(5)}/>`);
      s += label(`${hrs.toFixed(1)} h`, 1680, 220, t, L[1] + .2, { size: 54, fill: '#6a5a46' });
    }
    if (t > L[2] && t < L[3]) { s += label('dust', 520, 760, t, lineFrac(S, 2, .1), { size: 64, rot: -6 }); s += label('mud', 960, 1030, t, lineFrac(S, 2, .35), { size: 64, rot: 4 }); s += label('HEAT', 300, 330, t, lineFrac(S, 2, .65), { size: 84, fill: '#d0602a', rot: -8 }); }
    return s;
  },
  cues(S) { const L = S.L.map(l => l[0]); const w = lineFrac(S, 3, .62); return [[0, 'march', .55], [L[1], 'pop', .35], [L[3] - .2, 'whoosh', .3], [w, 'whack', .8], [w + .15, 'boing', .5]]; },
};

// ---------------------------------------------------------------- CAMP
function castraMap(k, x, y, s) {
  const dash = (len, kk) => `stroke-dasharray="${len}" stroke-dashoffset="${f(len * (1 - clamp(kk)))}"`;
  let m = `<rect x="-240" y="-170" width="480" height="340" rx="22" fill="#f6efdc" ${ink(5)}/>`;
  m += `<rect x="-200" y="-130" width="400" height="260" rx="40" fill="none" stroke="#7a5232" stroke-width="10" ${dash(1400, k * 1.6)}/>`;
  m += `<path d="M0 -130 L0 130 M-200 0 L200 0" stroke="#b49c72" stroke-width="8" ${dash(400, k * 2 - .6)}/>`;
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const kk = clamp(k * 3 - 1.4 - (i + j) * .08); if (kk > 0) [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { m += `<path d="M${a * (40 + i * 38)} ${b * (26 + j * 30)} l12 -16 l12 16 z" fill="#d8c39c" stroke="${C.ink}" stroke-width="2" opacity="${f(kk)}" transform="translate(-6 8)"/>`; }); }
  m += text('CASTRA', 0, -205, { size: 56 });
  return g(T(x, y, s), m);
}
SCENES.camp = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    const digA = L[2], digB = L[3] - .4;
    const build = eio(seg(t, digA + .3, digB));
    const rewind = eio(seg(t, L[3] + .6, L[3] + 1.8));
    const prog = build * (1 - rewind);
    const dusk = seg(t, digA, digB) * (1 - rewind);
    const GY = 820;
    let s = `<rect width="1920" height="1080" fill="#f2a65e" opacity="${f(dusk * .35)}"/>`;
    const sunY = 160 + dusk * 520;
    s += `<circle cx="1650" cy="${f(sunY)}" r="70" fill="${dusk > .5 ? '#f08a4b' : '#ffd77a'}" ${ink(5)}/>`;
    s += `<rect y="${GY}" width="1920" height="${1080 - GY}" fill="${C.dirt}"/>`;
    for (let i = 0; i < 60; i++) s += `<circle cx="${f(rnd(i) * 1920)}" cy="${f(GY + 30 + rnd(i + 99) * 220)}" r="${f(3 + rnd(i + 7) * 5)}" fill="${C.dirtSh}"/>`;
    // ditch
    const depth = prog * 170;
    if (depth > 1) s += `<path d="M880 ${GY} L${f(940)} ${f(GY + depth)} L${f(1160)} ${f(GY + depth)} L1220 ${GY} Z" fill="#5e4329" ${ink(5)}/>`;
    // rampart
    const mh = prog * 150;
    if (mh > 1) s += `<path d="M1260 ${GY} Q1300 ${f(GY - mh)} 1420 ${f(GY - mh)} L1640 ${f(GY - mh)} Q1760 ${f(GY - mh)} 1800 ${GY} Z" fill="#a8845a" ${ink(5)}/>`;
    for (let i = 0; i < 9; i++) { const k = eback(seg(prog, .55 + i * .045, .62 + i * .045)); if (k > .02) s += `<path d="M${1340 + i * 46} ${f(GY - mh + 10)} l0 ${f(-120 * k)} l12 -22 l12 22 l0 ${f(120 * k)} Z" fill="${C.wood}" ${ink(4)}/>`; }
    s += `<path d="M0 ${GY} L880 ${GY} M1220 ${GY} L1920 ${GY}" ${ink(5)}/>`;
    // dropped pack
    s += scutum(300, GY - 120, .8, -8);
    // hero
    const digging = t > L[1] + 1.0 && t < digB;
    const dc = digging ? (Math.sin(t * 9) + 1) / 2 : 0;
    let o = { x: 760, y: GY, s: 1, t, blink: blinkAt(t), helmet: true, armor: true, scabbard: true };
    if (t < L[1]) { o.eyes = t > L[0] + 1.2 ? 'happy' : 'open'; o.mouth = 'smile'; o.aL = [16, 4]; o.aR = [-16, -4]; }
    if (t >= L[1] - .1) { o.mouth = 'frown'; o.brow = 'sad'; }
    if (t > L[1] + .8) { o.holdR = 'shovel'; o.aR = [-10, 40]; o.propRotR = -10; }
    if (digging) { o.lean = 14 + dc * 10; o.aR = [lerp(60, 10, dc), lerp(60, 30, dc)]; o.aL = [lerp(70, 30, dc), lerp(40, 20, dc)]; o.holdR = 'shovel'; o.propRotR = lerp(-60, -10, dc); o.brow = 'focus'; o.mouth = 'grimace'; o.sweat = 1; }
    if (t > L[3]) { o.lean = 0; o.eyes = 'tired'; o.mouth = 'flat'; o.brow = 'sad'; o.sweat = 1.5; o.aR = [-6, 10]; o.propRotR = 0; }
    s += shadow(760, GY + 4, 110) + hero(o);
    if (digging) for (let i = 0; i < 6; i++) { const ph = (t * 1.6 + i / 6) % 1; s += `<circle cx="${f(lerp(1000, 1500, ph))}" cy="${f(GY + 40 - Math.sin(ph * Math.PI) * 330)}" r="${8 + (i % 3) * 4}" fill="${C.dirtSh}" ${ink(3)}/>`; }
    // thought bubble: rest?
    if (t > L[0] + 1.2 && t < L[1] + .15) {
      const k = pop(t, L[0] + 1.2), popk = seg(t, L[1], L[1] + .15);
      const bed = `<rect x="-110" y="-10" width="220" height="40" rx="10" fill="#8aa0c8" ${ink(5)}/><rect x="-110" y="-50" width="20" height="100" fill="${C.wood}" ${ink(4)}/><rect x="-80" y="-30" width="60" height="26" rx="12" fill="#fff" ${ink(4)}/>` + text('z z z', 40, -60, { size: 44 });
      s += bubble(1040, 300, 340, 220, -200, 120, bed, 1 - popk, k * (1 + popk * .3));
    }
    // centurion
    const cin = eout(seg(t, L[1] - .3, L[1] + .3)) * (1 - ein(seg(t, L[1] + 1.4, L[1] + 2.0)));
    if (cin > 0) s += shadow(1640 + (1 - cin) * 500, GY + 4, 100) + hero({ x: 1640 + (1 - cin) * 500, y: GY, s: 1, flip: true, t, helmet: true, crest: true, armor: true, mustache: true, capeColor: '#9c2a2a', brow: 'angry', mouth: 'talk', open: (Math.sin(t * 14) + 1) / 2, aR: [110, 10], holdL: 'vine', aL: [10, 20] });
    if (t > L[1] + .15 && t < L[1] + .8) { const k = seg(t, L[1] + .15, L[1] + .8); s += g(`translate(${f(lerp(1500, 860, k))} ${f(GY - 300 - Math.sin(k * Math.PI) * 200)}) rotate(${f(k * 540)})`, PROPS.shovel()); }
    if (digging) s += text('⏩  x10', 960, 90, { size: 64, font: 'Patrick Hand', fill: '#6a5a46', sw: 8 });
    if (t > L[3] + .6 && t < L[3] + 1.9) s += text('⏪', 960, 90, { size: 80, font: 'Patrick Hand', sw: 8 });
    const mapK = seg(t, lineFrac(S, 2, .45), lineFrac(S, 2, .95));
    const mapOut = seg(t, L[3], L[3] + .4);
    if (mapK > 0 && mapOut < 1) s += castraMap(mapK, 330, 330, .95 * eback(seg(t, lineFrac(S, 2, .45), lineFrac(S, 2, .55))) * (1 - mapOut));
    if (t > L[3] + 1.9) { s += label('REPEAT.', 1340, 220, t, L[3] + 1.9, { size: 100, fill: C.red }); s += label('EVERY. DAY.', 1340, 330, t, L[3] + 2.3, { size: 100, fill: C.red }); }
    return s;
  },
  cues(S) { const L = S.L.map(l => l[0]); const c = [[L[0] + .2, 'thud', .4], [L[0] + 1.2, 'pop', .4], [L[1], 'pop', .5], [L[1] - .3, 'whoosh', .3], [L[1] + .15, 'whoosh', .5], [L[1] + .8, 'clank', .5], [L[3] + .6, 'rewind', .6], [L[3] + 1.9, 'stamp', .5], [L[3] + 2.3, 'stamp', .5]]; for (let x = L[1] + 1.2; x < L[3] - .5; x += 0.7) c.push([x, 'dig', .45]); return c; },
};

// ---------------------------------------------------------------- PAY
const DEDUCT = [['Food', .02], ['Boots', .2], ['Equipment', .38], ['Burial fund', .6]];
SCENES.pay = {
  draw(t, S) {
    const L = S.L.map(l => l[0]);
    let s = `<path d="M0 950 L1920 950" ${ink(5)}/>`;
    const N = 21; let gone = 0;
    DEDUCT.forEach((d, i) => { gone += 4.5 * eout(seg(t, lineFrac(S, 2, d[1]), lineFrac(S, 2, d[1]) + .5)); });
    const left = Math.max(2, Math.round(N - gone));
    const pileIn = pop(t, L[0] + .3, .5);
    // pile of coins (stacked rows)
    let pile = ''; let idx = 0;
    const rows = [6, 5, 4, 3, 2, 1];
    rows.forEach((n, r) => { for (let i = 0; i < n; i++) { if (idx < left) pile += coinSVG((i - (n - 1) / 2) * 58, -r * 46, 1, (idx * 37) % 20 - 10); idx++; } });
    s += shadow(980, 952, 190) + g(T(980, 920, pileIn), pile);
    s += label('300 denarii / year', 900, 470, t, L[0] + .5, { size: 76 });
    // hero
    let o = { x: 470, y: 950, s: 1.05, t, blink: blinkAt(t), helmet: false, armor: true, mouth: 'grin', eyes: 'happy', aL: [-150, -10 + Math.sin(t * 8) * 10], aR: [150, 10 - Math.sin(t * 8) * 10] };
    if (t > lineFrac(S, 1, .45)) { o.mouth = 'o'; o.eyes = 'open'; o.brow = 'worried'; o.aL = [12, -6]; o.aR = [-12, 6]; o.look = [1, 0]; }
    if (t > L[2] + .5) { o.mouth = 'frown'; o.brow = 'sad'; o.look = [1, .2]; }
    if (t > lineFrac(S, 2, .85)) { o.holdR = 'coin'; o.aR = [-20, 120]; o.look = [.3, .5]; o.sweat = 1; }
    s += shadow(470, 952, 110) + hero(o);
    // ledger
    const un = eio(seg(t, lineFrac(S, 1, .4), lineFrac(S, 1, .4) + .7));
    if (un > 0) {
      const top = 180, h = 620 * un;
      let lg = `<rect x="1330" y="${top}" width="480" height="${f(h)}" fill="#f1e2b8" ${ink(5)}/>`;
      lg += `<rect x="1310" y="${top - 30}" width="520" height="44" rx="22" fill="#d9c391" ${ink(5)}/><rect x="1310" y="${f(top + h - 14)}" width="520" height="44" rx="22" fill="#d9c391" ${ink(5)}/>`;
      if (un > .8) {
        lg += text('DEDUCTIONS', 1570, top + 70, { size: 62, fill: C.red });
        DEDUCT.forEach((d, i) => {
          const tt = lineFrac(S, 2, d[1]);
          if (t > tt) {
            const k = seg(t, tt, tt + .35);
            lg += `<g opacity="${f(k)}">` + text(d[0], 1380, top + 180 + i * 110, { size: 64, anchor: 'start' }) + text('–', 1760, top + 180 + i * 110, { size: 72, fill: C.red }) + `</g>`;
            const ck = seg(t, tt, tt + .7);
            if (ck > 0 && ck < 1) for (let c = 0; c < 3; c++) { const kk = clamp(ck * 1.3 - c * .15); if (kk > 0 && kk < 1) s += coinSVG(lerp(980, 1720, kk), lerp(800, top + 180 + i * 110, kk) - Math.sin(kk * Math.PI) * 250, .9, kk * 500); }
          }
        });
        const tomb = lineFrac(S, 2, .82);
        if (t > tomb) lg += g(T(1700, top + 510, pop(t, tomb) * .6), `<path d="M-40 40 L-40 -20 Q-40 -60 0 -60 Q40 -60 40 -20 L40 40 Z" fill="#b9b9b9" ${ink(5)}/>` + text('RIP', 0, -10, { size: 40 }));
      }
      s += lg;
    }
    return s;
  },
  cues(S) { const L = S.L.map(l => l[0]); const c = [[L[0] + .3, 'coins', .7], [L[0] + .5, 'pop', .3], [lineFrac(S, 1, .4), 'scroll', .5]]; DEDUCT.forEach(d => { c.push([lineFrac(S, 2, d[1]), 'scribble', .4]); c.push([lineFrac(S, 2, d[1]) + .2, 'coins', .45]); }); c.push([lineFrac(S, 2, .82), 'pop', .3]); c.push([lineFrac(S, 2, .9), 'sad', .5]); return c; },
};

// ---------------------------------------------------------------- NIGHT
function painMark(x, y, s, t, t0) {
  if (t < t0) return '';
  const k = pop(t, t0) * (1 + Math.sin(t * 14) * .08);
  return g(T(x, y, k * s), `<path d="M-30 -30 L-10 -10 M30 -30 L10 -10 M-30 30 L-10 10 M30 30 L10 10" stroke="${C.red}" stroke-width="9" stroke-linecap="round"/>`);
}
function farm() {
  return `<rect x="-120" y="20" width="240" height="60" fill="#c8d29f" ${ink(4)}/><path d="M-110 40 L110 40 M-110 60 L110 60" stroke="#8a9a5a" stroke-width="4"/>` +
    `<path d="M-60 20 L-60 -40 L0 -80 L60 -40 L60 20 Z" fill="#f3ede1" ${ink(4)}/><path d="M-76 -36 L0 -96 L76 -36" fill="none" stroke="${C.red}" stroke-width="12" stroke-linejoin="round"/><rect x="-14" y="-20" width="28" height="40" fill="${C.wood}" ${ink(3)}/>` +
    `<circle cx="100" cy="-70" r="22" fill="#ffd77a" ${ink(4)}/>`;
}
SCENES.night = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    let s = `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e1430"/><stop offset="1" stop-color="#2d2a4e"/></linearGradient>
      <radialGradient id="glow" cx="760" cy="800" r="900" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ff9a40" stop-opacity=".0"/><stop offset=".35" stop-color="#0b0f22" stop-opacity=".05"/><stop offset="1" stop-color="#05070f" stop-opacity=".6"/></radialGradient>
      <radialGradient id="fire" cx="760" cy="820" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#ffae55" stop-opacity=".55"/><stop offset="1" stop-color="#ffae55" stop-opacity="0"/></radialGradient></defs>`;
    s += `<rect width="1920" height="1080" fill="url(#sky)"/>`;
    for (let i = 0; i < 90; i++) { const tw = .5 + .5 * Math.sin(t * (1 + rnd(i) * 3) + i); s += `<circle cx="${f(rnd(i + 1) * 1920)}" cy="${f(rnd(i + 2) * 640)}" r="${f(1.5 + rnd(i + 3) * 2.5)}" fill="#fff8e0" opacity="${f(.3 + tw * .7)}"/>`; }
    for (let i = 0; i < 6; i++) s += tentShape(120 + i * 340, 830, .75, '#232038', '#191628');
    s += `<rect y="830" width="1920" height="250" fill="#2a2433"/><path d="M0 830 L1920 830" ${ink(5)}/>`;
    const fl = .9 + noise1(t * 5) * .1;
    s += `<circle cx="760" cy="820" r="${f(520 * fl)}" fill="url(#fire)"/>`;
    // log + hero sitting
    s += `<rect x="930" y="858" width="330" height="64" rx="30" fill="${C.woodSh}" ${ink(5)}/><circle cx="1245" cy="890" r="28" fill="${C.wood}" ${ink(4)}/>`;
    s += g('translate(1390 905) scale(.8)', helmetSVG(false));
    let o = { x: 1100, y: 860 + 167 * 1.3, s: 1.3, flip: true, ground: false, t, blink: blinkAt(t), armor: false, lL: [92, -92], lR: [82, -84], aL: [40, 40], aR: [30, 50], eyes: 'tired', mouth: 'flat', brow: 'neutral', look: [.3, .2] };
    const l1 = S.L[1];
    if (t > l1[0] && t < L[2]) { o.eyes = 'squeeze'; o.mouth = 'grimace'; o.brow = 'worried'; }
    if (t > L[2] + .3 && t < L[3]) { o.eyes = 'wide'; o.mouth = 'o'; o.open = 1; o.brow = 'raised'; o.look = [0, 0]; }
    if (t > L[3] + .4) { o.eyes = 'happy'; o.mouth = 'smile'; o.brow = 'neutral'; o.look = [0, -.4]; }
    if (t > L[4]) { o.eyes = 'open'; o.mouth = 'smile'; o.look = [.6, .2]; }
    s += hero(o);
    if (t < L[2]) { s += painMark(990, 975, .9, t, lineFrac(S, 1, .02)) + painMark(1070, 975, .9, t, lineFrac(S, 1, .04));
    s += painMark(1190, 740, 1, t, lineFrac(S, 1, .33)); }
    if (t > lineFrac(S, 1, .62) && t < L[2]) { s += painMark(980, 400, 1.1, t, lineFrac(S, 1, .62)) + painMark(1210, 420, 1, t, lineFrac(S, 1, .66)) + painMark(960, 720, 1, t, lineFrac(S, 1, .7)) + painMark(1240, 860, 1, t, lineFrac(S, 1, .74)); }
    s += campfire(720, 900, t, 1);
    s += `<rect width="1920" height="1080" fill="url(#glow)"/>`;
    s += `<circle cx="300" cy="160" r="70" fill="#f4efd8" ${ink(5)}/><circle cx="280" cy="140" r="12" fill="#dcd5bb"/><circle cx="325" cy="185" r="9" fill="#dcd5bb"/>`;
    if (t > L[2] && t < L[3] + .4) {
      const yrs = Math.max(1, Math.round(25 * eout(seg(t, L[2] + .2, L[2] + 1.6))));
      s += text(`${yrs} YEARS`, 760, 300, { size: 150, fill: '#ffe08a', stroke: '#0e1430', sw: 14, s: pop(t, L[2]), op: f(1 - seg(t, L[3], L[3] + .4)) });
    }
    if (t > L[3] + .3 && t < L[4] + .6) {
      const k = pop(t, L[3] + .3), out = seg(t, L[4], L[4] + .6);
      const inner = g('translate(-120 0) scale(.9)', coinSVG(-30, 20, 1) + coinSVG(20, 10, 1) + coinSVG(-5, -20, 1) + `<path d="M-40 70 Q-80 70 -70 30 Q-60 0 -20 -10 L20 -10 Q60 0 70 30 Q80 70 40 70 Z" fill="#c9a46a" ${ink(4)} transform="translate(0 30)"/>`) + g('translate(130 0) scale(.9)', farm());
      s += bubble(1380, 250, 520, 300, -220, 200, inner, 1 - out, k);
    }
    const z = 1 + eio(seg(t, L[4] - .5, D)) * .25;
    return cam(s, lerp(960, 1000, z - 1), lerp(540, 620, (z - 1) * 4), z);
  },
  cues(S) { const L = S.L.map(l => l[0]); return [[0, 'crickets', .5], [lineFrac(S, 1, .02), 'ouch', .4], [lineFrac(S, 1, .33), 'ouch', .45], [lineFrac(S, 1, .62), 'ouch', .5], [L[2], 'sting', .6], [L[3] + .3, 'sparkle', .5]]; },
};

// ---------------------------------------------------------------- OUTRO
SCENES.outro = {
  draw(t, S) {
    const L = S.L.map(l => l[0]), D = S.dur;
    let s = swirl(1330, 470, 360 * eback(seg(t, 0, .7)), t, 1);
    const click = L[2] + 1.9;
    let o = { x: 1330, y: 960, s: 1.1, t, blink: blinkAt(t), helmet: false, brow: 'smug', mouth: 'grin', aL: [-88, 0], holdL: 'sword', propRotL: 0, aR: [-24, 30], wave: 8 };
    if (t > L[1]) { o.aL = [10, 20]; o.holdL = null; o.aR = [-20, 120]; o.holdR = 'sword'; o.propRotR = 180; o.mouth = 'smile'; o.brow = 'neutral'; o.look = [-.6, 0]; }
    if (t > click) { o.mouth = 'grin'; o.eyes = 'happy'; o.look = [0, 0]; }
    s += shadow(1330, 965, 120) + hero(o);
    if (t < L[1]) s += label('Would YOU survive?', 520, 330, t, L[0] + .2, { size: 116, rot: -4 });
    if (t > L[1] && t < L[2]) {
      const k = pop(t, L[1]);
      let c = `<rect x="-330" y="-110" width="660" height="220" rx="26" fill="#fff" ${ink(SW)}/><circle cx="-250" cy="-30" r="44" fill="#e9e1cf" ${ink(4)}/>`;
      const ty = seg(t, L[1] + .3, L[2]);
      c += `<rect x="-180" y="-60" width="${f(380 * clamp(ty * 2))}" height="20" rx="10" fill="#cfc6b4"/><rect x="-180" y="-14" width="${f(300 * clamp(ty * 2 - .6))}" height="20" rx="10" fill="#cfc6b4"/><rect x="-180" y="32" width="${f(200 * clamp(ty * 2 - 1))}" height="20" rx="10" fill="#cfc6b4"/>`;
      s += g(T(560, 520, k), c);
      s += label('Tell me in the comments!', 560, 300, t, L[1] + .1, { size: 80 });
    }
    if (t > L[2]) {
      s += label('SUBSCRIBE :)', 560, 330, t, L[2] + .1, { size: 150 });
      const k = pop(t, L[2] + .5);
      const done = t > click;
      const press = 1 - Math.sin(seg(t, click - .05, click + .2) * Math.PI) * .08;
      s += g(T(560, 620, k * press), `<rect x="-230" y="-60" width="460" height="120" rx="60" fill="${done ? '#9b9b9b' : '#d62e2e'}" ${ink(SW)}/>` + text(done ? 'SUBSCRIBED ✓' : 'SUBSCRIBE', 0, 4, { size: 62, fill: '#fff', font: 'Patrick Hand' }));
      const ck = eio(seg(t, L[2] + .8, click));
      if (t > L[2] + .8) s += g(T(lerp(900, 600, ck), lerp(900, 650, ck), 1, -20), `<path d="M0 0 L0 70 L18 54 L32 84 L44 78 L30 50 L54 50 Z" fill="#fff" ${ink(5)}/>`);
      if (t > click) { for (let i = 0; i < 8; i++) { const a = i * 45, kk = eout(seg(t, click, click + .5)); s += `<path d="M${f(560 + Math.cos(rad(a)) * 260 * (1 + kk * .2))} ${f(620 + Math.sin(rad(a)) * 120 * (1 + kk * .5))} l${f(Math.cos(rad(a)) * 30)} ${f(Math.sin(rad(a)) * 30)}" ${ink(6)} opacity="${f(1 - seg(t, click + .3, click + .7))}"/>`; } }
      s += label('next time: somewhere even worse...', 560, 820, t, click + .6, { size: 54, fill: '#6a5a46' });
    }
    return s;
  },
  cues(S) { const L = S.L.map(l => l[0]); const click = L[2] + 1.9; return [[.1, 'magic', .4], [L[0] + .2, 'pop', .4], [L[1], 'pop', .4], [L[1] + .3, 'type', .4], [L[2] + .1, 'pop', .4], [L[2] + .5, 'pop', .4], [click, 'click', .7], [click + .05, 'sparkle', .6]]; },
};

// ---------------------------------------------------------------- composition
let TL = null;
window.setTimeline = tl => { TL = tl; };
window.allCues = () => { const out = []; TL.forEach(sc => { const S = { dur: sc.dur, L: sc.lines }; SCENES[sc.id].cues(S).forEach(c => out.push([+(sc.start + c[0]).toFixed(3), c[1], c[2]])); }); return out; };
window.frameSVG = (T0, opts = {}) => {
  let sc = TL[TL.length - 1];
  for (const x of TL) if (T0 >= x.start && T0 < x.start + x.dur) { sc = x; break; }
  const t = T0 - sc.start, S = { dur: sc.dur, L: sc.lines };
  let inner = SCENES[sc.id].draw(t, S);
  const fadeK = Math.max(1 - seg(t, 0, .25), seg(t, sc.dur - .25, sc.dur));
  const boilSeed = Math.floor(T0 * 8) % 5;
  let out = `<defs><filter id="boil" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="${boilSeed}"/><feDisplacementMap in="SourceGraphic" scale="${opts.boil == null ? 3.2 : opts.boil}"/></filter></defs>`;
  out += `<g filter="url(#boil)">${inner}</g>`;
  if (fadeK > 0 && sc.id !== 'intro') out += `<rect width="1920" height="1080" fill="#fbf8f1" opacity="${f(fadeK * 100) / 100}"/>`;
  if (sc.id === 'intro' && t < .2) out += `<rect width="1920" height="1080" fill="#fbf8f1" opacity="${f(1 - t / .2)}"/>`;
  return out;
};

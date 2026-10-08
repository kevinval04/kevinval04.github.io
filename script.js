/* nav turns solid once the photo has scrolled away */
const nav = document.getElementById('nav');
const hero = document.getElementById('top');
const onScroll = () => nav.classList.toggle('scrolled', scrollY > hero.offsetHeight - nav.offsetHeight);
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', onScroll);
onScroll();

/* ---------- meadow ---------- */
// The stag is drawn at a whole-number scale (P screen px per sprite pixel) so it stays crisp.
const P = 2;
const meadow = document.getElementById('meadow');
const scenery = document.getElementById('scenery');
const stag = document.getElementById('stag');
const bell = document.getElementById('bell');
const hint = document.getElementById('bellHint');
const bellPost = document.getElementById('bellPost');
const SP = 3;     // the scenery uses a chunkier grid than the stag
const GROUND = 6; // scenery px of ground strip at the bottom (matches footer colour)

function rng(seed) { // mulberry32, so the scenery is the same on every visit
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Half Dome outline: x 0..100 left to right, y 0 (summit) .. 60 (base)
const DOME = [[14,60],[20,52],[24,46],[25,30],[26,18],[27,12],[29,8],[33,5],[40,3],[48,2],
  [56,3],[64,6],[71,10],[78,16],[84,23],[89,31],[93,40],[97,50],[100,56],[100,60]];

function drawScenery() {
  const W = Math.ceil(meadow.clientWidth / SP), H = Math.ceil(meadow.clientHeight / SP);
  scenery.width = W; scenery.height = H;
  scenery.style.width = W * SP + 'px'; scenery.style.height = H * SP + 'px';
  const c = scenery.getContext('2d');
  const base = H - GROUND, rand = rng(7);
  const ridge = (y0, amp, color, k) => {
    c.fillStyle = color; c.beginPath(); c.moveTo(0, H);
    for (let x = 0; x <= W; x++) c.lineTo(x, y0 + amp * (Math.sin(x * 0.031 * k + 1) * 0.6 + Math.sin(x * 0.073 * k) * 0.3 + Math.sin(x * 0.17) * 0.1));
    c.lineTo(W, H); c.fill();
  };

  ridge(base - 20, 5, '#e6eaea', 1);

  const dw = Math.min(84, W * 0.5), dh = dw * 0.55;
  const dx = (W < 260 ? W * 0.5 : W * 0.27) - dw / 2;
  c.fillStyle = '#d9e0e2'; c.beginPath();
  DOME.forEach(([x, y], i) => c[i ? 'lineTo' : 'moveTo'](dx + x / 100 * dw, base - 4 - (60 - y) / 60 * dh));
  c.lineTo(dx + dw, H); c.lineTo(dx + dw * 0.14, H); c.fill();

  ridge(base - 6, 2, '#e2e8e1', 1.6);

  // drop the anti-aliased edges so it reads as pixel art
  const img = c.getImageData(0, 0, W, H), d = img.data;
  for (let i = 3; i < d.length; i += 4) d[i] = d[i] < 128 ? 0 : 255;
  c.putImageData(img, 0, 0);

  c.fillStyle = '#e9ede4'; c.fillRect(0, base, W, GROUND);
  c.fillStyle = '#d6e0cf'; c.fillRect(0, base, W, 1);
  c.fillStyle = '#c4d3bb';
  for (let i = 0; i < W / 14; i++) {
    const x = Math.floor(rand() * W), y = base + 2 + Math.floor(rand() * (GROUND - 3));
    c.fillRect(x, y, 1, 1); c.fillRect(x + 1, y - 1, 1, 1);
  }

  // foreground bits sized for the stag: grass tufts, a few rocks, the odd wildflower
  const tuft = (x, flower) => {
    const hs = [2, 4, 3, 5, 3, 2].slice(0, 3 + Math.floor(rand() * 4));
    hs.forEach((h, k) => {
      c.fillStyle = k % 2 ? '#a9bd9e' : '#bccbb2';
      c.fillRect(x + k, base + 1 - h, 1, h);
    });
    if (flower) { c.fillStyle = rand() < 0.5 ? '#e3c26c' : '#d6a3b0'; c.fillRect(x + 1, base - 4, 1, 1); }
  };
  for (let i = 0; i < W / 22; i++) tuft(Math.floor(rand() * W), rand() < 0.25);
  // the patch the stag comes to eat, right under its mouth
  const mx = Math.round((grazeX() + MOUTH_X * P) / SP);
  [2, 4, 3, 5, 4, 3, 2].forEach((h, k) => {
    c.fillStyle = k % 2 ? '#9fb592' : '#b4c6a8';
    c.fillRect(mx - 3 + k, base + 1 - h, 1, h);
  });
  for (let i = 0; i < W / 140; i++) {
    const x = Math.floor(rand() * W), w = 3 + Math.floor(rand() * 2);
    c.fillStyle = '#cfd3cc'; c.fillRect(x, base - 1, w, 2);
    c.fillStyle = '#dde0da'; c.fillRect(x + 1, base - 2, w - 2, 1);
  }
}
let resizeQueued = false;
addEventListener('resize', () => {
  if (resizeQueued) return; resizeQueued = true;
  requestAnimationFrame(() => { resizeQueued = false; drawScenery(); });
});

/* ---------- stag ---------- */
// Sprite sheet: 22 frames of 75x69. Frames 0-7 walk, 8-21 graze (head down, chew, head up).
const FW = 75, FH = 69, SHEET_N = 22, DW = FW * P, DH = FH * P;
const CFG = { frameMs: 120, walkPxPerSec: 110, startleSpeed: 1.9, chewLoops: 4, pause: 5, chewBob: [6, 7, 8, 9, 8, 7] };
stag.style.width = DW + 'px'; stag.style.height = DH + 'px';
// The sprite has 4 empty rows under the hooves; drop it by that much plus a few px so it
// stands in the grass rather than on the top edge of the ground.
const FOOT_PAD = 4, SINK = 4;
const feet = GROUND * SP - SINK;
stag.style.bottom = feet - FOOT_PAD * P + 'px';
bellPost.style.bottom = feet + 'px';
const MOUTH_X = 47; // sprite column where the muzzle touches the ground while grazing

// walks in from the left, grazes in the middle (clear of the bell post), leaves on the right
function grazeX() {
  const postLeft = bellPost.getBoundingClientRect().left - meadow.getBoundingClientRect().left;
  return Math.round(Math.min(meadow.clientWidth * 0.5 - DW / 2, postLeft - DW - 70));
}
stag.style.backgroundSize = FW * SHEET_N * P + 'px ' + DH + 'px';

const WALK = [0, 1, 2, 3, 4, 5, 6, 7], eat = k => 8 + k;
const RAISE = [eat(9), eat(10), eat(11), eat(12), eat(13)];
function grazeTimeline() {
  return [
    ...Array(CFG.pause).fill(eat(0)),
    ...[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(eat),
    ...Array.from({ length: CFG.chewLoops }, () => CFG.chewBob.map(eat)).flat(),
    ...RAISE,
    ...Array(CFG.pause).fill(eat(13)),
  ];
}
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');

let s = null; // current visit, or null when the meadow is empty

function place() {
  stag.style.backgroundPositionX = -(s.frame * DW) + 'px';
  stag.style.transform = `translate3d(${s.x}px,0,0)`;
}

function visit() {
  const W = meadow.clientWidth;
  const target = grazeX();
  s = {
    target, phase: 'in', frame: 0, tick: 0, gi: 0, speed: 1,
    x: -DW - 20, end: W + 20,
    graze: grazeTimeline(), last: null,
  };
  if (reduceMotion.matches) { s.x = target; s.phase = 'graze'; s.frame = s.graze[0]; }
  // grass sprouts where the head will go down
  stag.style.opacity = '1';
  place();
  requestAnimationFrame(step);
}

function step(now) {
  if (!s) return;
  const dt = s.last === null ? 0 : Math.min(250, now - s.last); // clamp so a hidden tab doesn't teleport the stag
  s.last = now;
  s.tick += dt;
  const advance = s.tick >= CFG.frameMs;
  if (advance) s.tick -= CFG.frameMs;

  if (s.phase === 'in' || s.phase === 'out') {
    if (advance) s.frame = WALK[(WALK.indexOf(s.frame) + 1) % WALK.length];
    s.x += CFG.walkPxPerSec * s.speed * dt / 1000;
    if (s.phase === 'in' && s.x >= s.target) {
      s.x = s.target; s.phase = 'graze'; s.gi = 0; s.frame = s.graze[0];
    } else if (s.phase === 'out' && s.x >= s.end) {
      stag.style.opacity = '0'; s = null; return;
    }
  } else if (advance) { // graze
    s.gi++;
    if (s.gi >= s.graze.length) {
      if (reduceMotion.matches) { stag.style.opacity = '0'; s = null; return; }
      s.phase = 'out'; s.frame = WALK[0];
    } else s.frame = s.graze[s.gi];
  }
  place();
  requestAnimationFrame(step);
}

// Ringing again while it's grazing startles it: head up, then it trots off.
function startle() {
  if (!s || s.phase !== 'graze' || s.speed > 1) return;
  s.speed = CFG.startleSpeed;
  const raiseStart = s.graze.length - RAISE.length - CFG.pause;
  if (s.gi < CFG.pause) s.graze = s.graze.slice(0, s.gi + 1);           // head still up: just go
  else if (s.gi < raiseStart) s.graze = [...s.graze.slice(0, s.gi + 1), ...RAISE];
  else s.graze = s.graze.slice(0, raiseStart + RAISE.length);           // already lifting: skip the final pause
}

/* ---------- bell ---------- */
let audio = null;
function chime() {
  try {
    audio = audio || new (window.AudioContext || window.webkitAudioContext)();
    if (audio.state === 'suspended') audio.resume();
    const strike = (f, t, gain) => {
      // a few inharmonic partials with different decays, roughly how a small bell rings
      [[1, 1, 1.4], [2.76, 0.35, 0.7], [5.4, 0.12, 0.35]].forEach(([m, a, d]) => {
        const o = audio.createOscillator(), g = audio.createGain();
        o.type = 'sine'; o.frequency.value = f * m;
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(gain * a, t + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g); g.connect(audio.destination);
        o.start(t); o.stop(t + d + 0.05);
      });
    };
    const t = audio.currentTime;
    strike(880, t, 0.08); strike(1318.5, t + 0.1, 0.06);
  } catch (e) {}
}

bell.addEventListener('click', () => {
  bell.classList.remove('ringing'); void bell.offsetWidth; bell.classList.add('ringing');
  hint.classList.add('gone');
  chime();
  if (!s) visit(); else startle();
});

drawScenery();

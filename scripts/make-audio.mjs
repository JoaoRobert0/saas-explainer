// Synthesizes a music bed and a set of UI sound effects from scratch, so every
// sound in the video is original and free to publish. No dependencies: plain
// oscillators and noise, written out as 16-bit WAV into public/audio/.
//
//   node scripts/make-audio.mjs --file music.wav --dur 103.5 --lift 17 --outro 95.1
//   node scripts/make-audio.mjs --file music-short.wav --dur 49.5 --lift 6.5 --outro 42
//   node scripts/make-audio.mjs --sfx-only
//
// The music follows the cut: an uneasy minor electric piano under the problem,
// a soft swell into the moment the product appears (--lift), a light groove
// through the features, and a held chord under the closing scene (--outro).
// --dur should be the video length plus ~1.5s. Every run also (re)writes the
// sound effects: whoosh, click, tick, shutter, pop, success, negative,
// shimmer, stamp.

import { mkdirSync, writeFileSync } from "node:fs";

const SR = 44100;
const OUT = new URL("../public/audio/", import.meta.url);
mkdirSync(OUT, { recursive: true });

// ---------- helpers ----------

const midi = (n) => 440 * 2 ** ((n - 69) / 12);
let seed = 12345;
const noise = () => {
  // Deterministic LCG so the render is reproducible.
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return (seed / 2 ** 32) * 2 - 1;
};

function writeWav(name, L, R = L) {
  let peak = 0;
  for (let i = 0; i < L.length; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
  const gain = peak > 0 ? 0.89 / peak : 1; // normalize to about -1 dBFS
  const n = L.length;
  const buf = Buffer.alloc(44 + n * 4);
  buf.write("RIFF", 0);
  buf.writeUInt32LE(36 + n * 4, 4);
  buf.write("WAVEfmt ", 8);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24);
  buf.writeUInt32LE(SR * 4, 28);
  buf.writeUInt16LE(4, 32);
  buf.writeUInt16LE(16, 34);
  buf.write("data", 36);
  buf.writeUInt32LE(n * 4, 40);
  for (let i = 0; i < n; i++) {
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), 44 + i * 4);
    buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), 46 + i * 4);
  }
  writeFileSync(new URL(name, OUT), buf);
  console.log("wrote", name, (n / SR).toFixed(2) + "s");
}

// One-pole lowpass, in place, with a cutoff that may vary per sample.
function lowpass(x, cutoff) {
  let y = 0;
  for (let i = 0; i < x.length; i++) {
    const fc = typeof cutoff === "function" ? cutoff(i / SR) : cutoff;
    const a = 1 - Math.exp((-2 * Math.PI * fc) / SR);
    y += a * (x[i] - y);
    x[i] = y;
  }
  return x;
}
function highpass(x, cutoff) {
  const lp = lowpass(Float32Array.from(x), cutoff);
  for (let i = 0; i < x.length; i++) x[i] -= lp[i];
  return x;
}

const saw = (ph) => 2 * (ph - Math.floor(ph + 0.5));
const tri = (ph) => 1 - 4 * Math.abs(ph - Math.floor(ph + 0.5));

// Add a voice into a stereo bus.
function addNote(L, R, start, dur, freq, { wave = "sine", amp = 0.2, a = 0.01, rel = 0.1, decay = 0, pan = 0, detune = 0 } = {}) {
  const s0 = Math.floor(start * SR);
  const len = Math.floor((dur + rel) * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < len; i++) {
    const t = i / SR;
    const idx = s0 + i;
    if (idx < 0 || idx >= L.length) continue;
    let env = Math.min(1, t / a);
    if (decay) env *= Math.exp(-t / decay);
    if (t > dur) env *= Math.max(0, 1 - (t - dur) / rel);
    let v = 0;
    for (const d of detune ? [-detune, detune] : [0]) {
      const ph = t * freq * 2 ** (d / 1200);
      v += wave === "saw" ? saw(ph) : wave === "tri" ? tri(ph) : Math.sin(2 * Math.PI * ph);
    }
    if (detune) v *= 0.5;
    L[idx] += v * env * amp * gl;
    R[idx] += v * env * amp * gr;
  }
}

function addBuffer(L, R, start, buf, amp = 1, pan = 0) {
  const s0 = Math.floor(start * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < buf.length; i++) {
    const idx = s0 + i;
    if (idx < 0 || idx >= L.length) continue;
    L[idx] += buf[i] * amp * gl;
    R[idx] += buf[i] * amp * gr;
  }
}

// ---------- drum and effect voices (mono buffers) ----------

function kick() {
  const n = Math.floor(0.45 * SR);
  const b = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const f = 48 + 110 * Math.exp(-t / 0.045);
    ph += f / SR;
    b[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t / 0.16) + (t < 0.004 ? noise() * 0.3 : 0);
  }
  return b;
}
function hat(len = 0.05) {
  const n = Math.floor(len * 2.5 * SR);
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) b[i] = noise() * Math.exp(-(i / SR) / len);
  return highpass(b, 7000);
}
function clap() {
  const n = Math.floor(0.3 * SR);
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    // Three quick bursts, then a tail: the "clap" shape.
    const burst = [0, 0.011, 0.022].reduce((s, o) => s + (t >= o ? Math.exp(-(t - o) / 0.006) : 0), 0);
    b[i] = noise() * (burst * 0.6 + Math.exp(-t / 0.08));
  }
  return lowpass(highpass(b, 900), 5000);
}

// ---------- soft instruments ----------

// Electric piano: a sine with a decaying second harmonic and a short bell-like
// attack partial, plus slow tremolo. Warm, not buzzy.
function epiano(L, R, start, dur, nn, amp, pan = 0) {
  const f = midi(nn);
  const s0 = Math.floor(start * SR);
  const rel = 0.5;
  const len = Math.floor((dur + rel) * SR);
  const gl = Math.cos(((pan + 1) * Math.PI) / 4);
  const gr = Math.sin(((pan + 1) * Math.PI) / 4);
  for (let i = 0; i < len; i++) {
    const idx = s0 + i;
    if (idx < 0 || idx >= L.length) continue;
    const t = i / SR;
    let env = Math.min(1, t / 0.006) * Math.exp(-t / 1.6);
    if (t > dur) env *= Math.max(0, 1 - (t - dur) / rel);
    const trem = 1 + 0.08 * Math.sin(2 * Math.PI * 4.5 * t);
    const v =
      Math.sin(2 * Math.PI * f * t) +
      0.35 * Math.exp(-t / 0.4) * Math.sin(2 * Math.PI * 2 * f * t) +
      0.12 * Math.exp(-t / 0.05) * Math.sin(2 * Math.PI * 7 * f * t);
    L[idx] += v * env * trem * amp * gl;
    R[idx] += v * env * trem * amp * gr;
  }
}

function epBass(L, R, start, dur, nn, amp) {
  const f = midi(nn);
  const s0 = Math.floor(start * SR);
  const rel = 0.12;
  const len = Math.floor((dur + rel) * SR);
  for (let i = 0; i < len; i++) {
    const idx = s0 + i;
    if (idx < 0 || idx >= L.length) continue;
    const t = i / SR;
    let env = Math.min(1, t / 0.01) * (0.6 + 0.4 * Math.exp(-t / 0.15));
    if (t > dur) env *= Math.max(0, 1 - (t - dur) / rel);
    const v = Math.sin(2 * Math.PI * f * t) + 0.15 * Math.sin(2 * Math.PI * 2 * f * t);
    L[idx] += v * env * amp;
    R[idx] += v * env * amp;
  }
}

function bell(L, R, start, nn, amp, pan = 0) {
  addNote(L, R, start, 0.02, midi(nn), { amp, a: 0.002, rel: 1.2, decay: 0.5, pan });
  addNote(L, R, start, 0.02, midi(nn) * 2.76, { amp: amp * 0.25, a: 0.002, rel: 0.4, decay: 0.12, pan });
}

function rim() {
  const n = Math.floor(0.08 * SR);
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    b[i] = (Math.sin(2 * Math.PI * 1700 * t) * 0.6 + noise() * 0.4) * Math.exp(-t / 0.012);
  }
  return highpass(b, 600);
}

function shaker() {
  const n = Math.floor(0.09 * SR);
  const b = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    b[i] = noise() * Math.min(1, t / 0.01) * Math.exp(-t / 0.03);
  }
  return lowpass(highpass(b, 5000), 11000);
}

// Small Schroeder reverb: four combs into two allpasses per channel.
function reverb(L, R, wet) {
  const run = (x, offs) => {
    const out = new Float32Array(x.length);
    for (const [d, g] of [
      [1557, 0.78],
      [1617, 0.77],
      [1491, 0.79],
      [1422, 0.8],
    ]) {
      const dl = d + offs;
      const buf = new Float32Array(dl);
      let p = 0;
      let lp = 0;
      for (let i = 0; i < x.length; i++) {
        const y = buf[p];
        lp = y * 0.6 + lp * 0.4; // damping
        buf[p] = x[i] + lp * g;
        out[i] += y * 0.25;
        p = (p + 1) % dl;
      }
    }
    for (const d of [225 + offs, 556 + offs]) {
      const buf = new Float32Array(d);
      let p = 0;
      for (let i = 0; i < out.length; i++) {
        const b = buf[p];
        const y = -out[i] * 0.5 + b;
        buf[p] = out[i] + b * 0.5;
        out[i] = y;
        p = (p + 1) % d;
      }
    }
    return out;
  };
  const wl = run(L, 0);
  const wr = run(R, 23);
  for (let i = 0; i < L.length; i++) {
    L[i] = L[i] * (1 - wet) + wl[i] * wet * 1.6;
    R[i] = R[i] * (1 - wet) + wr[i] * wet * 1.6;
  }
}

// ---------- music ----------

// `logo` is when the product first appears (the mood turns from problem to
// solution) and `outro` when the closing scene starts, both in seconds, read
// off the composition timeline after transitions are subtracted.
function music(file, { dur, logo, outro }) {
  const DUR = dur;
  const n = Math.floor(DUR * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  const BEAT = 0.5; // 120 BPM
  const BAR = 4 * BEAT;

  // Soft and warm rather than electronic: electric piano, round sine bass,
  // brushed percussion, all through a small room reverb. Kept sparse so it
  // sits under the sound effects (and a narrator later) without competing.

  // A — the problem (0–17s): Am7 Fmaj7 Dm7 E7, slow and a little uneasy.
  const A = [
    [57, 60, 64, 67],
    [53, 57, 60, 64],
    [50, 53, 57, 60],
    [52, 56, 59, 62],
  ];
  for (let bar = 0; bar < 8; bar++) {
    const t0 = 1.0 + bar * BAR;
    if (t0 >= logo - 0.4) break;
    const chord = A[bar % 4];
    // A slow strum, low to high.
    chord.forEach((nn, k) => epiano(L, R, t0 + k * 0.03, BAR * 0.95, nn, 0.075, k % 2 ? 0.25 : -0.25));
    // Bass on beats 1 and 3, sustained and round.
    epBass(L, R, t0, BEAT * 1.8, chord[0] - 24, 0.2);
    epBass(L, R, t0 + 2 * BEAT, BEAT * 1.8, chord[0] - 24, 0.15);
  }
  // A quiet pulse, like a clock in the next room.
  for (let t = 1; t < logo - 0.5; t += BEAT) addBuffer(L, R, t, rim(), 0.05, 0.4);

  // Swell into the logo (the last 1.5s before it): a soft, rising, filtered breath.
  {
    const len = Math.floor(1.5 * SR);
    const b = new Float32Array(len);
    for (let i = 0; i < len; i++) b[i] = noise() * (i / len) ** 3;
    lowpass(b, (t) => 200 + 2500 * (t / 1.5) ** 2);
    addBuffer(L, R, logo - 1.5, b, 0.18);
  }

  // B — the product (logo to outro): Cmaj7 G6 Am7 Fmaj7, light and moving.
  const B = [
    [60, 64, 67, 71],
    [55, 59, 62, 64],
    [57, 60, 64, 67],
    [53, 57, 60, 64],
  ];
  const K = kick();
  const startB = logo;
  const endB = outro;
  for (let bar = 0; ; bar++) {
    const t0 = startB + bar * BAR;
    if (t0 >= endB) break;
    const chord = B[bar % 4];
    // Piano comping: a chord on 1, a lighter push on the "and" of 2.
    chord.forEach((nn, k) => epiano(L, R, t0 + k * 0.02, BEAT * 1.4, nn, 0.1, k % 2 ? 0.25 : -0.25));
    chord.forEach((nn, k) => {
      if (t0 + 1.5 * BEAT < endB) epiano(L, R, t0 + 1.5 * BEAT + k * 0.015, BEAT * 2.2, nn, 0.06, k % 2 ? 0.25 : -0.25);
    });
    for (let beat = 0; beat < 4; beat++) {
      const t = t0 + beat * BEAT;
      if (t >= endB) break;
      if (beat === 0 || beat === 2) addBuffer(L, R, t, K, 0.32);
      if (beat === 1 || beat === 3) addBuffer(L, R, t, rim(), 0.16, 0.15);
      // Shaker on every eighth, accent on the offbeat.
      addBuffer(L, R, t, shaker(), 0.05, -0.3);
      addBuffer(L, R, t + BEAT / 2, shaker(), 0.08, -0.3);
    }
    // Walking-ish bass: root, fifth, root, approach.
    const r = chord[0] - 24;
    [r, r + 7, r + 12, r + 7].forEach((nn, k) => {
      const t = t0 + k * BEAT;
      if (t < endB) epBass(L, R, t, BEAT * 0.85, nn, 0.24);
    });
    // Every other bar, a short bell motif on top.
    if (bar % 2 === 1) {
      [chord[3] + 12, chord[2] + 12, chord[1] + 12].forEach((nn, k) => {
        const t = t0 + 2 * BEAT + k * (BEAT / 2);
        if (t < endB) bell(L, R, t, nn, 0.045, k % 2 ? 0.4 : -0.4);
      });
    }
  }

  // Outro: Fmaj7 to Cmaj9, held, then fade.
  [53, 57, 60, 64].forEach((nn, k) => epiano(L, R, outro + k * 0.04, 1.6, nn, 0.12, k % 2 ? 0.3 : -0.3));
  [48, 55, 62, 64, 67, 71].forEach((nn, k) => epiano(L, R, outro + 2 + k * 0.05, 4.5, nn, 0.11, k % 2 ? 0.3 : -0.3));
  epBass(L, R, outro + 2, 4.5, 36, 0.28);
  bell(L, R, outro + 2.2, 79, 0.05, 0.3);

  // Room reverb on the whole bed, then a gentle top-end roll-off.
  reverb(L, R, 0.22);
  lowpass(L, 9000);
  lowpass(R, 9000);
  writeWav(file, L, R);
}

// ---------- sound effects ----------

function sfx(name, dur, fn) {
  const n = Math.floor(dur * SR);
  const L = new Float32Array(n);
  const R = new Float32Array(n);
  fn(L, R, n);
  writeWav(name, L, R);
}

function main() {
  const args = process.argv.slice(2);
  const arg = (k) => {
    const i = args.indexOf(`--${k}`);
    return i >= 0 ? args[i + 1] : undefined;
  };
  if (!args.includes("--sfx-only")) {
    const dur = Number(arg("dur"));
    const lift = Number(arg("lift"));
    const outro = Number(arg("outro"));
    if (!dur || !lift || !outro) {
      console.error("usage: make-audio.mjs --file music.wav --dur <s> --lift <s> --outro <s>  |  --sfx-only");
      process.exit(1);
    }
    music(arg("file") ?? "music.wav", { dur, logo: lift, outro });
  }

  // Whoosh: noise through a lowpass that sweeps up then down.
  sfx("whoosh.wav", 0.6, (L, R, n) => {
    const b = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const t = i / n;
      b[i] = noise() * Math.sin(Math.PI * t) ** 2;
    }
    lowpass(b, (t) => 250 + 1600 * Math.sin((Math.PI * t) / 0.6));
    for (let i = 0; i < n; i++) {
      const p = i / n; // pan left to right
      L[i] = b[i] * (1 - p * 0.6);
      R[i] = b[i] * (0.4 + p * 0.6);
    }
  });

  // Click: a short tick for taps and buttons.
  sfx("click.wav", 0.08, (L, R, n) => {
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      const v = Math.sin(2 * Math.PI * 2200 * t) * Math.exp(-t / 0.006) + noise() * Math.exp(-t / 0.002) * 0.5;
      L[i] = R[i] = v;
    }
  });

  // Tick: softer, higher, for fields filling and rows appearing.
  sfx("tick.wav", 0.06, (L, R, n) => {
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      L[i] = R[i] = Math.sin(2 * Math.PI * 3400 * t) * Math.exp(-t / 0.012);
    }
  });

  // Shutter: two mechanical clicks with a burst of noise between.
  sfx("shutter.wav", 0.25, (L, R, n) => {
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      let v = 0;
      for (const o of [0, 0.075]) if (t >= o) v += noise() * Math.exp(-(t - o) / 0.012);
      v += Math.sin(2 * Math.PI * 900 * t) * Math.exp(-t / 0.02) * 0.4;
      L[i] = R[i] = v;
    }
    highpass(L, 400);
    highpass(R, 400);
  });

  // Pop: a bubbly pitch drop for things that spring in.
  sfx("pop.wav", 0.15, (L, R, n) => {
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      ph += (300 + 900 * Math.exp(-t / 0.02)) / SR;
      L[i] = R[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t / 0.04);
    }
  });

  // Success: two rising bell tones (a fifth).
  sfx("success.wav", 1.0, (L, R) => {
    addNote(L, R, 0, 0.05, midi(79), { amp: 0.5, a: 0.002, rel: 0.9, decay: 0.35 });
    addNote(L, R, 0, 0.05, midi(91), { amp: 0.12, a: 0.002, rel: 0.6, decay: 0.15 });
    addNote(L, R, 0.11, 0.05, midi(86), { amp: 0.5, a: 0.002, rel: 0.9, decay: 0.45 });
    addNote(L, R, 0.11, 0.05, midi(98), { amp: 0.12, a: 0.002, rel: 0.6, decay: 0.18 });
  });

  // Negative: a soft descending minor third on a mallet tone, with a low
  // thump under it. Reads as "that's not good" without sounding like an error.
  sfx("negative.wav", 1.2, (L, R) => {
    for (const [t, nn] of [
      [0, 67],
      [0.16, 63],
    ]) {
      addNote(L, R, t, 0.03, midi(nn), { amp: 0.5, a: 0.004, rel: 0.7, decay: 0.32 });
      addNote(L, R, t, 0.03, midi(nn + 24), { amp: 0.08, a: 0.002, rel: 0.2, decay: 0.05 });
      addNote(L, R, t, 0.03, midi(nn - 12), { amp: 0.18, a: 0.006, rel: 0.6, decay: 0.3 });
    }
    lowpass(L, 3000);
    lowpass(R, 3000);
  });

  // Shimmer: a soft upward sparkle for the logo and the outro.
  sfx("shimmer.wav", 1.4, (L, R) => {
    [72, 76, 79, 84, 88].forEach((nn, k) =>
      addNote(L, R, k * 0.06, 0.05, midi(nn), { amp: 0.25, a: 0.003, rel: 1.1, decay: 0.5, pan: k % 2 ? 0.5 : -0.5 }),
    );
  });

  // Stamp: a dull thump for the "Signed" stamp.
  sfx("stamp.wav", 0.3, (L, R, n) => {
    let ph = 0;
    for (let i = 0; i < n; i++) {
      const t = i / SR;
      ph += (70 + 140 * Math.exp(-t / 0.02)) / SR;
      L[i] = R[i] = Math.sin(2 * Math.PI * ph) * Math.exp(-t / 0.07) + noise() * Math.exp(-t / 0.01) * 0.4;
    }
  });
}

main();

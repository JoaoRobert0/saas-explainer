# Sound, render and delivery

## Music and effects (original, license-free)

`scripts/make-audio.mjs` synthesizes everything — no samples, no licenses.

```bash
# effects only (whoosh, click, tick, shutter, pop, success, negative, shimmer, stamp)
node scripts/make-audio.mjs --sfx-only
# a music bed timed to a composition: total length + 1.5s, when the product
# first appears (mood lifts), when the closing scene starts
node scripts/make-audio.mjs --file music.wav --dur 76.5 --lift 17 --outro 68
```

Read `--lift` and `--outro` off the composition: sum the scene durations up to
that scene and subtract the transitions before it. Re-run whenever scene
lengths change.

Mixing that worked (values for `<Audio volume>`):

| Sound | Volume | Where |
|---|---|---|
| Music bed | 0.2, fading in/out over 0.5s/1.5s | main composition |
| whoosh (cards, windows entering) | 0.16 | scene start, panels |
| tick (fields filling, rows, cells) | 0.22–0.3 | each fill |
| click (buttons, taps) | 0.5 | each click |
| pop (badges, toasts) | 0.25–0.28 | each pop |
| success (saved, matched) | 0.45–0.5 | each win |
| negative (over budget, error) | 0.3 | bad news — soft, never an error buzz |
| shimmer (logo) | 0.55 | brand reveal |

Users found loud card whooshes and a buzzer-style "negative" sound
unpleasant; keep both soft. If the user dislikes the synthesized music, offer a
licensed track they provide and keep the effects.

## Render and loudness

```bash
bash scripts/finalize.sh                       # Explainer  -> out/explainer.mp4
bash scripts/finalize.sh ExplainerShort short  # vertical   -> out/short.mp4
```

It renders, measures integrated loudness, applies **one static gain** to reach
about −16 LUFS, limits peaks, and writes a faststart MP4.

- Do **not** use ffmpeg `loudnorm` in its default (dynamic) mode: it pumps the
  volume in the first seconds and users hear it as "the sound is buggy".
- After AAC encoding, check the true peak stays below 0 dBFS
  (`ffmpeg -i out.mp4 -af ebur128=peak=true -f null -`); lower the limiter if
  not.
- You cannot listen. Verify with numbers (loudness per section, peaks, no
  silent gaps) and say so; let the user judge the sound.

If the user says there is no sound, measure per-channel RMS over time before
changing anything — usually the file is fine and the player is muted.

## Delivery

- Files for the web: `-movflags +faststart` (already in finalize.sh) plus a
  poster frame:
  `ffmpeg -ss 20 -i out/explainer.mp4 -frames:v 1 -q:v 3 out/poster.jpg`
- Hosting on a CDN (e.g. Cloudflare R2 + a custom domain such as
  `media.example.com`): creating buckets and domains changes shared
  infrastructure — confirm with the user first. R2 must be enabled once in the
  Cloudflare dashboard (a payment method is required even on the free tier);
  that cannot be done from the CLI.
- Autoplay on a landing page is muted: the on-screen text has to work alone.

## Narration (later, optional)

Write one narration line per scene from the approved script (~2.5 words/s,
each line starting on its scene's first beat). Generate per-scene audio with
the TTS the user chose (their API key in an env var, never in code), place
each clip at its scene start, and lower the music under speech. If a clip runs
longer than its scene, lengthen the scene, not the speech.

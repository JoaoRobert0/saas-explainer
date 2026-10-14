# Building the scenes

Load the `remotion-best-practices` skill (and through it `remotion-markup`,
`remotion-interactivity`, `remotion-render`) before writing scene code. This
file adds what is specific to product explainers.

## Recreate screens, don't screenshot them

Rebuild each product screen as React components with fictional data, copying
the real layout, labels, colors and fonts from the product's source. Every
row, number and button is then animatable (fields fill one by one, rows
stagger in, a total counts up) and stays sharp at any resolution. Screenshots
only allow zooming a flat image.

Find the real screen first (the page component in the repo), read its markup,
and mirror it: same headings, same field order, same button text, same status
pill colors.

## Scene anatomy

See `template/src/scenes/ExampleScene.tsx`. Each scene:

- is its own file, wrapped with `Interactive.withSchema` so its headline text
  is editable in Studio, and registered as its own `<Composition>` in a
  "Scenes" folder so it can be previewed alone;
- starts with `<Backdrop>`;
- has one or two `TopHeadline` beats (or a left-hand copy column for phone
  scenes);
- shows the product in `<Browser>` (desktop) or `<Phone>` (mobile), entering
  with a spring;
- times everything in seconds × `fps`, with beats ~0.25–0.4s apart for lists
  and ~1s between story steps;
- ends on a visible result and holds it ~1.5s before the cut;
- places its sound effects as `<Audio>` at the beat they belong to.

The main composition chains the scenes with `TransitionSeries` (fade 15
frames; slide 18 frames between device changes). Its duration is the sum of
scene durations minus the transitions.

## Layout rules

- Safe area: keep text ≥80px from the sides, ≥100px from top/bottom (1080p).
- Headlines 84–110px, supporting text ≥44px. Text inside the recreated UI can
  be smaller (18–26px) because the headline carries the message.
- Put headlines above overlays (`zIndex`) so a dimming layer never greys them.
- Don't let a toast or popover cover the number the scene is about.
- A phone scene: copy column left, phone right; vertical: copy on top, phone
  below.

## Effects that read as "After Effects"

- Camera push: scale + translate a whole rig toward the part being filled,
  then pull back for the result.
- 3D tilt: `perspective(...) rotateY(...)` on the phone or window.
- Fields: flash the border and background in the accent color as each fills.
- Counting numbers, stamps that spring in, a check mark drawn with
  `strokeDashoffset`, a shine sweeping across the CTA.
- Scrambling digits for "unknown" values: keep them crisp (no blur — blur
  reads as low resolution) and inside a plausible range.

## Verify every scene before moving on

Render stills at the key beats and look at them:

```bash
npx remotion still <SceneId> /tmp/frames/s-120.png --frame=120 --scale=0.5
```

Check overlaps, cut-off text, contrast, and that the cursor lands on the
button. **Cursor coordinates are window coordinates; measure them from a
rendered still**, then fix and re-render. Tile several stills into one image
with ffmpeg `hstack`/`vstack` to review a whole scene at once.

Show the user one finished scene (proof of concept) before building the rest.

## Vertical version from the same code

Read `const { width, height } = useVideoConfig(); const vertical = height > width;`
inside each scene and branch the layout: headlines lower and larger and
allowed to wrap, copy stacked above the visual, the browser window 1000px wide
(don't shrink text — let columns adapt), phones centered. A separate
composition at 1080×1920 chains only the scenes for the short cut. Check that
the horizontal version is unchanged after every vertical edit.

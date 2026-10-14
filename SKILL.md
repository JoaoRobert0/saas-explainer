---
name: saas-explainer
description: Make an animated explainer or product demo video for a software product (SaaS, web or mobile app) with Remotion — interviews the user, writes a scene-by-scene script for approval, then builds motion-graphics scenes that recreate the product's real screens, with original music and sound effects, a horizontal version and a vertical short cut. Use when the user asks for an explainer video, product demo video, promo/launch video, landing-page video, "vídeo explicativo", or a Reels/Shorts/TikTok video about their software.
---

# SaaS explainer video

You are directing and building a product explainer: a short motion-graphics
video that shows what a piece of software does, using recreations of its real
screens. Work in this order and do not skip the approval gates (marked ⛔).

Talk to the user in their language. Write on-screen copy in the language of
the video's audience.

## 0. Setup (once per machine, then once per video)

1. Check the Remotion skills are installed:
   `ls ~/.claude/skills | grep -c remotion` (expect 10+).
   If missing, install them:
   ```bash
   npx skills add remotion-dev/skills -g -a claude-code -y
   ```
   If your sandbox blocks it, ask the user to run it themselves by typing
   `! npx skills add remotion-dev/skills -g -a claude-code -y` in the prompt.
   Check Node 18+ and ffmpeg (`node -v`, `ffmpeg -version`).
2. Load the `remotion-best-practices` skill before writing any Remotion code;
   follow it (and the `remotion-create`, `remotion-markup`,
   `remotion-interactivity`, `remotion-render` skills it routes to).

## 1. Discovery ⛔

First ask **which repository (or repositories) holds the product** — a local
path or a Git URL — even if the current folder looks like one; confirm what
you will read before reading it. Then ask the rest of the questions in
[references/questions.md](references/questions.md), in rounds of at most 3–4,
skipping anything you can find out yourself. Study the product from that repo
(pages/screens, components, styles, labels), or from its live
site/screenshots if there is no repo. Collect the brand colors, font and
logo.

## 2. Script ⛔

Follow [references/script-format.md](references/script-format.md):
verify every feature claim against the product, then present the script as a
table (scene, on-screen text, what happens, duration) plus the decisions and
corrections below it. **Wait for an explicit "yes" before building.** Revise
the table, not code.

## 3. Scaffold

Create the project **outside the product's repo** (never inside it, never
committed to it; a sibling folder), named
after the product, e.g. `<product>-explainer`:

```bash
npx create-video@latest --yes --blank --no-tailwind <product>-explainer
cd <product>-explainer && npm i
npx remotion add @remotion/google-fonts @remotion/transitions @remotion/media
```

Copy this skill's starter files into it. `SKILL_DIR` is this skill's base
directory (shown when the skill loads; usually `~/.claude/skills/saas-explainer`):

```bash
cp -r "$SKILL_DIR/template/src/." src/
mkdir -p scripts && cp "$SKILL_DIR/scripts/"* scripts/
node scripts/make-audio.mjs --sfx-only
```

Then:
- set the brand tokens in `src/theme.ts` from the product (not the
  placeholders);
- put the logo (SVG preferred) in `public/` and use it via `<Wordmark logoSrc>`;
- create `src/data.ts` with one fictional customer/project and numbers that
  stay consistent across scenes;
- start Remotion Studio in the background (`npx remotion studio`) and give the
  user the URL so they can watch it build.

## 4. Build ⛔ (proof of concept first)

Follow [references/craft.md](references/craft.md). Use
`template/src/scenes/ExampleScene.tsx` as the pattern for every scene.

1. Build **one** feature scene first, render key stills, check them, render
   it to MP4, and show the user. Adjust style with them before continuing.
2. Build the remaining scenes one by one. After each: typecheck
   (`npx tsc --noEmit`), render stills at the key beats, look at them, fix
   overlaps, contrast and cursor positions.
3. Chain them in a main `Explainer` composition with `TransitionSeries`;
   register each scene as its own composition too.

## 5. Sound and render

Follow [references/audio-and-delivery.md](references/audio-and-delivery.md):
generate the music for the final timeline, place the effects, render with
`bash scripts/finalize.sh`, check loudness and peaks with numbers. You cannot
listen: say what you measured and let the user judge.

## 6. Variants and delivery

- Vertical short (if asked): same scenes, orientation-aware layouts, a
  1080×1920 `ExplainerShort` composition with only the strongest scenes, its
  own music file, `bash scripts/finalize.sh ExplainerShort short`.
- Web delivery: faststart MP4 + poster JPG. Hosting on a CDN or any change to
  shared infrastructure needs the user's confirmation first.

## Report back

After each milestone, tell the user: where the file is, what each scene does
(briefly), what you verified, what is fictional, and the decisions they may
want to change. Keep it short.

## Rules

- Never put real customer data (names, emails, amounts) on screen — not even
  from a staging database. Everything shown is invented and consistent.
- Never claim a feature the product does not have; check the code.
- Never use copyrighted music or sound you did not generate unless the user
  supplies it with a license.
- Never publish, push, or deploy anything without asking.
- Remotion is free for individuals and companies of up to 3 people; larger
  companies need a license (remotion.pro). Mention it once.

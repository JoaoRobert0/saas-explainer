# saas-explainer — a Claude Code skill

Makes an animated explainer / product-demo video for any software product with
[Remotion](https://www.remotion.dev): Claude interviews you, writes a
scene-by-scene script for your approval, then builds motion-graphics scenes
that recreate your product's real screens, adds original music and sound
effects, and renders a horizontal video plus an optional vertical short.

## Install

```bash
# 1. this skill
git clone git@github.com:JoaoRobert0/saas-explainer.git ~/.claude/skills/saas-explainer

# 2. the official Remotion skills it builds on (Claude will also offer to do this)
npx skills add remotion-dev/skills -g -a claude-code -y
```

Update later with `git -C ~/.claude/skills/saas-explainer pull`.

Needs Node 18+ and ffmpeg. Restart Claude Code, then ask, from the folder of
the product you want to show:

> Make an explainer video for this product.

Claude will ask about the audience, format, features and call to action, show
you a script table, and only build after you approve it.

## What's inside

```
SKILL.md                      the workflow Claude follows
references/
  questions.md                discovery questions before the script
  script-format.md            how the script table is written and checked
  craft.md                    scene anatomy, layout, effects, verification
  audio-and-delivery.md       music, effects, loudness, export, CDN, narration
scripts/
  make-audio.mjs              synthesizes original music + UI sound effects
  finalize.sh                 render + web loudness (-16 LUFS) + faststart
template/src/
  theme.ts                    brand tokens (replaced per product)
  ui/                         Backdrop, Browser, Phone, Cursor, TopHeadline,
                              Wordmark, animation helpers
  scenes/ExampleScene.tsx     the pattern every scene follows
```

## Typical output

- `out/explainer.mp4` — 1920×1080, 60–100s
- `out/short.mp4` — 1080×1920, 30–50s (optional)
- poster frames for web embeds

Remotion is free for individuals and teams of up to 3; larger companies need a
[Remotion license](https://remotion.pro).

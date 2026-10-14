#!/usr/bin/env bash
# Renders a composition and sets its loudness for the web (about -16 LUFS,
# static gain plus a limiter, never loudnorm's dynamic mode, which pumps the
# first seconds). Copies the video stream untouched and moves the index to the
# front (faststart) so the file plays while it downloads.
#   bash scripts/finalize.sh                        ->  out/explainer.mp4
#   bash scripts/finalize.sh ExplainerShort short   ->  out/short.mp4
set -euo pipefail
cd "$(dirname "$0")/.."
COMP=${1:-Explainer}
NAME=${2:-explainer}
DRAFT=out/$COMP-draft.mp4
npx remotion render "$COMP" "$DRAFT"
# One static gain for the whole file, then a peak limiter. (loudnorm's dynamic
# mode pumped the first seconds, so the level is set by hand instead.)
I=$(ffmpeg -hide_banner -i "$DRAFT" -af ebur128 -f null - 2>&1 | awk '/Summary/{s=1} s&&/ I:/{print $2; exit}')
GAIN=$(python3 -c "print(round(-16 - ($I), 2))")
echo "measured ${I} LUFS, applying ${GAIN} dB"
ffmpeg -hide_banner -y -loglevel error -i "$DRAFT" -c:v copy \
  -af "volume=${GAIN}dB,alimiter=limit=0.78:level=false:attack=1:release=50" \
  -c:a aac -b:a 192k -ar 48000 -movflags +faststart "out/$NAME.mp4"
echo "out/$NAME.mp4"

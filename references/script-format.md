# The script

Write the script as a table and get the user's explicit approval before
building anything. Revise the table, not the code, until they say yes.

## Before writing it: verify every claim against the product

Each feature scene shows a real screen doing a real thing. Before a line goes
in the script, find the screen in the code and check:

- the feature exists and works the way the line says (a draft once promised
  budgets "per stage" when the product only had them "per category"; reading
  the code caught it before anything was built);
- the exact on-screen labels, button texts, statuses and column names;
- where the screen lives (which tab/stage), so the recreated screen matches.

If the product has no repo, work from screenshots or a live demo and list
anything you could not verify. Flag every mismatch to the user before
building.

## Table format

| # | Scene | On-screen text | What happens on screen | Duration |
|---|---|---|---|---|
| 1 | Hook | *"<the viewer's moment of doubt, as a question>"* | One concrete object from their world (a deal, an invoice, a schedule) with the unknown part animated | 8s |
| 2 | Problem | *"<where the work lives today>"* → *"<what it costs them>"* | Two or three "today" panels (spreadsheet, inbox, paper), then the consequence | 10s |
| 3 | Reveal | *"<one-line promise>"* | Logo lands, the product's main screen rises underneath | 7s |
| 4 | Feature A | *headline beat 1* → *beat 2* | Step by step: what the cursor clicks, what fills in, what the result is | 12s |
| … | | | | |
| N | Close | *"<promise>."* + CTA button | Logo, promise, CTA with the link | 7s |

Below the table, list:

- total length (subtract ~0.5s per transition);
- decisions you made that the user may want to change (order, device, which
  edge case to show);
- anything fictional on screen the user should eyeball (names, numbers);
- corrections found while verifying against the code.

## Writing the on-screen text

- Short, spoken-sounding lines in the viewer's words, not the developer's.
  "Snap the receipt." beats "Upload an image for OCR extraction."
- One idea per line. A feature scene gets one or two headline beats.
- The text must carry the story with the sound off (most autoplay is muted).
- Pacing: ~2.5 words per second if a narrator will read it later; on-screen
  text can be shorter than that.

## Structure that works

1. **Hook** (6–8s): the viewer's moment of doubt, as a question.
2. **Problem** (8–10s): where the work lives today, then the cost of it.
3. **Reveal** (4–7s): logo + one-line promise + the product's home screen.
4. **Features** (10–14s each): in the order the work happens; each ends on a
   visible result (a green check, a total, a status change, a saved toast).
5. **Close** (6–7s): logo, the promise again, CTA button with the URL.

For a vertical short: hook → reveal → the 2–3 strongest features → close.

## Keep the data consistent

Invent one fictional customer/project and carry it through every scene: the
same names, and numbers that add up from scene to scene (what was counted is
what was quoted, ordered, delivered, invoiced). Keep it in `src/data.ts` and
import it, so a change propagates.

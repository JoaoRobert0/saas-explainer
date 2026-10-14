# Discovery questions

Ask these before writing a script. Use the AskUserQuestion tool where the
answer is a choice (2–4 options, recommended option first and marked
"(Recommended)"); ask open questions in plain text. Ask in rounds of at most 3–4
questions, most important first, and skip anything the user already answered
or that you can find yourself in the product's code, site or docs.

Talk to the user in their language; write the on-screen copy in the language of
the video's audience.

## Round 1 — the essentials (always ask)

1. **Which repository holds the product?** Always ask, even when the current
   folder is a repo — never assume it is the right one.
   - Accept a local path or a GitHub/GitLab URL. For a URL, ask before
     cloning and clone it into a temporary folder outside the explainer
     project (read-only; never commit to it).
   - If the product is split (frontend, backend, mobile app, marketing site),
     ask which repos to read and which one has the screens to show. The
     screens, labels, colors and logo come from the frontend.
   - If there is no repo, ask for the live URL, a demo account, screenshots,
     or a description, and tell the user the recreated screens will be less
     exact.
   Once you have it, confirm in one line what you will read (e.g. "I'll read
   `web/src/pages` and `web/src/index.css` in `~/code/acme-app`").
2. **Who is watching?**
   Role and industry, in their words (e.g. "owners of small service
   companies", "finance managers at mid-size agencies"). This sets the
   vocabulary of every line.
3. **Where will the video live?** → sets format and length
   - Landing page / sales: horizontal 16:9, 60–100s
   - Social (Reels, Shorts, TikTok): vertical 9:16, 30–50s
   - Both: build horizontal first, then a vertical short cut from the same code
4. **What is the one thing the viewer should do after watching?**
   The call to action and its link (sign up, book a demo, visit a URL).

## Round 2 — the story

5. **What problem does the viewer have before the product?**
   The pain, concretely: where the work lives today (spreadsheets, paper,
   email, WhatsApp), and what it costs them (money, time, mistakes).
6. **Which features must appear, and which are the strongest?**
   Offer the list you found in the code and let the user pick. Aim for 3–5 in
   a long video, 2–3 in a short one. One scene per feature.
7. **Is there a natural order to the work?**
   Telling the features in the order the user actually does them (plan →
   do → check → report) reads better than a feature list.

## Round 3 — look and sound

8. **Brand:** colors, font, logo file. Read them from the product's CSS /
   Tailwind config / assets first and only ask to confirm.
9. **Phone, desktop, or both?** Show each feature on the device it is really
   used on (field work on a phone, office work on desktop).
10. **Sound:**
    - Music: synthesized original bed (free, no license questions) or a
      licensed track the user provides (Artlist, Epidemic, Pixabay Music).
      Keep it quiet under the effects.
    - Sound effects on taps, fills and transitions: yes/no.
    - Narration: none, AI voice (ElevenLabs, OpenAI TTS, Gemini TTS — needs
      the user's API key; check the plan allows commercial use), or the
      user's own recording. Narration can be added later; on-screen text must
      tell the story without it.
11. **Data on screen:** confirm that all names, numbers, emails and companies
    will be fictional. Never copy real customer data into the video, even
    from a dev/staging database.

## Defaults when the user says "you decide"

- Horizontal 1920×1080, 30 fps, ~75s; then offer a vertical short.
- Problem (2 scenes) → product reveal (1) → 3–5 feature scenes → close (1).
- Synthesized quiet music + subtle effects, no narration.
- Inter font, colors from the product.

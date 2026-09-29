# Project guide - Aventura Espanol

A single-file Spanish-learning PWA. Everything is `index.html` (vanilla JS/CSS,
no build step, no framework). It deploys to GitHub Pages automatically on push
to `main`.

## Hard rule: reuse, don't reinvent (DRY)

**Write shared logic once and call it. Never copy-paste a pattern into a second
place.** Before writing any code, search `index.html` for an existing helper
that already does it. If the same logic would live in two places, extract one
function/helper and have both call it. If you must add a new cross-cutting
helper, put it next to the related ones and route all callers through it.

This is a firm requirement, not a preference. Duplicated logic silently drifts
apart (that is how the microphone ended up behaving differently in every
exercise). A bug fix must land in exactly one place.

When you touch a feature and notice it duplicates an existing pattern,
consolidate it as part of the change.

## Shared helpers - use these, don't hand-roll equivalents

- **Speech output (TTS):** `speak(text, lang?, rate?, onend?, onboundary?)` -
  the only way to speak. Respects Silent mode and voice warm-up.
- **Speech input (mic):** `listenOnce({ status, micBtn, onFinal, ... })` and
  `stopListening()` - the only way to use the microphone. `onFinal(alts)`
  receives the transcript alternatives; do the site-specific matching there.
- **AI request:** `aiFetch(body)` - the only place with the Anthropic endpoint
  + headers. Build the body, call `aiFetch`, handle the response.
- **AI JSON reply:** `parseAiJson(text)` - extract a JSON object/array from a
  model reply (tolerates prose/code fences). Returns `null` if unparseable.
- **Leaving an exercise:** `goHome()` - stop mic + speech, show home. Use for
  plain "quit to menu" buttons (screens with extra cleanup keep custom ones).
- **Selectable chip rows:** `chipRow(container, items, { label, selected,
  onPick, className? })` - for any row of `sc-chip` toggle buttons.
- **Persistence:** `lsGet/lsSet/lsGetJSON/lsSetJSON(key, default)` - the only
  way to touch `localStorage` (they never throw and give defaults).
- **Word data:** `emojiFor(word)` (picture), `glossFor(word)` / `richGloss(word)`
  (meaning, with verb tense/person), `cleanWord`, `stripArticle`,
  `conjugationInfo`. Words live in `VOCAB`; example sentences in `SENTENCES`;
  learned meanings in `USER_GLOSS` / `WORD_GLOSS`; pictures in `WORD_EMOJI`.
- **Review pager:** `makeRev(backId,nextId)` + `revReset/revPush/revShow/revNext/revBack` - the shared "Back to review earlier steps" controller for every sequential exercise (daily practice, free play, Listening, Scramble, conjugation, tense). Each step registers a restore() closure.
- **Screens:** `show(screenId)` toggles the fixed list of screen <div>s.
- **SRS:** `creditReview`, `schedule`, `buildSession`, `saveStore`.

## Content conventions

- Colombian Spanish by default (region is switchable). Every VOCAB word needs a
  real emoji (never the placeholder note icon) AND an example sentence in
  `SENTENCES`. Every word appearing in a sentence must be glossable - after
  adding content, audit that `emojiFor`/`glossFor` cover it (zero placeholders,
  zero undefined words).

## Definition of done

1. Verify the change in the browser (open `index.html`), exercising the real
   feature - not just that it "looks right." Prefer the in-app browser tools.
2. Check the console: **zero errors**.
3. Commit with a clear message and push (this deploys to GitHub Pages).

# Clavia brand and motion: hand-off

Open **preview.html** in a browser to see every file and state live.
Everything here is generated from the app's source (`clavia/handoff-build.mjs`), so it matches what ships.

## What's in the folder
| Folder | What it is |
|---|---|
| `svg/` | The quill mark, static: on light, on forest, the app icon / favicon, and the lockup (mark + "Clavia") on light and on forest. |
| `animated/` | Each animated state as one self-contained SVG with its CSS inside. Drop into an `<img>` or inline. `*-loop.svg` repeats the one-off states so they can be reviewed. |
| `source/` | `quill.js` + `quill.css`: the production implementation. Use these in the app. |
| `motion/` | `tokens.css` (easings and durations), `keyframes.css` (all 71 app animations), `MOTION.md` (each one, where it is used, and its timing). |

## The quill mark
Drawn in a 48×48 box: one quadratic curve for the shaft, barbs grown off it on both sides, a gold nib with its slit.

**Five states, one API:**
```js
const q = quillEl('greet', { tone: 'rail', then: 'static' }); // tone: 'paper' (light) | 'rail' (forest)
container.append(q);
quillState(q, 'work');   // switch state later
```
| State | What it does | Timing | Where the app uses it |
|---|---|---|---|
| `static` | The mark, still | n/a | Most places |
| `idle` | The feather sways, resting in an inkwell | 5s, alternating, infinite | Waiting surfaces |
| `greet` | Rises into place, barbs unfurl one by one, signs a flourish | 2.8s, once, then settles to `then` | The rail brand when the app opens; Home |
| `work` | The nib writes a line of looping script; the feather never bends | 2.4s loop | Any time Clavia is working (chat, compare, reading a document) |
| `done` | Finishes the signature with a dot of ink | 1.4s, once | When a piece of work lands |

Easing: `cubic-bezier(.22,.8,.24,1)` for rise, unfurl and writing; `cubic-bezier(.34,1.4,.64,1)` for the settle; `cubic-bezier(.34,1.56,.64,1)` for the ink dot.
`prefers-reduced-motion: reduce` switches every quill animation off.

**Rules:** the silhouette never deforms; it moves flat (no 3D, no squash). Gold stays on the nib only.

## Wordmark
"Clavia" is set in **Cormorant Garamond SemiBold (600)**, 25px in a 86×28 box. In the lockup SVGs it is live text,
so outline it in your design tool before using it anywhere the font isn't loaded.

## Colours
| | On light | On forest |
|---|---|---|
| Barbs | `#0E5B45` | `#F1ECDF` |
| Shaft | `#093D2F` | `#D8D0BC` |
| Nib | `#B08A4E` | `#D4B173` |
| Ink | `#0E5B45` | `#F1ECDF` |
| Ground | `#FFFFFF` | `#0D1F16` |

## Product motion, in one paragraph
Hovers change colour only. Entrances use transform and opacity, 120–340ms, on `--ease`. Nothing shifts layout; rows slide rather than jump.
Loaders run 1.5–4s and are either a plain ring or the quill writing, with no step text under them. Full list in `motion/MOTION.md`.

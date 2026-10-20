# Clavia motion — every animation in the app

Generated from `src/*.css`. 71 keyframes. Tokens are in `tokens.css`, the keyframes themselves in `keyframes.css`.

## Rules the product follows
- Hovers change colour only; nothing moves on hover.
- Entrances use transform + opacity, 120–340ms, on `--ease` (cubic-bezier(.2,0,0,1)) or `--ease-out` (cubic-bezier(.16,1,.3,1)).
- No layout shift: things grow from where they are, rows slide rather than jump.
- Loaders take 1.5–4s and are a plain ring or the quill writing; no step text under them.
- `prefers-reduced-motion: reduce` turns the quill's animation off.

| Keyframes | File | Used on (selector) | Animation |
|---|---|---|---|
| `brRun` | styles.css | .rqp-ai.is-busy::after · .br-gen[data-busy="true"]::after | `brRun 1.25s var(--ease) infinite` |
| `cardIn` | artifacts.css | .deck-view | `cardIn 260ms var(--ease-out) backwards` |
| `cqDrift` | quill.css | .cq-s-work .cq-body | `cqDrift 2.4s ease-in-out infinite` |
| `cqDrop` | quill.css | .cq-s-done .cq-inkdot | `cqDrop .4s cubic-bezier(.34,1.56,.64,1) .9s both` |
| `cqFlourish` | quill.css | .cq-s-greet .cq-swash | `cqFlourish 2s cubic-bezier(.22,.8,.24,1) .75s both` |
| `cqGrow` | quill.css | .cq-s-greet .cq-qb | `cqGrow .5s cubic-bezier(.22,.8,.24,1) both` |
| `cqRise` | quill.css | .cq-s-greet .cq-body | `cqRise 1s cubic-bezier(.22,.8,.24,1) both` |
| `cqScrib` | quill.css | .cq-s-work .cq-pen | `cqScrib .28s ease-in-out infinite alternate` |
| `cqScribe` | quill.css | .cq-s-work .cq-cursive | `cqScribe 2.4s cubic-bezier(.22,.8,.24,1) infinite` |
| `cqSettle` | quill.css | .cq-s-done .cq-body | `cqSettle .8s cubic-bezier(.34,1.4,.64,1) both` |
| `cqSign` | quill.css | .cq-s-done .cq-swash | `cqSign 1s cubic-bezier(.22,.8,.24,1) both` |
| `cqSway` | quill.css | .cq-s-idle .cq-body | `cqSway 5s ease-in-out infinite alternate` |
| `cueIn` | styles.css | .hub-n · .cue-card.is-new | `cueIn .22s var(--ease-out) backwards · cueIn .38s var(--ease-out) backwards` |
| `cuePulse` | styles.css | .cue-live-dot · .cue-wait-dot | `cuePulse 2.4s var(--ease) infinite` |
| `cueSpin` | styles.css | .cue-spin | `cueSpin .8s linear infinite` |
| `ddIn` | styles.css | .cmt-pop · .dd-card | `ddIn 150ms var(--ease-out) backwards` |
| `fade` | styles.css | .aw | `fade 180ms var(--ease) backwards` |
| `fadeIn` | styles.css | .ver-banner · .mx-fchip | `fadeIn 200ms var(--ease-out) backwards · fadeIn 160ms var(--ease) backwards` |
| `jv-aifresh` | review.css | .jv-sbody.jv-fresh | `jv-aifresh .5s var(--ease)` |
| `jv-aiin` | review.css | .jv-aipill | `jv-aiin .26s var(--ease-out` |
| `jv-airewrite` | review.css | .jv-sbody.jv-rewriting | `jv-airewrite 1.1s var(--ease) infinite` |
| `jv-aishake` | review.css | .jv-aipill.jv-miss | `jv-aishake .36s var(--ease)` |
| `jv-fpop` | review.css | .jv-fpop | `jv-fpop .12s ease-out` |
| `jv-pslide` | review.css | .jv-pfill | `jv-pslide 1.3s ease-in-out infinite` |
| `jv-sdown` | review.css | .jv-sheet-wrap.jv-closing .jv-sheet | `jv-sdown .16s ease-in forwards` |
| `jv-sfade` | review.css | .jv-sheet-backdrop · .jv-sheet-wrap.jv-closing .jv-sheet-backdrop | `jv-sfade .16s ease-out · jv-sfade .16s ease-in reverse forwards` |
| `jv-spin` | review.css | .jv-spin · .jv-rowspin | `jv-spin .7s linear infinite · jv-spin .8s linear infinite` |
| `jv-sup` | review.css | .jv-sheet | `jv-sup .2s cubic-bezier(.2,.8,.2,1)` |
| `markSweep` | styles.css | .mark[data-busy="true"] circle | `markSweep 1500ms linear infinite` |
| `markUnfurl` | styles.css | .mark-run circle | `markUnfurl 1150ms var(--ease-out) backwards` |
| `menuIn` | composer.css | .doc-pop · .plusmenu.opening | `menuIn 140ms var(--ease) backwards · menuIn .16s var(--ease) backwards` |
| `mxAttySet` | modules.css | .mx-atty.is-set .pb-av, .mx-atty.is-set .mx-atty-t | `mxAttySet .6s var(--ease)` |
| `mxBreathe` | modules.css | .mx-size.is-reading | `mxBreathe 1.1s ease-in-out infinite` |
| `mxChipHit` | modules.css | .mx-chip.is-hit | `mxChipHit 1.2s var(--ease)` |
| `mxFieldHit` | modules.css | .mx-f-in.is-hit | `mxFieldHit 1.4s var(--ease)` |
| `mxPop` | modules.css | .mx-st-btn.is-set .pb-st-ic | `mxPop 380ms var(--ease-out)` |
| `mxRead` | modules.css | .mx-size.is-read · .mx-rev-td.is-read | `mxRead 600ms var(--ease-out) · mxRead 420ms var(--ease-out)` |
| `mxShake` | modules.css | .mx-fa.is-miss | `mxShake .36s var(--ease)` |
| `mxShimmer` | modules.css | .mx-rev-td.is-reading::after | `mxShimmer 1.1s linear infinite` |
| `panelIn` | styles.css | .main[data-view="dolist"][data-artifact="open"] .artifact-panel | `panelIn 240ms var(--ease-out) backwards` |
| `pbArrive` | playbooks.css | .mx-log-it.is-new · .rqa-it.is-new | `pbArrive 420ms var(--ease-out) backwards · pbArrive 520ms var(--ease-out) backwards` |
| `pbDlgIn` | playbooks.css | .mx-fpop · .mx-ap | `pbDlgIn 200ms var(--pb-open) backwards · pbDlgIn 180ms var(--pb-open) backwards` |
| `pbGlow` | playbooks.css | .pb-row.is-new | `pbGlow 1600ms var(--ease) 200ms` |
| `pbNudge` | playbooks.css | .pb-create-ask.is-nudge | `pbNudge 380ms var(--ease-out)` |
| `pbStep` | playbooks.css | .pb-step · .pb-ref | `pbStep 320ms var(--ease-out) backwards · pbStep 220ms var(--ease-out) backwards` |
| `pbvCtxIn` | playbooks.css | .pbv-bar-ctx.is-swap .pbv-bar-ctx-n, .pbv-bar-ctx.is-swap .pbv-bar-ctx-t | `pbvCtxIn 260ms var(--pb-open)` |
| `pbvFlush` | playbooks.css | .pbv-cl.is-changed .pbv-pos | `pbvFlush 2.4s var(--ease) 200ms backwards` |
| `pbvHlIn` | playbooks.css | .pbv-hl | `pbvHlIn 180ms var(--ease) backwards` |
| `pbvIdxOpen` | playbooks.css | .pbv-idx-items.is-opening | `pbvIdxOpen 240ms var(--pb-open)` |
| `pbvLift` | playbooks.css | .pbv-drag-ghost | `pbvLift 160ms var(--ease-out)` |
| `pbvPing` | playbooks.css | .pbv-cl.is-pinged .pbv-cl-head | `pbvPing 900ms var(--ease)` |
| `pbvSecFlush` | playbooks.css | .pbv-sec.is-moved .pbv-sec-head | `pbvSecFlush 2.2s var(--ease) 150ms backwards` |
| `pbvUnfold` | playbooks.css | .pbv-cls.is-opening .pbv-cl-body | `pbvUnfold 360ms var(--ease-out) backwards` |
| `pcSpin` | artifacts.css | .pc-refresh[data-spin="true"] .ic | `pcSpin 900ms linear infinite` |
| `pillIn` | composer.css | .modechip | `pillIn .2s var(--ease) backwards` |
| `pulse` | styles.css | .pc-sync[data-busy="true"] .pc-sync-dot · .step-running .step-ico | `pulse 1.1s ease-in-out infinite` |
| `recCaret` | styles.css | .br-caret | `recCaret 1.4s cubic-bezier(.4, 0, .2, 1) infinite` |
| `recLine` | styles.css | .br-line.is-new | `recLine 420ms cubic-bezier(.2, .8, .2, 1) backwards` |
| `recPulse` | styles.css | .rec-dot | `recPulse 3s cubic-bezier(.4, 0, .2, 1) infinite` |
| `recSpin` | styles.css | .rec-spin | `recSpin 720ms linear infinite` |
| `recWave` | styles.css | .rec-bars i · .rec-eq i | `recWave 1800ms cubic-bezier(.37, 0, .63, 1) infinite` |
| `rise` | styles.css | .artifact · .lib-card | `rise 340ms var(--ease-out) backwards · rise 320ms var(--ease-out) backwards` |
| `rqb-dot` | modules.css | .rqb-dots i | `rqb-dot 1s var(--ease) infinite` |
| `rqb-new` | modules.css | .rqb-row.is-new | `rqb-new 1.6s var(--ease)` |
| `rqb-spin` | modules.css | .rqb-step:not(.is-done):last-child .rqb-step-ic, .rqb-step.is-done + .rqb-step:not(.is-done) .rqb-step-ic · .rqp-work-step.is-now .rqp-work-ic | `rqb-spin .8s linear infinite` |
| `rqi-in` | modules.css | .rqi-more · .rqi-hist | `rqi-in 200ms var(--ease) · rqi-in 180ms var(--ease)` |
| `rqp-flash` | modules.css | .rqp-flash | `rqp-flash 1.6s var(--ease)` |
| `rqp-load` | modules.css | .rqp-dc-load i | `rqp-load 1.15s cubic-bezier(.45,0,.25,1) infinite` |
| `rqp-shim` | modules.css | .rqp-dc-shim | `rqp-shim 1.3s linear infinite` |
| `shareIn` | styles.css | .sh-card | `shareIn 220ms var(--ease-out) backwards` |
| `typingBounce` | styles.css | .typing-dots i | `typingBounce 1.15s var(--ease) infinite` |

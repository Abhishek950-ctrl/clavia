/* ------------------------------------------------------------------
   The animated mark, as vector.

   The GIF loops forever, which is right for a page that is waiting and
   wrong for a page that is not. This is the same dot-spiral built from
   phyllotaxis — the golden angle, which is what puts the seed pattern
   in the brand mark — so it can be driven by state instead:

     rest   plays its unfurl once, then holds
     hover  replays that unfurl
     busy   sweeps continuously, for work actually in flight

   markEl() returns the node; it wires its own hover.
------------------------------------------------------------------ */

const GOLDEN = Math.PI * (3 - Math.sqrt(5));

function markEl({ dots = 110, size = 52, className = 'mark' } = {}) {
  const c = size / 2;
  const parts = [];
  for (let i = 0; i < dots; i++) {
    const t = i / dots;
    const a = i * GOLDEN;
    const r = (c - 3) * Math.sqrt(t);
    const cx = c + Math.cos(a) * r;
    const cy = c + Math.sin(a) * r;
    /* dots grow outward, so the centre stays tight and the rim carries weight */
    const rad = 0.35 + 2.15 * t * t;
    parts.push(`<circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" ` +
               `r="${rad.toFixed(2)}" style="--i:${i}"/>`);
  }

  const el = document.createElement('span');
  el.className = className;
  el.innerHTML =
    `<svg viewBox="0 0 ${size} ${size}" aria-hidden="true" focusable="false">${parts.join('')}</svg>`;

  /* a CSS animation only replays if it is taken off and put back on, with a
     reflow in between to stop the browser coalescing the two */
  const replay = () => {
    if (el.dataset.busy === 'true') return;
    el.classList.remove('mark-run');
    void el.offsetWidth;
    el.classList.add('mark-run');
  };
  el.addEventListener('mouseenter', replay);
  el.replay = replay;
  requestAnimationFrame(replay);
  return el;
}

/* while a turn is in flight the same mark loops instead of resting */
const markBusy = (el, on) => { el.dataset.busy = String(on); };

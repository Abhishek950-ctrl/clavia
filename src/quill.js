/* ------------------------------------------------------------------
   The Clavia quill — the mark from the "Clavia Marks" identity study
   (round 6), ported as it was drawn: one quadratic curve for the shaft,
   barbs grown off it on both sides, a gold nib with its slit.

   It is the assistant, so it has the assistant's states:

     static   the mark, still
     idle     the feather sways, as if resting in an inkwell
     greet    it rises into place, the barbs unfurl, it signs a flourish
     work     the nib writes a line of looping script; the feather
              itself never bends
     done     the signature is finished with a dot of ink

   quillEl(state, { tone, cls, then }) returns the node. `tone` is the
   ground it sits on — 'paper' on the canvas, 'rail' on the dark rail.
   `then` is the state to settle into once a one-off (greet, done) ends.
------------------------------------------------------------------ */

/* One colourway, Emerald, on the two grounds the app has. Gold stays on
   the nib, so it reads as a detail and not as a second brand colour. */
const QUILL_TONES = {
  paper: { f: '#0E5B45', s: '#093D2F', n: '#B08A4E', i: '#0E5B45', bg: '#FFFFFF' },
  rail:  { f: '#F1ECDF', s: '#D8D0BC', n: '#D4B173', i: '#F1ECDF', bg: '#0D1F16' },
};

/* `paint` writes the colours in as attributes, for places no stylesheet
   reaches — the browser tab's icon. */
function quillSVG(paint) {
  const f2 = (n) => n.toFixed(2);
  const A = [8.6, 42.3], C = [17.5, 23.5], B = [41.8, 5.2];
  const P = (t) => { const u = 1 - t; return [u*u*A[0] + 2*u*t*C[0] + t*t*B[0], u*u*A[1] + 2*u*t*C[1] + t*t*B[1]]; };
  const T = (t) => {
    const u = 1 - t, x = 2*u*(C[0]-A[0]) + 2*t*(B[0]-C[0]), y = 2*u*(C[1]-A[1]) + 2*t*(B[1]-C[1]);
    const l = Math.hypot(x, y); return [x/l, y/l];
  };
  const rad = Math.PI / 180;
  const at = (css) => paint ? ' ' + css : '';

  /* the shaft: the curve, thickened, tapering to the tip */
  const L = [], R = [];
  for (let i = 0; i <= 40; i++) {
    const t = i / 40, p = P(t), tg = T(t), n = [-tg[1], tg[0]], hw = .95 - .78 * t;
    L.push(f2(p[0] + n[0]*hw) + ' ' + f2(p[1] + n[1]*hw));
    R.unshift(f2(p[0] - n[0]*hw) + ' ' + f2(p[1] - n[1]*hw));
  }
  const shaft = 'M' + L.concat(R).join(' L') + 'Z';

  /* the nib and its slit */
  const tg0 = T(0), n0 = [-tg0[1], tg0[0]];
  const tip = [A[0] - tg0[0]*4.2, A[1] - tg0[1]*4.2];
  const nib = 'M' + f2(A[0]+n0[0]) + ' ' + f2(A[1]+n0[1]) + ' L' + f2(tip[0]) + ' ' + f2(tip[1])
    + ' L' + f2(A[0]-n0[0]) + ' ' + f2(A[1]-n0[1]) + ' Z';
  const slit = `<line class="cq-slit"${at(`stroke="${paint?.bg}" stroke-width=".35" stroke-linecap="round"`)} `
    + `x1="${f2(tip[0]+tg0[0]*.7)}" y1="${f2(tip[1]+tg0[1]*.7)}" x2="${f2(tip[0]+tg0[0]*2.6)}" y2="${f2(tip[1]+tg0[1]*2.6)}"/>`;

  /* the barbs: a wide vane on one side, a narrow one on the other, each
     split twice the way a real feather parts */
  const t0 = .2, N = 46;
  let barbs = '';
  for (const sd of [{ s: 1, W: 7.4, split: [Math.round(N*.3), Math.round(N*.6)] },
                    { s: -1, W: 4.4, split: [Math.round(N*.46)] }]) {
    for (let k = 0; k < N; k++) {
      const u = k / (N - 1), tt = t0 + (.985 - t0) * u, pp = P(tt), g = T(tt), nn = [-g[1], g[0]];
      let w = sd.W * Math.pow(Math.sin(Math.PI * Math.pow(u, .8)), .6);
      let a = (52 - 24 * u) * rad;
      if (sd.split.includes(k) || sd.split.includes(k - 1)) { a += 10 * rad; w *= .9; }
      if (w < .3) continue;
      const d1 = [g[0]*Math.cos(a) + sd.s*nn[0]*Math.sin(a), g[1]*Math.cos(a) + sd.s*nn[1]*Math.sin(a)];
      const a2 = a + 12 * rad;
      const d2 = [g[0]*Math.cos(a2) + sd.s*nn[0]*Math.sin(a2), g[1]*Math.cos(a2) + sd.s*nn[1]*Math.sin(a2)];
      const Ln = w / Math.sin(a);
      const E = [pp[0] + d1[0]*Ln, pp[1] + d1[1]*Ln], Q = [pp[0] + d2[0]*Ln*.55, pp[1] + d2[1]*Ln*.55];
      barbs += `<path class="cq-qb"${at(`fill="none" stroke="${paint?.f}" stroke-width=".8" stroke-linecap="round"`)} `
        + `style="--u:${f2(u)};transform-origin:${f2(pp[0])}px ${f2(pp[1])}px" `
        + `d="M${f2(pp[0])} ${f2(pp[1])} Q${f2(Q[0])} ${f2(Q[1])} ${f2(E[0])} ${f2(E[1])}"/>`;
    }
  }

  const pen = barbs
    + `<path class="cq-qs"${at(`fill="${paint?.s}"`)} d="${shaft}"/>`
    + `<path class="cq-qn"${at(`fill="${paint?.n}"`)} d="${nib}"/>` + slit;
  if (paint) return pen;

  return '<svg class="cq-svg" viewBox="0 0 48 48" aria-hidden="true" focusable="false">'
    + '<path class="cq-swash" pathLength="100" d="M6.8 46.1 C13 44.2 18 47.6 25 45.8 S37 44.2 43.5 45.6"/>'
    + '<path class="cq-cursive" pathLength="100" d="M7 46 C9 43.5 11.5 43.8 10.6 45.4 C9.9 46.6 9.4 47 11 46.6 '
    + 'C13.5 45.9 15 43.6 16.9 44.2 C18.2 44.7 16.4 46.8 17.6 46.6 C19.9 46.2 21.4 43.8 23.3 44.4 '
    + 'C24.6 44.9 22.8 47 24 46.8 C26.3 46.4 27.8 44 29.7 44.6 C31 45.1 29.2 47.2 30.4 47 '
    + 'C32.6 46.6 34 45.2 36.5 45.5"/>'
    + '<circle class="cq-inkdot" cx="45.3" cy="45.3" r=".9"/>'
    + `<g class="cq-body"><g class="cq-pen">${pen}</g></g></svg>`;
}

/* how long each one-off runs before it settles */
const QUILL_ONCE = { greet: 2800, done: 1400 };

function quillEl(state = 'static', { tone = 'paper', cls = '', then } = {}) {
  const el = document.createElement('span');
  el.className = `cq cq-t-${tone}${cls ? ' ' + cls : ''}`;
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = quillSVG();
  quillState(el, state, then);
  return el;
}

/* Change state. A one-off is replayed from the start even if it is the
   state already showing, which needs a reflow between off and on. */
function quillState(el, state, then) {
  clearTimeout(el.quillT);
  el.classList.remove('cq-s-static', 'cq-s-idle', 'cq-s-greet', 'cq-s-work', 'cq-s-done');
  void el.offsetWidth;
  el.classList.add('cq-s-' + state);
  el.dataset.state = state;
  if (then && QUILL_ONCE[state]) {
    el.quillT = setTimeout(() => quillState(el, then), QUILL_ONCE[state]);
  }
}

/* ── the two places that exist before any script runs ──────────
   The rail's brand, which greets once when the app opens, and the
   browser tab, which carries the mark on the rail's own green. */
(function mountQuill() {
  const slot = document.querySelector('[data-quill="brand"]');
  if (slot) slot.replaceWith(quillEl('greet', { tone: 'rail', cls: 'brand-symbol', then: 'static' }));

  const t = QUILL_TONES.rail;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">`
    + `<rect width="48" height="48" rx="11" fill="${t.bg}"/>`
    + `<g transform="translate(7 5) scale(.74)">${quillSVG(t)}</g></svg>`;
  const link = document.querySelector('link[rel="icon"]') || document.head.appendChild(
    Object.assign(document.createElement('link'), { rel: 'icon' }));
  link.type = 'image/svg+xml';
  link.href = 'data:image/svg+xml,' + encodeURIComponent(svg);
})();

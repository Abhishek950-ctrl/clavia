/* ── Agents ───────────────────────────────────────────────────
   Legal's agents, each a card: its mark, its name, and what it does in
   a few words. The marks are drawn the way the Clavia quill is — one ink
   in two strengths, parchment on forest: the shape that carries the
   meaning solid, what it sits on at a third. */

/* each mark: one green silhouette, details inside it white, gold only where a part stands outside it,
   and parts that move — each mark tells its own small story (agents.css), the way the quill writes */
const AG_SVG = {
"nda": "<g class=\"ag-an p-shackle\" style=\"transform-box:view-box;transform-origin:31px 21px\"><path d=\"M17 21v-4.5a7 7 0 0 1 14 0V21\" fill=\"none\" stroke=\"#0E5B45\" stroke-width=\"4\"/></g><rect x=\"11\" y=\"20\" width=\"26\" height=\"21.5\" rx=\"4.5\" fill=\"#0E5B45\"/><g class=\"ag-an p-key\" fill=\"#FFFFFF\" style=\"transform-box:fill-box;transform-origin:center\"><circle cx=\"24\" cy=\"29\" r=\"2.8\"/><rect x=\"22.6\" y=\"29\" width=\"2.8\" height=\"6.4\" rx=\"1.4\"/></g>",
"redline": "<path class=\"ag-an p-ink\" opacity=\"0\" pathLength=\"1\" d=\"M10 40c2.5-3 4.5 3 7 0s4.5 3 7 0 4.5 3 6 0\" fill=\"none\" stroke=\"#B08A4E\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1\" stroke-dashoffset=\"1\"/><g class=\"ag-an p-pen\"><g class=\"ag-an p-scrib\" style=\"transform-box:view-box;transform-origin:10.9px 37.1px\"><g transform=\"rotate(45 24 24)\"><rect x=\"19.5\" y=\"3\" width=\"9\" height=\"29\" rx=\"2.6\" fill=\"#0E5B45\"/><path d=\"M19.5 34.2h9L24 42.5z\" fill=\"#B08A4E\" style=\"stroke:#fff;stroke-width:2.2;paint-order:stroke;stroke-linejoin:round\"/></g></g></g>",
"clause": "<rect x=\"8\" y=\"5\" width=\"25\" height=\"33\" rx=\"4.5\" fill=\"#0E5B45\"/><g class=\"ag-an p-mag\"><circle cx=\"31\" cy=\"29\" r=\"7.6\" fill=\"#FFFFFF\" stroke=\"#FFFFFF\" stroke-width=\"5\"/><circle cx=\"31\" cy=\"29\" r=\"7.6\" fill=\"#FFFFFF\" stroke=\"#B08A4E\" stroke-width=\"3.2\"/><path d=\"M36.6 34.6l5 5\" fill=\"none\" stroke=\"#B08A4E\" stroke-width=\"3.6\" stroke-linecap=\"round\"/><path class=\"ag-an p-found\" d=\"M27.4 29h7.2\" fill=\"none\" stroke=\"#0E5B45\" stroke-width=\"2.8\" stroke-linecap=\"round\" style=\"transform-box:fill-box;transform-origin:left center\"/></g>",
"obligation": "<g class=\"ag-an p-glass\" style=\"transform-box:view-box;transform-origin:24px 24px\"><rect x=\"12\" y=\"4.5\" width=\"24\" height=\"4.5\" rx=\"2\" fill=\"#0E5B45\"/><rect x=\"12\" y=\"39\" width=\"24\" height=\"4.5\" rx=\"2\" fill=\"#0E5B45\"/><path d=\"M15 9h18c0 7-4.5 10-7.2 15 2.7 5 7.2 8 7.2 15H15c0-7 4.5-10 7.2-15C19.5 19 15 16 15 9z\" fill=\"#0E5B45\"/></g><path class=\"ag-an p-sandT\" d=\"M19 12h10c-.6 2.8-2.6 4.8-5 6.2-2.4-1.4-4.4-3.4-5-6.2z\" fill=\"#FFFFFF\" style=\"transform-box:fill-box;transform-origin:center bottom;transform:scaleY(0)\"/><rect class=\"ag-an p-grain\" x=\"23.3\" y=\"19\" width=\"1.4\" height=\"14\" rx=\".7\" fill=\"#FFFFFF\" opacity=\"0\"/><path class=\"ag-an p-sandB\" d=\"M18.5 38h11c-.8-3.4-3-5.6-5.5-6.6-2.5 1-4.7 3.2-5.5 6.6z\" fill=\"#FFFFFF\" style=\"transform-box:fill-box;transform-origin:center bottom\"/>",
"diligence": "<g class=\"ag-an p-fold\" style=\"transform-box:view-box;transform-origin:24px 40px\"><path d=\"M6 14a4 4 0 0 1 4-4h8.5l3.5 4H38a4 4 0 0 1 4 4v18a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z\" fill=\"#0E5B45\"/></g><path class=\"ag-an p-tick\" pathLength=\"1\" d=\"M18.6 27.2l3.8 3.8 7.4-7.8\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1\" stroke-dashoffset=\"0\"/>",
"playbook": "<g class=\"ag-an p-book\" style=\"transform-box:view-box;transform-origin:24px 42.5px\"><rect x=\"11\" y=\"5.5\" width=\"26\" height=\"37\" rx=\"4.5\" fill=\"#0E5B45\"/><path class=\"ag-an p-rib\" d=\"M26.2 5.5h5.6v12l-2.8-2.2-2.8 2.2z\" fill=\"#FFFFFF\" style=\"transform-box:fill-box;transform-origin:center top\"/></g>",
"privacy": "<defs><clipPath id=\"agcp-privacy\"><path d=\"M24 5l15 5.5v11c0 9.5-6.4 16-15 20-8.6-4-15-10.5-15-20v-11z\"/></clipPath></defs><g class=\"ag-an p-shield\" style=\"transform-box:fill-box;transform-origin:center\"><path d=\"M24 5l15 5.5v11c0 9.5-6.4 16-15 20-8.6-4-15-10.5-15-20v-11z\" fill=\"#0E5B45\"/><g clip-path=\"url(#agcp-privacy)\"><g transform=\"rotate(20 24 24)\"><rect class=\"ag-an p-sheen\" x=\"-16\" y=\"-12\" width=\"9\" height=\"72\" fill=\"#FFFFFF\" opacity=\"0\"/></g></g><g class=\"ag-an p-key\" fill=\"#FFFFFF\" style=\"transform-box:fill-box;transform-origin:center\"><circle cx=\"24\" cy=\"19.8\" r=\"2.8\"/><rect x=\"22.6\" y=\"19.8\" width=\"2.8\" height=\"7.6\" rx=\"1.4\"/></g></g>",
"hold": "<path d=\"M24 13c-.8-3.6 1-6.8 4.6-8\" fill=\"none\" stroke=\"#B08A4E\" stroke-width=\"2.2\" stroke-linecap=\"round\"/><g class=\"ag-an p-tag\" style=\"transform-box:view-box;transform-origin:24px 13px\"><path d=\"M15 14l7.4-7a2.3 2.3 0 0 1 3.2 0l7.4 7c.6.6 1 1.4 1 2.2V39a3.5 3.5 0 0 1-3.5 3.5h-13A3.5 3.5 0 0 1 14 39V16.2c0-.8.4-1.6 1-2.2z\" fill=\"#0E5B45\"/><circle cx=\"24\" cy=\"13\" r=\"2\" fill=\"#FFFFFF\"/><g class=\"ag-an p-bars\" fill=\"#FFFFFF\" style=\"transform-box:fill-box;transform-origin:center\"><rect x=\"19.6\" y=\"22\" width=\"3.2\" height=\"12\" rx=\"1.6\"/><rect x=\"25.2\" y=\"22\" width=\"3.2\" height=\"12\" rx=\"1.6\"/></g></g>",
"research": "<g class=\"ag-an p-open\" style=\"transform-box:fill-box;transform-origin:center\"><path d=\"M4 11.5c7-2.6 13.5-1.6 18.5 2v27c-5-3.4-11.5-4.3-18.5-2z\" fill=\"#0E5B45\"/><path d=\"M44 11.5c-7-2.6-13.5-1.6-18.5 2v27c5-3.4 11.5-4.3 18.5-2z\" fill=\"#0E5B45\"/><path class=\"ag-an p-flip\" d=\"M44 11.5c-7-2.6-13.5-1.6-18.5 2v27c5-3.4 11.5-4.3 18.5-2z\" fill=\"#2E7A62\" opacity=\"0\" style=\"transform-box:view-box;transform-origin:24px 24px\"/><path d=\"M33 10.6h4.6v10.4l-2.3-1.8-2.3 1.8z\" fill=\"#FFFFFF\"/></g>",
"regulatory": "<path class=\"ag-an p-waveL\" opacity=\"0\" pathLength=\"1\" d=\"M9.5 9.5c-2.3 2.4-3.6 5.5-3.6 9\" fill=\"none\" stroke=\"#B08A4E\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1\" stroke-dashoffset=\"1\"/><path class=\"ag-an p-waveR\" opacity=\"0\" pathLength=\"1\" d=\"M38.5 9.5c2.3 2.4 3.6 5.5 3.6 9\" fill=\"none\" stroke=\"#B08A4E\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1\" stroke-dashoffset=\"1\"/><g class=\"ag-an p-clap\" style=\"transform-box:view-box;transform-origin:24px 7px\"><circle cx=\"24\" cy=\"39.8\" r=\"3.2\" fill=\"#B08A4E\"/></g><g class=\"ag-an p-bell\" style=\"transform-box:view-box;transform-origin:24px 7px\"><path d=\"M24 6a2.5 2.5 0 0 1 2.5 2.5v.8c5.6 1.2 9.5 6 9.5 11.9v7.3l3.2 4.1c.7.9.1 2.2-1 2.2H9.8c-1.1 0-1.7-1.3-1-2.2l3.2-4.1v-7.3c0-5.9 3.9-10.7 9.5-11.9v-.8A2.5 2.5 0 0 1 24 6z\" fill=\"#0E5B45\"/></g>",
"signature": "<g class=\"ag-an p-paper\" style=\"transform-box:fill-box;transform-origin:center\"><rect x=\"9\" y=\"7\" width=\"30\" height=\"34\" rx=\"4.5\" fill=\"#0E5B45\"/></g><path class=\"ag-an p-sign\" pathLength=\"1\" d=\"M15 28c2.8-6 5.2-7.1 6.1-4.2.9 3.2-2 6.2.7 5.9 2.4-.3 3.9-4.6 6.1-4.6 2 0 1.1 3.1 3.3 3.1H33\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1\" stroke-dashoffset=\"0\"/><circle class=\"ag-an p-dot\" cx=\"35.6\" cy=\"28.2\" r=\"1.7\" fill=\"#FFFFFF\" style=\"transform-box:fill-box;transform-origin:center;transform:scale(0)\"/>",
"triage": "<g class=\"ag-an p-tray\" style=\"transform-box:fill-box;transform-origin:center bottom\"><path d=\"M6.5 23h10l2.5 4.2h10l2.5-4.2h10v12.5a5 5 0 0 1-5 5h-25a5 5 0 0 1-5-5z\" fill=\"#0E5B45\"/></g><path class=\"ag-an p-arrow\" d=\"M24 5.5v12.5M18.6 12.8 24 18.2l5.4-5.4\" fill=\"none\" stroke=\"#B08A4E\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>",
"summary": "<g class=\"ag-an p-doc\" style=\"transform-box:fill-box;transform-origin:center\"><rect x=\"11\" y=\"5.5\" width=\"26\" height=\"36\" rx=\"4.5\" fill=\"#0E5B45\"/><path class=\"ag-an p-l1\" pathLength=\"1\" d=\"M17.5 17h13\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1\" stroke-dashoffset=\"0\"/><path class=\"ag-an p-l2\" pathLength=\"1\" d=\"M17.5 24h8\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1\" stroke-dashoffset=\"0\"/></g>",
"translate": "<g class=\"ag-an p-bub\" style=\"transform-box:view-box;transform-origin:20px 23px\"><path d=\"M5 14a5 5 0 0 1 5-5h20a5 5 0 0 1 5 5v12a5 5 0 0 1-5 5H17l-8 7v-7.4A5 5 0 0 1 5 26z\" fill=\"#0E5B45\"/><path class=\"ag-an p-l1\" pathLength=\"1\" d=\"M13 17h14\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1\" stroke-dashoffset=\"0\"/><path class=\"ag-an p-l2\" pathLength=\"1\" d=\"M13 23h9\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1\" stroke-dashoffset=\"0\"/></g>",
"entity": "<g class=\"ag-an p-top\" style=\"transform-box:fill-box;transform-origin:center\"><rect x=\"16.5\" y=\"5.5\" width=\"15\" height=\"12\" rx=\"3.2\" fill=\"#0E5B45\"/></g><path class=\"ag-an p-wire\" pathLength=\"1\" d=\"M24 18v6.2M12.2 30v-5.8h23.6V30\" fill=\"none\" stroke=\"#B08A4E\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1\" stroke-dashoffset=\"0\"/><g class=\"ag-an p-n1\" style=\"transform-box:fill-box;transform-origin:center\"><rect x=\"5.5\" y=\"30.5\" width=\"13.5\" height=\"11.5\" rx=\"3\" fill=\"#0E5B45\"/></g><g class=\"ag-an p-n2\" style=\"transform-box:fill-box;transform-origin:center\"><rect x=\"29\" y=\"30.5\" width=\"13.5\" height=\"11.5\" rx=\"3\" fill=\"#0E5B45\"/></g>",
"minutes": "<g class=\"ag-an p-board\" style=\"transform-box:fill-box;transform-origin:center\"><rect x=\"10\" y=\"9\" width=\"28\" height=\"33\" rx=\"4.5\" fill=\"#0E5B45\"/></g><path class=\"ag-an p-w1\" opacity=\"0\" pathLength=\"1\" d=\"M16 21h16\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1\" stroke-dashoffset=\"1\"/><path class=\"ag-an p-w2\" opacity=\"0\" pathLength=\"1\" d=\"M16 27.5h12\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1\" stroke-dashoffset=\"1\"/><path class=\"ag-an p-w3\" opacity=\"0\" pathLength=\"1\" d=\"M16 34h8\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1\" stroke-dashoffset=\"1\"/><g class=\"ag-an p-clip\" style=\"transform-box:fill-box;transform-origin:center\"><rect x=\"18.5\" y=\"5.5\" width=\"11\" height=\"6.5\" rx=\"2.4\" fill=\"#B08A4E\" style=\"stroke:#fff;stroke-width:2.2;paint-order:stroke;stroke-linejoin:round\"/></g>",
"trademark": "<circle class=\"ag-an p-ripple\" cx=\"24\" cy=\"24\" r=\"17.5\" fill=\"none\" stroke=\"#0E5B45\" stroke-width=\"1.6\" opacity=\"0\" style=\"transform-box:fill-box;transform-origin:center\"/><g class=\"ag-an p-seal\" style=\"transform-box:fill-box;transform-origin:center\"><circle cx=\"24\" cy=\"24\" r=\"17.5\" fill=\"#0E5B45\"/><path class=\"ag-an p-star\" d=\"M24 16.6l2.3 4.7 5.2.8-3.8 3.6.9 5.1L24 28.4l-4.6 2.4.9-5.1-3.8-3.6 5.2-.8z\" fill=\"#FFFFFF\" style=\"transform-box:fill-box;transform-origin:center\"/></g>",
"policy": "<g class=\"ag-an p-bub\" style=\"transform-box:view-box;transform-origin:12px 40px\"><path d=\"M6 12a6 6 0 0 1 6-6h24a6 6 0 0 1 6 6v15a6 6 0 0 1-6 6H20l-8 7v-7.2A6 6 0 0 1 6 27z\" fill=\"#0E5B45\"/><path class=\"ag-an p-q\" pathLength=\"1\" d=\"M20.2 15.6a3.8 3.8 0 1 1 5.4 3.5c-1 .5-1.6 1.2-1.6 2.2v.5\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1\" stroke-dashoffset=\"0\"/><circle class=\"ag-an p-qd\" cx=\"24\" cy=\"26.6\" r=\"1.8\" fill=\"#FFFFFF\" style=\"transform-box:fill-box;transform-origin:center\"/></g>",
"invoice": "<g class=\"ag-an p-rcpt\" style=\"transform-box:fill-box;transform-origin:center\"><path d=\"M10 5h28v36l-4.7-3-4.6 3-4.7-3-4.6 3-4.7-3L10 41z\" fill=\"#0E5B45\"/><path class=\"ag-an p-l1\" pathLength=\"1\" d=\"M17 14h14\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1\" stroke-dashoffset=\"0\"/><path class=\"ag-an p-l2\" pathLength=\"1\" d=\"M17 21h8\" fill=\"none\" stroke=\"#FFFFFF\" stroke-width=\"2.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-dasharray=\"1\" stroke-dashoffset=\"0\"/></g>",
"employment": "<g class=\"ag-an p-person\"><circle class=\"ag-an p-head\" cx=\"20\" cy=\"14\" r=\"7.5\" fill=\"#0E5B45\" style=\"transform-box:fill-box;transform-origin:center\"/><path d=\"M5 41c1-8.5 6.6-13.5 15-13.5S34 32.5 35 41z\" fill=\"#0E5B45\"/></g><g class=\"ag-an p-case\" style=\"transform-box:fill-box;transform-origin:center\"><rect x=\"31\" y=\"27.5\" width=\"11\" height=\"8.5\" rx=\"2.2\" fill=\"#B08A4E\" style=\"stroke:#fff;stroke-width:2.2;paint-order:stroke;stroke-linejoin:round\"/><path d=\"M34.2 27.5v-1.6a1.4 1.4 0 0 1 1.4-1.4h1.8a1.4 1.4 0 0 1 1.4 1.4v1.6\" fill=\"none\" stroke=\"#B08A4E\" stroke-width=\"1.6\"/></g>"
};
const AG_ART = AG_SVG;
const agMark = (k) => `<svg class="ag-ic" data-k="${k}" viewBox="0 0 48 48" aria-hidden="true">${AG_SVG[k]}</svg>`;

/* ── three families of agent icons; I cycles through them ──
   Marks: the green silhouettes above. Bots (after Grok's characters): a shape each that hints at its job, a flat colour, two slanted eyes. Buddies (after Grok's
   companions): one round face with dot eyes and a smile, a colour each, holding the thing it works with. */
const AG_STYLES = [['mark', 'Marks'], ['bot', 'Bots'], ['buddy', 'Buddies'], ['crew', 'Characters']];
const agStyle = () => (typeof state !== 'undefined' && AG_STYLES.some(x => x[0] === state.agIconStyle)) ? state.agIconStyle : 'mark';
/* what each agent works with, drawn small on a 12px grid, one stroke */
const AG_GLYPH = {
  nda: '<rect x="3" y="5.5" width="6" height="4.6" rx="1"/><path d="M4.3 5.5V4a1.7 1.7 0 0 1 3.4 0v1.5"/>',
  redline: '<path d="M2.6 9.4l.8-2.6 4.8-4.8a1.1 1.1 0 0 1 1.6 1.6L5 8.4z"/>',
  clause: '<circle cx="5.2" cy="5.2" r="2.7"/><path d="M7.2 7.2l2.3 2.3"/>',
  obligation: '<path d="M3.5 2.4h5M3.5 9.6h5M4.2 2.4c0 2.2 3.6 2.4 3.6 3.6S4.2 7.4 4.2 9.6M7.8 2.4c0 2.2-3.6 2.4-3.6 3.6s3.6 1.4 3.6 3.6"/>',
  diligence: '<path d="M2.8 6.3l2.2 2.2 4.2-4.6"/>',
  playbook: '<path d="M4 2.4h4v7.2l-2-1.5-2 1.5z"/>',
  privacy: '<path d="M6 2.2l3.4 1.3v2.6c0 2.1-1.4 3.4-3.4 4.2-2-.8-3.4-2.1-3.4-4.2V3.5z"/>',
  hold: '<path d="M4.8 3.4v5.2M7.2 3.4v5.2"/>',
  research: '<path d="M2.4 3.6c1.3-.5 2.5-.4 3.6.4v5.6c-1.1-.8-2.3-.9-3.6-.4zM9.6 3.6c-1.3-.5-2.5-.4-3.6.4v5.6c1.1-.8 2.3-.9 3.6-.4z"/>',
  regulatory: '<path d="M3.4 8.2V5.7a2.6 2.6 0 0 1 5.2 0v2.5l.9 1H2.5zM5.2 10.4h1.6"/>',
  signature: '<path d="M2.4 7.6c1-2.1 1.9-2.4 2.2-1.4.3 1-.7 2.1.3 2 .8-.1 1.4-1.6 2.1-1.6.7 0 .4 1.1 1.2 1.1h1.4"/>',
  triage: '<path d="M6 2v4.4M4.1 4.6 6 6.5l1.9-1.9M2.4 7.4h2l.8 1.2h1.6l.8-1.2h2v2.2h-7.2z"/>',
  summary: '<path d="M3 3.8h6M3 6h6M3 8.2h3.6"/>',
  translate: '<path d="M2.4 3.2h4.6v3H4.4L3 7.4V6.2h-.6zM5.4 6.6h4.2v2.6h-.8v1.2L7.4 9.2h-2z"/>',
  entity: '<rect x="4.5" y="2" width="3" height="2.4" rx=".6"/><rect x="2" y="7.4" width="2.8" height="2.6" rx=".6"/><rect x="7.2" y="7.4" width="2.8" height="2.6" rx=".6"/><path d="M6 4.4v1.4M3.4 7.4V5.8h5.2v1.6"/>',
  minutes: '<rect x="3" y="3" width="6" height="7" rx="1"/><path d="M4.8 2.4h2.4M4.4 5.6h3.2M4.4 7.6h2"/>',
  trademark: '<path d="M6 2.4l1.1 2.3 2.5.3-1.8 1.7.5 2.5L6 8 3.7 9.2l.5-2.5-1.8-1.7 2.5-.3z"/>',
  policy: '<path d="M4.4 4.6a1.6 1.6 0 1 1 2.3 1.4c-.5.2-.7.5-.7 1v.3"/><circle cx="6" cy="9" r=".3"/>',
  invoice: '<path d="M3.4 2.4h5.2v7.2l-1-.6-1 .6-1-.6-1 .6-1.2-.6z"/><path d="M4.6 4.6h2.8M4.6 6.4h1.8"/>',
  employment: '<rect x="2.4" y="4.4" width="7.2" height="5" rx="1"/><path d="M4.6 4.4V3.4h2.8v1M2.4 6.6h7.2"/>',
};
/* a colour each: lively, but at home beside the forest and gold */
const AG_HUE = ['#2F7A5B', '#C9963F', '#C9684B', '#4E72B0', '#8B5FA3', '#3E9C8B', '#C96B8E', '#5C6B7E', '#7A9A3C', '#B5603A'];
const agHue = (k) => { const i = Object.keys(AG_GLYPH).indexOf(k); return AG_HUE[(i < 0 ? 0 : i) % AG_HUE.length]; };
const agGlyph = (k, x, y, size, col) => `<g transform="translate(${x} ${y}) scale(${size / 12})" fill="none" stroke="${col}" stroke-width="${1.35 * 12 / size}" stroke-linecap="round" stroke-linejoin="round">${AG_GLYPH[k] || ''}</g>`;
/* Bots, after Grok's: a character each — its own shape (the hint to what it does), a flat colour,
   and two slanted eyes looking up and to the right. No badges, no symbols: the shape is the personality */
const AG_BOT = {
  nda:        ['#2FA57A', `<path d="M16.5 21v-3.5a7.5 7.5 0 0 1 15 0V21" fill="none" stroke="CURR" stroke-width="5"/><rect x="9" y="19" width="30" height="23" rx="9"/>`, 27, 29],
  redline:    ['#E9A23B', '<path d="M21.5 7.4c2.4-1.6 5.5-1.1 7.4 1C35 14.4 40 20.6 40 27.6 40 35.7 33 41.8 24.5 41.8S9 35.7 9 27.6c0-7.1 5.4-14.4 12.5-20.2z"/>', 27, 24],
  clause:     ['#F0703A', '<circle cx="24" cy="25" r="16.5"/>', 28, 21],
  obligation: ['#3D7FE6', '<path d="M14 8h20c0 8-6 11.2-6 16s6 8 6 16H14c0-8 6-11.2 6-16s-6-8-6-16z" stroke="CURR" stroke-width="5" stroke-linejoin="round"/>', 26, 31],
  diligence:  ['#8B62E0', '<path d="M7 15.5a5 5 0 0 1 5-5h8.5l3.5 4H36a5 5 0 0 1 5 5V35a5 5 0 0 1-5 5H12a5 5 0 0 1-5-5z"/>', 28, 25],
  playbook:   ['#2FB0A0', '<rect x="12" y="6.5" width="24" height="35" rx="7"/>', 27, 19],
  privacy:    ['#E36A8E', '<path d="M24 6.5l14 5v10.5c0 9-6 15.6-14 19-8-3.4-14-10-14-19V11.5z" stroke="CURR" stroke-width="3" stroke-linejoin="round"/>', 27, 21],
  hold:       ['#64748B', '<path d="M14 16l8.4-7.6a2.4 2.4 0 0 1 3.2 0L34 16v21.5a4.5 4.5 0 0 1-4.5 4.5h-11a4.5 4.5 0 0 1-4.5-4.5z"/><circle cx="24" cy="15" r="2.3" fill="#fff"/>', 26.5, 25, '#fff'],
  research:   ['#7DB343', '<circle cx="17" cy="27" r="9"/><circle cx="26" cy="20" r="10.5"/><circle cx="33.5" cy="27.5" r="8.5"/><rect x="11" y="26" width="28" height="12" rx="6"/>', 28.5, 22],
  regulatory: ['#F08A3E', '<path d="M24 6a3 3 0 0 1 3 3v.7c6 1.4 10 6.6 10 12.8v6.6l3 4c.9 1.2.1 2.9-1.4 2.9H9.4c-1.5 0-2.3-1.7-1.4-2.9l3-4v-6.6C11 16.3 15 11.1 21 9.7V9a3 3 0 0 1 3-3z"/><circle cx="24" cy="40" r="3.4"/>', 27, 23],
  signature:  ['#22B573', '<rect x="5.5" y="14.5" width="37" height="20" rx="10" transform="rotate(-6 24 24.5)"/>', 28, 23],
  triage:     ['#3B8AF0', '<path d="M21 10.2a3.5 3.5 0 0 1 6 0l12.6 22c1.4 2.4-.3 5.3-3 5.3H11.4c-2.7 0-4.4-2.9-3-5.3z"/>', 26.5, 28],
  summary:    ['#D96A9A', '<path d="M13 7h15.5L38 16.5V37a4.5 4.5 0 0 1-4.5 4.5h-20.5A4.5 4.5 0 0 1 8.5 37V11.5A4.5 4.5 0 0 1 13 7z"/><path d="M28.5 7v6a3.5 3.5 0 0 0 3.5 3.5h6" fill="#fff" fill-opacity=".35"/>', 26, 27],
  translate:  ['#3FA6E0', '<path d="M8 14.5a6 6 0 0 1 6-6h20a6 6 0 0 1 6 6v13a6 6 0 0 1-6 6H21l-8 7v-7.4A6 6 0 0 1 8 27.5z"/>', 27.5, 19],
  entity:     ['#5B6CE0', '', 0, 0],
  minutes:    ['#C5673F', '<rect x="10" y="10" width="28" height="31" rx="7"/><rect x="17.5" y="6" width="13" height="8" rx="4"/>', 27, 25],
  trademark:  ['#E8B53A', '<path d="M24 7.5l4.6 9.6 10.4 1.4-7.6 7.3 1.9 10.4L24 31.2l-9.3 5 1.9-10.4L9 18.5l10.4-1.4z" stroke="CURR" stroke-width="5" stroke-linejoin="round"/>', 26.2, 24],
  policy:     ['#8F6AE8', '<rect x="10.5" y="10.5" width="27" height="27" rx="8.5" transform="rotate(45 24 24)"/>', 26.5, 22],
  invoice:    ['#5E9E7E', '<path d="M11 8h26v32l-4.3-2.8-4.4 2.8-4.3-2.8-4.4 2.8-4.3-2.8L11 40z" stroke="CURR" stroke-width="3" stroke-linejoin="round"/>', 27, 21],
  employment: ['#E8645E', '<path d="M24 7c6.6 0 12 5.4 12 12 0 3.6-1.6 6.8-4 9 4.3 2.3 7 6.5 7.5 12.5h-31C9 34.5 11.7 30.3 16 28c-2.4-2.2-4-5.4-4-9 0-6.6 5.4-12 12-12z"/>', 27, 18],
};
/* each Bot carries one small thing of its trade on its shoulder, in its own colour — a mini pencil, a key, a
   flag — instead of the same dot on every one (15 Oct). The bell keeps a red dot: that is what a bell means. */
const AGP_R = '#EF4444', AGP_Y = '#F4B740', AGP_N = '#1E293B';
/* drawn on a 16px grid of their own and set on the shoulder, so every prop is the same size and sits the same way */
const AG_PROP16 = {
  nda: `<circle cx="5.5" cy="5.5" r="4.3" fill="#F4B740"/><circle cx="5.5" cy="5.5" r="1.7" fill="#fff"/><path d="M8.4 8.4l5.6 5.6" stroke="#F4B740" stroke-width="2.6" stroke-linecap="round"/><path d="M11.2 11.2l1.6-1.6M13.2 13.2l1.4-1.4" stroke="#F4B740" stroke-width="2.2" stroke-linecap="round"/><circle cx="4.2" cy="4.2" r=".9" fill="#FFF3D1"/>`,
  redline: `<g transform="rotate(45 8 8)"><rect x="5.8" y=".5" width="4.4" height="10.5" rx="1.4" fill="#EF4444"/><path d="M5.8 11h4.4L8 15z" fill="#F6C9A0"/></g>`,
  clause: `<circle cx="6.5" cy="6.5" r="4" fill="none" stroke="#1E293B" stroke-width="2.2"/><path d="M9.6 9.6l3.6 3.6" stroke="#1E293B" stroke-width="2.6" stroke-linecap="round"/>`,
  diligence: `<path d="M4 2v12" stroke="#1E293B" stroke-width="1.6" stroke-linecap="round"/><path d="M4.6 2.4h8.4l-2.4 3.2 2.4 3.2H4.6z" fill="#EF4444"/>`,
  playbook: `<path d="M5 1h6v12l-3-2.4L5 13z" fill="#EF4444"/>`,
  privacy: `<path d="M5.2 7V5a2.8 2.8 0 0 1 5.6 0v2" fill="none" stroke="#E0A12E" stroke-width="2"/><rect x="2.8" y="6.5" width="10.4" height="8.3" rx="2.4" fill="#F4B740"/><circle cx="8" cy="10" r="1.3" fill="#8A5A12"/><rect x="7.4" y="10.4" width="1.2" height="2.4" rx=".6" fill="#8A5A12"/>`,
  hold: `<path d="M6 5.5v5.6a2.6 2.6 0 0 0 5.2 0V3.8a3.9 3.9 0 0 0-7.8 0v8.4a5.2 5.2 0 0 0 10.4 0V6" fill="none" stroke="#94A3B8" stroke-width="1.8" stroke-linecap="round"/>`,
  research: `<circle cx="8" cy="6.4" r="5.6" fill="#FDE68A" opacity=".55"/><path d="M8 1.6a4.6 4.6 0 0 1 2.7 8.3v1.6H5.3V9.9A4.6 4.6 0 0 1 8 1.6z" fill="#F4B740"/><path d="M6.6 6.6 8 8.2l1.4-1.6" fill="none" stroke="#FFF3D1" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"/><rect x="5.3" y="12.2" width="5.4" height="1.5" rx=".75" fill="#1E293B"/><rect x="6" y="14.1" width="4" height="1.4" rx=".7" fill="#1E293B"/>`,
  regulatory: `<circle cx="8" cy="8" r="5.6" fill="#EF4444"/><circle cx="6.3" cy="6.3" r="1.4" fill="#fff" opacity=".45"/>`,
  signature: `<path d="M8 1.5c2.4 2.4 4 4.6 4 6.8 0 1.8-1.1 3-2.5 3.6L8 14.5l-1.5-2.6C5.1 11.3 4 10.1 4 8.3c0-2.2 1.6-4.4 4-6.8z" fill="#1E293B"/>`,
  triage: `<path d="M3 12a6 6 0 0 1 9.6-4.8" fill="none" stroke="#EF4444" stroke-width="2.4" stroke-linecap="round"/><path d="M13.4 3.4v4.4H9" fill="none" stroke="#EF4444" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`,
  summary: `<path d="M8 1.5c.5 3.6 2.4 5.5 6 6-3.6.5-5.5 2.4-6 6-.5-3.6-2.4-5.5-6-6 3.6-.5 5.5-2.4 6-6z" fill="#F4B740"/>`,
  translate: `<path d="M1.5 4a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v4.6a3 3 0 0 1-3 3h-1.4v3.2l-3.2-3.2H4.5a3 3 0 0 1-3-3z" fill="#F4B740"/><path d="M5 5h6M5 7.8h3.6" stroke="#8A5A12" stroke-width="1.3" stroke-linecap="round"/>`,
  minutes: `<g transform="rotate(-38 8 8)"><rect x="2.5" y="2.5" width="10" height="5" rx="1.8" fill="#8B5A3C"/><rect x="6.6" y="7" width="1.9" height="8" rx=".95" fill="#8B5A3C"/></g>`,
  policy: `<path d="M1.5 3.6c2.2-.8 4.3-.5 6 .8v9.4c-1.7-1.2-3.8-1.5-6-.8zM14.5 3.6c-2.2-.8-4.3-.5-6 .8v9.4c1.7-1.2 3.8-1.5 6-.8z" fill="#EF4444"/>`,
  invoice: `<circle cx="8" cy="8" r="6.4" fill="#F4B740"/><circle cx="8" cy="8" r="4.3" fill="none" stroke="#E0A12E" stroke-width="1.2"/><path d="M5.6 5.2a3.4 3.4 0 0 1 2.6-1.4" stroke="#FFF3D1" stroke-width="1.2" stroke-linecap="round" fill="none"/>`,
  employment: `<path d="M5.8 5V3.8A1.5 1.5 0 0 1 7.3 2.3h1.4a1.5 1.5 0 0 1 1.5 1.5V5" fill="none" stroke="#1E293B" stroke-width="1.6"/><rect x="2" y="5" width="12" height="8.8" rx="2.2" fill="#1E293B"/>`,
};
/* only where the shape doesn't already say it (15 Oct): the padlock, shield, tag, bubble, receipt, hourglass and star speak for themselves */
['nda', 'privacy', 'hold', 'translate', 'invoice'].forEach(k => { delete AG_PROP16[k]; });
/* the white keyline sets the prop on the shoulder, held rather than floating */
/* drawn twice: a white outline behind, then the prop itself, so the keyline edges the silhouette and never cuts through it */
const agDot = (k) => AG_PROP16[k] ? `<g class="ag-badge" transform="translate(31.5 2.5) scale(.92)"><g stroke="#fff" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round">${AG_PROP16[k]}</g><g>${AG_PROP16[k]}</g></g>` : '';
/* two slanted slits, looking up and right */
const agEyes = (x, y, col = '#14211B', s = 1) => `<g class="ag-eyes" fill="${col}"><rect x="${x - 4.6 * s}" y="${y - 3.7 * s}" width="${3.6 * s}" height="${7.4 * s}" rx="${1.8 * s}" transform="rotate(12 ${x - 2.8 * s} ${y})"/><rect x="${x + 1.6 * s}" y="${y - 3.7 * s}" width="${3.6 * s}" height="${7.4 * s}" rx="${1.8 * s}" transform="rotate(12 ${x + 3.4 * s} ${y})"/></g>`;
function agBot(k) {
  const open = `<svg class="ag-ic ag-ic--bot" data-k="${k}" data-style="bot" viewBox="0 0 48 48" aria-hidden="true">`;
  /* the entity manager is a little group, like an offsite: three of them */
  if (k === 'entity') return open + [['#3FB7A3', 24, 15], ['#5B6CE0', 15, 31], ['#9A6AE8', 33, 31]].map(([c, x, y]) =>
    `<g class="ag-body"><circle cx="${x}" cy="${y}" r="10" fill="${c}" stroke="#fff" stroke-width="2"/>${agEyes(x + 2.2, y - 1.5, '#14211B', .62)}</g>`).join('') + agDot(k) + '</svg>';
  const [c, shape, ex, ey, eyeCol] = AG_BOT[k] || AG_BOT.clause;
  const g = `agsh-${k}`;
  return open + `<defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".1"/></linearGradient></defs>`
    + `<g class="ag-body"><g fill="${c}">${shape.replace(/CURR/g, c)}</g><g fill="url(#${g})">${shape.replace(/stroke="CURR"/g, 'stroke="none"').replace(/CURR/g, c)}</g></g>${agEyes(ex, ey, eyeCol || '#14211B')}${agDot(k)}</svg>`;
}
function agBuddy(k) {
  const c = agHue(k);
  return `<svg class="ag-ic ag-ic--buddy" data-k="${k}" data-style="buddy" viewBox="0 0 48 48" aria-hidden="true">`
    + `<circle cx="22" cy="24" r="17" fill="${c}"/>`
    + `<circle cx="14.5" cy="29" r="2.6" fill="#fff" opacity=".22"/><circle cx="29.5" cy="29" r="2.6" fill="#fff" opacity=".22"/>`
    + `<g class="ag-eyes" fill="#1F1F1D"><circle cx="17" cy="22.5" r="2.4"/><circle cx="27" cy="22.5" r="2.4"/></g>`
    + `<circle cx="17.8" cy="21.7" r=".8" fill="#fff"/><circle cx="27.8" cy="21.7" r=".8" fill="#fff"/>`
    + `<path d="M18.6 28.4q3.4 2.6 6.8 0" fill="none" stroke="#1F1F1D" stroke-width="1.8" stroke-linecap="round"/>`
    + `<g class="ag-badge"><circle cx="36.5" cy="36" r="10.5" fill="#fff" stroke="#fff" stroke-width="2.4"/><circle cx="36.5" cy="36" r="10.5" fill="#FBF8F2" stroke="#E6E1D8" stroke-width="1"/>${agGlyph(k, 29.3, 28.8, 14.4, c)}</g></svg>`;
}

/* ── Characters: soft, clay-lit bodies peeking up from the ground, each with a thing from legal practice ──
   (15 Oct: “legal specific, not generic”) a quill for the redliner, a wax seal for NDAs, a pocket watch for
   deadlines, files in red tape, a law book, a barrister's wig, the scales, a fountain pen, a filing stamp,
   a legal pad, a gavel, a registration rosette, a briefcase; monocle, reading glasses and eyeshade stay */
const agMix = (hex, to, t) => { const a = parseInt(hex.slice(1), 16), b = parseInt(to.slice(1), 16);
  const c = (sh) => Math.round(((a >> sh) & 255) * (1 - t) + ((b >> sh) & 255) * t);
  return '#' + [16, 8, 0].map(sh => c(sh).toString(16).padStart(2, '0')).join(''); };
const AGC_BODY = {
  dome: '<path d="M7.5 41c0-11.5 7.4-24 16.5-24S40.5 29.5 40.5 41z"/>',
  tri: '<path d="M24 14c2 0 3.6 1.2 5 3.4L39.2 36c1.4 2.6 0 5-2.8 5H11.6c-2.8 0-4.2-2.4-2.8-5L19 17.4c1.4-2.2 3-3.4 5-3.4z"/>',
  cloud: '<circle cx="15" cy="30" r="7"/><circle cx="22" cy="24" r="8"/><circle cx="30" cy="25" r="7.5"/><circle cx="35" cy="31.5" r="6.5"/><rect x="8" y="29" width="33.5" height="12" rx="3"/>',
  scallop: '<circle cx="13" cy="30.5" r="6"/><circle cx="18.5" cy="25" r="6.4"/><circle cx="25" cy="23" r="6.6"/><circle cx="31.5" cy="25" r="6.2"/><circle cx="36" cy="31" r="5.6"/><rect x="7.4" y="29" width="34" height="12" rx="3"/>',
  squircle: '<path d="M11 41V25a12 12 0 0 1 12-12h2a12 12 0 0 1 12 12v16z"/>',
  tuft: '<path d="M8 41c0-11 7-22 16-22s16 11 16 22z"/><circle cx="19" cy="17.6" r="3.6"/><circle cx="24" cy="15.8" r="4"/><circle cx="29" cy="17.8" r="3.4"/>',
  heart: '<path d="M24 41C14 34 7 28.5 7 21.5 7 16.8 10.6 13 15.2 13c3.4 0 6.4 2 8.8 5.2C26.4 15 29.4 13 32.8 13 37.4 13 41 16.8 41 21.5 41 28.5 34 34 24 41z"/>',
};
/* body, colour, where the eyes sit (y), how the eyes look, and what it wears */
const AGC_DK = '#1E1E21', AGC_GD = '#E8B13E';
const AGC = {
  redline: ['dome', '#3F8CF0', 29, 'dot', `<g transform="rotate(-8 37 34)"><rect x="30.4" y="26.6" width="11.6" height="14.4" rx="1.2" fill="#FFFFFF" stroke="#DCD6CC" stroke-width=".7"/><path d="M32.6 30h7.2M32.6 32.6h7.2M32.6 35.2h4.4M32.6 37.8h6.4" stroke="#C9C4BA" stroke-width=".7"/><path d="M32.4 32.6h7.6" stroke="#D93A2B" stroke-width="1"/><path d="M37.2 36l1.2-1.6 1.2 1.6" fill="none" stroke="#D93A2B" stroke-width=".9" stroke-linecap="round" stroke-linejoin="round"/></g><g transform="rotate(38 39 32)"><rect x="38" y="24" width="2.2" height="13" rx="1.1" fill="#C62F22"/><path d="M38 37h2.2l-1.1 2.6z" fill="#2A2A2E"/></g>`],
  clause: ['scallop', '#F2733A', 30, 'dot', `<g transform="rotate(-8 36 34)"><rect x="30.4" y="27.4" width="11.2" height="13.6" rx="1.2" fill="#fff" stroke="#DCD6CC" stroke-width=".7"/><path d="M32.4 30.6h7.2M32.4 33.2h7.2M32.4 35.8h4.6" stroke="#C9C4BA" stroke-width=".7"/></g><circle cx="38" cy="34" r="3.8" fill="#DDEBFA" fill-opacity=".75" stroke="#2A2A2E" stroke-width="1.3"/><path d="M36.6 32.6a2 2 0 0 1 1.6-.8" stroke="#fff" stroke-width=".8" stroke-linecap="round" fill="none"/><path d="M40.8 36.8l2.8 2.8" stroke="#7A4A2E" stroke-width="1.8" stroke-linecap="round"/>`],
  nda: ['dome', '#8B6CF0', 30, 'dot', `<path d="M15.6 19.6c.4-5.4 3.2-8.6 8.4-8.6s8 3.2 8.4 8.6z" fill="#2A2A2E"/><rect x="15.4" y="16.4" width="17.2" height="2.6" rx=".8" fill="#7A5C34"/><ellipse cx="24" cy="19.8" rx="13.4" ry="2.6" fill="#2A2A2E"/><path d="M17.5 13.6c1.4-1.4 3.6-2.2 6.5-2.2" stroke="#fff" stroke-opacity=".2" stroke-width="1" fill="none" stroke-linecap="round"/>`],
  obligation: ['dome', '#A8D84A', 29, 'dot', `<g transform="rotate(-6 37 34)"><rect x="30.6" y="28.4" width="12.4" height="12" rx="1.6" fill="#fff" stroke="#DCD6CC" stroke-width=".7"/><path d="M30.6 30a1.6 1.6 0 0 1 1.6-1.6h9.2a1.6 1.6 0 0 1 1.6 1.6v1.8H30.6z" fill="#C0392B"/><path d="M33.4 27.2v2.4M40.2 27.2v2.4" stroke="#2A2A2E" stroke-width="1" stroke-linecap="round"/><path d="M32.6 34h1M35.4 34h1M38.2 34h1M32.6 36.6h1M35.4 36.6h1" stroke="#C9C4BA" stroke-width=".9" stroke-linecap="round"/><circle cx="38.7" cy="36.6" r="1.9" fill="none" stroke="#D93A2B" stroke-width=".9"/></g>`],
  diligence: ['squircle', '#5BC0EB', 28, 'dot', `<g transform="rotate(-8 37 35)"><rect x="30.6" y="31" width="12.4" height="8.6" rx="1.2" fill="#D9B566"/><rect x="31.4" y="29.4" width="12.4" height="8.6" rx="1.2" fill="#E8C77C"/><path d="M33 29.4v-1.2h3.6l.8 1.2" fill="#E8C77C"/><rect x="31.4" y="32.6" width="12.4" height="1.6" fill="#C0392B"/><rect x="36.6" y="29.4" width="1.6" height="8.6" fill="#C0392B"/></g>`],
  playbook: ['dome', '#2FB58A', 30, 'dot', `<path d="M16.2 18.6v3.6c0 1.6 3.5 3 7.8 3s7.8-1.4 7.8-3v-3.6" fill="#33343A"/><path d="M24 11.4l13.4 5.2L24 21.8l-13.4-5.2z" fill="#26272C"/><path d="M24 16.6l9.6 2.4v6" stroke="#E8B13E" stroke-width="1.2" fill="none" stroke-linecap="round"/><circle cx="33.6" cy="25.6" r="1.4" fill="#E8B13E"/><circle cx="24" cy="16.6" r="1" fill="#E8B13E"/>`],
  privacy: ['tri', '#F2C94C', 30, 'dot', ``],
  hold: ['dome', '#F49AC1', 31.5, 'dot', `<path d="M10.4 26.6c0-8.2 6-13.8 13.6-13.8s13.6 5.6 13.6 13.8c-2.2-2.2-4.6-3.2-7.6-3.2H18c-3 0-5.4 1-7.6 3.2z" fill="#F3EFE6"/><path d="M13 20.6c3-1.6 6.6-2.4 11-2.4s8 .8 11 2.4" stroke="#D9D3C7" stroke-width="1" fill="none"/><circle cx="10.2" cy="26.4" r="2.6" fill="#F3EFE6" stroke="#D9D3C7" stroke-width=".7"/><circle cx="9.8" cy="30" r="2.6" fill="#F3EFE6" stroke="#D9D3C7" stroke-width=".7"/><circle cx="10.2" cy="33.6" r="2.6" fill="#F3EFE6" stroke="#D9D3C7" stroke-width=".7"/><circle cx="37.8" cy="26.4" r="2.6" fill="#F3EFE6" stroke="#D9D3C7" stroke-width=".7"/><circle cx="38.2" cy="30" r="2.6" fill="#F3EFE6" stroke="#D9D3C7" stroke-width=".7"/><circle cx="37.8" cy="33.6" r="2.6" fill="#F3EFE6" stroke="#D9D3C7" stroke-width=".7"/><path d="M21.6 39.4h4.8l-.6 2.4h-3.6z" fill="#fff" stroke="#D9D3C7" stroke-width=".6"/>`],
  research: ['tuft', '#3F8CF0', 30.5, 'dot', `<circle cx="20" cy="30.5" r="4.4" fill="#fff" fill-opacity=".3" stroke="#1E1E21" stroke-width="1.6"/><circle cx="28" cy="30.5" r="4.4" fill="#fff" fill-opacity=".3" stroke="#1E1E21" stroke-width="1.6"/><path d="M15.6 30h-2.2M32.4 30h2.2M23.6 29.6c.3-.4.5-.6.4-.6" stroke="#1E1E21" stroke-width="1.4" stroke-linecap="round"/>`],
  regulatory: ['dome', '#E04FD3', 30, 'dot', `<g transform="translate(29.6 22.4)"><path d="M6.6 1v14M2.6 16h8" stroke="#C99A2E" stroke-width="1.3" stroke-linecap="round"/><path d="M.6 3.4h12" stroke="#C99A2E" stroke-width="1.3" stroke-linecap="round"/><path d="M1.6 3.6-.4 8.4M1.6 3.6l2 4.8M11.6 3.6l-2 4.8M11.6 3.6l2 4.8" stroke="#C99A2E" stroke-width=".6"/><path d="M-1 8.4h5.2a2.6 2.6 0 0 1-5.2 0zM9 8.4h5.2a2.6 2.6 0 0 1-5.2 0z" fill="#E8B13E"/><circle cx="6.6" cy="1" r="1.1" fill="#E8B13E"/></g>`],
  signature: ['dome', '#E25555', 29, 'dot', `<g transform="rotate(-38 36 33)"><rect x="33.4" y="24" width="5.2" height="15" rx="2.4" fill="#1F1F22"/><rect x="33.4" y="30.6" width="5.2" height="1.4" fill="#D9AE4C"/><rect x="37.4" y="24.8" width=".9" height="6" rx=".45" fill="#D9AE4C"/><path d="M33.8 39h4.4L36 43.4z" fill="#D9AE4C"/><path d="M36 40.4v2.4" stroke="#1F1F22" stroke-width=".5"/></g>`],
  triage: ['tri', '#5BC0EB', 31, 'dot', `<path d="M11.6 31c0-9 5.4-14.6 12.4-14.6S36.4 22 36.4 31" stroke="#2A2A2E" stroke-width="2.2" fill="none"/><rect x="8.6" y="28" width="5.4" height="8.6" rx="2.4" fill="#2A2A2E"/><path d="M12.4 35.6c1 2.6 3.6 4 6.6 4" stroke="#2A2A2E" stroke-width="1.6" fill="none" stroke-linecap="round"/><circle cx="19.6" cy="39.6" r="1.6" fill="#2A2A2E"/>`],
  summary: ['cloud', '#A8D84A', 30, 'dot', `<rect x="15.4" y="27.6" width="8" height="5.4" rx="1.4" fill="#fff" fill-opacity=".3" stroke="#1E1E21" stroke-width="1.4"/><rect x="24.6" y="27.6" width="8" height="5.4" rx="1.4" fill="#fff" fill-opacity=".3" stroke="#1E1E21" stroke-width="1.4"/><path d="M23.4 29.4h1.2M13.6 29h1.8M32.6 29h1.8" stroke="#1E1E21" stroke-width="1.2" stroke-linecap="round"/>`],
  translate: ['cloud', '#2FB58A', 30, 'dot', ``],
  minutes: ['dome', '#F2733A', 29, 'dot', `<g transform="rotate(-30 36 32)"><rect x="31" y="25.4" width="10" height="5.4" rx="1.8" fill="#7A4A2E"/><rect x="31" y="25.4" width="2" height="5.4" rx=".8" fill="#5E3820"/><rect x="39" y="25.4" width="2" height="5.4" rx=".8" fill="#5E3820"/><rect x="35.1" y="30.4" width="1.8" height="11" rx=".9" fill="#A97452"/></g>`],
  trademark: ['heart', '#E04FD3', 24, 'dot', `<path d="M21 36.4l-1.6 5.4 2.6-1.2 1.4 2.2.6-5.4zM27 36.4l1.6 5.4-2.6-1.2-1.4 2.2-.6-5.4z" fill="#3F6FCF"/><circle cx="24" cy="33.6" r="4.6" fill="#E8B13E"/><circle cx="28.60" cy="33.60" r="1" fill="#E8B13E"/><circle cx="27.98" cy="35.90" r="1" fill="#E8B13E"/><circle cx="26.30" cy="37.58" r="1" fill="#E8B13E"/><circle cx="24.00" cy="38.20" r="1" fill="#E8B13E"/><circle cx="21.70" cy="37.58" r="1" fill="#E8B13E"/><circle cx="20.02" cy="35.90" r="1" fill="#E8B13E"/><circle cx="19.40" cy="33.60" r="1" fill="#E8B13E"/><circle cx="20.02" cy="31.30" r="1" fill="#E8B13E"/><circle cx="21.70" cy="29.62" r="1" fill="#E8B13E"/><circle cx="24.00" cy="29.00" r="1" fill="#E8B13E"/><circle cx="26.30" cy="29.62" r="1" fill="#E8B13E"/><circle cx="27.98" cy="31.30" r="1" fill="#E8B13E"/><circle cx="24" cy="33.6" r="2.8" fill="#F5CF6B" stroke="#C99A2E" stroke-width=".7"/>`],
  policy: ['squircle', '#8B6CF0', 28.5, 'dot', `<path d="M16 31.6h8a4 4 0 0 1-8 0zM24 31.6h8a4 4 0 0 1-8 0z" fill="#fff" fill-opacity=".3" stroke="#1E1E21" stroke-width="1.4"/><path d="M14.2 31h1.8M32 31h1.8" stroke="#1E1E21" stroke-width="1.3" stroke-linecap="round"/>`],
  invoice: ['dome', '#F2C94C', 29.5, 'dot', ``],
  employment: ['squircle', '#3F8CF0', 27.5, 'dot', ``],
};
function agCrew(k) {
  const open = `<svg class="ag-ic ag-ic--crew" data-k="${k}" data-style="crew" viewBox="0 0 48 48" aria-hidden="true">`;
  const ground = '<ellipse cx="24" cy="41.4" rx="15" ry="1.5" fill="#000" opacity=".08"/>';
  const lit = (id, c) => `<radialGradient id="${id}" gradientUnits="userSpaceOnUse" cx="18" cy="20" r="27"><stop offset="0" stop-color="${agMix(c, '#ffffff', .42)}"/><stop offset=".55" stop-color="${c}"/><stop offset="1" stop-color="${agMix(c, '#000000', .22)}"/></radialGradient>`;
  const eyes = (x, y, s = 1) => `<g class="ag-eyes"><ellipse cx="${x - 4 * s}" cy="${y}" rx="${1.9 * s}" ry="${2.2 * s}" fill="#141416"/><ellipse cx="${x + 4 * s}" cy="${y}" rx="${1.9 * s}" ry="${2.2 * s}" fill="#141416"/><circle cx="${x - 3.4 * s}" cy="${y - .8 * s}" r="${.65 * s}" fill="#fff"/><circle cx="${x + 4.6 * s}" cy="${y - .8 * s}" r="${.65 * s}" fill="#fff"/></g>`;
  if (k === 'entity' || !AGC[k]) {
    const trio = [['#5BC0EB', 24, 16, 9], ['#8B6CF0', 15, 30, 9.6], ['#F2733A', 33, 30, 9.6]];
    return open + `<defs>${trio.map(([c], i) => lit(`agc-${k}-${i}`, c)).join('')}</defs>` + ground
      + trio.map(([c, x, y, r], i) => `<g class="ag-body"><circle cx="${x}" cy="${y}" r="${r}" fill="url(#agc-${k}-${i})" stroke="#fff" stroke-width="1.6"/>${eyes(x, y, .6)}</g>`).join('') + '</svg>';
  }
  const [body, c, ey, eyeKind, wear, back] = AGC[k];
  const id = `agc-${k}`;
  return open + `<defs>${lit(id, c)}</defs>` + ground + (back ? `<g class="ag-badge">${back}</g>` : '')
    + `<g class="ag-body"><g fill="url(#${id})">${AGC_BODY[body]}</g><ellipse cx="17" cy="${body === 'heart' ? 18 : 24}" rx="3.4" ry="2" transform="rotate(-30 17 ${body === 'heart' ? 18 : 24})" fill="#fff" opacity=".32"/></g>`
    + (eyeKind === 'dot' ? eyes(24, ey) : '')
    + (wear ? `<g class="ag-badge">${wear}</g>` : '') + '</svg>';
}

const agIcon = (k) => agStyle() === 'bot' ? agBot(k) : agStyle() === 'buddy' ? agBuddy(k) : agStyle() === 'crew' ? agCrew(k) : agMark(k);
/* I cycles the families, on Agents and on an agent's screen; the choice is kept */
document.addEventListener('keydown', (e) => {
  if ((e.key !== 'i' && e.key !== 'I') || e.metaKey || e.ctrlKey || e.altKey) return;
  if (typeof state === 'undefined' || state.view !== 'agents') return;
  if (e.target.closest?.('input, textarea, [contenteditable="true"]')) return;
  const i = AG_STYLES.findIndex(x => x[0] === agStyle());
  state.agIconStyle = AG_STYLES[(i + 1) % AG_STYLES.length][0]; save();
  if (typeof agbPaint === 'function' && /^build/.test(MX.agents.open || '')) agbPaint(); else go('agents');
  pbToast(`Icons: ${AG_STYLES.find(x => x[0] === state.agIconStyle)[1]}`);
});

/* legal's agents: what each one is called, and what it does, in a line */
const LEGAL_AGENTS = [
  { id: 'nda',        name: 'NDA Reviewer',        say: 'Reviews NDAs against your playbook', by: 'me', star: true },
  { id: 'redline',    name: 'Contract Redliner',   say: 'Marks up drafts to your positions', by: 'Grace Coleman', shared: true },
  { id: 'clause',     name: 'Clause Finder',       say: 'Finds any clause across signed contracts', by: 'me', star: true },
  { id: 'obligation', name: 'Obligation Tracker',  say: 'Tracks renewals, notice periods and deadlines', by: 'Elena Petrova', shared: true },
  { id: 'diligence',  name: 'Due Diligence',       say: 'Reviews data rooms and flags the risks', by: 'Matt Rivera' },
  { id: 'playbook',   name: 'Playbook Builder',    say: 'Turns past deals into negotiating positions', by: 'me' },
  { id: 'privacy',    name: 'Privacy Reviewer',    say: 'Checks DPAs and international data transfers', by: 'Aisha Rahman', star: true, shared: true },
  { id: 'hold',       name: 'Litigation Hold',     say: 'Issues holds and tracks every acknowledgement', by: 'Matt Rivera' },
  { id: 'research',   name: 'Legal Research',      say: 'Answers legal questions with cited sources', by: 'Elena Petrova', star: true },
  { id: 'regulatory', name: 'Regulatory Watch',    say: 'Flags new rules that affect you', by: 'me' },
  { id: 'signature',  name: 'Signature Chaser',    say: 'Sends for signature and chases signers', by: 'Grace Coleman', shared: true },
  { id: 'triage',     name: 'Intake Triage',       say: 'Routes each request to the right lawyer', by: 'me', star: true },
  { id: 'summary',    name: 'Contract Summary',    say: 'Turns long agreements into one-page briefs', by: 'Elena Petrova' },
  { id: 'translate',  name: 'Contract Translator', say: 'Translates contracts, keeping defined terms intact', by: 'Matt Rivera', shared: true },
  { id: 'entity',     name: 'Entity Manager',      say: 'Keeps company records and filings current', by: 'Aisha Rahman' },
  { id: 'minutes',    name: 'Board Minutes',       say: 'Drafts minutes and resolutions from notes', by: 'me' },
  { id: 'trademark',  name: 'Trademark Watch',     say: 'Spots conflicting trademark filings early', by: 'Matt Rivera' },
  { id: 'policy',     name: 'Policy Assistant',    say: 'Answers staff questions from company policy', by: 'Grace Coleman', shared: true },
  { id: 'invoice',    name: 'Invoice Reviewer',    say: 'Checks law-firm bills against your guidelines', by: 'me' },
  { id: 'employment', name: 'Employment Advisor',  say: 'Drafts offers and checks local rules', by: 'Elena Petrova' },
];

/* where Agents is: the cards, or a new agent being described (kept off the address, which the router does not know) */
/* where Agents is lives in MX.agents.open (modules.js), so each screen has an address: #agents/new, #agents/build, #agents/<id> */

/* the cards, under tabs as Vault has them: all of legal's agents, the ones you starred, yours, and ones shared with you */
const AG_ST = { tab: 'all', find: '' };
/* the agents you see: legal's, and the one you built in conversation once it is published */
const agAll = () => (typeof AGB_AGENT !== 'undefined' && state.agBuilt ? [AGB_AGENT, ...LEGAL_AGENTS] : LEGAL_AGENTS);
const agentById = (id) => LEGAL_AGENTS.find(x => x.id === id) || (typeof AGB_AGENT !== 'undefined' && state.agBuilt && id === AGB_AGENT.id ? AGB_AGENT : null);
const agStarred = (a) => state.agStar?.[a.id] ?? !!a.star;
const AG_TABS = [['all', 'All', () => true], ['star', 'Starred', (a) => agStarred(a)], ['mine', 'Yours', (a) => a.by === 'me'], ['shared', 'Shared with you', (a) => a.shared]];
function agentsView() {
  const open = MX.agents.open;
  if (open === 'new') return agentCreatePage();
  if (open && /^build/.test(open)) return agentBuildView(open);
  if (open && agentById(open)) return agentChatPage(agentById(open));
  /* a star at the top right: gold and always there once starred, on hover until then; kept with your state */
  const STAR = '<svg viewBox="0 0 24 24" width="17" height="17" stroke-linejoin="round"><path d="M12 3.6l2.5 5.2 5.7.8-4.1 4 1 5.6L12 16.5l-5.1 2.7 1-5.6-4.1-4 5.7-.8z"/></svg>';
  const card = (a) => {
    const star = h('button', { class: 'ag-star' + (agStarred(a) ? ' is-on' : ''), type: 'button', html: STAR,
      'aria-pressed': String(agStarred(a)), 'aria-label': agStarred(a) ? 'Unstar' : 'Star', 'data-tip': agStarred(a) ? 'Unstar' : 'Star',
      onclick: (e) => { e.stopPropagation(); (state.agStar ||= {})[a.id] = !agStarred(a); save(); paint(); } });
    const open = () => mxOpen('agents', a.built ? 'build/done' : a.id);
    return h('div', { class: 'ag-card', role: 'button', tabindex: '0', 'data-id': a.id, onclick: open, onkeydown: (e) => { if (e.key === 'Enter' && e.target === e.currentTarget) open(); } }, star,
      h('span', { class: 'ag-mark', html: agIcon(a.mark || a.id) }),
      h('span', { class: 'ag-name' }, a.name),
      h('span', { class: 'ag-say' }, a.say));
  };
  const add = h('button', { class: 'btn btn--primary pb-new', type: 'button', onclick: () => mxOpen('agents', 'new') },
    icon('plus', 'ico ico-14'), 'New Agent');
  const grid = h('div', { class: 'ag-grid' });
  const empty = h('p', { class: 'pb-empty ag-empty' });
  const ink = h('span', { class: 'pb-tab-bar', 'aria-hidden': 'true' });
  const tabs = h('div', { class: 'pb-tabs', role: 'tablist' });
  const placeInk = () => { const on = tabs.querySelector('[aria-selected="true"]'); if (!on?.offsetWidth) return;
    ink.style.width = on.offsetWidth + 'px'; ink.style.transform = `translateX(${on.offsetLeft}px)`; ink.classList.add('is-placed'); };
  const paint = () => {
    const q = AG_ST.find.trim().toLowerCase();
    tabs.replaceChildren(...AG_TABS.map(([k, label, test]) => h('button', { class: 'pb-tab', type: 'button', role: 'tab', 'data-k': k,
      'aria-selected': String(k === AG_ST.tab), onclick: () => { AG_ST.tab = k; paint(); } },
      label, h('span', { class: 'pb-tab-n' }, String(agAll().filter(test).length)))), ink);
    placeInk(); if (!ink.classList.contains('is-placed')) requestAnimationFrame(placeInk);
    const test = AG_TABS.find(t => t[0] === AG_ST.tab)[2];
    const list = agAll().filter(test).filter(a => !q || (a.name + ' ' + a.say).toLowerCase().includes(q));
    grid.replaceChildren(...list.map(card));
    empty.textContent = q ? `Nothing matches “${AG_ST.find.trim()}”.` : 'Nothing here yet.';
    empty.hidden = list.length > 0;
  };
  const qIn = h('input', { type: 'search', placeholder: 'Search agents', 'aria-label': 'Search agents', value: AG_ST.find,
    oninput: (e) => { AG_ST.find = e.target.value; paint(); },
    onkeydown: (e) => { if (e.key === 'Escape') { e.target.value = ''; AG_ST.find = ''; paint(); } } });
  const search = h('div', { class: 'pb-find pb-list-find is-open' },
    h('button', { class: 'pb-find-btn', type: 'button', 'aria-label': 'Search agents', html: PB_SVG.search, onclick: () => qIn.focus() }), qIn);
  paint();
  return mxListPage('Agents', add, h('div', { class: 'pb-card ag-wrap' }, h('div', { class: 'pb-bar-list' }, tabs, search), grid, empty));
}

/* a new agent, and each agent, open on the same screen as a new playbook: a mark, a name, one box.
   New Agent has the quill and "Create New Agent"; an agent has its own mark, moving, and its name */
function agentScreen({ glyph, title, label, placeholder, run, prefill = '', head = null }) {
  const ta = h('textarea', { rows: '2', 'aria-label': label, placeholder });
  ta.value = prefill;
  const send = h('button', { class: 'send', type: 'button', disabled: true, 'aria-label': 'Send', html: ARROW });
  const box = h('div', { class: 'ask pb-create-ask' }, ta, h('div', { class: 'askbar' }, send));
  let composer = null;
  const addFile = (name, mark) => composer?.addPill({ kind: 'file', label: name, mark });
  const file = h('input', { type: 'file', multiple: true, hidden: true,
    onchange: (e) => { for (const f of e.target.files) addFile(f.name, PB_UPLOAD); e.target.value = ''; } });
  box.append(file);
  const attach = [
    { label: 'Upload files', mark: PB_UPLOAD, run: () => file.click() },
    ...Object.entries(PB_SOURCES).map(([id, src]) => ({ label: src.name, mark: pbBrand(id),
      run: () => sourcePicker(id, (names) => names.forEach(n => addFile(n, pbBrand(id)))) })),
  ];
  const syncSend = () => { send.disabled = !(ta.value.trim() || composer?.pills.some(p => p.kind === 'file')); };
  ta.addEventListener('input', syncSend);
  new MutationObserver(syncSend).observe(box, { childList: true, subtree: true });
  const page = h('div', { class: 'home pb-create' },
    h('button', { class: 'pb-create-back', type: 'button', onclick: () => { mxClose('agents'); go('agents'); } },
      h('span', { class: 'pb-create-back-ar', html: PB_SVG.chev }), 'Agents'),
    h('div', { class: 'home-head' }, glyph, h('h1', { class: 'display' }, title)),
    h('div', { class: 'askwrap' }, box));
  queueMicrotask(() => {
    composer = initComposer(box, { noModel: true, noTokens: true, attach,
      onSend: (_, { pills }) => { const files = pills.filter(p => p.kind === 'file').map(p => p.label); run(ta.value.trim(), files); } });
    syncSend();
  });
  const focus = () => { if (page.isConnected) ta.focus({ preventScroll: true }); };
  setTimeout(focus, 0); setTimeout(focus, 120);
  return page;
}
function agentCreatePage(prefill = '') {
  return agentScreen({ glyph: quillEl('greet', { cls: 'home-glyph', then: 'idle' }), title: 'Create New Agent', label: 'Describe the agent', prefill,
    placeholder: 'Describe what the agent should do, or add relevant files',
    run: (text, files) => agentBuildStart(text, files) });
}
function agentChatPage(a) {
  const glyph = h('span', { class: 'home-glyph ag-hero', html: agIcon(a.mark || a.id) });
  const play = (typeof AG_PLAY !== 'undefined' && AG_PLAY[a.id]) || null;
  const run = (text, files) => {
    const brief = text || `Please look at ${files.join(', ')}`;
    /* the chat it opens is the house chat: working shown, an answer, ways on */
    const steps = (play?.steps || [{ source: 'think', query: `${a.name} read your request` }]).map(x => ({ ...x }));
    /* the reply arrives as it does in any new chat: the working step by step, then the answer */
    openSession({ id: 'agent-' + a.id + '-' + Date.now(), label: a.name, meta: 'now', people: [{ name: USER.name, online: true, owner: true }],
      messages: [{ role: 'user', text: brief }, { role: 'bot', cites: null, steps: [], answer: '', suggest: [] }] });
    const m = thread?.messages?.[1]; if (!m) return;
    m.thinking = true; m.steps = [];
    const wait = (ms) => new Promise(r => setTimeout(r, Math.round(ms * (typeof PACE_SCALE === 'number' ? PACE_SCALE : 1))));
    (async () => {
      await wait(450); renderBot(m);
      for (const st of steps) {
        m.steps.push({ ...st, running: true }); renderBot(m); await wait(st.rows ? 1300 : 950);
        m.steps[m.steps.length - 1].running = false; renderBot(m);
      }
      await wait(500);
      m.thinking = false; m.traceOpen = false; m.text = play?.answer || `${a.name} is on it.`; m.suggest = play?.suggest || [];
      renderBot(m);
    })();
  };
  const page = agentScreen({ glyph, title: a.name, label: `Ask ${a.name}`, placeholder: `${a.say}. Tell it what you need, or add files`, run });
  /* three ways in, so the screen is never empty: the chat's own suggestion rows */
  if (play?.starts?.length) page.querySelector('.askwrap')?.after(h('div', { class: 'sugg ag-starts' },
    h('div', { class: 'sugg-h' }, 'Try'),
    ...play.starts.map(t => h('button', { class: 'sugg-it', type: 'button', onclick: () => run(t, []) },
      h('span', { class: 'sugg-ar', html: '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6v7a3 3 0 0 0 3 3h7M15 12l4 4-4 4"/></svg>' }), t))));
  return page;
}

/* ════════════════════════════════════════════════════════════════
   reviews-extra.js: what Clavia adds to the saved reviews.

   reviews-data.js is exported from Jev and is overwritten whenever it
   is exported again, so anything written here by hand lives apart
   from it. Each entry names a review and, by clause number, the
   wordings on offer for that clause: the label to show for one that
   is already there, or a whole new option. A new option carries only
   its text; review.js redlines it against the clause when the page
   opens.
   ════════════════════════════════════════════════════════════════ */
const JV_REVIEW_EXTRA = {
  /* Acme's implementation SOW: every flagged clause offers the starting
     position and two fallbacks, the second conceding a little more */
  'acme-sow': {
    2: [
      { key: 'fallback', label: 'Fallback 1' },
      { key: 'fallback2', label: 'Fallback 2', lands: 'Fallback',
        text: 'Each deliverable is accepted unless Customer rejects it in writing within twenty (20) business days of delivery, identifying specific ways it does not conform to this SOW. Provider will correct and resubmit a rejected deliverable up to three (3) times.' },
    ],
    4: [
      { key: 'fallback', label: 'Fallback 1' },
      { key: 'fallback2', label: 'Fallback 2', lands: 'Fallback',
        text: 'On payment in full, Customer owns all deliverables under this SOW, excluding Provider\'s pre-existing intellectual property, tools and platform, which Provider licenses to Customer on a non-exclusive, perpetual and royalty-free basis to use, modify and maintain the deliverables.' },
    ],
    6: [
      { key: 'fallback', label: 'Fallback 1', lands: 'Fallback',
        text: 'Provider will perform the services in a professional and workmanlike manner. If Customer reports non-conforming services within forty-five (45) days, Provider will re-perform them, which is Customer’s sole remedy.' },
      { key: 'fallback2', label: 'Fallback 2', lands: 'Fallback',
        text: 'Provider will perform the services in a professional and workmanlike manner. If Customer reports non-conforming services in writing within sixty (60) days, describing the non-conformity in reasonable detail, Provider will re-perform them, which is Customer’s sole remedy.' },
    ],
  },
};

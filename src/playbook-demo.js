/* ------------------------------------------------------------------
   A playbook made from uploaded documents, as a link (16 Oct).

   #playbooks/new/upload — Create New Playbook with the brief written and
   four documents added (three from SharePoint, one uploaded), and the
   build started: it reads them, drafts, and opens the playbook beside its
   conversation. That conversation keeps one address,
   #chat/pb-ses-pb-reseller-upload, so a reload or a shared link lands
   back on it with the files on the first message.
------------------------------------------------------------------ */

const PB_DEMO = {
  id: 'pb-reseller-upload',
  text: 'Reseller agreement playbook for when we sell through channel partners. Build it from our standard terms, the fallback clause library, the Northwind deal we signed and Grace’s notes on what we give up.',
  files: [
    { name: 'Reseller Agreement – Standard Terms v3.docx', src: 'sharepoint' },
    { name: 'Fallback Clause Library.xlsx', src: 'sharepoint' },
    { name: 'Northwind MSA – Executed.pdf', src: 'sharepoint' },
    { name: 'Reseller positions – Grace’s notes.docx' },
  ],
};

/* the build from the start: the old copy goes, so the link always shows it being made */
function pbDemoStart() {
  const list = pbList(), i = list.findIndex(p => p.id === PB_DEMO.id);
  if (i >= 0) { list.splice(i, 1); save(); }
  PB.open = 'new'; PB.prompt = PB_DEMO.text;
  PB.demo = { files: PB_DEMO.files, go: 1800 };
  PB.fixedId = PB_DEMO.id;
  if (state.view === 'playbooks') view.replaceChildren(playbooksView());
  go('playbooks');
}

/* its conversation, made again when the link is opened somewhere it was never built */
function pbDemoSession() {
  let pb = pbFind(PB_DEMO.id);
  if (!pb) {
    const base = PLAYBOOK_SEED.find(p => p.id === 'saas');
    pb = pbNew({ name: draftName(PB_DEMO.text) || base.name, description: PB_DEMO.text,
      clauses: structuredClone(base.clauses).map(c => pbNormClause({ ...c, id: pbUid('clause') })) });
    pb.id = PB_DEMO.id;
    pbList().unshift(pb); save();
  }
  if (thread?.id === 'pb-ses-' + pb.id) return true;
  pbEditInChat(pb, pbBuiltIntro(pb, PB_DEMO.text, PB_DEMO.files));
  return true;
}

(() => {
  const prev = openByHash;
  openByHash = function (hash) {
    if (hash === 'playbooks/new/upload') { pbDemoStart(); return true; }
    return prev(hash);
  };
  const prevSes = pbSessionRoute;
  pbSessionRoute = function (id) {
    if (id === 'pb-ses-' + PB_DEMO.id) return pbDemoSession();
    return prevSes(id);
  };
  /* boot may already have routed the address it was opened at */
  const first = (() => { try { return new URL(performance.getEntriesByType('navigation')[0]?.name || location.href).hash.slice(1); } catch { return ''; } })();
  if (first === 'playbooks/new/upload' || first === 'chat/pb-ses-' + PB_DEMO.id) openByHash(first);
})();

/* ==================================================================
   Skills — what they start with.

   A skill is how we do one piece of legal work, written down once: when
   to use it, what it needs from you, the steps in plain English, the
   playbooks and templates it leans on, and what it hands back. Written
   in the first person, like the playbooks: "our playbook", "we".

   SK_SEED is the team's own; SK_LIBRARY is what ships with Clavia and
   is added from New Skill › Choose from Library. Bump SK_SEED_V when
   the seed changes shape, so a saved copy is refreshed.
================================================================== */
const SK_SEED_V = 3;

const SK_AREAS = ['Commercial', 'Privacy', 'Corporate', 'Employment', 'General'];
const SK_OUTPUTS = ['Redline', 'Memo', 'Table', 'Draft', 'Answer', 'Checklist'];
const SK_ACCESS = {
  me:      { label: 'Only me' },
  legal:   { label: 'Legal team' },
  company: { label: 'Everyone at the company', note: 'they can run it, not read it' },
};

const SK_SEED = (() => {
  const R = 'Roger Bennett', G = 'Grace Coleman', M = 'Matt Rivera',
    A = 'Aisha Rahman', E = 'Elena Petrova', J = 'James Whitfield';
  const at = (d, t = '10:00') => `2026-${d}T${t}:00`;
  const v = (n, by, d, note) => ({ v: n, by, at: at(d, '11:30'), note });

  /* who runs a skill, on what, from where — spread back over the weeks
     before today, newest first, so the Runs tab reads like real use */
  const LEGAL = [R, G, M, A, E, J, 'Nina Alvarez', 'Marcus Lee'];
  const BIZ = ['Priya Shah', 'Daniel Okafor', 'Hannah Lee', 'Tom Becker', 'Sofia Marin'];
  const runs = (n, on, who, from, seed) => {
    const out = [];
    let t = Date.parse('2026-10-08T16:40:00'), r = seed;
    const rnd = () => (r = (r * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < n; i++) {
      t -= (3 + rnd() * 40) * 36e5;
      const d = new Date(t);
      if (d.getHours() < 8) d.setHours(9 + Math.floor(rnd() * 3), Math.floor(rnd() * 60));
      /* a file that belongs to a request was run from that request */
      const pick = on[Math.floor(rnd() * on.length)], [file, rq] = [].concat(pick);
      out.push({ by: who[Math.floor(rnd() * who.length)], on: file,
        from: rq && rnd() < .6 ? rq : from[Math.floor(rnd() * from.length)], at: d.toISOString() });
    }
    return out;
  };

  return [
    { id: 'sk-nda', name: 'Triage an Inbound NDA', area: 'Commercial', status: 'live', owner: G, updated: at('10-02', '15:10'),
      output: 'Redline', access: 'company',
      about: 'When a counterparty sends us their NDA. Checks it against our Mutual NDA playbook and says whether it can be signed as it is.',
      asks: [{ label: 'Their NDA', kind: 'Document' }, { label: 'Who shares confidential information', kind: 'Answer', optional: true }],
      steps: [
        'Ask for their NDA, and whether both sides are sharing confidential information if that is not clear.',
        'Read it in full, including any schedules.',
        'Check each clause against our Mutual NDA playbook. Use our starting position where they match it, and a fallback only where their wording is already close to it.',
        'Mark the NDA green if every clause is within our positions, amber if our fallbacks cover it, and red if anything is not acceptable.',
        'For amber, redline their draft to the wording in our Mutual NDA template and say in one line why each change matters.',
        'For red, do not redline. Send it to legal as a request, with the clauses that need a lawyer listed first.',
        'Look for non-solicitation and non-compete wording. Neither belongs in an NDA; treat either as red.',
        'Never tell the business it can sign anything marked amber or red.',
      ],
      uses: [{ kind: 'playbook', id: 'nda' }, { kind: 'template', id: 'mutual-nda' }],
      versions: [
        v(4, G, '10-02', 'Added the check for non-solicitation and non-compete wording'),
        v(3, R, '09-15', 'Opened it to everyone at the company'),
        v(2, G, '08-28', 'Sends red NDAs to legal as a request instead of redlining them'),
        v(1, G, '08-12', 'First version'),
      ],
      runs: runs(38, [['Northwind NDA – their draft.docx', 'RQ-1048'], 'Halden Mutual NDA.pdf', 'Trellis confidentiality agreement.docx', 'Brightwell NDA v2.docx',
        'Kestrel – mutual NDA (their paper).docx', 'Oakridge Labs NDA.pdf', 'Meridian Health NDA.docx'], [...BIZ, G, M], ['Chat'], 7) },

    { id: 'sk-redline', name: 'Summarise Their Redline', area: 'Commercial', status: 'live', owner: G, updated: at('09-30', '12:05'),
      output: 'Memo', access: 'legal',
      about: 'When a counterparty returns our paper with changes. Lists what they changed, clause by clause, and what each change costs us.',
      asks: [{ label: 'Their redline', kind: 'Document' }, { label: 'Our last version', kind: 'Document', optional: true }],
      steps: [
        'Ask for their redline, and our last version if it is not on the request.',
        'Compare their version with the last one we sent. If ours is not attached, use the latest version on the request.',
        'List every change in the order it appears, quoting their new wording.',
        'Leave out formatting and numbering changes, but say how many there were.',
        'For each change, say whether our SaaS subscription agreement playbook (or the Professional services / SOW playbook, for services) accepts it, has a fallback for it, or rejects it.',
        'Close with the changes worth a call rather than an email, at most three.',
      ],
      uses: [{ kind: 'playbook', id: 'saas' }, { kind: 'playbook', id: 'services' }],
      versions: [
        v(3, G, '09-30', 'Leaves out formatting changes and counts them instead'),
        v(2, M, '09-08', 'Uses the latest version on the request when ours is not attached'),
        v(1, G, '08-19', 'First version'),
      ],
      runs: runs(24, [['Acme redline – MSA v3.docx', 'RQ-1047'], 'Brightwell MSA – their redline v3.docx', 'Northwind NDA v3 (Northwind redline).docx',
        'Trellis order form – marked up.docx', 'Halden SOW – comments.docx'], [G, M, E, R], ['Chat'], 13) },

    { id: 'sk-dpa', name: 'Review a Customer DPA', area: 'Privacy', status: 'live', owner: A, updated: at('09-26', '09:40'),
      output: 'Redline', access: 'legal',
      about: 'When a customer asks us to sign their data processing addendum instead of ours.',
      asks: [{ label: 'Their DPA', kind: 'Document' }, { label: 'Where their data is hosted', kind: 'Answer', optional: true }],
      steps: [
        'Ask for their DPA, and where their data is hosted if they know.',
        'Read it alongside our Data Processing Addendum template, and look in the Customer DPAs vault for what we have agreed with others before.',
        'Check sub-processors, breach notice, audit rights, international transfers and liability against our Data processing addendum playbook.',
        'Breach notice under 48 hours is not acceptable. Offer 48 hours, or 72 with an initial notice at 24.',
        'Where they ask for on-site audits, offer our SOC 2 report and one remote audit a year.',
        'Redline their paper to our positions, and list any change that needs the security team to confirm.',
      ],
      uses: [{ kind: 'playbook', id: 'dpa' }, { kind: 'template', id: 'dpa' }, { kind: 'vault', id: 'customer-dpas' }],
      versions: [
        v(2, A, '09-26', 'Breach notice fallback of 72 hours with an initial notice at 24'),
        v(1, A, '09-02', 'First version'),
      ],
      runs: runs(17, ['Brightwell DPA v1.docx', 'Halden DPA (customer paper).pdf', 'Kestrel data processing terms.docx', 'Oakridge Labs DPA.docx'],
        [A, G, 'Nina Alvarez'], ['Chat'], 21) },

    { id: 'sk-question', name: 'Answer a Business Question', area: 'General', status: 'live', owner: R, updated: at('09-24', '17:20'),
      output: 'Answer', access: 'company',
      about: 'When someone in the business asks legal a quick question. Answers from our policies and earlier advice, or sends it to a lawyer.',
      asks: [{ label: 'The question', kind: 'Answer' }],
      steps: [
        'Ask for the question in their own words.',
        'Search the Employment and HR policies vault, our SaaS subscription agreement playbook and earlier answers before anything else.',
        'Answer in plain English, in under 150 words, and name the policy or clause the answer rests on.',
        'If the answer depends on facts we do not have, ask for them rather than assume.',
        'If it needs judgement (a dispute, a regulator, or anything about a named employee), say so and open a request for legal instead of answering.',
      ],
      uses: [{ kind: 'vault', id: 'employment' }, { kind: 'playbook', id: 'saas' }],
      versions: [
        v(5, R, '09-24', 'Opens a request instead of answering anything about a named employee'),
        v(4, R, '09-10', 'Answers capped at 150 words'),
        v(3, 'Marcus Lee', '08-30', 'Opened it to everyone at the company'),
        v(2, R, '08-21', 'Searches earlier answers in Vault first'),
        v(1, R, '08-14', 'First version'),
      ],
      runs: runs(46, ['Can we use the customer’s logo on our website?', 'Do we need an NDA for a demo call?', 'Can I accept a gift from a supplier?',
        'Who can sign an order form over £100k?', 'Can we send customer data to a new analytics tool?'], BIZ, ['Chat'], 3) },

    { id: 'sk-draft-nda', name: 'Draft an NDA from Our Template', area: 'Commercial', status: 'live', owner: M, updated: at('09-18', '10:15'),
      output: 'Draft', access: 'company',
      about: 'When the business needs an NDA on our paper. Picks mutual or one-way and fills it in from what you tell it.',
      asks: [{ label: 'Who it is with', kind: 'Answer' }, { label: 'What the information is for', kind: 'Answer', optional: true }],
      steps: [
        'Ask who it is with, and what the information is for if they have not said.',
        'Use our Mutual NDA template unless only one side is sharing information; then use our One-way NDA template.',
        'Look up the counterparty’s registered name and address on the public register.',
        'Fill every blank. Leave the term at two years and governing law as England and Wales.',
        'Hand back a Word document ready to send, and say which blanks you filled and from where.',
      ],
      uses: [{ kind: 'template', id: 'mutual-nda' }, { kind: 'template', id: 'one-way-nda' }],
      versions: [v(2, M, '09-18', 'Looks up the registered name and address'), v(1, M, '08-25', 'First version')],
      runs: runs(29, ['Northwind Ltd', 'Halden Group', 'Oakridge Labs', 'Kestrel Industries', 'Meridian Health'], [...BIZ, M], ['Chat'], 31) },

    { id: 'sk-terms', name: 'Extract Key Terms', area: 'Commercial', status: 'live', owner: M, updated: at('09-12', '14:00'),
      output: 'Table', access: 'legal',
      about: 'When you need the same facts out of many contracts at once. Builds a review table in Vault, one row per contract.',
      asks: [{ label: 'The contracts', kind: 'Document' }, { label: 'Anything else to pull out', kind: 'Answer', optional: true }],
      steps: [
        'Ask for the contracts, and anything else to pull out beyond the usual terms.',
        'Make one row per contract and one column per term.',
        'Always pull out the parties, term, renewal, notice period, liability cap and governing law.',
        'Quote the clause each value came from, so it can be checked in one click.',
        'Where a contract is silent on a term, write “Not stated” rather than leave it blank.',
      ],
      uses: [],
      versions: [v(3, M, '09-12', 'Writes “Not stated” instead of a blank'), v(2, M, '08-29', 'Quotes the source clause'), v(1, G, '08-11', 'First version')],
      runs: runs(12, ['Supplier contracts — 2025 (34 files)', 'Customer DPAs (21 files)', 'Northwind data room — material contracts', 'Acme Corp — MSA negotiation'],
        [M, E, G], ['Vault', 'Chat'], 41) },

    { id: 'sk-renewal', name: 'Stop an Auto-renewal', area: 'Commercial', status: 'live', owner: M, updated: at('08-27', '16:30'),
      output: 'Draft', access: 'company',
      about: 'When a supplier contract is about to renew and we want out. Finds the notice period and drafts the notice.',
      asks: [{ label: 'The contract', kind: 'Document' }],
      steps: [
        'Ask for the contract.',
        'Find the renewal clause and the notice period, and work out the last day notice can be given.',
        'If that day has passed, say so plainly and do not draft anything.',
        'Otherwise draft the notice from our Notice of Non-renewal template, addressed as the contract requires.',
        'Say how the contract says notice must be delivered (email, post or both).',
      ],
      uses: [{ kind: 'template', id: 'non-renewal' }],
      versions: [v(1, M, '08-27', 'First version')],
      runs: runs(9, ['Zendesk order form 2024.pdf', 'Office cleaning contract.pdf', 'Datadog subscription.pdf', 'Travel agency agreement.docx'],
        ['Tom Becker', 'Hannah Lee', M], ['Chat'], 53) },

    { id: 'sk-dsar', name: 'Triage a Subject Access Request', area: 'Privacy', status: 'live', owner: A, updated: at('09-05', '11:50'),
      output: 'Checklist', access: 'legal',
      about: 'When someone asks for the personal data we hold on them. Sets the deadline and lists what to collect from whom.',
      asks: [{ label: 'The request', kind: 'Document' }],
      steps: [
        'Ask for the request as it arrived.',
        'Work out the date the request was received and the deadline: one calendar month, extendable by two if it is complex.',
        'Check whether we can confirm who is asking. If not, ask for ID before the clock matters.',
        'List the systems likely to hold their data and who owns each one.',
        'Flag anything that may need redacting: other people’s data, legal advice, references.',
      ],
      uses: [],
      versions: [v(2, A, '09-05', 'Asks for ID before anything else'), v(1, A, '08-18', 'First version')],
      runs: runs(6, ['DSAR – former employee (email).msg', 'Subject access request – customer.pdf', 'DSAR – job applicant.msg'], [A, 'Nina Alvarez'], ['Chat'], 61) },

    { id: 'sk-escalate', name: 'Write an Escalation Note', area: 'General', status: 'live', owner: R, updated: at('09-03', '09:15'),
      output: 'Memo', access: 'legal',
      about: 'When a negotiation needs the General Counsel’s decision. One page: what they want, what we offered, what it costs, what you recommend.',
      asks: [{ label: 'The request or contract', kind: 'Document' }, { label: 'What you recommend', kind: 'Answer', optional: true }],
      steps: [
        'Ask for the request or contract, and what you recommend if you have a view.',
        'Open with the decision needed, in one sentence, and by when.',
        'Say what they asked for and what we have offered so far, quoting the clause and the position in our SaaS subscription agreement playbook.',
        'Put a number on it where you can: the deal value, the cap, the exposure.',
        'End with your recommendation and the fallback if Roger says no.',
        'Keep it to one page.',
      ],
      uses: [{ kind: 'playbook', id: 'saas' }],
      versions: [v(1, R, '09-03', 'First version')],
      runs: runs(8, [['Acme redline – MSA v3.docx', 'RQ-1047'], 'Brightwell Energy — Enterprise MSA', 'Halden renewal', 'RQ-1044 · Trellis expansion'], [G, E, M], ['Chat'], 71) },

    { id: 'sk-board', name: 'Draft Board Minutes', area: 'Corporate', status: 'draft', owner: E, updated: at('10-06', '18:20'),
      output: 'Draft', access: 'legal',
      about: 'After a board meeting. Turns the agenda, papers and notes into minutes in our house format.',
      asks: [{ label: 'Agenda and board papers', kind: 'Document' }, { label: 'Notes from the meeting', kind: 'Document' }],
      steps: [
        'Ask for the agenda, the board papers and the notes from the meeting.',
        'Follow the agenda order and number each item.',
        'Record who attended, who sent apologies, and that a quorum was present.',
        'For each item, record the decision and any declared interests, not the discussion.',
        'Leave resolutions word for word as they appear in the board papers.',
      ],
      uses: [],
      versions: [],
      runs: runs(2, ['Board pack — September 2026.pdf'], [E], ['Test'], 83) },

    { id: 'sk-offer', name: 'Check an Offer Letter', area: 'Employment', status: 'draft', owner: J, updated: at('10-07', '10:05'),
      output: 'Redline', access: 'legal',
      about: 'Before an offer goes out. Checks the letter against our employment policies and the role’s approved terms.',
      asks: [{ label: 'The offer letter', kind: 'Document' }],
      steps: [
        'Ask for the offer letter.',
        'Check notice period, probation, restrictive covenants and bonus wording against our policies in the Employment and HR policies vault.',
        'Flag any promise that is not in our standard letter, such as guaranteed bonuses or extra leave.',
        'Redline anything outside policy and say who needs to approve it.',
      ],
      uses: [{ kind: 'vault', id: 'employment' }],
      versions: [],
      runs: runs(3, ['Offer – Senior Engineer (London).docx', 'Offer – Account Executive.docx'], [J], ['Test'], 97) },

    { id: 'sk-sow', name: 'Review a Statement of Work', area: 'Commercial', status: 'draft', owner: G, updated: at('10-08', '12:30'),
      output: 'Redline', access: 'me',
      about: 'When a services customer sends their statement of work. Checks scope, acceptance and change control against our services playbook.',
      asks: [{ label: 'Their statement of work', kind: 'Document' }],
      steps: [
        'Ask for their statement of work.',
        'Check that every deliverable has an acceptance test and a date.',
        'Deemed acceptance after ten working days is our starting position in the Professional services / SOW playbook.',
        'Anything outside scope must go through change control, priced at our rate card.',
      ],
      uses: [{ kind: 'playbook', id: 'services' }],
      versions: [],
      runs: [] },
  ];
})();

/* What ships with Clavia. Added as your own draft, to change before you publish it. */
const SK_LIBRARY = [
  { id: 'lib-supplier', name: 'Check a Supplier Agreement', area: 'Commercial', output: 'Redline',
    about: 'When procurement sends a supplier’s terms. Checks liability, data, termination and payment against our positions.',
    asks: [{ label: 'Their agreement', kind: 'Document' }],
    steps: ['Ask for their agreement.', 'Read the agreement and any order form with it.', 'Check liability, data protection, termination and payment terms against our supplier playbook.', 'Redline to our positions and list anything procurement should negotiate on price instead.'] },
  { id: 'lib-reseller', name: 'Review a Reseller Agreement', area: 'Commercial', output: 'Redline',
    about: 'When a partner wants to resell our product. Checks territory, exclusivity, pricing and brand use.',
    asks: [{ label: 'Their agreement', kind: 'Document' }],
    steps: ['Ask for their agreement.', 'Check territory and that nothing grants exclusivity.', 'Check the discount and payment terms against the partner programme.', 'Check how they may use our name and marks.'] },
  { id: 'lib-compare', name: 'Compare Two Versions', area: 'Commercial', output: 'Redline',
    about: 'When you need to see exactly what changed between two drafts of the same document.',
    asks: [{ label: 'The original', kind: 'Document' }, { label: 'The new version', kind: 'Document' }],
    steps: ['Ask for the original and the new version.', 'Line the two versions up clause by clause.', 'Mark every change as a redline on the new version.', 'Leave out changes to formatting and numbering.'] },
  { id: 'lib-security', name: 'Answer a Security Questionnaire', area: 'Privacy', output: 'Table',
    about: 'When a customer sends a security or privacy questionnaire. Answers from our earlier answers and policies.',
    asks: [{ label: 'The questionnaire', kind: 'Document' }],
    steps: ['Ask for the questionnaire.', 'Answer each question from our earlier questionnaires first, then our policies.', 'Mark any answer you are unsure of for the security team.', 'Never claim a certification we do not hold.'] },
  { id: 'lib-signing', name: 'Check Signing Authority', area: 'Corporate', output: 'Checklist',
    about: 'Before a contract is signed. Checks who can sign it under our delegation of authority.',
    asks: [{ label: 'The contract', kind: 'Document' }],
    steps: ['Ask for the contract.', 'Find the contract value and term.', 'Check who can sign at that value under our delegation of authority.', 'List the approvals needed before signing.'] },
  { id: 'lib-hold', name: 'Draft a Litigation Hold Notice', area: 'General', output: 'Draft',
    about: 'When a dispute is likely. Drafts the notice telling people to keep relevant documents.',
    asks: [{ label: 'What the dispute is about', kind: 'Answer' }, { label: 'Who should receive it', kind: 'Answer' }],
    steps: ['Ask what the dispute is about and who should receive the notice.', 'Describe the matter in neutral terms.', 'List the kinds of documents and systems to keep.', 'Say that normal deletion must stop, and who to ask.'] },
  { id: 'lib-chronology', name: 'Build a Chronology', area: 'General', output: 'Table',
    about: 'When you need the facts in date order from a set of emails and documents.',
    asks: [{ label: 'The documents', kind: 'Document' }],
    steps: ['Ask for the documents.', 'Pull out every dated event.', 'One row per event: date, what happened, who, and the source document.', 'Mark any date that is inferred rather than stated.'] },
  { id: 'lib-settlement', name: 'Review a Settlement Agreement', area: 'Employment', output: 'Redline',
    about: 'When an employee settlement is being agreed. Checks the waiver, confidentiality and payment terms.',
    asks: [{ label: 'The agreement', kind: 'Document' }],
    steps: ['Ask for the agreement.', 'Check the claims waived and that the adviser’s certificate is included.', 'Check confidentiality and that it allows protected disclosures.', 'Check the payment, tax treatment and timing.'] },
  { id: 'lib-translate', name: 'Translate a Contract', area: 'General', output: 'Draft',
    about: 'When you need a working English translation of a contract in another language.',
    asks: [{ label: 'The contract', kind: 'Document' }],
    steps: ['Ask for the contract.', 'Translate clause by clause, keeping the numbering.', 'Keep defined terms consistent throughout.', 'Mark wording where the legal meaning may not carry across.'] },
];

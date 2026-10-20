/* ------------------------------------------------------------------
   What the review pane knows beyond the playbook's own words (17 Oct).

   Scripted for the demo, on Acme's redline of our MSA (REQ-149), and
   kept coherent with the rest of Clavia: the same people, the same
   customers, the same playbook. Per rule: why we hold it, the comment
   we usually send, who signs off outside it, how often Clavia matched
   our lawyers on past contracts, and what our own signed deals say.
   Per contract: how the run was set up, the counterparty's history,
   what their changes add up to, and their comments in the Word file.
------------------------------------------------------------------ */

/* who decides when a clause is outside the playbook, by the role the playbook names */
const RP_OWNER = {
  'General Counsel': 'Grace Coleman', 'Deputy General Counsel': 'Matt Rivera', 'Privacy Counsel': 'Meera Nair',
  'Product Counsel': 'Matt Rivera', 'Corporate Counsel': 'Matt Rivera', 'VP Finance': 'Dev Anand',
  'Deal Desk': 'Rachel Okafor', 'VP Customer Success': 'Rachel Okafor',
};

/* past deals the benchmarks point at: our signed MSAs over £1M */
const RP_DEALS = [
  { name: 'Harbor Retail', when: 'Mar 2026', value: '£1.6M', cap: '24 months + 2× data breach', breach: '48 hours', tfc: 'No', pay: '45 days', law: 'Delaware' },
  { name: 'Trellis Health', when: 'Jan 2026', value: '£2.1M', cap: '24 months + 2× data breach', breach: '72 hours', tfc: 'End of term, no refund', pay: '30 days', law: 'Delaware' },
  { name: 'Vantage Systems', when: 'Nov 2025', value: '£1.2M', cap: '12 months', breach: '72 hours', tfc: 'No', pay: '45 days', law: 'California' },
  { name: 'Brightwell', when: 'Oct 2025', value: '£1.1M', cap: '12 months', breach: 'Without undue delay', tfc: 'No', pay: '30 days', law: 'Delaware' },
  { name: 'Sentinel Health', when: 'Sep 2025', value: '£3.4M', cap: '24 months + 2× data breach', breach: '72 hours', tfc: 'End of term, no refund', pay: '45 days', law: 'Delaware' },
  { name: 'Fernhill', when: 'Jul 2025', value: '£1.3M', cap: '12 months', breach: '72 hours', tfc: 'No', pay: '30 days', law: 'California' },
  { name: 'Ostrava Bank', when: 'Jun 2025', value: '£2.8M', cap: '24 months', breach: '72 hours', tfc: 'No', pay: '45 days', law: 'England and Wales' },
  { name: 'Halden Retail', when: 'May 2025', value: '£1.0M', cap: '12 months', breach: 'Without undue delay', tfc: 'No', pay: '30 days', law: 'Delaware' },
  { name: 'Gulf Systems', when: 'Mar 2025', value: '£1.9M', cap: '12 months', breach: '72 hours', tfc: 'No', pay: '45 days', law: 'England and Wales' },
  { name: 'Kestrel Freight', when: 'Feb 2025', value: '£1.4M', cap: '12 months', breach: '72 hours', tfc: 'No', pay: '30 days', law: 'Delaware' },
  { name: 'Northwind', when: 'Dec 2024', value: '£1.2M', cap: '12 months', breach: '72 hours', tfc: 'No', pay: '45 days', law: 'California' },
  { name: 'Brightpath', when: 'Nov 2024', value: '£1.5M', cap: '12 months', breach: 'Without undue delay', tfc: 'No', pay: '30 days', law: 'Delaware' },
];

/* per rule, by the clause topic the review uses — notes on the SaaS playbook */
const RP_RULE_FOR = 'saas';
const RP_RULE = {
  'Fees and Payment': {
    why: 'Cash flow: annual invoices in advance fund the year of service, and 30 days keeps collections inside the quarter.',
    comment: 'We can agree 45 days from the invoice date. Fees stay invoiced annually in advance.',
    bench: { field: 'pay', line: 'We agreed 45 days in 6 of our last 12 MSAs over £1M.' },
    tested: [28, 28] },
  'Term and Renewal': {
    why: 'Renewal is where the revenue is; long notice windows let renewals lapse by accident.',
    comment: 'We can agree 60 days’ notice of non-renewal if renewal prices are capped at 7%.',
    tested: [27, 28] },
  'Termination': {
    why: 'Subscription revenue is recognised over the term; a refundable exit makes it unbookable.',
    comment: 'We can offer termination for convenience at the end of each annual period, on 60 days’ notice. Prepaid fees are non-refundable.',
    bench: { field: 'tfc', line: 'Termination for convenience in 2 of 12, both at the end of the term with no refund. Never with a refund.' },
    law: { id: 'HZ-231', text: 'Position on exit updated 10 Oct for the EU Data Act’s end of switching charges' },
    tested: [26, 28] },
  'Warranties': {
    why: 'An “error-free” promise is one no software company can keep; it turns every bug into a breach.',
    comment: 'We warrant the Services will perform materially as described in the Documentation, and that we won’t materially reduce functionality during the term.',
    tested: [25, 28] },
  'Data Protection': {
    why: 'A fixed 24-hour clock can start before we know what happened. 72 hours matches the window GDPR gives our customers to report to their regulator.',
    comment: 'We’ll notify you of a Security Breach without undue delay and in any event within 72 hours of becoming aware of it.',
    bench: { field: 'breach', line: '72 hours in 8 of our last 12 MSAs over £1M; 48 hours once (Harbor Retail); never 24.' },
    tested: [19, 28] },
  'Limitation of Liability': {
    why: 'Our insurance covers liability up to two years of fees; anything uncapped is uninsured.',
    comment: 'We can’t accept unlimited liability. We can offer a separate cap for data protection breaches of two times the annual fees, above the general 24-month cap.',
    bench: { field: 'cap', line: 'Of our last 12 MSAs over £1M: 12 months in 8, 24 months in 4 (3 of them with a 2× data-breach cap). Never uncapped.' },
    tested: [27, 28] },
  'Indemnification': {
    why: 'Breach indemnities sit under the cap or they quietly become the cap.',
    comment: 'We can indemnify for third-party claims from a Security Breach we cause, subject to the limitation of liability.',
    tested: [24, 28] },
  'Governing Law': {
    why: 'Delaware courts and law are where our other contracts and counsel are.',
    comment: 'We can agree California law and San Francisco courts.',
    bench: { field: 'law', line: 'California in 3 of our last 12 MSAs over £1M.' },
    tested: [28, 28] },
  'Assignment': {
    why: 'We need to move contracts within the group without asking each customer.',
    comment: 'Either party may assign to an Affiliate on notice, without consent.',
    tested: [27, 28] },
  'Most Favored Customer': {
    why: 'Most-favoured pricing ties every price we give to this one; it makes discounting elsewhere impossible.',
    comment: 'We can’t offer most-favoured pricing. We can fix renewal increases at no more than 7%.',
    tested: [23, 28] },
};

/* per review */
const RP_REVIEW = {
  'acme-msa': {
    version: 'v3',
    setup: { side: 'provider', paper: 'ours', approach: 'strict', value: '£1.2M a year', region: 'United States' },
    counterparty: { name: 'Acme Corp', earlier: 'Order Form (2023) · DPA (2024) · Renewal (2025)', turns: 3, pushes: 'the liability cap and payment terms',
      line: 'Acme usually takes 3 turns and always pushes on the liability cap and payment terms.',
      close: 'Accept their changes that sit inside the playbook, and counter the rest with our fallbacks. Acme accepted our fallbacks on the cap and payment in 2 of 3 earlier deals.' },
    exposure: {
      line: 'Together, their changes leave us uncapped for a data breach.',
      detail: '§9 lifts the cap for breaches of §7, §10 adds a breach indemnity “subject to §9” — so uncapped too — and §7 sets a 24-hour notice clock.',
      moves: [{ n: 9, key: 'fallback' }, { n: 7, key: 'fallback' }, { n: 10, key: 'fallback' }] },
    /* what they asked for, in a line, for the sign-off card */
    asks: {
      3: 'Payment within 45 days of the invoice, not 30.',
      4: '60 days’ notice of non-renewal, not 30.',
      5: 'Termination for convenience on 30 days’ notice, with a refund of prepaid fees.',
      6: 'A warranty that the Services will be error-free and uninterrupted, with our disclaimer of implied warranties struck out.',
      7: 'Notice of a Security Breach within 24 hours.',
      9: 'A 24-month cap, with unlimited liability for breaches of §7 (Data Protection).',
      10: 'An indemnity for third-party claims from a Security Breach, subject to §9 — which leaves it uncapped.',
      11: 'California law and San Francisco courts, in place of Delaware.',
      12: 'Assignment to an Affiliate without consent.',
      13: 'Most-favoured pricing: no other customer pays less for comparable Services.',
    },
    comments: {
      9: [{ by: 'Dana Whitfield', org: 'Acme Corp', when: '1 Oct', text: 'Our security team needs unlimited liability for data breaches. This is standard for all our vendors.',
        draft: 'We can’t accept unlimited liability. We can offer a separate cap for data protection breaches of two times the annual fees, above the general 24-month cap. That is what we agree with customers of your size.' }],
      5: [{ by: 'Dana Whitfield', org: 'Acme Corp', when: '1 Oct', text: 'We need a way out if adoption stalls in the first year.',
        draft: 'We can offer termination for convenience at the end of each annual period, on 60 days’ notice. Prepaid fees stay non-refundable.' }],
    },
    /* a second playbook stacked on this run: what the DPA playbook adds */
    stack: {
      dpa: [
        { n: 'dpa-sub', heading: 'Sub-processors', topic: 'Sub-processors', status: 'missing',
          summary: '§7 relies on a Data Processing Addendum that isn’t attached, so nothing says how new sub-processors are approved.',
          need: '30 days’ notice of a new sub-processor, with a right to object.', concede: 'Notice through our sub-processor page, 14 days ahead.' },
        { n: 'dpa-transfer', heading: 'International transfers', topic: 'International transfers', status: 'missing',
          summary: 'Acme’s data may be processed outside the US; the contract has no transfer mechanism.',
          need: 'Standard Contractual Clauses, incorporated by reference.', concede: '' },
      ],
    },
  },
};

/* the skills "/" offers in Ask Clavia */
const RP_SKILLS = [
  { k: 'changes', label: 'Summarise their changes', say: 'What they changed, clause by clause' },
  { k: 'terms', label: 'Check defined terms', say: 'Undefined, unused and broken references' },
  { k: 'obligations', label: 'Pull out obligations and deadlines', say: 'Who must do what, by when' },
  { k: 'issues', label: 'Draft the issues list', say: 'Every open point, our position and theirs' },
];

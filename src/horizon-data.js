/* ── Horizon: what legal is watching, and what it found ───────────
   A watch is a standing question in plain words ("changes to EU data and
   cloud law that affect a UK SaaS company selling to EU businesses") plus
   the coverage it runs over: jurisdictions, the official sources it reads,
   and topics. An update is one change it found, read against Lumen's
   company profile (applies / may apply / doesn't apply, and why), and
   carried to closure: what it touches in our own contracts, templates,
   playbook and open requests, and the steps that fix them, each with an
   owner. Demo content: the law described is summarised for illustration
   and should be checked against the source before relying on it. */

const HZ_TODAY = new Date();
const hzAgo = (days, hh = 9, mm = 0) => { const d = new Date(HZ_TODAY); d.setDate(d.getDate() - days); d.setHours(hh, mm, 0, 0); return d.toISOString(); };

/* what Clavia knows about Lumen, which decides whether an update applies */
const HZ_PROFILE_SEED = {
  sells: 'A B2B analytics platform, sold as SaaS on annual subscriptions',
  hosted: 'AWS in Ireland (eu-west-1) and London (eu-west-2)',
  markets: ['United Kingdom', 'European Union', 'United States', 'United Arab Emirates', 'Saudi Arabia'],
  customers: ['Financial services', 'Retail', 'Health', 'Logistics'],
  data: ['Customer personal data, as a processor', 'Employee data, as a controller', 'No special category data by design'],
  ai: 'Forecasting and anomaly detection, built on third-party models; no decisions about individuals',
  entities: ['Lumen Analytics Ltd (UK)', 'Lumen Analytics Ireland Ltd'],
};

const HZ_WATCHES_SEED = [
  { id: 'eu-data', name: 'EU data and cloud rules', owner: 'Grace Coleman', created: hzAgo(84), checked: 9,
    intent: 'Changes to EU data, cloud and cyber law that affect a UK SaaS company selling to EU businesses: the Data Act, GDPR guidance, NIS2, the Cyber Resilience Act and DORA.',
    juris: ['EU', 'Ireland', 'Germany', 'France'], topics: ['Cloud contracts', 'Data protection', 'Cybersecurity', 'Financial services customers'],
    sources: [['EUR-Lex', 'eur-lex.europa.eu'], ['European Commission', 'commission.europa.eu'], ['EDPB', 'edpb.europa.eu'], ['ENISA', 'enisa.europa.eu'], ['Irish DPC', 'dataprotection.ie']] },
  { id: 'ai', name: 'AI rules for our product', owner: 'Aisha Rahman', created: hzAgo(61), checked: 14,
    intent: 'Rules on AI that apply to a software company building forecasting features on third-party models and selling into the EU, UK and US.',
    juris: ['EU', 'UK', 'California', 'Colorado'], topics: ['AI transparency', 'Automated decisions', 'General-purpose AI models'],
    sources: [['EU AI Office', 'digital-strategy.ec.europa.eu'], ['EUR-Lex', 'eur-lex.europa.eu'], ['California Privacy Protection Agency', 'cppa.ca.gov'], ['ICO', 'ico.org.uk'], ['Colorado AG', 'coag.gov']] },
  { id: 'uk-data', name: 'UK data reform', owner: 'Aisha Rahman', created: hzAgo(120), checked: 4,
    intent: 'The Data (Use and Access) Act coming into force, and ICO guidance that changes what we tell customers or put in our DPA.',
    juris: ['UK'], topics: ['Data protection', 'International transfers', 'Cookies'],
    sources: [['legislation.gov.uk', 'legislation.gov.uk'], ['ICO', 'ico.org.uk'], ['DSIT', 'gov.uk']] },
  { id: 'gulf', name: 'Gulf privacy', owner: 'Elena Petrova', created: hzAgo(40), checked: 22,
    intent: 'Data protection rules in the UAE and Saudi Arabia that affect our reseller programme and hosting choices.',
    juris: ['United Arab Emirates', 'Saudi Arabia', 'Qatar'], topics: ['Data protection', 'Cross-border transfers', 'Data localisation'],
    sources: [['UAE Data Office', 'u.ae'], ['SDAIA', 'sdaia.gov.sa'], ['Qatar NCSA', 'ncsa.gov.qa']] },
];

/* the hero: from 12 January 2027 cloud providers can't charge customers for switching away */
const HZ_UPDATES_SEED = [
  { id: 'HZ-231', watch: 'eu-data', state: 'progress', owner: 'Grace Coleman', found: hzAgo(6, 7, 40),
    title: 'Data Act: switching charges end on 12 January 2027',
    lede: 'From 12 January 2027 a cloud provider may not charge a customer anything for switching to another provider or taking its data out.',
    type: 'Regulation', stage: 'In force', source: ['EUR-Lex', 'eur-lex.europa.eu'], juris: 'EU',
    summary: [
      ['Since 12 September 2025, contracts for cloud services must let the customer switch provider on no more than two months’ notice, followed by a 30-day transition.', 1],
      ['Until 12 January 2027 a provider may charge reduced switching and data-egress charges, but no more than its own costs.', 2],
      ['From 12 January 2027 no switching charges may be charged at all.', 3],
    ],
    cites: [['Regulation (EU) 2023/2854, Art. 25', 'Contractual terms concerning switching'], ['Regulation (EU) 2023/2854, Art. 29(2)–(3)', 'Gradual withdrawal of switching charges'], ['Regulation (EU) 2023/2854, Art. 29(1)', 'Gradual withdrawal of switching charges']],
    dates: [['2025-09-12', 'Switching terms required in cloud contracts', true], ['2027-01-12', 'Switching charges end', false]],
    applies: 'yes', why: 'We sell SaaS to customers in the EU, so we are a provider of data processing services under the Data Act. Our MSA charges exit assistance at our professional services rates, which counts as a switching charge.',
    touches: {
      contracts: [
        ['Vantage GmbH', 'MSA, signed 3 Feb 2025', '14.3 Exit assistance at £1,450 a day', 'vault'],
        ['Harbor Retail plc', 'MSA, signed 21 Jun 2025 · EU entities', '14.3 Exit assistance at £1,450 a day', 'vault'],
        ['Ostrava Bank a.s.', 'MSA, signed 9 Jan 2026', '14.3 and Schedule 4 data export fee', 'vault'],
        ['Acme Corp', 'In negotiation · RQ-1047', 'Their redline keeps our 14.3 as drafted', 'intake/RQ-1047'],
      ],
      templates: [['Master Services Agreement — short form', 'Clause 14.3 Exit assistance', 'templates/msa-short']],
      playbook: [['SaaS subscription agreement', 'Exit and data return: “we charge for exit assistance at standard rates”', 'playbooks/saas']],
      requests: [['RQ-1047', 'Review Acme’s redline of our MSA', 'intake/RQ-1047']],
    },
    steps: [
      { id: 's1', what: 'Change clause 14.3 in our MSA template: no charge for switching or data export from 12 Jan 2027', owner: 'Grace Coleman', status: 'review', kind: 'redline', note: 'Draft ready for review' },
      { id: 's2', what: 'Don’t agree 14.3 as drafted in Acme’s redline', owner: 'Grace Coleman', status: 'done', kind: 'request', ref: 'RQ-1047', note: 'Noted on RQ-1047 · 9 Oct' },
      { id: 's3', what: 'Update the playbook position on exit and data return', owner: 'Grace Coleman', status: 'done', kind: 'playbook', note: 'Done · 10 Oct' },
      { id: 's4', what: 'Amend the three signed EU MSAs before 12 January 2027', owner: 'Matt Rivera', status: 'todo', kind: 'intake', note: 'Not started' },
      { id: 's5', what: 'Tell Sales to stop quoting exit fees to EU customers', owner: 'Roger Bennett', status: 'review', kind: 'note', note: 'Email drafted' },
      { id: 's6', what: 'Product: self-serve data export before 12 January 2027', owner: null, team: 'Product', status: 'waiting', kind: 'ask', note: 'Waiting on Product' },
    ],
    activity: [['Clavia', 'found this in EU data and cloud rules', 6], ['Clavia', 'matched it to 3 signed MSAs, 1 template and 1 playbook position', 6], ['Grace Coleman', 'took this on', 5], ['Grace Coleman', 'noted it on RQ-1047', 5], ['Grace Coleman', 'updated the playbook position', 4]] },

  { id: 'HZ-238', watch: 'uk-data', state: 'review', owner: null, found: hzAgo(1, 8, 15),
    title: 'Data (Use and Access) Act: more provisions in force from 1 December',
    lede: 'The latest commencement regulations bring the recognised legitimate interests basis and the new complaints rules into force on 1 December 2026.',
    type: 'Regulations', stage: 'Made', source: ['legislation.gov.uk', 'legislation.gov.uk'], juris: 'UK',
    summary: [['Controllers may rely on a list of recognised legitimate interests without a balancing test.', 1], ['Controllers must have a way for people to complain and must acknowledge complaints within 30 days.', 2]],
    cites: [['Data (Use and Access) Act 2025, Part 5', 'Recognised legitimate interests'], ['Data (Use and Access) Act 2025, Part 5', 'Complaints to controllers']],
    dates: [['2026-12-01', 'Provisions in force', false]],
    applies: 'maybe', why: 'We are a controller for employee data and our own marketing. As a processor for customer data, the complaints duty sits with our customers, but they will expect help.',
    touches: { contracts: [], templates: [['Data Processing Addendum', 'Clause 8 Assistance with data subject requests', 'templates/dpa']], playbook: [], requests: [] },
    steps: [{ id: 's1', what: 'Decide whether the DPA assistance clause needs to mention complaints', owner: null, status: 'todo', kind: 'decide', note: 'Not started' }] },

  { id: 'HZ-237', watch: 'ai', state: 'review', owner: null, found: hzAgo(2, 16, 5),
    title: 'AI Act: Commission consults on transparency guidelines for AI-generated content',
    lede: 'Draft guidelines on how providers and deployers should mark AI-generated content and tell people they are dealing with an AI system.',
    type: 'Consultation', stage: 'Consultation', source: ['EU AI Office', 'digital-strategy.ec.europa.eu'], juris: 'EU',
    summary: [['The draft explains how to meet the transparency duties in Article 50, including marking AI-generated text and images.', 1], ['Comments close on 21 November 2026.', 2]],
    cites: [['Regulation (EU) 2024/1689, Art. 50', 'Transparency obligations'], ['Consultation page', 'Closing date']],
    dates: [['2026-11-21', 'Consultation closes', false], ['2026-08-02', 'Article 50 applies', true]],
    applies: 'maybe', why: 'Our forecasting features produce text summaries for customers. If those count as AI-generated content shown to people, Article 50 marking may apply.',
    touches: { contracts: [], templates: [], playbook: [['SaaS subscription agreement', 'AI features: “customer is responsible for how outputs are used”', 'playbooks/saas']], requests: [] },
    steps: [{ id: 's1', what: 'Ask Product whether summaries are shown to end users unedited', owner: null, team: 'Product', status: 'todo', kind: 'ask', note: 'Not started' }] },

  { id: 'HZ-236', watch: 'gulf', state: 'review', owner: null, found: hzAgo(3, 11, 30),
    title: 'UAE: Data Office publishes guidance on cross-border transfers under the PDPL',
    lede: 'Guidance on when personal data can leave the UAE, and the contract terms expected where there is no adequacy decision.',
    type: 'Guidance', stage: 'Published', source: ['UAE Data Office', 'u.ae'], juris: 'United Arab Emirates',
    summary: [['Transfers to countries without adequate protection need a contract with protections set out in the guidance.', 1], ['Resellers that pass customer data to a foreign platform are named as an example.', 2]],
    cites: [['Federal Decree-Law No. 45 of 2021, Art. 22–23', 'Cross-border transfer'], ['Data Office guidance, section 4', 'Reseller example']],
    dates: [],
    applies: 'yes', why: 'Gulf Systems resells our platform in the UAE and customer data is hosted in Ireland. The reseller terms we are drafting (RQ-1044) need the transfer protections.',
    touches: { contracts: [['Gulf Systems LLC', 'Reseller terms in draft · RQ-1044', 'Data protection schedule', 'intake/RQ-1044']], templates: [['Reseller Agreement', 'Schedule 3 Data protection', 'templates/reseller']], playbook: [], requests: [['RQ-1044', 'Reseller terms for the Gulf region', 'intake/RQ-1044']] },
    steps: [{ id: 's1', what: 'Add the UAE transfer terms to the Gulf reseller schedule', owner: 'Roger Bennett', status: 'todo', kind: 'request', ref: 'RQ-1044', note: 'Not started' }] },

  { id: 'HZ-235', watch: 'eu-data', state: 'review', owner: null, found: hzAgo(4, 9, 50),
    title: 'Cyber Resilience Act: Commission guidance on reporting actively exploited vulnerabilities',
    lede: 'Guidance on the 24-hour early warning and 72-hour notification for manufacturers of products with digital elements.',
    type: 'Guidance', stage: 'Published', source: ['European Commission', 'commission.europa.eu'], juris: 'EU',
    summary: [['Manufacturers must give an early warning within 24 hours of becoming aware of an actively exploited vulnerability.', 1], ['Reporting duties apply from 11 September 2026.', 2]],
    cites: [['Regulation (EU) 2024/2847, Art. 14', 'Reporting obligations of manufacturers'], ['Regulation (EU) 2024/2847, Art. 71', 'Entry into force and application']],
    dates: [['2026-09-11', 'Reporting duties apply', true]],
    applies: 'maybe', why: 'Pure SaaS is mostly outside the Cyber Resilience Act, but our on-premise connector agent is software we place on the EU market.',
    touches: { contracts: [], templates: [], playbook: [], requests: [] },
    steps: [{ id: 's1', what: 'Confirm with Engineering whether the connector agent is sold as a product', owner: null, team: 'Engineering', status: 'todo', kind: 'ask', note: 'Not started' }] },

  { id: 'HZ-234', watch: 'ai', state: 'progress', owner: 'Aisha Rahman', found: hzAgo(9, 14, 0),
    title: 'California: automated decision-making rules — risk assessments due from 2027',
    lede: 'The CPPA’s regulations on automated decision-making technology, risk assessments and cybersecurity audits phase in from January 2027.',
    type: 'Regulations', stage: 'Adopted', source: ['California Privacy Protection Agency', 'cppa.ca.gov'], juris: 'California',
    summary: [['Businesses using automated decision-making for significant decisions must give a pre-use notice and an opt-out.', 1], ['Risk assessments are required for certain processing, with the first ones due in 2027.', 2]],
    cites: [['CPPA regulations, Article 11', 'Automated decision-making technology'], ['CPPA regulations, Article 10', 'Risk assessments']],
    dates: [['2027-01-01', 'Automated decision-making duties apply', false]],
    applies: 'maybe', why: 'We don’t make significant decisions about individuals, but two US customers use our forecasts in credit decisions and will ask what we provide.',
    touches: { contracts: [], templates: [['Data Processing Addendum', 'US state privacy addendum', 'templates/dpa']], playbook: [], requests: [] },
    steps: [{ id: 's1', what: 'Write a short note for Sales on what we do and don’t provide', owner: 'Aisha Rahman', status: 'review', kind: 'note', note: 'Draft ready for review' },
      { id: 's2', what: 'Add an optional ADMT clause to the US addendum', owner: 'Aisha Rahman', status: 'todo', kind: 'redline', note: 'Not started' }] },

  { id: 'HZ-233', watch: 'uk-data', state: 'review', owner: null, found: hzAgo(5, 10, 10),
    title: 'ICO consults on updated guidance on international transfers',
    lede: 'Updated guidance on transfer risk assessments and the UK addendum to the EU SCCs.',
    type: 'Consultation', stage: 'Consultation', source: ['ICO', 'ico.org.uk'], juris: 'UK',
    summary: [['The ICO proposes a simpler approach to transfer risk assessments.', 1], ['Comments close on 28 November 2026.', 2]],
    cites: [['ICO consultation', 'Transfer risk assessments'], ['ICO consultation', 'Closing date']],
    dates: [['2026-11-28', 'Consultation closes', false]],
    applies: 'maybe', why: 'We use the UK addendum for sub-processors outside the UK. A simpler assessment could shorten our DPA annex.',
    touches: { contracts: [], templates: [['Data Processing Addendum', 'Annex 3 International transfers', 'templates/dpa']], playbook: [], requests: [] },
    steps: [] },

  { id: 'HZ-229', watch: 'eu-data', state: 'done', owner: 'Grace Coleman', found: hzAgo(32, 9, 0), closed: hzAgo(12, 16, 30),
    title: 'DORA: register of information for ICT third-party providers',
    lede: 'Financial entities must keep a register of their ICT third-party arrangements and report it to their regulator.',
    type: 'Implementing regulation', stage: 'In force', source: ['EUR-Lex', 'eur-lex.europa.eu'], juris: 'EU',
    summary: [['Financial entities must keep a register of information on all contracts with ICT third-party service providers.', 1], ['Customers will ask us for the details the register needs.', 2]],
    cites: [['Regulation (EU) 2022/2554, Art. 28(3)', 'Register of information'], ['Commission Implementing Regulation (EU) 2024/2956', 'Templates for the register']],
    dates: [['2025-01-17', 'DORA applies', true]],
    applies: 'yes', why: 'Banks and insurers are a fifth of our customers. They need our details for their register and DORA terms in our contract.',
    touches: { contracts: [['Ostrava Bank a.s.', 'MSA, signed 9 Jan 2026', 'DORA addendum', 'vault']], templates: [['Master Services Agreement — short form', 'DORA addendum for financial-services customers', 'templates/msa-short']], playbook: [], requests: [] },
    steps: [{ id: 's1', what: 'Publish a DORA addendum for financial-services customers', owner: 'Grace Coleman', status: 'done', kind: 'redline', note: 'Done · 2 Oct' },
      { id: 's2', what: 'Send Sales the register details pack', owner: 'Grace Coleman', status: 'done', kind: 'note', note: 'Sent · 2 Oct' }] },

  { id: 'HZ-230', watch: 'gulf', state: 'archived', owner: null, found: hzAgo(18, 12, 0), dismissed: ['Elena Petrova', 'We don’t host or process data in Qatar and have no Qatari customers.'],
    title: 'Qatar: NCSA updates guidance on personal data privacy',
    lede: 'Updated guidance for controllers on notices and data subject rights.', type: 'Guidance', stage: 'Published', source: ['Qatar NCSA', 'ncsa.gov.qa'], juris: 'Qatar',
    summary: [['Controllers must give clear privacy notices before collecting personal data.', 1]], cites: [['Law No. 13 of 2016', 'Notices']], dates: [],
    applies: 'no', why: 'We have no customers or processing in Qatar.', touches: { contracts: [], templates: [], playbook: [], requests: [] }, steps: [] },

  { id: 'HZ-228', watch: 'eu-data', state: 'archived', owner: null, found: hzAgo(25, 15, 0), dismissed: ['Grace Coleman', 'We are not an essential or important entity under NIS2 in Ireland.'],
    title: 'Ireland: NIS2 transposition bill published',
    lede: 'The National Cyber Security Bill brings NIS2 into Irish law.', type: 'Bill', stage: 'Bill', source: ['Irish Government', 'gov.ie'], juris: 'Ireland',
    summary: [['The bill sets out which entities are essential or important and their reporting duties.', 1]], cites: [['National Cyber Security Bill 2026', 'Scope']], dates: [],
    applies: 'no', why: 'Lumen Analytics Ireland Ltd is below the size thresholds and not in a listed sector.', touches: { contracts: [], templates: [], playbook: [], requests: [] }, steps: [] },
];

/* where we tell people */
const HZ_DELIVERY_SEED = {
  digest: { on: true, day: 'Monday', time: '08:00', to: ['Roger Bennett', 'Grace Coleman', 'Aisha Rahman'] },
  urgent: { on: true, when: 'Applies, and something takes effect within 90 days', where: ['Teams · Legal › Horizon'] },
  owner: { on: true },
};

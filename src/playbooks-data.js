/* The playbooks Clavia ships with — ported from the Jev experiment
   (Experiments/jev/playbooks). A clause holds three positions and no more:
   preferred (the starting position), fallback, and walkaway (not acceptable),
   plus the wording to draft with for the first two. Status is live,
   draft or archived; owner is a person with a photo in PHOTOS. */
/* Bump when the shipped playbooks change shape, so a saved copy of them is refreshed. */
const PLAYBOOK_SEED_V = 2;

const PLAYBOOK_SEED = [
  {
    "id": "saas",
    "version": 4,
    "status": "live",
    "owner": "Roger Bennett",
    "updated": "2026-09-22T16:40:00",
    "name": "SaaS subscription agreement",
    "description": "A software-as-a-service subscription agreement or master subscription agreement under which we provide our hosted software to a customer, covering fees, term, warranties, service levels and liability.",
    "clauses": [
      {
        "id": "liability",
        "topic": "Limitation of liability",
        "covers": "Caps on each party's total liability, exclusions of indirect or consequential damages, and any carve-outs from the cap",
        "preferred": "Mutual cap equal to the fees paid in the 12 months before the claim. Indirect, consequential and lost-profit damages excluded for both parties.",
        "walkaway": "Unlimited liability for Provider for any category of claim other than fraud or wilful misconduct, a cap above 24 months of fees, or removal of the exclusion of indirect damages.",
        "fallback": "Mutual cap of up to 24 months of fees, or a separate higher cap (a super-cap) of up to 2x annual fees for data protection breaches. Indirect damages still excluded.",
        "preferred_language": "Each party's total liability will not exceed the fees paid or payable in the twelve (12) months preceding the claim. Neither party is liable for indirect, consequential or lost-profit damages.",
        "fallback_language": "Each party's total liability will not exceed the fees paid or payable in the twenty-four (24) months preceding the claim, except that Provider's liability for breaches of Section 7 (Data Protection) will not exceed two times (2x) the annual fees.",
        "section": "Risk allocation"
      },
      {
        "id": "indemnity",
        "topic": "Indemnification",
        "covers": "Who defends and pays for third-party claims, such as intellectual property infringement or data breach claims",
        "preferred": "Provider indemnifies only for third-party claims that the Services infringe intellectual property. Customer indemnifies for claims arising from Customer Data.",
        "walkaway": "Provider indemnifies for any breach of the Agreement, for all claims of any kind, or indemnity obligations that are uncapped.",
        "fallback": "Provider also indemnifies for third-party claims arising from a security breach caused by Provider, subject to the liability cap or super-cap.",
        "preferred_language": "Provider will defend Customer against third-party claims alleging that the Services infringe a third party's intellectual property rights. Customer will defend Provider against third-party claims arising from Customer Data.",
        "fallback_language": "Provider will defend Customer against third-party claims arising from a Security Breach caused by Provider's failure to comply with Section 7, subject to Section 9 (Limitation of Liability).",
        "section": "Risk allocation"
      },
      {
        "id": "payment",
        "topic": "Fees and payment",
        "covers": "Invoicing, payment deadlines, late fees and billing frequency",
        "preferred": "Fees invoiced annually in advance, payable within 30 days of invoice.",
        "walkaway": "Payment terms longer than 60 days, payment in arrears, or payment made conditional on Customer's acceptance of the Services.",
        "fallback": "Payable within 45 days of invoice, or invoiced quarterly in advance.",
        "preferred_language": "Fees are invoiced annually in advance and are payable within thirty (30) days of the invoice date.",
        "fallback_language": "Fees are invoiced annually in advance and are payable within forty-five (45) days of the invoice date.",
        "section": "Commercial terms"
      },
      {
        "id": "renewal",
        "topic": "Term and renewal",
        "covers": "Length of the initial term, automatic renewal, notice of non-renewal and price increases on renewal",
        "preferred": "12-month initial term that renews automatically for 12-month periods unless either party gives 30 days' notice of non-renewal.",
        "walkaway": "No automatic renewal, or renewal prices frozen with no increase allowed.",
        "fallback": "Automatic renewal with up to 60 days' notice of non-renewal, or a cap on renewal price increases of up to 7%.",
        "preferred_language": "The initial Subscription Term is twelve (12) months. This Agreement renews automatically for successive twelve (12) month terms unless either party gives notice of non-renewal at least thirty (30) days before the end of the then-current term.",
        "fallback_language": "This Agreement renews automatically for successive twelve (12) month terms unless either party gives notice of non-renewal at least sixty (60) days before the end of the then-current term. Renewal fees will not increase by more than seven percent (7%).",
        "section": "Commercial terms"
      },
      {
        "id": "termination",
        "topic": "Termination",
        "covers": "When and how either party may end the agreement early, and any refunds on termination",
        "preferred": "Either party may terminate for the other party's material breach that is not cured within 30 days of notice. No termination for convenience.",
        "walkaway": "Customer may terminate for convenience at any time during a term, or Provider must refund prepaid fees when Customer terminates for convenience.",
        "fallback": "Customer may terminate for convenience effective at the end of an annual period, on 60 days' notice, with no refund of prepaid fees.",
        "preferred_language": "Either party may terminate this Agreement if the other party materially breaches it and fails to cure the breach within thirty (30) days of written notice.",
        "fallback_language": "Customer may terminate this Agreement for convenience effective at the end of the then-current annual period by giving Provider at least sixty (60) days' written notice. Prepaid fees are non-refundable.",
        "section": "Commercial terms"
      },
      {
        "id": "warranty",
        "topic": "Warranties",
        "covers": "Promises about how the Services will perform and disclaimers of implied warranties",
        "preferred": "Provider warrants the Services will perform materially as described in the Documentation. All implied warranties, including merchantability and fitness for a particular purpose, are disclaimed.",
        "walkaway": "Warranty that the Services are error-free or uninterrupted, a warranty of fitness for Customer's particular purpose, or removal of the disclaimer of implied warranties.",
        "fallback": "Provider also warrants it will not materially decrease the overall functionality of the Services during the term. The disclaimer of implied warranties stays.",
        "preferred_language": "Provider warrants that the Services will perform materially in accordance with the Documentation. EXCEPT AS EXPRESSLY STATED IN THIS SECTION, PROVIDER DISCLAIMS ALL IMPLIED WARRANTIES, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.",
        "fallback_language": "Provider warrants that the Services will perform materially in accordance with the Documentation and that Provider will not materially decrease the overall functionality of the Services during the Subscription Term. EXCEPT AS EXPRESSLY STATED IN THIS SECTION, PROVIDER DISCLAIMS ALL IMPLIED WARRANTIES, INCLUDING MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.",
        "section": "Service commitments"
      },
      {
        "id": "sla",
        "topic": "Service levels",
        "covers": "Uptime commitments, service credits and remedies for service outages",
        "preferred": "99.5% monthly uptime. Service credits capped at 10% of monthly fees are Customer's sole and exclusive remedy for downtime.",
        "walkaway": "Uncapped service credits, service credits that are not the sole remedy, or a right to terminate after a single missed month.",
        "fallback": "99.9% monthly uptime, or service credits capped at 25% of monthly fees, still as the sole remedy.",
        "preferred_language": "Provider will make the Services available 99.5% of the time each month. Service credits of up to ten percent (10%) of the monthly fees are Customer's sole and exclusive remedy for any failure to meet this commitment.",
        "fallback_language": "Provider will make the Services available 99.9% of the time each month. Service credits will not exceed twenty-five percent (25%) of the monthly fees and are Customer's sole and exclusive remedy for any failure to meet this commitment.",
        "section": "Service commitments"
      },
      {
        "id": "data",
        "topic": "Data protection and security",
        "covers": "Processing of personal data, the data processing agreement, security measures, breach notification and audits",
        "preferred": "Processing under Provider's standard Data Processing Addendum. Provider notifies Customer of a security breach without undue delay. Audits satisfied by Provider's SOC 2 report.",
        "walkaway": "A fixed breach notification deadline of 48 hours or less, such as 24 or 48 hours, unlimited or on-demand audit rights, or data residency commitments outside Provider's hosting regions.",
        "fallback": "Breach notification within 72 hours of Provider becoming aware, or one on-site audit per year on 30 days' notice at Customer's cost.",
        "preferred_language": "Provider will process Customer personal data in accordance with the Data Processing Addendum and will notify Customer of a Security Breach without undue delay. Provider's audit obligations are satisfied by providing its most recent SOC 2 Type II report.",
        "fallback_language": "Provider will notify Customer of a Security Breach without undue delay and in any event within seventy-two (72) hours after becoming aware of it.",
        "section": "Data and security"
      },
      {
        "id": "law",
        "topic": "Governing law and venue",
        "covers": "Which law governs the agreement and where disputes are heard",
        "preferred": "Laws of the State of Delaware or New York, with courts in that state.",
        "walkaway": "Any governing law outside the United States and the United Kingdom, or mandatory arbitration outside the United States.",
        "fallback": "Laws of California, or of England and Wales for customers based outside the United States.",
        "preferred_language": "This Agreement is governed by the laws of the State of Delaware, and the parties submit to the exclusive jurisdiction of the courts located in Wilmington, Delaware.",
        "fallback_language": "This Agreement is governed by the laws of the State of California, and the parties submit to the exclusive jurisdiction of the state and federal courts in San Francisco County.",
        "section": "General"
      },
      {
        "id": "assignment",
        "topic": "Assignment",
        "covers": "Whether either party can transfer the agreement to another company",
        "preferred": "Neither party may assign without the other's consent, except either party may assign to a successor in a merger or acquisition.",
        "walkaway": "Customer may assign freely to any third party, or Provider is barred from assigning in a merger or acquisition.",
        "fallback": "Either party may also assign to an Affiliate without consent, on notice.",
        "preferred_language": "Neither party may assign this Agreement without the other party's prior written consent, except that either party may assign it to a successor in a merger or acquisition.",
        "fallback_language": "Either party may assign this Agreement without consent to an Affiliate or to a successor in a merger, acquisition or sale of substantially all of its assets, on written notice to the other party.",
        "section": "General"
      }
    ]
  },
  {
    "id": "nda",
    "version": 2,
    "status": "live",
    "owner": "Grace Coleman",
    "updated": "2026-09-18T10:05:00",
    "name": "Mutual NDA",
    "description": "A mutual or one-way non-disclosure or confidentiality agreement that governs confidential information exchanged between parties, usually before or during a business evaluation.",
    "clauses": [
      {
        "id": "definition",
        "topic": "Definition of Confidential Information",
        "covers": "What information counts as confidential under the agreement",
        "preferred": "Any information disclosed in any form that is marked confidential or that a reasonable person would understand to be confidential, including technical, product and business information.",
        "walkaway": "Only written information that is marked confidential, with no protection for oral or unmarked disclosures, or a definition that leaves out technical or business information.",
        "fallback": "Information that is marked confidential, plus oral disclosures that are identified as confidential and confirmed in writing within 30 days.",
        "preferred_language": "“Confidential Information” means all information disclosed by a party in any form that is marked confidential or that a reasonable person would understand to be confidential given its nature and the circumstances of disclosure, including technical, product, financial and business information.",
        "fallback_language": "“Confidential Information” means information disclosed by a party that is marked confidential, and oral information that is identified as confidential at the time of disclosure and summarized in writing within thirty (30) days.",
        "section": "Scope"
      },
      {
        "id": "exclusions",
        "topic": "Exclusions from Confidential Information",
        "covers": "Information that is carved out of the confidentiality obligations",
        "preferred": "Only the four standard exclusions: information that is public, already known to the recipient, independently developed, or lawfully received from a third party without restriction.",
        "walkaway": "A residuals clause letting the recipient use information retained in memory, an exclusion for anything the recipient decides is not confidential, or broad exclusions beyond the standard ones.",
        "fallback": "The four standard exclusions plus information disclosed with the disclosing party's prior written approval.",
        "preferred_language": "Confidential Information does not include information that (a) is or becomes public through no fault of the recipient, (b) was known to the recipient without restriction before disclosure, (c) is independently developed without use of the Confidential Information, or (d) is lawfully received from a third party without restriction.",
        "fallback_language": "Confidential Information does not include information that (a) is or becomes public through no fault of the recipient, (b) was known to the recipient without restriction before disclosure, (c) is independently developed without use of the Confidential Information, (d) is lawfully received from a third party without restriction, or (e) is disclosed with the disclosing party's prior written approval.",
        "section": "Scope"
      },
      {
        "id": "use",
        "topic": "Use restrictions",
        "covers": "What the recipient is allowed to use the confidential information for",
        "preferred": "The recipient may use Confidential Information only to evaluate the potential business relationship between the parties.",
        "walkaway": "Use for any purpose, use for the recipient's own products or competing work, or no restriction on use.",
        "fallback": "Use to evaluate the relationship and to perform any agreement the parties later sign.",
        "preferred_language": "The recipient will use Confidential Information only to evaluate a potential business relationship between the parties (the “Purpose”).",
        "fallback_language": "The recipient will use Confidential Information only to evaluate a potential business relationship between the parties and to perform any definitive agreement they enter into (the “Purpose”).",
        "section": "Obligations"
      },
      {
        "id": "representatives",
        "topic": "Disclosure to representatives",
        "covers": "Who the recipient may share confidential information with, such as employees, advisors or affiliates",
        "preferred": "Disclosure only to employees and professional advisors who need to know for the Purpose and are bound by confidentiality obligations at least as protective. The recipient is responsible for their compliance.",
        "walkaway": "Disclosure to any third party without confidentiality obligations, or the recipient is not responsible for breaches by its representatives.",
        "fallback": "Also affiliates and actual or potential financing sources, on the same need-to-know and responsibility terms.",
        "preferred_language": "The recipient may disclose Confidential Information only to its employees and professional advisors who need to know it for the Purpose and are bound by confidentiality obligations at least as protective as this Agreement. The recipient is responsible for any breach by them.",
        "fallback_language": "The recipient may disclose Confidential Information only to its and its Affiliates' employees, professional advisors and financing sources who need to know it for the Purpose and are bound by confidentiality obligations at least as protective as this Agreement. The recipient is responsible for any breach by them.",
        "section": "Obligations"
      },
      {
        "id": "term",
        "topic": "Term of confidentiality",
        "covers": "How long the confidentiality obligations last",
        "preferred": "Obligations last three years after each disclosure, and trade secrets stay protected for as long as they remain trade secrets.",
        "walkaway": "Obligations shorter than two years, obligations that end when the agreement ends, or perpetual obligations for all information.",
        "fallback": "Obligations last between two and five years after disclosure, with trade secrets protected while they remain trade secrets.",
        "preferred_language": "The recipient's obligations last for three (3) years after each disclosure, except that obligations for trade secrets continue for as long as the information remains a trade secret.",
        "fallback_language": "The recipient's obligations last for two (2) years after each disclosure, except that obligations for trade secrets continue for as long as the information remains a trade secret.",
        "section": "Term and return"
      },
      {
        "id": "return",
        "topic": "Return or destruction of information",
        "covers": "What happens to confidential information when the discussions end or on request",
        "preferred": "Return or destroy Confidential Information within 30 days of request, except copies kept in routine backups or as required by law, which stay confidential.",
        "walkaway": "No obligation to return or destroy information, or an obligation to destroy all copies including backups and legally required archives.",
        "fallback": "The same, plus a written certificate of destruction on request.",
        "preferred_language": "Within thirty (30) days of the disclosing party's written request, the recipient will return or destroy its Confidential Information, except for copies retained in routine backups or as required by law, which remain subject to this Agreement.",
        "fallback_language": "Within thirty (30) days of the disclosing party's written request, the recipient will return or destroy its Confidential Information and, on request, certify the destruction in writing, except for copies retained in routine backups or as required by law, which remain subject to this Agreement.",
        "section": "Term and return"
      },
      {
        "id": "license",
        "topic": "No license or warranty",
        "covers": "Whether disclosure grants any rights and whether information is provided with warranties",
        "preferred": "No license or other rights are granted. Information is provided as is, and neither party must proceed with any transaction.",
        "walkaway": "A license to use the disclosed information, a warranty that information is accurate or complete, or an obligation to enter into a transaction.",
        "fallback": "Each party warrants only that it has the right to disclose the information it shares.",
        "preferred_language": "No license or other right is granted under this Agreement. All Confidential Information is provided “as is”, and neither party is obligated to enter into any further agreement.",
        "fallback_language": "No license or other right is granted under this Agreement. Each party represents that it has the right to disclose the information it shares; otherwise all Confidential Information is provided “as is”, and neither party is obligated to enter into any further agreement.",
        "section": "Rights and remedies"
      },
      {
        "id": "remedies",
        "topic": "Remedies for breach",
        "covers": "Injunctions, damages and other remedies if confidentiality is breached",
        "preferred": "The disclosing party may seek injunctive relief without posting a bond, in addition to any other remedies.",
        "walkaway": "Liquidated damages or a fixed penalty for breach, an indemnity for any breach, or a waiver of injunctive relief.",
        "fallback": "Injunctive relief available on a showing of irreparable harm, in addition to other remedies.",
        "preferred_language": "Unauthorized use or disclosure may cause irreparable harm, and the disclosing party may seek injunctive relief without posting a bond, in addition to any other remedies available at law or in equity.",
        "fallback_language": "If a party shows that unauthorized use or disclosure would cause it irreparable harm, it may seek injunctive relief, in addition to any other remedies available at law or in equity.",
        "section": "Rights and remedies"
      }
    ]
  },
  {
    "id": "dpa",
    "version": 3,
    "status": "draft",
    "owner": "Matt Rivera",
    "updated": "2026-09-24T11:20:00",
    "name": "Data processing addendum",
    "description": "A data processing agreement or addendum (DPA) that sets out how we process personal data on a customer’s behalf under GDPR or similar privacy laws: roles, security, subprocessors, transfers, assistance, return of data and liability.",
    "clauses": [
      {
        "id": "roles",
        "topic": "Roles of the parties",
        "covers": "Who is the controller and who is the processor",
        "preferred": "Customer is the controller and we are its processor. Where Customer is itself a processor, we act as its subprocessor on the same terms.",
        "walkaway": "Any wording that makes us a joint controller, or a controller of Customer Personal Data in our own right.",
        "preferred_language": "",
        "fallbacks": [
          {
            "text": "We may be an independent controller only for our own account, billing and security telemetry data, and the DPA says so expressly.",
            "language": ""
          }
        ],
        "section": "Scope and roles"
      },
      {
        "id": "instructions",
        "topic": "Processing instructions",
        "covers": "Whose instructions govern the processing of personal data and how new instructions are handled",
        "preferred": "Processor processes personal data only on Customer's documented instructions as set out in the Agreement and this DPA.",
        "walkaway": "An obligation to follow any instruction at any time at no cost, or no right for Processor to object to unlawful or unworkable instructions.",
        "fallback": "Customer may give additional reasonable written instructions consistent with the Services, and Processor may charge for instructions that require extra work.",
        "preferred_language": "Processor will process Customer Personal Data only on Customer's documented instructions, which are set out in the Agreement and this DPA.",
        "fallback_language": "Processor will process Customer Personal Data only on Customer's documented instructions, which are set out in the Agreement and this DPA. Customer may give additional reasonable written instructions consistent with the Services; Processor may charge for instructions that require additional work and will tell Customer if it believes an instruction is unlawful.",
        "section": "Scope and roles"
      },
      {
        "id": "details",
        "topic": "Details of processing",
        "covers": "The annex describing subject matter, duration, data types and data subjects",
        "preferred": "The annex describes the processing at the level of the Services: categories of data and data subjects as Customer chooses to submit them.",
        "walkaway": "An annex that lists specific systems, fields or volumes we would then be bound to, or that Customer can change unilaterally.",
        "preferred_language": "",
        "fallbacks": [
          {
            "text": "A more detailed annex for a specific deployment, agreed in writing and updated only by amendment.",
            "language": ""
          }
        ],
        "section": "Scope and roles"
      },
      {
        "id": "customer-obligations",
        "topic": "Customer’s obligations",
        "covers": "What the customer warrants about the data it sends us",
        "preferred": "Customer is responsible for the lawfulness of the data and its instructions, including notices, consents and a lawful basis.",
        "walkaway": "A warranty from us that Customer’s use of the Services complies with data protection law.",
        "preferred_language": "",
        "fallbacks": [
          {
            "text": "We will tell Customer if, in our opinion, an instruction infringes data protection law, without any duty to monitor.",
            "language": ""
          }
        ],
        "section": "Scope and roles"
      },
      {
        "id": "special-categories",
        "topic": "Special category data",
        "covers": "Health, biometric, children’s and other sensitive data",
        "preferred": "Customer will not submit special category data unless the Order Form says the Services are configured for it.",
        "walkaway": "An obligation to process special category or children’s data by default, at our standard security level.",
        "preferred_language": "",
        "fallbacks": [
          {
            "text": "Special category data is permitted in named fields only, with the additional safeguards listed in the Order Form.",
            "language": ""
          }
        ],
        "section": "Scope and roles"
      },
      {
        "id": "security-measures",
        "topic": "Security measures",
        "covers": "The technical and organisational measures we commit to",
        "preferred": "The measures in our Security Annex, which we may update provided the overall level of protection does not go down.",
        "walkaway": "Customer-specific security controls, or a duty to comply with Customer’s own security policies as they change.",
        "preferred_language": "",
        "fallbacks": [
          {
            "text": "Named additional controls for this Customer, listed in the Order Form and priced where they add cost.",
            "language": ""
          },
          {
            "text": "An annual review meeting on the Security Annex, with no obligation to adopt Customer’s requests.",
            "language": ""
          }
        ],
        "section": "Security"
      },
      {
        "id": "personnel",
        "topic": "Confidentiality of personnel",
        "covers": "Who on our side can access the data and on what terms",
        "preferred": "Access is limited to personnel who need it and who are bound by written confidentiality obligations.",
        "walkaway": "Background checks to Customer’s standard on all personnel, or Customer approval of named individuals.",
        "preferred_language": "",
        "fallbacks": [
          {
            "text": "Background checks to our own standard, where the law of the hiring country allows them.",
            "language": ""
          }
        ],
        "section": "Security"
      },
      {
        "id": "breach",
        "topic": "Personal data breach notification",
        "covers": "How quickly Processor must tell Customer about a personal data breach",
        "preferred": "Notice without undue delay after becoming aware of a personal data breach.",
        "walkaway": "A fixed notice deadline of 48 hours or less, such as 24 or 48 hours, or notice of suspected incidents that are not confirmed breaches.",
        "fallback": "Notice without undue delay and in any event within 72 hours of becoming aware.",
        "preferred_language": "Processor will notify Customer without undue delay after becoming aware of a Personal Data Breach.",
        "fallback_language": "Processor will notify Customer without undue delay, and in any event within seventy-two (72) hours, after becoming aware of a Personal Data Breach.",
        "section": "Security"
      },
      {
        "id": "certifications",
        "topic": "Certifications",
        "covers": "ISO 27001, SOC 2 and similar attestations",
        "preferred": "We maintain ISO 27001 and a SOC 2 Type II report for the Services and provide them on request, under confidentiality.",
        "walkaway": "A commitment to obtain a certification we do not hold, or to keep one regardless of changes to the standard.",
        "preferred_language": "",
        "fallbacks": [
          {
            "text": "If a certification lapses we will tell Customer and provide equivalent evidence of our controls.",
            "language": ""
          }
        ],
        "section": "Security"
      },
      {
        "id": "subprocessors",
        "topic": "Subprocessors",
        "covers": "Whether and how Processor can use other companies to process the data",
        "preferred": "General authorization to use subprocessors listed on Processor's website, with 30 days' notice of new ones. Customer may object and, as its sole remedy, terminate the affected Services.",
        "walkaway": "Customer's prior specific written consent for each subprocessor, or a Customer right to veto new subprocessors.",
        "fallback": "30 days' notice of new subprocessors, and a Customer objection leads to good-faith discussion of alternatives before termination.",
        "preferred_language": "Customer generally authorizes Processor to use the subprocessors listed at lumen.cloud/subprocessors. Processor will give thirty (30) days' notice of any new subprocessor. If Customer reasonably objects, its sole remedy is to terminate the affected Services.",
        "fallback_language": "Customer generally authorizes Processor to use the subprocessors listed at lumen.cloud/subprocessors. Processor will give thirty (30) days' notice of any new subprocessor. If Customer reasonably objects, the parties will discuss alternatives in good faith, and if they cannot agree Customer may terminate the affected Services.",
        "section": "Subprocessors and transfers"
      },
      {
        "id": "subprocessor-liability",
        "topic": "Liability for subprocessors",
        "covers": "Who answers for a subprocessor’s failure",
        "preferred": "We flow down equivalent obligations and remain liable for our subprocessors’ performance, within the Agreement’s cap.",
        "walkaway": "Uncapped liability for subprocessors, or a right for Customer to contract with or audit them directly.",
        "preferred_language": "",
        "fallbacks": [
          {
            "text": "We will share a summary of the data protection terms in a subprocessor agreement on request.",
            "language": ""
          }
        ],
        "section": "Subprocessors and transfers"
      },
      {
        "id": "transfers",
        "topic": "International transfers",
        "covers": "Transfers of personal data to other countries",
        "preferred": "Transfers outside the EEA and UK are covered by the Standard Contractual Clauses.",
        "walkaway": "A ban on transfers outside the EEA, or a commitment to store data only in one country.",
        "fallback": "Standard Contractual Clauses plus reasonable help with Customer's transfer impact assessment.",
        "preferred_language": "Where Customer Personal Data is transferred outside the EEA or the UK, the Standard Contractual Clauses apply and are incorporated into this DPA.",
        "fallback_language": "Where Customer Personal Data is transferred outside the EEA or the UK, the Standard Contractual Clauses apply and are incorporated into this DPA, and Processor will provide reasonable assistance with Customer's transfer impact assessment.",
        "section": "Subprocessors and transfers"
      },
      {
        "id": "data-residency",
        "topic": "Data residency",
        "covers": "Where the data is stored and from where it is accessed",
        "preferred": "Data is hosted in the region chosen on the Order Form. Support and operations staff may access it from other countries under the transfer terms.",
        "walkaway": "A commitment that no personnel outside the region will ever access the data, or residency for regions we do not operate.",
        "preferred_language": "",
        "fallbacks": [
          {
            "text": "In-region support during the region’s business hours, with follow-the-sun access for severity 1 incidents only.",
            "language": ""
          },
          {
            "text": "In-region-only access as a paid option, where the Services support it.",
            "language": ""
          }
        ],
        "section": "Subprocessors and transfers"
      },
      {
        "id": "government-access",
        "topic": "Government access requests",
        "covers": "What we do if an authority asks for the data",
        "preferred": "We will redirect the authority to Customer, notify Customer unless the law forbids it, and challenge requests that are unlawful.",
        "walkaway": "A promise never to disclose, or to breach a binding legal order on Customer’s instruction.",
        "preferred_language": "",
        "fallbacks": [
          {
            "text": "A transparency report each year, and notice to Customer as soon as a gag order lifts.",
            "language": ""
          }
        ],
        "section": "Subprocessors and transfers"
      },
      {
        "id": "audits",
        "topic": "Audits",
        "covers": "Customer's rights to audit or inspect Processor's compliance",
        "preferred": "Audit obligations are met by providing Processor's SOC 2 Type II report and answering a reasonable security questionnaire once a year.",
        "walkaway": "Unlimited or on-demand audits, audits at Processor's cost, or on-site audits without notice.",
        "fallback": "One on-site audit per year, on 30 days' notice, during business hours, at Customer's cost.",
        "preferred_language": "Processor will make available its most recent SOC 2 Type II report and respond to one reasonable security questionnaire per year, which together satisfy Customer's audit rights.",
        "fallback_language": "Processor will make available its most recent SOC 2 Type II report. If that is not sufficient to show compliance, Customer may conduct one on-site audit per year on thirty (30) days' notice, during business hours and at Customer's cost.",
        "section": "Compliance and assistance"
      },
      {
        "id": "data-subject-requests",
        "topic": "Data subject requests",
        "covers": "Access, deletion and other requests from individuals",
        "preferred": "We give Customer the tools to answer requests itself and forward any request we receive without replying to it.",
        "walkaway": "A duty to answer data subjects on Customer’s behalf, or fixed response times shorter than the law requires.",
        "preferred_language": "",
        "fallbacks": [
          {
            "text": "Reasonable help with requests Customer cannot fulfil through the Services, at our professional services rates.",
            "language": ""
          }
        ],
        "section": "Compliance and assistance"
      },
      {
        "id": "dpia",
        "topic": "Impact assessments",
        "covers": "Help with DPIAs and consultation with regulators",
        "preferred": "We provide the information reasonably needed for Customer’s impact assessments, from our existing documentation.",
        "walkaway": "Carrying out Customer’s impact assessment for it, or bespoke documentation at no charge.",
        "preferred_language": "",
        "fallbacks": [
          {
            "text": "Answers to a reasonable written questionnaire once a year, within 30 days.",
            "language": ""
          }
        ],
        "section": "Compliance and assistance"
      },
      {
        "id": "records",
        "topic": "Records of processing",
        "covers": "The records we keep and share",
        "preferred": "We keep the records a processor must keep and make them available to Customer on request.",
        "walkaway": "Maintaining Customer’s own controller records, or delivering records in Customer’s format on a schedule.",
        "preferred_language": "",
        "fallbacks": [],
        "section": "Compliance and assistance"
      },
      {
        "id": "ai-use",
        "topic": "Use of data for AI and product improvement",
        "covers": "Whether Customer Personal Data can train models or improve the Services",
        "preferred": "We do not use Customer Personal Data to train models for other customers. We may use aggregated, de-identified usage data to run and improve the Services.",
        "walkaway": "A ban on any use of de-identified or aggregated data, or on features that process data with AI on Customer’s own instruction.",
        "preferred_language": "",
        "fallbacks": [
          {
            "text": "Customer may opt out of product-improvement use of its data, other than what is needed for security and billing.",
            "language": ""
          }
        ],
        "section": "Compliance and assistance"
      },
      {
        "id": "deletion",
        "topic": "Return and deletion of data",
        "covers": "What happens to personal data at the end of the Services",
        "preferred": "Delete or return personal data within 30 days after the Services end, except where retention is required by law.",
        "walkaway": "Deletion faster than 30 days, such as within 48 hours, or deletion even where the law requires retention.",
        "fallback": "The same, plus a written certificate of deletion on request.",
        "preferred_language": "Within thirty (30) days after the Services end, Processor will delete or return Customer Personal Data, unless applicable law requires it to be retained.",
        "fallback_language": "Within thirty (30) days after the Services end, Processor will delete or return Customer Personal Data and, on request, certify the deletion in writing, unless applicable law requires it to be retained.",
        "section": "Term and data return"
      },
      {
        "id": "backups",
        "topic": "Backups and retention",
        "covers": "How long data lives in backups after deletion",
        "preferred": "Deleted data is overwritten in backups within 90 days in the ordinary course, and stays protected by the DPA until then.",
        "walkaway": "Immediate deletion from all backups on request, or backup retention schedules set by Customer.",
        "preferred_language": "",
        "fallbacks": [
          {
            "text": "Backup overwrite within 35 days where the Order Form says so.",
            "language": ""
          }
        ],
        "section": "Term and data return"
      },
      {
        "id": "liability",
        "topic": "Liability under the DPA",
        "covers": "How much Processor can be liable for under the DPA",
        "preferred": "Liability under this DPA is subject to the limitation of liability in the Agreement.",
        "walkaway": "Unlimited liability for data protection breaches, or liability outside any cap.",
        "fallback": "A separate higher cap for data protection breaches of up to two times the annual fees.",
        "preferred_language": "Each party's liability under this DPA is subject to the limitations and exclusions of liability in the Agreement.",
        "fallback_language": "Each party's liability under this DPA is subject to the limitations and exclusions of liability in the Agreement, except that Processor's total liability for breaches of this DPA will not exceed two times (2x) the annual fees.",
        "section": "Liability and precedence"
      },
      {
        "id": "fines",
        "topic": "Regulatory fines",
        "covers": "Who bears a fine or penalty from a regulator",
        "preferred": "Each party bears the fines a regulator imposes on it. Neither indemnifies the other for regulatory penalties.",
        "walkaway": "An indemnity from us for fines imposed on Customer, or fines carved out of the liability cap.",
        "preferred_language": "",
        "fallbacks": [],
        "section": "Liability and precedence"
      },
      {
        "id": "precedence",
        "topic": "Order of precedence",
        "covers": "Which document wins if they conflict",
        "preferred": "The Standard Contractual Clauses prevail over the DPA, and the DPA prevails over the Agreement, on data protection matters only.",
        "walkaway": "The DPA overriding the Agreement’s commercial terms, including its limitation of liability.",
        "preferred_language": "",
        "fallbacks": [
          {
            "text": "The DPA prevails on data protection matters, and the liability clause in the Agreement is expressly preserved.",
            "language": ""
          }
        ],
        "section": "Liability and precedence"
      },
      {
        "id": "change-in-law",
        "topic": "Changes in law",
        "covers": "What happens when data protection law changes",
        "preferred": "Either party may propose changes needed to comply with new law, and the parties will negotiate them in good faith.",
        "walkaway": "A right for Customer to amend the DPA unilaterally, or to pass the cost of its own compliance to us.",
        "preferred_language": "",
        "fallbacks": [
          {
            "text": "If the parties cannot agree within 60 days, either may terminate the affected Services without penalty.",
            "language": ""
          }
        ],
        "section": "Liability and precedence"
      }
    ]
  },
  {
    "id": "services",
    "version": 3,
    "status": "live",
    "owner": "Grace Coleman",
    "updated": "2026-08-30T09:15:00",
    "name": "Professional services / SOW",
    "description": "A professional services agreement or statement of work (SOW) under which we perform implementation, consulting or custom development, with deliverables, milestones, acceptance and fees.",
    "clauses": [
      {
        "id": "scope",
        "topic": "Scope and change control",
        "covers": "What work is included and how changes to the scope are handled",
        "preferred": "Scope is limited to the services and deliverables described in the SOW. Any change needs a written change order signed by both parties.",
        "walkaway": "Open-ended scope, such as all services needed to meet Customer's objectives, or changes Customer can require without a change order or extra fees.",
        "fallback": "Minor changes that add no more than 10% of the estimated effort are absorbed without a change order.",
        "preferred_language": "Provider will perform the services and provide the deliverables described in this SOW. Any change to the scope requires a written change order signed by both parties.",
        "fallback_language": "Provider will perform the services and provide the deliverables described in this SOW. Changes that add no more than ten percent (10%) to the estimated effort will be absorbed; any other change requires a written change order signed by both parties.",
        "section": "Scope and delivery"
      },
      {
        "id": "acceptance",
        "topic": "Acceptance of deliverables",
        "covers": "How and when deliverables are accepted or rejected",
        "preferred": "A deliverable is accepted if Customer does not reject it within 10 business days by identifying specific failures to meet the SOW. Provider then corrects and resubmits.",
        "walkaway": "Acceptance at Customer's sole discretion, no deemed acceptance, or unlimited rounds of rework.",
        "fallback": "A 15 business day review period and up to two rounds of correction.",
        "preferred_language": "Each deliverable is accepted unless Customer rejects it in writing within ten (10) business days of delivery, identifying specific ways it does not conform to this SOW. Provider will correct and resubmit any rejected deliverable.",
        "fallback_language": "Each deliverable is accepted unless Customer rejects it in writing within fifteen (15) business days of delivery, identifying specific ways it does not conform to this SOW. Provider will correct and resubmit a rejected deliverable up to two (2) times.",
        "section": "Scope and delivery"
      },
      {
        "id": "personnel",
        "topic": "Personnel and subcontractors",
        "covers": "Who performs the work, staffing changes and subcontracting",
        "preferred": "Provider decides staffing and may use qualified subcontractors, remaining responsible for their work.",
        "walkaway": "Customer approval of all staff, guaranteed key personnel with penalties, or a ban on subcontractors.",
        "fallback": "Customer may ask Provider to replace a team member for reasonable cause.",
        "preferred_language": "Provider determines the personnel who perform the services and may use qualified subcontractors, and remains responsible for their work.",
        "fallback_language": "Provider determines the personnel who perform the services and may use qualified subcontractors, and remains responsible for their work. Customer may ask Provider to replace any team member for reasonable cause.",
        "section": "Scope and delivery"
      },
      {
        "id": "fees",
        "topic": "Fees and invoicing",
        "covers": "How services are priced, invoiced and paid",
        "preferred": "Time-and-materials fees invoiced monthly in arrears, or fixed fees invoiced at each milestone, payable within 30 days.",
        "walkaway": "Payment only after final acceptance of all work, a fixed price with unlimited rework, or holdbacks above 10%.",
        "fallback": "Up to 10% of each milestone fee held back until final acceptance.",
        "preferred_language": "Fees are invoiced monthly in arrears for time-and-materials work and on completion of each milestone for fixed-fee work, and are payable within thirty (30) days of the invoice date.",
        "fallback_language": "Fees are invoiced monthly in arrears for time-and-materials work and on completion of each milestone for fixed-fee work, and are payable within thirty (30) days of the invoice date. Customer may hold back ten percent (10%) of each milestone fee until final acceptance.",
        "section": "Commercial terms"
      },
      {
        "id": "ip",
        "topic": "Intellectual property",
        "covers": "Who owns the deliverables and Provider's pre-existing tools and know-how",
        "preferred": "Provider keeps its pre-existing IP, tools and know-how. Customer owns deliverables created specifically for it once paid for, and gets a license to any Provider IP embedded in them.",
        "walkaway": "Customer owns all IP including Provider's pre-existing tools, platform or know-how, or ownership transfers before payment.",
        "fallback": "Customer owns all deliverables on payment, excluding Provider's pre-existing IP, tools and platform, which are licensed.",
        "preferred_language": "Provider retains all rights in its pre-existing intellectual property, tools and know-how. On payment in full, Customer owns the deliverables created specifically for it under this SOW, and Provider grants Customer a non-exclusive license to any Provider intellectual property embedded in them.",
        "fallback_language": "On payment in full, Customer owns all deliverables under this SOW, excluding Provider's pre-existing intellectual property, tools and platform, which Provider licenses to Customer on a non-exclusive basis to use the deliverables.",
        "section": "Ownership"
      },
      {
        "id": "warranty",
        "topic": "Services warranty",
        "covers": "Promises about the quality of the services and the remedy if they fall short",
        "preferred": "Services are performed in a professional manner. Provider re-performs non-conforming services reported within 30 days, as Customer's sole remedy.",
        "walkaway": "A warranty that deliverables are error-free or fit for Customer's purpose, a refund of all fees, or a warranty period longer than 90 days.",
        "fallback": "A 60-day warranty period, still with re-performance as the sole remedy.",
        "preferred_language": "Provider will perform the services in a professional and workmanlike manner. If Customer reports non-conforming services within thirty (30) days, Provider will re-perform them, which is Customer's sole remedy.",
        "fallback_language": "Provider will perform the services in a professional and workmanlike manner. If Customer reports non-conforming services within sixty (60) days, Provider will re-perform them, which is Customer's sole remedy.",
        "section": "Risk allocation"
      },
      {
        "id": "liability",
        "topic": "Limitation of liability",
        "covers": "Caps on liability for the services work",
        "preferred": "Provider's liability is capped at the fees paid under the SOW. Indirect damages are excluded.",
        "walkaway": "Uncapped liability, or liquidated damages or penalties for delay.",
        "fallback": "A cap of the fees paid under the Agreement in the prior 12 months.",
        "preferred_language": "Provider's total liability arising from this SOW will not exceed the fees paid under this SOW. Neither party is liable for indirect, consequential or lost-profit damages.",
        "fallback_language": "Provider's total liability arising from this SOW will not exceed the fees paid under the Agreement in the twelve (12) months preceding the claim. Neither party is liable for indirect, consequential or lost-profit damages.",
        "section": "Risk allocation"
      }
    ]
  },
  {
    "id": "supplier",
    "version": 2,
    "status": "archived",
    "owner": "Matt Rivera",
    "updated": "2026-07-14T14:30:00",
    "name": "Supplier agreement",
    "description": "An agreement on a supplier's or vendor's paper under which we buy goods or services, such as facilities, hardware, staffing, marketing or third-party software. We are the buyer.h",
    "clauses": [
      {
        "id": "payment",
        "topic": "Payment terms",
        "covers": "When we must pay invoices, late fees and advance payments",
        "preferred": "Payment within 60 days of receiving a valid invoice. No late fees.",
        "walkaway": "Payment terms shorter than 30 days, payment in advance for the whole term, or late fees above 1% per month.",
        "fallback": "Payment within 45 days, or late fees of up to 1% per month on undisputed amounts.",
        "preferred_language": "Buyer will pay each valid and undisputed invoice within sixty (60) days of receiving it.",
        "fallback_language": "Buyer will pay each valid and undisputed invoice within forty-five (45) days of receiving it. Undisputed amounts not paid when due accrue interest at one percent (1%) per month.",
        "section": "Commercial terms"
      },
      {
        "id": "pricing",
        "topic": "Pricing and price changes",
        "covers": "Whether and how the supplier can raise prices",
        "preferred": "Prices are fixed for the term. Renewal increases are capped at 3% or inflation, whichever is lower.",
        "walkaway": "The supplier can raise prices at any time or by any amount, or increases during the term.",
        "fallback": "Renewal increases capped at 5%, with 60 days' notice.",
        "preferred_language": "Prices are fixed for the term. Any increase on renewal will not exceed the lower of three percent (3%) or the change in the Consumer Price Index.",
        "fallback_language": "Prices are fixed for the term. Any increase on renewal will not exceed five percent (5%) and requires sixty (60) days' written notice.",
        "section": "Commercial terms"
      },
      {
        "id": "term",
        "topic": "Term and termination",
        "covers": "How long the agreement lasts, renewal, and our right to end it",
        "preferred": "A 12-month term. Buyer may terminate for convenience on 30 days' notice.",
        "walkaway": "A multi-year commitment with no termination for convenience, or automatic renewal requiring more than 90 days' notice to cancel.",
        "fallback": "Termination for convenience on 60 days' notice, or a term of up to 24 months.",
        "preferred_language": "This Agreement has a term of twelve (12) months. Buyer may terminate it for convenience at any time on thirty (30) days' written notice.",
        "fallback_language": "This Agreement has a term of twelve (12) months. Buyer may terminate it for convenience at any time on sixty (60) days' written notice.",
        "section": "Commercial terms"
      },
      {
        "id": "liability",
        "topic": "Limitation of liability",
        "covers": "Caps on each party's liability and carve-outs from the cap",
        "preferred": "Supplier's cap is at least two times the annual fees, with uncapped liability for data breaches, IP infringement, confidentiality breaches and bodily injury.",
        "walkaway": "A supplier cap below 12 months of fees, no carve-outs for data or confidentiality breaches, or unlimited liability for Buyer.",
        "fallback": "A cap of one times the annual fees, with a higher separate cap for data breaches.",
        "preferred_language": "Supplier's total liability will not exceed two times (2x) the fees payable in the twelve (12) months preceding the claim, except that no cap applies to Supplier's liability for data breaches, infringement of intellectual property, breaches of confidentiality or bodily injury.",
        "fallback_language": "Supplier's total liability will not exceed the fees payable in the twelve (12) months preceding the claim, except that Supplier's liability for data breaches will not exceed three times (3x) those fees.",
        "section": "Risk allocation"
      },
      {
        "id": "indemnity",
        "topic": "Indemnification",
        "covers": "Who defends and pays for third-party claims",
        "preferred": "Supplier indemnifies Buyer for IP infringement, bodily injury, property damage and violations of law.",
        "walkaway": "No indemnity from Supplier, or Buyer broadly indemnifies Supplier.",
        "fallback": "Supplier indemnifies for IP infringement and bodily injury only.",
        "preferred_language": "Supplier will defend and indemnify Buyer against third-party claims arising from infringement of intellectual property, bodily injury, property damage or Supplier's violation of law.",
        "fallback_language": "Supplier will defend and indemnify Buyer against third-party claims arising from infringement of intellectual property or bodily injury caused by Supplier.",
        "section": "Risk allocation"
      },
      {
        "id": "insurance",
        "topic": "Insurance",
        "covers": "Insurance the supplier must carry",
        "preferred": "Commercial general liability of at least $2 million and cyber insurance of at least $5 million.",
        "walkaway": "No insurance requirement, or coverage below $1 million.",
        "fallback": "General liability of at least $1 million and cyber insurance of at least $2 million.",
        "preferred_language": "Supplier will maintain commercial general liability insurance of at least $2,000,000 per occurrence and cyber liability insurance of at least $5,000,000.",
        "fallback_language": "Supplier will maintain commercial general liability insurance of at least $1,000,000 per occurrence and cyber liability insurance of at least $2,000,000.",
        "section": "Risk allocation"
      },
      {
        "id": "security",
        "topic": "Data security and breach notice",
        "covers": "How the supplier protects our data and tells us about incidents",
        "preferred": "Supplier follows written security standards and notifies Buyer of any security incident within 24 hours.",
        "walkaway": "No security obligations, or no deadline for breach notice.",
        "fallback": "Notice within 72 hours of discovery.",
        "preferred_language": "Supplier will protect Buyer data with industry-standard administrative, technical and physical safeguards and will notify Buyer of any security incident affecting Buyer data within twenty-four (24) hours of discovery.",
        "fallback_language": "Supplier will protect Buyer data with industry-standard administrative, technical and physical safeguards and will notify Buyer of any security incident affecting Buyer data within seventy-two (72) hours of discovery.",
        "section": "Data and security"
      },
      {
        "id": "law",
        "topic": "Governing law",
        "covers": "Which law governs and where disputes are heard",
        "preferred": "Laws of Delaware or California.",
        "walkaway": "The supplier's home jurisdiction outside the United States, or mandatory arbitration outside the United States.",
        "fallback": "Laws of New York.",
        "preferred_language": "This Agreement is governed by the laws of the State of Delaware, and the parties submit to the exclusive jurisdiction of the courts located in Delaware.",
        "fallback_language": "This Agreement is governed by the laws of the State of New York, and the parties submit to the exclusive jurisdiction of the courts located in New York County.",
        "section": "General"
      }
    ]
  }
];

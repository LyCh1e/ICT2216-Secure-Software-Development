export const TG_TRIALS = [
  { id: 'NCT-2841', plain: 'New sleep medication', clinical: 'Phase II · Insomnia disorder', duration: '12 weeks', stipend: '$1,200', spots: 47, location: 'Remote + 2 in-person', tag: 'Sleep' },
  { id: 'NCT-3017', plain: 'Migraine prevention device', clinical: 'Phase III · Chronic migraine', duration: '6 months', stipend: '$2,400', spots: 12, location: 'Boston, MA', tag: 'Neurology' },
  { id: 'NCT-1929', plain: 'Anxiety therapy program', clinical: 'Phase II · GAD adjunctive', duration: '8 weeks', stipend: '$900', spots: 31, location: 'Fully remote', tag: 'Mental health' },
  { id: 'NCT-4402', plain: 'Type-2 diabetes nutrition study', clinical: 'Phase IV · T2DM lifestyle', duration: '16 weeks', stipend: '$1,600', spots: 22, location: 'Chicago, IL', tag: 'Metabolic' },
]

export const TG_STEPS = [
  { n: '01', label: 'Create a pseudonym', plain: 'Pick a participant ID — no name, no email shown to researchers.', clinical: 'PT-XXXX-XX identifier. End-to-end encrypted vault.' },
  { n: '02', label: 'Take the eligibility check', plain: 'Answer a short, encrypted questionnaire. Skip anything you\'re not comfortable with.', clinical: 'Inclusion/exclusion screening per protocol; redaction supported.' },
  { n: '03', label: 'Choose a verified trial', plain: 'Only IRB-approved studies from vetted sponsors appear here.', clinical: 'Sponsor + protocol attested against FDA/EMA registries.' },
  { n: '04', label: 'Consent on your terms', plain: 'Read in plain English. Withdraw at any time, no questions asked.', clinical: 'Granular e-consent with revocable scope and audit trail.' },
]

export const TG_FAQ = [
  { q: 'How does TrialGuard keep me anonymous?', a: 'Your real name, contact, and demographics are encrypted in a vault that researchers never see. They only get your participant ID and the specific clinical data you consent to share per study.' },
  { q: 'Who verifies the trials listed here?', a: 'Every sponsor is checked against FDA/EMA registries and the trial protocol must have an active IRB approval letter on file. We display the approval ID and the institution that issued it on each trial page.' },
  { q: 'Can I withdraw after enrolling?', a: 'Yes, at any time, without giving a reason. Your already-submitted data can either be retained pseudonymously for the study, or scheduled for deletion — your choice, recorded with a timestamp.' },
  { q: 'Is there compensation?', a: 'Most trials offer a stipend covering your time and travel. Amounts are listed up front, in plain dollars, before you consent to anything.' },
  { q: 'What if a trial is far from me?', a: 'Many studies are fully remote or hybrid. You can filter by location and travel reimbursement on every search.' },
  { q: 'Who can I talk to with questions?', a: 'Every trial has a dedicated coordinator reachable via a pseudonymous messaging channel inside TrialGuard. Average response time is under 8 hours.' },
]

export const TG_STATS = [
  { k: '142', v: 'Verified active trials' },
  { k: '38k', v: 'Pseudonymous participants' },
  { k: '0', v: 'Data breaches since 2021' },
  { k: '8h', v: 'Avg coordinator reply' },
]

export const TG_QUOTES = [
  { who: 'PT-4F8A-2K', tag: 'Migraine prevention · 6 months in', text: 'I was nervous about putting health info online. TrialGuard let me participate without ever giving my name to the research team.' },
  { who: 'PT-9C12-7B', tag: 'Sleep medication · completed', text: 'The consent doc was the first one I\'ve ever actually finished reading. Plain English, no fine print buried in PDFs.' },
]

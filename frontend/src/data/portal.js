export const PORTAL_TRIALS = [
  { id: 'NCT-2841', plain: 'New sleep medication', clinical: 'Phase II · Insomnia disorder', duration: '12 weeks', stipend: '$1,200', spots: 47, enrolled: 23, location: 'Remote + 2 in-person', tag: 'Sleep', sponsor: 'Helix Therapeutics', risk: 'Low', paid: true, status: 'Recruiting' },
  { id: 'NCT-3017', plain: 'Migraine prevention device', clinical: 'Phase III · Chronic migraine', duration: '6 months', stipend: '$2,400', spots: 12, enrolled: 88, location: 'Boston, MA', tag: 'Neurology', sponsor: 'Arden Bio', risk: 'Medium', paid: true, status: 'Recruiting' },
  { id: 'NCT-1929', plain: 'Anxiety therapy program', clinical: 'Phase II · GAD adjunctive', duration: '8 weeks', stipend: '$900', spots: 31, enrolled: 19, location: 'Fully remote', tag: 'Mental health', sponsor: 'Northbrook Labs', risk: 'Low', paid: true, status: 'Recruiting' },
  { id: 'NCT-4402', plain: 'Type-2 diabetes nutrition', clinical: 'Phase IV · T2DM lifestyle', duration: '16 weeks', stipend: '$1,600', spots: 22, enrolled: 41, location: 'Chicago, IL', tag: 'Metabolic', sponsor: 'Solwin Pharma', risk: 'Medium', paid: true, status: 'Recruiting' },
  { id: 'NCT-5512', plain: 'Experimental oncology infusion', clinical: 'Phase I · Solid tumor dose-finding', duration: '24 weeks', stipend: '$4,800', spots: 6, enrolled: 4, location: 'Houston, TX', tag: 'Oncology', sponsor: 'Arden Bio', risk: 'High', paid: true, status: 'Recruiting' },
  { id: 'OBS-7710', plain: 'Long-term migraine journal', clinical: 'Observational · 12 months', duration: '12 months', stipend: 'Unpaid', spots: 200, enrolled: 67, location: 'Fully remote', tag: 'Neurology', sponsor: 'Verity Health', risk: 'Minimal', paid: false, status: 'Recruiting' },
  { id: 'OBS-2244', plain: 'Sleep habits survey', clinical: 'Observational · 4 weeks', duration: '4 weeks', stipend: 'Unpaid', spots: 500, enrolled: 312, location: 'Fully remote', tag: 'Sleep', sponsor: 'Helix Therapeutics', risk: 'Minimal', paid: false, status: 'Recruiting' },
  { id: 'OBS-9081', plain: 'Mental wellness check-in study', clinical: 'Observational · 8 weeks', duration: '8 weeks', stipend: 'Unpaid', spots: 150, enrolled: 102, location: 'Fully remote', tag: 'Mental health', sponsor: 'Northbrook Labs', risk: 'Minimal', paid: false, status: 'Recruiting' },
]

export const PORTAL_COMPANIES = [
  { id: 'CO-001', name: 'Helix Therapeutics', verifiedOn: 'Mar 2024', trials: 12, contact: 'rfa@helix.health', status: 'Verified' },
  { id: 'CO-002', name: 'Arden Bio', verifiedOn: 'Jul 2023', trials: 8, contact: 'ops@ardenbio.com', status: 'Verified' },
  { id: 'CO-003', name: 'Northbrook Labs', verifiedOn: 'Jan 2026', trials: 5, contact: 'studies@northbrook.co', status: 'Verified' },
  { id: 'CO-004', name: 'Solwin Pharma', verifiedOn: 'Oct 2024', trials: 9, contact: 'research@solwin.com', status: 'Verified' },
  { id: 'CO-005', name: 'Verity Health', verifiedOn: 'May 2025', trials: 4, contact: 'team@verity.health', status: 'Verified' },
  { id: 'CO-006', name: 'Quinton Biosciences', verifiedOn: 'Apr 2026', trials: 1, contact: 'admin@quinton.bio', status: 'Pending' },
]

export const PORTAL_USERS = [
  { id: 'PT-4F8A-2K', joined: '2026-03-12', role: 'Patient', status: 'Active', trials: 1, lastSeen: '14 min ago' },
  { id: 'PT-9C12-7B', joined: '2025-11-04', role: 'Patient', status: 'Active', trials: 2, lastSeen: '2 h ago' },
  { id: 'PT-2A45-9X', joined: '2026-04-22', role: 'Patient', status: 'Pending verify', trials: 0, lastSeen: 'Today' },
  { id: 'PT-7G33-1H', joined: '2025-09-08', role: 'Patient', status: 'Active', trials: 1, lastSeen: 'Yesterday' },
  { id: 'PT-6D81-4M', joined: '2026-02-19', role: 'Patient', status: 'Paused', trials: 1, lastSeen: '3 days ago' },
  { id: 'RS-A102', joined: '2024-08-01', role: 'Researcher · Arden Bio', status: 'Active', trials: 3, lastSeen: '8 min ago' },
  { id: 'RS-B044', joined: '2025-02-14', role: 'Researcher · Helix', status: 'Active', trials: 2, lastSeen: '1 h ago' },
]

export const PORTAL_COHORT = [
  { id: 'PT-4F8A-2K', age: 34, sex: 'Female', trial: 'NCT-2841', joined: '2026-03-14', status: 'Active', adherence: 92, lastReport: '2 days ago', flags: [], nextVisit: 'Tue · 9:30 AM', notes: 'Reports good sleep onset; no AEs since visit 3.' },
  { id: 'PT-9C12-7B', age: 51, sex: 'Male', trial: 'NCT-2841', joined: '2025-11-04', status: 'Active', adherence: 88, lastReport: '5 days ago', flags: ['Late report'], nextVisit: 'Thu · 2:00 PM', notes: 'Missed self-report on day 14, otherwise on schedule.' },
  { id: 'PT-2A45-9X', age: 28, sex: 'Female', trial: 'NCT-2841', joined: '2026-04-22', status: 'Onboarding', adherence: null, lastReport: '—', flags: ['Pending consent'], nextVisit: 'Fri · 10:15 AM', notes: 'Awaiting signed e-consent for sleep diary module.' },
  { id: 'PT-7G33-1H', age: 62, sex: 'Male', trial: 'NCT-2841', joined: '2025-12-19', status: 'Active', adherence: 96, lastReport: 'Yesterday', flags: [], nextVisit: 'Mon · 11:00 AM', notes: 'Exemplary adherence. Eligible for extension protocol.' },
  { id: 'PT-6D81-4M', age: 45, sex: 'Female', trial: 'NCT-2841', joined: '2026-02-19', status: 'At-risk', adherence: 54, lastReport: '11 days ago', flags: ['Missed 2 visits', 'No reply 7d'], nextVisit: 'Unscheduled', notes: 'Two consecutive missed visits. Considered for withdrawal.' },
]

export const PORTAL_REPORTS = [
  { id: 'RPT-088', title: 'Visit 4 — sleep diary summary', patient: 'PT-4F8A-2K', date: 'May 22, 2026', size: '1.2 MB', kind: 'PDF' },
  { id: 'RPT-087', title: 'Adherence check, week 12', patient: 'PT-9C12-7B', date: 'May 20, 2026', size: '420 KB', kind: 'PDF' },
  { id: 'RPT-086', title: 'Baseline polysomnography', patient: 'PT-7G33-1H', date: 'May 18, 2026', size: '6.8 MB', kind: 'DCM' },
]

export const PORTAL_DOCS = [
  { id: 'DOC-001', name: 'Primary care records 2024–25.pdf', kind: 'PDF', size: '2.4 MB', uploaded: 'Apr 12, 2026', tag: 'Medical history' },
  { id: 'DOC-002', name: 'Sleep clinic referral.pdf', kind: 'PDF', size: '180 KB', uploaded: 'Apr 14, 2026', tag: 'Referral' },
  { id: 'DOC-003', name: 'Lab results — CBC, May 2026.pdf', kind: 'PDF', size: '720 KB', uploaded: 'May 02, 2026', tag: 'Lab' },
]

export const PORTAL_AUDIT = [
  { t: '14:02', who: 'admin@trialguard', what: 'Paused account PT-6D81-4M', tag: 'User' },
  { t: '13:47', who: 'admin@trialguard', what: 'Verified sponsor Quinton Biosciences', tag: 'Sponsor' },
  { t: '13:30', who: 'system', what: 'New IRB letter ingested for NCT-5512', tag: 'Trial' },
  { t: '12:18', who: 'admin@trialguard', what: 'Removed trial OBS-1145 (sponsor withdrawn)', tag: 'Trial' },
  { t: '11:09', who: 'admin@trialguard', what: 'Approved researcher RS-B044', tag: 'User' },
]

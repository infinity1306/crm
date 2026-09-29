// ==============================================================================
// STAR CHAIN LABS CRM — HR Recruitment Tracker Service
// Persistent candidate pipeline tracking with CSV export & Supabase sync
// ==============================================================================

import { Candidate } from '../types/recruitment';
import { supabaseAdmin } from '../lib/supabase';

const RECRUITMENT_STORAGE_KEY = 'scl_recruitment_candidates_v1';

// Seeded real-world candidate pipeline records
export const INITIAL_MOCK_CANDIDATES: Candidate[] = [
  {
    id: 'cand-001',
    date: '2026-09-24',
    name: 'Aakash Verma',
    mobileNumber: '+91 98450 11223',
    email: 'aakash.verma@example.com',
    positionAppliedFor: 'Senior Frontend Engineer (React/TypeScript)',
    currentLocation: 'Bangalore',
    homeTown: 'Lucknow',
    relocate: 'yes',
    highestQualification: 'B.Tech (Computer Science)',
    experience: '4.5 Years',
    currentCompany: 'Infosys Ltd',
    designation: 'Senior Systems Engineer',
    currentSalary: '₹11,50,000 LPA',
    expectedSalary: '₹16,00,000 LPA',
    noticePeriod: '30 Days',
    communication: 'Excellent',
    telephonicInterview: 'selected',
    hrRound: 'selected',
    managerialRound: 'selected',
    remarks: 'Strong architectural fundamentals in React, Tailwind, and WebSockets. Manager approved. Ready for offer rollout.',
    createdAt: '2026-09-24T10:00:00Z',
    updatedAt: '2026-09-28T16:30:00Z'
  },
  {
    id: 'cand-002',
    date: '2026-09-25',
    name: 'Pooja Iyer',
    mobileNumber: '+91 97112 44556',
    email: 'pooja.iyer@example.com',
    positionAppliedFor: 'Enterprise Sales Executive',
    currentLocation: 'Mumbai',
    homeTown: 'Pune',
    relocate: 'yes',
    highestQualification: 'MBA (Marketing)',
    experience: '3.0 Years',
    currentCompany: 'Zoho Corporation',
    designation: 'Account Executive',
    currentSalary: '₹8,20,000 LPA',
    expectedSalary: '₹12,00,000 LPA',
    noticePeriod: '15 Days',
    communication: 'Excellent',
    telephonicInterview: 'selected',
    hrRound: 'selected',
    managerialRound: 'on_hold',
    remarks: 'Strong B2B enterprise track record. Currently on hold pending final revenue quota alignment with VP of Sales.',
    createdAt: '2026-09-25T11:30:00Z',
    updatedAt: '2026-09-27T14:15:00Z'
  },
  {
    id: 'cand-003',
    date: '2026-09-26',
    name: 'Rohan Deshmukh',
    mobileNumber: '+91 99887 66554',
    email: 'rohan.deshmukh@example.com',
    positionAppliedFor: 'Backend Node.js & Database Engineer',
    currentLocation: 'Hyderabad',
    homeTown: 'Nagpur',
    relocate: 'yes',
    highestQualification: 'M.Tech (Software Systems)',
    experience: '5.2 Years',
    currentCompany: 'Tech Mahindra',
    designation: 'Technical Lead',
    currentSalary: '₹14,00,000 LPA',
    expectedSalary: '₹18,50,000 LPA',
    noticePeriod: '60 Days',
    communication: 'Good',
    telephonicInterview: 'selected',
    hrRound: 'selected',
    managerialRound: 'selected',
    remarks: 'PostgreSQL optimization, Redis caching, microservices depth. Candidate requesting sign-on bonus for buyout of notice.',
    createdAt: '2026-09-26T09:15:00Z',
    updatedAt: '2026-09-29T10:00:00Z'
  },
  {
    id: 'cand-004',
    date: '2026-09-27',
    name: 'Sneha Sengupta',
    mobileNumber: '+91 98301 77889',
    email: 'sneha.s@example.com',
    positionAppliedFor: 'HR Generalist / Operations Lead',
    currentLocation: 'Bangalore',
    homeTown: 'Kolkata',
    relocate: 'no',
    highestQualification: 'MBA (Human Resources)',
    experience: '3.8 Years',
    currentCompany: 'Wipro Technologies',
    designation: 'HR Executive',
    currentSalary: '₹7,50,000 LPA',
    expectedSalary: '₹10,50,000 LPA',
    noticePeriod: 'Immediate',
    communication: 'Excellent',
    telephonicInterview: 'selected',
    hrRound: 'selected',
    managerialRound: 'selected',
    remarks: 'Immediate joiner. Well versed with labor laws, payroll compliances, 3-segment onboarding, and biometric systems.',
    createdAt: '2026-09-27T14:00:00Z',
    updatedAt: '2026-09-28T18:00:00Z'
  },
  {
    id: 'cand-005',
    date: '2026-09-28',
    name: 'Karan Mehra',
    mobileNumber: '+91 98200 33445',
    email: 'karan.mehra@example.com',
    positionAppliedFor: 'Product UI/UX Designer',
    currentLocation: 'Gurugram',
    homeTown: 'Chandigarh',
    relocate: 'yes',
    highestQualification: 'B.Des (Interaction Design)',
    experience: '2.5 Years',
    currentCompany: 'Zomato',
    designation: 'Associate Designer',
    currentSalary: '₹9,00,000 LPA',
    expectedSalary: '₹13,50,000 LPA',
    noticePeriod: '30 Days',
    communication: 'Good',
    telephonicInterview: 'selected',
    hrRound: 'on_hold',
    managerialRound: 'pending',
    remarks: 'Impressive design system portfolio. On hold awaiting feedback on design sprint task submission.',
    createdAt: '2026-09-28T10:45:00Z',
    updatedAt: '2026-09-29T11:20:00Z'
  },
  {
    id: 'cand-006',
    date: '2026-09-29',
    name: 'Vikas Kushwaha',
    mobileNumber: '+91 97980 66778',
    email: 'vikas.k@example.com',
    positionAppliedFor: 'DevOps & Cloud Engineer',
    currentLocation: 'Noida',
    homeTown: 'Varanasi',
    relocate: 'no',
    highestQualification: 'BCA + MCA',
    experience: '4.0 Years',
    currentCompany: 'HCL Technologies',
    designation: 'Cloud Specialist',
    currentSalary: '₹10,20,000 LPA',
    expectedSalary: '₹15,00,000 LPA',
    noticePeriod: '90 Days',
    communication: 'Average',
    telephonicInterview: 'interview_scheduled',
    hrRound: 'pending',
    managerialRound: 'pending',
    remarks: 'Scheduled for first screening call today at 15:30 IST.',
    createdAt: '2026-09-29T09:00:00Z',
    updatedAt: '2026-09-29T09:00:00Z'
  },
  {
    id: 'cand-007',
    date: '2026-09-22',
    name: 'Nitin Pandey',
    mobileNumber: '+91 99100 88990',
    email: 'nitin.pandey@example.com',
    positionAppliedFor: 'Junior React Developer',
    currentLocation: 'Delhi',
    homeTown: 'Kanpur',
    relocate: 'no',
    highestQualification: 'B.Tech (ECE)',
    experience: '1.2 Years',
    currentCompany: 'Freelance / Startup',
    designation: 'Web Developer',
    currentSalary: '₹4,50,000 LPA',
    expectedSalary: '₹7,00,000 LPA',
    noticePeriod: 'Immediate',
    communication: 'Poor',
    telephonicInterview: 'reject',
    hrRound: 'reject',
    managerialRound: 'reject',
    remarks: 'Did not meet baseline technical requirements in JavaScript and state management.',
    createdAt: '2026-09-22T12:00:00Z',
    updatedAt: '2026-09-23T15:00:00Z'
  }
];

/**
 * Returns list of candidates from LocalStorage (or initial seed)
 */
export function getRecruitmentCandidates(): Candidate[] {
  try {
    const raw = localStorage.getItem(RECRUITMENT_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(RECRUITMENT_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_CANDIDATES));
      return INITIAL_MOCK_CANDIDATES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading recruitment candidates from storage', e);
    return INITIAL_MOCK_CANDIDATES;
  }
}

/**
 * Adds or updates a candidate in the recruitment tracker
 */
export function saveRecruitmentCandidate(candidate: Candidate): Candidate {
  const candidates = getRecruitmentCandidates();
  const existingIdx = candidates.findIndex(c => c.id === candidate.id);
  const now = new Date().toISOString();

  let updatedList: Candidate[];
  if (existingIdx >= 0) {
    updatedList = [...candidates];
    updatedList[existingIdx] = { ...candidate, updatedAt: now };
  } else {
    updatedList = [{ ...candidate, createdAt: now, updatedAt: now }, ...candidates];
  }

  localStorage.setItem(RECRUITMENT_STORAGE_KEY, JSON.stringify(updatedList));

  // Sync to Supabase audit trail
  try {
    supabaseAdmin.from('audit_logs').insert({
      user_name: 'HR Recruitment Desk',
      user_role: 'admin',
      action: existingIdx >= 0 ? 'RECRUITMENT_CANDIDATE_UPDATE' : 'RECRUITMENT_CANDIDATE_CREATE',
      details: {
        candidateId: candidate.id,
        name: candidate.name,
        position: candidate.positionAppliedFor,
        telephonic: candidate.telephonicInterview,
        hrRound: candidate.hrRound,
        managerialRound: candidate.managerialRound
      },
      timestamp: now
    });
  } catch {}

  return candidate;
}

/**
 * Deletes a candidate by ID
 */
export function deleteRecruitmentCandidate(id: string): boolean {
  const candidates = getRecruitmentCandidates();
  const filtered = candidates.filter(c => c.id !== id);
  localStorage.setItem(RECRUITMENT_STORAGE_KEY, JSON.stringify(filtered));

  try {
    supabaseAdmin.from('audit_logs').insert({
      user_name: 'HR Recruitment Desk',
      user_role: 'admin',
      action: 'RECRUITMENT_CANDIDATE_DELETE',
      details: { candidateId: id },
      timestamp: new Date().toISOString()
    });
  } catch {}

  return true;
}

/**
 * Exports candidates list as a cleanly formatted CSV spreadsheet
 */
export function exportCandidatesToCSV(candidates: Candidate[]): void {
  const headers = [
    'DATE',
    'NAME',
    'MOBILE NO.',
    'EMAIL ID',
    'POSITION APPLIED FOR',
    'CURRENT LOCATION',
    'HOME TOWN',
    'RELOCATE',
    'HIGHEST QUALIFICATION',
    'EXPERIENCE',
    'CURRENT/LAST COMPANY',
    'DESIGNATION',
    'CURRENT/LAST DRAWN SALARY',
    'EXPECTED SALARY',
    'NOTICE PERIOD',
    'COMMUNICATION',
    'TELEPHONIC INTERVIEW',
    'HR ROUND',
    'MANAGERIAL ROUND',
    'REMARKS'
  ];

  const rows = candidates.map(c => [
    `"${c.date || ''}"`,
    `"${c.name || ''}"`,
    `"${c.mobileNumber || ''}"`,
    `"${c.email || ''}"`,
    `"${(c.positionAppliedFor || '').replace(/"/g, '""')}"`,
    `"${c.currentLocation || ''}"`,
    `"${c.homeTown || ''}"`,
    `"${c.relocate || ''}"`,
    `"${c.highestQualification || ''}"`,
    `"${c.experience || ''}"`,
    `"${(c.currentCompany || '').replace(/"/g, '""')}"`,
    `"${(c.designation || '').replace(/"/g, '""')}"`,
    `"${c.currentSalary || ''}"`,
    `"${c.expectedSalary || ''}"`,
    `"${c.noticePeriod || ''}"`,
    `"${c.communication || ''}"`,
    `"${c.telephonicInterview || ''}"`,
    `"${c.hrRound || ''}"`,
    `"${c.managerialRound || ''}"`,
    `"${(c.remarks || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `SCL_Recruitment_Tracker_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

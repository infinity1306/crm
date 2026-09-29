// ==============================================================================
// STAR CHAIN LABS CRM — HR Recruitment Tracker Types
// Access restricted strictly to HR Operations and Super Admin
// ==============================================================================

export type TelephonicInterviewStatus = 
  | 'interview_scheduled' 
  | 'selected' 
  | 'on_hold' 
  | 'reject'
  | 'pending';

export type RoundStatus = 
  | 'selected' 
  | 'on_hold' 
  | 'reject' 
  | 'scheduled'
  | 'pending';

export type CommunicationLevel = 
  | 'Excellent' 
  | 'Good' 
  | 'Average' 
  | 'Poor';

export type RelocateOption = 'yes' | 'no';

export interface Candidate {
  id: string;
  date: string;                         // DATE (YYYY-MM-DD)
  name: string;                         // NAME
  mobileNumber: string;                 // MOBILE NO.
  email: string;                        // EMAIL ID
  positionAppliedFor: string;           // POSITION APPLIED FOR
  currentLocation: string;              // CURRENT LOCATION
  homeTown: string;                     // HOME TOWN
  relocate: RelocateOption;             // RELOCATE (yes/no)
  highestQualification: string;         // HIGHEST QUALIFICATION
  experience: string;                   // EXPERIENCE
  currentCompany: string;               // CURRENT/LAST COMPANY
  designation: string;                  // DESIGNATION
  currentSalary: string;                // CURRENT/LAST DRAWN SALARY
  expectedSalary: string;               // EXPECTED SALARY
  noticePeriod: string;                 // NOTICE PEROID
  communication: CommunicationLevel;    // COMMUNICATION
  telephonicInterview: TelephonicInterviewStatus; // TELEPHONIC INTERVIEW
  hrRound: RoundStatus;                 // HR Round
  managerialRound: RoundStatus;         // MANAGERIAL ROUND
  remarks: string;                      // REMARKS
  createdAt?: string;
  updatedAt?: string;
}

export interface RecruitmentFilters {
  searchQuery: string;
  position: string;
  telephonicStatus: string;
  hrStatus: string;
  managerialStatus: string;
  relocate: string;
  communication: string;
}

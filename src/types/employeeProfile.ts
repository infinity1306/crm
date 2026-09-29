// ==============================================================================
// STAR CHAIN LABS CRM — Employee Profile 3-Segment Data Models
// All fields are strictly compulsory across Personal, Bank, and Job Segments
// ==============================================================================

export interface PersonalDetails {
  name: string;                         // Full Legal Name
  dob: string;                          // Date of Birth (YYYY-MM-DD)
  bloodGroup: string;                   // Blood Group (A+, A-, B+, B-, AB+, AB-, O+, O-)
  email: string;                        // Official / Personal Email ID
  mobileNumber: string;                 // Mobile Contact Number
  emergencyContactName: string;         // Emergency Contact Person Name
  emergencyContactNumber: string;       // Emergency Contact Mobile Number
  emergencyContactRelationship: string; // Relationship with Emergency Contact
  currentAddress: string;               // Current Residential Address
  permanentAddress: string;             // Permanent Hometown Address
  joiningDate: string;                  // Joining Date (YYYY-MM-DD)
}

export interface BankDetails {
  name: string;                         // Employee Name
  accountHolderName: string;            // Account Holder Name as in Bank
  bankName: string;                     // Bank Name (e.g., HDFC, SBI, ICICI)
  accountNumber: string;                // Account Number
  ifscCode: string;                     // IFSC Code (11 characters)
  branch: string;                       // Branch Name / Location
}

export interface JobDetails {
  name: string;                         // Employee Name
  employeeId: string;                   // Corporate Employee ID (e.g. SCL-2026-001)
  doj: string;                          // Date of Joining (DOJ)
  designation: string;                  // Official Designation
  team: string;                         // Department / Team
  employmentType: string;               // Employment Type (Full-Time, Contract, etc.)
  workMode: string;                     // Work Mode (Office, Remote, Hybrid)
  employmentStatus: string;             // Employment Status (Active, Probation, etc.)
}

export interface EmployeeProfileRecord {
  id: string;                           // Employee Unique ID (emp-admin, emp-001)
  personal: PersonalDetails;
  bank: BankDetails;
  job: JobDetails;
  updatedAt?: string;
  syncedToSupabase?: boolean;
}

export type SegmentKey = 'personal' | 'bank' | 'job';

export interface SegmentValidationErrors {
  personal?: Partial<Record<keyof PersonalDetails, string>>;
  bank?: Partial<Record<keyof BankDetails, string>>;
  job?: Partial<Record<keyof JobDetails, string>>;
}

export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] as const;

export const RELATIONSHIPS = [
  'Father',
  'Mother',
  'Spouse',
  'Sibling (Brother/Sister)',
  'Child (Son/Daughter)',
  'Guardian',
  'Friend',
  'Other'
] as const;

export const EMPLOYMENT_TYPES = [
  'Full-Time',
  'Part-Time',
  'Contract / Consultant',
  'Internship',
  'Probationary'
] as const;

export const WORK_MODES = [
  'Office (On-Site)',
  'Remote (Work From Home)',
  'Hybrid'
] as const;

export const EMPLOYMENT_STATUSES = [
  'Active',
  'Probation',
  'Notice Period',
  'On Leave',
  'Inactive'
] as const;

export const COMMON_BANKS = [
  'HDFC Bank',
  'State Bank of India (SBI)',
  'ICICI Bank',
  'Axis Bank',
  'Kotak Mahindra Bank',
  'Punjab National Bank (PNB)',
  'Bank of Baroda',
  'IndusInd Bank',
  'IDFC FIRST Bank',
  'Yes Bank',
  'Canara Bank',
  'Union Bank of India'
] as const;

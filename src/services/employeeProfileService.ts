// ==============================================================================
// STAR CHAIN LABS CRM — Employee Profile 3-Segment Supabase Service
// Handles fetching, validation, and live synchronization with Supabase PostgreSQL
// ==============================================================================

import { supabase, supabaseAdmin, SUPABASE_URL } from '../lib/supabase';
import { 
  EmployeeProfileRecord, 
  PersonalDetails, 
  BankDetails, 
  JobDetails, 
  SegmentKey, 
  SegmentValidationErrors 
} from '../types/employeeProfile';
import { getClientIp } from './attendanceService';

const STORAGE_PREFIX = 'scl_emp_segments_';

/**
 * Returns default template for an employee record
 */
export function getDefaultEmployeeRecord(
  employeeId: string, 
  defaultName: string = '', 
  defaultEmail: string = '',
  defaultDesignation: string = '',
  defaultTeam: string = 'Engineering'
): EmployeeProfileRecord {
  return {
    id: employeeId,
    personal: {
      name: defaultName || 'Employee Name',
      dob: '1995-01-01',
      bloodGroup: 'O+',
      email: defaultEmail || `${employeeId}@starchainlabs.com`,
      mobileNumber: '+91 98765 43210',
      emergencyContactName: 'Primary Contact',
      emergencyContactNumber: '+91 98765 00000',
      emergencyContactRelationship: 'Spouse',
      currentAddress: 'Bangalore, Karnataka, India',
      permanentAddress: 'Bangalore, Karnataka, India',
      joiningDate: '2026-01-01'
    },
    bank: {
      name: defaultName || 'Employee Name',
      accountHolderName: defaultName || 'Employee Name',
      bankName: 'HDFC Bank',
      accountNumber: '50100234567890',
      ifscCode: 'HDFC0001234',
      branch: 'Indiranagar, Bangalore'
    },
    job: {
      name: defaultName || 'Employee Name',
      employeeId: employeeId.toUpperCase(),
      doj: '2026-01-01',
      designation: defaultDesignation || 'Software Engineer',
      team: defaultTeam || 'Engineering',
      employmentType: 'Full-Time',
      workMode: 'Hybrid',
      employmentStatus: 'Active'
    },
    updatedAt: new Date().toISOString(),
    syncedToSupabase: true
  };
}

/**
 * Validates compulsory fields across Personal, Bank, and Job Segments
 */
export function validateEmployeeSegments(
  record: EmployeeProfileRecord,
  segment?: SegmentKey
): { isValid: boolean; errors: SegmentValidationErrors; missingFields: string[] } {
  const errors: SegmentValidationErrors = {
    personal: {},
    bank: {},
    job: {}
  };
  const missingFields: string[] = [];

  // 1. Personal Details Validation
  if (!segment || segment === 'personal') {
    const p = record.personal || ({} as PersonalDetails);
    
    if (!p.name?.trim()) {
      errors.personal!.name = 'Full legal name is compulsory.';
      missingFields.push('Personal: Name');
    }
    if (!p.dob?.trim()) {
      errors.personal!.dob = 'Date of birth is compulsory.';
      missingFields.push('Personal: DOB');
    }
    if (!p.bloodGroup?.trim()) {
      errors.personal!.bloodGroup = 'Blood group is compulsory.';
      missingFields.push('Personal: Blood Group');
    }
    if (!p.email?.trim()) {
      errors.personal!.email = 'Email address is compulsory.';
      missingFields.push('Personal: Email ID');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(p.email.trim())) {
      errors.personal!.email = 'Invalid email address format.';
      missingFields.push('Personal: Valid Email ID');
    }
    if (!p.mobileNumber?.trim()) {
      errors.personal!.mobileNumber = 'Mobile number is compulsory.';
      missingFields.push('Personal: Mobile Number');
    } else if (p.mobileNumber.replace(/\D/g, '').length < 10) {
      errors.personal!.mobileNumber = 'Mobile number must contain at least 10 digits.';
      missingFields.push('Personal: 10-Digit Mobile Number');
    }
    if (!p.emergencyContactName?.trim()) {
      errors.personal!.emergencyContactName = 'Emergency contact name is compulsory.';
      missingFields.push('Personal: Emergency Contact Name');
    }
    if (!p.emergencyContactNumber?.trim()) {
      errors.personal!.emergencyContactNumber = 'Emergency contact number is compulsory.';
      missingFields.push('Personal: Emergency Contact Number');
    } else if (p.emergencyContactNumber.replace(/\D/g, '').length < 10) {
      errors.personal!.emergencyContactNumber = 'Emergency number must contain at least 10 digits.';
      missingFields.push('Personal: 10-Digit Emergency Number');
    }
    if (!p.emergencyContactRelationship?.trim()) {
      errors.personal!.emergencyContactRelationship = 'Relationship is compulsory.';
      missingFields.push('Personal: Emergency Contact Relationship');
    }
    if (!p.currentAddress?.trim()) {
      errors.personal!.currentAddress = 'Current residential address is compulsory.';
      missingFields.push('Personal: Current Address');
    }
    if (!p.permanentAddress?.trim()) {
      errors.personal!.permanentAddress = 'Permanent address is compulsory.';
      missingFields.push('Personal: Permanent Address');
    }
    if (!p.joiningDate?.trim()) {
      errors.personal!.joiningDate = 'Joining date is compulsory.';
      missingFields.push('Personal: Joining Date');
    }
  }

  // 2. Bank Details Validation
  if (!segment || segment === 'bank') {
    const b = record.bank || ({} as BankDetails);

    if (!b.name?.trim()) {
      errors.bank!.name = 'Employee name is compulsory.';
      missingFields.push('Bank: Name');
    }
    if (!b.accountHolderName?.trim()) {
      errors.bank!.accountHolderName = 'Account holder name is compulsory.';
      missingFields.push('Bank: Account Holder Name');
    }
    if (!b.bankName?.trim()) {
      errors.bank!.bankName = 'Bank name is compulsory.';
      missingFields.push('Bank: Bank Name');
    }
    if (!b.accountNumber?.trim()) {
      errors.bank!.accountNumber = 'Account number is compulsory.';
      missingFields.push('Bank: Account Number');
    } else if (b.accountNumber.trim().length < 6) {
      errors.bank!.accountNumber = 'Account number must be at least 6 characters.';
      missingFields.push('Bank: Valid Account Number');
    }
    if (!b.ifscCode?.trim()) {
      errors.bank!.ifscCode = 'IFSC code is compulsory.';
      missingFields.push('Bank: IFSC Code');
    } else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(b.ifscCode.trim())) {
      errors.bank!.ifscCode = 'Invalid IFSC code format (e.g., HDFC0001234, 11 alphanumeric).';
      missingFields.push('Bank: Valid IFSC Code Format');
    }
    if (!b.branch?.trim()) {
      errors.bank!.branch = 'Bank branch is compulsory.';
      missingFields.push('Bank: Branch');
    }
  }

  // 3. Job Details Validation
  if (!segment || segment === 'job') {
    const j = record.job || ({} as JobDetails);

    if (!j.name?.trim()) {
      errors.job!.name = 'Employee name is compulsory.';
      missingFields.push('Job: Name');
    }
    if (!j.employeeId?.trim()) {
      errors.job!.employeeId = 'Employee ID is compulsory.';
      missingFields.push('Job: Employee ID');
    }
    if (!j.doj?.trim()) {
      errors.job!.doj = 'Date of joining (DOJ) is compulsory.';
      missingFields.push('Job: DOJ');
    }
    if (!j.designation?.trim()) {
      errors.job!.designation = 'Official designation is compulsory.';
      missingFields.push('Job: Designation');
    }
    if (!j.team?.trim()) {
      errors.job!.team = 'Team / Department is compulsory.';
      missingFields.push('Job: Team');
    }
    if (!j.employmentType?.trim()) {
      errors.job!.employmentType = 'Employment type is compulsory.';
      missingFields.push('Job: Employment Type');
    }
    if (!j.workMode?.trim()) {
      errors.job!.workMode = 'Work mode is compulsory.';
      missingFields.push('Job: Work Mode');
    }
    if (!j.employmentStatus?.trim()) {
      errors.job!.employmentStatus = 'Employment status is compulsory.';
      missingFields.push('Job: Employment Status');
    }
  }

  const isValid = missingFields.length === 0;
  return { isValid, errors, missingFields };
}

/**
 * Saves Employee Profile Segments into Supabase PostgreSQL
 * Automatically attempts 'employee_details' dedicated table, and falls back to live Supabase ledger.
 */
export async function saveEmployeeSegmentsToSupabase(
  record: EmployeeProfileRecord
): Promise<{ success: boolean; mode: 'supabase_table' | 'supabase_ledger'; error?: string; timestamp: string }> {
  const timestamp = new Date().toISOString();
  record.updatedAt = timestamp;
  record.syncedToSupabase = true;

  // Cache locally immediately for zero-latency retrieval
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${record.id}`, JSON.stringify(record));
  } catch (e) {
    // LocalStorage fallback
  }

  // 1. Try upserting into public.employee_details
  try {
    const rowPayload = {
      id: record.id,
      name: record.personal.name.trim(),
      dob: record.personal.dob,
      blood_group: record.personal.bloodGroup,
      email: record.personal.email.trim(),
      mobile_number: record.personal.mobileNumber.trim(),
      emergency_contact_name: record.personal.emergencyContactName.trim(),
      emergency_contact_number: record.personal.emergencyContactNumber.trim(),
      emergency_contact_relationship: record.personal.emergencyContactRelationship.trim(),
      current_address: record.personal.currentAddress.trim(),
      permanent_address: record.personal.permanentAddress.trim(),
      joining_date: record.personal.joiningDate,

      bank_employee_name: record.bank.name.trim(),
      account_holder_name: record.bank.accountHolderName.trim(),
      bank_name: record.bank.bankName.trim(),
      account_number: record.bank.accountNumber.trim(),
      ifsc_code: record.bank.ifscCode.trim().toUpperCase(),
      branch: record.bank.branch.trim(),

      job_employee_name: record.job.name.trim(),
      employee_id_code: record.job.employeeId.trim(),
      doj: record.job.doj,
      designation: record.job.designation.trim(),
      team: record.job.team.trim(),
      employment_type: record.job.employmentType.trim(),
      work_mode: record.job.workMode.trim(),
      employment_status: record.job.employmentStatus.trim(),
      updated_at: timestamp
    };

    const { error: tableError } = await supabaseAdmin
      .from('employee_details')
      .upsert(rowPayload, { onConflict: 'id' });

    if (!tableError) {
      // Also log to audit ledger for enterprise traceability
      supabaseAdmin.from('audit_logs').insert({
        user_id: record.id,
        user_name: record.personal.name,
        user_role: 'employee',
        action: 'EMPLOYEE_PROFILE_SEGMENTS_UPDATE',
        entity_type: 'employee_profile_segment',
        entity_id: record.id,
        ip_address: await getClientIp(),
        user_agent: navigator.userAgent || 'Enterprise OS',
        status: 'SUCCESS',
        new_values: record,
        details: `Saved 3 profile segments for ${record.personal.name} to employee_details table.`
      }).then(() => {});

      return { success: true, mode: 'supabase_table', timestamp };
    }
  } catch (err) {
    // Continue to Supabase audit ledger fallback
  }

  // 2. Primary/Fallback storage in Supabase PostgreSQL audit_logs ledger
  try {
    const ip = await getClientIp();
    const { error: ledgerError } = await supabaseAdmin.from('audit_logs').insert({
      user_id: record.id,
      user_name: record.personal.name,
      user_role: 'employee',
      action: 'EMPLOYEE_PROFILE_SEGMENTS_UPDATE',
      entity_type: 'employee_profile_segment',
      entity_id: record.id,
      ip_address: ip,
      user_agent: navigator.userAgent || 'Enterprise OS',
      status: 'SUCCESS',
      new_values: record,
      details: `Persisted 3 profile segments (Personal, Bank, Job) for ${record.personal.name} in Supabase.`
    });

    if (ledgerError) {
      console.warn('Supabase ledger write warning:', ledgerError);
      return { success: false, mode: 'supabase_ledger', error: ledgerError.message, timestamp };
    }

    return { success: true, mode: 'supabase_ledger', timestamp };
  } catch (err: any) {
    return { success: false, mode: 'supabase_ledger', error: err?.message || 'Network error', timestamp };
  }
}

/**
 * Fetches an employee's 3-segment profile records from Supabase
 */
export async function fetchEmployeeSegmentsFromSupabase(
  employeeId: string,
  fallbackDefaults?: { name?: string; email?: string; designation?: string; team?: string }
): Promise<EmployeeProfileRecord> {
  // 1. Check if employee_details table exists and has row
  try {
    const { data, error } = await supabaseAdmin
      .from('employee_details')
      .select('*')
      .eq('id', employeeId)
      .maybeSingle();

    if (data && !error) {
      const record: EmployeeProfileRecord = {
        id: data.id,
        personal: {
          name: data.name || '',
          dob: data.dob || '',
          bloodGroup: data.blood_group || 'O+',
          email: data.email || '',
          mobileNumber: data.mobile_number || '',
          emergencyContactName: data.emergency_contact_name || '',
          emergencyContactNumber: data.emergency_contact_number || '',
          emergencyContactRelationship: data.emergency_contact_relationship || 'Spouse',
          currentAddress: data.current_address || '',
          permanentAddress: data.permanent_address || '',
          joiningDate: data.joining_date || ''
        },
        bank: {
          name: data.bank_employee_name || data.name || '',
          accountHolderName: data.account_holder_name || '',
          bankName: data.bank_name || '',
          accountNumber: data.account_number || '',
          ifscCode: data.ifsc_code || '',
          branch: data.branch || ''
        },
        job: {
          name: data.job_employee_name || data.name || '',
          employeeId: data.employee_id_code || employeeId.toUpperCase(),
          doj: data.doj || '',
          designation: data.designation || '',
          team: data.team || '',
          employmentType: data.employment_type || 'Full-Time',
          workMode: data.work_mode || 'Hybrid',
          employmentStatus: data.employment_status || 'Active'
        },
        updatedAt: data.updated_at || new Date().toISOString(),
        syncedToSupabase: true
      };

      // Cache locally
      localStorage.setItem(`${STORAGE_PREFIX}${employeeId}`, JSON.stringify(record));
      return record;
    }
  } catch {
    // Proceed to ledger query
  }

  // 2. Query Supabase audit_logs ledger
  try {
    const { data: ledgerData, error: ledgerError } = await supabaseAdmin
      .from('audit_logs')
      .select('new_values, timestamp')
      .eq('entity_type', 'employee_profile_segment')
      .eq('entity_id', employeeId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (ledgerData && !ledgerError && ledgerData.new_values && typeof ledgerData.new_values === 'object') {
      const parsed = ledgerData.new_values as EmployeeProfileRecord;
      if (parsed.personal && parsed.bank && parsed.job) {
        parsed.updatedAt = ledgerData.timestamp;
        parsed.syncedToSupabase = true;
        localStorage.setItem(`${STORAGE_PREFIX}${employeeId}`, JSON.stringify(parsed));
        return parsed;
      }
    }
  } catch {
    // Proceed to local cache
  }

  // 3. Check LocalStorage
  try {
    const local = localStorage.getItem(`${STORAGE_PREFIX}${employeeId}`);
    if (local) {
      const parsed = JSON.parse(local);
      if (parsed.personal && parsed.bank && parsed.job) {
        return parsed;
      }
    }
  } catch {
    // Fallback
  }

  // 4. Return default seed
  return getDefaultEmployeeRecord(
    employeeId,
    fallbackDefaults?.name,
    fallbackDefaults?.email,
    fallbackDefaults?.designation,
    fallbackDefaults?.team
  );
}

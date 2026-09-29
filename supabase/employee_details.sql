-- ======================================================================
-- STAR CHAIN LABS CRM - Employee 3-Segment Profile Records
-- Compatible with Supabase PostgreSQL (PostgREST + RLS)
-- ======================================================================

CREATE TABLE IF NOT EXISTS public.employee_details (
    id VARCHAR(64) PRIMARY KEY, -- employee ID (e.g. emp-admin, emp-001)
    
    -- Segment 1: Personal Details (All Compulsory)
    name VARCHAR(128) NOT NULL,
    dob DATE NOT NULL,
    blood_group VARCHAR(16) NOT NULL,
    email VARCHAR(128) NOT NULL,
    mobile_number VARCHAR(32) NOT NULL,
    emergency_contact_name VARCHAR(128) NOT NULL,
    emergency_contact_number VARCHAR(32) NOT NULL,
    emergency_contact_relationship VARCHAR(64) NOT NULL,
    current_address TEXT NOT NULL,
    permanent_address TEXT NOT NULL,
    joining_date DATE NOT NULL,

    -- Segment 2: Bank Details (All Compulsory)
    bank_employee_name VARCHAR(128) NOT NULL,
    account_holder_name VARCHAR(128) NOT NULL,
    bank_name VARCHAR(128) NOT NULL,
    account_number VARCHAR(64) NOT NULL,
    ifsc_code VARCHAR(32) NOT NULL,
    branch VARCHAR(128) NOT NULL,

    -- Segment 3: Job Details (All Compulsory)
    job_employee_name VARCHAR(128) NOT NULL,
    employee_id_code VARCHAR(64) NOT NULL,
    doj DATE NOT NULL,
    designation VARCHAR(128) NOT NULL,
    team VARCHAR(128) NOT NULL,
    employment_type VARCHAR(64) NOT NULL,
    work_mode VARCHAR(32) NOT NULL,
    employment_status VARCHAR(32) NOT NULL,

    -- System Audit Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on search & filter fields
CREATE INDEX IF NOT EXISTS idx_employee_details_email ON public.employee_details(email);
CREATE INDEX IF NOT EXISTS idx_employee_details_team ON public.employee_details(team);
CREATE INDEX IF NOT EXISTS idx_employee_details_updated ON public.employee_details(updated_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE public.employee_details ENABLE ROW LEVEL SECURITY;

-- PostgREST RLS Policies (Allow Read, Insert, and Update with API keys)
DROP POLICY IF EXISTS "allow_read_employee_details" ON public.employee_details;
CREATE POLICY "allow_read_employee_details" ON public.employee_details FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_insert_employee_details" ON public.employee_details;
CREATE POLICY "allow_insert_employee_details" ON public.employee_details FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "allow_update_employee_details" ON public.employee_details;
CREATE POLICY "allow_update_employee_details" ON public.employee_details FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "allow_delete_employee_details" ON public.employee_details;
CREATE POLICY "allow_delete_employee_details" ON public.employee_details FOR DELETE USING (true);

-- Seed initial record for emp-admin if not already present
INSERT INTO public.employee_details (
    id,
    name,
    dob,
    blood_group,
    email,
    mobile_number,
    emergency_contact_name,
    emergency_contact_number,
    emergency_contact_relationship,
    current_address,
    permanent_address,
    joining_date,
    bank_employee_name,
    account_holder_name,
    bank_name,
    account_number,
    ifsc_code,
    branch,
    job_employee_name,
    employee_id_code,
    doj,
    designation,
    team,
    employment_type,
    work_mode,
    employment_status
) VALUES (
    'emp-admin',
    'System Administrator',
    '1992-05-14',
    'O+',
    'admin@starchainlabs.com',
    '+91 98765 00000',
    'Sunita Sharma',
    '+91 98765 11111',
    'Spouse',
    'Flat 402, Embassy Residency, Outer Ring Road, Bellandur, Bengaluru 560103',
    'House 12, Civil Lines, Jaipur, Rajasthan 302006',
    '2026-01-01',
    'System Administrator',
    'System Administrator',
    'HDFC Bank',
    '50100234567890',
    'HDFC0001234',
    'Indiranagar 100ft Rd, Bengaluru',
    'System Administrator',
    'SCL-EXEC-001',
    '2026-01-01',
    'System Administrator',
    'Operations',
    'Full-Time',
    'Hybrid',
    'Active'
) ON CONFLICT (id) DO NOTHING;

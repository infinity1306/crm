-- ======================================================================
-- STAR CHAIN LABS CRM - Recruitment Tracker Database Schema
-- Access strictly restricted to HR Operations & Super Admin
-- ======================================================================

CREATE TABLE IF NOT EXISTS public.recruitment_tracker (
    id VARCHAR(64) PRIMARY KEY,
    
    -- 1. Date of Application
    application_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- 2. Candidate Basic & Contact Details
    name VARCHAR(128) NOT NULL,
    mobile_number VARCHAR(32) NOT NULL,
    email VARCHAR(128) NOT NULL,
    position_applied_for VARCHAR(128) NOT NULL,
    
    -- 3. Location & Relocation
    current_location VARCHAR(128),
    home_town VARCHAR(128),
    relocate VARCHAR(8) DEFAULT 'yes', -- 'yes' | 'no'
    
    -- 4. Professional Background & Credentials
    highest_qualification VARCHAR(128),
    experience VARCHAR(64),
    current_company VARCHAR(128),
    designation VARCHAR(128),
    
    -- 5. Compensation & Notice Period
    current_salary VARCHAR(64),
    expected_salary VARCHAR(64),
    notice_period VARCHAR(64),
    
    -- 6. Interview Rounds & Evaluation
    communication VARCHAR(32) DEFAULT 'Good', -- 'Excellent' | 'Good' | 'Average' | 'Poor'
    telephonic_interview VARCHAR(32) DEFAULT 'interview_scheduled', -- 'reject' | 'on_hold' | 'selected' | 'interview_scheduled'
    hr_round VARCHAR(32) DEFAULT 'pending', -- 'reject' | 'on_hold' | 'selected' | 'pending'
    managerial_round VARCHAR(32) DEFAULT 'pending', -- 'reject' | 'on_hold' | 'selected' | 'pending'
    remarks TEXT,
    
    -- Audit Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_recruitment_position ON public.recruitment_tracker (position_applied_for);
CREATE INDEX IF NOT EXISTS idx_recruitment_telephonic ON public.recruitment_tracker (telephonic_interview);
CREATE INDEX IF NOT EXISTS idx_recruitment_hr_round ON public.recruitment_tracker (hr_round);
CREATE INDEX IF NOT EXISTS idx_recruitment_managerial ON public.recruitment_tracker (managerial_round);

-- Enable Row Level Security (RLS)
ALTER TABLE public.recruitment_tracker ENABLE ROW LEVEL SECURITY;

-- Allow Super Admin and HR unrestricted clearance
CREATE POLICY "Allow HR and Super Admin full access" 
ON public.recruitment_tracker
FOR ALL
USING (
    auth.jwt() ->> 'role' = 'super_admin' OR 
    auth.jwt() ->> 'department' = 'HR' OR
    (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
);

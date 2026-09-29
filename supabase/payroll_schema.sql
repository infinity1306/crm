-- ======================================================================
-- STAR CHAIN LABS CRM - Payroll & Payslip Database Schema
-- Access strictly restricted to HR Operations and Super Admin
-- ======================================================================

CREATE TABLE IF NOT EXISTS public.payroll_records (
    id VARCHAR(64) PRIMARY KEY,
    employee_id VARCHAR(64) NOT NULL,
    employee_name VARCHAR(128) NOT NULL,
    designation VARCHAR(128) NOT NULL,
    department VARCHAR(128) NOT NULL,
    month VARCHAR(64) NOT NULL,
    month_code VARCHAR(16) NOT NULL, -- e.g. "2026-09"
    year INT NOT NULL DEFAULT 2026,
    
    -- Bank Information
    bank_name VARCHAR(128),
    account_number VARCHAR(64),
    ifsc_code VARCHAR(32),
    pan_number VARCHAR(32),
    uan_number VARCHAR(32),
    joining_date DATE,
    
    -- Attendance
    total_days INT DEFAULT 30,
    working_days INT DEFAULT 26,
    paid_days INT DEFAULT 30,
    lop_days INT DEFAULT 0,
    
    -- Earnings (Monthly INR)
    gross_salary NUMERIC(12, 2) NOT NULL,
    basic_salary NUMERIC(12, 2) NOT NULL,
    hra NUMERIC(12, 2) NOT NULL,
    special_allowance NUMERIC(12, 2) DEFAULT 0,
    performance_bonus NUMERIC(12, 2) DEFAULT 0,
    total_earnings NUMERIC(12, 2) NOT NULL,
    
    -- Deductions
    provident_fund NUMERIC(12, 2) DEFAULT 0,
    professional_tax NUMERIC(12, 2) DEFAULT 200,
    tds NUMERIC(12, 2) DEFAULT 0,
    other_deductions NUMERIC(12, 2) DEFAULT 0,
    total_deductions NUMERIC(12, 2) NOT NULL,
    
    -- Net Payable
    net_salary NUMERIC(12, 2) NOT NULL,
    
    -- Payment Settlement
    status VARCHAR(32) DEFAULT 'pending', -- 'paid' | 'pending' | 'processing'
    payment_date DATE,
    payment_mode VARCHAR(64) DEFAULT 'NEFT',
    transaction_ref VARCHAR(128),
    remarks TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index to prevent duplicate monthly entries for same employee
CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_emp_month ON public.payroll_records (employee_id, month_code);

-- Enable RLS
ALTER TABLE public.payroll_records ENABLE ROW LEVEL SECURITY;

-- Security Policy: Strictly HR Operations and Super Admin
CREATE POLICY "Strict HR and Super Admin payroll access"
ON public.payroll_records
FOR ALL
USING (
    auth.jwt() ->> 'role' = 'super_admin' OR
    auth.jwt() ->> 'department' = 'HR' OR
    (SELECT current_setting('request.jwt.claims', true)::jsonb ->> 'role') = 'service_role'
);

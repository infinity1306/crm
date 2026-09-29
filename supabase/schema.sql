-- ======================================================================
-- STAR CHAIN LABS CRM - Attendance Engine Production Schema
-- Compatible with Supabase PostgreSQL (PostgREST + RLS + Triggers)
-- ======================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. SHIFTS TABLE
CREATE TABLE IF NOT EXISTS public.shifts (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    work_minutes INT NOT NULL DEFAULT 480,
    grace_minutes INT NOT NULL DEFAULT 15,
    break_minutes INT NOT NULL DEFAULT 60,
    timezone VARCHAR(64) NOT NULL DEFAULT 'Asia/Kolkata',
    overnight BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. LOCATIONS TABLE (GEOFENCING & SITES)
CREATE TABLE IF NOT EXISTS public.locations (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    radius_meters INT NOT NULL DEFAULT 150,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HOLIDAY CALENDAR
CREATE TABLE IF NOT EXISTS public.holiday_calendar (
    id VARCHAR(64) PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    type VARCHAR(32) NOT NULL DEFAULT 'NATIONAL',
    is_optional BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ATTENDANCE EVENTS TABLE (IMMUTABLE EVENT SOURCING LEDGER)
CREATE TABLE IF NOT EXISTS public.attendance_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id VARCHAR(64) NOT NULL,
    event_type VARCHAR(32) NOT NULL,
    event_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    server_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    source VARCHAR(32) NOT NULL DEFAULT 'WEB',
    location_id VARCHAR(64) REFERENCES public.locations(id) ON DELETE SET NULL,
    device_id VARCHAR(64),
    ip_address VARCHAR(45) NOT NULL,
    work_mode VARCHAR(32) DEFAULT 'OFFICE',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ATTENDANCE SESSIONS TABLE (CALCULATED DAILY AGGREGATE LEDGER)
CREATE TABLE IF NOT EXISTS public.attendance_sessions (
    id VARCHAR(128) PRIMARY KEY,
    employee_id VARCHAR(64) NOT NULL,
    work_date DATE NOT NULL,
    shift_id VARCHAR(64) REFERENCES public.shifts(id) ON DELETE SET NULL,
    check_in_at TIMESTAMPTZ,
    check_out_at TIMESTAMPTZ,
    worked_minutes INT DEFAULT 0,
    break_minutes INT DEFAULT 0,
    overtime_minutes INT DEFAULT 0,
    late_minutes INT DEFAULT 0,
    status VARCHAR(32) NOT NULL DEFAULT 'NOT_STARTED',
    work_mode VARCHAR(32) DEFAULT 'OFFICE',
    current_project_id VARCHAR(64),
    current_project_name VARCHAR(128),
    current_task_id VARCHAR(64),
    current_task_title VARCHAR(256),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_employee_date UNIQUE (employee_id, work_date)
);

-- 7. ATTENDANCE BREAKS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_breaks (
    id VARCHAR(64) PRIMARY KEY,
    session_id VARCHAR(128) REFERENCES public.attendance_sessions(id) ON DELETE CASCADE,
    employee_id VARCHAR(64) NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ,
    duration_minutes INT DEFAULT 0,
    reason VARCHAR(128) DEFAULT 'Lunch Break',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ATTENDANCE CORRECTIONS (REQUEST & APPROVAL WORKFLOW)
CREATE TABLE IF NOT EXISTS public.attendance_corrections (
    id VARCHAR(64) PRIMARY KEY,
    employee_id VARCHAR(64) NOT NULL,
    employee_name VARCHAR(128) NOT NULL,
    work_date DATE NOT NULL,
    issue_type VARCHAR(64) NOT NULL,
    original_check_in VARCHAR(16),
    original_check_out VARCHAR(16),
    requested_check_in VARCHAR(16),
    requested_check_out VARCHAR(16),
    reason TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by VARCHAR(64),
    reviewed_by_name VARCHAR(128),
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ATTENDANCE EXCEPTIONS CENTER
CREATE TABLE IF NOT EXISTS public.attendance_exceptions (
    id VARCHAR(64) PRIMARY KEY,
    employee_id VARCHAR(64) NOT NULL,
    employee_name VARCHAR(128) NOT NULL,
    work_date DATE NOT NULL,
    exception_type VARCHAR(64) NOT NULL,
    severity VARCHAR(16) NOT NULL DEFAULT 'medium',
    details TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN',
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- 10. ATTENDANCE DEVICES (KIOSK, QR STATIONS, HARDWARE)
CREATE TABLE IF NOT EXISTS public.attendance_devices (
    id VARCHAR(64) PRIMARY KEY,
    device_name VARCHAR(128) NOT NULL,
    device_type VARCHAR(32) NOT NULL,
    location_id VARCHAR(64) REFERENCES public.locations(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. AUDIT LOGS (IMMUTABLE APPEND-ONLY)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(128) NOT NULL,
    user_role VARCHAR(64) NOT NULL,
    action VARCHAR(64) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(128) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    user_agent TEXT NOT NULL,
    status VARCHAR(16) NOT NULL DEFAULT 'SUCCESS',
    old_values JSONB,
    new_values JSONB,
    details TEXT
);

-- 12. INDEXES
CREATE INDEX IF NOT EXISTS idx_att_events_emp_time ON public.attendance_events(employee_id, event_time DESC);
CREATE INDEX IF NOT EXISTS idx_att_sessions_date ON public.attendance_sessions(work_date);
CREATE INDEX IF NOT EXISTS idx_att_sessions_emp ON public.attendance_sessions(employee_id, work_date);
CREATE INDEX IF NOT EXISTS idx_att_exceptions_status ON public.attendance_exceptions(status, work_date);
CREATE INDEX IF NOT EXISTS idx_att_corrections_status ON public.attendance_corrections(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- 13. ENABLE ROW LEVEL SECURITY (RLS)
ALTER TABLE public.attendance_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_corrections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "read_att_events" ON public.attendance_events;
    CREATE POLICY "read_att_events" ON public.attendance_events FOR SELECT USING (true);
    DROP POLICY IF EXISTS "insert_att_events" ON public.attendance_events;
    CREATE POLICY "insert_att_events" ON public.attendance_events FOR INSERT WITH CHECK (true);

    DROP POLICY IF EXISTS "read_att_sessions" ON public.attendance_sessions;
    CREATE POLICY "read_att_sessions" ON public.attendance_sessions FOR SELECT USING (true);
    DROP POLICY IF EXISTS "modify_att_sessions" ON public.attendance_sessions;
    CREATE POLICY "modify_att_sessions" ON public.attendance_sessions FOR ALL USING (true);

    DROP POLICY IF EXISTS "read_att_breaks" ON public.attendance_breaks;
    CREATE POLICY "read_att_breaks" ON public.attendance_breaks FOR SELECT USING (true);
    DROP POLICY IF EXISTS "modify_att_breaks" ON public.attendance_breaks;
    CREATE POLICY "modify_att_breaks" ON public.attendance_breaks FOR ALL USING (true);

    DROP POLICY IF EXISTS "read_att_corrections" ON public.attendance_corrections;
    CREATE POLICY "read_att_corrections" ON public.attendance_corrections FOR SELECT USING (true);
    DROP POLICY IF EXISTS "modify_att_corrections" ON public.attendance_corrections;
    CREATE POLICY "modify_att_corrections" ON public.attendance_corrections FOR ALL USING (true);

    DROP POLICY IF EXISTS "read_att_exceptions" ON public.attendance_exceptions;
    CREATE POLICY "read_att_exceptions" ON public.attendance_exceptions FOR SELECT USING (true);
    DROP POLICY IF EXISTS "modify_att_exceptions" ON public.attendance_exceptions;
    CREATE POLICY "modify_att_exceptions" ON public.attendance_exceptions FOR ALL USING (true);

    DROP POLICY IF EXISTS "read_audit_logs" ON public.audit_logs;
    CREATE POLICY "read_audit_logs" ON public.audit_logs FOR SELECT USING (true);
    DROP POLICY IF EXISTS "insert_audit_logs" ON public.audit_logs;
    CREATE POLICY "insert_audit_logs" ON public.audit_logs FOR INSERT WITH CHECK (true);
END $$;

-- 14. SEED SHIFTS
INSERT INTO public.shifts (id, name, start_time, end_time, work_minutes, grace_minutes, break_minutes, timezone, overnight)
VALUES 
    ('shift-morning', 'Morning Shift', '09:30:00', '18:30:00', 480, 15, 60, 'Asia/Kolkata', FALSE),
    ('shift-evening', 'Evening Shift', '14:00:00', '23:00:00', 480, 15, 60, 'Asia/Kolkata', FALSE),
    ('shift-night', 'Night Shift', '22:00:00', '06:00:00', 480, 15, 60, 'Asia/Kolkata', TRUE),
    ('shift-general', 'Flexible General Shift', '09:00:00', '18:00:00', 480, 30, 60, 'Asia/Kolkata', FALSE)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 15. SEED LOCATIONS
INSERT INTO public.locations (id, name, latitude, longitude, radius_meters, address)
VALUES 
    ('loc-hq', 'Star Chain Labs HQ (Main Office)', 12.9716, 77.5946, 150, 'Tower 4, Embassy Tech Village, Outer Ring Rd, Bangalore 560103'),
    ('loc-north', 'Star Chain Labs North Hub', 13.0358, 77.5970, 200, 'Manyata Embassy Business Park, Nagavara, Bangalore 560045'),
    ('loc-mumbai', 'Mumbai Regional Branch', 19.0760, 72.8777, 150, 'BKC Financial Center, Bandra East, Mumbai 400051')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 16. SEED HOLIDAY CALENDAR 2026
INSERT INTO public.holiday_calendar (id, date, name, type)
VALUES 
    ('hol-2026-01-26', '2026-01-26', 'Republic Day', 'NATIONAL'),
    ('hol-2026-08-15', '2026-08-15', 'Independence Day', 'NATIONAL'),
    ('hol-2026-10-02', '2026-10-02', 'Mahatma Gandhi Jayanti', 'NATIONAL'),
    ('hol-2026-11-08', '2026-11-08', 'Diwali (Deepavali)', 'FESTIVAL'),
    ('hol-2026-12-25', '2026-12-25', 'Christmas Day', 'NATIONAL')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

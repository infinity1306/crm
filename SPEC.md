# SPECIFICATION: STAR CHAIN LABS — PHASE 1 INTERNAL CRM FOUNDATION

## Status: FINALIZED

### 1. Vision & Visual Direction
- **Application Type**: Enterprise Operating System for STAR CHAIN LABS
- **Aesthetic**: Dark charcoal / near-black foundation, flat, static, muted turquoise accent, off-white primary text, soft gray secondary text, very subtle borders, minimal shadows, very dense, fast, operational.
- **Color Palette**:
  - Background Base: `#090D0F`
  - Elevated Surface: `#0E1317`
  - Interactive / Table Surface: `#141A20`
  - Subtle Borders: `#1C242B` / `#222D36`
  - Accent Muted Turquoise: `#0D9488` / `#14B8A6` (muted hover `#2DD4BF`, subtle bg `rgba(20, 184, 166, 0.08)`)
  - Status Indicators: Emerald `#10B981`, Amber `#F59E0B`, Coral `#EF4444`, Slate `#64748B`
  - Typography: Inter font, Off-white `#F1F5F9`, Soft gray `#94A3B8`, Dark muted `#64748B`

### 2. Post-Login Application Shell
- Reusable across all CRM modules
- Top Navigation:
  - Command Palette / Global Search (`Ctrl+K` / `Cmd+K`)
  - Quick Create Menu
  - Live Date (`Sun, 21 Sep 2026`)
  - Notifications Bell with unread counter
  - Organization Selector ("Star Chain Labs")
  - User Menu ("Tanmay Pandey - Admin") with Profile, Settings, Switch Role, Sign Out
- Sidebar:
  - Header with Star Chain Labs emblem & typography
  - Collapsible / Expandable mode
  - Groups:
    - Overview (Active Phase 1)
    - CRM: Leads, Contacts, Companies, Deals (Phase 2 Preview)
    - Sales: Pipeline, Activities, Meetings (Phase 2 Preview)
    - Projects: Projects, Tasks, Milestones (Phase 2 Preview)
    - People: Employees (Active Phase 1), Attendance (Phase 2 Preview)
    - Communication: Messages, Notifications (Active Phase 1)
    - Support: Tickets (Phase 2 Preview)
    - Finance: Invoices, Payments (Phase 2 Preview)
    - Analytics: Reports, Performance (Phase 2 Preview)
    - Settings: Organization, Roles & Permissions, Audit Log (Active Phase 1)
  - Footer: "Build Better Together. STAR CHAIN LABS"

### 3. Core Modules for Phase 1
1. **Overview Dashboard** (`/app/overview`):
   - Executive greeting & Star Chain Labs motto
   - 5 Foundation Metric Cards: Total Employees (127), Active Projects (23), Open Tickets (12), Revenue YTD (₹32.4L), Pending Approvals (6)
   - Operational Health widget (System status, active team breakdown)
   - Recent Activity timeline (chronological, filterable)
   - Quick Actions operational panel
2. **Team Directory** (`/app/team`):
   - Table: Employee, Department, Designation, Role, Status, Joined, Last Active, Actions
   - Search, Filter (Department, Role, Status), Sorting
   - Directory tabs: "Active Directory" vs "Pending Invitations"
   - Row actions: View Profile, Edit, Change Role, Suspend/Reactivate, Resend, Delete
   - CSV Export
3. **Employee Profile** (`/app/team/:employeeId`):
   - 360° Header with employee details, status badge, quick actions
   - Active Tabs: Overview, Activity, Notes, Documents
   - Inactive Tabs: Projects, Tasks, Attendance (with Phase 2 roadmap cards)
4. **Invite Employee Flow**:
   - Modal/Drawer with fields: Full Name, Work Email, Department, Designation, Role
   - Generates pending invite record with token link and email preview
   - Resend & Revoke management
5. **Roles & Permissions** (`/app/settings/roles`):
   - Roles: Super Admin, Admin, Manager, Employee, Client
   - Granular RBAC matrix: Module x Resource x Permission (View, Create, Update, Delete, Approve, Export, Manage)
   - Interactive toggle matrix with persistent state and reset capability
6. **Organization Settings** (`/app/settings/organization`):
   - Editable fields: Organization Name, Logo, Industry, Company Size, Website, Country, Currency, Timezone
7. **My Profile** (`/app/profile`):
   - Personal Info, Work Info, Preferences, Security, Active Sessions
8. **Notification Center** (`/app/notifications`):
   - Categories: All, Unread, Mentions, System
   - Read/unread toggle, mark all as read, clear all
9. **Activity & Audit Logging** (`/app/activity` & `/app/audit`):
   - Unified event logging across all actions with actor, IP, timestamp, entity, and payload details
10. **Design System Component Gallery** (`/app/design-system`):
    - Showcasing all 20+ UI components in all states

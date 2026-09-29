// ==============================================================================
// STAR CHAIN LABS CRM — Company Calendar & Corporate Events Service
// Manages Indian holidays, company offs, birthdays & work anniversaries with persistence
// ==============================================================================

import { CalendarEvent, CalendarCategory } from '../types/calendar';
import { supabaseAdmin } from '../lib/supabase';

const CALENDAR_STORAGE_KEY = 'scl_company_calendar_events_v2';
const DELETED_SYSTEM_EVENTS_KEY = 'scl_deleted_system_events';

// Default 2026 Gazetted & Indian Corporate Holidays (Official Company Offs)
export const DEFAULT_INDIAN_HOLIDAYS_2026: CalendarEvent[] = [
  {
    id: 'off-2026-01-01',
    title: "New Year's Day",
    date: '2026-01-01',
    category: 'company_off',
    isDayOff: true,
    description: 'Welcome to 2026! Full office holiday across all branches.',
    isRecurringAnnual: true
  },
  {
    id: 'off-2026-01-14',
    title: 'Makar Sankranti / Pongal',
    date: '2026-01-14',
    category: 'company_off',
    isDayOff: true,
    description: 'Harvest festival holiday.',
    isRecurringAnnual: true
  },
  {
    id: 'off-2026-01-26',
    title: 'Republic Day (National Holiday)',
    date: '2026-01-26',
    category: 'company_off',
    isDayOff: true,
    description: '77th Republic Day of India. Mandatory national company off.',
    isRecurringAnnual: true
  },
  {
    id: 'off-2026-03-03',
    title: 'Holi (Festival of Colors)',
    date: '2026-03-03',
    category: 'company_off',
    isDayOff: true,
    description: 'Celebration of colors and spring joy. Corporate holiday.',
    isRecurringAnnual: false
  },
  {
    id: 'off-2026-03-20',
    title: 'Eid-ul-Fitr',
    date: '2026-03-20',
    category: 'company_off',
    isDayOff: true,
    description: 'Islamic festival marking the end of Ramadan.',
    isRecurringAnnual: false
  },
  {
    id: 'off-2026-04-03',
    title: 'Good Friday',
    date: '2026-04-03',
    category: 'company_off',
    isDayOff: true,
    description: 'Christian remembrance holiday.',
    isRecurringAnnual: false
  },
  {
    id: 'off-2026-04-14',
    title: 'Dr. B.R. Ambedkar Jayanti',
    date: '2026-04-14',
    category: 'company_off',
    isDayOff: true,
    description: 'Honoring the architect of the Indian Constitution.',
    isRecurringAnnual: true
  },
  {
    id: 'off-2026-05-01',
    title: 'May Day / Labor Day',
    date: '2026-05-01',
    category: 'company_off',
    isDayOff: true,
    description: 'International Workers Day celebration of workforce contributions.',
    isRecurringAnnual: true
  },
  {
    id: 'off-2026-05-27',
    title: 'Bakrid / Eid al-Adha',
    date: '2026-05-27',
    category: 'company_off',
    isDayOff: true,
    description: 'Feast of the Sacrifice.',
    isRecurringAnnual: false
  },
  {
    id: 'off-2026-08-15',
    title: 'Independence Day (National Holiday)',
    date: '2026-08-15',
    category: 'company_off',
    isDayOff: true,
    description: '80th Indian Independence Day. Mandatory national corporate off.',
    isRecurringAnnual: true
  },
  {
    id: 'off-2026-08-27',
    title: 'Raksha Bandhan',
    date: '2026-08-27',
    category: 'company_off',
    isDayOff: true,
    description: 'Festival honoring the bond of sibling protection and love.',
    isRecurringAnnual: false
  },
  {
    id: 'off-2026-09-04',
    title: 'Janmashtami',
    date: '2026-09-04',
    category: 'company_off',
    isDayOff: true,
    description: 'Lord Krishna Jayanti celebration.',
    isRecurringAnnual: false
  },
  {
    id: 'off-2026-10-02',
    title: 'Mahatma Gandhi Jayanti (National Holiday)',
    date: '2026-10-02',
    category: 'company_off',
    isDayOff: true,
    description: 'Birth anniversary of Mahatma Gandhi. Mandatory national off.',
    isRecurringAnnual: true
  },
  {
    id: 'off-2026-10-20',
    title: 'Dussehra (Vijayadashami)',
    date: '2026-10-20',
    category: 'company_off',
    isDayOff: true,
    description: 'Triumph of righteousness over evil.',
    isRecurringAnnual: false
  },
  {
    id: 'off-2026-11-08',
    title: 'Diwali (Festival of Lights)',
    date: '2026-11-08',
    category: 'company_off',
    isDayOff: true,
    description: 'Diwali Deepavali festive holiday. Office shut.',
    isRecurringAnnual: false
  },
  {
    id: 'off-2026-11-09',
    title: 'Govardhan Puja / Vikram Samvat New Year',
    date: '2026-11-09',
    category: 'company_off',
    isDayOff: true,
    description: 'Post-Diwali auspicious day off.',
    isRecurringAnnual: false
  },
  {
    id: 'off-2026-11-24',
    title: 'Guru Nanak Jayanti',
    date: '2026-11-24',
    category: 'company_off',
    isDayOff: true,
    description: 'Prakash Utsav of Guru Nanak Dev Ji.',
    isRecurringAnnual: false
  },
  {
    id: 'off-2026-12-25',
    title: 'Christmas Day',
    date: '2026-12-25',
    category: 'company_off',
    isDayOff: true,
    description: 'Christmas celebration. Year-end holiday.',
    isRecurringAnnual: true
  }
];

// Pre-seeded Corporate Townhalls & Milestones
export const DEFAULT_CORPORATE_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-townhall-q3',
    title: 'Star Chain Labs Q3 All-Hands & Townhall',
    date: '2026-10-09',
    category: 'corporate_event',
    isDayOff: false,
    description: 'Company-wide quarterly sync: Product roadmap, Q4 targets & high-achiever awards. Shift: 10:00 - 19:00 with team lunch at 14:00.',
    isRecurringAnnual: false
  },
  {
    id: 'evt-founders-day',
    title: 'Star Chain Labs Annual Hackathon',
    date: '2026-11-20',
    category: 'corporate_event',
    isDayOff: false,
    description: '48-hour engineering innovation sprint and design showcase.',
    isRecurringAnnual: true
  }
];

/**
 * Returns user-created or edited events from LocalStorage
 */
export function getStoredCustomEvents(): CalendarEvent[] {
  try {
    const raw = localStorage.getItem(CALENDAR_STORAGE_KEY);
    if (!raw) {
      // First initialization: seed with defaults
      const initial = [...DEFAULT_INDIAN_HOLIDAYS_2026, ...DEFAULT_CORPORATE_EVENTS];
      localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading calendar events from storage', e);
    return [...DEFAULT_INDIAN_HOLIDAYS_2026, ...DEFAULT_CORPORATE_EVENTS];
  }
}

/**
 * Gets list of deleted system IDs
 */
function getDeletedSystemIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_SYSTEM_EVENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Synthesizes Birthdays and Work Anniversaries from employee profiles
 */
export function getEmployeeCelebrationEvents(employees: any[]): CalendarEvent[] {
  const deletedIds = getDeletedSystemIds();
  const events: CalendarEvent[] = [];
  const currentYear = new Date().getFullYear();

  employees.forEach((emp, index) => {
    // 1. Try reading saved 3-segment record
    let dob = '';
    let joiningDate = emp.joinedDate || '2024-03-01';

    try {
      const segRaw = localStorage.getItem(`scl_emp_segments_${emp.id}`);
      if (segRaw) {
        const seg = JSON.parse(segRaw);
        if (seg.personal?.dob) dob = seg.personal.dob;
        if (seg.personal?.joiningDate) joiningDate = seg.personal.joiningDate;
        else if (seg.job?.doj) joiningDate = seg.job.doj;
      }
    } catch (e) {
      // ignore
    }

    // Default mock DOBs distributed realistically if not filled yet
    if (!dob) {
      const mockMonths = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
      const mockDays = ['05', '12', '18', '22', '27'];
      const m = mockMonths[index % mockMonths.length];
      const d = mockDays[index % mockDays.length];
      dob = `1996-${m}-${d}`;
    }

    // A. Generate Birthday Event for current year and next year
    if (dob) {
      const parts = dob.split('-');
      if (parts.length === 3) {
        const mm = parts[1];
        const dd = parts[2];
        const birthdayId = `bday-${emp.id}-${mm}-${dd}`;

        if (!deletedIds.includes(birthdayId)) {
          events.push({
            id: birthdayId,
            title: `🎂 ${emp.name}'s Birthday`,
            date: `${currentYear}-${mm}-${dd}`,
            category: 'birthday',
            isDayOff: false,
            employeeId: emp.id,
            employeeName: emp.name,
            department: emp.department,
            description: `Wish ${emp.name} (${emp.designation || 'Team Member'}, ${emp.department || 'Star Chain Labs'}) a very Happy Birthday! 🎉`,
            isRecurringAnnual: true,
            isSystemGenerated: true
          });
        }
      }
    }

    // B. Generate Work Anniversary Event
    if (joiningDate) {
      const parts = joiningDate.split('-');
      if (parts.length === 3) {
        const startYear = parseInt(parts[0], 10);
        const mm = parts[1];
        const dd = parts[2];
        const yearsCompleted = currentYear - startYear;
        const annivId = `anniv-${emp.id}-${mm}-${dd}`;

        if (!deletedIds.includes(annivId)) {
          const ordinal = yearsCompleted <= 1 ? '1st' : yearsCompleted === 2 ? '2nd' : yearsCompleted === 3 ? '3rd' : `${yearsCompleted}th`;
          events.push({
            id: annivId,
            title: `🎖️ ${emp.name}'s ${ordinal} Work Anniversary`,
            date: `${currentYear}-${mm}-${dd}`,
            category: 'work_anniversary',
            isDayOff: false,
            employeeId: emp.id,
            employeeName: emp.name,
            department: emp.department,
            description: `Celebrating ${yearsCompleted > 0 ? yearsCompleted : 1} year(s) of dedicated contributions and milestones at Star Chain Labs! 🚀`,
            isRecurringAnnual: true,
            isSystemGenerated: true
          });
        }
      }
    }
  });

  return events;
}

/**
 * Returns complete aggregated calendar events (stored custom events + synthesized birthdays/anniversaries)
 */
export function getAllCalendarEvents(employees: any[]): CalendarEvent[] {
  const customEvents = getStoredCustomEvents();
  const celebrationEvents = getEmployeeCelebrationEvents(employees);

  // Combine and deduplicate by ID
  const map = new Map<string, CalendarEvent>();
  
  // Custom events take precedence (user edits override default system events)
  celebrationEvents.forEach(e => map.set(e.id, e));
  customEvents.forEach(e => map.set(e.id, e));

  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Saves a new calendar event or overwrites existing
 */
export function saveCalendarEvent(event: CalendarEvent): CalendarEvent {
  const customEvents = getStoredCustomEvents();
  const existingIdx = customEvents.findIndex(e => e.id === event.id);

  let updatedList: CalendarEvent[];
  if (existingIdx >= 0) {
    updatedList = [...customEvents];
    updatedList[existingIdx] = { ...event, updatedAt: new Date().toISOString() };
  } else {
    updatedList = [...customEvents, { ...event, createdAt: new Date().toISOString() }];
  }

  localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(updatedList));

  // Sync to Supabase audit log for corporate compliance
  try {
    supabaseAdmin.from('audit_logs').insert({
      user_name: 'Admin / HR Desk',
      user_role: 'admin',
      action: 'CALENDAR_EVENT_UPSERT',
      details: { id: event.id, title: event.title, date: event.date, category: event.category, isDayOff: event.isDayOff },
      timestamp: new Date().toISOString()
    });
  } catch (e) {
    // ignore
  }

  return event;
}

/**
 * Deletes a calendar event
 */
export function deleteCalendarEvent(id: string): boolean {
  const customEvents = getStoredCustomEvents();
  const filtered = customEvents.filter(e => e.id !== id);
  localStorage.setItem(CALENDAR_STORAGE_KEY, JSON.stringify(filtered));

  // If this was a synthesized event, record its deletion so it doesn't regenerate
  const deleted = getDeletedSystemIds();
  if (!deleted.includes(id)) {
    deleted.push(id);
    localStorage.setItem(DELETED_SYSTEM_EVENTS_KEY, JSON.stringify(deleted));
  }

  return true;
}

/**
 * Generates an aesthetically formatted WhatsApp Broadcast string
 */
export function generateWhatsAppDigest(
  events: CalendarEvent[],
  monthName: string,
  year: number
): string {
  const monthEvents = events.filter(e => {
    const d = new Date(e.date);
    return !isNaN(d.getTime());
  });

  const offs = monthEvents.filter(e => e.isDayOff);
  const birthdays = monthEvents.filter(e => e.category === 'birthday');
  const annivs = monthEvents.filter(e => e.category === 'work_anniversary');
  const corporate = monthEvents.filter(e => e.category === 'corporate_event');

  let text = `🗓️ *STAR CHAIN LABS — Corporate Calendar Update*\n`;
  text += `📅 *Month: ${monthName} ${year}*\n`;
  text += `⏰ *Office Timings:* 10:00 AM – 07:00 PM IST (Mon – Sat)\n`;
  text += `-------------------------------------------\n\n`;

  if (offs.length > 0) {
    text += `🏖️ *COMPANY OFFS & HOLIDAYS (Office Closed):*\n`;
    offs.forEach(o => {
      text += `• ${formatEventDate(o.date)}: *${o.title}*\n`;
    });
    text += `\n`;
  }

  if (birthdays.length > 0) {
    text += `🎂 *TEAM BIRTHDAYS:*\n`;
    birthdays.forEach(b => {
      text += `• ${formatEventDate(b.date)}: ${b.title}\n`;
    });
    text += `\n`;
  }

  if (annivs.length > 0) {
    text += `🎖️ *WORK ANNIVERSARIES:*\n`;
    annivs.forEach(a => {
      text += `• ${formatEventDate(a.date)}: ${a.title}\n`;
    });
    text += `\n`;
  }

  if (corporate.length > 0) {
    text += `🚀 *COMPANY EVENTS & MEETS:*\n`;
    corporate.forEach(c => {
      text += `• ${formatEventDate(c.date)}: *${c.title}*\n`;
    });
    text += `\n`;
  }

  text += `_Shared via Star Chain Labs CRM Internal Calendar_`;
  return text;
}

function formatEventDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    }
  } catch {}
  return dateStr;
}

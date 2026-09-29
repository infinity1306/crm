import React, { useState, useMemo } from 'react';
import { useCRM } from '../../context/CRMContext';
import { CalendarEvent, CalendarCategory, CalendarFilterCategory } from '../../types/calendar';
import { 
  getAllCalendarEvents, 
  saveCalendarEvent, 
  deleteCalendarEvent,
  generateWhatsAppDigest 
} from '../../services/calendarService';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Share2, 
  Clock, 
  Cake, 
  Award, 
  Palmtree, 
  Building2, 
  Check, 
  Trash2, 
  Edit3, 
  X, 
  ExternalLink,
  Copy,
  CalendarPlus,
  Sparkles,
  Info
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { cn } from '../../utils/cn';

const CATEGORY_CONFIG: Record<CalendarCategory, { label: string; icon: React.ElementType; color: string; badgeBg: string; text: string }> = {
  company_off: {
    label: 'Company Off / Holiday',
    icon: Palmtree,
    color: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    text: 'text-rose-400'
  },
  birthday: {
    label: 'Birthday',
    icon: Cake,
    color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    text: 'text-amber-400'
  },
  work_anniversary: {
    label: 'Work Anniversary',
    icon: Award,
    color: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    text: 'text-purple-400'
  },
  corporate_event: {
    label: 'Corporate Event / Meet',
    icon: Building2,
    color: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
    badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    text: 'text-blue-400'
  },
  optional_off: {
    label: 'Optional Holiday',
    icon: Palmtree,
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    text: 'text-emerald-400'
  }
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const CompanyCalendar: React.FC = () => {
  const { employees, addToast } = useCRM();

  // Active viewing date state (Defaults to September 2026 as per application timeline)
  const [currentDate, setCurrentDate] = useState(() => new Date(2026, 8, 29)); // 2026-09-29
  const [viewMode, setViewMode] = useState<'grid' | 'agenda'>('grid');
  const [filterCategory, setFilterCategory] = useState<CalendarFilterCategory>('all');

  // Trigger re-render upon update
  const [revision, setRevision] = useState(0);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState<{
    id?: string;
    title: string;
    date: string;
    category: CalendarCategory;
    isDayOff: boolean;
    employeeId: string;
    description: string;
  }>({
    title: '',
    date: '2026-09-29',
    category: 'company_off',
    isDayOff: true,
    employeeId: '',
    description: ''
  });

  // Load all events
  const allEvents = useMemo(() => {
    return getAllCalendarEvents(employees);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, revision]);

  // Filtered Events
  const filteredEvents = useMemo(() => {
    if (filterCategory === 'all') return allEvents;
    return allEvents.filter(e => e.category === filterCategory);
  }, [allEvents, filterCategory]);

  const activeYear = currentDate.getFullYear();
  const activeMonth = currentDate.getMonth();

  // Monthly stats
  const stats = useMemo(() => {
    const yearEvents = allEvents.filter(e => {
      const d = new Date(e.date);
      return d.getFullYear() === activeYear;
    });

    const monthEvents = yearEvents.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === activeMonth;
    });

    return {
      totalOffsYear: yearEvents.filter(e => e.isDayOff).length,
      offsThisMonth: monthEvents.filter(e => e.isDayOff).length,
      birthdaysThisMonth: monthEvents.filter(e => e.category === 'birthday').length,
      anniversariesThisMonth: monthEvents.filter(e => e.category === 'work_anniversary').length,
      eventsThisMonth: monthEvents.filter(e => e.category === 'corporate_event').length
    };
  }, [allEvents, activeYear, activeMonth]);

  // Month Grid Calculations
  const calendarGridDays = useMemo(() => {
    const firstDayIndex = new Date(activeYear, activeMonth, 1).getDay(); // 0 is Sunday
    const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(activeYear, activeMonth, 0).getDate();

    const days: {
      date: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      events: CalendarEvent[];
      isWeekend: boolean;
    }[] = [];

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dNum = daysInPrevMonth - i;
      const prevDateObj = new Date(activeYear, activeMonth - 1, dNum);
      const dateStr = prevDateObj.toISOString().split('T')[0];
      const dayEvts = filteredEvents.filter(e => e.date === dateStr);
      days.push({
        date: dateStr,
        dayNumber: dNum,
        isCurrentMonth: false,
        isToday: false,
        events: dayEvts,
        isWeekend: prevDateObj.getDay() === 0 || prevDateObj.getDay() === 6
      });
    }

    // Current month days
    const todayStr = '2026-09-29'; // Fixed simulation anchor
    for (let i = 1; i <= daysInMonth; i++) {
      const curDateObj = new Date(activeYear, activeMonth, i);
      const mm = String(activeMonth + 1).padStart(2, '0');
      const dd = String(i).padStart(2, '0');
      const dateStr = `${activeYear}-${mm}-${dd}`;
      const dayEvts = filteredEvents.filter(e => e.date === dateStr);

      days.push({
        date: dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        events: dayEvts,
        isWeekend: curDateObj.getDay() === 0 || curDateObj.getDay() === 6
      });
    }

    // Next month padding to fill 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextDateObj = new Date(activeYear, activeMonth + 1, i);
      const dateStr = nextDateObj.toISOString().split('T')[0];
      const dayEvts = filteredEvents.filter(e => e.date === dateStr);
      days.push({
        date: dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
        events: dayEvts,
        isWeekend: nextDateObj.getDay() === 0 || nextDateObj.getDay() === 6
      });
    }

    return days;
  }, [activeYear, activeMonth, filteredEvents]);

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(activeYear, activeMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(activeYear, activeMonth + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date(2026, 8, 29));
  };

  // Open Add modal with specified date
  const openAddModal = (dateStr?: string) => {
    const defaultDate = dateStr || `${activeYear}-${String(activeMonth + 1).padStart(2, '0')}-01`;
    setFormData({
      title: '',
      date: defaultDate,
      category: 'company_off',
      isDayOff: true,
      employeeId: '',
      description: ''
    });
    setIsAddModalOpen(true);
  };

  // Open Edit modal
  const openEditModal = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setFormData({
      id: event.id,
      title: event.title.replace(/^🎂\s*|^🎖️\s*|^🏖️\s*|^🚀\s*/, ''),
      date: event.date,
      category: event.category,
      isDayOff: event.isDayOff,
      employeeId: event.employeeId || '',
      description: event.description || ''
    });
    setIsEditModalOpen(true);
  };

  // Save Event
  const handleSaveEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date) {
      addToast({ title: 'Validation Error', message: 'Please enter both title and date for the calendar entry', type: 'error' });
      return;
    }

    const linkedEmp = employees.find(emp => emp.id === formData.employeeId);
    let title = formData.title.trim();

    // Auto prefix clean emoji if user hasn't typed one
    if (formData.category === 'birthday' && !title.startsWith('🎂')) {
      title = `🎂 ${title}`;
    } else if (formData.category === 'work_anniversary' && !title.startsWith('🎖️')) {
      title = `🎖️ ${title}`;
    }

    const newEvent: CalendarEvent = {
      id: formData.id || `custom-evt-${Date.now()}`,
      title,
      date: formData.date,
      category: formData.category,
      isDayOff: formData.isDayOff,
      employeeId: linkedEmp?.id,
      employeeName: linkedEmp?.name,
      department: linkedEmp?.department,
      description: formData.description.trim(),
      isRecurringAnnual: formData.category === 'birthday' || formData.category === 'work_anniversary'
    };

    saveCalendarEvent(newEvent);
    setRevision(r => r + 1);
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    addToast({
      title: 'Calendar Saved',
      message: formData.id ? 'Calendar event updated successfully!' : 'New calendar event added successfully!',
      type: 'success'
    });
  };

  // Delete Event
  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    deleteCalendarEvent(selectedEvent.id);
    setRevision(r => r + 1);
    setIsEditModalOpen(false);
    addToast({ title: 'Event Removed', message: 'Calendar event removed', type: 'info' });
  };

  // Google Calendar URL
  const getGoogleCalendarUrl = (event: CalendarEvent) => {
    const dateFormatted = event.date.replace(/-/g, '');
    const startStr = `${dateFormatted}T043000Z`; // 10:00 AM IST
    const endStr = `${dateFormatted}T133000Z`;   // 19:00 PM IST
    const details = `${event.description || event.title}\n\nStar Chain Labs Corporate Calendar\nShift Timings: 10:00 AM - 07:00 PM IST`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(details)}&location=${encodeURIComponent('Star Chain Labs Head Office')}`;
  };

  // WhatsApp digest content
  const whatsAppText = useMemo(() => {
    return generateWhatsAppDigest(allEvents, MONTH_NAMES[activeMonth], activeYear);
  }, [allEvents, activeMonth, activeYear]);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Header & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-crm-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-turquoise/10 border border-turquoise/20 text-turquoise">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-crm-text tracking-tight flex items-center gap-2">
                Company Calendar & Corporate Offs
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-turquoise/15 text-turquoise border border-turquoise/30 font-medium">
                  Editable Calendar
                </span>
              </h1>
              <p className="text-xs text-crm-textMuted mt-0.5">
                Official holiday roster, company offs, team birthdays, and work anniversaries
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          {/* WhatsApp Share Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWhatsAppModalOpen(true)}
            leftIcon={<Share2 className="w-3.5 h-3.5 text-emerald-400" />}
            className="hover:border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-400"
          >
            WhatsApp Broadcast
          </Button>

          {/* Add Event Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => openAddModal()}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Event / Off
          </Button>
        </div>
      </div>

      {/* 2. Office Timings Notice & Shift Announcement Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-crm-card via-crm-surface to-crm-card border border-turquoise/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-turquoise/15 border border-turquoise/30 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-turquoise" />
          </div>
          <div>
            <div className="text-xs font-semibold text-crm-text flex items-center gap-2">
              <span>Standard Office Shift: 10:00 AM – 07:00 PM IST</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-mono">
                9 Hours Total
              </span>
            </div>
            <p className="text-[11px] text-crm-textMuted mt-0.5">
              Working days: Monday to Saturday. Lunch break: 40 mins (1:30 PM - 2:10 PM). 15-minute grace period allowed on clock-in.
            </p>
          </div>
        </div>
        <div className="text-xs text-right shrink-0">
          <span className="text-[11px] text-crm-textMuted">Holiday Rule:</span>
          <span className="ml-1 text-[11px] font-semibold text-rose-300">Days tagged with "Company Off" excuse shift punches.</span>
        </div>
      </div>

      {/* 3. Monthly Statistics Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border/60 hover:border-crm-border transition-colors">
          <div className="flex items-center justify-between text-rose-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-crm-textMuted">Company Offs</span>
            <Palmtree className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-crm-text">
            {stats.offsThisMonth}
            <span className="text-xs font-normal text-crm-textMuted ml-1.5 font-sans">
              this month ({stats.totalOffsYear} in {activeYear})
            </span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border/60 hover:border-crm-border transition-colors">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-crm-textMuted">Birthdays</span>
            <Cake className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-crm-text">
            {stats.birthdaysThisMonth}
            <span className="text-xs font-normal text-crm-textMuted ml-1.5 font-sans">team celebrations</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border/60 hover:border-crm-border transition-colors">
          <div className="flex items-center justify-between text-purple-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-crm-textMuted">Work Anniversaries</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-crm-text">
            {stats.anniversariesThisMonth}
            <span className="text-xs font-normal text-crm-textMuted ml-1.5 font-sans">milestones</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-crm-card border border-crm-border/60 hover:border-crm-border transition-colors">
          <div className="flex items-center justify-between text-blue-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-crm-textMuted">Corporate Events</span>
            <Building2 className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-crm-text">
            {stats.eventsThisMonth}
            <span className="text-xs font-normal text-crm-textMuted ml-1.5 font-sans">planned meets</span>
          </div>
        </div>
      </div>

      {/* 4. Calendar Controls & Category Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-crm-card/60 p-3 rounded-xl border border-crm-border/60">
        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePrevMonth}
            aria-label="Previous Month"
            className="p-1.5 h-8 w-8 text-crm-textMuted hover:text-crm-text"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="text-base font-bold text-crm-text min-w-[160px] text-center">
            {MONTH_NAMES[activeMonth]} {activeYear}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleNextMonth}
            aria-label="Next Month"
            className="p-1.5 h-8 w-8 text-crm-textMuted hover:text-crm-text"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="text-xs ml-2 h-7 px-2.5 text-turquoise border-turquoise/30 hover:bg-turquoise/10"
          >
            Today (Sep 29)
          </Button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center flex-wrap gap-1.5">
          <button
            onClick={() => setFilterCategory('all')}
            className={cn(
              "px-2.5 py-1 text-xs rounded-full transition-colors font-medium",
              filterCategory === 'all'
                ? "bg-turquoise text-crm-bg font-semibold"
                : "bg-crm-surface text-crm-textMuted hover:text-crm-text border border-crm-border/60"
            )}
          >
            All
          </button>
          <button
            onClick={() => setFilterCategory('company_off')}
            className={cn(
              "px-2.5 py-1 text-xs rounded-full transition-colors flex items-center gap-1 font-medium",
              filterCategory === 'company_off'
                ? "bg-rose-500 text-white font-semibold"
                : "bg-crm-surface text-crm-textMuted hover:text-rose-400 border border-crm-border/60"
            )}
          >
            <Palmtree className="w-3 h-3 text-rose-400" />
            <span>Company Offs</span>
          </button>
          <button
            onClick={() => setFilterCategory('birthday')}
            className={cn(
              "px-2.5 py-1 text-xs rounded-full transition-colors flex items-center gap-1 font-medium",
              filterCategory === 'birthday'
                ? "bg-amber-500 text-crm-bg font-semibold"
                : "bg-crm-surface text-crm-textMuted hover:text-amber-400 border border-crm-border/60"
            )}
          >
            <Cake className="w-3 h-3 text-amber-400" />
            <span>Birthdays</span>
          </button>
          <button
            onClick={() => setFilterCategory('work_anniversary')}
            className={cn(
              "px-2.5 py-1 text-xs rounded-full transition-colors flex items-center gap-1 font-medium",
              filterCategory === 'work_anniversary'
                ? "bg-purple-500 text-white font-semibold"
                : "bg-crm-surface text-crm-textMuted hover:text-purple-400 border border-crm-border/60"
            )}
          >
            <Award className="w-3 h-3 text-purple-400" />
            <span>Anniversaries</span>
          </button>
          <button
            onClick={() => setFilterCategory('corporate_event')}
            className={cn(
              "px-2.5 py-1 text-xs rounded-full transition-colors flex items-center gap-1 font-medium",
              filterCategory === 'corporate_event'
                ? "bg-blue-500 text-white font-semibold"
                : "bg-crm-surface text-crm-textMuted hover:text-blue-400 border border-crm-border/60"
            )}
          >
            <Building2 className="w-3 h-3 text-blue-400" />
            <span>Events</span>
          </button>

          {/* View toggle */}
          <div className="ml-2 flex items-center border border-crm-border rounded-lg p-0.5 bg-crm-surface">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                "px-2 py-0.5 text-xs rounded font-medium transition-colors",
                viewMode === 'grid' ? "bg-crm-card text-turquoise font-semibold shadow-xs" : "text-crm-textMuted hover:text-crm-text"
              )}
            >
              Month Grid
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={cn(
                "px-2 py-0.5 text-xs rounded font-medium transition-colors",
                viewMode === 'agenda' ? "bg-crm-card text-turquoise font-semibold shadow-xs" : "text-crm-textMuted hover:text-crm-text"
              )}
            >
              Agenda List
            </button>
          </div>
        </div>
      </div>

      {/* 5. Main Calendar Views */}
      {viewMode === 'grid' ? (
        /* ================= MONTH GRID VIEW ================= */
        <div className="bg-crm-card border border-crm-border rounded-xl overflow-hidden shadow-sm">
          {/* Day of week headers */}
          <div className="grid grid-cols-7 border-b border-crm-border bg-crm-surface/60 text-center text-xs font-semibold text-crm-textMuted py-2.5">
            <div className="text-rose-400/80">Sun</div>
            <div>Mon</div>
            <div>Tue</div>
            <div>Wed</div>
            <div>Thu</div>
            <div>Fri</div>
            <div className="text-amber-400/80">Sat</div>
          </div>

          {/* Calendar grid cells */}
          <div className="grid grid-cols-7 divide-x divide-y divide-crm-border/50">
            {calendarGridDays.map((cell, idx) => {
              const hasHoliday = cell.events.some(e => e.isDayOff);

              return (
                <div
                  key={`${cell.date}-${idx}`}
                  onClick={() => openAddModal(cell.date)}
                  className={cn(
                    "min-h-[110px] sm:min-h-[125px] p-1.5 sm:p-2 transition-all group relative flex flex-col justify-between cursor-pointer select-none",
                    !cell.isCurrentMonth && "bg-crm-surface/20 opacity-40 hover:opacity-75",
                    cell.isCurrentMonth && "bg-crm-card hover:bg-crm-surface/50",
                    cell.isWeekend && cell.isCurrentMonth && "bg-crm-surface/15",
                    cell.isToday && "ring-2 ring-turquoise ring-inset bg-turquoise/5",
                    hasHoliday && cell.isCurrentMonth && "bg-rose-500/[0.03]"
                  )}
                >
                  {/* Top Bar of Cell */}
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={cn(
                        "text-xs font-mono font-semibold rounded-full w-6 h-6 flex items-center justify-center transition-colors",
                        cell.isToday
                          ? "bg-turquoise text-crm-bg font-bold shadow-sm"
                          : hasHoliday
                          ? "text-rose-400 font-bold"
                          : cell.isWeekend
                          ? "text-crm-textMuted"
                          : "text-crm-text"
                      )}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Quick Add indicator on hover */}
                    <div className="flex items-center gap-1">
                      {hasHoliday && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold uppercase">
                          OFF
                        </span>
                      )}
                      <span className="opacity-0 group-hover:opacity-100 text-turquoise text-[10px] p-0.5 rounded hover:bg-turquoise/20 transition-opacity">
                        <Plus className="w-3 h-3" />
                      </span>
                    </div>
                  </div>

                  {/* Event Chips inside the day */}
                  <div className="space-y-1 overflow-y-auto max-h-[85px] no-scrollbar">
                    {cell.events.map(event => {
                      const cfg = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.company_off;
                      const IconComp = cfg.icon;

                      return (
                        <div
                          key={event.id}
                          onClick={(e) => openEditModal(event, e)}
                          title={`${event.title} — ${event.description || 'Click to edit'}`}
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[11px] border font-medium truncate flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.02]",
                            cfg.color
                          )}
                        >
                          <IconComp className="w-3 h-3 shrink-0" />
                          <span className="truncate">{event.title}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Empty state visual placeholder */}
                  {cell.events.length === 0 && (
                    <div className="h-4" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* ================= AGENDA / LIST VIEW ================= */
        <div className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="p-12 text-center bg-crm-card border border-crm-border rounded-xl">
              <CalendarIcon className="w-10 h-10 text-crm-textMuted mx-auto mb-2 opacity-50" />
              <h3 className="text-sm font-semibold text-crm-text">No events found</h3>
              <p className="text-xs text-crm-textMuted mt-1">
                There are no scheduled offs or events matching your filter.
              </p>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => openAddModal()}
              >
                Add First Event
              </Button>
            </div>
          ) : (
            filteredEvents.map(event => {
              const cfg = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.company_off;
              const IconComp = cfg.icon;
              const dateObj = new Date(event.date);
              const dayStr = dateObj.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
              const isToday = event.date === '2026-09-29';

              return (
                <div
                  key={event.id}
                  className={cn(
                    "p-4 rounded-xl bg-crm-card border border-crm-border hover:border-turquoise/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs",
                    isToday && "ring-1 ring-turquoise bg-turquoise/[0.03]"
                  )}
                >
                  <div className="flex items-start gap-3.5">
                    {/* Date Badge */}
                    <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-crm-surface border border-crm-border/70 shrink-0 text-center">
                      <span className="text-[10px] font-semibold uppercase text-turquoise">
                        {dateObj.toLocaleDateString('en-IN', { month: 'short' })}
                      </span>
                      <span className="text-base font-bold font-mono text-crm-text">
                        {dateObj.getDate()}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full border font-semibold flex items-center gap-1", cfg.badgeBg)}>
                          <IconComp className="w-3 h-3" />
                          {cfg.label}
                        </span>

                        {event.isDayOff && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                            🏖️ Company Off (Office Closed)
                          </span>
                        )}

                        {isToday && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-turquoise/20 text-turquoise border border-turquoise/40 font-bold animate-pulse">
                            TODAY 🎉
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-crm-text flex items-center gap-2">
                        {event.title}
                      </h3>

                      {event.description && (
                        <p className="text-xs text-crm-textMuted mt-0.5 max-w-xl">
                          {event.description}
                        </p>
                      )}

                      <div className="text-[11px] text-crm-textMuted mt-1.5 flex items-center gap-3">
                        <span>📅 {dayStr}</span>
                        {event.employeeName && (
                          <span className="flex items-center gap-1 text-turquoise">
                            <Avatar name={event.employeeName} size="xs" />
                            {event.employeeName} ({event.department || 'Star Chain Labs'})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 self-end sm:self-center">
                    {/* Add to Google Calendar */}
                    <a
                      href={getGoogleCalendarUrl(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-crm-textMuted hover:text-turquoise hover:bg-crm-surface transition-colors"
                      title="Add to Google Calendar"
                    >
                      <CalendarPlus className="w-4 h-4" />
                    </a>

                    {/* Edit */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => openEditModal(event, e)}
                      leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                      className="text-xs text-crm-textMuted hover:text-crm-text"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* ================= MODAL: ADD EVENT ================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-crm-bg/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-crm-card border border-crm-border rounded-xl shadow-modal max-w-lg w-full p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-crm-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-turquoise/15 text-turquoise">
                  <CalendarPlus className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-crm-text">Add to Company Calendar</h2>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-crm-textMuted hover:text-crm-text p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3.5 text-xs">
              {/* Event Title */}
              <div>
                <label className="block font-semibold text-crm-text mb-1">
                  Event Title / Occasion <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diwali Holiday, Rahul's Birthday, Team Hackathon"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-crm-surface border border-crm-border text-crm-text placeholder-crm-textMuted focus:outline-none focus:border-turquoise text-xs"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-crm-text mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const cat = e.target.value as CalendarCategory;
                    setFormData({
                      ...formData,
                      category: cat,
                      isDayOff: cat === 'company_off' || cat === 'optional_off'
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-crm-surface border border-crm-border text-crm-text focus:outline-none focus:border-turquoise text-xs"
                >
                  <option value="company_off">🏖️ Company Off / Official Holiday</option>
                  <option value="birthday">🎂 Birthday</option>
                  <option value="work_anniversary">🎖️ Work Anniversary</option>
                  <option value="corporate_event">👥 Corporate Event / Townhall</option>
                  <option value="optional_off">🌴 Optional / Restricted Holiday</option>
                </select>
              </div>

              {/* Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-crm-text mb-1">
                    Event Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-crm-surface border border-crm-border text-crm-text focus:outline-none focus:border-turquoise text-xs font-mono"
                  />
                </div>

                {/* Associated Employee */}
                <div>
                  <label className="block font-semibold text-crm-text mb-1">
                    Team Member (Optional)
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => {
                      const empId = e.target.value;
                      const emp = employees.find(x => x.id === empId);
                      setFormData({
                        ...formData,
                        employeeId: empId,
                        title: emp && !formData.title ? (formData.category === 'birthday' ? `${emp.name}'s Birthday` : `${emp.name}'s Work Anniversary`) : formData.title
                      });
                    }}
                    className="w-full px-3 py-2 rounded-lg bg-crm-surface border border-crm-border text-crm-text focus:outline-none focus:border-turquoise text-xs"
                  >
                    <option value="">-- No specific employee --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Is Company Off / Day Off Toggle */}
              <div className="p-3 rounded-lg bg-crm-surface/70 border border-crm-border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-crm-text">Mark as Official Company Off?</div>
                  <div className="text-[11px] text-crm-textMuted">
                    Office will remain closed. Standard 10:00 - 19:00 punch clock excused.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isDayOff}
                  onChange={(e) => setFormData({ ...formData, isDayOff: e.target.checked })}
                  className="w-4 h-4 rounded border-crm-border text-turquoise focus:ring-turquoise accent-turquoise cursor-pointer"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-crm-text mb-1">
                  Description / Branch Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional details, greetings, or schedule guidelines..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-crm-surface border border-crm-border text-crm-text placeholder-crm-textMuted focus:outline-none focus:border-turquoise text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-crm-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  leftIcon={<Check className="w-3.5 h-3.5" />}
                >
                  Save to Calendar
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT / DELETE EVENT ================= */}
      {isEditModalOpen && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-crm-bg/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-crm-card border border-crm-border rounded-xl shadow-modal max-w-lg w-full p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-crm-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-turquoise/15 text-turquoise">
                  <Edit3 className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-crm-text">Edit Calendar Entry</h2>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-crm-textMuted hover:text-crm-text p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEvent} className="space-y-3.5 text-xs">
              {/* Event Title */}
              <div>
                <label className="block font-semibold text-crm-text mb-1">
                  Event Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-crm-surface border border-crm-border text-crm-text focus:outline-none focus:border-turquoise text-xs"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-crm-text mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => {
                    const cat = e.target.value as CalendarCategory;
                    setFormData({
                      ...formData,
                      category: cat,
                      isDayOff: cat === 'company_off' || cat === 'optional_off'
                    });
                  }}
                  className="w-full px-3 py-2 rounded-lg bg-crm-surface border border-crm-border text-crm-text focus:outline-none focus:border-turquoise text-xs"
                >
                  <option value="company_off">🏖️ Company Off / Official Holiday</option>
                  <option value="birthday">🎂 Birthday</option>
                  <option value="work_anniversary">🎖️ Work Anniversary</option>
                  <option value="corporate_event">👥 Corporate Event / Townhall</option>
                  <option value="optional_off">🌴 Optional / Restricted Holiday</option>
                </select>
              </div>

              {/* Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-crm-text mb-1">
                    Event Date <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-crm-surface border border-crm-border text-crm-text focus:outline-none focus:border-turquoise text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-crm-text mb-1">
                    Team Member
                  </label>
                  <select
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-crm-surface border border-crm-border text-crm-text focus:outline-none focus:border-turquoise text-xs"
                  >
                    <option value="">-- No specific employee --</option>
                    {employees.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.designation})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Is Company Off / Day Off Toggle */}
              <div className="p-3 rounded-lg bg-crm-surface/70 border border-crm-border flex items-center justify-between">
                <div>
                  <div className="font-semibold text-crm-text">Official Company Off</div>
                  <div className="text-[11px] text-crm-textMuted">
                    Office closed, punch clock requirement excused
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.isDayOff}
                  onChange={(e) => setFormData({ ...formData, isDayOff: e.target.checked })}
                  className="w-4 h-4 rounded border-crm-border text-turquoise focus:ring-turquoise accent-turquoise cursor-pointer"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-crm-text mb-1">Description / Notes</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-crm-surface border border-crm-border text-crm-text focus:outline-none focus:border-turquoise text-xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-crm-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDeleteEvent}
                  leftIcon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                  className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10"
                >
                  Delete Event
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    leftIcon={<Check className="w-3.5 h-3.5" />}
                  >
                    Update Event
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: WHATSAPP BROADCAST ================= */}
      {isWhatsAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-crm-bg/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-crm-card border border-crm-border rounded-xl shadow-modal max-w-lg w-full p-5 space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-crm-border pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-crm-text">WhatsApp Team Broadcast</h2>
                  <p className="text-[11px] text-crm-textMuted">Share this month's offs and celebrations to team channels</p>
                </div>
              </div>
              <button
                onClick={() => setIsWhatsAppModalOpen(false)}
                className="text-crm-textMuted hover:text-crm-text p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Formatted Text Preview */}
            <div className="p-3.5 rounded-lg bg-crm-surface border border-crm-border font-mono text-[11px] text-crm-text whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed">
              {whatsAppText}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-crm-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(whatsAppText);
                  addToast({ title: 'Copied', message: 'Broadcast message copied to clipboard!', type: 'success' });
                }}
                leftIcon={<Copy className="w-3.5 h-3.5 text-turquoise" />}
              >
                Copy Text
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsWhatsAppModalOpen(false)}
                >
                  Close
                </Button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(whatsAppText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium text-xs transition-colors shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Open in WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

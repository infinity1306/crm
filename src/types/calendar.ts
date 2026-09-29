// ==============================================================================
// STAR CHAIN LABS CRM — Company Calendar & Corporate Events Types
// ==============================================================================

export type CalendarCategory = 
  | 'company_off'        // Official holiday / Office closed
  | 'birthday'           // Employee birthday
  | 'work_anniversary'   // Work anniversary
  | 'corporate_event'    // All-Hands, Townhall, Team Lunch, Meet
  | 'optional_off';      // Restricted / Optional holiday

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;               // YYYY-MM-DD
  endDate?: string;          // YYYY-MM-DD for multi-day events
  category: CalendarCategory;
  isDayOff: boolean;          // Office closed / Shift excused
  employeeId?: string;       // Linked employee if birthday or anniversary
  employeeName?: string;     // Display name
  department?: string;
  description?: string;
  isRecurringAnnual?: boolean; // Repeats yearly
  isSystemGenerated?: boolean;// Synthesized from Employee 3-Segments / DOJ / DOB
  createdAt?: string;
  updatedAt?: string;
}

export type CalendarFilterCategory = 'all' | CalendarCategory;

export interface CalendarMonthStats {
  totalOffsThisYear: number;
  offsThisMonth: number;
  birthdaysThisMonth: number;
  anniversariesThisMonth: number;
  eventsThisMonth: number;
}

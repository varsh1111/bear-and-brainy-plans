import { describe, expect, it } from 'vitest';
import { calendarDaysUntil, goalPercent, hours, inPeriod, streaks, studyDays, validStudySession, weekSummary, type StudySession } from '@/lib/study';
const session = (date: string, minutes: number, subjectId = 'math'): StudySession => ({ id: `${date}-${minutes}-${subjectId}`, subjectId, date, minutes, notes: '' });
describe('Shared study calculations', () => {
  const sessions = [session('2026-10-18', 60), session('2026-10-19', 60), session('2026-10-19', 30, 'bio'), session('2026-10-20', 120), session('2026-10-23', 90)];
  it('totals hours per subject from all sessions', () => { expect(hours(sessions.filter(s => s.subjectId === 'math'))).toBe(5.5); });
  it('totals daily hours from sessions across subjects', () => { expect(hours(sessions.filter(s => s.date === '2026-10-19'))).toBe(1.5); });
  it('counts unique study days, not sessions', () => { expect(studyDays(sessions)).toBe(4); });
  it('compares Monday-start current and previous weeks', () => { const week = weekSummary(sessions, '2026-10-23'); expect(week.hours).toBe(5); expect(week.previousHours).toBe(1); expect(week.days).toBe(3); expect(week.previousDays).toBe(1); });
  it('includes both ends of the month range', () => { expect(hours(inPeriod([...sessions, session('2026-09-30', 600), session('2026-11-01', 600)], '2026-10-01', '2026-10-31'))).toBe(6); });
  it('allows a current streak ending yesterday without shaming an unfinished day', () => { expect(streaks(sessions, '2026-10-21')).toEqual({ current: 3, longest: 3 }); });
  it('breaks the current streak after a missed whole day and retains the longest', () => { expect(streaks(sessions, '2026-10-22')).toEqual({ current: 0, longest: 3 }); });
  it('ignores duplicate sessions and future days in streaks', () => { expect(streaks(sessions, '2026-10-19')).toEqual({ current: 2, longest: 2 }); });
  it('updates totals when a session is edited or deleted', () => { const edited = sessions.map((s,i) => i === 0 ? { ...s, minutes: 120 } : s); expect(hours(edited)).toBe(7); expect(hours(edited.slice(1))).toBe(5); });
  it('caps goal progress at a completed goal', () => { expect(goalPercent(5, 2)).toBe(100); expect(goalPercent(1, 2)).toBe(50); });
  it('counts exam days by local calendar boundaries', () => { expect(calendarDaysUntil('2026-10-25', '2026-10-23')).toBe(2); });
  it('requires a real nonfuture date and a positive duration no longer than a day', () => { expect(validStudySession(session('2026-10-23', 120), '2026-10-23')).toBe(true); expect(validStudySession(session('2026-10-24', 120), '2026-10-23')).toBe(false); expect(validStudySession(session('', 120), '2026-10-23')).toBe(false); expect(validStudySession(session('2026-10-23', 0), '2026-10-23')).toBe(false); expect(validStudySession(session('2026-10-23', 1441), '2026-10-23')).toBe(false); });
});
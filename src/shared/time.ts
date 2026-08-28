import { Duration, TimeInterval } from './models.js';

export function parseIso8601Duration(duration: string): Duration {
  const match = duration.match(
    /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/,
  );
  if (!match) return null;
  return {
    years: Number(match[1] ?? 0),
    months: Number(match[2] ?? 0),
    days: Number(match[3] ?? 0),
    hours: Number(match[4] ?? 0),
    minutes: Number(match[5] ?? 0),
    seconds: Number(match[6] ?? 0),
  };
}

/**
 * Advance a date by an ISO 8601 duration using calendar arithmetic.
 */
export function advanceByDuration(date: Date, d: Duration): Date {
  const next = new Date(date.getTime());
  next.setUTCFullYear(next.getUTCFullYear() + d.years);
  next.setUTCMonth(next.getUTCMonth() + d.months);
  next.setUTCDate(next.getUTCDate() + d.days);
  next.setUTCHours(next.getUTCHours() + d.hours);
  next.setUTCMinutes(next.getUTCMinutes() + d.minutes);
  next.setUTCMilliseconds(next.getUTCMilliseconds() + d.seconds * 1000);
  return next;
}

/**
 * Expand a time interval into discrete Date objects; it is advised to specify
 * a maximum of objects to instantiate to avoid performance issues
 */
export function expandTimeInterval(
  interval: TimeInterval,
  maxDatesCount: number = 3650,
): Date[] {
  const dates: Date[] = [];
  const endMs = interval.end.getTime();
  let current = interval.begin;
  while (current.getTime() <= endMs && dates.length < maxDatesCount) {
    dates.push(current);
    const next = advanceByDuration(current, interval.period);
    if (next.getTime() <= current.getTime()) break; // zero-length step guard
    current = next;
  }
  return dates;
}

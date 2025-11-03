import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { startOfDay, endOfDay } from 'date-fns';

export function getDateRangeInTimezone(
    dateStr: string | undefined,
    timezone: string
): { start: Date; end: Date } {
    if (!dateStr) {
        //* Current day in user's timezone
        const now = new Date();
        const zonedNow = toZonedTime(now, timezone);

        const localStart = startOfDay(zonedNow);
        const localEnd = endOfDay(zonedNow);

        //* Convert back to UTC for database
        const utcStart = fromZonedTime(localStart, timezone);
        const utcEnd = fromZonedTime(localEnd, timezone);

        return { start: utcStart, end: utcEnd };
    }

    //* Parse date string as YYYY-MM-DD in user's timezone
    const [year, month, day] = dateStr.split('-').map(Number);
    const localDate = new Date(year, month - 1, day);

    const localStart = startOfDay(localDate);
    const localEnd = endOfDay(localDate);

    //* Convert to UTC for database query
    const utcStart = fromZonedTime(localStart, timezone);
    const utcEnd = fromZonedTime(localEnd, timezone);

    return { start: utcStart, end: utcEnd };
}

export function convertToTimezone(date: Date, timezone: string): Date {
    return toZonedTime(date, timezone);
}

export function convertFromTimezone(date: Date, timezone: string): Date {
    return fromZonedTime(date, timezone);
}
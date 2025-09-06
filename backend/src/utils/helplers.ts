import { toZonedTime } from 'date-fns-tz';
import { TIMEZONE } from '../config';

export function roundToHour(date: Date): string {
    //* UTC -> Thai
    const zoned = toZonedTime(date, TIMEZONE);

    let h = zoned.getHours();
    const m = zoned.getMinutes();

    if (m > 30) h += 1;
    if (h > 23) h = 23;

    return `${String(h).padStart(2, '0')}:00`;
}

export function getThaiDayBounds() {
    //* Current time in Thai tz
    const now = new Date();
    const fmt = new Intl.DateTimeFormat("en-US", {
        timeZone: TIMEZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    //* Parse Thai local date (YYYY-MM-DD)
    const parts = fmt.formatToParts(now);
    const y = parts.find(p => p.type === "year")?.value;
    const m = parts.find(p => p.type === "month")?.value;
    const d = parts.find(p => p.type === "day")?.value;

    const startThai = new Date(`${y}-${m}-${d}T00:00:00`);
    const endThai = new Date(`${y}-${m}-${d}T23:59:59.999`);

    return { startUtc: startThai, endUtc: endThai };
}
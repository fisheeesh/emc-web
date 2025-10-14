import { toZonedTime } from 'date-fns-tz';
import { TIMEZONE } from '../config';
import path from "path"
import { unlink } from "node:fs/promises";

export function getStatusFromScore(score: number) {
    if (score >= 0.4) return 'positive';
    if (score >= -0.3) return 'neutral';
    if (score > -0.8) return 'negative';
    return 'critical';
}

export const departmentFilter = (role: string, uDepartmentId: number, qDepartmentId?: string) => {
    return role !== 'SUPERADMIN'
        ? { employee: { departmentId: uDepartmentId } }
        : qDepartmentId && qDepartmentId !== 'all'
            ? { employee: { departmentId: Number(qDepartmentId) } }
            : {};
}

export const determineReputation = (score: number) => {
    if (score >= 0.4) return 1000;
    if (score >= -0.3) return 500;
    if (score > -0.8) return -200;
    return -500;
}

export const getEmotionRange = (status: string) => {
    switch (status) {
        case "positive":
            return { gte: 0.4 };
        case "neutral":
            return { gte: -0.3, lte: 0.39 };
        case "negative":
            return { gte: -0.79, lte: -0.31 };
        case "critical":
            return { lte: -0.8 };
        default:
            return undefined;
    }
};

export const removeFiles = async (originalFile: string, optimizeFile?: string | null) => {
    try {
        const originalFilePath = path.join(
            __dirname,
            "../../",
            "/uploads/images",
            originalFile
        )
        await unlink(originalFilePath)

        if (optimizeFile) {
            const optimizeFilePath = path.join(
                __dirname,
                "../../",
                "/uploads/optimizes",
                optimizeFile
            )
            await unlink(optimizeFilePath)
        }

    } catch (error) {
        console.log(error)
    }
}

export function roundToHour(date: Date): string {
    //* UTC -> Thai
    const zoned = toZonedTime(date, TIMEZONE);

    let h = zoned.getHours();
    const m = zoned.getMinutes();

    if (m > 30) h += 1;
    if (h > 23) h = 23;

    return `${String(h).padStart(2, '0')}:00`;
}
import { NextFunction, Request, Response } from "express";
import { body, validationResult } from "express-validator";
import { errorCodes } from "../../config/error-codes";
import { createHttpErrors } from "../../utils/check";
import { createOrUpdateSettingStatus } from "../../services/system-service";
import { PrismaClient } from "../../../generated/prisma";

interface CustomRequest extends Request {
    userId?: number
}

const prisma = new PrismaClient();

export const setMaintenance = [
    body("mode", "Mode must be boolean").isBoolean(),
    async (req: CustomRequest, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const { mode } = req.body

        const value = mode ? 'true' : 'false'
        const message = mode ? 'Successfully set Maintenance mode.' : 'Successfully turn off Maintenance mode.'

        await createOrUpdateSettingStatus("maintenance", value)

        res.status(200).json({ message })
    }
]

const recentErrors: Array<{ time: number; message: string }> = [];
const MAX_STORED_ERRORS = 50;

export const getHealthCheck = async (req: Request, res: Response) => {
    const start = performance.now();
    let dbConnected = false;
    let dbResponseTime = 0;

    try {
        const dbStart = performance.now();
        await prisma.$queryRaw`SELECT 1`;
        dbResponseTime = performance.now() - dbStart;
        dbConnected = true;
    } catch (err: any) {
        dbConnected = false;
        const error = { time: Date.now(), message: err.message };
        recentErrors.push(error);

        if (recentErrors.length > MAX_STORED_ERRORS) {
            recentErrors.shift();
        }
    }

    const responseTime = performance.now() - start;

    const memUsage = process.memoryUsage();
    const memUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const memTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024);

    // Health scoring - NO MEMORY PENALTY
    const dbScore = dbConnected ? 40 : 0;
    const dbLatencyScore = dbResponseTime < 100 ? 10 : dbResponseTime < 300 ? 5 : 0;
    const responseScore = responseTime < 200 ? 30 : responseTime < 500 ? 20 : 10;

    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const recentErrorCount = recentErrors.filter(e => e.time > fiveMinutesAgo).length;
    const errorPenalty = Math.min(recentErrorCount * 3, 20);

    // Removed memPenalty from calculation
    const totalScore = Math.max(
        0,
        Math.min(100, dbScore + dbLatencyScore + responseScore - errorPenalty)
    );

    const status = totalScore >= 80 ? 'healthy' : totalScore >= 50 ? 'degraded' : 'unhealthy';
    const httpStatus = status === 'unhealthy' ? 503 : 200;

    res.status(httpStatus).json({
        status,
        score: Math.round(totalScore),
        metrics: {
            uptime_seconds: Math.round(process.uptime()),
            db_connected: dbConnected,
            db_latency_ms: Math.round(dbResponseTime),
            response_time_ms: Math.round(responseTime),
            memory_used_mb: memUsedMB,
            memory_total_mb: memTotalMB,
            memory_usage_percent: Math.round((memUsedMB / memTotalMB) * 100),
            errors_last_5min: recentErrorCount,
        },
        recent_errors: recentErrors.slice(-5),
        timestamp: new Date().toISOString(),
    });
};


export const getSimpleHealthCheck = async (req: Request, res: Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: 'ok' });
    } catch (err) {
        res.status(503).json({ status: 'error' });
    }
};

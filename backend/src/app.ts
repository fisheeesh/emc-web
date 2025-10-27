import compression from "compression"
import cookieParser from "cookie-parser"
import cors from "cors"
import express, { NextFunction, Request, Response } from "express"
import helmet from "helmet"
import morgan from "morgan"
import cron from "node-cron"
import { limiter } from "./middlewares/rate-limitter"

import routes from "./routes/v1"
import { cronCheckActionPlans } from "./services/system-service"

export const app = express()

var whitelist = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4000',
    'http://127.0.0.1:4000',
    "https://senior-pj-emotion.vercel.app",
    "https://emotioncheckinsystem.com"
]
var corsOptions = {
    origin: function (origin: any, callback: (err: Error | null, origin?: any) => void) {
        //* Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true)
        if (whitelist.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-platform'],
    exposedHeaders: ['set-cookie']
}

app.use(morgan("dev"))
    .use(express.urlencoded({ extended: true }))
    .use(express.json())
    .use(cors(corsOptions))
    .use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" }, }))
    .use(compression({}))
    .use(limiter)
    .use(cookieParser())

app.use((req, res, next) => {
    res.setHeader("Cross-Origin-Resource-Policy", "same-site");
    next();
});

app.use(express.static("uploads"));

app.use(routes)

app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    const status = error.status || 500
    const message = error.message || 'Server Error.'
    const errorCode = error.code || "Error_Code"

    res.status(status).json({
        message, error: errorCode
    })
})

//* Run every day at 11:00 PM to track whether action plans are overdue or abt to due
cron.schedule('0 23 * * *', async () => {
    console.log('Running action plan check at 11 PM...');
    await cronCheckActionPlans();
}, {
    timezone: "Asia/Bangkok"
});
import express from "express"
import { getAdminUser, getAllDepartments, testAdmin, getAllNotifications } from "../../../controllers/admin/admin-controller"
import { setMaintenance } from "../../../controllers/admin/system-contorller"
import { getDailyAttendance, getCheckInHours, getAttendanceOverView } from "../../../controllers/admin/attendance-controller"
import { getMoodOverview, getSenitmentsComparison, getLeaderboards, getAllCriticalEmps, getAllWatchlistEmps } from "../../../controllers/admin/sentiments-controller"
import { generateAIAnalysis } from "../../../controllers/admin/ai-analysis-controller"

const router = express.Router()

//* System routes
router.get("/test", testAdmin)
router.post("/maintenance", setMaintenance)

//* Sentiments routes
router.get("/mood-overview", getMoodOverview)
router.get("/sentiments-comparison", getSenitmentsComparison)
router.get("/all-departments", getAllDepartments)
router.get("/admin-user", getAdminUser)
router.get("/leaderboards", getLeaderboards)
router.get("/notifications", getAllNotifications)
router.get("/critical-emps", getAllCriticalEmps)
router.get("/watchlist-emps", getAllWatchlistEmps)

//* Attendance routes
router.get("/daily-attendance", getDailyAttendance)
router.get("/check-in-hours", getCheckInHours)
router.get("/attendance-overview", getAttendanceOverView)

//* AI-Analysis
router.post("/ai-analysis", generateAIAnalysis)


export default router
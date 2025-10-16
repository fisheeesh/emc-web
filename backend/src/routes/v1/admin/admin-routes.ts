import express from "express"
import { getAdminUser, getAllDepartments, getAllNotifications, testAdmin } from "../../../controllers/admin/admin-controller"
import { generateAIAnalysis, generateAIRecommendation } from "../../../controllers/admin/ai-controller"
import { getAttendanceOverView, getCheckInHours, getDailyAttendance } from "../../../controllers/admin/attendance-controller"
import { getAllCriticalEmps, getAllWatchlistEmps, getLeaderboards, getMoodOverview, getSenitmentsComparison } from "../../../controllers/admin/sentiments-controller"
import { setMaintenance } from "../../../controllers/admin/system-contorller"

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

router.post("/generate-recommendation", generateAIRecommendation)


export default router
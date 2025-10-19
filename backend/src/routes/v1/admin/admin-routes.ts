import express from "express"
import { createActionPlan, getAdminUser, getAllDepartments, getAllNotifications, markAsCompletedActionPlan, markAsReadNotification, testAdmin } from "../../../controllers/admin/admin-controller"
import { generateAIAnalysis, generateAIRecommendation, regenerateAIAnalysis } from "../../../controllers/admin/ai-controller"
import { getAttendanceOverView, getCheckInHours, getDailyAttendance } from "../../../controllers/admin/attendance-controller"
import { deleteCriticalEmpById, deleteWatchlistEmpById, getAllCriticalEmps, getAllWatchlistEmps, getLeaderboards, getMoodOverview, getSenitmentsComparison } from "../../../controllers/admin/sentiments-controller"
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
router.patch("/notifications", markAsReadNotification)
router.get("/critical-emps", getAllCriticalEmps)
router.delete("/critical-emps", deleteCriticalEmpById)
router.get("/watchlist-emps", getAllWatchlistEmps)
router.delete("/watchlist-emps", deleteWatchlistEmpById)

//* Attendance routes
router.get("/daily-attendance", getDailyAttendance)
router.get("/check-in-hours", getCheckInHours)
router.get("/attendance-overview", getAttendanceOverView)

//* AI routes
router.post("/ai-analysis", generateAIAnalysis)
router.post("/regenerate-ai-analysis", regenerateAIAnalysis)
router.post("/generate-recommendation", generateAIRecommendation)

//* Action Plans
router.post("/action-plans", createActionPlan)
router.patch("/action-plans", markAsCompletedActionPlan)


export default router
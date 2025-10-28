import express from "express"
import { deleteNotification, getAdminUser, getAllDepartments, getAllNotifications, makeAnnouncement, markAsReadNotification, testAdmin } from "../../../controllers/admin/admin-controller"
import { generateAIAnalysis, generateAIRecommendation, regenerateAIAnalysis } from "../../../controllers/admin/ai-controller"
import { getAttendanceOverView, getCheckInHours, getDailyAttendance } from "../../../controllers/admin/attendance-controller"
import { createActionPlan, deleteCriticalEmpById, deleteWatchlistEmpById, getAllCriticalEmps, getAllWatchlistEmps, getLeaderboards, getMoodOverview, getSenitmentsComparison, markAsCompletedActionPlan } from "../../../controllers/admin/sentiments-controller"
import { uploadAttachments } from "../../../middlewares/upload-files-middleware"

const router = express.Router()

//* System routes
router.get("/test", testAdmin)

//* Sentiments routes
router.get("/mood-overview", getMoodOverview)
router.get("/sentiments-comparison", getSenitmentsComparison)
router.get("/all-departments", getAllDepartments)
router.get("/admin-user", getAdminUser)
router.get("/leaderboards", getLeaderboards)
router.get("/notifications", getAllNotifications)
router.patch("/notifications", markAsReadNotification)
router.delete("/notifications", deleteNotification)
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

//* Make Announcement
router.post("/make-announcement", uploadAttachments.array('attachments', 4), makeAnnouncement)


export default router
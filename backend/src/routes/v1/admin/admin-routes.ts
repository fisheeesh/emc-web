import express from "express"
import { getAdminUser, getAllDepartments, getAttendanceOverView, getCheckInHours, getDailyAttendance, getSenitmentsComparison, getMoodOverview, testAdmin, getLeaderboards, getAllNotifications } from "../../../controllers/admin/admin-controller"
import { setMaintenance } from "../../../controllers/admin/system-contorller"

const router = express.Router()

//* System routes
router.get("/test", testAdmin)
router.post("/maintenance", setMaintenance)

//* Sentiments Dashboard routes
router.get("/mood-overview", getMoodOverview)
router.get("/sentiments-comparison", getSenitmentsComparison)
router.get("/daily-attendance", getDailyAttendance)
router.get("/check-in-hours", getCheckInHours)
router.get("/attendance-overview", getAttendanceOverView)
router.get("/all-departments", getAllDepartments)
router.get("/admin-user", getAdminUser)

router.get("/leaderboards", getLeaderboards)
router.get("/notifications", getAllNotifications)

export default router
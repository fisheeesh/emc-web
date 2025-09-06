import express from "express"
import { getAttendanceOverView, getCheckInHours, getDailyAttendance, getSenitmentsComparison, getTodayMoodOverview, testAdmin } from "../../../controllers/admin/admin-controller"
import { setMaintenance } from "../../../controllers/admin/system-contorller"

const router = express.Router()

//* System routes
router.get("/test", testAdmin)
router.post("/maintenance", setMaintenance)

//* Sentiments Dashboard routes
router.get("/mood-overview", getTodayMoodOverview)
router.get("/sentiments-comparison", getSenitmentsComparison)
router.get("/daily-attendance", getDailyAttendance)
router.get("/check-in-hours", getCheckInHours)
router.get("/attendance-overview", getAttendanceOverView)

export default router
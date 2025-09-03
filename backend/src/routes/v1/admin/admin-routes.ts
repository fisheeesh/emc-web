import express from "express"
import { getTodayMoodOverview, testAdmin } from "../../../controllers/admin/admin-controller"
import { setMaintenance } from "../../../controllers/admin/system-contorller"

const router = express.Router()

router.get("/test", testAdmin)

router.post("/maintenance", setMaintenance)
router.get("/today-overview", getTodayMoodOverview)

export default router
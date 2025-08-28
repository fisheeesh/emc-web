import express from "express"
import { testAdmin } from "../../../controllers/admin/admin-controller"
import { setMaintenance } from "../../../controllers/admin/system-contorller"

const router = express.Router()

router.get("/test", testAdmin)

router.post("/maintenance", setMaintenance)

export default router
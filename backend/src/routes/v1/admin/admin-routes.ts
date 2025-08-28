import express from "express"
import { testAdmin } from "../../../controllers/admin/admin-controller"

const router = express.Router()

router.get("/test", testAdmin)

export default router
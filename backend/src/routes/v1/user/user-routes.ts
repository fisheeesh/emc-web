import express from "express"
import { getEmotions } from "../../../controllers/super-admin/super-admin-controller"
import { emotionCheckIn, getEmpCheckInHistory, getEmployeeData, test, updateEmployeeDataById } from "../../../controllers/user/user-controller"
import { auth } from "../../../middlewares/auth-middleware"
import upload from "../../../middlewares/upload-files-middleware"

const router = express.Router()

router.get("/test", auth, test)

//* emotion check-in process
router.post("/check-in", emotionCheckIn)
router.get("/my-history", getEmpCheckInHistory)
router.get("/emotion-categories", getEmotions)
router.get("/emp-data", getEmployeeData)
router.patch("/emp-data", upload.single("avatar"), updateEmployeeDataById)

export default router
import express from "express"
import { auth } from "../../../middlewares/auth-middleware"
import { emotionCheckIn, getEmpCheckInHistory, test } from "../../../controllers/user/user-controller"

const router = express.Router()

router.get("/test", auth, test)

//* emotion check-in process
router.post("/check-in", auth, emotionCheckIn)
router.get("/my-history", auth, getEmpCheckInHistory)

export default router
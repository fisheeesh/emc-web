import express from "express"
import { auth } from "../../../middlewares/auth-middleware"
import { emotionCheckIn, test } from "../../../controllers/user/user-controller"

const router = express.Router()

router.get("/test", auth, test)

//* emotion check-in process
router.post("/check-in", auth, emotionCheckIn)

export default router
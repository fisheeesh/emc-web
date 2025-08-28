import express from "express"
import { auth } from "../../../middlewares/auth-middleware"
import { test } from "../../../controllers/user/user-controller"

const router = express.Router()

router.get("/test", auth, test)

export default router
import express from "express"
import { login, register, verifyOTP } from "../../../controllers/auth/auth-controller"

const router = express.Router()

//* Register process
router.post("/register", register)
router.post("/verify-otp", verifyOTP)
router.post("/confirm-password")

//* login process
router.post("/login", login)

//* forgot password process
router.post("/forgot-password")
router.post("/verity-otp-forgot")
router.post("/reset-password")

export default router
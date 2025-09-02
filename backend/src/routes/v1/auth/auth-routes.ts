import express from "express"
import { authCheck, confirmPassword, forgotPassword, login, logout, register, resetPassword, veriftyOtpForgot, verifyOTP } from "../../../controllers/auth/auth-controller"
import { auth } from "../../../middlewares/auth-middleware"
import { authorize } from "../../../middlewares/authorize-middleware"

const router = express.Router()

//* Register process
router.post("/register", register)
router.post("/verify-otp", verifyOTP)
router.post("/confirm-password", confirmPassword)

//* login & logout process
router.post("/login", login)
router.post("/logout", logout)

//* auth check
router.get("/auth-check", auth, authorize(false, "EMPLOYEE"), authCheck)

//* forgot password process
router.post("/forgot-password", forgotPassword)
router.post("/verity-otp-forgot", veriftyOtpForgot)
router.post("/reset-password", resetPassword)

export default router
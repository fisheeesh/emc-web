import express from "express"
import authRoutes from "./auth/auth-routes"
import userRoutes from "./user/user-routes"
import adminRoutes from "./admin/admin-routes"
import { auth } from "../../middlewares/auth-middleware"
import { authorize } from "../../middlewares/authorize-middleware"

const router = express.Router()

router.use("/api/v1", authRoutes)
router.use("/api/v1/user", userRoutes)
router.use("/api/v1/admin", auth, authorize(true, "ADMIN"), adminRoutes)
router.use("/api/v1/superadmin")

export default router
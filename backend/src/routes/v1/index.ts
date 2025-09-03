import express from "express"
import authRoutes from "./auth/auth-routes"
import userRoutes from "./user/user-routes"
import adminRoutes from "./admin/admin-routes"
import { auth } from "../../middlewares/auth-middleware"
import { authorize } from "../../middlewares/authorize-middleware"
import { maintenance } from "../../middlewares/maintenance-middleware"

const router = express.Router()

//* without maintenance
// router.use("/api/v1", authRoutes)
// router.use("/api/v1/user", userRoutes)
// router.use("/api/v1/admin", auth, authorize(true, "ADMIN"), adminRoutes)

//* with maintenance
router.use("/api/v1", maintenance, authRoutes)
router.use("/api/v1/user", maintenance, userRoutes)
router.use("/api/v1/admin", maintenance, auth, authorize(true, "ADMIN", "SUPERADMIN"), adminRoutes)
// router.use("/api/v1/superadmin")

export default router
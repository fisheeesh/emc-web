import express from "express"
import { getHealthCheck, getSimpleHealthCheck } from "../../controllers/admin/system-controller"
import { auth } from "../../middlewares/auth-middleware"
import { authorize } from "../../middlewares/authorize-middleware"
import adminRoutes from "./admin/admin-routes"
import authRoutes from "./auth/auth-routes"
import superAdminRoutes from './super-admin/super-admin-routes'
import userRoutes from "./user/user-routes"

const router = express.Router()

//* Health Check
router.get("/api/v1/health/detailed", getHealthCheck)
router.get("/api/v1/health", getSimpleHealthCheck)

//* main routes
router.use("/api/v1", authRoutes)
router.use("/api/v1/user", userRoutes)
router.use("/api/v1/admin", auth, authorize(true, "ADMIN", "SUPERADMIN"), adminRoutes)
router.use("/api/v1/super-admin", auth, authorize(true, "SUPERADMIN"), superAdminRoutes)

export default router
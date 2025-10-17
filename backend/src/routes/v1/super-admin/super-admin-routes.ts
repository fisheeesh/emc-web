import express from "express"
import { deleteActionPlanById, getAllActionPlans, updateActionPlan } from "../../../controllers/super-admin/action-plan-management-controller"
import { testSuperAdmin } from "../../../controllers/super-admin/super-admin-controller"
import { createNewEmployee, deleteEmployee, getAllEmployeesInfinite } from "../../../controllers/super-admin/user-management-controller"
import upload from "../../../middlewares/upload-files-middleware"
import { updateEmployeeData } from "../../../services/auth-services"

const router = express.Router()

//* Test super admin
router.get("/test", testSuperAdmin)

//* Emp management routes
router.get("/emps-infinite", getAllEmployeesInfinite)
router.post("/emps", upload.single("avatar"), createNewEmployee)
router.patch("/emps", upload.single("avatar"), updateEmployeeData)
router.delete("/emps", deleteEmployee)

//* Actoin plans management routes
router.get("/action-plans", getAllActionPlans)
router.delete("/action-plans", deleteActionPlanById)
router.patch("/action-plans", updateActionPlan)

export default router
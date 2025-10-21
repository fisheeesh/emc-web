import express from "express"
import { deleteActionPlanById, getAllActionPlans, updateActionPlan } from "../../../controllers/super-admin/action-plan-management-controller"
import { getActionPlanStatus, getDepartmentsHeatmap } from "../../../controllers/super-admin/analytics-controller"
import { getSummaryData, testSuperAdmin } from "../../../controllers/super-admin/super-admin-controller"
import { createNewEmployee, deleteEmployee, getAllEmployeesInfinite, updateEmployeeInformation } from "../../../controllers/super-admin/user-management-controller"
import upload from "../../../middlewares/upload-files-middleware"

const router = express.Router()

//* Test super admin
router.get("/test", testSuperAdmin)

//* Summary data
router.get("/summary", getSummaryData)

//* Emp management routes
router.get("/emps-infinite", getAllEmployeesInfinite)
router.post("/emps", upload.single("avatar"), createNewEmployee)
router.patch("/emps", upload.single("avatar"), updateEmployeeInformation)
router.delete("/emps", deleteEmployee)

//* Actoin plans management routes
router.get("/action-plans", getAllActionPlans)
router.delete("/action-plans", deleteActionPlanById)
router.patch("/action-plans", updateActionPlan)

//* Analytics routes
router.get("/action-plan-status", getActionPlanStatus)
router.get("/departments-heatmap", getDepartmentsHeatmap)

export default router
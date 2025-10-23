import express from "express"
import { deleteActionPlanById, getAllActionPlans, updateActionPlan } from "../../../controllers/super-admin/action-plan-management-controller"
import { getActionAvgReponseTime, getActionPlanStatus, getDepartmentsHeatmap, getTopConcernWords } from "../../../controllers/super-admin/analytics-controller"
import { createNewDepartment, deleteDepartmentById, getAllDepartmentsData, getSummaryData, testSuperAdmin, updateDepartmentById } from "../../../controllers/super-admin/super-admin-controller"
import { bulkRegister, createNewEmployee, deleteEmployee, getAllEmployeesInfinite, updateEmployeeInformation } from "../../../controllers/super-admin/user-management-controller"
import upload, { uploadCSV } from "../../../middlewares/upload-files-middleware"

const router = express.Router()

//* Test super admin
router.get("/test", testSuperAdmin)

//* Summary data
router.get("/summary", getSummaryData)

//* Dep routes
router.get("/departments-data", getAllDepartmentsData)
router.post("/departments", createNewDepartment)
router.patch("/departments", updateDepartmentById)
router.delete("/departments", deleteDepartmentById)

//* Emp management routes
router.get("/emps-infinite", getAllEmployeesInfinite)
router.post("/emps", upload.single("avatar"), createNewEmployee)
router.patch("/emps", upload.single("avatar"), updateEmployeeInformation)
router.delete("/emps", deleteEmployee)
router.post("/bulk-register", uploadCSV.single('csvFile'), bulkRegister)

//* Actoin plans management routes
router.get("/action-plans", getAllActionPlans)
router.delete("/action-plans", deleteActionPlanById)
router.patch("/action-plans", updateActionPlan)

//* Analytics routes
router.get("/action-plan-status", getActionPlanStatus)
router.get("/departments-heatmap", getDepartmentsHeatmap)
router.get("/action-avg-response-time", getActionAvgReponseTime)
router.get("/top-concern-words", getTopConcernWords)

export default router
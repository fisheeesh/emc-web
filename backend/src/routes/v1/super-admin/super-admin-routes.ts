import express from "express"
import { createNewEmployee, deleteEmployee, getAllActionPlans, getAllEmployeesInfinite, updateEmployeeData } from "../../../controllers/super-admin/super-admin-controller"
import upload from "../../../middlewares/upload-files-middleware"

const router = express.Router()

//* Emp management routes
router.get("/emps-infinite", getAllEmployeesInfinite)
router.post("/emps", upload.single("avatar"), createNewEmployee)
router.patch("/emps", upload.single("avatar"), updateEmployeeData)
router.delete("/emps", deleteEmployee)

//* Actoin plans management routes
router.get("/action-plans", getAllActionPlans)

export default router
import express from "express"
import { createNewEmployee, deleteEmployee, getAllEmployeesInfinite, updateEmployeeData } from "../../../controllers/super-admin/super-admin-controller"
import upload from "../../../middlewares/upload-files-middleware"

const router = express.Router()

router.get("/all-emp-infinite", getAllEmployeesInfinite)
router.post("/create-emp", upload.single("avatar"), createNewEmployee)
router.patch("/update-emp", upload.single("avatar"), updateEmployeeData)
router.delete("/delete-emp", deleteEmployee)

export default router
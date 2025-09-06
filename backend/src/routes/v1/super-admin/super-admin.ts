import express from "express"
import { createNextEmployee } from "../../../controllers/super-admin/super-admin-controller"

const router = express.Router()

router.post("/create-emp", createNextEmployee)

export default router
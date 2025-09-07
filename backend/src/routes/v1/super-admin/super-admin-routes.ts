import express from "express"
import { createNextEmployee } from "../../../controllers/super-admin/super-admin-controller"
import upload from "../../../middlewares/upload-files-middleware"

const router = express.Router()

router.post("/create-emp", upload.single("avatar"), createNextEmployee)

export default router
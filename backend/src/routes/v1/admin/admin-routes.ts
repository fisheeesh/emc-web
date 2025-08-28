import express from "express"
import { test } from "../../../controllers/user/user-controller"

const router = express.Router()

router.post("/create", test)

export default router
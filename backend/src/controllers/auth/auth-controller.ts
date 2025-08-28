import { NextFunction, Request, Response } from "express"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, validationResult } from "express-validator"
import { checkEmployeeIfNotExits, createHttpErrors } from "../../utils/helpers"
import { errorCodes } from "../../config/error-codes"
import { getEmployeeByEmail, updateEmployeeData } from "../../services/auth-services"

export const login = [
    body("email", "Invalid Email format.")
        .trim()
        .isEmpty()
        .isEmail().withMessage("Invalid email format.")
        .custom((value) => {
            if (!value.endsWith("@ata.it.th")) {
                throw new Error("Email must be from @ata.it.th domain.");
            }
            return true;
        }),
    body("password", "Password must be at least 8 digits.")
        .trim()
        .notEmpty()
        .matches(/^[\d]+$/)
        .isLength({ min: 8, max: 8 }),
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const { email, password } = req.body

        const employee = await getEmployeeByEmail(email)
        checkEmployeeIfNotExits(employee)

        if (employee!.status === 'FREEZE') {
            return next(createHttpErrors({
                message: "Your account is temporarily locked. Please contact us.",
                status: 401,
                code: errorCodes.accountFreeze,
            }))
        }

        const isMatchPasswword = await bcrypt.compare(password, employee!.password)

        if (!isMatchPasswword) {
            const lastRequest = employee?.updatedAt.toLocaleDateString()
            const isSameDate = lastRequest === new Date().toLocaleDateString()

            if (!isSameDate) {
                const employeeData = {
                    errorLoginCount: 1
                }

                await updateEmployeeData(employee!.id, employeeData)
            } else {
                if (employee!.errorLoginCount >= 3) {
                    const employeeData = {
                        status: 'FREEZE'
                    }

                    await updateEmployeeData(employee!.id, employeeData)
                } else {
                    const employeeData = {
                        errorLoginCount: { increment: 1 }
                    }

                    await updateEmployeeData(employee!.id, employeeData)
                }
            }

            return next(createHttpErrors({
                message: "Incorrect Password.",
                status: 401,
                code: errorCodes.unauthenticated
            }))
        }

        const accessTokenPayload = { id: employee!.id }
        const refreshTokenPayload = { id: employee!.id, email: employee!.email }

        const accessToken = jwt.sign(
            accessTokenPayload,
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: 60 * 15 }
        )

        const refreshToken = jwt.sign(
            refreshTokenPayload,
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: '30d' }
        )

        const employeeData = {
            errorLoginCount: 0,
            rndToken: refreshToken
        }

        await updateEmployeeData(employee!.id, employeeData)


        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 1000 * 60 * 15,
            path: '/'
        }).cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 1000 * 60 * 60 * 24 * 30,
            path: '/'
        }).status(200).json({
            message: "Successfully logged in.",
            employeeId: employee!.id
        })
    }
]
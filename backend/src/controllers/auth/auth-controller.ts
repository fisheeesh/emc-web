import bcrypt from 'bcrypt'
import { NextFunction, Request, Response } from "express"
import { body, validationResult } from "express-validator"
import jwt from 'jsonwebtoken'
import { errorCodes } from "../../config/error-codes"
import { createOTP, getEmployeeByEmail, getOTPRowByEmail, updateEmployeeData } from "../../services/auth-services"
import { checkEmployeeIfExits, checkEmployeeIfNotExits, checkOTPErrorIfSameDate, createHttpErrors } from "../../utils/check"
import { generateHashedValue, generateToken } from "../../utils/generate"

export const register = [
    body("email", "Invalid Email format.")
        .trim()
        .isEmpty()
        .isEmail().withMessage("Invalid email format.")
        .custom(value => {
            if (!value.endsWith("@ata.it.th")) {
                throw new Error("Email must be from @ata.it.th domain.")
            }
            return true
        }),
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const { email } = req.body

        const employee = await getEmployeeByEmail(email)
        //* Check if email already exists
        checkEmployeeIfExits(employee)

        const otp = 123456
        //* Have to convert hashValue for security
        const hashedOTP = await generateHashedValue(otp.toString())
        //* generate token which will be necessary in verifity OTP
        const token = generateToken()

        const otpRow = await getOTPRowByEmail(employee!.email)

        let result;
        if (!otpRow) {
            //* For the first time, create OTP
            const otpData = {
                email,
                otp: hashedOTP,
                rememberToken: token,
                count: 1,
            }

            result = await createOTP(otpData)
        } else {
            //* If not, check otp is requested by tdy or not
            const lastOTPRequest = otpRow.updatedAt.toLocaleDateString()
            const isSameDate = lastOTPRequest === new Date().toLocaleDateString()

            //* Check if OTP is wrong for 5 times during today
            checkOTPErrorIfSameDate(isSameDate, otpRow.error)

            if (!isSameDate) {
                //* OTP is requested in not the same day -> set count to 1 and error to 0
                const otpData = {
                    otp: hashedOTP,
                    rememberToken: token,
                    count: 1,
                    error: 0
                }

                result = await createOTP(otpData)
            } else {
                //* Check if OTP is allowed to request 5 times per day
                if (otpRow.count === 5) {
                    return next(createHttpErrors({
                        message: "OTP is allowed to request 3 times per day.",
                        status: 405,
                        code: errorCodes.overLimit,
                    }))
                } else {
                    //* Same day and not reach to over limit -> continue sending OTP
                    const otpData = {
                        otp: hashedOTP,
                        rememberToken: token,
                        count: { increment: 1 }
                    }

                    result = await createOTP(otpData)
                }
            }
        }

        res.status(200).json({
            message: `We are sending OTP to ${result.email}.`,
            email: result.email,
            token: result.rememberToken
        })
    }
]

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
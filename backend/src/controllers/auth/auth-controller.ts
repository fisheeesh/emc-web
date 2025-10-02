import bcrypt from 'bcrypt'
import { NextFunction, Request, Response } from "express"
import { body, validationResult } from "express-validator"
import jwt from 'jsonwebtoken'
import moment from 'moment'
import { DEPARTMENTS } from '../../config'
import { errorCodes } from "../../config/error-codes"
import { createEmployee, createOTP, getEmployeeByEmail, getEmployeeById, getOTPRowByEmail, updateEmployeeData, updateOTP } from "../../services/auth-services"
import { authorize } from '../../utils/authorize'
import { checkEmployeeIfExits, checkEmployeeIfNotExits, checkOTPErrorIfSameDate, checkOTPRow, createHttpErrors } from "../../utils/check"
import { generateHashedValue, generateToken } from "../../utils/generate"

interface CustomRequest extends Request {
    employeeId?: number
}

export const register = [
    body("email", "Invalid email format.")
        .trim()
        .notEmpty()
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
        //* Check if existing employee or not
        checkEmployeeIfExits(employee)

        // @TODO: generate OTP
        const otp = 123456
        //* Have to convert hashValue for security
        const hashedOTP = await generateHashedValue(otp.toString())
        //* generate token which will be necessary in verifity OTP
        const token = generateToken()

        const otpRow = await getOTPRowByEmail(email)

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
                //* Check if OTP is allowed to request 3 times per day
                if (otpRow.count === 3) {
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

export const verifyOTP = [
    body("email", "Invalid Email format.")
        .trim()
        .notEmpty()
        .isEmail().withMessage("Invalid email format.")
        .custom(value => {
            if (!value.endsWith("@ata.it.th")) {
                throw new Error("Email must be from @ata.it.th domain.")
            }
            return true
        }),
    body("otp", "Invalid OTP.")
        .trim()
        .notEmpty()
        .matches(/^[\d]+$/)
        .isLength({ min: 6, max: 6 }),
    body('token', "Invalid Token.")
        .trim()
        .notEmpty()
        .escape(),
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const { email, otp, token } = req.body
        const employee = await getEmployeeByEmail(email)
        //* Check if existing employee or not
        checkEmployeeIfExits(employee)

        const otpRow = await getOTPRowByEmail(email)
        //* By this time OTP must be sent to employee
        checkOTPRow(otpRow)

        const lastOTPVerify = otpRow!.updatedAt.toLocaleDateString()
        const isSameDate = lastOTPVerify === new Date().toLocaleDateString()

        //* Check if otp is wrong for 5 times during today
        checkOTPErrorIfSameDate(isSameDate, otpRow!.error)

        //* Check the token we set in register process is same with the one we get
        if (otpRow!.rememberToken !== token) {
            const otpData = {
                error: 5
            }
            await updateOTP(otpRow!.id, otpData)

            //* If not, that might attack
            return next(createHttpErrors({
                message: 'Invalid Token.',
                status: 400,
                code: errorCodes.invalid,
            }))
        }

        //* Check if OTP is expired
        const isExpired = moment().diff(otpRow!.updatedAt) > 2 * 60 * 1000;

        if (isExpired) return next(createHttpErrors({
            message: 'OTP is expired.',
            status: 403,
            code: errorCodes.otpExpired,
        }))

        //* Check if OTP is correct
        const isMatchOTP = await bcrypt.compare(otp, otpRow!.otp)

        if (!isMatchOTP) {
            //* Incorrect is not in the same day -> reset the process
            if (!isSameDate) {
                const otpData = {
                    error: 1
                }

                await updateOTP(otpRow!.id, otpData)
            } else {
                //* Incorrect is in the same day -> continue the process
                const otpData = {
                    error: { increment: 1 }
                }

                await updateOTP(otpRow!.id, otpData)
            }

            return next(createHttpErrors({
                message: 'Incorrect OTP. Please try again.',
                status: 400,
                code: errorCodes.invalid,
            }))
        }

        //* All ok, genreate verifty token which we will need in confirm password process
        const verifyToken = generateToken()
        const otpData = {
            verifyToken,
            error: 0,
            count: 1
        }

        const result = await updateOTP(otpRow!.id, otpData)

        res.status(200).json({
            message: "OTP is successfully verified.",
            email: result.email,
            token: result.verifyToken
        })
    }
]

export const confirmPassword = [
    body("email", "Invalid email format.")
        .trim()
        .notEmpty()
        .isEmail().withMessage("Invalid email format.")
        .custom(value => {
            if (!value.endsWith("@ata.it.th")) {
                throw new Error("Email must be from @ata.it.th domain.")
            }
            return true
        }),
    body("department", "Invalid department.")
        .trim()
        .notEmpty()
        .custom(value => {
            if (!DEPARTMENTS.includes(value)) {
                throw new Error("Invalid department.")
            }
            return true
        })
        .escape(),
    body("password", "Password must be at least 8 digits.")
        .trim()
        .notEmpty()
        .matches(/^[\d]+$/)
        .isLength({ min: 8, max: 8 }),
    body('token', "Invalid Token.")
        .trim()
        .notEmpty()
        .escape(),
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const { email, department, password, token, } = req.body
        const employee = await getEmployeeByEmail(email)
        //* Check if existing employee or not
        checkEmployeeIfExits(employee)

        //* By this time OTP must be sent to employee
        const otpRow = await getOTPRowByEmail(email)
        checkOTPRow(otpRow)

        //* OTP error count is over-limit or not
        if (otpRow?.error === 5) {
            return next(createHttpErrors({
                message: "Your request is over-limit. Please try again.",
                status: 400,
                code: errorCodes.attack,
            }))
        }

        //* If token mismatch -> **might be attack**
        if (otpRow!.verifyToken !== token) {
            const otpData = {
                error: 5
            }

            await updateOTP(otpRow!.id, otpData)

            return next(createHttpErrors({
                message: 'Invalid Token.',
                status: 400,
                code: errorCodes.invalid,
            }))
        }

        const isExpired = moment().diff(otpRow!.updatedAt) > 10 * 60 * 1000;

        //* If token expired -> tell user to try again.
        if (isExpired) {
            return next(createHttpErrors({
                message: 'Session expired. Please try again.',
                status: 403,
                code: errorCodes.forbidden,
            }))
        }

        //* All ok -> store hashed password to db along with refreshToken as rndToken for security
        const hashPassword = await generateHashedValue(password)
        const rndToken = "@TODO://"

        const employeeData = {
            email,
            department,
            password: hashPassword,
            rndToken
        }

        const newEmp = await createEmployee(employeeData)

        //* Create tokens and add some payloads to it
        const accessTokenPayload = { id: newEmp!.id }
        const refreshTokenPayload = { id: newEmp!.id, email: newEmp!.email, role: newEmp!.role }

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

        const updatedEmployeeData = { rndToken: refreshToken }

        await updateEmployeeData(newEmp!.id, updatedEmployeeData)

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 15,
            path: '/'
        }).cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 30,
            path: '/'
        }).status(201).json({
            message: "Successfully created an account.",
            empId: newEmp.id
        })
    }
]

export const login = [
    body("email", "Invalid email format.")
        .trim()
        .notEmpty()
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

        //! Check if the req is from mobile **flutter**
        const platform = req.header('x-platform')

        const { email, password } = req.body

        const employee = await getEmployeeByEmail(email)
        //* Check if existing employee or not
        checkEmployeeIfNotExits(employee)

        const can = authorize(false, employee!.role, "EMPLOYEE")

        if (!can && platform !== 'mobile') {
            return next(createHttpErrors({
                message: 'You do not have permission to access this resource.',
                code: errorCodes.forbidden,
                status: 403
            }))
        }

        //* If acc status is FREEZE -> contact admin
        if (employee!.accType === 'FREEZE') {
            return next(createHttpErrors({
                message: "Your account is temporarily locked. Please contact your supervisor.",
                status: 401,
                code: errorCodes.accountFreeze,
            }))
        }

        //* Check if password is correct
        const isMatchPasswword = await bcrypt.compare(password, employee!.password)

        if (!isMatchPasswword) {
            const lastRequest = employee?.updatedAt.toLocaleDateString()
            const isSameDate = lastRequest === new Date().toLocaleDateString()

            //* Not correct and not in the same day -> reset the process
            if (!isSameDate) {
                const employeeData = {
                    errorLoginCount: 1
                }

                await updateEmployeeData(employee!.id, employeeData)
            } else {
                //* If password is wrong for 3 times -> freeze the account *might attack*
                if (employee!.errorLoginCount >= 3) {
                    const employeeData = {
                        accType: 'FREEZE'
                    }

                    await updateEmployeeData(employee!.id, employeeData)
                } else {
                    //* Same day and not reach to over limit -> continue
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

        //* Password match -> create tokens and add some payloads to it
        const accessTokenPayload = { id: employee!.id }
        const refreshTokenPayload = { id: employee!.id, email: employee!.email, role: employee!.role }

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
            //* store refresh token for security -> will necessary in rotating token process
            rndToken: refreshToken
        }

        await updateEmployeeData(employee!.id, employeeData)

        if (platform === 'mobile') {
            return res.status(200).json({
                message: "Successfully logged in from mobile.",
                employeeId: employee!.id,
                accessToken,
                refreshToken,
            });
        } else {
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
                message: "Successfully logged in from web.",
                employeeId: employee!.id
            })
        }
    }
]

export const logout = async (req: Request, res: Response, next: NextFunction) => {
    //* To logout, there must be an anthenticated user
    const platform = req.header("x-platform");

    let refreshToken: string | null = null;

    if (platform === "mobile") {
        //* For mobile → tokens come from headers
        refreshToken = req.header("x-refresh-token") || null;
    } else {
        //* For web → tokens come from cookies
        refreshToken = req.cookies?.refreshToken || null;
    }

    //* Check user is able to logout
    if (!refreshToken) return next(createHttpErrors({
        message: "You are not authenticated employee.",
        status: 401,
        code: errorCodes.unauthenticated
    }))

    let decoded;
    try {
        //* Check user is able to logout
        decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!) as { id: number, email: string, role: string }
    } catch (error) {
        return next(createHttpErrors({
            message: 'You are not an authenticated user.',
            code: errorCodes.unauthenticated,
            status: 401,
        }))
    }

    //* Check user is able to logout
    if (isNaN(decoded.id)) return next(createHttpErrors({
        message: "You are not authenticated employee.",
        status: 401,
        code: errorCodes.unauthenticated
    }))

    const emp = await getEmployeeById(decoded.id)
    checkEmployeeIfNotExits(emp)

    //* Check user is able to logout
    if (emp!.email !== decoded.email) return next(createHttpErrors({
        message: "You are not authenticated employee.",
        status: 401,
        code: errorCodes.unauthenticated
    }))

    const empData = {
        //* store refresh token for security
        rndToken: generateToken()
    }

    await updateEmployeeData(emp!.id, empData)

    if (platform === 'mobile') {
        return res.status(200).json({
            message: "Successfully logged out from mobile. See you soon.!"
        });
    } else {
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/'
        }).clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            path: '/'
        }).status(200).json({
            message: "Successfully logged out from web. See you soon.!"
        })
    }
}

export const forgotPassword = [
    body("email", "Invalid email format.")
        .notEmpty()
        .trim()
        .isEmail().withMessage("Invalid email format.")
        .custom((value: string) => {
            if (!value.endsWith("@ata.it.th")) {
                throw new Error("Email must from @ata.it.th domain.")
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

        const platform = req.header("x-platform")

        const { email } = req.body
        const emp = await getEmployeeByEmail(email)
        checkEmployeeIfNotExits(emp)

        const can = authorize(false, emp!.role, 'EMPLOYEE')

        if (!can && platform !== 'mobile') {
            return next(createHttpErrors({
                message: 'You are not allowed to do this action. Please contact your supervisor.',
                code: errorCodes.forbidden,
                status: 403,
            }))
        }

        if (emp!.accType === 'FREEZE') {
            return next(createHttpErrors({
                message: "Your account is temporarily locked. Please contact your supervisor.",
                status: 401,
                code: errorCodes.accountFreeze,
            }))
        }

        //* By this time OTP must be in the database
        const otpRow = await getOTPRowByEmail(emp!.email)

        const otp = 123456
        const hashedOTP = await generateHashedValue(otp.toString())
        const token = generateToken()

        const lastOTPRequest = otpRow?.updatedAt.toLocaleDateString()
        const isSameDate = new Date().toLocaleDateString() === lastOTPRequest

        checkOTPErrorIfSameDate(isSameDate, otpRow!.error)

        let result;
        if (!isSameDate) {
            const otpData = {
                otp: hashedOTP,
                rememberToken: token,
                count: 1,
                error: 0
            }

            result = await updateOTP(otpRow!.id, otpData)
        } else {
            if (otpRow!.count >= 3) {
                return next(createHttpErrors({
                    message: "OTP is allowed to ask 3 times per day. Please try again tomorrow.",
                    status: 401,
                    code: errorCodes.overLimit
                }))
            } else {
                const otpData = {
                    count: { increment: 1 },
                    otp: hashedOTP,
                    rememberToken: token,
                }

                result = await updateOTP(otpRow!.id, otpData)
            }
        }

        res.status(200).json({
            message: `We are sending OTP to ${emp!.email}. Please check your email.`,
            email: result.email,
            token: result.rememberToken
        })
    }
]

export const veriftyOtpForgot = [
    body("email", "Invalid email format.")
        .notEmpty()
        .trim()
        .isEmail().withMessage("Invalid email format.")
        .custom((value: string) => {
            if (!value.endsWith("@ata.it.th")) {
                throw new Error("Email must from @ata.it.th domain.")
            }
            return true
        }),
    body("otp", "Invalid OTP.")
        .notEmpty()
        .trim()
        .matches(/^[\d]+$/)
        .isLength({ min: 6, max: 6 }),
    body("token", "Invalid token.")
        .notEmpty()
        .trim()
        .escape(),
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const { email, otp, token } = req.body
        const emp = await getEmployeeByEmail(email)
        checkEmployeeIfNotExits(emp)

        const can = authorize(false, emp!.role, 'EMPLOYEE')

        if (!can) return next(createHttpErrors({
            message: 'You are not allowed to do this action. Please contact your supervisor.',
            code: errorCodes.forbidden,
            status: 403,
        }))

        if (emp!.accType === 'FREEZE') {
            return next(createHttpErrors({
                message: "Your account is temporarily locked. Please contact your supervisor.",
                status: 401,
                code: errorCodes.accountFreeze,
            }))
        }

        const otpRow = await getOTPRowByEmail(email)

        const isExpired = moment().diff(otpRow!.updatedAt) > 2 * 60 * 1000;

        if (isExpired) {
            return next(createHttpErrors({
                message: "OTP is expired. Please try again.",
                status: 401,
                code: errorCodes.otpExpired
            }))
        }

        if (token !== otpRow!.rememberToken) {
            const otpData = {
                error: 5
            }

            await updateOTP(otpRow!.id, otpData)

            return next(createHttpErrors({
                message: "Invalid Token.",
                status: 400,
                code: errorCodes.attack
            }))
        }

        checkOTPErrorIfSameDate(false, otpRow!.error)

        const lastOTPVerify = otpRow?.updatedAt.toLocaleDateString()
        const isSameDate = new Date().toLocaleDateString() === lastOTPVerify

        const isMatchOTP = await bcrypt.compare(otp, otpRow!.otp)

        if (!isMatchOTP) {
            if (!isSameDate) {
                const otpData = {
                    error: 1
                }

                await updateOTP(otpRow!.id, otpData)
            } else {
                const optData = {
                    error: { increment: 1 }
                }

                await updateOTP(otpRow!.id, optData)
            }

            return next(createHttpErrors({
                message: "Incorrect OTP.",
                status: 400,
                code: errorCodes.invalid
            }))
        }

        const otpData = {
            error: 0,
            count: 1,
            verifyToken: generateToken()
        }

        const result = await updateOTP(otpRow!.id, otpData)

        res.status(200).json({
            message: "OTP is successfully verified.",
            email: result.email,
            token: result.verifyToken
        })
    }
]

export const resetPassword = [
    body("email", "Invalid email format.")
        .trim()
        .notEmpty()
        .custom((value: string) => {
            if (!value.endsWith("@ata.it.th")) {
                throw new Error("Email must from @ata.it.th domain.")
            }
            return true
        }),
    body("token", "Invalid Token.")
        .trim()
        .notEmpty()
        .escape(),
    body("password", "Password must be at least 8 digits.")
        .trim()
        .notEmpty()
        .isLength({ min: 8, max: 8 }).withMessage("Password must be 8 characters.")
        .matches(/^\d+$/),
    async (req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req).array({ onlyFirstError: true })
        if (errors.length > 0) return next(createHttpErrors({
            message: errors[0].msg,
            status: 400,
            code: errorCodes.invalid
        }))

        const { email, token, password } = req.body

        const emp = await getEmployeeByEmail(email)
        checkEmployeeIfNotExits(emp)

        const can = authorize(false, emp!.role, 'EMPLOYEE')
        if (!can) return next(createHttpErrors({
            message: 'You are not allowed to do this action. Please contact your supervisor.',
            code: errorCodes.forbidden,
            status: 403,
        }))

        if (emp!.accType === 'FREEZE') {
            return next(createHttpErrors({
                message: "Your account is temporarily locked. Please contact your supervisor.",
                status: 401,
                code: errorCodes.accountFreeze,
            }))
        }

        const otpRow = await getOTPRowByEmail(email)

        if (otpRow!.error >= 5) return next(createHttpErrors({
            message: "Your request is over-limit. Please try again.",
            status: 400,
            code: errorCodes.attack,
        }))

        const isExpired = moment().diff(otpRow!.updatedAt) > 10 * 60 * 1000;

        if (isExpired) {
            return next(createHttpErrors({
                message: "Session Timeout. Please try again.",
                status: 401,
                code: errorCodes.otpExpired
            }))
        }

        if (otpRow!.verifyToken !== token) {
            const otpData = {
                error: 5
            }
            await updateOTP(otpRow!.id, otpData)

            return next(createHttpErrors({
                message: "Invalid Token.",
                status: 400,
                code: errorCodes.attack
            }))
        }

        const hashedPassword = await generateHashedValue(password)
        const rndToken = "@TODO://"

        const userData = {
            password: hashedPassword,
            rndToken
        }

        await updateEmployeeData(emp!.id, userData)

        const accessTokenPayload = { id: emp!.id }
        const refreshTokenPayload = { id: emp!.id, email: emp!.email, role: emp!.role }

        const accessToken = jwt.sign(
            accessTokenPayload,
            process.env.ACCESS_TOKEN_SECRET!,
            { expiresIn: '15m' }
        )

        const refreshToken = jwt.sign(
            refreshTokenPayload,
            process.env.REFRESH_TOKEN_SECRET!,
            { expiresIn: '7d' }
        )

        const updatedData = {
            rndToken: refreshToken
        }

        const updatedEmp = await updateEmployeeData(emp!.id, updatedData)

        res.cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 15,
            path: '/'
        }).cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 1000 * 60 * 60 * 24 * 30,
            path: '/'
        }).status(200).json({
            message: "Successfully reset password.",
            empId: updatedEmp.id
        })
    }
]

export const authCheck = async (req: CustomRequest, res: Response, next: NextFunction) => {
    const empId = req.employeeId

    const emp = await getEmployeeById(empId!)
    checkEmployeeIfNotExits(emp)

    res.status(200).json({
        message: "You are authenticated employee.",
    })
}
import { z } from "zod";

export const LogInSchema = z.object({
    email: z.string()
        .min(1, { message: "Email is required" })
        .regex(/^[a-zA-Z0-9._%+-]+@ata.it.th$/, { message: "Email must be from @ata.it.th domain" }),
    password: z.string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 digit" })
        .regex(/^\d+$/, "Password must be numbers")
})

export const RegisterSchema = z.object({
    email: z.string()
        .min(1, { message: "Email is required" })
        .regex(/^[a-zA-Z0-9._%+-]+@ata.it.th$/, { message: "Email must be from @ata.it.th domain" }),
})

export const OTPSchema = z.object({
    otp: z.string().min(6, {
        message: "Your OTP must be 6 characters.",
    }),
})

export const ConfirmPasswordSchema = z.object({
    password: z.string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .regex(/^\d+$/, "Password must be numbers"),
    confirmPassword: z.string()
        .min(1, { message: "Confirm password is required" })
        .min(8, { message: "Confirm password must be at least 8 characters" })
        .regex(/^\d+$/, "Password must be numbers")
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

const EMP_ROLES = ["EMPLOYEE", "ADMIN", "SUPERADMIN"] as const;
const EMP_JOB_TYPES = ["FULLTIME", "PARTTIME", "CONTRACT", "INTERNSHIP"] as const;

export const createEmpSchema = z.object({
    email: z.string()
        .min(1, { message: "Email is required" })
        .regex(/^[a-zA-Z0-9._%+-]+@ata-it-th$/, { message: "Email must be from @ata.it.th domain" }),
    password: z.string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 digit" })
        .regex(/^\d+$/, "Password must be numbers"),
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "First name is required"),
    phone: z.string().regex(/^\d{9,11}$/, "Phone number must be 9 to 11 digits"),
    department: z.string().min(1, { message: "Department is required" }),
    position: z.string().min(1, { message: "Position is required" }),
    role: z.enum(EMP_ROLES, { message: "Role is required" }),
    jobType: z.enum(EMP_JOB_TYPES, { message: "Job type is required" }),
    image: z.any().optional(),
});

export const updateEmpSchema = createEmpSchema.omit({ email: true, password: true }).extend({
    accType: z.enum(["ACTIVE", "FREEZE"], { message: "Account type is required" })
});
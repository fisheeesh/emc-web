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

const EMP_POSITIONS = ["Intern", "Junior Developer", "Developer", "Senior Developer", "Team Lead"] as const;
const EMP_ROLES = ["Employee", "Manager", "HR", "Admin", "Super Admin"] as const;
const EMP_JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;

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
    image: z.any().optional(),
    department: z.string({ message: "Department is required" }),
    position: z.enum(EMP_POSITIONS, { message: "Position is required" }),
    role: z.enum(EMP_ROLES, { message: "Role is required" }),
    jobType: z.enum(EMP_JOB_TYPES, { message: "Job type is required" }),
    accType: z.enum(EMP_JOB_TYPES, { message: "Account type is required" }),
});
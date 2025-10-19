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
const WORKSTYLES = ["ONSITE", "REMOTE", "HYBRID", "WFH"] as const;
const GENDER = ["MALE", "FEMALE", "PERFER_NOT_TO_SAY"] as const;

export const createEmpSchema = z.object({
    email: z.string()
        .min(1, { message: "Email is required" })
        .regex(/^[a-zA-Z0-9._%+-]+@ata.it.th$/, { message: "Email must be from @ata.it.th domain" }),
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
    gender: z.enum(GENDER, { message: "Gender is required" }),
    birthdate: z.string().min(1, { message: "Birthdate is required" }),
    workStyle: z.enum(WORKSTYLES, { message: "Work style is required" }),
    country: z.string().min(1, { message: "Country is required" }),
    jobType: z.enum(EMP_JOB_TYPES, { message: "Job type is required" }),
    avatar: z.any().optional(),
});

export const updateEmpSchema = createEmpSchema.omit({ email: true, password: true }).extend({
    accType: z.enum(["ACTIVE", "FREEZE"], { message: "Account type is required" })
});

const ACTION_TYPES = ["One-on-One Meeting", "Email Follow-up", "Workload Review", "Mental Health Support", "Team Support"] as const
const PRIORITY = ["HIGH", "MEDIUM", "LOW"] as const
const STATUS = ["PENDING", "APPROVED", "REJECTED"] as const

export const actionFormSchema = z.object({
    quickAction: z.string().optional(),
    actionType: z.enum(ACTION_TYPES, { message: "Action Type is required" }),
    priority: z.enum(PRIORITY, { message: "Priority is required" }),
    assignTo: z.string().min(1, { message: "Assign To is required" }),
    dueDate: z.string().min(1, { message: "Due Date is required" }),
    actionNotes: z.string().min(30, { message: "Action notes must be at least thirty characters long." }),
    followUpNotes: z.string().min(30, { message: "Action notes must be at least thirty characters long." }),
})

export const updateActionFormSchema = z.object({
    status: z.enum(STATUS, { message: "Status is required" }),
    suggestions: z.string().min(5, { message: "Action notes must be at least five characters long." }),
}).refine(data => data.status !== "PENDING", {
    message: "Status must be either Approved or Rejected",
    path: ["status"]
})
import { z } from "zod";

export const LogInSchema = z.object({
    // email: z.string()
    //     .min(1, { message: "Email is required" })
    //     .regex(/^[a-zA-Z0-9._%+-]+@ata.it.th$/, { message: "Email must be from @ata.it.th domain" }),
    email: z.string()
        .min(1, { message: "Email is required" })
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: "Invalid email format" }),
    password: z.string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 digit" })
        .regex(/^\d+$/, "Password must be numbers"),
    // password: z.string()
    //     .min(1, { message: "Password is required" })
    //     .min(8, { message: "Password must be at least 8 characters" })
    //     .max(16, { message: "Password must be at most 16 characters" })
    //     .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    //     .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    //     .regex(/\d/, { message: "Password must contain at least one number" })
    //     .regex(/[@$!%*?&#^()_+=\-[\]{}|\\:;"'<>,.?/~`]/, { message: "Password must contain at least one special character" }),
})

export const ForgotPasswordSchema = z.object({
    // email: z.string()
    //     .min(1, { message: "Email is required" })
    //     .regex(/^[a-zA-Z0-9._%+-]+@ata.it.th$/, { message: "Email must be from @ata.it.th domain" }),
    email: z.string()
        .min(1, { message: "Email is required" })
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: "Invalid email format" }),
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
        .max(16, { message: "Password must be at most 16 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/\d/, { message: "Password must contain at least one number" })
        .regex(/[@$!%*?&#^()_+=\-[\]{}|\\:;"'<>,.?/~`]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .max(16, { message: "Password must be at most 16 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/\d/, { message: "Password must contain at least one number" })
        .regex(/[@$!%*?&#^()_+=\-[\]{}|\\:;"'<>,.?/~`]/, { message: "Password must contain at least one special character" })
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
})

const EMP_ROLES = ["EMPLOYEE", "ADMIN", "SUPERADMIN"] as const;
const EMP_JOB_TYPES = ["FULLTIME", "PARTTIME", "CONTRACT", "INTERNSHIP"] as const;
const WORKSTYLES = ["ONSITE", "REMOTE", "HYBRID", "WFH"] as const;
const GENDER = ["MALE", "FEMALE", "PERFER_NOT_TO_SAY"] as const;

export const createEmpSchema = z.object({
    // email: z.string()
    //     .min(1, { message: "Email is required" })
    //     .regex(/^[a-zA-Z0-9._%+-]+@ata.it.th$/, { message: "Email must be from @ata.it.th domain" }),
    email: z.string()
        .min(1, { message: "Email is required" })
        .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, { message: "Invalid email format" }),
    password: z.string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .max(16, { message: "Password must be at most 16 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/\d/, { message: "Password must contain at least one number" })
        .regex(/[@$!%*?&#^()_+=\-[\]{}|\\:;"'<>,.?/~`]/, { message: "Password must contain at least one special character" }),
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
    actionNotes: z.string().min(30, { message: "Action notes must be at least thirty characters long" }),
    followUpNotes: z.string().min(30, { message: "Action notes must be at least thirty characters long" }),
})

export const updateActionFormSchema = z.object({
    status: z.enum(STATUS, { message: "Status is required" }),
    suggestions: z.string().min(5, { message: "Action notes must be at least five characters long" }),
}).refine(data => data.status !== "PENDING", {
    message: "Status must be either Approved or Rejected",
    path: ["status"]
})

export const createDepartmentSchema = z.object({
    name: z.string().min(1, { message: "Department Name is required" }),
    description: z.string().min(1, { message: "Department Description is required" }),
})

export const updateDepartmentSchema = createDepartmentSchema.extend({
    status: z.enum(["ACTIVE", "INACTIVE"], { message: "Department Status is required" })
})

export const credentialSchema = z.object({
    editType: z.enum(["email", "password"], {
        message: "Please select what you want to edit",
    }),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    newPassword: z.string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 characters" })
        .max(16, { message: "Password must be at most 16 characters" })
        .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
        .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
        .regex(/\d/, { message: "Password must contain at least one number" })
        .regex(/[@$!%*?&#^()_+=\-[\]{}|\\:;"'<>,.?/~`]/, { message: "Password must contain at least one special character" })
        .optional().or(z.literal("")),
    confirmPassword: z.string().optional().or(z.literal("")),
}).refine((data) => {
    if (data.editType === "email") {
        return data.email && data.email.length > 0;
    }
    return true;
}, {
    message: "Email is required",
    path: ["email"],
}).refine((data) => {
    if (data.editType === "password") {
        return data.newPassword && data.newPassword.length >= 8;
    }
    return true;
}, {
    message: "New password is required",
    path: ["newPassword"],
}).refine((data) => {
    if (data.editType === "password") {
        return data.newPassword === data.confirmPassword;
    }
    return true;
}, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

export const announcementFormSchema = z.object({
    subject: z.string().min(1, "Subject is required"),
    body: z.string().min(1, "Message body is required"),
    images: z.array(z.instanceof(File)).optional(),
})
import { z } from "zod";

export const LogInSchema = z.object({
    email: z.string()
        .min(1, { message: "Email is required" })
        .regex(/^[a-zA-Z0-9._%+-]+@ata-it-th$/, { message: "Email must be from @ata.it.th domain" }),
    password: z.string()
        .min(1, { message: "Password is required" })
        .min(8, { message: "Password must be at least 8 digit" })
        .regex(/^\d+$/, "Password must be numbers")
})
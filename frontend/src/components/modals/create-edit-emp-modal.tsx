import { DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "../ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import z from "zod";
import { UserCheck } from "lucide-react";

const EMP_POSITIONS = ["Intern", "Junior Developer", "Developer", "Senior Developer", "Team Lead"] as const;
const EMP_ROLES = ["Employee", "Manager", "HR", "Admin", "Super Admin"] as const;
const EMP_JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;

const formSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    name: z.string().min(2, "Name is too short"),
    image: z
        .any()
        .refine(
            (file) => !file || file instanceof File || (Array.isArray(file) && file[0] instanceof File),
            "Invalid file"
        )
        .optional(),
    department: z.string(),
    position: z.enum(EMP_POSITIONS),
    role: z.enum(EMP_ROLES),
    jobType: z.enum(EMP_JOB_TYPES),
});

export default function CreateEditEmpModal() {
    const form = useForm({
        resolver: zodResolver(formSchema),
    });

    const onHandleSubmit: SubmitHandler<z.infer<typeof formSchema>> = async (values) => {
        console.log(values)
    }

    return (
        <DialogContent className="w-full mx-auto max-h-[90vh] overflow-y-auto sm:max-w-[800px] no-scrollbar">
            <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <UserCheck className="text-blue-600" />
                    Take Action for Emp
                </DialogTitle>
                <DialogDescription>
                    Choose appropriate actions to support this employee's wellbeing
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form
                    className="space-y-4"
                    onSubmit={form.handleSubmit(onHandleSubmit)}
                >
                    {/* Email */}
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input placeholder="name@company.com" {...field} className="min-h-[44px]" disabled />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input placeholder="name@company.com" {...field} className="min-h-[44px]" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Name */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} className="min-h-[44px]" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Image */}
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Profile Image</FormLabel>
                                <FormControl>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        {...field} className="min-h-[44px]"
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Position */}
                    <div className="flex flex-col lg:flex-row items-center gap-2 w-full">
                        <div className="w-full lg:w-1/2">
                            <FormField
                                control={form.control}
                                name="position"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Position</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl className="w-full">
                                                <SelectTrigger className="w-full min-h-[44px]">
                                                    <SelectValue placeholder="Select position" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {EMP_POSITIONS.map((p) => (
                                                    <SelectItem key={p} value={p}>
                                                        {p}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="w-full lg:w-1/2">
                            <FormField
                                control={form.control}
                                name="department"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Department</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl className="w-full">
                                                <SelectTrigger className="w-full min-h-[44px]">
                                                    <SelectValue placeholder="Select department" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {EMP_POSITIONS.map((p) => (
                                                    <SelectItem key={p} value={p}>
                                                        {p}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    {/* Role */}
                    <div className="flex flex-col lg:flex-row items-center gap-2">
                        <div className="w-full lg:w-1/2">
                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl className="w-full">
                                                <SelectTrigger className="w-full min-h-[44px]">
                                                    <SelectValue placeholder="Select role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {EMP_ROLES.map((r) => (
                                                    <SelectItem key={r} value={r}>
                                                        {r}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Job Type */}
                        <div className="w-full lg:w-1/2">
                            <FormField
                                control={form.control}
                                name="jobType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Job Type</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl className="w-full">
                                                <SelectTrigger className="w-full min-h-[44px]">
                                                    <SelectValue placeholder="Select job type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {EMP_JOB_TYPES.map((j) => (
                                                    <SelectItem key={j} value={j}>
                                                        {j}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2">
                        <DialogClose asChild>
                            <Button variant="outline" type="button">
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" className="bg-brand hover:bg-blue-600 cursor-pointer text-white">
                            Submit
                        </Button>
                    </div>
                </form>
            </Form>
        </DialogContent>
    )
}

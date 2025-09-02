import { DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "../ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import z from "zod";
import { UserCheck } from "lucide-react";
import { useRef } from "react";
import { createEmpSchema } from "@/lib/validators";

const EMP_POSITIONS = ["Intern", "Junior Developer", "Developer", "Senior Developer", "Team Lead"] as const;
const EMP_ROLES = ["Employee", "Manager", "HR", "Admin", "Super Admin"] as const;
const EMP_JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"] as const;

export default function CreateEditEmpModal() {
    const fileInputRef = useRef<HTMLInputElement>(null)


    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
            firstName: "",
            lastName: "",
            image: null,
            department: "",
            position: "Intern",
            role: "Employee",
            jobType: "Contract",
        },
        resolver: zodResolver(createEmpSchema),
    });

    const onHandleSubmit: SubmitHandler<z.infer<typeof createEmpSchema>> = async (values) => {
        console.log(values)
    }

    const getFileName = () => {
        const file = fileInputRef.current?.files?.[0]
        return file ? file.name : "No file chosen"
    }

    const isWorking = form.formState.isSubmitting

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
                    <div className="flex flex-col lg:flex-row items-center gap-2">
                        <div className="w-full lg:w-1/2">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl>
                                            <Input type="email" placeholder="name@company.com" {...field} className="min-h-[44px]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="w-full lg:w-1/2">
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type="password" placeholder="name@company.com" {...field} className="min-h-[44px]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-4">
                        <div className="w-full lg:w-1/2">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>First Name</FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="John Doe" {...field} className="min-h-[44px]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="w-full lg:w-1/2">
                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Last Name</FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="John Doe" {...field} className="min-h-[44px]" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center gap-4 w-full">
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

                    <div className="flex flex-col lg:flex-row items-center gap-4">
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

                    <div className="flex flex-col lg:flex-row items-center gap-4">
                        <div className="w-full lg:w-1/2">
                            <FormField
                                control={form.control}
                                name="accType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Account Status</FormLabel>
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
                        <div className="w-full lg:w-1/2">
                            <FormField
                                control={form.control}
                                name="image"
                                render={() => (
                                    <FormItem>
                                        <FormLabel>Avatar Image</FormLabel>
                                        <FormControl>
                                            <div className="w-full">
                                                <label className="inline-block text-white font-medium px-4 py-1.5 rounded-md cursor-pointer transition bg-brand hover:bg-own-hover">
                                                    Choose File
                                                    <Input
                                                        ref={fileInputRef}
                                                        disabled={isWorking}
                                                        accept="image/*"
                                                        type="file"
                                                        className="hidden"
                                                        onChange={() => {
                                                            //* Force re-render to update the file name display
                                                            form.setValue('image', getFileName())
                                                        }}
                                                    />
                                                </label>
                                                <span className="ml-3 text-sm">
                                                    {getFileName()}
                                                </span>
                                            </div>
                                        </FormControl>
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

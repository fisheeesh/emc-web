/* eslint-disable @typescript-eslint/no-explicit-any */
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "../ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type ControllerRenderProps, type DefaultValues, type Path, type SubmitHandler } from "react-hook-form";
import z from "zod";
import { useRef, useState } from "react";
import { FaUserPen, FaUserPlus } from "react-icons/fa6"
import Spinner from "../shared/spinner";
import { Eye, EyeOff } from "lucide-react";
import useEditEmp from "@/hooks/use-edit-emp";
import useCreateEmp from "@/hooks/use-create-emp";

interface CreateEditUserModalProps<T extends z.ZodType<any, any, any>> {
    formType: "CREATE" | "EDIT",
    userId?: number,
    schema: T,
    defaultValues: z.infer<T>,
    onClose?: () => void;
}

export default function CreateEditEmpModal<T extends z.ZodType<any, any, any>>({
    formType,
    userId,
    schema,
    defaultValues,
    onClose,
    ...props
}: CreateEditUserModalProps<T>) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    type FormData = z.infer<T>

    const { createEmp, creatingEmp } = useCreateEmp();
    const { editEmp, editingEmp } = useEditEmp()

    const [showPassword, setShowPassword] = useState(false);

    const form = useForm({
        resolver: zodResolver(schema) as any,
        defaultValues: defaultValues as DefaultValues<FormData>,
    })

    const getFileName = () => {
        const file = fileInputRef.current?.files?.[0]
        return file ? file.name : "No file chosen"
    }

    const onHandleSubmit: SubmitHandler<FormData> = async (values) => {
        const formData = new FormData()

        formData.append("firstName", values.firstName)
        formData.append("lastName", values.lastName)
        formData.append("phone", values.phone)
        formData.append("position", values.position)
        formData.append("role", values.role)
        formData.append('jobType', values.jobType)
        formData.append("department", values.department)

        //* Check if a file was selected
        if (fileInputRef.current?.files?.[0]) {
            formData.append("avatar", fileInputRef.current.files[0])
        }

        if (formType === 'CREATE') {
            formData.append("email", values.email)
            formData.append("password", values.password)

            console.log(Object.fromEntries(formData))

            createEmp(formData, {
                onSettled: () => {
                    form.reset()
                    onClose?.()
                }
            })
        } else {
            formData.append("id", String(userId))
            formData.append("accType", values.accType)

            editEmp(formData, {
                onSettled: () => {
                    form.reset()
                    onClose?.()
                }
            })
        }
    }

    const buttonText = formType === 'CREATE' ? 'Create New Employee' : 'Save Changes'

    const isWorking = form.formState.isSubmitting || creatingEmp || editingEmp

    return (
        <DialogContent className="w-full mx-auto max-h-[90vh] overflow-y-auto sm:max-w-[800px] no-scrollbar" {...props}>
            <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    {formType === 'CREATE' ? <FaUserPlus /> : <FaUserPen />}
                    {formType === 'CREATE' ? 'Create a new Employee' : "Edit Employee Information"}
                </DialogTitle>
                <DialogDescription>
                    {formType === 'CREATE' ? 'Fill in the details to add a new employee.' : "Update the employee information and save changes."}
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form
                    className="space-y-6"
                    onSubmit={form.handleSubmit(onHandleSubmit)}
                >
                    <div className="grid md:grid-cols-2 gap-4">
                        {
                            Object.keys(defaultValues).map(field => (
                                <FormField
                                    key={field}
                                    control={form.control}
                                    name={field as Path<FormData>}
                                    render={({ field }: { field: ControllerRenderProps<FormData, Path<FormData>> }) => (
                                        <FormItem className="grid gap-3">
                                            <div className="flex items-center gap-1 justify-between">
                                                <FormLabel>
                                                    {field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                                                    <span className="text-red-600 font-en">*</span>
                                                </FormLabel>
                                            </div>
                                            <FormControl>
                                                {
                                                    field.name === "accType" ? (
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                        >
                                                            <SelectTrigger className="min-h-[44px] w-full">
                                                                <SelectValue placeholder="Select status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="ACTIVE">Active</SelectItem>
                                                                <SelectItem value="FREEZE">Freeze</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    ) :
                                                        field.name === "role" ? (
                                                            <Select
                                                                onValueChange={field.onChange}
                                                                defaultValue={field.value}
                                                            >
                                                                <SelectTrigger className="min-h-[44px] w-full">
                                                                    <SelectValue placeholder="Select role" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="EMPLOYEE">Employee</SelectItem>
                                                                    <SelectItem value="ADMIN">Admin</SelectItem>
                                                                    <SelectItem value="SUPERADMIN">Super Admin</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        ) :
                                                            field.name === "jobType" ? (
                                                                <Select
                                                                    onValueChange={field.onChange}
                                                                    defaultValue={field.value}
                                                                >
                                                                    <SelectTrigger className="min-h-[44px] w-full">
                                                                        <SelectValue placeholder="Select role" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="FULLTIME">Full-Time</SelectItem>
                                                                        <SelectItem value="PARTTIME">Part-Time</SelectItem>
                                                                        <SelectItem value="CONTRACT">Contract</SelectItem>
                                                                        <SelectItem value="INTERNSHIP">Internship</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            ) :
                                                                field.name === "avatar" ? (
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
                                                                                    //* Set the actual File object as the value for the image field
                                                                                    const file = fileInputRef.current?.files?.[0] ?? null;
                                                                                    form.setValue('image' as Path<FormData>, file as any);
                                                                                }}
                                                                            />
                                                                        </label>
                                                                        <span className="ml-3 text-sm">
                                                                            {getFileName()}
                                                                        </span>
                                                                    </div>
                                                                ) : (
                                                                    <div className="relative">
                                                                        <Input
                                                                            className={`min-h-[44px] placeholder:font-raleway ${field.name === 'password' || field.name === 'phone' ? 'font-en' : ''}`}
                                                                            placeholder={`Enter ${field.name}`}
                                                                            disabled={isWorking}
                                                                            type={field.name === 'password' ? showPassword ? 'text' : 'password' : 'text'}
                                                                            {...field}
                                                                        />
                                                                        {(field.name === 'password' || field.name === 'confirmPassword') && (
                                                                            <button
                                                                                type="button"
                                                                                onClick={() =>
                                                                                    setShowPassword(prev => !prev)
                                                                                }
                                                                                className="absolute cursor-pointer right-3 top-3.5 text-muted-foreground"
                                                                            >
                                                                                {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                )}
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))
                        }
                    </div>
                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 font-semibold hover:from-pink-500 hover:via-purple-500 hover:to-blue-400 transition-colors duration-300 w-fit text-white flex items-center gap-2 cursor-pointer"
                            disabled={isWorking}
                        >
                            <Spinner
                                isLoading={isWorking}
                                label={buttonText === 'Create New Employee' ? 'Creating...' : 'Editing...'}>
                                {buttonText}
                            </Spinner>
                        </Button>
                    </div>
                </form>
            </Form>
        </DialogContent>
    )
}

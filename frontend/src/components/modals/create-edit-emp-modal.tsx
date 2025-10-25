/* eslint-disable @typescript-eslint/no-explicit-any */
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useCreateEmp from "@/hooks/emps/use-create-emp";
import useEditEmp from "@/hooks/emps/use-edit-emp";
import { cn } from "@/lib/utils";
import useCountryStore from "@/store/country-store";
import useFilterStore from "@/store/filter-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDownIcon, Eye, EyeOff } from "lucide-react";
import { useRef, useState } from "react";
import { useForm, type ControllerRenderProps, type DefaultValues, type Path, type SubmitHandler } from "react-hook-form";
import { FaUserPen, FaUserPlus } from "react-icons/fa6";
import { GoArrowSwitch } from "react-icons/go";
import z from "zod";
import Spinner from "../shared/spinner";
import { Button } from "../ui/button";
import { Calendar } from "../ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

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

    const { filters } = useFilterStore()
    const { countries } = useCountryStore()
    const [isCustomDepartment, setIsCustomDepartment] = useState(false);
    const { createEmp, creatingEmp } = useCreateEmp();
    const { editEmp, editingEmp } = useEditEmp()

    const [showPassword, setShowPassword] = useState(false);
    const [open, setOpen] = useState(false)
    const [selectedFileName, setSelectedFileName] = useState<string>("No file chosen");

    const form = useForm({
        resolver: zodResolver(schema) as any,
        defaultValues: defaultValues as DefaultValues<FormData>,
    })

    const onHandleSubmit: SubmitHandler<FormData> = async (values) => {
        const formData = new FormData()

        formData.append("firstName", values.firstName)
        formData.append("lastName", values.lastName)
        formData.append("phone", values.phone)
        formData.append("position", values.position)
        formData.append("role", values.role)
        formData.append('jobType', values.jobType)
        formData.append("department", values.department)
        formData.append("gender", values.gender)
        formData.append("birthdate", values.birthdate)
        formData.append("workStyle", values.workStyle)
        formData.append("country", values.country)

        //* Check if a file was selected
        if (fileInputRef.current?.files?.[0]) {
            formData.append("avatar", fileInputRef.current.files[0])
        }

        if (formType === 'CREATE') {
            formData.append("email", values.email)
            formData.append("password", values.password)

            createEmp(formData, {
                onSettled: () => {
                    form.reset()
                    setSelectedFileName("No file chosen")
                    onClose?.()
                }
            })
        } else {
            formData.append("id", String(userId))
            formData.append("accType", values.accType)

            editEmp(formData, {
                onSettled: () => {
                    form.reset()
                    setSelectedFileName("No file chosen")
                    onClose?.()
                }
            })
        }
    }

    const buttonText = formType === 'CREATE' ? 'Create New Employee' : 'Save Changes'

    const isWorking = form.formState.isSubmitting || creatingEmp || editingEmp

    return (
        <DialogContent className="w-full mx-auto max-h-[95vh] overflow-y-auto sm:max-w-[850px] no-scrollbar" {...props}>
            <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    {formType === 'CREATE' ? <FaUserPlus /> : <FaUserPen />}
                    {formType === 'CREATE' ? 'Create a new Employee' : "Edit Employee Information"}
                </DialogTitle>
                <DialogDescription className="text-start">
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
                                                            disabled={isWorking}
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
                                                                disabled={isWorking}
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
                                                            field.name === "gender" ? (
                                                                <Select
                                                                    disabled={isWorking}
                                                                    onValueChange={field.onChange}
                                                                    defaultValue={field.value}
                                                                >
                                                                    <SelectTrigger className="min-h-[44px] w-full">
                                                                        <SelectValue placeholder="Select role" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="MALE">Male</SelectItem>
                                                                        <SelectItem value="FEMALE">Female</SelectItem>
                                                                        <SelectItem value="PREFER_NOT_TO_SAY">Prefer not to say</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            ) :
                                                                field.name === "workStyle" ? (
                                                                    <Select
                                                                        disabled={isWorking}
                                                                        onValueChange={field.onChange}
                                                                        defaultValue={field.value}
                                                                    >
                                                                        <SelectTrigger className="min-h-[44px] w-full">
                                                                            <SelectValue placeholder="Select role" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="ONSITE">Onsite</SelectItem>
                                                                            <SelectItem value="REMOTE">Remote</SelectItem>
                                                                            <SelectItem value="HYBRID">Hybrid</SelectItem>
                                                                            <SelectItem value="WFH">Work From Home</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                ) :
                                                                    field.name === "country" ? (
                                                                        <Select
                                                                            disabled={isWorking}
                                                                            onValueChange={field.onChange}
                                                                            defaultValue={field.value}
                                                                        >
                                                                            <SelectTrigger className="min-h-[44px] w-full">
                                                                                <SelectValue placeholder="Select role" />
                                                                            </SelectTrigger>
                                                                            <SelectContent className="w-full max-h-[350px]">
                                                                                <SelectGroup>
                                                                                    {countries ? (
                                                                                        countries.map((country: Filter) => (
                                                                                            <SelectItem
                                                                                                key={country.name}
                                                                                                value={country.value}
                                                                                                className="px-4 py-3"
                                                                                            >
                                                                                                {country.name}
                                                                                            </SelectItem>
                                                                                        ))
                                                                                    ) : (
                                                                                        <SelectItem value="No results found">No results found</SelectItem>
                                                                                    )}
                                                                                </SelectGroup>
                                                                            </SelectContent>
                                                                        </Select>
                                                                    ) :
                                                                        field.name === "birthdate" ? (
                                                                            <Popover open={open} onOpenChange={setOpen}>
                                                                                <PopoverTrigger asChild disabled={isWorking}>
                                                                                    <FormControl>
                                                                                        <Button
                                                                                            disabled={isWorking}
                                                                                            variant="outline"
                                                                                            className={cn(
                                                                                                "min-h-[48px] w-full justify-between font-normal",
                                                                                                !field.value ? "text-muted-foreground font-raleway" : "font-en",
                                                                                            )}
                                                                                        >
                                                                                            {field.value ? new Date(field.value).toLocaleDateString() : "Select date"}
                                                                                            <ChevronDownIcon className="h-4 w-4 opacity-50" />
                                                                                        </Button>
                                                                                    </FormControl>
                                                                                </PopoverTrigger>
                                                                                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                                                                    <Calendar
                                                                                        disabled={isWorking}
                                                                                        className="font-en"
                                                                                        mode="single"
                                                                                        selected={field.value ? new Date(field.value) : undefined}
                                                                                        onSelect={(selectedDate) => {
                                                                                            if (selectedDate) {
                                                                                                field.onChange(selectedDate.toISOString())
                                                                                            }
                                                                                            setOpen(false)
                                                                                        }}
                                                                                        captionLayout="dropdown"
                                                                                    />
                                                                                </PopoverContent>
                                                                            </Popover>
                                                                        ) :
                                                                            field.name === "jobType" ? (
                                                                                <Select
                                                                                    disabled={isWorking}
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
                                                                                field.name === "department" ? (
                                                                                    <div className="relative">
                                                                                        {isCustomDepartment ? (
                                                                                            <>
                                                                                                <Input
                                                                                                    className="min-h-[44px] placeholder:font-raleway pr-12"
                                                                                                    placeholder="Enter department name"
                                                                                                    disabled={isWorking}
                                                                                                    value={field.value}
                                                                                                    onChange={field.onChange}
                                                                                                />
                                                                                                <Button
                                                                                                    disabled={isWorking}
                                                                                                    size='sm'
                                                                                                    type="button"
                                                                                                    variant='outline'
                                                                                                    onClick={() => {
                                                                                                        setIsCustomDepartment(false);
                                                                                                        field.onChange('');
                                                                                                    }}
                                                                                                    className="absolute cursor-pointer right-2 top-1/2 -translate-y-1/2 text-xs"
                                                                                                    title="Switch back to select"
                                                                                                >
                                                                                                    <GoArrowSwitch />
                                                                                                </Button>
                                                                                            </>
                                                                                        ) : (
                                                                                            <Select
                                                                                                disabled={isWorking}
                                                                                                onValueChange={(value) => {
                                                                                                    if (value === "OTHER") {
                                                                                                        setIsCustomDepartment(true);
                                                                                                        field.onChange('');
                                                                                                    } else {
                                                                                                        field.onChange(value);
                                                                                                    }
                                                                                                }}
                                                                                                defaultValue={field.value}
                                                                                            >
                                                                                                <SelectTrigger className="min-h-[44px] w-full">
                                                                                                    <SelectValue placeholder="Select Department" />
                                                                                                </SelectTrigger>
                                                                                                <SelectContent>
                                                                                                    {filters.departments.slice(1, filters.departments.length).map(dep => (
                                                                                                        <SelectItem value={dep.name} key={dep.name}>
                                                                                                            {dep.name}
                                                                                                        </SelectItem>
                                                                                                    ))}
                                                                                                    <SelectItem value="OTHER" className="font-semibold text-brand hover:text-brand!">
                                                                                                        + Other (Type manually)
                                                                                                    </SelectItem>
                                                                                                </SelectContent>
                                                                                            </Select>
                                                                                        )}
                                                                                    </div>
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
                                                                                                        //* Update the selected file name
                                                                                                        setSelectedFileName(file ? file.name : "No file chosen");
                                                                                                    }}
                                                                                                />
                                                                                            </label>
                                                                                            <span className="ml-3 text-sm">
                                                                                                {selectedFileName}
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
                            className="bg-gradient w-fit flex items-center gap-2 cursor-pointer text-white"
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
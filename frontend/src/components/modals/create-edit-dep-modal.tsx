/* eslint-disable @typescript-eslint/no-explicit-any */
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import useCreateDep from "@/hooks/dep/use-create-dep";
import useUpdateDep from "@/hooks/dep/use-update-dep";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type DefaultValues, type Path, type SubmitHandler } from "react-hook-form";
import { MdAddBusiness, MdEditNote } from "react-icons/md";
import z from "zod";
import Spinner from "../shared/spinner";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

interface CreateEditDepartmentModalProps<T extends z.ZodType<any, any, any>> {
    formType: "CREATE" | "EDIT";
    departmentId?: number;
    schema: T;
    defaultValues: z.infer<T>;
    onClose?: () => void;
}

export default function CreateEditDepartmentModal<T extends z.ZodType<any, any, any>>({
    formType,
    departmentId,
    schema,
    defaultValues,
    onClose,
    ...props
}: CreateEditDepartmentModalProps<T>) {
    type FormData = z.infer<T>;
    const { createDep, creatingDep, } = useCreateDep()
    const { updateDep, updatingDep } = useUpdateDep()

    const form = useForm({
        resolver: zodResolver(schema) as any,
        defaultValues: defaultValues as DefaultValues<FormData>,
    });

    const onHandleSubmit: SubmitHandler<FormData> = async (values) => {
        if (formType === "CREATE") {
            createDep({
                name: values.name,
                description: values.description
            }, {
                onSettled: () => {
                    form.reset()
                    onClose?.()
                }
            })
        } else {
            updateDep({
                id: departmentId,
                name: values.name,
                description: values.description,
                status: values.status
            }, {
                onSettled: () => {
                    form.reset()
                    onClose?.()
                }
            })
        }
    };

    const buttonText = formType === "CREATE" ? "Create Department" : "Save Changes";
    const isWorking = form.formState.isSubmitting || creatingDep || updatingDep

    return (
        <DialogContent className="sm:max-w-[600px]" {...props}>
            <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    {formType === "CREATE" ? <MdAddBusiness /> : <MdEditNote />}
                    {formType === "CREATE" ? "Create a new Department" : "Edit Department Information"}
                </DialogTitle>
                <DialogDescription className="text-start">
                    {formType === "CREATE"
                        ? "Add a new department to your organization"
                        : "Update department information and settings"}
                </DialogDescription>
            </DialogHeader>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onHandleSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        {Object.keys(defaultValues).map((key) => (
                            <FormField
                                key={key}
                                control={form.control}
                                name={key as Path<FormData>}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="capitalize">
                                            {key.replace(/([A-Z])/g, ' $1').trim()}
                                        </FormLabel>
                                        <FormControl>
                                            {key === "description" ? (
                                                <Textarea
                                                    className="min-h-[100px] resize-none"
                                                    placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                                                    disabled={isWorking}
                                                    {...field}
                                                />
                                            ) : key === "status" ? (
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    disabled={isWorking}
                                                >
                                                    <SelectTrigger className="min-h-[44px]">
                                                        <SelectValue placeholder="Select status" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="ACTIVE">Active</SelectItem>
                                                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    className="min-h-[44px]"
                                                    placeholder={`Enter ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
                                                    disabled={isWorking}
                                                    {...field}
                                                />
                                            )}
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        ))}
                    </div>

                    <div className="flex justify-end">
                        <Button
                            type="submit"
                            className="bg-gradient w-fit text-white flex items-center gap-2 cursor-pointer"
                            disabled={isWorking}
                        >
                            <Spinner
                                isLoading={isWorking}
                                label={buttonText === "Create Department" ? "Creating..." : "Saving..."}
                            >
                                {buttonText}
                            </Spinner>
                        </Button>
                    </div>
                </form>
            </Form>
        </DialogContent>
    );
}
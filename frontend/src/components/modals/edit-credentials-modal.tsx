import { Button } from "@/components/ui/button";
import {
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { DialogClose } from "@radix-ui/react-dialog";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import Spinner from "../shared/spinner";
import { MdOutlineSecurity } from "react-icons/md";
import { credentialSchema } from "@/lib/validators";
import useEditCredentials from "@/hooks/emps/use-edit-credentials";

type CredentialFormValues = z.infer<typeof credentialSchema>;

interface EditCredentialsModalProps {
    user: {
        id: number;
        name: string;
        email: string;
    };
    onClose?: () => void;
}

export default function EditCredentialsModal({ user, onClose }: EditCredentialsModalProps) {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
    const { editCredentials, editingCredentials } = useEditCredentials()

    const form = useForm<CredentialFormValues>({
        resolver: zodResolver(credentialSchema),
        defaultValues: {
            editType: undefined,
            email: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    const editType = form.watch("editType");

    const handlePermissionResponse = (granted: boolean) => {
        if (granted) {
            setHasPermission(true);
        } else {
            setTimeout(() => {
                setHasPermission(null);
                form.reset();
            }, 300);
        }
    };

    const handleSubmit = (data: CredentialFormValues) => {
        editCredentials({
            editType: data.editType,
            id: user.id,
            email: data.email,
            password: data.newPassword
        }, {
            onSettled: () => {
                form.reset()
                onClose?.()
            }
        })
    };

    return (
        <DialogContent className="sm:max-w-[600px]">
            {hasPermission === null ? (
                <div className="space-y-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <MdOutlineSecurity />
                            Permission Required
                        </DialogTitle>
                        <DialogDescription className="text-start">
                            Before editing credentials for <span className="font-semibold text-foreground">{user.name}</span>
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-lg">
                        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                                Important Security Notice
                            </p>
                            <p className="text-sm text-amber-800 dark:text-amber-200">
                                To edit this employee's credentials, you must have their explicit permission.
                                Have you asked {user.name} for permission to modify their account credentials?
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 cursor-pointer min-h-[44px]"
                            >
                                No, I haven't asked yet
                            </Button>
                        </DialogClose>
                        <Button
                            type="button"
                            onClick={() => handlePermissionResponse(true)}
                            className="flex-1 cursor-pointer min-h-[44px] bg-gradient text-white"
                        >
                            Yes, I have permission
                        </Button>
                    </DialogFooter>
                </div>
            ) : (
                <div className="space-y-4">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold flex items-center gap-2">
                            <MdOutlineSecurity />
                            Edit Employee Credentials
                        </DialogTitle>
                        <DialogDescription className="text-start">
                            Update email or password for {user.name}. All changes will take effect immediately.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="editType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>What do you want to edit?</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="min-h-[44px] cursor-pointer">
                                                    <SelectValue placeholder="Select credential type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="min-h-[44px]">
                                                <SelectItem value="email">Email Address</SelectItem>
                                                <SelectItem value="password">Password</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email Address</FormLabel>
                                        <FormControl>
                                            <Input
                                                className="min-h-[44px] font-en"
                                                type="email"
                                                placeholder={user.email}
                                                disabled={editType !== "email" || editingCredentials}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex flex-col md:flex-row items-start gap-3">
                                <FormField
                                    control={form.control}
                                    name="newPassword"
                                    render={({ field }) => (
                                        <FormItem className="w-full md:w-1/2">
                                            <FormLabel>New Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        className="min-h-[44px] placeholder:font-raleway font-en pr-10"
                                                        type={showPassword[field.name] ? 'text' : 'password'}
                                                        placeholder="Enter new password"
                                                        disabled={editType !== "password" || editingCredentials}
                                                        {...field}
                                                    />
                                                    <button
                                                        disabled={editType !== "password" || editingCredentials}
                                                        type="button"
                                                        onClick={() =>
                                                            setShowPassword(prev => ({
                                                                ...prev,
                                                                [field.name]: !prev[field.name]
                                                            }))
                                                        }
                                                        className="absolute disabled:cursor-auto cursor-pointer right-3 top-3.5 text-muted-foreground"
                                                    >
                                                        {showPassword[field.name] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem className="w-full md:w-1/2">
                                            <FormLabel>Confirm Password</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        className="min-h-[44px] placeholder:font-raleway font-en pr-10"
                                                        type={showPassword[field.name] ? 'text' : 'password'}
                                                        placeholder="Confirm new password"
                                                        disabled={editType !== "password" || editingCredentials}
                                                        {...field}
                                                    />
                                                    <button
                                                        disabled={editType !== "password" || editingCredentials}
                                                        type="button"
                                                        onClick={() =>
                                                            setShowPassword(prev => ({
                                                                ...prev,
                                                                [field.name]: !prev[field.name]
                                                            }))
                                                        }
                                                        className="absolute disabled:cursor-auto cursor-pointer right-3 top-3.5 text-muted-foreground"
                                                    >
                                                        {showPassword[field.name] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <DialogFooter className="flex justify-end gap-3 pt-4">
                                <DialogClose asChild>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="min-h-[44px] cursor-pointer"
                                        disabled={editingCredentials}>
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button
                                    className="min-h-[44px] cursor-pointer bg-gradient text-white"
                                    type="submit"
                                    disabled={editingCredentials || !editType}>
                                    <Spinner isLoading={editingCredentials} label="Updating...">
                                        Update Changes
                                    </Spinner>
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </div>
            )}
        </DialogContent>
    );
}
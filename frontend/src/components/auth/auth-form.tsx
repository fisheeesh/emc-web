/* eslint-disable @typescript-eslint/no-explicit-any */
import { LOGIN, LOGIN_SUBTITLE, LOGIN_TITLE, REGISTER } from "@/lib/constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { useForm, type ControllerRenderProps, type DefaultValues, type Path, type SubmitHandler } from "react-hook-form";
import { Link, useActionData, useNavigation, useSubmit } from 'react-router';
import type { z } from "zod";
import Spinner from '../shared/spinner';
import { Button } from "../ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Input } from "../ui/input";
import useError from "@/hooks/ui/use-error";

interface AuthFormProps<T extends z.ZodType<any, any, any>> {
    formType: "LOGIN" | "REGISTER",
    schema: T,
    defaultValues: z.infer<T>,
}

export default function AuthForm<T extends z.ZodType<any, any, any>>({
    formType,
    schema,
    defaultValues,
    ...props
}: AuthFormProps<T>) {
    type FormData = z.infer<T>
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
    const navigation = useNavigation()
    const submit = useSubmit()

    const actionData = useActionData()

    const form = useForm({
        resolver: zodResolver(schema) as any,
        defaultValues: defaultValues as DefaultValues<FormData>,
    })

    const handleSubmit: SubmitHandler<FormData> = async (values) => {
        submit(values, {
            method: "POST",
            action: '/login'
        })
    }

    const buttonText = formType === 'LOGIN' ? LOGIN : REGISTER

    const isWorking = form.formState.isSubmitting || navigation.state === 'submitting'

    useError(actionData, actionData?.message)

    return (
        <div className="flex flex-col justify-center w-full px-8 space-y-5 right-side lg:w-1/3 max-w-md" {...props}>
            <div className="flex-col items-start hidden md:flex">
                <h1 className="text-3xl font-semibold tracking-wide">{LOGIN_TITLE}</h1>
                <h5 className="tracking-wide text-sm text-muted-foreground">{LOGIN_SUBTITLE}</h5>
            </div>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(handleSubmit)}>
                    <div className="flex flex-col gap-6">
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
                                                    {field.name === 'email' ? 'Email Address' :
                                                        field.name.charAt(0).toUpperCase() + field.name.slice(1)}
                                                    <span className="text-red-600 font-en">*</span>
                                                </FormLabel>
                                                {formType === 'LOGIN' && field.name === 'password' && <Link
                                                    to="/forgot-password"
                                                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                                >
                                                    Forgot password?
                                                </Link>}
                                            </div>
                                            <FormControl>
                                                <div className="relative">
                                                    <Input
                                                        disabled={isWorking}
                                                        className={'w-full min-h-[48px] placeholder:font-raleway font-en'}
                                                        placeholder={field.name === 'email' ? 'Email Address' : 'Password'}
                                                        inputMode="numeric"
                                                        type={(field.name === 'password' || field.name === 'confirmPassword') && showPassword[field.name] ? 'text' : (field.name === 'password' || field.name === 'confirmPassword') ? 'password' : 'text'}
                                                        {...field}
                                                    />
                                                    {(field.name === 'password' || field.name === 'confirmPassword') && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                setShowPassword(prev => ({
                                                                    ...prev,
                                                                    [field.name]: !prev[field.name]
                                                                }))
                                                            }
                                                            className="absolute cursor-pointer right-3 top-4 text-muted-foreground"
                                                        >
                                                            {showPassword[field.name] ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                        </button>
                                                    )}
                                                </div>
                                            </FormControl>
                                            {/* {field.name === 'email' && <FormDescription>Email must be from @ata.it.th domain</FormDescription>} */}
                                            {field.name === 'email' && <FormDescription>Email must be Google-registered</FormDescription>}
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))
                        }
                        <div className="flex flex-col gap-3">
                            <Button
                                type="submit"
                                className="w-full text-md min-h-[48px] bg-blue-500 dark:bg-blue-600 dark:hover:bg-blue-700 hover:bg-blue-600 text-white flex items-center gap-2 justify-center cursor-pointer"
                                disabled={isWorking}
                            >
                                <Spinner
                                    isLoading={isWorking}
                                    label={buttonText === 'Log In' ? 'Logging In...' : 'Signing Up...'}>
                                    {buttonText}
                                </Spinner>
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    )
}

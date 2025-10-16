import { Calendar } from "@/components/ui/calendar";
import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import useGenerateAIRecommendation from "@/hooks/use-generate-ai-recommendation";
import { cn } from "@/lib/utils";
import { actionFormSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import { type MDXEditorMethods } from "@mdxeditor/editor";
import { AlertTriangle, ChevronDownIcon, Calendar as ICalendar, Mail, MessageSquare, Phone } from "lucide-react";
import React, { useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { LiaBrainSolid } from "react-icons/lia";
import { MdAdminPanelSettings } from "react-icons/md";
import { toast } from "sonner";
import type z from "zod";
import Editor from "../editor";
import Spinner from "../shared/spinner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type QuickAction = {
    name: string;
    value: string;
    icon: React.ReactNode;
}

const QUICK_ACTIONS: QuickAction[] = [
    { name: "Schedule one-on-one Call", value: " Schedule 1-on-1 Call", icon: <Phone size={18} /> },
    { name: "Send Check-in Email", value: " Send Check-in Email", icon: <Mail size={18} /> },
    { name: "Book HR Meeting", value: " Book HR Meeting", icon: <ICalendar size={18} /> },
    { name: "Send Supportive Message", value: "Send Supportive Message", icon: <MessageSquare size={18} /> },
]

interface Props {
    employee: {
        id: number,
        name: string,
        department: string,
        contact: string,
        score: number
    }
}

export default function ActionModal({ employee }: Props) {
    const [open, setOpen] = React.useState(false)
    const { generateRecommendation, generating } = useGenerateAIRecommendation()

    const actionNotesEditorRef = useRef<MDXEditorMethods>(null);
    const followUpNotesEditorRef = useRef<MDXEditorMethods>(null);

    const form = useForm<z.infer<typeof actionFormSchema>>({
        resolver: zodResolver(actionFormSchema),
        defaultValues: {
            quickAction: undefined,
            actionType: "One-on-One Meeting",
            priority: "HIGH",
            assignTo: "",
            dueDate: "",
            actionNotes: "",
            followUpNotes: "",
        }
    })

    const handleAIRecommendation = async () => {
        try {
            const res = await generateRecommendation({ criticalEmpId: employee.id })

            if (res?.success && res?.data) {
                //* Use the editor ref to set markdown directly
                if (actionNotesEditorRef.current) {
                    actionNotesEditorRef.current.setMarkdown(res.data)
                }

                //* Also update the form value
                form.setValue('actionNotes', res.data)
                form.trigger('actionNotes')

                toast.success('Success', {
                    description: "AI recommendation has been generated successfully",
                })
            } else {
                toast.error('Error', {
                    description: res?.message || 'Failed to generate AI recommendation'
                })
            }
        } catch (error) {
            console.error("Error generating AI recommendation:", error)
            toast.error('Error', {
                description: (error instanceof Error) ? error.message : 'There was a problem generating AI recommendation'
            })
        }
    }

    const onSubmit: SubmitHandler<z.infer<typeof actionFormSchema>> = async (values) => {
        console.log(values)
    }

    return (
        <DialogContent className="w-full mx-auto max-h-[95vh] overflow-visible sm:max-w-[1200px] lg:px-8">
            <div className="max-h-[calc(90vh-2rem)] overflow-y-auto no-scrollbar">
                <DialogHeader>
                    <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                        <MdAdminPanelSettings className="text-blue-600 size-5 md:size-7" />
                        Create Action Plan for {employee?.name || 'Employee'}
                    </DialogTitle>
                    <DialogDescription className="text-xs md:text-sm">
                        Submit an action plan to support this employee's wellbeing. This will be sent to senior leadership for review and approval.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
                        {/* Employee Info Summary */}
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertTriangle className="text-red-600" size={20} />
                                <h3 className="font-semibold text-red-800">Employee Status</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-black">
                                <div>
                                    <span className="font-medium">Name:</span> {employee?.name}
                                </div>
                                <div>
                                    <span className="font-medium">Department:</span> {employee?.department}
                                </div>
                                <div>
                                    <span className="font-medium">Emotion Score:</span>
                                    <span className="text-red-600 font-bold ml-1 font-en">{employee?.score}</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <FormField
                            control={form.control}
                            name="quickAction"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="space-y-6">
                                        <FormLabel className="text-lg font-semibold">Quick Actions</FormLabel>
                                        <FormControl>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {
                                                    QUICK_ACTIONS.map(({ name, value, icon }) => (
                                                        <Button
                                                            key={value}
                                                            type="button"
                                                            onClick={() => {
                                                                if (field.value === value) {
                                                                    field.onChange(undefined)
                                                                } else {
                                                                    field.onChange(value)
                                                                }
                                                            }}
                                                            variant="outline"
                                                            className={cn(
                                                                field.value === value && "text-blue-700 hover:text-blue-700 border-blue-700 dark:border-blue-700",
                                                                "flex items-center gap-2 h-12 cursor-pointer"
                                                            )}
                                                        >
                                                            {icon}
                                                            {name}
                                                        </Button>
                                                    ))
                                                }
                                            </div>
                                        </FormControl>
                                    </div>
                                </FormItem>
                            )}
                        />

                        {/* Action Form */}
                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Custom Action Plan</h3>

                            <div className="flex flex-col md:flex-row gap-4 w-full">
                                <FormField
                                    control={form.control}
                                    name="actionType"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Action Type <span className="font-en text-red-600">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="min-h-[48px] w-full">
                                                        <SelectValue placeholder="Select action type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="One-on-One Meeting">One-on-One Meeting</SelectItem>
                                                    <SelectItem value="Email Follow-up">Email Follow-up</SelectItem>
                                                    <SelectItem value="Workload Review">Workload Review</SelectItem>
                                                    <SelectItem value="Mental Health Support">Mental Health Support</SelectItem>
                                                    <SelectItem value="Team Support">Team Support</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Priority Level <span className="font-en text-red-600">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value}>
                                                <FormControl>
                                                    <SelectTrigger className="min-h-[48px] w-full">
                                                        <SelectValue placeholder="Select priority" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="HIGH">High - Immediate</SelectItem>
                                                    <SelectItem value="MEDIUM">Medium - This Week</SelectItem>
                                                    <SelectItem value="LOW">Low - Monitor</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex flex-col md:flex-row gap-4 w-full">
                                <FormField
                                    control={form.control}
                                    name="assignTo"
                                    render={({ field }) => (
                                        <FormItem className="w-full md:w-1/2">
                                            <FormLabel>Assign To <span className="font-en text-red-600">*</span></FormLabel>
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className="min-h-[48px]"
                                                    placeholder="Manager, HR Representative, etc."
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="dueDate"
                                    render={({ field }) => (
                                        <FormItem className="w-full md:w-1/2">
                                            <FormLabel>Due Date <span className="font-en text-red-600">*</span></FormLabel>
                                            <Popover open={open} onOpenChange={setOpen}>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
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
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="actionNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-end justify-between">
                                            <FormLabel>Action Notes <span className="font-en text-red-600">*</span></FormLabel>
                                            <Button
                                                disabled={generating}
                                                onClick={handleAIRecommendation}
                                                type="button"
                                                className="relative flex items-center gap-1.5 min-h-[40px] cursor-pointer overflow-hidden bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 text-white font-semibold before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:animate-[shimmer_2s_ease-in-out_infinite] before:[animation-delay:0s]"
                                                style={{
                                                    animationTimingFunction: 'linear'
                                                }}
                                            >
                                                <Spinner isLoading={generating} label="Generating...">
                                                    <LiaBrainSolid className="size-4.5" /> Generate AI Recommendation
                                                </Spinner>
                                            </Button>
                                        </div>
                                        <FormControl>
                                            <div className="editor-wrapper">
                                                <Editor
                                                    ref={actionNotesEditorRef}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription>Describe the specific actions to be taken, observations, and any special considerations...</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="followUpNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Follow-up Instructions <span className="font-en text-red-600">*</span></FormLabel>
                                        <FormControl>
                                            <div className="editor-wrapper">
                                                <Editor
                                                    ref={followUpNotesEditorRef}
                                                    value={field.value}
                                                    onChange={field.onChange}
                                                />
                                            </div>
                                        </FormControl>
                                        <FormDescription>When and how to follow up on this action...</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end items-center gap-3 border-t pt-6 pb-2">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" className="min-h-[44px] cursor-pointer">
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] cursor-pointer">
                                Create Action Plan
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </DialogContent>
    )
}
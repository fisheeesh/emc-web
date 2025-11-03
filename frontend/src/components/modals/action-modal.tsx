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
import useCreateActionPlan from "@/hooks/action-plans/use-create-action-plan";
import useGenerateAIRecommendation from "@/hooks/ai/use-generate-ai-recommendation";
import { cn } from "@/lib/utils";
import { actionFormSchema } from "@/lib/validators";
import useUserStore from "@/store/user-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { type MDXEditorMethods } from "@mdxeditor/editor";
import { AlertTriangle, Calendar as CalendarIcon, CheckCircle2, ChevronDownIcon, Clock, Download, Mail, MessageSquare, Phone, User } from "lucide-react";
import React, { useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { FaRegThumbsUp } from "react-icons/fa";
import { LiaBrainSolid } from "react-icons/lia";
import { MdAdminPanelSettings, MdEventNote, MdFlag } from "react-icons/md";
import { toast } from "sonner";
import type z from "zod";
import Editor from "../editor";
import Preview from "../editor/preview";
import CustomBadge from "../shared/custom-badge";
import Spinner from "../shared/spinner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import useMarkAsCompleted from "@/hooks/action-plans/use-mark-as-completed";
import { GiGlassCelebration } from "react-icons/gi";
import moment from "moment";

type QuickAction = {
    name: string;
    value: string;
    icon: React.ReactNode;
}

const QUICK_ACTIONS: QuickAction[] = [
    { name: "Schedule one-on-one Call", value: "Schedule 1-on-1 Call", icon: <Phone size={18} /> },
    { name: "Send Check-in Email", value: "Send Check-in Email", icon: <Mail size={18} /> },
    { name: "Book HR Meeting", value: "Book HR Meeting", icon: <CalendarIcon size={18} /> },
    { name: "Send Supportive Message", value: "Send Supportive Message", icon: <MessageSquare size={18} /> },
]

interface Props {
    employee: {
        id: number,
        name: string,
        department: string,
        departmentId: number,
        contact: string,
        score: number
    },
    action?: ActionPlan
    onClose?: () => void;
}

export default function ActionModal({ employee, action, onClose }: Props) {
    const [open, setOpen] = React.useState(false)
    const { generateRecommendation, generating } = useGenerateAIRecommendation()
    const { createActionPlan, creatingActionPlan } = useCreateActionPlan()
    const { markAsCompleted, updatingAction } = useMarkAsCompleted()
    const { user } = useUserStore()

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
                if (actionNotesEditorRef.current) {
                    actionNotesEditorRef.current.setMarkdown(res.data)
                }

                form.setValue('actionNotes', res.data)
                form.trigger('actionNotes')

                toast.success('Success', {
                    description: "AI recommendation has been generated.",
                })
            } else {
                toast.error('Error', {
                    description: res?.message || 'Failed to generate AI recommendation.'
                })
            }
        } catch (error) {
            console.error("Error generating AI recommendation:", error)
            toast.error('Error', {
                description: (error instanceof Error) ? error.message : 'There was a problem generating AI recommendation.'
            })
        }
    }

    const onSubmit: SubmitHandler<z.infer<typeof actionFormSchema>> = async (values) => {
        createActionPlan({
            criticalEmpId: employee.id,
            depId: employee.departmentId,
            contact: user!.email,
            quickAction: values.quickAction,
            actionType: values.actionType,
            priority: values.priority,
            assignTo: values.assignTo,
            dueDate: values.dueDate,
            actionNotes: values.actionNotes,
            followUpNotes: values.followUpNotes,
        }, {
            onSettled: () => {
                form.reset()
                onClose?.()
            }
        })
    }

    const onMarkAsCompleted = (actionPlanId: string) => {
        markAsCompleted(actionPlanId, {
            onSettled: () => {
                onClose?.()
            }
        })
    }

    const isWorking = form.formState.isSubmitting || creatingActionPlan

    if (action) {
        return (
            <DialogContent className="w-full mx-auto max-h-[95vh] overflow-visible sm:max-w-[1200px] lg:px-8">
                <div className="max-h-[calc(90vh-2rem)] overflow-y-auto no-scrollbar">
                    <DialogHeader className="flex flex-col md:flex-row items-start justify-between space-y-0 pb-5 border-b">
                        <div className="space-y-1.5">
                            <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                                <CheckCircle2 className="text-green-600 size-5 md:size-7" />
                                Action Plan Details - {employee?.name || 'Employee'}
                            </DialogTitle>
                            <DialogDescription className="text-xs md:text-sm text-start">
                                View the action plan created for this employee's wellbeing support.
                            </DialogDescription>
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            className="cursor-pointer shrink-0 mr-5"
                            onClick={() => toast.success("SYP's TODO", { description: "Will implement this later on" })}
                        >
                            <Download className="h-4 w-4" />
                        </Button>
                    </DialogHeader>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <User className="text-blue-600" size={20} />
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Employee Information</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Name:</span>
                                <span className="ml-2">{employee?.name}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Department:</span>
                                <span className="ml-2">{employee?.department}</span>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700 dark:text-gray-300">Emotion Score:</span>
                                <span className="text-red-600 font-bold ml-2 font-en">{employee?.score}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <MessageSquare className="text-purple-600" size={18} />
                                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Quick Action</h4>
                                </div>
                                <span className="font-medium">{action.quickAction ?? "Not Specified"}</span>
                            </div>

                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle2 className="text-green-600" size={18} />
                                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Status</h4>
                                </div>
                                <div className="text-base font-medium">
                                    <CustomBadge value={action.status} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <MdEventNote className="text-blue-600" size={18} />
                                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Action Type</h4>
                                </div>
                                <p className="text-base">{action.actionType}</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <MdFlag className="text-orange-600" size={18} />
                                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Priority</h4>
                                </div>
                                <div>
                                    <CustomBadge value={action.priority} />
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="text-indigo-600" size={18} />
                                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Type</h4>
                                </div>
                                <div>
                                    <CustomBadge value={action.type} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="text-teal-600" size={18} />
                                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Assigned To</h4>
                                </div>
                                <p className="text-base">{action.assignTo}</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <CalendarIcon className="text-red-600" size={18} />
                                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Due Date</h4>
                                </div>
                                <p className="text-base font-en">{moment(action.dueDate).format("LL")}</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <GiGlassCelebration className="text-amber-600" size={18} />
                                    <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Completed At</h4>
                                </div>
                                <p className="text-base font-en">{action.completedAt ? moment(action.completedAt).format("LL") : "Not Yet"}</p>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm">
                            <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                                <MdEventNote className="text-blue-600" size={20} />
                                Action Notes
                            </h4>
                            <div className="prose dark:prose-invert max-w-none">
                                <Preview content={action.actionNotes} />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm">
                            <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                                <Clock className="text-indigo-600" size={20} />
                                Follow-up Instructions
                            </h4>
                            <div className="prose dark:prose-invert max-w-none">
                                <Preview content={action.followUpNotes} />
                            </div>
                        </div>

                        {action.suggestions && (
                            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-5 shadow-sm">
                                <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                                    <FaRegThumbsUp className="text-amber-600" size={20} />
                                    Additional Suggestions from Upper Mangement
                                </h4>
                                {action.suggestions ? <div className="prose dark:prose-invert max-w-none">
                                    <Preview content={action.suggestions} />
                                </div> : <span className="italic text-muted-foreground">Not Yet</span>}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-3 border-t pt-6 pb-2 mt-6">
                        {
                            action.status === 'REJECTED' ? <p className="italic text-sm md:text-base text-red-600 text-center">
                                Note: This action plan has been rejected. <br className="block md:hidden" /> Please review and take necessary steps.
                            </p> :
                                action.type === 'PROCESSING' ?
                                    <p className="italic text-amber-600 text-sm md:text-base text-center">
                                        Note: Take necessary steps to complete this action plan.
                                    </p>
                                    : action.type === "PENDING" ?
                                        <p className="italic text-amber-600 text-sm md:text-base text-center">
                                            Note: Awaiting approval from Upper Management
                                        </p>
                                        : <p className="italic text-sm md:text-base text-green-600 text-center">
                                            Note: This action plan has been completed.
                                        </p>
                        }
                        <div className="flex items-center gap-2">
                            <DialogClose asChild>
                                <Button type="button" variant="outline" className="min-h-[44px] cursor-pointer">
                                    Close
                                </Button>
                            </DialogClose>
                            {action.type === 'PROCESSING' && action.status !== 'REJECTED' &&
                                <Button
                                    onClick={() => onMarkAsCompleted(action.id)}
                                    disabled={updatingAction}
                                    type="button"
                                    className="bg-green-600 hover:bg-green-500 text-white min-h-[44px] cursor-pointer">
                                    <Spinner isLoading={updatingAction} label="Saving...">
                                        Mark as Completed
                                    </Spinner>
                                </Button>}
                        </div>
                    </div>
                </div>
            </DialogContent>
        );
    }

    return (
        <DialogContent className="w-full mx-auto max-h-[95vh] overflow-visible sm:max-w-[1200px] lg:px-8">
            <div className="max-h-[calc(90vh-2rem)] overflow-y-auto no-scrollbar">
                <DialogHeader>
                    <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                        <MdAdminPanelSettings className="text-blue-600 size-5 md:size-7" />
                        Create Action Plan for {employee?.name || 'Employee'}
                    </DialogTitle>
                    <DialogDescription className="text-xs md:text-sm text-start">
                        Submit an action plan to support this employee's wellbeing. This will be sent to Upper Management for review and approval.
                    </DialogDescription>
                </DialogHeader>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
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

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
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
                                                            disabled={isWorking}
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

                        <div className="space-y-6">
                            <h3 className="text-lg font-semibold">Custom Action Plan</h3>

                            <div className="flex flex-col md:flex-row gap-4 w-full">
                                <FormField
                                    control={form.control}
                                    name="actionType"
                                    render={({ field }) => (
                                        <FormItem className="w-full">
                                            <FormLabel>Action Type <span className="font-en text-red-600">*</span></FormLabel>
                                            <Select onValueChange={field.onChange} value={field.value} disabled={isWorking}>
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
                                            <Select onValueChange={field.onChange} value={field.value} disabled={isWorking}>
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
                                                    placeholder="Enter assignee name"
                                                    disabled={isWorking}
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
                                                disabled={generating || isWorking}
                                                onClick={handleAIRecommendation}
                                                type="button"
                                                className="relative flex items-center gap-1.5 min-h-[40px] cursor-pointer overflow-hidden bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold hover:brightness-110 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent before:animate-[shimmer_2s_ease-in-out_infinite] before:[animation-delay:0s]"
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

                        <div className="flex flex-col md:flex-row justify-between items-center gap-2 border-t pt-6 pb-2">
                            <p className="text-muted-foreground italic text-sm md:text-base">Note: Once created, this action plan cannot be modified.</p>
                            <div className="flex items-center gap-3">
                                <DialogClose asChild>
                                    <Button disabled={isWorking || generating} type="button" variant="outline" className="min-h-[44px] cursor-pointer">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button disabled={isWorking || generating} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] cursor-pointer">
                                    <Spinner isLoading={isWorking} label="Submitting...">
                                        Create Action Plan
                                    </Spinner>
                                </Button>
                            </div>
                        </div>
                    </form>
                </Form>
            </div>
        </DialogContent>
    )
}
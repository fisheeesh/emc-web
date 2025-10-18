import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ACTION_STATUS } from "@/lib/constants";
import { updateActionFormSchema } from "@/lib/validators";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { AiOutlineIdcard } from "react-icons/ai";
import { GrNotes, GrTask } from "react-icons/gr";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { IoPersonOutline } from "react-icons/io5";
import { LuFlagTriangleRight } from "react-icons/lu";
import { MdOutlineAddReaction, MdOutlineCalendarMonth, MdOutlineMailOutline, MdOutlineRecommend, MdOutlineSettingsSuggest, MdOutlineStars } from "react-icons/md";
import z from "zod";
import CustomActionBadge from "../dashboard/custom-action-badge";
import Editor from "../editor";
import Preview from "../editor/preview";
import CustomBadge from "../shared/custom-badge";
import Spinner from "../shared/spinner";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import useUpdateActionPlan from "@/hooks/action-plans/use-update-action-plan";

export default function ActionDetailsModal({ action, onClose }: { action: ActionPlan, onClose?: () => void; }) {
    const editorRef = useRef<MDXEditorMethods>(null);
    const { updateActionPlan, updatingAction } = useUpdateActionPlan()

    const form = useForm<z.infer<typeof updateActionFormSchema>>({
        resolver: zodResolver(updateActionFormSchema),
        defaultValues: {
            status: action.status ? action.status as "PENDING" | "APPROVED" | "REJECTED" : "PENDING",
            suggestions: action.suggestions ? action.suggestions : ""
        }
    })

    const onSubmit: SubmitHandler<z.infer<typeof updateActionFormSchema>> = async (values) => {
        updateActionPlan({
            id: action.id,
            suggestions: values.suggestions,
            status: values.status,
            emailType: "RESPONSE"
        }, {
            onSettled: () => {
                form.reset()
                onClose?.()
            }
        })
    }

    const isWorking = form.formState.isSubmitting || updatingAction

    return (
        <DialogContent className="w-full mx-auto max-h-[95vh] overflow-visible sm:max-w-[1200px] lg:px-8">
            <div className="max-h-[calc(90vh-2rem)] overflow-y-auto no-scrollbar">
                <DialogHeader className="pb-5 border-b">
                    <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                        <MdOutlineSettingsSuggest className="text-blue-600 size-5 md:size-7" />
                        Review Action Plan
                    </DialogTitle>
                    <DialogDescription className="text-xs md:text-sm">
                        Review the action plan and decide to approve or reject. Add suggestions to help guide the implementation or improvement process.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 pb-3 md:w-2/3 w-full gap-5 mt-5">
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AiOutlineIdcard className="w-5 h-5" />
                            <span className="font-medium">Action ID</span>
                        </div>
                        <span className="font-en">{action.id}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-center gap-2">
                            <IoPersonOutline className="w-5 h-5" />
                            <span className="font-medium">Assign To</span>
                        </div>
                        <span className="">{action.assignTo}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MdOutlineMailOutline className="w-5 h-5" />
                            <span className="font-medium">Contact</span>
                        </div>
                        <span className="">{action.contact}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MdOutlineStars className="w-5 h-5" />
                            <span className="font-medium">Priority</span>
                        </div>
                        <CustomBadge status={action.priority.toLowerCase() as "high" | "medium" | "low"} />
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-center gap-2">
                            <LuFlagTriangleRight className="w-5 h-5" />
                            <span className="font-medium">Type</span>
                        </div>
                        <CustomActionBadge value={action.type.toLowerCase() as "pending" | "processing" | "completed"} />
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MdOutlineCalendarMonth className="w-5 h-5" />
                            <span className="font-medium">Due Date</span>
                        </div>
                        <span className="font-en">{action.dueDate}</span>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div className="flex items-center gap-2">
                            <MdOutlineAddReaction className="w-5 h-5" />
                            <span className="font-medium">Quick Action</span>
                        </div>
                        <span>{action.quickAction}</span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className="flex items-center gap-2 py-5 pb-3 mb-3 border-b w-full">
                        <GrNotes className="w-5 h-5" />
                        <span className="font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                            Action Notes
                        </span>
                    </div>
                    <Preview content={action.actionNotes} />
                </div>

                <div className="flex flex-col">
                    <div className="flex items-center gap-2 py-5 pb-3 mb-3 border-b w-full">
                        <GrTask className="w-5 h-5" />
                        <span className="font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                            Follow Up Notes
                        </span>
                    </div>
                    <Preview content={action.followUpNotes} />
                </div>

                <Form {...form}>
                    <form className="space-y-6 mt-4" onSubmit={form.handleSubmit(onSubmit)}>
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2 pb-2">
                                        <IoMdHelpCircleOutline className="w-5 h-5" />
                                        <span className="font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                                            Status
                                        </span>
                                        <span className="text-red-600 font-en">*</span>
                                    </div>
                                    <FormControl>
                                        <RadioGroup disabled={isWorking} className="flex items-center gap-4" onValueChange={field.onChange}>
                                            {ACTION_STATUS.map(status => (
                                                <FormItem key={status.name} className="flex items-center gap-2">
                                                    <FormControl>
                                                        <RadioGroupItem value={status.value} checked={field.value == status.value} />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">{status.name}</FormLabel>
                                                </FormItem>
                                            ))}
                                        </RadioGroup>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="suggestions"
                            render={({ field }) => (
                                <FormItem>
                                    <div className="flex items-center gap-2 pb-2">
                                        <MdOutlineRecommend className="w-5 h-5" />
                                        <span className="font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">
                                            Suggestions
                                        </span>
                                        <span className="text-red-600 font-en">*</span>
                                    </div>
                                    <FormControl>
                                        <div className="editor-wrapper">
                                            <Editor
                                                ref={editorRef}
                                                value={field.value}
                                                onChange={field.onChange}
                                            />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="mt-5 pt-5 border-t flex justify-end">
                            <Button disabled={isWorking} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] cursor-pointer">
                                <Spinner isLoading={isWorking} label="Saving...">
                                    Save Changes
                                </Spinner>
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>

                {/* <div className="mt-5 pt-5 border-t flex justify-end">
                    <DialogClose asChild>
                        <Button variant='outline' className="cursor-pointer">
                            Close
                        </Button>
                    </DialogClose>
                </div> */}
            </div>
        </DialogContent >
    )
}

import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import useUpdateActionPlan from "@/hooks/action-plans/use-update-action-plan";
import { ACTION_STATUS } from "@/lib/constants";
import { updateActionFormSchema } from "@/lib/validators";
import useUserStore from "@/store/user-store";
import { zodResolver } from "@hookform/resolvers/zod";
import type { MDXEditorMethods } from "@mdxeditor/editor";
import { CheckCircle2, Clock } from "lucide-react";
import { useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { AiOutlineIdcard } from "react-icons/ai";
import { FaRegBuilding, FaRegSadTear, FaRegThumbsUp } from "react-icons/fa";
import { GiGlassCelebration } from "react-icons/gi";
import { IoMdHelpCircleOutline } from "react-icons/io";
import { IoPersonOutline } from "react-icons/io5";
import { LuFlagTriangleRight } from "react-icons/lu";
import { MdOutlineAddReaction, MdOutlineCalendarMonth, MdOutlineMailOutline, MdOutlineStars } from "react-icons/md";
import z from "zod";
import Editor from "../editor";
import Preview from "../editor/preview";
import CustomBadge from "../shared/custom-badge";
import Spinner from "../shared/spinner";
import { Button } from "../ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

export default function ActionDetailsModal({ action, onClose }: { action: ActionPlan, onClose?: () => void; }) {
    const { user } = useUserStore()
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
        let emailType;
        if (action.suggestions) emailType = "UPDATE"
        else emailType = "RESPONSE"

        updateActionPlan({
            id: action.id,
            suggestions: values.suggestions,
            status: values.status,
            emailType: emailType as "RESPONSE" | "UPDATE"
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
                        <CheckCircle2 className="text-blue-600 size-5 md:size-7" />
                        Review Action Plan
                    </DialogTitle>
                    <DialogDescription className="text-xs md:text-sm text-start">
                        Review the action plan and decide to approve or reject. Add suggestions to help guide the implementation or improvement process.
                    </DialogDescription>
                </DialogHeader>

                {/* Action Plan Details Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    {/* Action ID */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <AiOutlineIdcard className="text-indigo-600" size={18} />
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Action ID</h4>
                        </div>
                        <p className="text-sm font-en text-gray-600 dark:text-gray-400 truncate">{action.id}</p>
                    </div>

                    {/* Victim */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <MdOutlineAddReaction className="text-green-600" size={18} />
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Quick Action</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{action.quickAction}</p>
                    </div>

                    {/* Department */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <FaRegBuilding className="text-blue-600" size={18} />
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Department</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{action.department.name}</p>
                    </div>

                    {/* Assign To */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <FaRegSadTear className="text-red-600" size={18} />
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Employee</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{action.criticalEmployee.employee.fullName}</p>
                    </div>

                    {/* Contact */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <MdOutlineMailOutline className="text-purple-600" size={18} />
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Contact</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{action.contact}</p>
                    </div>

                    {/* Priority */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <IoPersonOutline className="text-teal-600" size={18} />
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Assigned To</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{action.assignTo}</p>
                    </div>

                    {/* Type */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <LuFlagTriangleRight className="text-indigo-600" size={18} />
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Type</h4>
                        </div>
                        <CustomBadge value={action.type} />
                    </div>

                    {/* Due Date */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <MdOutlineStars className="text-orange-600" size={18} />
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Priority</h4>
                        </div>
                        <CustomBadge value={action.priority} />
                    </div>

                    {/* Quick Action */}
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <MdOutlineCalendarMonth className="text-rose-600" size={18} />
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Due Date</h4>
                        </div>
                        <p className="text-sm font-en text-gray-600 dark:text-gray-400">{action.dueDate}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <GiGlassCelebration className="text-amber-600" size={18} />
                            <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">Completed At</h4>
                        </div>
                        <p className="text-sm font-en text-gray-600 dark:text-gray-400">{action.completedAt ?? "Not Yet"}</p>
                    </div>
                </div>

                {/* Action Notes */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm mb-6">
                    <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                        <GiGlassCelebration className="text-amber-600" size={18} />
                        Action Notes
                    </h4>
                    <div className="prose dark:prose-invert max-w-none">
                        <Preview content={action.actionNotes} />
                    </div>
                </div>

                {/* Follow Up Notes */}
                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 shadow-sm mb-6">
                    <h4 className="font-semibold text-base mb-3 flex items-center gap-2">
                        <Clock className="text-indigo-600" size={20} />
                        Follow Up Notes
                    </h4>
                    <div className="prose dark:prose-invert max-w-none">
                        <Preview content={action.followUpNotes} />
                    </div>
                </div>

                {/* Admin Form */}
                {user?.role === 'SUPERADMIN' && (
                    <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-5 shadow-sm">
                        <Form {...form}>
                            <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
                                <FormField
                                    control={form.control}
                                    name="status"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center gap-2 mb-3">
                                                <IoMdHelpCircleOutline className="text-blue-600" size={20} />
                                                <FormLabel className="font-semibold text-base">
                                                    Decision <span className="text-red-600 font-en">*</span>
                                                </FormLabel>
                                            </div>
                                            <FormControl>
                                                <RadioGroup disabled={isWorking} className="flex flex-wrap items-center gap-4" onValueChange={field.onChange}>
                                                    {ACTION_STATUS.map(status => (
                                                        <FormItem key={status.name} className="flex items-center gap-2">
                                                            <FormControl>
                                                                <RadioGroupItem value={status.value} checked={field.value == status.value} />
                                                            </FormControl>
                                                            <FormLabel className="font-normal cursor-pointer">{status.name}</FormLabel>
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
                                            <div className="flex items-center gap-2 mb-3">
                                                <FaRegThumbsUp className="text-blue-600" size={20} />
                                                <FormLabel className="font-semibold text-base">
                                                    Suggestions <span className="text-red-600 font-en">*</span>
                                                </FormLabel>
                                            </div>
                                            <FormControl>
                                                <div className="editor-wrapper bg-white dark:bg-gray-900 rounded-md">
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
                                <DialogFooter className="mt-6 pt-5 border-t flex justify-end gap-3">
                                    <DialogClose asChild>
                                        <Button disabled={isWorking} variant='outline' className="cursor-pointer min-h-[44px]">
                                            Close
                                        </Button>
                                    </DialogClose>
                                    {action.type !== 'COMPLETED' && <Button disabled={isWorking} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] cursor-pointer">
                                        <Spinner isLoading={isWorking} label="Saving...">
                                            Save Changes
                                        </Spinner>
                                    </Button>}
                                </DialogFooter>
                            </form>
                        </Form>
                    </div>
                )}
            </div>
        </DialogContent>
    )
}
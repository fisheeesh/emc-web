import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { AlertTriangle, Calendar, Mail, MessageSquare, Phone, UserCheck } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { cn } from "@/lib/utils";

type QuickAction = {
    name: string;
    value: string;
    icon: React.ReactNode;
}
const QUICK_ACTIONS: QuickAction[] = [
    { name: "Schedule one-on-one Call", value: " Schedule 1-on-1 Call", icon: <Phone size={18} /> },
    { name: "Send Check-in Email", value: " Send Check-in Email", icon: <Mail size={18} /> },
    { name: "Book HR Meeting", value: " Book HR Meeting", icon: <Calendar size={18} /> },
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
    const [selected, setSelected] = useState("")

    return (
        <DialogContent className="w-full mx-auto max-h-[90vh] overflow-y-auto sm:max-w-[1024px] no-scrollbar">
            <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                    <UserCheck className="text-blue-600" />
                    Take Action for {employee?.name || 'Employee'}
                </DialogTitle>
                <DialogDescription>
                    Choose appropriate actions to support this employee's wellbeing
                </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 mt-4">
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
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {
                            QUICK_ACTIONS.map(({ name, value, icon }) => (
                                <Button key={value} onClick={() => setSelected(value)} variant="outline"
                                    className={cn(selected === value && "text-blue-700 hover:text-blue-700", "flex items-center gap-2 h-12 cursor-pointer")}
                                >
                                    {icon}
                                    {name}
                                </Button>
                            ))
                        }
                    </div>
                </div>

                {/* Action Form */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Custom Action Plan</h3>

                    <div className="flex flex-col md:flex-row gap-4 w-full">
                        <div className="space-y-2 w-full">
                            <Label htmlFor="action-type">Action Type</Label>
                            <Select>
                                <SelectTrigger className="min-h-[48px] w-full">
                                    <SelectValue placeholder="Select action type" />
                                </SelectTrigger>
                                <SelectContent className="">
                                    <SelectItem value="meeting">One-on-One Meeting</SelectItem>
                                    <SelectItem value="email">Email Follow-up</SelectItem>
                                    <SelectItem value="hr-referral">HR Referral</SelectItem>
                                    <SelectItem value="workload-review">Workload Review</SelectItem>
                                    <SelectItem value="mental-health">Mental Health Support</SelectItem>
                                    <SelectItem value="team-support">Team Support</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 w-full">
                            <Label htmlFor="priority">Priority Level</Label>
                            <Select>
                                <SelectTrigger className="min-h-[48px] w-full">
                                    <SelectValue placeholder="Select priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="high">High - Immediate</SelectItem>
                                    <SelectItem value="medium">Medium - This Week</SelectItem>
                                    <SelectItem value="low">Low - Monitor</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="assigned-to">Assign To</Label>
                        <Input id="assigned-to" className="min-h-[48px]" placeholder="Manager, HR Representative, etc." />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="due-date">Due Date</Label>
                        <Input id="due-date" className="min-h-[48px]" type="date" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Action Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Describe the specific actions to be taken, observations, and any special considerations..."
                            className="min-h-[150px] resize-none"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="follow-up">Follow-up Instructions</Label>
                        <Textarea
                            id="follow-up"
                            placeholder="When and how to follow up on this action..."
                            className="min-h-[150px] resize-none"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end items-center gap-3 mt-6 pt-4 border-t">
                <DialogClose asChild>
                    <Button variant="outline" className="min-h-[44px] cursor-pointer">
                        Cancel
                    </Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white min-h-[44px] cursor-pointer">
                        Create Action Plan
                    </Button>
                </DialogClose>
            </div>
        </DialogContent>
    )
}
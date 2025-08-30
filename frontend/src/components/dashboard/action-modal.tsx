import {
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar, Phone, Mail, MessageSquare, UserCheck, AlertTriangle } from "lucide-react";

export default function ActionModal({ employee }: { employee: Employee }) {
    return (
        <DialogContent className="w-full mx-auto max-h-[90vh] overflow-y-auto sm:max-w-[1024px]">
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
                    <div className="grid grid-cols-1 text-card md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <span className="font-medium">Name:</span> {employee?.name}
                        </div>
                        <div>
                            <span className="font-medium">Department:</span> {employee?.department}
                        </div>
                        <div>
                            <span className="font-medium">Emotion Score:</span>
                            <span className="text-red-600 font-bold ml-1">{employee?.score}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Button variant="outline" className="flex items-center gap-2 h-12">
                            <Phone size={18} />
                            Schedule 1-on-1 Call
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2 h-12">
                            <Mail size={18} />
                            Send Check-in Email
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2 h-12">
                            <Calendar size={18} />
                            Book HR Meeting
                        </Button>
                        <Button variant="outline" className="flex items-center gap-2 h-12">
                            <MessageSquare size={18} />
                            Send Supportive Message
                        </Button>
                    </div>
                </div>

                {/* Action Form */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Custom Action Plan</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="action-type">Action Type</Label>
                            <Select>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select action type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="meeting">One-on-One Meeting</SelectItem>
                                    <SelectItem value="email">Email Follow-up</SelectItem>
                                    <SelectItem value="hr-referral">HR Referral</SelectItem>
                                    <SelectItem value="workload-review">Workload Review</SelectItem>
                                    <SelectItem value="mental-health">Mental Health Support</SelectItem>
                                    <SelectItem value="team-support">Team Support</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="priority">Priority Level</Label>
                            <Select>
                                <SelectTrigger>
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
                        <Input id="assigned-to" placeholder="Manager, HR Representative, etc." />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="due-date">Due Date</Label>
                        <Input id="due-date" type="date" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Action Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Describe the specific actions to be taken, observations, and any special considerations..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="follow-up">Follow-up Instructions</Label>
                        <Textarea
                            id="follow-up"
                            placeholder="When and how to follow up on this action..."
                            className="min-h-[80px]"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end items-center gap-3 mt-6 pt-4 border-t">
                <DialogClose asChild>
                    <Button variant="outline">
                        Cancel
                    </Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                        Create Action Plan
                    </Button>
                </DialogClose>
                <DialogClose asChild>
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                        Create & Mark Urgent
                    </Button>
                </DialogClose>
            </div>
        </DialogContent>
    )
}
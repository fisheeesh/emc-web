import CustomBadge from "@/components/shared/custom-badge";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { BsBuilding } from "react-icons/bs";

interface DepartmentDetailsModalProps {
    department: {
        id: number;
        name: string;
        description: string;
        employeeCount: number;
        status: "ACTIVE" | "INACTIVE";
        criticalCount: number;
        actionPlans: number;
        createdAt: string;
    };
}

export default function DepartmentDetailsModal({ department }: DepartmentDetailsModalProps) {
    return (
        <DialogContent className="w-full mx-auto max-h-[90vh] overflow-visible sm:max-w-[600px] lg:px-8">
            <div className="max-h-[calc(90vh-2rem)] overflow-y-auto no-scrollbar">

                <DialogHeader>
                    <DialogTitle className="text-lg md:text-xl font-bold flex items-center gap-2">
                        <BsBuilding className="size-5 md:size-7" />
                        Department Details
                    </DialogTitle>
                    <DialogDescription className="text-xs md:text-sm text-start">
                        View comprehensive information about this department
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Department Name */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Department Name</h3>
                        <p className="text-base font-medium">{department.name}</p>
                    </div>

                    <Separator />

                    {/* Description */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Description</h3>
                        <p className="text-sm">{department.description}</p>
                    </div>

                    <Separator />

                    {/* Number of Employees */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Number of Employees</h3>
                        <p className="text-base font-en font-medium">{department.employeeCount}</p>
                    </div>

                    <Separator />

                    {/* Status */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Status</h3>
                        <CustomBadge value={department.status} />
                    </div>

                    <Separator />

                    {/* Critical History */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Critical History</h3>
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Critical Employees</span>
                                <span className="text-lg font-en font-bold text-orange-600">{department.criticalCount}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Action Plans</span>
                                <span className="text-lg font-en font-bold text-blue-600">{department.actionPlans}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Created At */}
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Created At</h3>
                        <p className="text-sm font-en">{new Date(department.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}</p>
                    </div>
                </div>
                <DialogFooter className='py-5 border-t mt-5'>
                    <DialogClose>
                        <Button variant='outline' className='cursor-pointer'>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </div>
        </DialogContent>
    );
}
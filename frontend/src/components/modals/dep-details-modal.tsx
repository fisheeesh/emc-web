import CustomBadge from "@/components/shared/custom-badge";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { BsBuilding } from "react-icons/bs";

export default function DepartmentDetailsModal({ department }: { department: DepartmentData }) {
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
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Department Name</h3>
                        <p className="text-base font-medium">{department.name}</p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Description</h3>
                        <p className="text-sm">{department.description ?? "Not Specified"}</p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Number of Employees</h3>
                        <p className="text-base font-en font-medium">{department._count.employees}</p>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Status</h3>
                        <CustomBadge value={department.isActive ? "ACTIVE" : "INACTIVE"} />
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Critical History</h3>
                        <div className="flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Critical Employees</span>
                                <span className="text-lg font-en font-bold text-orange-600">{department._count.criticalEmployees}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-muted-foreground">Action Plans</span>
                                <span className="text-lg font-en font-bold text-blue-600">{department._count.actionPlans}</span>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <CustomBadge value="ADMIN" />
                            <span className="text-xs font-en font-medium px-2 py-1 rounded-full bg-primary/10 text-primary">
                                {department.employees.length} {department.employees.length === 1 ? 'Employee' : 'Employees'}
                            </span>
                        </div>
                        {department.employees.length > 0 ? (
                            <div className="max-h-[200px] overflow-y-auto custom-scrollbar pr-2">
                                <div className="grid grid-cols-1 gap-2">
                                    {department.employees.map((employee, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                                        >
                                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold text-sm flex-shrink-0">
                                                {employee.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{employee.fullName}</p>
                                                <p className="text-xs text-muted-foreground truncate font-en">{employee.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                <div className="rounded-full bg-muted p-3 mb-2">
                                    <BsBuilding className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">No admin employees assigned to this department</p>
                            </div>
                        )}
                    </div>

                    <Separator />
                    <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-muted-foreground">Created At</h3>
                        <p className="text-sm font-en">{department.createdAt}</p>
                    </div>
                </div>
                <DialogFooter className='py-5 border-t mt-5'>
                    <DialogClose asChild>
                        <Button variant='outline' className='cursor-pointer'>Close</Button>
                    </DialogClose>
                </DialogFooter>
            </div>
        </DialogContent>
    );
}
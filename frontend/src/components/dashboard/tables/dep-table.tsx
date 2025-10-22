import { useState } from "react";
import { BsEye } from "react-icons/bs";
import { GrMoreVertical } from "react-icons/gr";
import { LuPencil } from "react-icons/lu";
import { RiDeleteBin5Line } from "react-icons/ri";
import { MdAdd } from "react-icons/md";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CustomBadge from "@/components/shared/custom-badge";
import ConfirmModal from "@/components/modals/confirm-modal";
import DepartmentDetailsModal from "@/components/modals/dep-details-modal";
import CreateEditDepartmentModal from "@/components/modals/create-edit-dep-modal";
import { createDepartmentSchema, updateDepartmentSchema } from "@/lib/validators";

// Dummy data for 8 departments
const DUMMY_DEPARTMENTS = [
    {
        id: 1,
        name: "Engineering",
        description: "Software development and technical infrastructure",
        employeeCount: 45,
        status: "ACTIVE" as const,
        criticalCount: 8,
        actionPlans: 3,
        createdAt: "2024-01-15",
    },
    {
        id: 2,
        name: "Human Resources",
        description: "Employee relations, recruitment, and organizational development",
        employeeCount: 12,
        status: "ACTIVE" as const,
        criticalCount: 2,
        actionPlans: 1,
        createdAt: "2024-01-20",
    },
    {
        id: 3,
        name: "Marketing",
        description: "Brand management, digital marketing, and customer engagement",
        employeeCount: 28,
        status: "ACTIVE" as const,
        criticalCount: 5,
        actionPlans: 4,
        createdAt: "2024-02-01",
    },
    {
        id: 4,
        name: "Sales",
        description: "Business development and client relationship management",
        employeeCount: 34,
        status: "ACTIVE" as const,
        criticalCount: 6,
        actionPlans: 2,
        createdAt: "2024-02-10",
    },
    {
        id: 5,
        name: "Finance",
        description: "Financial planning, accounting, and budget management",
        employeeCount: 18,
        status: "ACTIVE" as const,
        criticalCount: 3,
        actionPlans: 1,
        createdAt: "2024-02-15",
    },
    {
        id: 6,
        name: "Operations",
        description: "Process optimization and operational excellence",
        employeeCount: 22,
        status: "INACTIVE" as const,
        criticalCount: 1,
        actionPlans: 0,
        createdAt: "2024-03-01",
    },
    {
        id: 7,
        name: "Customer Support",
        description: "Client service and technical support",
        employeeCount: 30,
        status: "ACTIVE" as const,
        criticalCount: 7,
        actionPlans: 5,
        createdAt: "2024-03-10",
    },
    {
        id: 8,
        name: "Research & Development",
        description: "Innovation and product development initiatives",
        employeeCount: 15,
        status: "INACTIVE" as const,
        criticalCount: 2,
        actionPlans: 1,
        createdAt: "2024-03-20",
    },
];

export default function DepartmentTable() {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<typeof DUMMY_DEPARTMENTS[0] | null>(null);
    const [viewDepartment, setViewDepartment] = useState<typeof DUMMY_DEPARTMENTS[0] | null>(null);

    const handleDelete = (id: number) => {
        console.log("Deleting department with ID:", id);
    };

    return (
        <Card className="rounded-md flex flex-col gap-5 lg:col-span-1 xl:col-span-2">
            <CardHeader className="space-y-2">
                <div className="flex flex-col xl:flex-row gap-3 xl:gap-0 justify-between">
                    <div className="flex flex-col items-start gap-2 tracking-wide">
                        <CardTitle className="text-xl md:text-2xl text-gradient line-clamp-1">
                            All Departments under ATA - IT Company
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                            Manage organizational structure and department information
                        </CardDescription>
                    </div>
                    <div className="flex flex-col xl:flex-row xl:items-center gap-2">
                        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size='sm'
                                    className="bg-gradient text-white cursor-pointer w-fit">
                                    <MdAdd className="" />
                                </Button>
                            </DialogTrigger>
                            {createOpen && (
                                <CreateEditDepartmentModal
                                    formType="CREATE"
                                    schema={createDepartmentSchema}
                                    defaultValues={{
                                        name: "",
                                        description: "",
                                    }}
                                    onClose={() => setCreateOpen(false)}
                                />
                            )}
                        </Dialog>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="whitespace-nowrap font-semibold">Name</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">No. Employees</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Status</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {DUMMY_DEPARTMENTS.map((department) => (
                            <TableRow key={department.id}>
                                <TableCell className="font-medium">{department.name}</TableCell>
                                <TableCell>
                                    <span className="font-en">{department.employeeCount}</span>
                                </TableCell>
                                <TableCell>
                                    <CustomBadge value={department.status} />
                                </TableCell>
                                <TableCell className="text-center">
                                    <Dialog>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" className="cursor-pointer">
                                                    <GrMoreVertical className="size-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent className="w-30" align="end" forceMount>
                                                <DropdownMenuGroup>
                                                    <DropdownMenuItem asChild className="cursor-pointer">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="w-full cursor-pointer flex justify-start gap-2 px-1.5"
                                                            onClick={() => setViewDepartment(department)}
                                                        >
                                                            <BsEye className="text-black dark:text-white" />
                                                            View Details
                                                        </Button>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild className="cursor-pointer">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="w-full cursor-pointer flex justify-start gap-2 px-1.5"
                                                            onClick={() => setEditingDepartment(department)}
                                                        >
                                                            <LuPencil className="text-black dark:text-white" />
                                                            Edit
                                                        </Button>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild className="cursor-pointer">
                                                        <DialogTrigger asChild>
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="w-full cursor-pointer flex text-red-600! justify-start gap-2 px-1.5"
                                                            >
                                                                <RiDeleteBin5Line className="text-red-600" />
                                                                Delete
                                                            </Button>
                                                        </DialogTrigger>
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        <ConfirmModal
                                            title="Delete Department Confirmation"
                                            description="Are you sure you want to delete this department? This action cannot be undone."
                                            isLoading={false}
                                            loadingLabel="Deleting..."
                                            onConfirm={() => handleDelete(department.id)}
                                        />
                                    </Dialog>
                                </TableCell>
                            </TableRow>
                        ))}

                        {/* Edit Modal */}
                        <Dialog open={!!editingDepartment} onOpenChange={(o) => !o && setEditingDepartment(null)}>
                            {editingDepartment && (
                                <CreateEditDepartmentModal
                                    formType="EDIT"
                                    departmentId={editingDepartment.id}
                                    schema={updateDepartmentSchema}
                                    defaultValues={{
                                        name: editingDepartment.name,
                                        description: editingDepartment.description,
                                        status: editingDepartment.status,
                                    }}
                                    onClose={() => setEditingDepartment(null)}
                                />
                            )}
                        </Dialog>

                        {/* View Details Modal */}
                        <Dialog open={!!viewDepartment} onOpenChange={(o) => !o && setViewDepartment(null)}>
                            {viewDepartment && <DepartmentDetailsModal department={viewDepartment} />}
                        </Dialog>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
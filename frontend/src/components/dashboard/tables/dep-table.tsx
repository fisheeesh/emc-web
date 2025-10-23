import ConfirmModal from "@/components/modals/confirm-modal";
import CreateEditDepartmentModal from "@/components/modals/create-edit-dep-modal";
import DepartmentDetailsModal from "@/components/modals/dep-details-modal";
import CustomBadge from "@/components/shared/custom-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import useDeleteDep from "@/hooks/dep/use-delete-dep";
import { createDepartmentSchema, updateDepartmentSchema } from "@/lib/validators";
import { useState } from "react";
import { BsEye } from "react-icons/bs";
import { GrMoreVertical } from "react-icons/gr";
import { LuPencil } from "react-icons/lu";
import { MdAdd } from "react-icons/md";
import { RiDeleteBin5Line } from "react-icons/ri";

export default function DepartmentTable({ data }: { data: DepartmentData[] }) {
    const [createOpen, setCreateOpen] = useState(false);
    const [editingDepartment, setEditingDepartment] = useState<typeof data[0] | null>(null);
    const [viewDepartment, setViewDepartment] = useState<typeof data[0] | null>(null);

    const { deleteDep, deletingDep } = useDeleteDep()

    return (
        <Card className="rounded-md flex flex-col max-h-[600px] lg:col-span-1 xl:col-span-2">
            <CardHeader className="space-y-2 flex-shrink-0">
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

            <CardContent className="flex-1 overflow-hidden">
                <div className="overflow-auto max-h-[calc(600px-165px)] custom-scrollbar">
                    <Table>
                        <TableHeader className="sticky top-0 z-10">
                            <TableRow>
                                <TableHead className="whitespace-nowrap font-semibold">Name</TableHead>
                                <TableHead className="whitespace-nowrap font-semibold">No. Employees</TableHead>
                                <TableHead className="whitespace-nowrap font-semibold">Status</TableHead>
                                <TableHead className="whitespace-nowrap font-semibold text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody >
                            {data.map((department) => (
                                <TableRow key={department.id}>
                                    <TableCell className="font-medium">{department.name}</TableCell>
                                    <TableCell>
                                        <span className="font-en">{department._count.employees}</span>
                                    </TableCell>
                                    <TableCell>
                                        <CustomBadge value={department.isActive === true ? "ACTIVE" : "INACTIVE"} />
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
                                                isLoading={deletingDep}
                                                loadingLabel="Deleting..."
                                                onConfirm={() => deleteDep(department.id)}
                                            />
                                        </Dialog>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>

            <Dialog open={!!editingDepartment} onOpenChange={(o) => !o && setEditingDepartment(null)}>
                {editingDepartment && (
                    <CreateEditDepartmentModal
                        formType="EDIT"
                        departmentId={editingDepartment.id}
                        schema={updateDepartmentSchema}
                        defaultValues={{
                            name: editingDepartment.name,
                            description: editingDepartment.description,
                            status: editingDepartment.isActive ? "ACTIVE" : "INACTIVE",
                        }}
                        onClose={() => setEditingDepartment(null)}
                    />
                )}
            </Dialog>

            <Dialog open={!!viewDepartment} onOpenChange={(o) => !o && setViewDepartment(null)}>
                {viewDepartment && <DepartmentDetailsModal department={viewDepartment} />}
            </Dialog>
        </Card>
    );
}
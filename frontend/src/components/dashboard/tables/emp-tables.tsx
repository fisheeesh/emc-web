import CustomBadge from "@/components/shared/custom-badge";
import LocalSearch from "@/components/shared/local-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CRITICAL_DATA } from "@/lib/constants";
import { FaRegEdit } from "react-icons/fa";
import { IoMdMore } from "react-icons/io";
import { FaRegTrashCan } from "react-icons/fa6";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import DetailsModal from "@/components/modals/details-modal";
import ConfirmModal from "@/components/modals/confirm-modal";

export default function EmpTables() {
    return (
        <Card className="rounded-md flex flex-col gap-5">
            <CardHeader className="flex flex-col md:flex-row gap-3 md:gap-0 justify-between">
                <div className="flex flex-col items-start gap-2 tracking-wide">
                    <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">Employee Lists under IT department</CardTitle>
                    <CardDescription>Create, Update, and Delete employees</CardDescription>
                </div>
                <LocalSearch filterValue="criEmp" />
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="whitespace-nowrap">Name</TableHead>
                            <TableHead className="whitespace-nowrap">Position</TableHead>
                            <TableHead className="whitespace-nowrap">Contact</TableHead>
                            <TableHead className="whitespace-nowrap">Role</TableHead>
                            <TableHead className="whitespace-nowrap">Job Type</TableHead>
                            <TableHead className="whitespace-nowrap">Overall</TableHead>
                            <TableHead className="whitespace-nowrap">Last Critical Time</TableHead>
                            <TableHead className="whitespace-nowrap">Joined At</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {
                            CRITICAL_DATA.map((emp) => (
                                <TableRow key={emp.id} className="py-10">
                                    <TableCell >
                                        <span className="whitespace-nowrap">{emp.name}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap">UI/UX Designer</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap">{emp.contact}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap">Employee</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap">Internship</span>
                                    </TableCell>
                                    <TableCell>
                                        <CustomBadge score={emp.score} />
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap">Null</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap">August, 31, 2025</span>
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size='icon' variant='outline' className="cursor-pointer">
                                                    <IoMdMore />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" forceMount>
                                                <DropdownMenuGroup className="flex flex-col">
                                                    <DropdownMenuItem asChild>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant='outline' className="whitespace-nowrap cursor-pointer">
                                                                    <FaRegEdit className="size-4 text-black dark:text-white mr-1" aria-hidden="true" />
                                                                    Edit
                                                                </Button>
                                                            </DialogTrigger>

                                                            <DetailsModal employee={emp} />
                                                        </Dialog>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Dialog>
                                                            <DialogTrigger asChild>
                                                                <Button variant='destructive' className="whitespace-nowrap mt-1 cursor-pointer">
                                                                    <FaRegTrashCan className="size-4 text-black dark:text-white mr-1" aria-hidden="true" />
                                                                    Delete
                                                                </Button>
                                                            </DialogTrigger>
                                                            <ConfirmModal />
                                                        </Dialog>
                                                    </DropdownMenuItem>
                                                </DropdownMenuGroup>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        }
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}

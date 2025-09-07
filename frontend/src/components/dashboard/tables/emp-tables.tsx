import ConfirmModal from "@/components/modals/confirm-modal";
import CreateEditEmpModal from "@/components/modals/create-edit-emp-modal";
import CommonFilter from "@/components/shared/common-filter";
import CustomBadge from "@/components/shared/custom-badge";
import LocalSearch from "@/components/shared/local-search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CRITICAL_DATA, DEPARTMENTS_FILTER, IMG_URL } from "@/lib/constants";
import { IoPersonAdd } from "react-icons/io5";

export default function EmpTables() {
    return (
        <Card className="rounded-md flex flex-col gap-5">
            <CardHeader className="flex flex-col md:flex-row gap-3 md:gap-0 justify-between">
                <div className="flex flex-col items-start gap-2 tracking-wide">
                    <CardTitle className="text-xl md:text-2xl bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent">Employee Lists under ATA - IT Company</CardTitle>
                    <CardDescription>Create, Update, and Delete employees</CardDescription>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <LocalSearch filterValue="criEmp" />
                    <CommonFilter
                        filterValue="dep"
                        addFister={false}
                        filters={DEPARTMENTS_FILTER}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 font-semibold hover:from-pink-500 hover:via-purple-500 hover:to-blue-400 transition-colors duration-300 min-h-[44px] text-white flex items-center gap-2 cursor-pointer">
                                <IoPersonAdd /> Create a new employee
                            </Button>
                        </DialogTrigger>
                        <CreateEditEmpModal />
                    </Dialog>
                </div>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="whitespace-nowrap">Name</TableHead>
                            <TableHead className="whitespace-nowrap">Position</TableHead>
                            <TableHead className="whitespace-nowrap">Email</TableHead>
                            <TableHead className="whitespace-nowrap">Role</TableHead>
                            <TableHead className="whitespace-nowrap">Job Type</TableHead>
                            <TableHead className="whitespace-nowrap">Acc Type</TableHead>
                            <TableHead className="whitespace-nowrap">Overall</TableHead>
                            <TableHead className="whitespace-nowrap">Last Critical Time</TableHead>
                            <TableHead className="whitespace-nowrap">Joined At</TableHead>
                            <TableHead className="whitespace-nowrap text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {
                            CRITICAL_DATA.map((emp) => (
                                <TableRow key={emp.id} className="py-10">
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="size-9">
                                                <AvatarImage src={IMG_URL} alt={"SY"} />
                                                <AvatarFallback>{"SY"}</AvatarFallback>
                                            </Avatar>
                                            <span className="whitespace-nowrap">{emp.name}</span>
                                        </div>
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
                                        <span className="whitespace-nowrap">ACTIVE</span>
                                    </TableCell>
                                    <TableCell>
                                        <CustomBadge status="positive" />
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap">Null</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap font-en">August, 31, 2025</span>
                                    </TableCell>
                                    <TableCell className="space-x-2 text-center">
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant='outline' className="cursor-pointer">
                                                    Edit
                                                </Button>
                                            </DialogTrigger>
                                            <CreateEditEmpModal />
                                        </Dialog>

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="cursor-pointer" variant='destructive'>
                                                    Delete
                                                </Button>
                                            </DialogTrigger>
                                            <ConfirmModal />
                                        </Dialog>
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

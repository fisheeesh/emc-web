import CommonFilter from "@/components/shared/common-filter";
import LocalSearch from "@/components/shared/local-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CRITICAL_DATA, PRIORITY, RSTATUS, RType, TSFILTER } from "@/lib/constants";
import DetailsModal from "../../modals/details-modal";

export default function ActionsTable() {
    return (
        <Card className="rounded-md flex flex-col gap-5">
            <CardHeader className="space-y-2">
                <div className="flex flex-col xl:flex-row gap-3 xl:gap-0 justify-between">
                    <div className="flex flex-col items-start gap-2 tracking-wide">
                        <CardTitle className="text-xl md:text-2xl">Requested Actions</CardTitle>
                        <CardDescription>
                            Review and monitor action plans submitted by department managers and HR to support employee wellbeing
                        </CardDescription>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-2">
                    <LocalSearch filterValue="rKw" />
                    <CommonFilter
                        filterValue="priority"
                        filters={PRIORITY}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                    <CommonFilter
                        filterValue="status"
                        filters={RSTATUS}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                    <CommonFilter
                        filterValue="type"
                        filters={RType}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                    <CommonFilter
                        filterValue="due"
                        filters={TSFILTER}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                </div>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="whitespace-nowrap font-semibold">ID</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Department</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Victim</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Priority</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Type</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Status</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Due Date</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {
                            CRITICAL_DATA.map((emp) => (
                                <TableRow key={emp.id}>
                                    <TableCell className="py-6">
                                        <span className="whitespace-nowrap">{emp.name}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap">{emp.department}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap">{emp.contact}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap">{emp.contact}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap">Pending</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap">Pending</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap font-en">Oct 6, 2025</span>
                                    </TableCell>
                                    <TableCell className="space-x-2 text-center">
                                        {/* Details Dialog */}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant='outline' className="cursor-pointer">
                                                    Details
                                                </Button>
                                            </DialogTrigger>
                                            <DetailsModal employee={emp} />
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
import LocalSearch from "@/components/shared/local-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CRITICAL_DATA } from "@/lib/constants";
import DetailsModal from "../details-modal";
import ActionModal from "../action-modal";

export default function CriticalTable() {
    return (
        <Card className="rounded-md border-destructive border-2 flex flex-col gap-5">
            <CardHeader className="flex flex-col md:flex-row gap-3 md:gap-0 justify-between">
                <div className="flex flex-col items-start gap-2 tracking-wide">
                    <CardTitle className="text-xl md:text-2xl text-destructive">Critical Mood Table</CardTitle>
                    <CardDescription>Employees whose average sentiment score lower than particular points will be shown here</CardDescription>
                </div>
                <LocalSearch filterValue="criEmp" />
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="whitespace-nowrap">Name</TableHead>
                            <TableHead className="whitespace-nowrap">Department</TableHead>
                            <TableHead className="whitespace-nowrap">Contact</TableHead>
                            <TableHead className="whitespace-nowrap text-center">EmotionScore</TableHead>
                            <TableHead className="whitespace-nowrap text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {
                            CRITICAL_DATA.map((emp) => (
                                <TableRow key={emp.id}>
                                    <TableCell className="">
                                        <span className="whitespace-nowrap">{emp.name}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap">{emp.department}</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap">{emp.contact}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="whitespace-nowrap font-en">{emp.score}</span>
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

                                        {/* Action Dialog */}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button className="cursor-pointer bg-brand hover:bg-blue-600 text-white">
                                                    Action
                                                </Button>
                                            </DialogTrigger>
                                            <ActionModal employee={emp} />
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
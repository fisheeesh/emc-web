import LocalSearch from "@/components/shared/local-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CRITICAL_DATA } from "@/lib/constants";
import DetailsModal from "../../modals/details-modal";

interface Props {
    data: WatchlistEmployee[]
    status: "error" | 'success' | 'pending',
    error: Error | null,
    isFetching?: boolean,
    isFetchingNextPage: boolean,
    fetchNextPage: () => void,
    hasNextPage: boolean
}

export default function WatchListTable({ data, status, error, isFetchingNextPage, fetchNextPage, hasNextPage }: Props) {
    return (
        <Card className="rounded-md border-yellow-500 border-2 flex flex-col gap-5">
            <CardHeader className="flex flex-col md:flex-row gap-3 md:gap-0 justify-between">
                <div className="flex flex-col items-start gap-2 tracking-wide">
                    <CardTitle className="text-xl md:text-2xl text-yellow-600">WatchList Employees</CardTitle>
                    <CardDescription>Employees moved from critical status after intervention, now under ongoing observation for stability</CardDescription>
                </div>
                <LocalSearch filterValue="wKw" />
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="whitespace-nowrap font-semibold">Name</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Department</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Contact</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">EmotionScore</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Taken Actions</TableHead>
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
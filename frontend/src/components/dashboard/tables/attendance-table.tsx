import LocalSearch from "@/components/shared/local-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EMOTION_FILTER, TSFILTER } from "@/lib/constants";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";

import EmpEmotionModal from "@/components/modals/emp-emotion-modal";
import CommonFilter from "@/components/shared/common-filter";
import CustomBadge from "@/components/shared/custom-badge";
import CustomCalendar from "@/components/shared/custom-calendar";
import Empty from "@/components/ui/empty";

interface Props {
    data: AttendanceOverviewData[]
}

export default function AttendanceTable({ data }: Props) {

    return (
        <Card className="rounded-md flex flex-col gap-5">
            <CardHeader className="flex flex-col gap-3 ">
                <div className="flex flex-col items-start gap-2 tracking-wide">
                    <CardTitle className="text-xl md:text-2xl">Attendance Overview</CardTitle>
                    <CardDescription className="line-clamp-1">Select a date to view employee attendance records</CardDescription>
                </div>
                <div className="flex flex-col md:flex-row w-full md:items-center gap-2">
                    <LocalSearch filterValue="kw" />
                    <CommonFilter
                        filterValue="empStatus"
                        filters={EMOTION_FILTER}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                    <CommonFilter
                        filterValue="ts"
                        filters={TSFILTER}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                    <CustomCalendar filterValue="attDate" />
                </div>
            </CardHeader>

            {
                data.length > 0 ?
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="whitespace-nowrap">Name</TableHead>
                                    <TableHead className="whitespace-nowrap">Position</TableHead>
                                    <TableHead className="whitespace-nowrap">Job Type</TableHead>
                                    <TableHead className="whitespace-nowrap">Emotion</TableHead>
                                    <TableHead className="whitespace-nowrap">Check-in Time</TableHead>
                                    <TableHead className="whitespace-nowrap text-center">Actions</TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {
                                    data.map((att) => (
                                        <TableRow key={att.id}>
                                            <TableCell className="py-6">
                                                <span className="whitespace-nowrap">{att.employee.fullName}</span>
                                            </TableCell>
                                            <TableCell className="">
                                                <span className="whitespace-nowrap">{att.employee.position}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="whitespace-nowrap">{att.employee.jobType}</span>
                                            </TableCell>
                                            <TableCell>
                                                <CustomBadge status={att.status} />
                                            </TableCell>
                                            <TableCell>
                                                <span className="whitespace-nowrap font-en">{att.checkInTime}</span>
                                            </TableCell>
                                            <TableCell className="space-x-2 text-center">
                                                {/* Details Dialog */}
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant='outline' className="cursor-pointer">
                                                            Details
                                                        </Button>
                                                    </DialogTrigger>
                                                    <EmpEmotionModal empName={att.employee.fullName} emoji={att.emoji} textFeeling={att.textFeeling} checkInTime={att.checkInTime} score={att.emotionScore} />
                                                </Dialog>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                        </Table>
                    </CardContent>
                    : <CardContent className="flex items-center flex-col justify-center">
                        <Empty label="No records found" classesName="w-[300px] h-[200px]" />
                    </CardContent>
            }
        </Card>
    )
}

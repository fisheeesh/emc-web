import LocalSearch from "@/components/shared/local-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EMOTION_FILTER, IMG_URL, TSFILTER } from "@/lib/constants";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";

import EmpEmotionModal from "@/components/modals/emp-emotion-modal";
import CommonFilter from "@/components/shared/common-filter";
import CustomBadge from "@/components/shared/custom-badge";
import CustomCalendar from "@/components/shared/custom-calendar";
import Empty from "@/components/ui/empty";
import TableSkeleton from "@/components/shared/table-skeleton";
import { getInitialName } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Props {
    data: AttendanceOverviewData[]
    status: "error" | 'success' | 'pending',
    error: Error | null,
    isFetching?: boolean,
    isFetchingNextPage: boolean,
    fetchNextPage: () => void,
    hasNextPage: boolean
}

export default function AttendanceTable({ data, status, error, isFetchingNextPage, fetchNextPage, hasNextPage }: Props) {

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
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="whitespace-nowrap font-semibold">Name</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Position</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Job Type</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Emotion</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Check-in Time</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    {
                        status === 'pending' ?
                            <TableSkeleton cols={6} />
                            : status === 'error'
                                ? <TableBody>
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-10">
                                            Error: {error?.message}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                                : <TableBody>
                                    {
                                        data.map((att) => (
                                            <TableRow key={att.id}>
                                                <TableCell className="py-6">
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="size-9">
                                                            <AvatarImage src={IMG_URL + att.employee.avatar} alt={att.employee.fullName} />
                                                            <AvatarFallback>{getInitialName(att.employee.fullName)}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="whitespace-nowrap">{att.employee.fullName}</span>
                                                    </div>
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
                    }
                </Table>
                <div className="my-4 flex flex-col items-center justify-center">
                    {data.length > 0 && <Button
                        className="cursor-pointer"
                        onClick={() => fetchNextPage()}
                        disabled={!hasNextPage || isFetchingNextPage}
                        variant={!hasNextPage ? "ghost" : "secondary"}
                    >
                        {isFetchingNextPage
                            ? "Loading more..."
                            : hasNextPage
                                ? "Load More"
                                : "Nothing more to load"}
                    </Button>}
                </div>

                {data.length === 0 && status === 'success' && <div className="my-4 flex flex-col items-center justify-center">
                    <Empty label="No records found" classesName="w-[300px] h-[200px] " />
                </div>}
            </CardContent>
        </Card>
    )
}

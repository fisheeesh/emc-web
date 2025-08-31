import LocalSearch from "@/components/shared/local-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CRITICAL_DATA, EMOTION_FILTER } from "@/lib/constants";
import { Dialog, DialogTrigger } from "@radix-ui/react-dialog";

import EmpEmotionModal from "@/components/modals/emp-emotion-modal";
import CommonFilter from "@/components/shared/common-filter";
import CustomBadge from "@/components/shared/custom-badge";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";

export default function AttendanceTable() {
    const [open, setOpen] = useState(false)
    const [date, setDate] = useState<Date | undefined>(new Date())

    const formatDate = (date: Date) => {
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <Card className="rounded-md flex flex-col gap-5">
            <CardHeader className="flex flex-col lg:flex-row gap-3 lg:gap-0 justify-between">
                <div className="flex flex-col items-start gap-2 tracking-wide">
                    <CardTitle className="text-xl md:text-2xl">Attendance Overview</CardTitle>
                    <CardDescription>Select a date to view employee attendance records</CardDescription>
                </div>
                <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <LocalSearch filterValue="emp" />
                    <CommonFilter
                        filterValue="emotion"
                        filters={EMOTION_FILTER}
                        otherClasses="min-h-[44px] sm:min-w-[150px]"
                    />
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                id="date"
                                className="justify-between font-normal min-h-[44px] font-en"
                            >
                                {date ? formatDate(date) : "Select date"}
                                <ChevronDownIcon />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                            <Calendar
                                className="font-en"
                                mode="single"
                                selected={date}
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                    setDate(date)
                                    setOpen(false)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="whitespace-nowrap">Name</TableHead>
                            <TableHead className="whitespace-nowrap">Role</TableHead>
                            <TableHead className="whitespace-nowrap">Department</TableHead>
                            <TableHead className="whitespace-nowrap">Emotion</TableHead>
                            <TableHead className="whitespace-nowrap">Check-in</TableHead>
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
                                    <TableCell className="">
                                        <span className="whitespace-nowrap">Software Engineer</span>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap">{emp.department}</span>
                                    </TableCell>
                                    <TableCell>
                                        <CustomBadge score={emp.score} />
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap font-en">9:45 AM</span>
                                    </TableCell>
                                    <TableCell className="space-x-2 text-center">
                                        {/* Details Dialog */}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant='outline' className="cursor-pointer">
                                                    Details
                                                </Button>
                                            </DialogTrigger>
                                            <EmpEmotionModal />
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

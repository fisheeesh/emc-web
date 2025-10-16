import bronze from "@/assets/bronze-medal.svg";
import gold from "@/assets/gold-medal.svg";
import silver from "@/assets/silver-medal.svg";
import CommonFilter from "@/components/shared/common-filter";
import LocalSearch from "@/components/shared/local-search";
import TableSkeleton from "@/components/shared/table-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Empty from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IMG_URL, LEADERBOARD_FILTER } from "@/lib/constants";
import { getInitialName } from "@/lib/utils";
import { MdOutlineEmail } from "react-icons/md";

interface Props {
    data: LeaderboardData[],
    isLoading: boolean
}

export default function LeaderBoardTable({ data, isLoading }: Props) {
    const renderRank = (rank: number) => {
        if (rank === 1) {
            return (
                <img
                    src={gold}
                    alt="Gold Medal"
                    className="size-8 mx-auto"
                />
            );
        } else if (rank === 2) {
            return (
                <img
                    src={silver}
                    alt="Silver Medal"
                    className="size-8 mx-auto"
                />
            );
        } else if (rank === 3) {
            return (
                <img
                    src={bronze}
                    alt="Bronze Medal"
                    className="size-8 mx-auto"
                />
            );
        } else {
            return (
                <span className="whitespace-nowrap font-en">
                    {rank}
                </span>
            );
        }
    };

    return (
        <Card className="rounded-md flex flex-col gap-5">
            <CardHeader className="space-y-2">
                <div className="flex flex-col xl:flex-row gap-3 xl:gap-0 justify-between">
                    <div className="flex flex-col items-start gap-2 tracking-wide">
                        <CardTitle className="text-xl md:text-2xl">Wellbeing Champions Leaderboard</CardTitle>
                        <CardDescription>
                            Top <span className="font-en">7</span> employees excelling in mental health and wellbeing initiatives - celebrating those who prioritize their wellness journey
                        </CardDescription>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row gap-2">
                    <LocalSearch filterValue="lKw" />
                    <CommonFilter
                        filterValue="lduration"
                        filters={LEADERBOARD_FILTER}
                        otherClasses="min-h-[44px] sm:min-w-[90px]"
                    />
                </div>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="whitespace-nowrap font-semibold w-32 text-center">#</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold w-2/4">Employee's Name</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Department</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Total Points</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Streak</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Contact</TableHead>
                        </TableRow>
                    </TableHeader>

                    {
                        isLoading ?
                            <TableSkeleton cols={6} rows={7} />
                            : <TableBody>
                                {
                                    data.map((emp, index) => (
                                        <TableRow key={index}>
                                            <TableCell className="py-6 w-32 text-center">
                                                {renderRank(emp.rank)}
                                            </TableCell>
                                            <TableCell className="w-2/4">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="size-9">
                                                        <AvatarImage src={IMG_URL + emp.avatar} alt={emp.fullName} />
                                                        <AvatarFallback>{getInitialName(emp.fullName)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="whitespace-nowrap">{emp.fullName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="whitespace-nowrap">{emp.department.name}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="whitespace-nowrap font-en">{emp.points}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="whitespace-nowrap font-en">{!emp.streak ? '—' : emp.streak}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button size='icon' className="p-2 rounded-full bg-muted dark:text-white text-black cursor-pointer hover:bg-gray-200 dark:hover:bg-slate-700">
                                                    <MdOutlineEmail />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                }
                            </TableBody>
                    }
                </Table>

                {data.length === 0 && !isLoading && <div className="my-4 flex flex-col items-center justify-center">
                    <Empty label="No records found" classesName="w-[300px] h-[200px] " />
                </div>}
            </CardContent>
        </Card>
    );
}
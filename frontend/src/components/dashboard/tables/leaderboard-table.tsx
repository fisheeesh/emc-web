import bronze from "@/assets/bronze-medal.svg";
import gold from "@/assets/gold-medal.svg";
import silver from "@/assets/silver-medal.svg";
import CommonFilter from "@/components/shared/common-filter";
import LocalSearch from "@/components/shared/local-search";
import StreakFireIcon from "@/components/shared/streak-fire-icon";
import TableSkeleton from "@/components/shared/table-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Empty from "@/components/ui/empty";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LEADERBOARD_FILTER } from "@/lib/constants";
import { getInitialName } from "@/lib/utils";
import { GiChampions } from "react-icons/gi";

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
                        <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
                            <GiChampions className="text-[26px] text-amber-500 drop-shadow-[0_2px_4px_rgba(245,158,11,0.4)]" />
                            <span className="bg-gradient-to-r from-yellow-600 via-amber-500 to-orange-600 bg-clip-text text-transparent font-bold">
                                Wellbeing Champions Leaderboard
                            </span>
                        </CardTitle>
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
                            <TableHead className="whitespace-nowrap font-semibold w-2/5">Employee's Name</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Contact</TableHead>
                            <TableHead className="whitespace-nowrap font-semibold">Department</TableHead>
                            <TableHead className="whitespace-nowrap text-center font-semibold">Streak</TableHead>
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
                                            <TableCell className="w-2/5">
                                                <div className="flex items-center gap-4">
                                                    <Avatar className="size-9">
                                                        <AvatarImage src={emp.avatar} alt={emp.fullName} />
                                                        <AvatarFallback>{getInitialName(emp.fullName)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="whitespace-nowrap">{emp.fullName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="whitespace-nowrap font-en">{emp.email}</span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="whitespace-nowrap">{emp.department.name}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {!emp.streak ?
                                                    <span className="whitespace-nowrap font-en text-gray-400">—</span>
                                                    : <StreakFireIcon value={emp.streak} />
                                                }
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
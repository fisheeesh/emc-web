import bronze from "@/assets/bronze-medal.svg";
import gold from "@/assets/gold-medal.svg";
import silver from "@/assets/silver-medal.svg";
import CommonFilter from "@/components/shared/common-filter";
import LocalSearch from "@/components/shared/local-search";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IMG_URL, LEADERBOARD, LEADERBOARD_FILTER } from "@/lib/constants";
import { getInitialName } from "@/lib/utils";
import { MdOutlineEmail } from "react-icons/md";

export default function LeaderBoardTable() {
    const renderRank = (index: number) => {
        const rank = index + 1;

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

                    <TableBody>
                        {
                            LEADERBOARD.map((emp, index) => (
                                <TableRow key={emp.id}>
                                    <TableCell className="py-6 w-32 text-center">
                                        {renderRank(index)}
                                    </TableCell>
                                    <TableCell className="w-2/4">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="size-9">
                                                <AvatarImage src={IMG_URL} alt={emp.name} />
                                                <AvatarFallback>{getInitialName(emp.name)}</AvatarFallback>
                                            </Avatar>
                                            <span className="whitespace-nowrap">{emp.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="whitespace-nowrap">{emp.department}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="whitespace-nowrap font-en">{emp.points}</span>
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <span className="whitespace-nowrap font-en">{emp.streak === 0 ? '-' : emp.streak}</span>
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
                </Table>
            </CardContent>
        </Card>
    );
}
import bronze from "@/assets/bronze-medal.svg";
import first from "@/assets/first.svg";
import gold from "@/assets/gold-medal.svg";
import second from "@/assets/second.svg";
import silver from "@/assets/silver-medal.svg";
import third from "@/assets/third.svg";
import CommonFilter from "@/components/shared/common-filter";
import StreakFireIcon from "@/components/shared/streak-fire-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Empty from "@/components/ui/empty";
import { LEADERBOARD_FILTER } from "@/lib/constants";
import { getInitialName } from "@/lib/utils";
import { GiChampions } from "react-icons/gi";
import crown from "@/assets/crown.webp"

interface Props {
    data: LeaderboardData[],
    isLoading: boolean
}

export default function LeaderBoardTable({ data, isLoading }: Props) {
    const top3 = data.slice(0, 3);
    const remaining = data.slice(3);

    const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

    const getMedalImage = (rank: number) => {
        if (rank === 2) return silver;
        if (rank === 1) return gold;
        if (rank === 3) return bronze;
        return "";
    };

    const getPodiumImage = (index: number) => {
        if (index === 2) return second;
        if (index === 1) return first;
        if (index === 3) return third;
        return "";
    };

    if (isLoading) {
        return (
            <Card className="rounded-md">
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
                                Top <span className="font-en">9</span> employees excelling in mental health and wellbeing initiatives
                            </CardDescription>
                        </div>
                        <CommonFilter
                            filterValue="lduration"
                            filters={LEADERBOARD_FILTER}
                            otherClasses="min-h-[44px] sm:min-w-[90px] w-fit"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (data.length === 0) {
        return (
            <Card className="rounded-md">
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
                                Top <span className="font-en">9</span> employees excelling in mental health and wellbeing initiatives
                            </CardDescription>
                        </div>
                        <CommonFilter
                            filterValue="lduration"
                            filters={LEADERBOARD_FILTER}
                            otherClasses="min-h-[44px] sm:min-w-[90px] w-fit"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="my-4 flex flex-col items-center justify-center">
                        <Empty label="No records found" classesName="w-[300px] h-[200px]" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="rounded-md">
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
                            Top <span className="font-en">9</span> employees excelling in mental health and wellbeing initiatives - celebrating those who prioritize their wellness journey
                        </CardDescription>
                    </div>
                    <CommonFilter
                        filterValue="lduration"
                        filters={LEADERBOARD_FILTER}
                        otherClasses="min-h-[44px] sm:min-w-[90px] w-fit"
                    />
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-center">
                    {top3.length > 0 && (
                        <div className="w-full col-span-1 lg:col-span-2">
                            <div className="p-4 sm:p-6">
                                <div className="flex items-end justify-center">
                                    {podiumOrder.map((emp, index) => {
                                        const isFirst = index === 1;
                                        const podiumNumber = index === 0 ? "2" : index === 1 ? "1" : "3";

                                        return (
                                            <div
                                                key={emp.rank}
                                                className={`flex flex-col items-center ${isFirst
                                                    ? 'w-20 sm:w-24 md:w-28 lg:w-32'
                                                    : 'w-16 sm:w-20 md:w-24 lg:w-28'
                                                    }`}
                                            >
                                                <div className="relative mb-2 sm:mb-3">
                                                    <Avatar className={`${isFirst
                                                        ? 'size-12 md:size-14 lg:size-16'
                                                        : 'size-10 md:size-12 lg:size-14'
                                                        } border-2 sm:border-3 ${index === 0 ? 'border-gray-400' :
                                                            index === 1 ? 'border-yellow-400' :
                                                                'border-amber-600'
                                                        } shadow-xl`}>
                                                        <AvatarImage src={emp.avatar} alt={emp.fullName} />
                                                        <AvatarFallback className={`${isFirst ? 'text-sm sm:text-base md:text-lg' : 'text-xs sm:text-sm md:text-base'
                                                            } font-bold`}>
                                                            {getInitialName(emp.fullName)}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <div className="absolute -top-1 -right-1">
                                                        <img
                                                            src={getMedalImage(emp.rank)}
                                                            alt={`${emp.rank} place`}
                                                            className={`${isFirst
                                                                ? 'size-5 sm:size-6 md:size-7'
                                                                : 'size-4 sm:size-5 md:size-6'
                                                                } drop-shadow-lg`}
                                                        />
                                                    </div>
                                                </div>

                                                <h3 className={`font-semibold ${isFirst ? 'text-[10px] sm:text-xs md:text-sm' : 'text-[9px] sm:text-[10px] md:text-xs'
                                                    } text-center mb-1 line-clamp-1 px-1`}>
                                                    {emp.fullName}
                                                </h3>

                                                <div className="mb-2 sm:mb-3">
                                                    <StreakFireIcon value={emp.streak} />
                                                </div>

                                                <div className="relative w-full">
                                                    <img
                                                        src={getPodiumImage(emp.rank)}
                                                        alt={`Rank ${emp.rank}`}
                                                        className="w-full h-auto"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className={`font-bold text-white ${isFirst
                                                            ? 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl'
                                                            : 'text-2xl sm:text-3xl md:text-4xl lg:text-5xl'
                                                            }`}>
                                                            {podiumNumber}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {remaining.length > 0 && (
                        <div className="w-full col-span-1 lg:col-span-3 space-y-2">
                            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted/60 rounded-lg font-semibold text-sm">
                                <div className="col-span-1 text-center">#</div>
                                <div className="col-span-6">NAME</div>
                                <div className="col-span-5 text-right">STREAK</div>
                            </div>

                            {remaining.map((emp) => (
                                <div
                                    key={emp.rank}
                                    className="grid grid-cols-12 gap-4 items-center px-6 py-4 bg-card rounded-lg border"
                                >
                                    <div className="hidden md:flex flex-col col-span-1 space-y-1 items-center justify-center">
                                        <span className="font-medium">{emp.rank}</span>
                                        <img src={crown} alt="crown" className="w-7 h-4" />
                                    </div>

                                    <div className="col-span-10 flex items-center gap-3">
                                        <span className="md:hidden font-bold text-lg">{emp.rank}</span>
                                        <Avatar className="size-10 border-2 border-muted flex-shrink-0">
                                            <AvatarImage src={emp.avatar} alt={emp.fullName} />
                                            <AvatarFallback className="text-sm">
                                                {getInitialName(emp.fullName)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0 flex-1">
                                            <p className="font-medium truncate">{emp.fullName}</p>
                                        </div>
                                    </div>

                                    <div className="col-span-2 md:col-span-1 flex items-center justify-between md:justify-end gap-2">
                                        <StreakFireIcon value={emp.streak} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
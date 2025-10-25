import { IoIosTrendingUp, IoIosTrendingDown } from "react-icons/io";
import { Smile, AlertTriangle, CheckCircle2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

interface Props {
    data: SummaryData
    isLoading: boolean
}

export function SummaryCards({ data, isLoading }: Props) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:flex-row w-full">
            <Card>
                <CardHeader>
                    <CardDescription className="flex items-center gap-2">
                        <Smile className="size-4" />
                        Overall Wellbeing
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums font-en">
                        {isLoading ? (
                            <Skeleton className="h-10 w-24" />
                        ) : (
                            `${data.wellbeing.score}/${data.wellbeing.maxScore}`
                        )}
                    </CardTitle>
                    <CardAction>
                        {isLoading ? (
                            <Skeleton className="h-6 w-16" />
                        ) : (
                            <Badge variant="outline" className="gap-1">
                                {data.wellbeing.trend === 'up' ? <IoIosTrendingUp /> : <IoIosTrendingDown />}
                                <span className="font-en">
                                    {data.wellbeing.change > 0 ? '+' : ''}{data.wellbeing.change}%
                                </span>
                            </Badge>
                        )}
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-40" />
                        </>
                    ) : (
                        <>
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                {data.wellbeing.trend === 'up' ? 'Improving' : 'Declining'} this month{' '}
                                {data.wellbeing.trend === 'up' ? <IoIosTrendingUp className="size-4" /> : <IoIosTrendingDown className="size-4" />}
                            </div>
                            <div className="text-muted-foreground">
                                Average emotion score {data.wellbeing.trend === 'up' ? 'increasing' : 'decreasing'}
                            </div>
                        </>
                    )}
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardDescription className="flex items-center gap-2">
                        <AlertTriangle className="size-4" />
                        Critical Alerts
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums font-en">
                        {isLoading ? (
                            <Skeleton className="h-10 w-16" />
                        ) : (
                            data.criticalAlerts.count
                        )}
                    </CardTitle>
                    <CardAction>
                        {isLoading ? (
                            <Skeleton className="h-6 w-16" />
                        ) : (
                            <Badge variant="outline" className="gap-1">
                                {data.criticalAlerts.trend === 'down' ? <IoIosTrendingDown /> : <IoIosTrendingUp />}
                                <span className="font-en">
                                    {data.criticalAlerts.change > 0 ? '+' : ''}{data.criticalAlerts.change}
                                </span>
                            </Badge>
                        )}
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-4 w-40" />
                        </>
                    ) : (
                        <>
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                <span className="font-en">{data.criticalAlerts.resolvedThisMonth}</span> resolved this month{' '}
                                <IoIosTrendingDown className="size-4" />
                            </div>
                            <div className="text-muted-foreground">
                                Active critical & watchlist cases
                            </div>
                        </>
                    )}
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardDescription className="flex items-center gap-2">
                        <CheckCircle2 className="size-4" />
                        Check-in Rate
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums font-en">
                        {isLoading ? (
                            <Skeleton className="h-10 w-20" />
                        ) : (
                            `${data.checkInRate.rate}%`
                        )}
                    </CardTitle>
                    <CardAction>
                        {isLoading ? (
                            <Skeleton className="h-6 w-16" />
                        ) : (
                            <Badge variant="outline" className="gap-1">
                                {data.checkInRate.trend === 'up' ? <IoIosTrendingUp /> : <IoIosTrendingDown />}
                                <span className="font-en">
                                    {data.checkInRate.change > 0 ? '+' : ''}{data.checkInRate.change}%
                                </span>
                            </Badge>
                        )}
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-44" />
                        </>
                    ) : (
                        <>
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                {data.checkInRate.trend === 'up' ? 'Strong' : 'Declining'} engagement{' '}
                                {data.checkInRate.trend === 'up' ? <IoIosTrendingUp className="size-4" /> : <IoIosTrendingDown className="size-4" />}
                            </div>
                            <div className="text-muted-foreground">
                                Daily attendance & emotion tracking
                            </div>
                        </>
                    )}
                </CardFooter>
            </Card>

            <Card>
                <CardHeader>
                    <CardDescription className="flex items-center gap-2">
                        <Users className="size-4" />
                        Positive Emotion Rate
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums font-en">
                        {isLoading ? (
                            <Skeleton className="h-10 w-20" />
                        ) : (
                            `${data.positiveRate.rate}%`
                        )}
                    </CardTitle>
                    <CardAction>
                        {isLoading ? (
                            <Skeleton className="h-6 w-16" />
                        ) : (
                            <Badge variant="outline" className="gap-1">
                                {data.positiveRate.trend === 'up' ? <IoIosTrendingUp /> : <IoIosTrendingDown />}
                                <span className="font-en">
                                    {data.positiveRate.change > 0 ? '+' : ''}{data.positiveRate.change}%
                                </span>
                            </Badge>
                        )}
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    {isLoading ? (
                        <>
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-4 w-44" />
                        </>
                    ) : (
                        <>
                            <div className="line-clamp-1 flex gap-2 font-medium">
                                Employees feeling {data.positiveRate.trend === 'up' ? 'better' : 'worse'}{' '}
                                {data.positiveRate.trend === 'up' ? <IoIosTrendingUp className="size-4" /> : <IoIosTrendingDown className="size-4" />}
                            </div>
                            <div className="text-muted-foreground">
                                Positive & neutral emotions this month
                            </div>
                        </>
                    )}
                </CardFooter>
            </Card>
        </div>
    )
}
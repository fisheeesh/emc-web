import { IoIosTrendingUp, IoIosTrendingDown } from "react-icons/io";
import { Smile, AlertTriangle, CheckCircle2, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:flex-row w-full">
            {/* Overall Wellbeing Score */}
            <Card>
                <CardHeader>
                    <CardDescription className="flex items-center gap-2">
                        <Smile className="size-4" />
                        Overall Wellbeing
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums font-en">
                        3.2/4.0
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className="gap-1">
                            <IoIosTrendingUp />
                            <span className="font-en">+5.2%</span>
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Improving this month <IoIosTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Average emotion score increasing
                    </div>
                </CardFooter>
            </Card>

            {/* Critical Alerts */}
            <Card>
                <CardHeader>
                    <CardDescription className="flex items-center gap-2">
                        <AlertTriangle className="size-4" />
                        Critical Alerts
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums font-en">
                        8
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className="gap-1">
                            <IoIosTrendingDown />
                            <span className="font-en">-3</span>
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        <span className="font-en">5</span> resolved this month <IoIosTrendingDown className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Active critical & watchlist cases
                    </div>
                </CardFooter>
            </Card>

            {/* Check-in Rate */}
            <Card>
                <CardHeader>
                    <CardDescription className="flex items-center gap-2">
                        <CheckCircle2 className="size-4" />
                        Check-in Rate
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums font-en">
                        94.3%
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className="gap-1">
                            <IoIosTrendingUp />
                            <span className="font-en">+2.1%</span>
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Strong engagement <IoIosTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Daily attendance & emotion tracking
                    </div>
                </CardFooter>
            </Card>

            {/* Positive Rate */}
            <Card>
                <CardHeader>
                    <CardDescription className="flex items-center gap-2">
                        <Users className="size-4" />
                        Positive Emotion Rate
                    </CardDescription>
                    <CardTitle className="text-2xl font-semibold tabular-nums font-en">
                        78.5%
                    </CardTitle>
                    <CardAction>
                        <Badge variant="outline" className="gap-1">
                            <IoIosTrendingUp />
                            <span className="font-en">+8.5%</span>
                        </Badge>
                    </CardAction>
                </CardHeader>
                <CardFooter className="flex-col items-start gap-1.5 text-sm">
                    <div className="line-clamp-1 flex gap-2 font-medium">
                        Employees feeling good <IoIosTrendingUp className="size-4" />
                    </div>
                    <div className="text-muted-foreground">
                        Positive & neutral emotions this month
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
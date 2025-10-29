import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Settings, TrendingUp, TrendingDown, Minus, AlertTriangle, Clock } from "lucide-react";
import { MdEdit } from "react-icons/md";
import { useState } from "react";
import EditSystemSettingsModal from "@/components/modals/edit-system-settings.modal";
import moment from "moment";
import { FcLock } from "react-icons/fc";

interface SystemSettingsProps {
    data: SystemSettings
}

export default function SystemSettingsCard({ data }: SystemSettingsProps) {
    const [editOpen, setEditOpen] = useState(false);

    const settings = [
        {
            icon: TrendingUp,
            label: "Positive Range",
            min: data.positiveMin,
            max: data.positiveMax,
            description: "Score range for positive emotions",
            color: "from-green-500 to-emerald-500",
            bgColor: "bg-green-100 dark:bg-green-950",
            iconColor: "text-green-600 dark:text-green-400"
        },
        {
            icon: Minus,
            label: "Neutral Range",
            min: data.neutralMin,
            max: data.neutralMax,
            description: "Score range for neutral emotions",
            color: "from-purple-500 to-violet-500",
            bgColor: "bg-purple-100 dark:bg-purple-950",
            iconColor: "text-purple-600 dark:text-purple-400",
        },
        {
            icon: TrendingDown,
            label: "Negative Range",
            min: data.negativeMin,
            max: data.negativeMax,
            description: "Score range for negative emotions",
            color: "from-orange-500 to-amber-500",
            bgColor: "bg-orange-100 dark:bg-orange-950",
            iconColor: "text-orange-600 dark:text-orange-400"
        },
        {
            icon: AlertTriangle,
            label: "Critical Range",
            min: data.criticalMin,
            max: data.criticalMax,
            description: "Score range triggering critical alerts",
            color: "from-red-500 to-rose-500",
            bgColor: "bg-red-100 dark:bg-red-950",
            iconColor: "text-red-600 dark:text-red-400"
        },
        {
            icon: Clock,
            label: "Watchlist Duration",
            value: data.watchlistTrackMin,
            description: "Days to track watchlist employees",
            color: "from-blue-500 to-cyan-500",
            bgColor: "bg-blue-100 dark:bg-blue-950",
            iconColor: "text-blue-600 dark:text-blue-400",
            suffix: " days"
        }
    ];

    return (
        <Card className="w-full">
            <CardHeader className="space-y-2">
                <div className="flex flex-col xl:flex-row gap-3 xl:gap-0 justify-between">
                    <div className="flex flex-col items-start gap-2 tracking-wide">
                        <CardTitle className="text-xl md:text-2xl line-clamp-1 flex items-center gap-2">
                            <Settings className="w-6 h-6" />
                            System Settings
                        </CardTitle>
                        <CardDescription className="line-clamp-1">
                            Emotion scoring ranges and tracking parameters
                        </CardDescription>
                    </div>
                    <div className="flex flex-col xl:flex-row xl:items-center gap-2">
                        <Dialog open={editOpen} onOpenChange={setEditOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    size='sm'
                                    className="bg-gradient text-white cursor-pointer w-fit min-h-[44px]"
                                >
                                    <MdEdit />
                                    Edit Settings
                                </Button>
                            </DialogTrigger>
                            {editOpen && (
                                <EditSystemSettingsModal
                                    data={data}
                                    onClose={() => setEditOpen(false)}
                                />
                            )}
                        </Dialog>
                    </div>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {settings.map((setting, index) => {
                        const Icon = setting.icon;
                        return (
                            <div
                                key={index}
                                className="relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4"
                            >
                                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${setting.color} opacity-5 rounded-full -mr-12 -mt-12`} />

                                <div className="relative space-y-3">
                                    <div className={`w-12 h-12 rounded-xl ${setting.bgColor} flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${setting.iconColor}`} />
                                    </div>

                                    <div>
                                        {setting.value !== undefined ? (
                                            <p className={`text-3xl font-bold font-en bg-gradient-to-r ${setting.color} bg-clip-text text-transparent`}>
                                                {setting.value}{setting.suffix || ''}
                                            </p>
                                        ) : (
                                            <p className={`text-2xl font-bold font-en bg-gradient-to-r ${setting.color} bg-clip-text text-transparent`}>
                                                {setting.min} to {setting.max}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {setting.label}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {setting.description}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                            Last updated: <span className="font-en font-medium">{moment(data.updatedAt).format('LLLL')}</span>
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5">
                            <FcLock className="mb-0.5 size-3.5" /> Emotion thresholds are locked to preserve data integrity
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
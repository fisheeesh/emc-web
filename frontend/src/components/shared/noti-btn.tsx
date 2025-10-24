import defaultPfp from "@/assets/default_pfp.svg";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IMG_URL } from "@/lib/constants";
import useNotiStore from "@/store/noti-store";
import { Bell, BellOff, Eye, Trash2 } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import useMarkAsRead from "@/hooks/ui/use-read-noti";
import useDeleteNoti from "@/hooks/ui/use-delete-noti";
import { cn } from "@/lib/utils";

export default function NotiBtn() {
    const { notifications } = useNotiStore()
    const { markAsRead } = useMarkAsRead()
    const { deleteNoti } = useDeleteNoti()
    const [filter, setFilter] = useState<"all" | "unread">("all")

    const handleMarkAsRead = (e: React.MouseEvent, notiId: number) => {
        e.preventDefault()
        e.stopPropagation()
        markAsRead(notiId)
    }

    const handleDelete = (e: React.MouseEvent, notiId: number) => {
        e.preventDefault()
        e.stopPropagation()
        deleteNoti(notiId)
    }

    //? Get unread notifications count
    const unreadCount = notifications.filter(noti => noti.status === "SENT").length

    //? Filter notifications based on selected tab
    const filteredNotifications = filter === "all"
        ? notifications
        : notifications.filter(noti => noti.status === "SENT")

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    variant="outline"
                    className="cursor-pointer relative"
                >
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="h-5 min-w-5 absolute -top-2 -right-2 rounded-full px-1 font-en"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                    <Bell />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[380px] h-[350px] flex flex-col p-0"
                align="end"
            >
                <div className="flex items-center justify-between px-2 pt-2 pb-2 border-b sticky top-0 z-10">
                    <h2 className="font-medium text-xl">Notifications</h2>
                    <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")} className="w-[90px]">
                        <TabsList className="h-[28px]">
                            <TabsTrigger value="all" className="text-[10px] cursor-pointer py-0">
                                All
                            </TabsTrigger>
                            <TabsTrigger value="unread" className="text-[10px] cursor-pointer py-0">
                                Unread
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                <div className="overflow-y-auto flex-1 p-2 space-y-2 no-scrollbar">
                    {filteredNotifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2">
                            <BellOff className="h-12 w-12 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">
                                {filter === "unread" ? "No unread notifications" : "No notifications at all"}
                            </p>
                        </div>
                    ) : (
                        filteredNotifications.map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                onSelect={(e) => e.preventDefault()}
                                className={cn(
                                    "flex items-start gap-3 p-3 rounded-md hover:bg-muted/50 group relative",
                                    item.status === "SENT" && "bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900"
                                )}
                            >
                                {item.status === "SENT" && (
                                    <div className="absolute top-3 left-1 h-2 w-2 rounded-full bg-blue-500" />
                                )}

                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={IMG_URL + item.avatar} alt={item.avatar} />
                                    <AvatarFallback>
                                        <img src={defaultPfp} alt="default_pfp" className="dark:invert" />
                                    </AvatarFallback>
                                </Avatar>

                                <div className="flex-1">
                                    <p className={cn(
                                        "text-xs mt-1",
                                        item.status === "SENT" ? "text-foreground font-medium" : "text-muted-foreground"
                                    )}>
                                        {item.content}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[11px] text-muted-foreground italic mt-1 font-en">
                                            {moment(item.createdAt).fromNow()}
                                        </p>
                                        <div
                                            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            onMouseDown={(e) => e.stopPropagation()}
                                        >
                                            {item.status === "SENT" && (
                                                <Button
                                                    variant='ghost'
                                                    size='sm'
                                                    type="button"
                                                    onClick={(e) => handleMarkAsRead(e, item.id)}
                                                    className="p-0 border-0 cursor-pointer bg-transparent"
                                                >
                                                    <Eye
                                                        className="h-3.5 w-3.5 text-muted-foreground"
                                                    />
                                                </Button>
                                            )}
                                            <Button
                                                variant='ghost'
                                                size='sm'
                                                type="button"
                                                onClick={(e) => handleDelete(e, item.id)}
                                                className="p-0 border-0 bg-transparent cursor-pointer"
                                            >
                                                <Trash2
                                                    className="h-3.5 w-3.5 text-muted-foreground h"
                                                />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
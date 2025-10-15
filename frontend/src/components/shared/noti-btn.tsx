import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, BellOff } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useNotiStore from "@/store/noti-store";
import { IMG_URL } from "@/lib/constants";

export default function NotiBtn() {
    const { notifications } = useNotiStore()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    variant="outline"
                    className="cursor-pointer relative"
                >
                    {!!notifications.length && <Badge
                        variant="destructive"
                        className="h-5 min-w-5 absolute -top-2 -right-2 rounded-full px-1"
                    >
                        {notifications.length}
                    </Badge>}
                    <Bell />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[350px] h-[350px] flex flex-col p-0"
                align="end"
            >
                {/* Sticky Header */}
                <div className="flex items-center justify-between px-2 pt-2 pb-2 border-b 
                    sticky top-0 z-10">
                    <h2 className="font-medium text-xl">Notifications</h2>
                    <Tabs defaultValue="all" className="w-[90px]">
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

                {/* Scrollable Notification List */}
                <div className="overflow-y-auto flex-1 p-2 space-y-2">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full gap-2">
                            <BellOff className="h-12 w-12 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">No notifications at all</p>
                        </div>
                    ) : (
                        notifications.map((item) => (
                            <DropdownMenuItem
                                key={item.id}
                                className="cursor-pointer flex items-start gap-3 p-3 rounded-md hover:bg-muted/50"
                            >
                                {/* Avatar */}
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={IMG_URL + item.avatar} alt={item.avatar} />
                                    <AvatarFallback>
                                        U
                                    </AvatarFallback>
                                </Avatar>

                                {/* Notification Content */}
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground mt-1">{item.content}</p>
                                    <p className="text-[11px] text-muted-foreground italic mt-1 font-en">
                                        {item.createdAt}
                                    </p>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
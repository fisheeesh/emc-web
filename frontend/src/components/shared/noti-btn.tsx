import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const notiList = [
    {
        id: 1,
        name: "John Doe",
        image: "https://randomuser.me/api/portraits/men/32.jpg",
        status: "Critical",
        message: "John Doe’s sentiment has dropped to critical. Please review.",
        time: "2 mins ago",
    },
    {
        id: 2,
        name: "Jane Smith",
        image: "https://randomuser.me/api/portraits/women/45.jpg",
        status: "Critical",
        message: "Jane Smith requires attention. Status marked as critical.",
        time: "30 mins ago",
    },
    {
        id: 3,
        name: "Michael Lee",
        image: "https://randomuser.me/api/portraits/men/52.jpg",
        status: "Warning",
        message: "Michael Lee’s sentiment is trending negative.",
        time: "1 hour ago",
    },
    {
        id: 4,
        name: "Michael Lee",
        image: "https://randomuser.me/api/portraits/men/52.jpg",
        status: "Warning",
        message: "Michael Lee’s sentiment is trending negative.",
        time: "1 hour ago",
    },
    {
        id: 5,
        name: "Michael Lee",
        image: "https://randomuser.me/api/portraits/men/52.jpg",
        status: "Warning",
        message: "Michael Lee’s sentiment is trending negative.",
        time: "1 hour ago",
    },
];

export default function NotiBtn() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    variant="outline"
                    className="cursor-pointer relative"
                >
                    <Badge
                        variant="destructive"
                        className="h-5 min-w-5 absolute -top-2 -right-2 rounded-full px-1"
                    >
                        {notiList.length}
                    </Badge>
                    <Bell />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-[320px] h-[350px] flex flex-col p-0"
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
                    {notiList.map((item) => (
                        <DropdownMenuItem
                            key={item.id}
                            className="cursor-pointer flex items-start gap-3 p-3 rounded-md hover:bg-muted/50"
                        >
                            {/* Avatar */}
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={item.image} alt={item.name} />
                                <AvatarFallback>
                                    {item.name
                                        .split(" ")
                                        .map((n) => n[0])
                                        .join("")}
                                </AvatarFallback>
                            </Avatar>

                            {/* Notification Content */}
                            <div className="flex-1">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-semibold">{item.name}</p>
                                    <span
                                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${item.status === "Critical"
                                            ? "bg-red-100 text-red-600"
                                            : item.status === "Warning"
                                                ? "bg-yellow-100 text-yellow-600"
                                                : "bg-gray-100 text-gray-600"
                                            }`}
                                    >
                                        {item.status}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{item.message}</p>
                                <p className="text-[11px] text-muted-foreground italic mt-1">
                                    {item.time}
                                </p>
                            </div>
                        </DropdownMenuItem>
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
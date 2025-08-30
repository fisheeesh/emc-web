import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "../ui/badge";

const notiList = [
    {
        id: 1,
        title: 'New message',
        description: 'You have a new message',
        time: '1 hour ago',
    },
    {
        id: 2,
        title: 'New message',
        description: 'You have a new message',
        time: '1 hour ago',
    },
    {
        id: 3,
        title: 'New message',
        description: 'You have a new message',
        time: '1 hour ago',
    },
]

export default function NotiBtn() {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size='icon' variant='outline' className='cursor-pointer relative'>
                    <Badge variant='destructive' className="h-5 min-w-5 absolute -top-2 -right-2 rounded-full px-1">
                        3
                    </Badge>
                    <Bell />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                {
                    notiList.map(item => (
                        <DropdownMenuItem key={item.id} className="cursor-pointer flex items-start justify-between mb-3 last:mb-0">
                            <div className="flex flex-col space-y-3">
                                <p className="text-sm font-medium leading-none">{item.title}</p>
                                <p className="text-xs leading-none text-muted-foreground">{item.description}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{item.time}</p>
                        </DropdownMenuItem>
                    ))
                }
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

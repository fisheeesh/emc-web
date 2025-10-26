import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IMG_URL } from "@/lib/constants";
import useUserStore from "@/store/user-store";
import { FaRegCalendarCheck } from "react-icons/fa";
import { IoMdLogOut } from "react-icons/io";
import { LuLayoutDashboard } from "react-icons/lu";
import { MdOutlineSettings } from "react-icons/md";
import { Link } from "react-router";
import LogoutModal from "../modals/log-out-modal";
import { Button } from "../ui/button";
import { Dialog, DialogTrigger } from "../ui/dialog";
import CustomBadge from "./custom-badge";
import { MdOutlineAnalytics } from "react-icons/md";

export default function AuthDropdown() {
    const { user } = useUserStore()

    const initialName = `${user?.fullName.split(" ")[0]?.charAt(0).toUpperCase()}${user?.fullName.split(" ")[1]?.charAt(0).toUpperCase()}`

    return (
        <Dialog>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" className="size-8 rounded-full cursor-pointer">
                        <Avatar className="size-9">
                            <AvatarImage src={IMG_URL + user?.avatar} alt={user?.fullName} />
                            <AvatarFallback>{initialName}</AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-85" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal mb-1 flex items-center justify-between">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none truncate">{user?.fullName}</p>
                            <p className="text-xs leading-none text-muted-foreground truncate font-en">{user?.email}</p>
                        </div>
                        <CustomBadge value={user?.role as string} />
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link to='dashboard/sentiments' className="whitespace-nowrap">
                                <LuLayoutDashboard className="size-4 text-black mr-1 dark:text-white" aria-hidden="true" />
                                Sentiments Dashboard
                                <DropdownMenuShortcut>⇧⌘S</DropdownMenuShortcut>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link to='dashboard/attendance' className="whitespace-nowrap">
                                <FaRegCalendarCheck className="size-4 text-black mr-1 dark:text-white" aria-hidden="true" />
                                Attendance Dashboard
                                <DropdownMenuShortcut>⇧⌘A</DropdownMenuShortcut>
                            </Link>
                        </DropdownMenuItem>
                        {
                            user?.role === 'SUPERADMIN' && <>
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link to='dashboard/analytics' className="whitespace-nowrap">
                                        <MdOutlineAnalytics className="size-4 text-black mr-1 dark:text-white" aria-hidden="true" />
                                        Analytics Dashboard
                                        <DropdownMenuShortcut>⇧⌘G</DropdownMenuShortcut>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild className="cursor-pointer">
                                    <Link to='dashboard/managements'>
                                        <MdOutlineSettings className="size-4 text-black mr-1 dark:text-white" aria-hidden="true" />
                                        General Managements
                                        <DropdownMenuShortcut>⌘M</DropdownMenuShortcut>
                                    </Link>
                                </DropdownMenuItem>
                            </>
                        }
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <DialogTrigger asChild>
                            <Button variant="ghost" className="w-full justify-start px-2 py-1.5">
                                <IoMdLogOut className="size-4 mr-1 text-sm dark:text-white" aria-hidden="true" />
                                Logout
                                <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
                            </Button>
                        </DialogTrigger>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <LogoutModal />
        </Dialog>
    )
}
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LuEarth } from "react-icons/lu";
import { Button } from "../ui/button";
import { useState } from "react";

type Lng = "en" | "mm" | "th"

export default function LngBtn() {
    const [lng] = useState<Lng>('en');

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    size="icon"
                    variant="outline"
                    className="cursor-pointer relative"
                >
                    <LuEarth />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuCheckboxItem className="cursor-pointer" checked={lng === "en"}>English</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem className="cursor-pointer" checked={lng === "mm"} >Burmese</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem className="cursor-pointer" checked={lng === "th"} >Thai</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

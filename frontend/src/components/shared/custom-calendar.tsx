import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSearchParams } from "react-router";

interface Props {
    popover?: boolean;
    filterValue: string;
}

export default function CustomCalendar({ popover = true, filterValue }: Props) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [open, setOpen] = useState(false);
    const param = searchParams.get(filterValue);
    const [date, setDate] = useState<Date | undefined>(param ? new Date(param) : undefined);

    const formatDate = (d: Date) =>
        d.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const onSelectDate = (newDate: Date | undefined, close: boolean) => {
        if (date && newDate && date.toDateString() === newDate.toDateString()) {
            setDate(undefined);
            searchParams.delete(filterValue);

            if (!popover) {
                searchParams.delete("ciYear");
                searchParams.delete("ciMonth");
            }

            setSearchParams(searchParams, { replace: true });
            if (close) setOpen(false);
            return;
        }

        if (newDate) {
            setDate(newDate);
            searchParams.set(filterValue, newDate.toDateString());

            if (!popover) {
                searchParams.delete("ciYear");
                searchParams.delete("ciMonth");
            }
            setSearchParams(searchParams, { replace: true });
        } else {
            setDate(undefined);
            searchParams.delete(filterValue);

            if (!popover) {
                searchParams.delete("ciYear");
                searchParams.delete("ciMonth");
            }
            setSearchParams(searchParams, { replace: true });
        }

        if (close) setOpen(false);
    };

    const TriggerButton = (
        <Button
            variant="outline"
            id="date"
            className="justify-between font-normal min-h-[44px] font-en"
        >
            {date ? formatDate(date) : "Select date"}
            <ChevronDownIcon />
        </Button>
    );

    if (popover) {
        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        className="font-en"
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(d) => onSelectDate(d, true)}
                    />
                </PopoverContent>
            </Popover>
        );
    }

    return (
        <div className="space-y-2">
            <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => onSelectDate(d, false)}
                className="rounded-md border shadow-sm font-en h-fit"
                captionLayout="dropdown"
            />
        </div>
    );
}
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSearchParams } from "react-router";
import { cn } from "@/lib/utils";

interface Props {
    popover?: boolean;
    filterValue: string;
}

export default function CustomCalendar({ popover = true, filterValue }: Props) {
    const [searchParams, setSearchParams] = useSearchParams();
    const [open, setOpen] = useState(false);
    const param = searchParams.get(filterValue);
    const [date, setDate] = useState<Date | undefined>(param ? new Date(param) : new Date());

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
            searchParams.delete('tz');

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

            //* Format date as YYYY-MM-DD
            const year = newDate.getFullYear();
            const month = String(newDate.getMonth() + 1).padStart(2, '0');
            const day = String(newDate.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;

            //* Get user's timezone
            const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

            searchParams.set(filterValue, dateString);
            searchParams.set('tz', timezone);

            if (!popover) {
                searchParams.delete("ciYear");
                searchParams.delete("ciMonth");
            }
            setSearchParams(searchParams, { replace: true });
        } else {
            setDate(undefined);
            searchParams.delete(filterValue);
            searchParams.delete('tz');

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
            className={cn("justify-between font-normal min-h-[44px]", date ? "font-en" : 'font-raleway')}
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
                className="rounded-md border shadow-sm font-en h-fit placeholder:font-raleway"
                captionLayout="dropdown"
            />
        </div>
    );
}
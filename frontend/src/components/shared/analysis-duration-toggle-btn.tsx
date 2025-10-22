import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useIsMobile } from "@/hooks/ui/use-mobile";
import { useSearchParams } from "react-router";

const TIME_RANGES = [
    { value: "7d", name: "Last 7 days" },
    { value: "30d", name: "Last 30 days" },
    { value: "90d", name: "Last 3 months" },
]

export default function AnalysisDurationToggleBtn() {
    const isMobile = useIsMobile();
    const [searchParams, setSearchParams] = useSearchParams();

    const handleTimeRangeChange = (value: string) => {
        if (value) {
            searchParams.set("timeRange", value);
            setSearchParams(searchParams);
        }
    };

    const paramsFilter = searchParams.get('timeRange')
    const defaultValue = TIME_RANGES[0].value

    return (
        <div className="flex justify-end items-center w-full">
            {/* Desktop Toggle */}
            <ToggleGroup
                type="single"
                value={paramsFilter || defaultValue}
                onValueChange={handleTimeRangeChange}
                variant="outline"
                className={`${isMobile ? 'hidden' : 'flex'}`}
            >
                {TIME_RANGES.map(({ value, name }) => (
                    <ToggleGroupItem
                        key={value}
                        className="px-6 cursor-pointer font-en"
                        value={value}
                    >
                        {name}
                    </ToggleGroupItem>
                ))}
            </ToggleGroup>

            {/* Mobile Select */}
            <Select value={paramsFilter || defaultValue} onValueChange={handleTimeRangeChange}>
                <SelectTrigger
                    className={`${isMobile ? 'flex' : 'hidden'} w-40 min-h-[44px] font-en cursor-pointer`}
                    aria-name="Select time range"
                >
                    <SelectValue placeholder="Last 3 months" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                    {TIME_RANGES.map(({ value, name }) => (
                        <SelectItem
                            key={value}
                            value={value}
                            className="rounded-lg font-en"
                        >
                            {name}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}
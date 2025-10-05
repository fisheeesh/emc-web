import { cn } from "@/lib/utils"
import { useSearchParams } from "react-router"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface Props {
    filters: Filter[],
    filterValue: string,
    otherClasses?: string
    containerClasses?: string,
    addFirst?: boolean,
    font?: string
}

export default function CommonFilter({ filters, filterValue = 'filter', otherClasses = "", containerClasses = "", addFirst = true, font = 'font-raleway' }: Props) {
    const [searchParams, setSearchParams] = useSearchParams()
    const paramsFilter = searchParams.get(filterValue)

    const handleUpdateParams = (value: string) => {
        searchParams.set(filterValue, value)

        setSearchParams(searchParams)
    }

    const defaultValue = addFirst ? filters[0]?.value : undefined

    return (
        <div className={cn('relative z-10', containerClasses)}>
            <Select onValueChange={handleUpdateParams} defaultValue={paramsFilter || defaultValue}>
                <SelectTrigger
                    aria-label="Filter options"
                    className={cn('cursor-pointer w-full no-focus light-border border px-5 py-1.5 relative z-10', font, otherClasses)}
                >
                    <div className="line-clamp-1 flex-1 text-left">
                        <SelectValue placeholder="Select a filter" />
                    </div>
                </SelectTrigger>
                <SelectContent className={`z-50 ${font}`}>
                    <SelectGroup>
                        {filters.map(item => (
                            <SelectItem key={item.value} value={item.value} className="cursor-pointer">
                                {item.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    )
}
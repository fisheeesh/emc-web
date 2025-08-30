import { cn } from "@/lib/utils"
import { useSearchParams } from "react-router"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../ui/select"

interface Filter {
    name: string
    value: string
}

interface Props {
    filters: Filter[]
    otherClasses?: string
    containerClasses?: string
}

export default function CommonFilter({ filters, otherClasses = "", containerClasses = "" }: Props) {
    const [searchParams, setSearchParams] = useSearchParams()
    const paramsFilter = searchParams.get('filter')

    const handleUpdateParams = (value: string) => {
        searchParams.set('filter', value)

        setSearchParams(searchParams)
    }

    return (
        <div className={cn('relative z-10', containerClasses)}>
            <Select onValueChange={handleUpdateParams} defaultValue={paramsFilter || filters[0].value}>
                <SelectTrigger
                    aria-label="Filter options"
                    className={cn('body-regular cursor-pointer w-full no-focus light-border background-light800_dark300 text-dark500_light700 border px-5 py-1.5 relative z-10', otherClasses)}
                >
                    <div className="line-clamp-1 flex-1 text-left">
                        <SelectValue placeholder="Select a filter" />
                    </div>
                </SelectTrigger>
                <SelectContent className="background-light900_dark200 z-50">
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
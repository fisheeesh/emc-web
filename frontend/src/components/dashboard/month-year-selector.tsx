import { useState } from "react";
import { useSearchParams } from "react-router";

interface Props {
    filters: Filter[],
    filterValue: "ciMonth" | "ciYear"
}

export default function MonthYearSelector({ filters, filterValue }: Props) {
    const [searchParams, setSearchParams] = useSearchParams()
    const param = searchParams.get(filterValue);
    const [active, setActive] = useState(param);

    const isActive = (value: string) => {
        return active === value
    }

    const onHandleClick = (value: string) => {
        setActive(value)
        searchParams.set(filterValue, value)
        if (searchParams.get("ciDate")) searchParams.delete("ciDate")
        if (filterValue === 'ciMonth' && searchParams.get("ciYear")) searchParams.delete("ciYear")
        if (filterValue === 'ciYear' && searchParams.get("ciMonth")) searchParams.delete("ciMonth")
        setSearchParams(searchParams)
    }

    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            {filters.map(({ name, value }) => (
                <div
                    onClick={() => onHandleClick(value)}
                    key={name}
                    className={`
            p-2 px-3 rounded-md text-sm cursor-pointer capitalize
            transition-colors duration-500 
            ${filterValue === "ciYear" && "font-en font-normal"}
            ${isActive(value)
                            ? "bg-blue-500 text-white dark:bg-gray-500 dark:border-gray-500 dark:border"
                            : "bg-gray-100 text-black dark:bg-transparent dark:border  dark:border-slate-300 dark:text-slate-300"
                        } 
            ${!isActive(value) && "hover:bg-blue-500 hover:text-white dark:hover:bg-gray-400 dark:hover:border-gray-400 dark:hover:text-white"
                        }
`}
                >
                    {name}
                </div>
            ))}
        </div>
    );
}
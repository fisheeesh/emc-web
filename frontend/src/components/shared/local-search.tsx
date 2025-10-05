import { useEffect, useState } from "react";
import { useSearchParams } from "react-router";
import { Input } from "../ui/input";
import { TbUserSearch } from "react-icons/tb";

export default function LocalSearch({ label = "Search by keywords...", filterValue = 'search' }: { label?: string, filterValue: string }) {
    const [searchParams, setSearchParams] = useSearchParams()
    const search = searchParams.get(filterValue)
    const [query, setQuery] = useState(search || '')

    useEffect(() => {
        const debounceFunc = setTimeout(() => {
            if (query) searchParams.set(filterValue, query)
            else searchParams.delete(filterValue)

            setSearchParams(searchParams)
        }, 500)

        return () => clearTimeout(debounceFunc)
    }, [query, filterValue, setSearchParams, searchParams])

    return (
        <div className="relative">
            <Input
                value={query}
                type="search"
                placeholder={label}
                className="min-h-[44px] w-full lg:w-[300px] pl-10 font-en placeholder:font-raleway"
                onChange={(e) => setQuery(e.target.value)}
            />
            <TbUserSearch className="absolute top-3 left-3 size-[18px]" />
        </div>
    )
}

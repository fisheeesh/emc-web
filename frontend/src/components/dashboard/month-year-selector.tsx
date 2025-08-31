import { MONTHS, YEARS } from "@/lib/constants";

export default function MonthYearSelector({ mode, setActive, isActive }: {
    mode: "month" | "year",
    setActive: (el: string) => void,
    isActive: (el: string) => boolean
}) {
    const array = mode === "month" ? MONTHS : YEARS;

    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            {array.map((el, index) => (
                <div
                    onClick={() => setActive(el)}
                    key={index}
                    className={`
            p-2 px-3 rounded-md text-sm cursor-pointer capitalize
            transition-colors duration-500 
            ${mode === "year" && "font-en font-normal"}
            ${isActive(el)
                            ? "bg-blue-500 text-white dark:bg-gray-500 dark:border-gray-500 dark:border"
                            : "bg-gray-100 text-black dark:bg-transparent dark:border  dark:border-slate-300 dark:text-slate-300"
                        } 
            ${!isActive(el) && "hover:bg-blue-500 hover:text-white dark:hover:bg-gray-400 dark:hover:border-gray-400 dark:hover:text-white"
                        }
`}
                >
                    {mode === 'month' ? el.toLowerCase() : el}
                </div>
            ))}
        </div>
    );
}
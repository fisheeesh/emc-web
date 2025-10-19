import { BsFire } from "react-icons/bs";

interface Props {
    value: number;
}

export default function StreakFireIcon({ value }: Props) {
    return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-950/30 dark:to-red-950/30 border border-orange-300 dark:border-orange-700 shadow-sm">
            <BsFire className="text-orange-500 dark:text-orange-400 text-base animate-pulse" />
            <span className="text-xs font-bold text-orange-700 dark:text-orange-300 font-en">
                {value}
            </span>
        </div>
    );
}
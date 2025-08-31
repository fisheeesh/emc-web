import { cn } from "@/lib/utils";
import { FaUsers } from "react-icons/fa";
import { MdPlaylistAddCheckCircle } from "react-icons/md";

interface Props {
    data: number,
    type: string
}

export default function DisplayCard({ data, type }: Props) {

    return (
        <div className="bg-card border w-1/2 lg:w-full py-5 px-6 lg:py-12 rounded-md flex justify-between items-center">
            <div>
                <h1 className="text-2xl lg:text-4xl font-en">{data}</h1>
                <p className={cn(type !== 'total' && 'text-green-500', 'text-sm lg:text-xl')}>{type === 'total' ? 'Total Employees' : 'Present'}</p>
            </div>
            <div className="bg-gray-100 dark:bg-slate-700 rounded-full p-2.5 lg:p-3">
                {type === 'total' ? <FaUsers className="text-blue-500 size-5 lg:size-9" /> : <MdPlaylistAddCheckCircle className="text-green-500 size-5 lg:size-9" />}
            </div>
        </div>
    )
}

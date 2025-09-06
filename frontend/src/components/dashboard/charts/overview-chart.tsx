import CommonFilter from "@/components/shared/common-filter";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import Empty from "@/components/ui/empty";
import { COMMON_DATAS, OVERVIEW_FILTER } from "@/lib/constants";
import { Doughnut } from "react-chartjs-2";
import CustomLegends from "../custom-legends";

interface Props {
    percentages: number[],
    duration: string | null
}

export default function OverViewChart({ percentages, duration }: Props) {
    const labels = COMMON_DATAS.map((data) => data.label)

    const isEmpty = percentages.every(el => el === 0)

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Overview',
                data: percentages.map(data => data),
                backgroundColor: COMMON_DATAS.map(data => data.color),
                borderRadius: 5,
                borderWidth: 0,
                offset: 8
            }
        ]
    }

    const options = {
        maintainAspectRatio: false,
        responsive: true,
        plugins: { legend: { display: false } }
    }
    return (
        <Card className="rounded-md h-full w-full lg:w-2/5 flex flex-col gap-5 lg:h-[420px]">
            <CardHeader className="flex flex-col md:flex-row mb-2 justify-center gap-3 md:justify-between w-full">
                <div>
                    <CardTitle className="text-xl md:text-2xl">Mood Overview</CardTitle>
                    <CardDescription className="line-clamp-1">Sshowing how employees are feeling {duration === 'today' ? 'today' : 'this month'}</CardDescription>
                </div>
                <CommonFilter
                    filterValue="duration"
                    filters={OVERVIEW_FILTER}
                    otherClasses="min-h-[44px] sm:min-w-[90px]"
                />
            </CardHeader>
            {
                !isEmpty ?
                    <CardContent className="flex items-center justify-center gap-12 lg:gap-2 lg:justify-between px-10">
                        <div className="w-[150px] h-[200px] md:h-[220px] lg:h-[285px] xl:h-[285px] md:w-[180px] lg:w-[200px]">
                            <Doughnut data={chartData} options={options} />
                        </div>

                        <div className="flex items-center gap-8">
                            <CustomLegends type={'col'} />

                            <div className="flex xl:flex lg:hidden flex-col gap-y-4">
                                {percentages.map((data, index) => (
                                    <h1 key={index} className="text-sm lg:text-base font-en">{data}%</h1>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                    : <CardContent className="flex items-center flex-col justify-center">
                        <Empty label="Oops! No employees have checked in yet." />
                    </CardContent>
            }
        </Card>
    )
}

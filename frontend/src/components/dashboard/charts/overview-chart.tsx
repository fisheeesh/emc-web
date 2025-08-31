import { COMMON_DATAS } from "@/lib/constants"
import { Doughnut } from "react-chartjs-2";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import CustomLegends from "../custom-legends";

const overviewData = [80, 17, 2, 1]

export default function OverViewChart() {
    const labels = COMMON_DATAS.map((data) => data.label)

    const chartData = {
        labels,
        datasets: [
            {
                label: 'Sentiments',
                data: overviewData.map(data => data.toFixed(1)),
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
        <Card className="rounded-md h-full w-full lg:w-1/3 flex flex-col gap-5 lg:h-[400px]">
            <CardHeader>
                <CardTitle className="text-xl md:text-2xl">Mood Overview for Today</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center gap-12 md:gap-12 lg:gap-2 lg:justify-between">
                <div className="w-[150px] h-[200px] lg:h-[285px] md:w-[180px] lg:w-[190px]">
                    <Doughnut data={chartData} options={options} />
                </div>

                <div className="flex items-center gap-8">
                    <CustomLegends type={'col'} />

                    <div className="flex xl:flex lg:hidden flex-col gap-y-4">
                        {overviewData.map((data, index) => (
                            <h1 key={index} className="text-sm lg:text-base font-en">{data.toFixed(1)}%</h1>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

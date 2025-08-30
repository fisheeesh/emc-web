import { useTheme } from "@/components/shared/theme-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartOptions } from "chart.js";
import { COMMON_DATAS, COMPARISON_DATA, COMPARISON_FILTER } from "@/lib/constants";
import moment from "moment";
import { Line } from "react-chartjs-2";
import CustomLegends from "../custom-legends";
import CommonFilter from "../../shared/common-filter";

export default function SentimentsComparisonChart() {
    const { theme } = useTheme()
    const labels = COMPARISON_DATA?.map((item) => moment(item.checkInDate).format('MMM DD'))

    const chartData = {
        labels,
        datasets: COMMON_DATAS.map((dataset: CommonData) => ({
            label: dataset.label,
            data: COMPARISON_DATA?.map((item: ComparisonData) => item[dataset.label.toLowerCase()] ?? 0),
            borderColor: dataset.color,
            backgroundColor: dataset.color,
            borderWidth: 2,
            pointRadius: 0,
            tension: 0.4,
        })),
    }

    const options: ChartOptions<"line"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        interaction: { mode: 'index', intersect: false },
        scales: {
            x: { grid: { drawTicks: false, color: `${theme === 'dark' ? '#334155' : '#E0E0E0'}` }, ticks: { padding: 10, align: 'center', font: { size: 11, weight: "bold" }, color: `${theme === 'dark' ? '#cbd5e1' : ''}` } },
            y: { grid: { drawTicks: false, color: `${theme === 'dark' ? '#334155' : '#E0E0E0'}` }, ticks: { padding: 10, stepSize: 2, font: { size: 11, weight: "bold" }, color: `${theme === 'dark' ? '#cbd5e1' : ''}` } }
        }
    }

    return (
        <Card className="rounded-md w-full lg:w-2/3 flex flex-col items-center gap-2 lg:h-[400px]">
            <CardHeader className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-0 md:justify-between w-full">
                <CardTitle className="text-2xl">Sentiments Comparison Charts</CardTitle>
                <CommonFilter
                    filters={COMPARISON_FILTER}
                    otherClasses="min-h-[44px] sm:min-w-[150px]"
                />
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-3 md:gap-0 md:justify-between w-full">
                <CustomLegends type={'row'} />

                <div className="w-full h-[300px] lg:h-[285px]">
                    <Line data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    )
}

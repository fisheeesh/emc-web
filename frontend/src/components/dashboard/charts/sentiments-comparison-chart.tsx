import { useTheme } from "@/components/shared/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChartOptions } from "chart.js";
import { COMMON_DATAS, COMPARISON_FILTER } from "@/lib/constants";
import moment from "moment";
import { Line } from "react-chartjs-2";
import CustomLegends from "../custom-legends";
import CommonFilter from "../../shared/common-filter";

interface Props {
    data: ComparisonData[]
}

export default function SentimentsComparisonChart({ data }: Props) {
    const { theme } = useTheme()
    const labels = data?.map((item) => moment(item.checkInDate).format('MMM DD'))

    const chartData = {
        labels,
        datasets: COMMON_DATAS.map((dataset: CommonData) => ({
            label: dataset.label,
            data: data?.map((item: ComparisonData) => item[dataset.label.toLowerCase()] ?? 0),
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
            x: {
                grid: {
                    drawTicks: false,
                    display: false
                },
                ticks: {
                    padding: 10,
                    align: 'center',
                    font: { size: 11, weight: "bold" },
                    color: `${theme === 'dark' ? '#cbd5e1' : ''}`
                },
                border: {
                    display: false
                }
            },
            y: {
                grid: {
                    drawTicks: false,
                    color: `${theme === 'dark' ? '#334155' : '#E0E0E0'}`,
                    display: true,
                    lineWidth: 1,
                    drawOnChartArea: true,
                },
                ticks: {
                    padding: 10,
                    stepSize: 2,
                    font: { size: 11, weight: "bold" },
                    color: `${theme === 'dark' ? '#cbd5e1' : ''}`
                },
                border: {
                    display: false
                }
            }
        }
    }

    return (
        <Card className="rounded-md w-full lg:w-3/5 flex flex-col items-center gap-2 lg:h-[420px]">
            <CardHeader className="flex flex-col md:flex-row mb-2 justify-center gap-3 md:gap-0 md:justify-between w-full">
                <div>
                    <CardTitle className="text-xl md:text-2xl">Sentiments Comparison Charts</CardTitle>
                    <CardDescription>Seeing how sentiments vary day by day</CardDescription>
                </div>
                <CommonFilter
                    filterValue="senitments"
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

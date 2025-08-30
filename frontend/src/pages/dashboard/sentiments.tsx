import OverViewChart from "@/components/dashboard/overview-chart";
import { Chart as ChartJS, ArcElement, Tooltip, CategoryScale, LineElement, LinearScale, PointElement, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

export default function SentimentsDashboardPage() {
    return (
        <section className="flex flex-col items-center justify-center w-full gap-3">
            <div className="flex flex-col lg:flex-row items-center justify-center w-full gap-3 lg:h-[400px]">
                {/* Overview Chart */}
                <OverViewChart />
            </div>
        </section>
    )
}

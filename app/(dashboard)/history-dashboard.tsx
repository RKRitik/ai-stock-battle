import { getFormattedChartData} from "@/app/db";

export default async function HistoryDashboard() {
    const chartData = await getFormattedChartData();
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">History Dashboard</h1>
            <Chart data={chartData} />
        </div>
    );
}
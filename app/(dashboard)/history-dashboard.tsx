import { getFormattedChartData } from "@/app/db";
import HistoryChart from "./history-chart";

export default async function HistoryDashboard() {
    const data = await getFormattedChartData();

    return <HistoryChart data={data} />;
}

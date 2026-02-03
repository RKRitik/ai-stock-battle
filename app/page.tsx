import AgentsDashboard from "./(dashboard)/agents-dashboard";
import RecentTransactions from "./(dashboard)/recent-transactions";
import HistoryDashboard from "./(dashboard)/history-dashboard";
import AgentResponses from "./(dashboard)/responses-dashboard";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-2">
      <div className="max-w-7xl mx-auto w-full flex flex-col h-full gap-4">
        <div className="flex-shrink-0">
          <h1 className="text-3xl font-semibold tracking-tight">Agent Battle</h1>
          <p className="text-muted-foreground mt-1">Monitor your AI agents' stock trading performance</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-shrink-0">
          <Card className="lg:col-span-1 p-6">
            <h2 className="text-lg font-semibold mb-2">Agent Cash Balances</h2>
            <AgentsDashboard />
          </Card>

          <Card className="lg:col-span-2 p-6">
            <h2 className="text-lg font-semibold mb-2">Total Wealth Over Time</h2>
            <HistoryDashboard />
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
          <Card className="p-6 flex flex-col overflow-hidden">
            <h2 className="text-lg font-semibold mb-2 flex-shrink-0">Recent Transactions</h2>
            <div className="overflow-y-auto flex-1">
              <RecentTransactions />
            </div>
          </Card>

          <Card className="p-6 flex flex-col overflow-hidden">
            <h2 className="text-lg font-semibold mb-4 flex-shrink-0">Agent Invocations</h2>
            <div className="overflow-y-auto flex-1">
              <AgentResponses />
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
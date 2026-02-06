import AgentsDashboard from "./(dashboard)/agents-dashboard";
import { Suspense } from "react";
import RecentTransactions from "./(dashboard)/recent-transactions";
import HistoryDashboard from "./(dashboard)/history-dashboard";
import AgentResponses from "./(dashboard)/responses-dashboard";
import AgentStocks from "./(dashboard)/agent-stocks";
import { Card } from "@/components/ui/card";
import { ModeToggle } from "@/components/mode-toggle";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="min-h-screen bg-background relative overflow-hidden selection:bg-primary/20">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 -right-4 w-96 h-96 bg-primary/5 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto w-full flex flex-col h-full gap-6 p-4 md:p-8">
        <header className="flex items-center justify-between border-b border-primary/10 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              Agent Battle
            </h1>
            <p className="text-muted-foreground mt-1 text-sm font-medium">
              Monitor your AI agents' stock trading performance in real-time
            </p>
          </div>
          <ModeToggle />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-shrink-0">
          <Card className="lg:col-span-1 p-6 border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Agent Performance
            </h2>
            <Suspense fallback={<SkeletonCard />}><AgentsDashboard /></Suspense>
          </Card>

          <Card className="lg:col-span-2 p-6 border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Total Wealth Over Time
            </h2>
            <Suspense fallback={<SkeletonCard />}><HistoryDashboard /></Suspense>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[500px]">
          <Card className="p-6 flex flex-col overflow-hidden border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
            <h2 className="text-lg font-semibold mb-4 flex-shrink-0 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Recent Transactions
            </h2>
            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <Suspense fallback={<SkeletonCard />}>
                <RecentTransactions />
              </Suspense>
            </div>
          </Card>

          <Card className="p-6 flex flex-col overflow-hidden border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
            <h2 className="text-lg font-semibold mb-4 flex-shrink-0 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Agent Invocations
            </h2>
            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <Suspense fallback={<SkeletonCard />}>
                <AgentResponses />
              </Suspense>
            </div>
          </Card>

          <Card className="p-6 flex flex-col overflow-hidden border-primary/10 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-all duration-300">
            <h2 className="text-lg font-semibold mb-4 flex-shrink-0 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              Agent Portfolio
            </h2>
            <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
              <AgentStocks />
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}

function SkeletonCard() {
  return (
    <div className="flex items-center justify-center h-48 w-full bg-primary/5 rounded-lg animate-pulse">
      <div className="text-primary/40 font-medium">Loading analytics...</div>
    </div>
  )
}

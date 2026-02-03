import AgentsDashboard from "./(dashboard)/agents-dashboard";
import TransactionsDashboard from "./(dashboard)/transactions-dashboard";
import HistoryDashboard from "./(dashboard)/history-dashboard";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="flex min-h-screen justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full flex-col py-20 bg-white dark:bg-black">
        <div className="w-full max-w-4xl mx-auto px-6">
          <AgentsDashboard />
        </div>
        <div className="w-full max-w-6xl mx-auto px-6 mt-12">
          <HistoryDashboard />
        </div>
        <div className="w-full max-w-4xl mx-auto px-6 mt-12">
          <TransactionsDashboard />
        </div>
      </main>
    </div>
  );
}
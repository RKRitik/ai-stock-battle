"use client";

import dynamic from "next/dynamic";

const HistoryDashboardInner = dynamic(
  () => import("./history-dashboard"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-48 w-full bg-primary/5 rounded-lg animate-pulse">
        <div className="text-primary/40 font-medium">Loading analytics...</div>
      </div>
    ),
  }
);

export default function HistoryDashboardWrapper() {
  return <HistoryDashboardInner />;
}

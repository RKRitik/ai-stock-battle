import { getLastTransactions } from "@/app/db";
import { Badge } from "@/components/ui/badge";
import { getAgentColor } from "@/lib/utils";

export default async function TransactionsDashboard() {
    const transactions = await getLastTransactions();
    return (
        <div className="space-y-3 pr-2">
            {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl border border-primary/10 bg-background/40 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 group">
                    <div className="flex-1">
                        <div className="flex items-center gap-3">
                            <p className="text-sm font-bold tracking-tight" style={{ color: getAgentColor(tx.name) }}>{tx.name}</p>
                            <Badge className={`text-[10px] font-bold px-1.5 py-0 h-4 border-none ${tx.side === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {tx.side.toUpperCase()}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1.5 font-medium">
                            {tx.qty} × <span className="text-foreground/80 font-bold">{tx.symbol}</span> @ <span className="tabular-nums font-semibold">₹{tx.price.toFixed(2)}</span>
                        </p>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/60 tabular-nums">
                        {tx.time.toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })}
                    </p>
                </div>
            ))}
        </div>
    );
}
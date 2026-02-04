import { getLastTransactions } from "@/app/db";
import { Badge } from "@/components/ui/badge";
import { getAgentColor } from "@/lib/utils";

export default async function TransactionsDashboard() {
    const transactions = await getLastTransactions();
    return (
        <div className="space-y-3 pr-2">
            {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors flex-shrink-0">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold" style={{ color: getAgentColor(tx.name) }}>{tx.name}</p>
                            <Badge className="text-xs" variant={tx.side === 'BUY' ? 'default' : 'secondary'}>
                                {tx.side.toUpperCase()}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {tx.qty} × {tx.symbol} @ ₹{tx.price.toFixed(2)}
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground ml-4 shrink-0">
                        {tx.time.toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            day: '2-digit',
                            month: '2-digit',
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
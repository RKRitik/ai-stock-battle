import { getLastTransactions } from "@/app/db";
import { Badge } from "lucide-react";
export default async function TransactionsDashboard() {
    const transactions = await getLastTransactions();
    return (
        <div className="space-y-3 pr-2">
            {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors flex-shrink-0">
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{tx.name}</p>
                            <Badge variant={tx.side === 'BUY' ? 'default' : 'secondary'} className="text-xs">
                                {tx.side.toUpperCase()}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {tx.qty} × {tx.symbol} @ ${tx.price.toFixed(2)}
                        </p>
                    </div>
                    <p className="text-xs text-muted-foreground ml-4 shrink-0">{tx.time.toLocaleDateString()}</p>
                </div>
            ))}
        </div>
    );
}
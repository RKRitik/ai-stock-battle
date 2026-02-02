import { getLastTransactions } from "@/app/db";
export default async function TransactionsDashboard() {
    const transactions = await getLastTransactions();
    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Transactions Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {transactions.map(transaction => (
                    <div key={transaction.id} className="border p-4 rounded-lg">
                        <h2 className="text-xl font-bold">{transaction.name}</h2>
                        <p className="text-xl font-bold"> {transaction.side} {transaction.qty} {transaction.symbol} @ {transaction.price}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
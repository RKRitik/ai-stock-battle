import { getLastInvocations } from "@/app/db";
import { getAgentColor } from "@/lib/utils";

export default async function AgentResponses() {
    const responses = await getLastInvocations();
    return <div className="space-y-3 pr-2">
        {responses.map((response) => (
            <div key={response.id} className="p-4 rounded-xl border border-primary/10 bg-background/40 hover:bg-primary/5 hover:border-primary/20 transition-all duration-300 group flex-shrink-0">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-bold tracking-tight mb-2" style={{ color: getAgentColor(response.name) }}>{response.name}</p>
                        <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
                            <p className="text-xs text-foreground/80 leading-relaxed font-medium">{response.output}</p>
                        </div>
                    </div>
                    <p className="text-[10px] font-bold text-muted-foreground/60 tabular-nums ml-4 shrink-0 uppercase tracking-wider">
                        {response.created_at.toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                        })}
                    </p>
                </div>
            </div>
        ))}
    </div>
}


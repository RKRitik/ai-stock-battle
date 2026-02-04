import { getLastInvocations } from "@/app/db";
import { getAgentColor } from "@/lib/utils";

export default async function AgentResponses() {
    const responses = await getLastInvocations();
    return <div className="space-y-3 pr-2">
        {responses.map((response) => (
            <div key={response.id} className="p-3 rounded-lg border border-border hover:bg-muted/30 transition-colors flex-shrink-0">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="text-sm font-semibold" style={{ color: getAgentColor(response.name) }}>{response.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{response.output}</p>
                    </div>
                    <p className="text-xs text-muted-foreground ml-4 shrink-0">
                        {response.created_at.toLocaleString('en-IN', {
                            timeZone: 'Asia/Kolkata',
                            day: '2-digit',
                            month: '2-digit',
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


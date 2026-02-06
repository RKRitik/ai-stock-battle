'use server'

import { getHoldings } from '../db';
import type { Holding } from '../schema';

export async function fetchHoldingsAction(agent_id: string): Promise<Holding[]> {
    return await getHoldings(agent_id);
}

import { describe, test, expect } from "bun:test";
import { normalizeTicker } from "../../ai/transaction";
import { createAngelOneOrderPayload } from "../../ai/transaction";

describe("normalizeTicker", () => {
    test("strips NSE: prefix", () => {
        expect(normalizeTicker("NSE:INFY")).toBe("INFY");
    });

    test("strips BSE: prefix", () => {
        expect(normalizeTicker("BSE:TCS")).toBe("TCS");
    });

    test("handles lowercase prefix", () => {
        expect(normalizeTicker("nse:RELIANCE")).toBe("RELIANCE");
    });

    test("keeps ticker unchanged if no prefix", () => {
        expect(normalizeTicker("ITC")).toBe("ITC");
    });

    test("trims whitespace", () => {
        expect(normalizeTicker("  NSE:SBIN  ")).toBe("SBIN");
    });
});

describe("createAngelOneOrderPayload", () => {
    test("generates correct BUY order payload", () => {
        const payload = createAngelOneOrderPayload("INFY", "BUY", 10, 1500);
        
        expect(payload).not.toBeNull();
        expect(payload?.variety).toBe("NORMAL");
        expect(payload?.tradingsymbol).toBe("INFY-EQ");
        expect(payload?.symboltoken).toBe("1594");
        expect(payload?.transactiontype).toBe("BUY");
        expect(payload?.exchange).toBe("NSE");
        expect(payload?.ordertype).toBe("MARKET");
        expect(payload?.producttype).toBe("DELIVERY");
        expect(payload?.duration).toBe("DAY");
        expect(payload?.price).toBe(1500);
        expect(payload?.quantity).toBe(10);
    });

    test("generates correct SELL order payload", () => {
        const payload = createAngelOneOrderPayload("TCS", "SELL", 5, 3200);
        
        expect(payload).not.toBeNull();
        expect(payload?.transactiontype).toBe("SELL");
        expect(payload?.tradingsymbol).toBe("TCS-EQ");
        expect(payload?.symboltoken).toBe("11536");
    });

    test("returns null for unknown ticker", () => {
        const payload = createAngelOneOrderPayload("UNKNOWN", "BUY", 10, 100);
        expect(payload).toBeNull();
    });

    test("uses INTRADAY when specified", () => {
        const payload = createAngelOneOrderPayload("INFY", "BUY", 10, 1500, "MARKET", "INTRADAY");
        expect(payload?.producttype).toBe("INTRADAY");
    });
});

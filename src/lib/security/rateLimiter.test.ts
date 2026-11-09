import { describe, expect, it } from "vitest";
import { checkRateLimit, getClientIp } from "@/src/lib/security/rateLimiter";

const reqWithIp = (ip: string) =>
  new Request("http://localhost/api/generate", {
    headers: { "x-forwarded-for": `${ip}, 10.0.0.1` },
  });

describe("getClientIp", () => {
  it("mengambil IP pertama dari x-forwarded-for", () => {
    expect(getClientIp(reqWithIp("203.0.113.7"))).toBe("203.0.113.7");
  });

  it("fallback ke x-real-ip lalu 127.0.0.1", () => {
    const viaRealIp = new Request("http://localhost/", {
      headers: { "x-real-ip": "198.51.100.9" },
    });
    expect(getClientIp(viaRealIp)).toBe("198.51.100.9");
    expect(getClientIp(new Request("http://localhost/"))).toBe("127.0.0.1");
  });
});

describe("checkRateLimit", () => {
  it("mengizinkan request di bawah limit dan menghitung sisa kuota", () => {
    const first = checkRateLimit(reqWithIp("192.0.2.10"), { limit: 3, windowMs: 60_000 });
    expect(first.allowed).toBe(true);
    expect(first.limit).toBe(3);
    expect(first.remaining).toBe(2);

    const second = checkRateLimit(reqWithIp("192.0.2.10"), { limit: 3, windowMs: 60_000 });
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it("menolak request keempat saat limit 3 dan mengembalikan 429", () => {
    const ip = "192.0.2.11";
    for (let i = 0; i < 3; i++) {
      expect(checkRateLimit(reqWithIp(ip), { limit: 3, windowMs: 60_000 }).allowed).toBe(true);
    }
    const denied = checkRateLimit(reqWithIp(ip), { limit: 3, windowMs: 60_000 });
    expect(denied.allowed).toBe(false);
    expect(denied.remaining).toBe(0);
    expect(denied.errorResponse?.status).toBe(429);
  });

  it("IP berbeda punya kuota terpisah", () => {
    const ip = "192.0.2.12";
    for (let i = 0; i < 3; i++) {
      checkRateLimit(reqWithIp(ip), { limit: 3, windowMs: 60_000 });
    }
    expect(
      checkRateLimit(reqWithIp("192.0.2.13"), { limit: 3, windowMs: 60_000 }).allowed,
    ).toBe(true);
  });
});

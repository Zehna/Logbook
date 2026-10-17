import { NextRequest, NextResponse } from "next/server";

/**
 * Sliding Window In-Memory Rate Limiter
 * Standar ketahanan operasional untuk API GenAI LogMagang OS.
 * Membatasi panggilan maksimal 20 request/menit per alamat IP untuk mencegah
 * lonjakan kuota Gemini API saat malam tenggat waktu.
 */

interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Bersihkan rekaman kedaluwarsa secara berkala setiap 5 menit
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredRecords(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;

  const threshold = now - windowMs;
  for (const [ip, record] of rateLimitMap.entries()) {
    record.timestamps = record.timestamps.filter((ts) => ts > threshold);
    if (record.timestamps.length === 0) {
      rateLimitMap.delete(ip);
    }
  }
}

export interface RateLimitOptions {
  limit?: number; // default: 20 request
  windowMs?: number; // default: 60_000 ms (1 menit)
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetInSeconds: number;
  errorResponse?: NextResponse;
}

/**
 * Mendapatkan identitas alamat IP klien dari request headers
 */
export function getClientIp(request: Request | NextRequest): string {
  const headers = request.headers;
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  const cfConnectingIp = headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();

  return "127.0.0.1";
}

/**
 * Memvalidasi apakah request berada dalam batas rate limit
 */
export function checkRateLimit(
  request: Request | NextRequest,
  options: RateLimitOptions = {}
): RateLimitResult {
  const limit = options.limit ?? 20;
  const windowMs = options.windowMs ?? 60 * 1000; // 1 menit

  cleanupExpiredRecords(windowMs);

  const ip = getClientIp(request);
  const now = Date.now();
  const threshold = now - windowMs;

  let record = rateLimitMap.get(ip);
  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(ip, record);
  }

  // Filter hanya timestamp dalam jendela sliding window aktif
  record.timestamps = record.timestamps.filter((ts) => ts > threshold);

  if (record.timestamps.length >= limit) {
    const oldestTimestamp = record.timestamps[0] || now;
    const resetInSeconds = Math.max(
      1,
      Math.ceil((oldestTimestamp + windowMs - now) / 1000)
    );

    return {
      allowed: false,
      limit,
      remaining: 0,
      resetInSeconds,
      errorResponse: NextResponse.json(
        {
          error: `Batas kuota harian/menit tercapai (maksimal ${limit} permintaan/menit). Demi kenyamanan bersama saat malam tenggat waktu, silakan coba kembali dalam ${resetInSeconds} detik.`,
          retryAfter: resetInSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(resetInSeconds),
            "X-RateLimit-Limit": String(limit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.floor((now + resetInSeconds * 1000) / 1000)),
          },
        }
      ),
    };
  }

  // Catat timestamp pemanggilan baru
  record.timestamps.push(now);
  const remaining = Math.max(0, limit - record.timestamps.length);

  return {
    allowed: true,
    limit,
    remaining,
    resetInSeconds: Math.ceil(windowMs / 1000),
  };
}

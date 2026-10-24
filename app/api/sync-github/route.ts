import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit } from "@/src/lib/security/rateLimiter";

export interface GitHubSyncPayload {
  repoUrlOrOwnerRepo?: string;
  branch?: string;
  date?: string;
  username?: string;
  rawGitLog?: string;
  peran?: string;
  tipeKegiatan?: string;
}

export interface CommitItem {
  sha: string;
  shortSha: string;
  message: string;
  author: string;
  date: string;
  url?: string;
}

const GITHUB_NAME_REGEX = /^[a-zA-Z0-9_.-]+$/;

function parseOwnerAndRepo(input: string): { owner: string; repo: string } | null {
  const cleaned = input.trim().replace(/^https?:\/\/github\.com\//i, "").replace(/\.git$/i, "");
  const parts = cleaned.split("/").filter(Boolean);
  if (parts.length >= 2) {
    const owner = parts[0];
    const repo = parts[1];
    // Cegah path traversal dan karakter berbahaya
    if (!GITHUB_NAME_REGEX.test(owner) || !GITHUB_NAME_REGEX.test(repo) || owner === ".." || repo === "..") {
      return null;
    }
    return { owner, repo };
  }
  return null;
}

function parseRawGitLog(raw: string): CommitItem[] {
  const sanitizedRaw = raw.slice(0, 100000);
  const lines = sanitizedRaw.split("\n").map((l) => l.trim()).filter(Boolean);
  const commits: CommitItem[] = [];

  for (const line of lines) {
    // Format standar: 73743e9 feat: implement new feature
    // Format panjang: commit 73743e9... Author: ... Date: ...
    const matchShort = line.match(/^([a-f0-9]{7,40})\s+(.+)$/i);
    if (matchShort) {
      const sha = matchShort[1];
      commits.push({
        sha,
        shortSha: sha.slice(0, 7),
        message: matchShort[2].slice(0, 500),
        author: "Developer",
        date: new Date().toISOString(),
      });
    } else if (line.startsWith("feat:") || line.startsWith("fix:") || line.startsWith("refactor:") || line.startsWith("chore:") || line.startsWith("docs:")) {
      commits.push({
        sha: Math.random().toString(16).slice(2, 9),
        shortSha: Math.random().toString(16).slice(2, 9),
        message: line.slice(0, 500),
        author: "Developer",
        date: new Date().toISOString(),
      });
    }
  }

  return commits.slice(0, 20);
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(request, { limit: 12, windowMs: 60 * 1000 });
    if (!rateLimit.allowed) {
      return rateLimit.errorResponse;
    }

    const body = (await request.json()) as Partial<GitHubSyncPayload>;
    const { repoUrlOrOwnerRepo, branch, date, username, rawGitLog, peran, tipeKegiatan } = body;

    let commits: CommitItem[] = [];
    let repoName = repoUrlOrOwnerRepo?.slice(0, 150) || "Repositori Git";

    if (repoUrlOrOwnerRepo && repoUrlOrOwnerRepo.trim()) {
      const parsedRepo = parseOwnerAndRepo(repoUrlOrOwnerRepo);
      if (!parsedRepo) {
        return NextResponse.json(
          { error: "Format URL atau nama repositori GitHub tidak valid. Gunakan format 'owner/repo' atau 'https://github.com/owner/repo'." },
          { status: 400 }
        );
      }

      repoName = `${parsedRepo.owner}/${parsedRepo.repo}`;

      // Build GitHub API URL
      const url = new URL(`https://api.github.com/repos/${parsedRepo.owner}/${parsedRepo.repo}/commits`);
      url.searchParams.set("per_page", "15");
      if (branch && branch.trim()) {
        url.searchParams.set("sha", branch.trim());
      }
      if (username && username.trim()) {
        url.searchParams.set("author", username.trim());
      }
      if (date && date.trim()) {
        // Since start of date to end of date
        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);
        url.searchParams.set("since", startDate.toISOString());

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);
        url.searchParams.set("until", endDate.toISOString());
      }

      const headers: Record<string, string> = {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "LogMagang-Sync-Client",
      };

      // Opsional: jika ada GITHUB_TOKEN di env untuk menghindari rate limit
      if (process.env.GITHUB_TOKEN) {
        headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
      }

      const ghResponse = await fetch(url.toString(), {
        headers,
        next: { revalidate: 60 },
      });

      if (!ghResponse.ok) {
        const errorText = await ghResponse.text();
        if (ghResponse.status === 404) {
          return NextResponse.json(
            { error: `Repositori '${repoName}' tidak ditemukan atau bersifat private. Jika private, Anda bisa menggunakan opsi Tempel 'git log' di bawah.` },
            { status: 404 }
          );
        }
        if (ghResponse.status === 403) {
          return NextResponse.json(
            { error: "Batas rate limit API GitHub publik tercapai. Silakan gunakan opsi Tempel 'git log' langsung dari terminal lokal Anda." },
            { status: 403 }
          );
        }
        return NextResponse.json(
          { error: `GitHub API Error (${ghResponse.status}): ${errorText.slice(0, 150)}` },
          { status: ghResponse.status }
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawCommits: any[] = await ghResponse.json();
      if (!Array.isArray(rawCommits) || rawCommits.length === 0) {
        return NextResponse.json(
          { error: `Tidak ditemukan commit pada repositori '${repoName}' dengan filter yang dipilih.` },
          { status: 404 }
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      commits = rawCommits.slice(0, 15).map((item: any) => ({
        sha: item.sha,
        shortSha: item.sha.slice(0, 7),
        message: item.commit?.message?.split("\n")[0] || "Update codebase",
        author: item.commit?.author?.name || item.author?.login || "Developer",
        date: item.commit?.author?.date || new Date().toISOString(),
        url: item.html_url,
      }));
    } else if (rawGitLog && rawGitLog.trim()) {
      commits = parseRawGitLog(rawGitLog);
      if (commits.length === 0) {
        return NextResponse.json(
          { error: "Tidak dapat mengenali format commit dari teks git log yang ditempelkan." },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Harap masukkan nama repositori GitHub (owner/repo) atau tempelkan teks 'git log'." },
        { status: 400 }
      );
    }

    // Transformasi commit pesan teknis menjadi draf narasi aktivitas harian yang ramah Taksonomi Bloom
    const commitSummaryText = commits.map((c) => `- [${c.shortSha}] ${c.message}`).join("\n");

    const apiKey = process.env.GEMINI_API_KEY;
    let draftDailyNote = "";
    let suggestedRole = peran || "Software Engineer Intern";
    let identifiedSkills = "Version Control (Git), Pemecahan Masalah Kode, Refactoring";

    if (apiKey && apiKey.trim() && apiKey !== "your_gemini_api_key_here") {
      try {
        const client = new GoogleGenAI({ apiKey });
        const prompt = `Anda adalah asisten mahasiswa magang/MBKM bidang teknologi.
Diberikan daftar riwayat commit git teknis berikut dari repositori "${repoName}":
${commitSummaryText}

Tugas Anda:
1. Rangkum riwayat commit teknis tersebut menjadi satu paragraf catatan harian santai namun berbobot (2-4 kalimat) yang menjelaskan apa saja yang digarap hari ini dalam bahasa Indonesia yang wajar dan realistis untuk mahasiswa magang.
2. Identifikasi peran/posisi yang paling cocok (misal: "Frontend Developer Intern", "Backend Engineer", "Data Analyst", dll).
3. Sebutkan kompetensi teknis yang relevan.

Kembalikan jawaban dalam format JSON:
{
  "draftCatatan": "ringkasan catatan kegiatan harian",
  "suggestedRole": "rekomendasi peran",
  "identifiedSkills": "kompetensi/teknologi yang diasah"
}`;

        const interaction = await client.interactions.create({
          model: "gemini-3.8-flash",
          input: prompt,
          response_format: {
            type: "text",
            mime_type: "application/json",
          },
        });

        const output = interaction.output_text;
        if (output) {
          const parsed = JSON.parse(output);
          draftDailyNote = parsed.draftCatatan || "";
          suggestedRole = parsed.suggestedRole || suggestedRole;
          identifiedSkills = parsed.identifiedSkills || identifiedSkills;
        }
      } catch (geminiError) {
        console.warn("Gagal memanggil Gemini untuk merangkum commit:", geminiError);
      }
    }

    // Fallback jika Gemini tidak aktif / gagal
    if (!draftDailyNote) {
      draftDailyNote = `Hari ini saya fokus melakukan pembaruan kode dan pemeliharaan repositori pada beberapa bagian: ${commits
        .slice(0, 4)
        .map((c) => c.message.replace(/^(feat|fix|refactor|chore|docs)(\([^)]+\))?:\s*/i, ""))
        .join(", ")}, serta memastikan fungsi berjalan dengan baik dan minim bug.`;
    }

    return NextResponse.json({
      success: true,
      repo: repoName,
      commitCount: commits.length,
      commits,
      draftDailyNote,
      suggestedRole,
      identifiedSkills,
      meta: {
        peran: suggestedRole,
        tipeKegiatan: tipeKegiatan || "Magang MBKM",
      },
    });
  } catch (error: unknown) {
    console.error("[API /api/sync-github Error]:", error);
    const message = error instanceof Error ? error.message : "Terjadi kesalahan pada server.";
    return NextResponse.json({ error: `Gagal menyinkronkan GitHub: ${message}` }, { status: 500 });
  }
}

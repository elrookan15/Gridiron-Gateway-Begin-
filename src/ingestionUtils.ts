import fs from "fs";
import path from "path";
import type { CoachStaffRoleCategory } from "./types";

export const INGESTION_ROOT = path.resolve(process.cwd(), "data", "ingestion");
export const OUTPUT_DIR = path.join(INGESTION_ROOT, "output");

export function ensureOutputDir(): void {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

export function writeJsonArtifact(filename: string, data: unknown): string {
  ensureOutputDir();
  const filePath = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  return filePath;
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export function normalizeHexColor(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const cleaned = raw.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  return `#${cleaned.toUpperCase()}`;
}

export function classifyRole(title: string): CoachStaffRoleCategory {
  const t = title.toLowerCase();
  if (t.includes("head coach") && !t.includes("assistant")) return "Head Coach";
  if (t.includes("offensive coordinator") || /\boc\b/.test(t)) return "Offensive Coordinator";
  if (t.includes("defensive coordinator") || /\bdc\b/.test(t)) return "Defensive Coordinator";
  if (t.includes("recruiting")) return "Recruiting Coordinator";
  if (t.includes("coach")) return "Position Coach";
  return "Other";
}

export function extractEmail(htmlChunk: string): string | null {
  const mailto = htmlChunk.match(/mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/i);
  if (mailto?.[1]) return mailto[1].toLowerCase();
  const plain = htmlChunk.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/);
  return plain?.[0]?.toLowerCase() ?? null;
}

export function extractPhone(htmlChunk: string): string | null {
  const tel = htmlChunk.match(/tel:([+\d().\-\s]{7,})/i);
  if (tel?.[1]) return tel[1].trim();
  const plain = htmlChunk.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  return plain?.[0] ?? null;
}

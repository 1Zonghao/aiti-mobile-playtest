"use client";

// ---------------------------------------------------------------------------
// CloudBase HTTP API — document database (NoSQL)
// Base: https://{env}.api.tcloudbasegateway.com/v1/database/instances/(default)/databases/(default)/
//
// Anonymous auth is used for all requests.
// ────────────────────────────────────────────────────────────────────────────

const ENV_ID = process.env.NEXT_PUBLIC_TCB_ENV_ID ?? "";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface CommentItem {
  /** CloudBase document _id (string, not ObjectId) */
  id: string;
  /** Display name (1-20 chars after trim) */
  nickname: string;
  /** Comment body (1-200 chars after trim) */
  content: string;
  /** ISO-8601 timestamp set by server or client */
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

interface CloudBaseDoc {
  _id: string;
  nickname: string;
  content: string;
  createdAt: string;
}

interface QueryResult {
  data: CloudBaseDoc[];
  total?: number;
  limit: number;
  offset: number;
}

interface InsertResult {
  insertedIds: string[];
}

interface AuthResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
}

// ---------------------------------------------------------------------------
// Token & device management
// ---------------------------------------------------------------------------

const STORAGE_DEVICE = "aiti_device_id";
const STORAGE_TOKEN = "aiti_tcb_token";
const STORAGE_REFRESH = "aiti_tcb_refresh";
const STORAGE_EXPIRES = "aiti_tcb_expires";

function safeLocalStorage(): Storage | null {
  try {
    if (typeof localStorage !== "undefined") return localStorage;
  } catch { /* not available */ }
  return null;
}

export function getDeviceId(): string {
  const ls = safeLocalStorage();
  if (!ls) return _fallbackId();
  let id = ls.getItem(STORAGE_DEVICE);
  if (id) return id;
  id = `dev-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  ls.setItem(STORAGE_DEVICE, id);
  return id;
}

function _fallbackId(): string {
  return `mem-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

// ---------------------------------------------------------------------------
// Anonymous auth (no SDK)
// ---------------------------------------------------------------------------

async function signInAnonymously(): Promise<AuthResponse> {
  const res = await fetch(
    `https://${ENV_ID}.api.tcloudbasegateway.com/auth/v1/signin/anonymously`,
    { method: "POST", headers: { "x-device-id": getDeviceId() } },
  );
  if (!res.ok) throw new Error(`匿名登录失败 (${res.status})`);
  return res.json() as Promise<AuthResponse>;
}

async function getValidAccessToken(): Promise<string> {
  const ls = safeLocalStorage();

  // 1. Use cached non-expired token
  if (ls) {
    const token = ls.getItem(STORAGE_TOKEN);
    const expires = Number(ls.getItem(STORAGE_EXPIRES) ?? "0");
    if (token && expires > Date.now() + 60_000) return token;

    // 2. Try refresh
    const refresh = ls.getItem(STORAGE_REFRESH);
    if (refresh) {
      try {
        const newTokens = await refreshAccessToken(refresh);
        ls.setItem(STORAGE_TOKEN, newTokens.access_token ?? "");
        ls.setItem(STORAGE_EXPIRES, String(Date.now() + (newTokens.expires_in ?? 3600) * 1000));
        if (newTokens.refresh_token) ls.setItem(STORAGE_REFRESH, newTokens.refresh_token);
        if (newTokens.access_token) return newTokens.access_token;
      } catch { /* refresh failed, re-auth below */ }
    }
  }

  // 3. Full sign-in
  const data = await signInAnonymously();
  const token = data.access_token ?? "";
  if (!token) throw new Error("匿名登录未返回 access_token");
  if (ls) {
    ls.setItem(STORAGE_TOKEN, token);
    ls.setItem(STORAGE_EXPIRES, String(Date.now() + (data.expires_in ?? 3600) * 1000));
    if (data.refresh_token) ls.setItem(STORAGE_REFRESH, data.refresh_token);
  }
  return token;
}

async function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  const res = await fetch(
    `https://${ENV_ID}.api.tcloudbasegateway.com/auth/v1/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ grant_type: "refresh_token", refresh_token: refreshToken }),
    },
  );
  if (!res.ok) throw new Error(`Token 刷新失败 (${res.status})`);
  return res.json() as Promise<AuthResponse>;
}

// ---------------------------------------------------------------------------
// Unified request helper
// ---------------------------------------------------------------------------

const BASE_URL = `https://${ENV_ID}.api.tcloudbasegateway.com/v1/database/instances/(default)/databases/(default)`;

async function cloudBaseFetch<T = unknown>(
  path: string,
  options: { method?: "GET" | "POST"; body?: unknown; retried?: boolean },
): Promise<T> {
  if (!ENV_ID) throw new Error("缺少 CloudBase 环境 ID");

  const token = await getValidAccessToken();
  const method = options.method ?? "GET";
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
  };
  if (options.body != null) {
    headers["Content-Type"] = "application/json";
  }

  const init: RequestInit = { method, headers };
  if (options.body != null) init.body = JSON.stringify(options.body);

  const url = `${BASE_URL}${path}`;

  let res: Response;
  try {
    res = await fetch(url, init);
  } catch (err) {
    throw new Error(`网络请求失败：${err instanceof Error ? err.message : String(err)}`);
  }

  // 401 — re-auth and retry once
  if (res.status === 401 && !options.retried) {
    const ls = safeLocalStorage();
    if (ls) { ls.removeItem(STORAGE_TOKEN); ls.removeItem(STORAGE_EXPIRES); }
    return cloudBaseFetch<T>(path, { ...options, retried: true });
  }

  if (!res.ok) {
    let detail = "";
    try { const b = await res.json(); detail = b?.message ?? b?.code ?? ""; } catch { /* empty */ }
    throw new Error(`CloudBase 请求失败 (${res.status})${detail ? `: ${detail}` : ""}`);
  }

  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Public API — comments
// ---------------------------------------------------------------------------

/**
 * Fetch comments, newest first, limited to `limit` entries.
 * Uses the NoSQL document database GET endpoint.
 */
export async function getComments(limit = 30): Promise<CommentItem[]> {
  if (!ENV_ID) return [];
  const order = JSON.stringify([{ field: "createdAt", direction: "desc" }]);
  const params = new URLSearchParams({ order, limit: String(limit), offset: "0" });
  const path = `/collections/comments/documents?${params.toString()}`;

  try {
    const result = await cloudBaseFetch<QueryResult>(path, { method: "GET" });
    return (result.data ?? []).map(toCommentItem);
  } catch {
    return [];
  }
}

/**
 * Add a comment.  Returns the created item (server may return an id).
 * createdAt is set on the server when possible; a client fallback is used
 * because the raw HTTP API does not expose `serverDate()`.
 */
export async function addComment(
  input: { nickname: string; content: string },
): Promise<CommentItem | null> {
  if (!ENV_ID) return null;

  // Client timestamp as fallback — the HTTP API does not support
  // server-side timestamps natively (SDK's serverDate() is unavailable).
  const now = new Date().toISOString();

  const body = {
    data: [{ nickname: input.nickname, content: input.content, createdAt: now }],
  };

  try {
    const result = await cloudBaseFetch<InsertResult>(
      `/collections/comments/documents`,
      { method: "POST", body },
    );
    const id = result.insertedIds?.[0] ?? "";
    return { id, nickname: input.nickname, content: input.content, createdAt: now };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toCommentItem(doc: CloudBaseDoc): CommentItem {
  return {
    id: doc._id ?? "",
    nickname: doc.nickname ?? "",
    content: doc.content ?? "",
    createdAt: doc.createdAt ?? "",
  };
}

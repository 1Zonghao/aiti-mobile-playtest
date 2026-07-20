"use client";

import type { TemptationLevel, TypeCode } from "./types";

const ENV_ID = process.env.NEXT_PUBLIC_TCB_ENV_ID ?? "";

export interface CloudComment {
  _id: string;
  nickname: string;
  message: string;
  resultType: TypeCode | null;
  temptationLevel: TemptationLevel | null;
  createdAt: number;
}

const AUTH_KEY = "aiti_tcb_token";

async function getToken(): Promise<string> {
  const cached = globalThis.localStorage?.getItem(AUTH_KEY);
  if (cached) return cached;

  const res = await fetch(
    `https://${ENV_ID}.service.tcloudbase.com/auth/v1/signin`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ anonymous_token: "aiti-guest" }),
    }
  );
  if (!res.ok) throw new Error("auth failed");
  const data = await res.json();
  const token = data.access_token ?? "";
  if (token) globalThis.localStorage?.setItem(AUTH_KEY, token);
  return token;
}

async function tcbCall(action: string, body: Record<string, unknown>) {
  if (!ENV_ID) throw new Error("missing env id");
  const token = await getToken();
  const res = await fetch(
    `https://${ENV_ID}.service.tcloudbase.com/database/${action}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`CloudBase error: ${res.status}`);
  return res.json();
}

export async function fetchComments(limit = 50): Promise<CloudComment[]> {
  if (!ENV_ID) return [];
  try {
    const data = await tcbCall("query", {
      collectionName: "comments",
      order: [{ field: "createdAt", direction: "desc" }],
      limit,
    });
    return (data?.data?.list ?? []) as CloudComment[];
  } catch {
    return [];
  }
}

export async function addCloudComment(
  comment: Omit<CloudComment, "_id" | "createdAt">
): Promise<CloudComment | null> {
  if (!ENV_ID) return null;
  try {
    const data = await tcbCall("add", {
      collectionName: "comments",
      data: [{ ...comment, createdAt: Date.now() }],
    });
    const id = data?.data?.id_list?.[0] ?? "";
    return { ...comment, _id: id, createdAt: Date.now() };
  } catch {
    return null;
  }
}

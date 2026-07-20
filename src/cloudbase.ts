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
const DEVICE_KEY = "aiti_device_id";

let cachedToken: string | null = null;

function deviceId(): string {
  if (typeof localStorage === "undefined") return "";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

async function getToken(): Promise<string> {
  if (cachedToken) return cachedToken;

  const res = await fetch(
    `https://${ENV_ID}.api.tcloudbasegateway.com/auth/v1/signin/anonymously`,
    {
      method: "POST",
      headers: { "x-device-id": deviceId() },
    }
  );
  if (!res.ok) throw new Error(`auth failed: ${res.status}`);
  const data = await res.json();
  cachedToken = data.access_token ?? "";
  return cachedToken;
}

async function tcbCall(action: string, body: Record<string, unknown>) {
  if (!ENV_ID) throw new Error("missing env id");
  const token = await getToken();
  const res = await fetch(
    `https://${ENV_ID}.api.tcloudbasegateway.com/v1/rdb/${action}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    // clear cached token on auth error
    if (res.status === 401) cachedToken = null;
    throw new Error(`CloudBase error: ${res.status}`);
  }
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

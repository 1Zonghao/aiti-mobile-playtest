export type VoteConfig = { status: "available"; url: string } | { status: "unavailable"; url: null };

export function getVoteConfig(value: string | undefined): VoteConfig {
  const trimmed = value?.trim();
  if (!trimmed) return { status: "unavailable", url: null };
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return { status: "unavailable", url: null };
    return { status: "available", url: url.toString() };
  } catch {
    return { status: "unavailable", url: null };
  }
}

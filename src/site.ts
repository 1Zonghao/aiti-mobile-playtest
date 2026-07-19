export type SiteConfig = { status: "available"; url: string } | { status: "unavailable"; url: null };

export function getSiteConfig(value: string | undefined): SiteConfig {
  const trimmed = value?.trim();
  if (!trimmed) return { status: "unavailable", url: null };
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" && url.protocol !== "http:") return { status: "unavailable", url: null };
    return { status: "available", url: url.toString().replace(/\/$/, "") };
  } catch {
    return { status: "unavailable", url: null };
  }
}

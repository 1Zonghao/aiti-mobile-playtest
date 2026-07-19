import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";
const isCloudBase = process.env.CLOUDBASE === "true";
const isStaticExport = isGitHubPages || isCloudBase;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  output: isStaticExport ? "export" : undefined,
  images: { unoptimized: isStaticExport },
  basePath: isGitHubPages ? "/aiti-mobile-playtest" : undefined,
  trailingSlash: isStaticExport
};

export default nextConfig;

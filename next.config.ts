import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ["127.0.0.1"],
  output: isGitHubPages ? "export" : undefined,
  basePath: isGitHubPages ? "/aiti-mobile-playtest" : undefined,
  trailingSlash: isGitHubPages
};

export default nextConfig;

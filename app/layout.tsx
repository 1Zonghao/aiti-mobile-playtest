import type { Metadata, Viewport } from "next";
import { StoreHydrator } from "../components/store-hydrator";
import "./globals.css";

export const metadata: Metadata = {
  title: "AITI 低保真真人试玩",
  description: "AI 哄感人格测试的本地人类试玩原型"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4f1e8"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN"><body><StoreHydrator />{children}</body></html>;
}

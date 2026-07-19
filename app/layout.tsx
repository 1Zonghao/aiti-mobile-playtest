import type { Metadata, Viewport } from "next";
import { StoreHydrator } from "../components/store-hydrator";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "AITI｜你会被AI哄成什么东西？", template: "%s｜AITI" },
  description: "16种AI哄感人格，测测哪套陪伴策略最拿捏你。"
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f2e7"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="zh-CN" data-scroll-behavior="smooth"><body><StoreHydrator />{children}</body></html>;
}

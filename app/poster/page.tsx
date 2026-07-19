import type { Metadata } from "next";
import { ConferencePoster } from "../../components/conference-poster";

export const metadata: Metadata = { title: "大会扫码入口", description: "AITI大会现场扫码与打印页面。" };
export default function PosterPage() { return <ConferencePoster />; }

import { notFound } from "next/navigation";
import { DebugView } from "../../components/debug-view";
import { isDebugEnabled } from "../../src/playtest";

export default function DebugPage() {
  if (!isDebugEnabled(process.env.NODE_ENV)) notFound();
  return <DebugView />;
}

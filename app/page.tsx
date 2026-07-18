import { StartButton } from "../components/start-button";
import { disclaimersContent, siteCopyContent } from "../src/content";

export default function HomePage() {
  return (
    <main className="screen justify-between gap-8">
      <section className="pt-8">
        <p className="label mb-4">AITI / LOW-FI PLAYTEST</p>
        <h1 className="m-0 max-w-[10ch] text-[46px] font-black leading-[1.02] tracking-[-.05em]">{siteCopyContent.campaignTitle}</h1>
        <p className="mt-6 text-lg leading-8">{siteCopyContent.hook}</p>
        <div className="panel mt-8 p-4">
          <p className="m-0 font-bold">预计用时 60—120 秒</p>
          <p className="mb-0 mt-2 text-[var(--muted)]">12 道二选一题，不登录、不上传数据。</p>
        </div>
      </section>
      <section className="space-y-4">
        <StartButton />
        <p className="m-0 text-sm leading-6 text-[var(--muted)]">{disclaimersContent.unifiedDisclaimer}</p>
      </section>
    </main>
  );
}

import { trackEvent } from "../utils/analytics";

const DEFAULT_LINE_URL = "https://lin.ee/XXXXXXXXX";

export default function LineCTA() {
  const lineUrl = import.meta.env.VITE_LINE_URL || DEFAULT_LINE_URL;

  return (
    <section className="rounded-[28px] border border-green-200 bg-green-50 p-6 text-center shadow-sm">
      <p className="text-lg font-bold text-slate-800">この最適プランをLINEで保存する</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        毎年の寄付タイミングや新着返礼品のお知らせをLINEで受け取れます。
      </p>
      <a
        href={lineUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("line_cta_click")}
        className="mt-5 inline-flex rounded-full bg-green-500 px-8 py-3 text-base font-bold text-white transition-colors hover:bg-green-600"
      >
        LINEで友達追加する（無料）
      </a>
    </section>
  );
}

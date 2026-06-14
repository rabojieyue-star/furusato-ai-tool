import { useEffect, useState } from "react";
import { getPockemaruUrl, getSatofullUrl } from "../utils/affiliateLinks";
import { formatCurrency, formatNumber } from "../utils/formatters";

const CATEGORY_BADGE_STYLES = {
  肉類: "bg-red-100 text-red-700",
  魚介類: "bg-blue-100 text-blue-700",
  "米・麺類": "bg-green-100 text-green-700",
  "野菜・果物": "bg-lime-100 text-lime-700",
  "お菓子・飲料": "bg-orange-100 text-orange-700",
  日用品: "bg-gray-100 text-gray-700",
};

function CountUp({ value }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let frameId;
    const start = performance.now();
    const duration = 1000;

    const update = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setDisplayValue(Math.round(value * progress));
      if (progress < 1) {
        frameId = window.requestAnimationFrame(update);
      }
    };

    frameId = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frameId);
  }, [value]);

  return formatCurrency(displayValue);
}

export default function Step4_Result({
  recommendation,
  donationLimit,
  fallbackError,
  onRestart,
}) {
  if (!recommendation) {
    return null;
  }

  const totalDonation = recommendation.total_donation ?? 0;
  const usageRate = donationLimit > 0 ? Math.min(100, Math.round((totalDonation / donationLimit) * 100)) : 0;

  return (
    <div className="space-y-5">
      {fallbackError ? (
        <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-[clamp(0.875rem,4vw,1rem)] py-[clamp(0.75rem,3vw,0.875rem)] text-sm leading-6 text-amber-900">
          AIとの通信が不安定だったため、現在は入力内容から組み立てた暫定プランを表示しています。
        </div>
      ) : null}

      <section className="w-full overflow-hidden rounded-[28px] bg-primary p-[clamp(1rem,4vw,1.5rem)] text-white shadow-card">
        <p className="text-sm font-semibold text-white/80">あなたの実質年間節約額</p>
        <p className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">
          <CountUp value={recommendation.effective_annual_savings ?? 0} />
        </p>
        <div className="mt-6 grid gap-3 text-sm text-white/85 sm:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-3">
            <p>返礼品の実質価値</p>
            <p className="mt-1 text-lg font-bold">
              +{formatCurrency(recommendation.return_market_value ?? 0)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p>税制上の還付効果</p>
            <p className="mt-1 text-lg font-bold">
              +{formatCurrency(totalDonation > 0 ? totalDonation - 2000 : 0)}
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-3">
            <p>自己負担（一律）</p>
            <p className="mt-1 text-lg font-bold">-{formatCurrency(2000)}</p>
          </div>
        </div>
      </section>

      <section className="w-full space-y-4">
        <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-slate-900">推奨ポートフォリオ</h2>
            <p className="mt-1 text-sm text-slate-600">{recommendation.summary_message}</p>
          </div>
          <div className="text-left text-sm text-slate-500 sm:text-right">
            <p>月あたり削減目安</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(recommendation.monthly_food_cost_reduction ?? 0)}
            </p>
          </div>
        </div>

        {recommendation.portfolio?.map((item) => (
          <article
            key={`${item.category}-${item.product}`}
            className="w-full rounded-[24px] border border-slate-100 bg-white p-[clamp(1rem,4vw,1.25rem)] shadow-sm"
          >
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                CATEGORY_BADGE_STYLES[item.category] ?? "bg-slate-100 text-slate-700"
              }`}
            >
              {item.category}
            </span>
            <h3 className="mt-3 text-lg font-bold text-slate-900">{item.product}</h3>
            <p className="mt-1 text-sm text-slate-500">寄付先：{item.region}</p>

            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-slate-500">年間寄付額</p>
                <p className="mt-1 font-bold text-slate-900">{formatCurrency(item.annual_donation ?? 0)}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-slate-500">数量</p>
                <p className="mt-1 font-bold text-slate-900">{item.quantity_description}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-3">
                <p className="text-slate-500">月次カバー額</p>
                <p className="mt-1 font-bold text-slate-900">{formatCurrency(item.monthly_coverage_yen ?? 0)}</p>
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-600">{item.coverage_description}</p>

            <div className="mt-3 flex w-full flex-col gap-2 sm:flex-row">
              <a
                href={getSatofullUrl(item.region, item.product)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block flex-1 rounded-xl bg-primary px-[clamp(0.875rem,3vw,1rem)] py-[clamp(0.75rem,3vw,0.875rem)] text-center text-sm font-bold text-white transition hover:bg-primary/90"
              >
                サトふるで探す
              </a>
              <a
                href={getPockemaruUrl(item.region, item.product)}
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="block flex-1 rounded-xl border border-primary/20 bg-primary/5 px-[clamp(0.875rem,3vw,1rem)] py-[clamp(0.75rem,3vw,0.875rem)] text-center text-sm font-bold text-primary transition hover:bg-primary/10"
              >
                ポケマルで探す
              </a>
            </div>
          </article>
        ))}
      </section>

      <section className="w-full rounded-[24px] border border-slate-100 bg-white p-[clamp(1rem,4vw,1.25rem)]">
        <div className="flex w-full flex-col gap-2 text-sm font-semibold text-slate-700 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <span className="min-w-0 break-words">
            寄付総額：{formatCurrency(totalDonation)} ／ 上限：{formatCurrency(donationLimit)}
          </span>
          <span>使用率 {formatNumber(usageRate)}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-primary transition-all duration-500"
            style={{ width: `${usageRate}%` }}
          />
        </div>
      </section>

      <p className="text-xs leading-6 text-slate-400">
        ※ 表示される寄付上限額・節約額は概算です。実際の金額は年収・控除状況により異なります。正確な計算は各ふるさと納税ポータルまたは税理士にご確認ください。
      </p>

      <button
        type="button"
        onClick={onRestart}
        className="w-full rounded-full border border-slate-200 bg-white px-[clamp(1rem,4vw,1.25rem)] py-[clamp(0.75rem,3vw,0.875rem)] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        もう一度診断する
      </button>
    </div>
  );
}

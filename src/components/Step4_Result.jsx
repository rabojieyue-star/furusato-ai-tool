import { useEffect, useState } from "react";
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
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
          AIとの通信が不安定だったため、現在は入力内容から組み立てた暫定プランを表示しています。
        </div>
      ) : null}

      <section className="overflow-hidden rounded-[28px] bg-primary p-6 text-white shadow-card">
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

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">推奨ポートフォリオ</h2>
            <p className="mt-1 text-sm text-slate-600">{recommendation.summary_message}</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p>月あたり削減目安</p>
            <p className="text-lg font-bold text-primary">
              {formatCurrency(recommendation.monthly_food_cost_reduction ?? 0)}
            </p>
          </div>
        </div>

        {recommendation.portfolio?.map((item) => (
          <article
            key={`${item.category}-${item.product}`}
            className="rounded-[24px] border border-slate-100 bg-white p-5 shadow-sm"
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
          </article>
        ))}
      </section>

      <section className="rounded-[24px] border border-slate-100 bg-white p-5">
        <div className="flex items-center justify-between gap-4 text-sm font-semibold text-slate-700">
          <span>
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
        className="w-full rounded-full border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        もう一度診断する
      </button>
    </div>
  );
}

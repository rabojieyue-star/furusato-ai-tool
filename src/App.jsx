import { useEffect, useMemo, useRef, useState } from "react";
import LineCTA from "./components/LineCTA";
import ProgressBar from "./components/ProgressBar";
import Step1_Basic from "./components/Step1_Basic";
import Step2_Spending from "./components/Step2_Spending";
import Step3_Loading from "./components/Step3_Loading";
import Step4_Result from "./components/Step4_Result";
import { trackEvent } from "./utils/analytics";
import { calculateLimit, calculateSavings } from "./utils/calculateLimit";
import { getPortfolioRecommendation } from "./utils/claudeApi";

const INITIAL_SPENDING = {
  meat: 8000,
  fish: 6000,
  rice: 5000,
  vegetables: 8000,
  sweets: 5000,
  daily: 5000,
};

function buildFallbackRecommendation(spending, donationLimit) {
  const categories = [
    {
      key: "meat",
      label: "肉類",
      region: "北海道",
      product: "北海道産 黒毛和牛 切り落とし 800g",
    },
    {
      key: "fish",
      label: "魚介類",
      region: "静岡県",
      product: "静岡県産 まぐろ・干物 詰め合わせ",
    },
    {
      key: "rice",
      label: "米・麺類",
      region: "新潟県",
      product: "新潟県産 コシヒカリ 10kg",
    },
    {
      key: "vegetables",
      label: "野菜・果物",
      region: "長野県",
      product: "長野県産 旬の野菜と果物セット",
    },
    {
      key: "sweets",
      label: "お菓子・飲料",
      region: "福岡県",
      product: "福岡県産 クラフト飲料と焼き菓子セット",
    },
    {
      key: "daily",
      label: "日用品",
      region: "愛媛県",
      product: "愛媛県産 日用品まとめ便",
    },
  ];

  const sorted = [...categories]
    .sort((a, b) => (spending[b.key] ?? 0) - (spending[a.key] ?? 0))
    .slice(0, 4);
  const targetTotal = Math.max(Math.floor(donationLimit * 0.9 / 1000) * 1000, 0);
  const baseDonation = sorted.length > 0 ? Math.floor(targetTotal / sorted.length / 1000) * 1000 : 0;
  const portfolio = sorted.map((item, index) => ({
    category: item.label,
    product: item.product,
    region: item.region,
    annual_donation:
      index === sorted.length - 1 ? targetTotal - baseDonation * (sorted.length - 1) : baseDonation,
    quantity_description: "年4回配送",
    monthly_coverage_yen: Math.round((spending[item.key] ?? 0) * 0.35),
    coverage_description: `${item.label}の月支出を中心にカバーする構成です。`,
  }));
  const totalDonation = portfolio.reduce((sum, item) => sum + (item.annual_donation ?? 0), 0);
  const calc = calculateSavings(totalDonation);

  return {
    portfolio,
    total_donation: totalDonation,
    return_market_value: calc.returnValue,
    effective_annual_savings: calc.effectiveSavings,
    monthly_food_cost_reduction: Math.round(calc.effectiveSavings / 12),
    summary_message: "支出の大きいカテゴリを優先し、返礼品で家計の固定負担を軽くする配分です。",
  };
}

export default function App() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [income, setIncome] = useState("");
  const [householdType, setHouseholdType] = useState("");
  const [spending, setSpending] = useState(INITIAL_SPENDING);
  const [recommendation, setRecommendation] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStartedAt, setLoadingStartedAt] = useState(null);
  const hasTrackedStart = useRef(false);

  const donationLimit = useMemo(
    () => calculateLimit(income, householdType),
    [income, householdType],
  );

  const spendingTotals = useMemo(() => {
    const monthly = Object.values(spending).reduce((sum, value) => sum + value, 0);
    return { monthly, annual: monthly * 12 };
  }, [spending]);

  useEffect(() => {
    if (!hasTrackedStart.current) {
      trackEvent("tool_start");
      hasTrackedStart.current = true;
    }
  }, []);

  useEffect(() => {
    const sendHeight = () => {
      const height = document.documentElement.scrollHeight;
      window.parent.postMessage({ iframeHeight: height }, "*");
    };

    sendHeight();

    const observer = new ResizeObserver(sendHeight);
    observer.observe(document.body);

    return () => observer.disconnect();
  }, []);

  const moveToStep = (nextStep) => {
    setDirection(nextStep > step ? 1 : -1);
    setStep(nextStep);
  };

  const handleStep1Next = () => {
    trackEvent("step1_complete", { income, household: householdType });
    moveToStep(2);
  };

  const handleStep2Next = async () => {
    trackEvent("step2_complete");
    setError("");
    setRecommendation(null);
    setIsLoading(true);
    setLoadingStartedAt(Date.now());
    moveToStep(3);

    try {
      const result = await getPortfolioRecommendation({
        income,
        householdType,
        donationLimit,
        spending,
      });
      setRecommendation(result);
      setIsLoading(false);
      moveToStep(4);
      trackEvent("result_shown", {
        savings: result.effective_annual_savings ?? 0,
      });
    } catch (caughtError) {
      const fallback = buildFallbackRecommendation(spending, donationLimit);
      setRecommendation(fallback);
      setIsLoading(false);
      setError(caughtError.message);
      moveToStep(4);
      trackEvent("result_shown", {
        savings: fallback.effective_annual_savings ?? 0,
        fallback: true,
      });
    }
  };

  const handleRetry = async () => {
    await handleStep2Next();
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <Step1_Basic
          income={income}
          householdType={householdType}
          donationLimit={donationLimit}
          onIncomeChange={setIncome}
          onHouseholdTypeChange={setHouseholdType}
          onNext={handleStep1Next}
        />
      );
    }

    if (step === 2) {
      return (
        <Step2_Spending
          spending={spending}
          totals={spendingTotals}
          onBack={() => moveToStep(1)}
          onChange={setSpending}
          onNext={handleStep2Next}
        />
      );
    }

    if (step === 3) {
      return (
        <Step3_Loading
          isLoading={isLoading}
          error={error}
          loadingStartedAt={loadingStartedAt}
          onRetry={handleRetry}
          onBack={() => moveToStep(2)}
        />
      );
    }

    return (
      <Step4_Result
        recommendation={recommendation}
        donationLimit={donationLimit}
        fallbackError={error}
        onRestart={() => {
          setRecommendation(null);
          setError("");
          moveToStep(1);
        }}
      />
    );
  };

  return (
    <main className="min-h-screen w-full box-border px-[clamp(0.875rem,4vw,1.5rem)] py-[clamp(1rem,4vw,1.5rem)] text-ink">
      <div className="mx-auto w-full max-w-[680px] box-border">
        <section className="mb-5 w-full overflow-hidden rounded-[28px] border border-white/70 bg-white/90 p-[clamp(1rem,4vw,1.75rem)] shadow-card backdrop-blur">
          <div className="mb-5">
            <span className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-primary">
              SETSUYAKU LAB
            </span>
            <h1 className="mt-3 text-2xl font-black leading-tight text-ink sm:text-[2rem]">
              ふるさと納税を
              <br />
              家計の節約効果で見える化
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
              寄付上限額だけでなく、返礼品でどれだけ食費や日用品を置き換えられるかをAIが提案します。
            </p>
          </div>

          <ProgressBar currentStep={step} />

          <div
            key={step}
            className={`mt-6 transition-all duration-300 ${
              direction > 0 ? "animate-slide-in-right" : "animate-slide-in-left"
            }`}
          >
            {renderStep()}
          </div>
        </section>

        {step === 4 ? <LineCTA /> : null}
      </div>
    </main>
  );
}

import { formatCurrency } from "../utils/formatters";

const CATEGORY_CONFIG = [
  { key: "meat", label: "肉類（牛・豚・鶏・ハムなど）" },
  { key: "fish", label: "魚介類（刺身・干物・海産物など）" },
  { key: "rice", label: "米・麺類（米・パスタ・そばなど）" },
  { key: "vegetables", label: "野菜・果物" },
  { key: "sweets", label: "お菓子・飲料（ジュース・ビール・お菓子など）" },
  { key: "daily", label: "日用品（洗剤・トイレットペーパーなど）" },
];

function normalizeValue(value) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return Math.min(50000, Math.max(0, Math.round(numeric / 1000) * 1000));
}

export default function Step2_Spending({ spending, totals, onChange, onBack, onNext }) {
  const handleValueChange = (key, value) => {
    onChange((previous) => ({
      ...previous,
      [key]: normalizeValue(value),
    }));
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">毎月の対象支出を入力</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          返礼品で置き換えたい食費・日用品を入力してください。スライダーと数値入力は連動します。
        </p>
      </div>

      <div className="space-y-4">
        {CATEGORY_CONFIG.map((category) => (
          <div
            key={category.key}
            className="w-full rounded-[24px] border border-slate-100 bg-slate-50/70 p-[clamp(1rem,4vw,1.125rem)]"
          >
            <div className="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <label className="w-full min-w-0 text-sm font-semibold leading-6 text-slate-700">
                {category.label}
              </label>
              <input
                type="number"
                min="0"
                max="50000"
                step="1000"
                value={spending[category.key]}
                onChange={(event) => handleValueChange(category.key, event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-[clamp(0.75rem,3vw,0.875rem)] py-[clamp(0.625rem,2.5vw,0.75rem)] text-right font-semibold text-slate-900 outline-none focus:border-primary sm:max-w-[8rem]"
              />
            </div>
            <input
              type="range"
              min="0"
              max="50000"
              step="1000"
              value={spending[category.key]}
              onChange={(event) => handleValueChange(category.key, event.target.value)}
              className="mt-4 w-full"
            />
          </div>
        ))}
      </div>

      <div className="w-full rounded-[24px] border border-primary/10 bg-primary/5 p-[clamp(1rem,4vw,1.25rem)]">
        <p className="text-sm font-semibold text-primary">リアルタイム集計</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="text-xs tracking-[0.2em] text-slate-500">月間合計</p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {formatCurrency(totals.monthly)}
              <span className="ml-1 text-sm font-medium text-slate-500">/ 月</span>
            </p>
          </div>
          <div>
            <p className="text-xs tracking-[0.2em] text-slate-500">年間合計</p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {formatCurrency(totals.annual)}
              <span className="ml-1 text-sm font-medium text-slate-500">/ 年</span>
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
          className="w-full rounded-full border border-slate-200 bg-white px-[clamp(1rem,4vw,1.25rem)] py-[clamp(0.75rem,3vw,0.875rem)] font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          戻る
        </button>
        <button
          type="button"
          onClick={onNext}
          className="w-full rounded-full bg-primary px-[clamp(1rem,4vw,1.25rem)] py-[clamp(0.75rem,3vw,0.875rem)] font-bold text-white transition hover:bg-primary/90"
        >
          AIで最適化する
        </button>
      </div>
    </div>
  );
}

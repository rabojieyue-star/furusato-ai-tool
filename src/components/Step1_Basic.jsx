import { formatCurrency } from "../utils/formatters";

const INCOME_OPTIONS = [
  { value: "〜200", label: "〜200万円" },
  { value: "200〜300", label: "200〜300万円" },
  { value: "300〜400", label: "300〜400万円" },
  { value: "400〜500", label: "400〜500万円" },
  { value: "500〜600", label: "500〜600万円" },
  { value: "600〜700", label: "600〜700万円" },
  { value: "700〜800", label: "700〜800万円" },
  { value: "800〜900", label: "800〜900万円" },
  { value: "900〜1000", label: "900〜1,000万円" },
  { value: "1000〜1200", label: "1,000〜1,200万円" },
  { value: "1200〜", label: "1,200万円超" },
];

const HOUSEHOLD_OPTIONS = [
  {
    label: "夫婦世帯",
    options: [
      { value: "共働き夫婦（子なし）", label: "共働き夫婦（子なし）" },
      { value: "共働き夫婦（子1人）", label: "共働き夫婦（子1人）" },
      { value: "共働き夫婦（子2人）", label: "共働き夫婦（子2人）" },
      { value: "共働き夫婦（子3人）", label: "共働き夫婦（子3人以上）" },
      { value: "片働き夫婦（子なし）", label: "片働き夫婦（子なし）" },
      { value: "片働き夫婦（子1人）", label: "片働き夫婦（子1人）" },
      { value: "片働き夫婦（子2人）", label: "片働き夫婦（子2人）" },
      { value: "片働き夫婦（子3人以上）", label: "片働き夫婦（子3人以上）" },
    ],
  },
  {
    label: "ひとり親世帯",
    options: [
      { value: "ひとり親（子1人）", label: "ひとり親（子1人）※父子・母子家庭" },
      { value: "ひとり親（子2人）", label: "ひとり親（子2人）※父子・母子家庭" },
      { value: "ひとり親（子3人以上）", label: "ひとり親（子3人以上）※父子・母子家庭" },
    ],
  },
  {
    label: "単身",
    options: [{ value: "独身", label: "独身" }],
  },
];

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base outline-none transition focus:border-primary focus:bg-white"
      >
        <option value="">{placeholder}</option>
        {options.map((group) => {
          if (group.options) {
            return (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            );
          }

          const normalized = typeof group === "string" ? { value: group, label: group } : group;
          return (
            <option key={normalized.value} value={normalized.value}>
              {normalized.label}
            </option>
          );
        })}
      </select>
    </label>
  );
}

export default function Step1_Basic({
  income,
  householdType,
  donationLimit,
  onIncomeChange,
  onHouseholdTypeChange,
  onNext,
}) {
  const isReady = Boolean(income && householdType);
  const showWarning = isReady && donationLimit === 0;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">まずは寄付上限額の目安をチェック</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          年収と世帯タイプを選ぶと、ふるさと納税に回せる概算上限額をその場で表示します。
        </p>
      </div>

      <div className="grid gap-4">
        <SelectField
          label="年収"
          value={income}
          onChange={onIncomeChange}
          options={INCOME_OPTIONS}
          placeholder="年収帯を選択"
        />
        <SelectField
          label="世帯タイプ"
          value={householdType}
          onChange={onHouseholdTypeChange}
          options={HOUSEHOLD_OPTIONS}
          placeholder="世帯タイプを選択"
        />
      </div>

      <div className="w-full rounded-[24px] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-[clamp(1rem,4vw,1.25rem)]">
        <p className="text-sm font-semibold text-primary">あなたの寄付上限額（概算）</p>
        <p className="mt-3 text-4xl font-black tracking-tight text-primary">
          {isReady ? formatCurrency(donationLimit) : "¥0"}
        </p>
        <p className="mt-2 text-sm text-slate-500">税制優遇を前提にした簡易目安です。</p>
      </div>

      {showWarning ? (
        <div className="w-full rounded-2xl border border-amber-200 bg-amber-50 px-[clamp(0.875rem,4vw,1rem)] py-[clamp(0.75rem,3vw,0.875rem)] text-sm leading-6 text-amber-900">
          申し訳ありません、入力された条件ではふるさと納税の税制優遇が適用されない可能性があります。
        </div>
      ) : null}

      <button
        type="button"
        onClick={onNext}
        disabled={!isReady}
        className="w-full rounded-full bg-primary px-[clamp(1rem,4vw,1.25rem)] py-[clamp(0.875rem,3vw,1rem)] text-base font-bold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        支出入力へ進む
      </button>
    </div>
  );
}

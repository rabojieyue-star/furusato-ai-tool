const STEP_LABELS = ["基本情報", "支出入力", "AI分析", "結果"];

export default function ProgressBar({ currentStep }) {
  return (
    <div className="w-full">
      <div className="mb-3 grid w-full grid-cols-4 gap-2 text-center text-[0.65rem] font-semibold text-slate-400 sm:text-xs">
        {STEP_LABELS.map((label, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber <= currentStep;
          return (
            <div key={label} className="flex min-w-0 flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-white"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {stepNumber}
              </div>
              <span className={`break-words ${isActive ? "text-primary" : ""}`}>{label}</span>
            </div>
          );
        })}
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
          style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
        />
      </div>
    </div>
  );
}

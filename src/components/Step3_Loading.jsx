import { useEffect, useState } from "react";

function messageForError(error) {
  if (!error) {
    return "";
  }
  if (error.includes("timeout")) {
    return "計算に時間がかかっています。もう一度お試しください。";
  }
  if (error.includes("network")) {
    return "通信エラーが発生しました。インターネット接続をご確認ください。";
  }
  if (error.includes("json")) {
    return "AIの回答を処理できませんでした。もう一度お試しください。";
  }
  return "計算に時間がかかっています。もう一度お試しください。";
}

export default function Step3_Loading({ isLoading, error, loadingStartedAt, onRetry, onBack }) {
  const [progress, setProgress] = useState(8);

  useEffect(() => {
    if (!isLoading) {
      setProgress(100);
      return undefined;
    }

    const startedAt = loadingStartedAt ?? Date.now();
    const timer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const next = Math.min(96, 8 + elapsed / 110);
      setProgress(next);
    }, 120);

    return () => window.clearInterval(timer);
  }, [isLoading, loadingStartedAt]);

  return (
    <div className="space-y-5 py-4">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-slate-900">AIが最適なポートフォリオを計算中...</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          あなたの支出パターンに合わせた返礼品の組み合わせを分析しています。
        </p>
      </div>

      <div className="rounded-[24px] border border-slate-100 bg-slate-50 p-5">
        <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
          <span>分析の進捗</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-slate-500">通常 5〜10 秒ほどで結果を表示します。</p>
      </div>

      {!isLoading && error ? (
        <div className="space-y-4 rounded-[24px] border border-amber-200 bg-amber-50 p-5">
          <p className="text-sm leading-6 text-amber-900">{messageForError(error)}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onBack}
              className="w-full rounded-full border border-amber-200 bg-white px-5 py-3 font-semibold text-amber-900"
            >
              入力に戻る
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="w-full rounded-full bg-primary px-5 py-3 font-bold text-white"
            >
              再試行する
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

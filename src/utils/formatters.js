export function formatCurrency(value) {
  return `¥${Number(value ?? 0).toLocaleString("ja-JP")}`;
}

export function formatNumber(value) {
  return Number(value ?? 0).toLocaleString("ja-JP");
}

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";
const REQUEST_TIMEOUT_MS = 15000;

function buildPrompt({ income, householdType, donationLimit, spending }) {
  return `
あなたは日本のふるさと納税の専門アドバイザーです。
ユーザーの家計支出パターンを分析し、ふるさと納税の返礼品で最大限カバーできる最適ポートフォリオを推奨してください。

【世帯情報】
- 年収: ${income}
- 世帯タイプ: ${householdType}
- ふるさと納税の寄付上限額（概算）: ¥${donationLimit.toLocaleString()}円

【月々の食費・日用品支出】
- 肉類: ¥${(spending.meat || 0).toLocaleString()}円/月（年間: ¥${((spending.meat || 0) * 12).toLocaleString()}円）
- 魚介類: ¥${(spending.fish || 0).toLocaleString()}円/月（年間: ¥${((spending.fish || 0) * 12).toLocaleString()}円）
- 米・麺類: ¥${(spending.rice || 0).toLocaleString()}円/月（年間: ¥${((spending.rice || 0) * 12).toLocaleString()}円）
- 野菜・果物: ¥${(spending.vegetables || 0).toLocaleString()}円/月（年間: ¥${((spending.vegetables || 0) * 12).toLocaleString()}円）
- お菓子・飲料: ¥${(spending.sweets || 0).toLocaleString()}円/月（年間: ¥${((spending.sweets || 0) * 12).toLocaleString()}円）
- 日用品: ¥${(spending.daily || 0).toLocaleString()}円/月（年間: ¥${((spending.daily || 0) * 12).toLocaleString()}円）

【推奨ポートフォリオ作成ルール】
1. 推奨ポートフォリオの寄付合計は上限額の85〜95%以内に収める
2. 支出の多いカテゴリを優先してカバーする
3. 返礼品の市場価値は寄付額の30%として計算する
4. 各返礼品は具体的な産地・商品名・数量で記述する（実在しなくてよい、リアルな架空でよい）
5. ポートフォリオは3〜5品目が理想

以下のJSONのみで回答してください。マークダウンや説明文は不要です。

{
  "portfolio": [
    {
      "category": "カテゴリ名（肉類/魚介類/米・麺類/野菜・果物/お菓子・飲料/日用品 のいずれか）",
      "product": "具体的な商品名",
      "region": "都道府県名",
      "annual_donation": 30000,
      "quantity_description": "数量説明",
      "monthly_coverage_yen": 3000,
      "coverage_description": "カバー効果の説明"
    }
  ],
  "total_donation": 75000,
  "return_market_value": 22500,
  "effective_annual_savings": 20500,
  "monthly_food_cost_reduction": 1700,
  "summary_message": "一文のサマリー"
}
`;
}

function parseClaudeResponse(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const startIndex = cleaned.indexOf("{");
  const endIndex = cleaned.lastIndexOf("}");
  if (startIndex === -1 || endIndex === -1) {
    throw new Error("json_parse_error");
  }
  return JSON.parse(cleaned.slice(startIndex, endIndex + 1));
}

export async function getPortfolioRecommendation(payload) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("network_error");
  }

  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort("timeout"), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-dangerous-allow-browser": "true",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 1500,
        messages: [{ role: "user", content: buildPrompt(payload) }],
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`api_error_${response.status}`);
    }

    const data = await response.json();
    return parseClaudeResponse(data?.content?.[0]?.text ?? "");
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("timeout_error");
    }
    if (String(error?.message).includes("json")) {
      throw new Error("json_parse_error");
    }
    throw new Error("network_error");
  } finally {
    window.clearTimeout(timeoutId);
  }
}

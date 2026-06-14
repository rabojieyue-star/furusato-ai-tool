export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { income, householdType, donationLimit, spending } = req.body;

  const prompt = `
あなたは日本のふるさと納税の専門アドバイザーです。
ユーザーの家計支出パターンを分析し、ふるさと納税の返礼品で最大限カバーできる最適ポートフォリオを推奨してください。

【世帯情報】
- 年収: ${income}
- 世帯タイプ: ${householdType}
- ふるさと納税の寄付上限額（概算）: ¥${donationLimit.toLocaleString()}円

【月々の食費・日用品支出】
- 肉類: ¥${(spending.meat || 0).toLocaleString()}円/月
- 魚介類: ¥${(spending.fish || 0).toLocaleString()}円/月
- 米・麺類: ¥${(spending.rice || 0).toLocaleString()}円/月
- 野菜・果物: ¥${(spending.vegetables || 0).toLocaleString()}円/月
- お菓子・飲料: ¥${(spending.sweets || 0).toLocaleString()}円/月
- 日用品: ¥${(spending.daily || 0).toLocaleString()}円/月

【ルール】
1. 寄付合計は上限額の85〜95%以内に収める
2. 支出の多いカテゴリを優先してカバーする
3. 返礼品の市場価値は寄付額の30%として計算する
4. 各返礼品は具体的な産地・商品名・数量で記述する
5. ポートフォリオは3〜5品目

以下のJSONのみで回答してください。マークダウンや説明文は不要です：
{
  "portfolio": [
    {
      "category": "カテゴリ名（肉類/魚介類/米・麺類/野菜・果物/お菓子・飲料/日用品）",
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

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content[0].text;
    const clean = text.replace(/```json|```/g, "").trim();
    const result = JSON.parse(clean);
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ error: "API call failed" });
  }
}

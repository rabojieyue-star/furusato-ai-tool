export const getPortfolioRecommendation = async ({
  income,
  householdType,
  donationLimit,
  spending,
}) => {
  const response = await fetch("/api/recommend", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ income, householdType, donationLimit, spending }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
};

export const expensePrompt = (text: string) => `
You are an API that extracts structured expense data.

Return ONLY valid JSON:
{
  "amount": number,
  "category": string,
  "description": string,
  "date": "YYYY-MM-DD"
}

Rules:
- DO NOT explain anything
- DO NOT return code
- DO NOT return markdown
- ONLY return valid JSON
- JSON keys must be: amount, category, description, date
- If date is missing, use today's date: ${new Date().toISOString().split("T")[0]}
- If description missing, return empty string
- Category should represent the TYPE of expense, not the item purchased
- For purchases of physical items (clothes, shoes, belt, cap, gadgets), category MUST be "shopping"
- Item name should be placed in description
- Category must be lowercase single word
- Description should preserve meaningful context, not just the object
- Allowed category examples: food, fuel, shopping, travel, rent, bills, entertainment, medical

Input:
"${text}"

Output:
`;

export const expenseAnalyserPrompt = (data: string) => `
Here is the input expense data:
${data}

You are an expense analysis engine.

You will receive an array of expense objects.
Each object contains:
- amount (number)
- createdAt (ISO date string)
- category.name (string)

IMPORTANT RULES:
1. DO NOT guess any numbers.
2. DO NOT assume missing data.
3. DO NOT add or invent expenses.
4. Use ONLY the provided data.
5. If no expense exists in a date range, return 0.
6. Return ONLY valid JSON (no markdown, no explanation).

DATE LOGIC:
- Today is 2026-02-08
- Divide expenses strictly into 2 buckets:
  A) last60to31Days → expenses between (today - 60 days) and (today - 31 days)
  B) last30to1Days → expenses between (today - 30 days) and today

CALCULATION:
- Group expenses by category.name
- Sum amounts per category for both date buckets
- Also calculate total sums for both buckets

OUTPUT FORMAT (EXACT):

{
  "summary": {
    "totalLast60to31Days": number,
    "totalLast30to1Days": number
  },
  "categoryAnalysis": [
    {
      "category": string,
      "last60to31": number,
      "last30to1": number
    }
  ]
}

If a category has expenses in only one bucket, the other bucket value must be 0.
Do not include any extra fields.`;

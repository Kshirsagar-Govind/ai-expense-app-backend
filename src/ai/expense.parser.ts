import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface ParsedExpense {
  amount: number;
  category: string;
  name: string;
  description: string;
}

export async function parseExpenseFromText(
  text: string,
  categories: string[]
): Promise<ParsedExpense> {

  const prompt = `
You are an expense extraction AI.

User text:
"${text}"

Available categories:
${categories.join(", ")}

Rules:
- Extract numeric amount
- Pick best matching category
- Create a short name
- Create a clean description
- Respond ONLY in valid JSON
- No explanation

JSON format:
{
  "amount": number,
  "category": string,
  "name": string,
  "description": string
}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0
  });

  return JSON.parse(response.choices[0].message.content!);
}

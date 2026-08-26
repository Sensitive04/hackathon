import OpenAI from "openai";

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.AI_API_KEY || "",
      baseURL: process.env.AI_BASE_URL || "https://api.pateway.ai/v1",
    });
  }
  return _client;
}

export type ModelChoice = "primary" | "secondary";

export const getChatCompletion = async (
  messages: { role: "system" | "user"; content: string }[],
  model: ModelChoice = "primary"
): Promise<string> => {
  const selectedModel = model === "secondary"
    ? (process.env.AI_MODEL_SECONDARY || "gpt-5.6-luna")
    : (process.env.AI_MODEL || "deepseek-chat");
  const response = await getClient().chat.completions.create({
    model: selectedModel,
    messages,
    temperature: 0.7,
    max_completion_tokens: 4096,
  });
  return response.choices[0]?.message?.content || "";
};

export default getClient;

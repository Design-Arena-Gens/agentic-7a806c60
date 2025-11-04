import { NextRequest, NextResponse } from "next/server";

type Role = "user" | "assistant";

type IncomingMessage = {
  role: Role;
  content: string;
};

type RequestPayload = {
  systemPrompt?: string;
  customRules?: string;
  messages?: IncomingMessage[];
};

const DEFAULT_MODEL = process.env.LLAMA_MODEL ?? "llama3-8b-8192";

export async function POST(request: NextRequest) {
  let payload: RequestPayload;

  try {
    payload = (await request.json()) as RequestPayload;
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid JSON payload", detail: String(error) },
      { status: 400 }
    );
  }

  if (!payload?.messages || !Array.isArray(payload.messages)) {
    return NextResponse.json(
      { error: "messages must be an array containing the conversation history." },
      { status: 400 }
    );
  }

  const systemPrompt = (payload.systemPrompt ?? "").trim();
  const customRules = (payload.customRules ?? "").trim();

  const mergedSystem = [systemPrompt, customRules]
    .filter(Boolean)
    .join("\n\n")
    .trim();

  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey) {
    const fallback =
      "No GROQ_API_KEY detected. Provide one to relay calls to a hosted Llama " +
      "model or modify app/api/chat/route.ts to point at your local llama.cpp/Ollama runtime.";

    return NextResponse.json({
      message: fallback
    });
  }

  const messages = mergedSystem
    ? [{ role: "system", content: mergedSystem } as const, ...payload.messages]
    : payload.messages;

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${groqKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: DEFAULT_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 0.8
    })
  });

  const completion = await response.json();

  if (!response.ok) {
    const detail =
      typeof completion?.error?.message === "string"
        ? completion.error.message
        : JSON.stringify(completion);

    return NextResponse.json(
      { error: "Upstream Llama provider rejected the request.", detail },
      { status: 500 }
    );
  }

  const assistantMessage =
    completion?.choices?.[0]?.message?.content ??
    "The assistant returned an empty response.";

  return NextResponse.json({ message: assistantMessage });
}

// app/api/run/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    const key = process.env.OPENROUTER_API_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "Missing OPENROUTER_API_KEY in environment." },
        { status: 500 }
      );
    }

    const referer =
      process.env.NEXT_PUBLIC_APP_URL ||
      req.headers.get("origin") ||
      "http://localhost:3000";

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": referer,
        "X-Title": "Switchboard",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "OpenRouter error", status: res.status, body: text },
        { status: 502 }
      );
    }

    const data = await res.json();
    const output =
      data?.choices?.[0]?.message?.content ??
      "(no content returned by the model)";

    return NextResponse.json({ output });
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error("Unknown error");
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, expects: "POST" });
}

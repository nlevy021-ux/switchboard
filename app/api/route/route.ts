// app/api/route/route.ts
import { NextResponse } from "next/server";
import { ruleRouter } from "@/lib/router";
import { buildDeepLink } from "@/lib/links";

export const dynamic = "force-dynamic"; // avoid static caching

export async function POST(req: Request) {
  const { prompt } = (await req.json()) as { prompt?: string };
  const clean = (prompt ?? "").trim();

  if (!clean) {
    return NextResponse.json(
      { error: "Missing 'prompt' in request body" },
      { status: 400 }
    );
  }

  const decision = ruleRouter(clean);
  const passport = {
    goal: clean,
    audience: null,
    tone: null,
    constraints: [],
    assets: [],
    next_step: null,
  };

  const link = buildDeepLink(decision.tool, clean);

  return NextResponse.json({
    result: "toolcard",
    ...decision,
    passport,
    openUrl: link.url,
    openLabel: link.label,
  });
}

// Optional convenience: visit /api/route in the browser
export async function GET() {
  return NextResponse.json({ ok: true, expects: "POST" });
}

// Optional CORS preflight (not needed for same-origin)
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

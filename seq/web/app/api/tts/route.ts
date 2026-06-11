import { NextRequest, NextResponse } from "next/server";

const TOKEN = process.env.CHIMEGE_TTS_TOKEN;

export async function POST(req: NextRequest) {
  if (!TOKEN) {
    console.error("[TTS route] CHIMEGE_TTS_TOKEN is not set");
    return NextResponse.json({ error: "TTS token тохируулаагүй" }, { status: 500 });
  }

  const { text, gender } = await req.json();
  if (!text?.trim()) return NextResponse.json({ error: "Текст хоосон байна" }, { status: 400 });

  // Chimege only accepts Cyrillic, spaces, and ?!.,-'":
  const sanitized = text
    .replace(/[^Ѐ-ӿ\s?!.\-'":,]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
  if (!sanitized) return NextResponse.json({ error: "Текст кирилл үсэг агуулаагүй байна" }, { status: 400 });

  const headers: Record<string, string> = {
    "Content-Type": "text/plain",
    "Token": TOKEN,
  };
  if (gender === "male") headers["Voice"] = "male";

  const res = await fetch("https://api.chimege.com/v1.2/synthesize", {
    method: "POST",
    headers,
    body: sanitized,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("[TTS route] Chimege error:", res.status, body);
    return NextResponse.json({ error: "Chimege TTS алдаа", status: res.status }, { status: 502 });
  }

  const audio = await res.arrayBuffer();
  return new NextResponse(audio, {
    headers: { "Content-Type": "audio/wav" },
  });
}

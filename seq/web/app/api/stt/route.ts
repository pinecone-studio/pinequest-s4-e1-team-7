import { NextRequest, NextResponse } from "next/server";

const TOKEN = process.env.CHIMEGE_STT_TOKEN;

export async function POST(req: NextRequest) {
  if (!TOKEN) return NextResponse.json({ error: "STT token тохируулаагүй" }, { status: 500 });

  const audio = await req.arrayBuffer();
  if (!audio.byteLength) return NextResponse.json({ error: "Аудио хоосон байна" }, { status: 400 });

  const res = await fetch("https://api.chimege.com/v1.2/transcribe", {
    method: "POST",
    headers: {
      "Content-Type": "application/octet-stream",
      "Punctuate": "true",
      "Token": TOKEN,
    },
    body: audio,
  });

  if (!res.ok) return NextResponse.json({ error: "Chimege STT алдаа" }, { status: 502 });

  const text = await res.text();
  return NextResponse.json({ text });
}

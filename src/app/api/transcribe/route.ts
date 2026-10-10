import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("file") || formData.get("audio");

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json({ error: "No audio file provided" }, { status: 400 });
    }

    // 1. Fetch GhostMind key from SiteSettings or environment fallback
    let ghostmindKey = process.env.GHOSTMIND_API_KEY || "gmk_live__ZkhppflBwxJrB9rM8fPTtwgtkmpb3l6YrnkcpCJ84g";
    try {
      const payload = await getPayload({ config });
      const siteSettings = await payload.findGlobal({
        slug: "site-settings",
        locale: "ar",
        depth: 0,
      });
      if ((siteSettings as any)?.ai_ghostmind_api_key) {
        ghostmindKey = (siteSettings as any).ai_ghostmind_api_key;
      }
    } catch {
      // Use fallback key
    }

    // 2. Prepare multipart request for GhostMind /v1/audio/transcriptions
    const upstreamFormData = new FormData();
    const extension = audioFile.type.includes("mp4") ? "mp4" : audioFile.type.includes("wav") ? "wav" : "webm";
    upstreamFormData.append("file", audioFile, `recording.${extension}`);
    upstreamFormData.append("model", "whisper-1");
    upstreamFormData.append("language", "ar");

    const response = await fetch("https://ghostmind.optdmsa.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ghostmindKey}`,
      },
      body: upstreamFormData,
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn("GhostMind transcription non-ok response:", response.status, errText);

      // Handle empty audio gracefully
      if (response.status === 422 && errText.includes("empty_audio")) {
        return NextResponse.json({ text: "" });
      }

      return NextResponse.json(
        { error: "Transcription failed", details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const text = data?.text || "";

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("Transcription route error:", error);
    return NextResponse.json(
      { error: "Internal transcription error", message: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}

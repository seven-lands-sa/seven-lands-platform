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

    // 2. Normalize audio MIME type to match GhostMind strict whitelist
    // GhostMind accepts: audio/m4a, audio/mp3, audio/mp4, audio/mpeg, audio/ogg, audio/wav, audio/wave, audio/webm, audio/x-m4a, audio/x-wav
    // Strips codecs suffix like ";codecs=opus" which caused GhostMind 400 rejection
    const rawType = (audioFile.type || "").split(";")[0].trim().toLowerCase();
    let cleanMime = "audio/webm";
    let extension = "webm";

    if (rawType.includes("mp4") || rawType.includes("m4a") || rawType.includes("aac")) {
      cleanMime = "audio/mp4";
      extension = "mp4";
    } else if (rawType.includes("wav")) {
      cleanMime = "audio/wav";
      extension = "wav";
    } else if (rawType.includes("ogg")) {
      cleanMime = "audio/ogg";
      extension = "ogg";
    } else if (rawType.includes("mpeg") || rawType.includes("mp3")) {
      cleanMime = "audio/mp3";
      extension = "mp3";
    }

    const audioBuffer = await audioFile.arrayBuffer();
    const cleanBlob = new Blob([audioBuffer], { type: cleanMime });

    const upstreamFormData = new FormData();
    upstreamFormData.append("file", cleanBlob, `recording.${extension}`);
    upstreamFormData.append("model", "whisper-1");
    upstreamFormData.append("language", "ar");
    upstreamFormData.append("response_format", "json");

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

      // Handle empty audio, silence, or missing speech gracefully without throwing HTTP 400
      if (
        response.status === 422 ||
        errText.includes("empty_audio") ||
        errText.includes("empty transcription")
      ) {
        return NextResponse.json({ text: "" });
      }

      // Return gracefully with status 200 so client doesn't log a raw 400 in console
      return NextResponse.json({ text: "", warning: "Audio not recognized", details: errText });
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

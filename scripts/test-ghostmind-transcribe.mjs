const API_KEY = 'gmk_live__ZkhppflBwxJrB9rM8fPTtwgtkmpb3l6YrnkcpCJ84g';
const BASE_URL = 'https://ghostmind.optdmsa.com/v1';

async function testTranscriptionEndpoint() {
  console.log("Probing GhostMind audio transcription endpoint...");

  // Generate a minimal valid WAV header + 0.5s silence
  const sampleRate = 16000;
  const numSamples = sampleRate / 2;
  const buffer = Buffer.alloc(44 + numSamples * 2);

  // RIFF chunk descriptor
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + numSamples * 2, 4);
  buffer.write('WAVE', 8);
  // fmt sub-chunk
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM format
  buffer.writeUInt16LE(1, 22); // Mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample
  // data sub-chunk
  buffer.write('data', 36);
  buffer.writeUInt32LE(numSamples * 2, 40);

  // Create form-data
  const formData = new FormData();
  const blob = new Blob([buffer], { type: 'audio/wav' });
  formData.append('file', blob, 'sample.wav');
  formData.append('model', 'whisper-1');
  formData.append('language', 'ar');

  try {
    const res = await fetch(`${BASE_URL}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`
      },
      body: formData
    });

    console.log("Transcription HTTP Status:", res.status);
    const data = await res.text();
    console.log("Transcription Response Body:\n", data);
  } catch (err) {
    console.error("Transcription Request Failed:", err.message);
  }
}

testTranscriptionEndpoint().catch(console.error);

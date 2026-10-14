/* Aventura Espanol - pronunciation-assessment proxy (Cloudflare Worker).
 *
 * The browser records a short clip and POSTs it here with the reference text
 * (the Spanish word/phrase the learner was asked to say) and language. This
 * Worker forwards the audio to Azure Speech "Pronunciation Assessment" and
 * returns Azure's JSON (transcript + accuracy / fluency / completeness scores).
 * The Azure key stays server-side - it is never shipped to the browser.
 *
 * Config (see README.md):
 *   AZURE_SPEECH_KEY     secret  - your Azure Speech resource key
 *   AZURE_SPEECH_REGION  var     - e.g. "eastus"
 *   ALLOW_ORIGIN         var     - allowed site origin, e.g.
 *                                  "https://hypeman271-oss.github.io" ("*" = any)
 */
export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOW_ORIGIN || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400"
    };
    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") return json({ error: "POST the audio bytes" }, 405, cors);
    if (!env.AZURE_SPEECH_KEY || !env.AZURE_SPEECH_REGION) {
      return json({ error: "Server not configured (missing AZURE_SPEECH_KEY / AZURE_SPEECH_REGION)" }, 500, cors);
    }

    const url = new URL(request.url);
    const reference = (url.searchParams.get("ref") || "").slice(0, 300);
    const lang = (url.searchParams.get("lang") || "es-ES").slice(0, 15);
    const contentType = request.headers.get("Content-Type") || "audio/webm; codecs=opus";
    const audio = await request.arrayBuffer();
    if (!audio || audio.byteLength < 400) return json({ error: "No audio received" }, 400, cors);

    // Pronunciation Assessment config, base64 (UTF-8 safe) in a request header.
    const paConfig = {
      ReferenceText: reference,
      GradingSystem: "HundredMark",
      Granularity: "Phoneme",
      Dimension: "Comprehensive",
      EnableMiscue: false
    };
    const azureUrl =
      `https://${env.AZURE_SPEECH_REGION}.stt.speech.microsoft.com` +
      `/speech/recognition/conversation/cognitiveservices/v1` +
      `?language=${encodeURIComponent(lang)}&format=detailed`;

    let resp;
    try {
      resp = await fetch(azureUrl, {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": env.AZURE_SPEECH_KEY,
          "Pronunciation-Assessment": b64utf8(JSON.stringify(paConfig)),
          "Content-Type": contentType,
          "Accept": "application/json"
        },
        body: audio
      });
    } catch (e) {
      return json({ error: "Upstream request failed", detail: String(e) }, 502, cors);
    }
    const body = await resp.text();
    return new Response(body, {
      status: resp.status,
      headers: { ...cors, "Content-Type": "application/json" }
    });
  }
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), { status, headers: { ...cors, "Content-Type": "application/json" } });
}
function b64utf8(str) {
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

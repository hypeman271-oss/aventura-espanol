# Pronunciation backend (Azure + Cloudflare Worker)

A tiny Cloudflare Worker that proxies recorded audio to **Azure Speech
Pronunciation Assessment** and returns the transcript plus accuracy / fluency /
completeness scores. The app's **Speak** exercise uses it when you paste its URL
into the app's settings; without a URL the app keeps using the browser's
built-in recognizer. Your Azure key lives only in the Worker (server-side).

## 1. Create the Azure Speech resource (free tier works)
1. Go to the Azure portal -> **Create a resource** -> **Speech**.
2. Pick a region (remember it, e.g. `eastus`) and the **Free F0** tier
   (5 audio hours/month) or Standard.
3. After it deploys, open the resource -> **Keys and Endpoint**, and copy
   **KEY 1** and the **Location/Region**.

## 2. Deploy the Worker
Install Node, then the Cloudflare CLI, from this `speech-worker/` folder:

```
npm install -g wrangler
wrangler login
```

Set your region + allowed origin in `wrangler.toml` (edit `AZURE_SPEECH_REGION`
and `ALLOW_ORIGIN`), then store the key as a secret and deploy:

```
wrangler secret put AZURE_SPEECH_KEY      # paste your Azure KEY 1 when prompted
wrangler deploy
```

`wrangler deploy` prints the Worker URL, e.g.
`https://aventura-speech.<your-subdomain>.workers.dev`.

## 3. Turn it on in the app
Open the app -> **My Cards** -> the **gear (settings)** -> paste the Worker URL
into **Pronunciation backend URL** -> **Save**. Now the Speak exercise records a
clip, scores your pronunciation, and shows e.g. "Heard: abrazo - 88/100".

To turn it back off, clear that field and Save (it falls back to the browser
recognizer).

## Notes
- **Cost/limits:** Azure Free F0 = 5 hours/month; Cloudflare Workers free =
  100k requests/day. A word clip is ~1-2 seconds, so this goes a long way.
- **Audio format:** the browser records Opus (WebM/OGG), which the Worker
  forwards to Azure. Azure's REST endpoint accepts Opus; if your region ever
  rejects it, the app still works via the browser recognizer.
- **Privacy:** audio is sent to your Worker and on to Azure only while you use
  the Speak exercise. Nothing is stored by the Worker.
- **Security:** the Azure key is a Worker secret, never exposed to the browser.
  `ALLOW_ORIGIN` restricts who can call the Worker from a browser; set it to
  your site. For extra protection you can add a shared header check later.

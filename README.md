# Pro TTS Studio

Professional Text-to-Speech for web and product teams. Supports:

- Browser TTS (no keys required)
- Cloud TTS via OpenAI (set `OPENAI_API_KEY`)

## Local Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Deploy (Vercel)

Requires Vercel CLI with auth set up. Production deploy:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-c9192162
```

## Environment

- `OPENAI_API_KEY` for Cloud TTS (`/api/tts`).

## Agentic Llama Assistant

Bring your own Llama runtime, strip away platform guardrails, and inject your own rule stack. This Next.js app lets you ship a hyper-personal assistant that obeys only the manifesto you provide.

### Features

- Override the base system prompt and supply an ordered rule list.
- Streamlined conversation console that tracks dialogue history.
- Backend bridge prepared for Groq's hosted Llama 3 (`llama3-8b-8192`) out of the box.
- Drop-in friendly for local llama.cpp or Ollama endpoints by tweaking a single API handler.

### Getting Started

```bash
npm install
npm run dev
```

Create a `.env.local` file and populate your Groq token (or change the API route to target your local deployment):

```bash
cp .env.local.example .env.local
```

```env
GROQ_API_KEY=your-groq-api-key
```

### Production Build

```bash
npm run build
npm run start
```

### Deploying to Vercel

This repository is ready for one-command Vercel deploys:

```bash
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-7a806c60
```

Remember to configure the `GROQ_API_KEY` (or your custom runtime secrets) in Vercel before going live.

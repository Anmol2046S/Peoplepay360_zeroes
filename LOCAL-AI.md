# Local or hosted AI provider

PeoplePay360 does not connect the model directly to PostgreSQL. The backend remains responsible for authentication, tenant isolation, permissions, verified application data, and audit-sensitive actions.

The AI provider only receives the grounded prompt assembled by the backend and must expose an OpenAI-compatible chat endpoint:

`POST {AI_BASE_URL}/chat/completions`

Configure it in the root `.env` file:

```env
AI_BASE_URL="http://localhost:1234/v1"
AI_MODEL="your-local-model"
AI_API_KEY=""
```

This works with local runtimes such as LM Studio, llama.cpp server, or vLLM, and with a hosted OpenAI-compatible inference endpoint. For a hosted deployment, set `AI_BASE_URL` and `AI_API_KEY` as server-side environment variables; never expose the key through the frontend.

Start the backend normally after the model server is running:

```bash
npm run dev
```
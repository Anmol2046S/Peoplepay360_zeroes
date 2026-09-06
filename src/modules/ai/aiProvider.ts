type OpenAiCompatibleChatRequest = {
  model?: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  stream?: boolean;
};

type OpenAiCompatibleChatResponse = {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export class LocalAiProvider {
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly apiKey?: string;

  constructor(
    baseUrl = process.env.AI_BASE_URL || 'http://localhost:1234/v1',
    model = process.env.AI_MODEL || 'local-model',
    apiKey = process.env.AI_API_KEY,
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.model = model;
    this.apiKey = apiKey;
  }

  async generateResponse(systemPrompt: string, userPrompt: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      } satisfies OpenAiCompatibleChatRequest),
    });

    if (!response.ok) {
      throw new Error(`Local model request failed: ${response.status}`);
    }

    const payload = (await response.json()) as OpenAiCompatibleChatResponse;
    return payload.choices?.[0]?.message?.content || 'I could not generate a grounded answer.';
  }
}

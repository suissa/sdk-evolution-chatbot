import OpenAI from "openai";

export interface LLMService {
  generateResponse(prompt: string): Promise<string>;
}

export interface OpenAIServiceOptions {
  model?: string;
}

export class OpenAILLMService implements LLMService {
  constructor(private client: OpenAI, private options: OpenAIServiceOptions = {}) {}

  async generateResponse(prompt: string): Promise<string> {
    const response = await this.client.responses.create({
      model: this.options.model ?? "gpt-4o-mini",
      input: prompt,
      temperature: 0,
    });

    return response.output_text ?? "";
  }
}

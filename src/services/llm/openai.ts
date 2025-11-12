import OpenAI from "openai";

import type { LLMService } from "./types";

export interface OpenAILLMOptions {
  apiKey?: string;
  model?: string;
}

export class OpenAILLMService implements LLMService {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(options: OpenAILLMOptions = {}) {
    const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    this.client = new OpenAI({ apiKey });
    this.model = options.model ?? "gpt-4o-mini";
  }

  async generateText(prompt: string): Promise<string> {
    const response = await this.client.responses.create({
      model: this.model,
      input: prompt,
    });

    return response.output_text ?? "";
  }
}

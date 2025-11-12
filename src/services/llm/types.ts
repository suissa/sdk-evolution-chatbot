export interface LLMService {
  generateText(prompt: string): Promise<string>;
}

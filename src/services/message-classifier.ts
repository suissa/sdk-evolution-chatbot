import type { AgentDefinition, AgentId } from "@/chatbot/agents";
import type { LLMService } from "./llm-service";

export interface MessageClassificationInput {
  phoneNumber: string;
  message: string;
}

export interface MessageClassificationResult {
  agentId: AgentId;
  confidence: number;
  reasoning?: string;
}

export class MessageClassifier {
  constructor(private readonly llm: LLMService, private readonly agents: AgentDefinition[]) {}

  async classify(input: MessageClassificationInput): Promise<MessageClassificationResult> {
    const prompt = this.buildPrompt(input);
    const response = await this.llm.generateResponse(prompt);
    const parsed = this.parseResponse(response);

    if (!parsed) {
      throw new Error("Unable to classify message");
    }

    return parsed;
  }

  private buildPrompt({ message, phoneNumber }: MessageClassificationInput): string {
    const options = this.agents
      .map((agent) => `- ${agent.id}: ${agent.description}`)
      .join("\n");

    return [
      "You are a message classifier for a healthcare chatbot.",
      "You will receive a WhatsApp message and the sender's phone number.",
      "Classify the message into one of the available agents.",
      "Respond with a strict JSON object using the following format:",
      '{"agentId":"<agent-id>","confidence":<number between 0 and 1>,"reasoning":"short explanation"}',
      "Never include extra commentary or markdown.",
      "Available agents:",
      options,
      "Message to classify:",
      `Phone: ${phoneNumber}`,
      `Content: ${message}`,
    ].join("\n");
  }

  private parseResponse(response: string): MessageClassificationResult | null {
    const match = response.match(/\{[\s\S]*\}/);
    if (!match) {
      return null;
    }

    try {
      const payload = JSON.parse(match[0]) as MessageClassificationResult;
      if (!payload.agentId) {
        return null;
      }
      return payload;
    } catch (error) {
      return null;
    }
  }
}

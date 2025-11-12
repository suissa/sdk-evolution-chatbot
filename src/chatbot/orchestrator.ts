import type { ClassificationService } from "@/services/classification";

import type {
  Agent,
  ChatMessage,
  ExternalApiService,
  MessagingService,
  MemorySnapshot,
} from "./types";
import { agentMap, agents } from "./agents";
import { ConversationMemory } from "./memory";

export class ChatbotOrchestrator {
  private readonly memory = new ConversationMemory();
  private readonly firstAgent: Agent = agents[0];

  constructor(
    private readonly classificationService: ClassificationService,
    private readonly messaging: MessagingService,
    private readonly externalApi: ExternalApiService
  ) {}

  async startConversation(phone: string): Promise<void> {
    await this.messaging.sendText(phone, this.firstAgent.requestMessage);
  }

  async handleIncomingMessage(message: ChatMessage): Promise<void> {
    const { phone, message: text } = message;

    if (!text.trim()) {
      return;
    }

    const classification = await this.classificationService.classify({
      phone,
      message: text,
    });

    const agent = agentMap.get(classification.agent);
    if (!agent) {
      return;
    }

    const extracted = await agent.extractor.extract(text);
    const snapshot = this.memory.update(phone, agent.name, extracted ?? {});

    const nextAgentName = agent.nextAgent;
    if (!nextAgentName) {
      return;
    }

    if (nextAgentName === "appointmentPayment") {
      await this.externalApi.sendAppointmentData({ ...snapshot, phone });
    }

    const nextAgent = agentMap.get(nextAgentName);
    if (!nextAgent) {
      return;
    }

    await this.messaging.sendText(phone, nextAgent.requestMessage);
  }

  getMemory(phone: string): MemorySnapshot {
    return this.memory.get(phone);
  }
}

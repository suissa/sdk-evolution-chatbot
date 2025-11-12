import { agentsById, type AgentDefinition, type AgentId } from "./agents";
import { ConversationMemory, MemoryStore } from "./memory";
import type { ExternalAppointmentService } from "@/services/external-appointment-service";
import type { WhatsAppMessageSender } from "@/services/whatsapp-message-sender";

export interface FlowDependencies {
  messageSender: WhatsAppMessageSender;
  memoryStore?: MemoryStore;
  externalService: ExternalAppointmentService;
}

export class ChatbotFlow {
  private readonly memoryStore: MemoryStore;

  constructor(private readonly deps: FlowDependencies) {
    this.memoryStore = deps.memoryStore ?? new MemoryStore();
  }

  async handleAgentResult(agentId: AgentId, phoneNumber: string, message: string): Promise<void> {
    const agent = agentsById[agentId];
    if (!agent) {
      throw new Error(`Agent not found: ${agentId}`);
    }

    const memory = this.memoryStore.get(phoneNumber);
    await agent.extract({
      message,
      phoneNumber,
      memory,
    });

    if (agent.next === "appointmentPayment") {
      await this.deps.externalService.sendAppointmentData(memory.getAll());
    }

    await this.sendRequestMessage(agent, phoneNumber);
  }

  async sendRequestMessage(agent: AgentDefinition, phoneNumber: string): Promise<void> {
    await this.deps.messageSender.sendTextMessage(phoneNumber, agent.requestMessage);
  }

  getMemory(phoneNumber: string): ConversationMemory {
    return this.memoryStore.get(phoneNumber);
  }
}

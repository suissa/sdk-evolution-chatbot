import type { AgentName } from "@/services/classification";

export interface ChatMessage {
  phone: string;
  message: string;
}

export interface Agent {
  name: AgentName;
  requestMessage: string;
  nextAgent?: AgentName;
  extractor: AgentExtractor;
}

export interface AgentExtractor {
  extract(message: string): Promise<Record<string, unknown> | null>;
}

export interface MemorySnapshot {
  patient: {
    name?: string;
    email?: string;
    cpf?: string;
    birthdate?: string;
  };
  appointment: {
    isNewAppointment?: boolean;
    date?: string;
    service?: string;
    professional?: string;
    payment?: string;
  };
}

export interface MessagingService {
  sendText(phone: string, text: string): Promise<void>;
}

export interface ExternalApiService {
  sendAppointmentData(snapshot: MemorySnapshot & { phone: string }): Promise<void>;
}

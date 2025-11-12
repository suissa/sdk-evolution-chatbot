import type { ConversationMemoryData } from "@/chatbot/memory";

export interface ExternalAppointmentService {
  sendAppointmentData(data: ConversationMemoryData): Promise<void>;
}

export class MockedExternalAppointmentService implements ExternalAppointmentService {
  async sendAppointmentData(_data: ConversationMemoryData): Promise<void> {
    // Intentionally left blank for now. In a real implementation this method would
    // call an external API with the collected appointment information.
  }
}

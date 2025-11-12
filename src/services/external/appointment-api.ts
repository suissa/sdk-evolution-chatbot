import type { ExternalApiService } from "@/chatbot/types";
import type { MemorySnapshot } from "@/chatbot/types";

export class MockAppointmentApiService implements ExternalApiService {
  async sendAppointmentData(snapshot: MemorySnapshot & { phone: string }): Promise<void> {
    // Mocked integration: in a real scenario this would POST data to an external service
    void snapshot;
  }
}

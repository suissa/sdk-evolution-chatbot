import { ChatbotFlow } from "@/chatbot/flow";
import { MemoryStore } from "@/chatbot/memory";
import type { WhatsAppMessageSender } from "@/services/whatsapp-message-sender";
import type { ExternalAppointmentService } from "@/services/external-appointment-service";

class FakeMessageSender implements WhatsAppMessageSender {
  public sentMessages: Array<{ to: string; text: string }> = [];

  async sendTextMessage(to: string, text: string): Promise<void> {
    this.sentMessages.push({ to, text });
  }
}

class FakeExternalService implements ExternalAppointmentService {
  public payloads: any[] = [];

  async sendAppointmentData(data: any): Promise<void> {
    this.payloads.push(data);
  }
}

describe("ChatbotFlow", () => {
  const phoneNumber = "+5511999999999";

  it("stores data and sends the next agent message", async () => {
    const sender = new FakeMessageSender();
    const external = new FakeExternalService();
    const flow = new ChatbotFlow({
      messageSender: sender,
      memoryStore: new MemoryStore(),
      externalService: external,
    });

    await flow.handleAgentResult("patientName", phoneNumber, "John Doe");

    const memory = flow.getMemory(phoneNumber);
    expect(memory.get("patientName")).toBe("John Doe");
    expect(sender.sentMessages).toHaveLength(1);
    expect(sender.sentMessages[0]).toEqual({
      to: phoneNumber,
      text: "Thank you! Could you provide the patient's email address?",
    });
    expect(external.payloads).toHaveLength(0);
  });

  it("calls the external service before requesting payment", async () => {
    const sender = new FakeMessageSender();
    const external = new FakeExternalService();
    const flow = new ChatbotFlow({
      messageSender: sender,
      memoryStore: new MemoryStore(),
      externalService: external,
    });

    await flow.handleAgentResult("appointmentProfessional", phoneNumber, "Dr. Smith");

    expect(external.payloads).toHaveLength(1);
    expect(sender.sentMessages.at(-1)?.text).toBe(
      "Finally, what is the payment method for this appointment?"
    );
  });
});

import { ChatbotOrchestrator } from "@/chatbot";
import type { ClassificationService } from "@/services/classification";
import type { AgentName } from "@/services/classification";
import type { ExternalApiService, MessagingService } from "@/chatbot/types";

type ClassificationMap = Record<string, AgentName>;

class ClassificationStub implements Pick<ClassificationService, "classify"> {
  constructor(private readonly mapping: ClassificationMap) {}

  async classify({ message }: { message: string }) {
    const key = Object.keys(this.mapping).find((pattern) =>
      message.includes(pattern)
    );

    if (!key) {
      throw new Error(`No mapping found for message: ${message}`);
    }

    return { agent: this.mapping[key]! };
  }
}

class MessagingStub implements MessagingService {
  public readonly sent: Array<{ phone: string; text: string }> = [];

  async sendText(phone: string, text: string): Promise<void> {
    this.sent.push({ phone, text });
  }
}

class ExternalApiStub implements ExternalApiService {
  public payloads: any[] = [];

  async sendAppointmentData(snapshot: any): Promise<void> {
    this.payloads.push(snapshot);
  }
}

describe("ChatbotOrchestrator", () => {
  const phone = "5511999999999";

  it("stores information and advances through all agents", async () => {
    const classification = new ClassificationStub({
      John: "patientName",
      "john@example.com": "patientEmail",
      "123.456.789-00": "patientCpf",
      "01/01/1990": "patientBirthdate",
      Yes: "newAppointment",
      "10/03/2025": "appointmentDate",
      "Dental cleaning": "appointmentService",
      "Dr. Smith": "appointmentProfessional",
      Card: "appointmentPayment",
    });
    const messaging = new MessagingStub();
    const external = new ExternalApiStub();

    const orchestrator = new ChatbotOrchestrator(
      classification as unknown as ClassificationService,
      messaging,
      external
    );

    await orchestrator.startConversation(phone);

    await orchestrator.handleIncomingMessage({ phone, message: "John" });
    await orchestrator.handleIncomingMessage({
      phone,
      message: "john@example.com",
    });
    await orchestrator.handleIncomingMessage({
      phone,
      message: "123.456.789-00",
    });
    await orchestrator.handleIncomingMessage({ phone, message: "01/01/1990" });
    await orchestrator.handleIncomingMessage({ phone, message: "Yes" });
    await orchestrator.handleIncomingMessage({ phone, message: "10/03/2025" });
    await orchestrator.handleIncomingMessage({
      phone,
      message: "Dental cleaning",
    });
    await orchestrator.handleIncomingMessage({ phone, message: "Dr. Smith" });
    await orchestrator.handleIncomingMessage({ phone, message: "Card" });

    expect(messaging.sent.map((entry) => entry.text)).toEqual([
      "Hello! Could you please share the patient's full name?",
      "Great, thank you. What is the patient's email address so we can send the confirmation?",
      "Perfect. Please provide the patient's CPF number so we can keep the records updated.",
      "Thanks! Could you inform the patient's date of birth to complete the registration?",
      "Would you like to book a new appointment for the patient now? Please confirm yes or no.",
      "Great! On which date would you like to schedule the appointment?",
      "Thank you. What service or procedure should we schedule for this appointment?",
      "Understood. Which professional would you like to assign to this appointment?",
      "Almost done! What will be the payment method for this appointment?",
    ]);

    expect(orchestrator.getMemory(phone)).toEqual({
      patient: {
        name: "John",
        email: "john@example.com",
        cpf: "12345678900",
        birthdate: "01/01/1990",
      },
      appointment: {
        isNewAppointment: true,
        date: "10/03/2025",
        service: "Dental cleaning",
        professional: "Dr. Smith",
        payment: "Card",
      },
    });

    expect(external.payloads).toHaveLength(1);
    expect(external.payloads[0]).toMatchObject({
      phone,
      patient: expect.any(Object),
      appointment: expect.any(Object),
    });
  });
});

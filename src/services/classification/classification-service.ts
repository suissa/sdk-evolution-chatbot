import type { LLMService } from "@/services/llm/types";

import type { AgentName, ClassificationInput, ClassificationResult } from "./types";

export class ClassificationService {
  constructor(private readonly llm: LLMService) {}

  async classify(input: ClassificationInput): Promise<ClassificationResult> {
    const prompt = this.createPrompt(input);
    const raw = await this.llm.generateText(prompt);

    try {
      const parsed = JSON.parse(raw) as ClassificationResult;
      if (!parsed.agent) {
        throw new Error("Missing agent field");
      }
      return parsed;
    } catch (error) {
      throw new Error(
        `Unable to parse classification response: ${(error as Error).message}. Raw response: ${raw}`
      );
    }
  }

  private createPrompt({ message, phone }: ClassificationInput): string {
    const agentDescriptions: Record<AgentName, string> = {
      patientName:
        "Use when the message contains the patient's full name or a response providing the patient's name.",
      patientEmail:
        "Use when the user shares the patient's email address or asks about sending/confirming an email.",
      patientCpf:
        "Use when the text includes the patient's CPF number or identification number in Brazilian format.",
      patientBirthdate:
        "Use when the reply includes the patient's date of birth.",
      newAppointment:
        "Use when the user confirms or requests creating a new appointment.",
      appointmentDate:
        "Use when the message contains the appointment date or rescheduling information.",
      appointmentService:
        "Use when the user specifies the service or procedure for the appointment.",
      appointmentProfessional:
        "Use when the text mentions the professional who should attend the appointment.",
      appointmentPayment:
        "Use when the user informs or discusses the payment method for the appointment.",
    };

    const description = Object.entries(agentDescriptions)
      .map(([agent, info]) => `- ${agent}: ${info}`)
      .join("\n");

    return [
      "You are an assistant that classifies WhatsApp messages for a medical scheduling chatbot.",
      "Select the agent that should process the message and respond with a JSON object in the format {\"agent\":\"<agentName>\"}.",
      "Never include extra text or explanations.",
      "Here are the available agents:",
      description,
      "Message metadata:",
      `- Phone: ${phone}`,
      `- Message: ${message}`,
    ].join("\n");
  }
}

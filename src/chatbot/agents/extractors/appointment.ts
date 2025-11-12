import type { AgentExtractor } from "@/chatbot/types";

const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|([A-Za-z]+\s+\d{1,2}(st|nd|rd|th)?,?\s+\d{4})/;

export class NewAppointmentExtractor implements AgentExtractor {
  async extract(message: string) {
    const normalized = message.trim().toLowerCase();
    const isAffirmative = /\b(yes|sure|claro|sim|schedule|book)\b/.test(normalized);
    return { isNewAppointment: isAffirmative };
  }
}

export class AppointmentDateExtractor implements AgentExtractor {
  async extract(message: string) {
    const match = message.match(dateRegex);
    return { date: match ? match[0] : message.trim() };
  }
}

export class AppointmentServiceExtractor implements AgentExtractor {
  async extract(message: string) {
    return { service: message.trim() };
  }
}

export class AppointmentProfessionalExtractor implements AgentExtractor {
  async extract(message: string) {
    return { professional: message.trim() };
  }
}

export class AppointmentPaymentExtractor implements AgentExtractor {
  async extract(message: string) {
    return { payment: message.trim() };
  }
}

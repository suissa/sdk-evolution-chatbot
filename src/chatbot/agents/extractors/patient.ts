import type { AgentExtractor } from "@/chatbot/types";

const emailRegex = /[\w.-]+@[\w.-]+\.[A-Za-z]{2,}/;
const cpfRegex = /(\d{3}[\.\s-]?){3}\d{2}/;
const dateRegex = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})|([A-Za-z]+\s+\d{1,2}(st|nd|rd|th)?,?\s+\d{4})/;

export class PatientNameExtractor implements AgentExtractor {
  async extract(message: string) {
    return { name: message.trim() };
  }
}

export class PatientEmailExtractor implements AgentExtractor {
  async extract(message: string) {
    const match = message.match(emailRegex);
    return { email: match ? match[0] : message.trim() };
  }
}

export class PatientCpfExtractor implements AgentExtractor {
  async extract(message: string) {
    const match = message.match(cpfRegex);
    const value = match ? match[0].replace(/[^\d]/g, "") : message.replace(/[^\d]/g, "");
    return { cpf: value };
  }
}

export class PatientBirthdateExtractor implements AgentExtractor {
  async extract(message: string) {
    const match = message.match(dateRegex);
    return { birthdate: match ? match[0] : message.trim() };
  }
}

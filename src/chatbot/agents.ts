import { ConversationMemory } from "./memory";

export type AgentId =
  | "patientName"
  | "patientEmail"
  | "patientDocument"
  | "patientBirthDate"
  | "newAppointment"
  | "appointmentDate"
  | "appointmentService"
  | "appointmentProfessional"
  | "appointmentPayment";

export interface AgentExtractionContext {
  phoneNumber: string;
  message: string;
  memory: ConversationMemory;
}

export interface AgentDefinition {
  id: AgentId;
  description: string;
  requestMessage: string;
  extract(context: AgentExtractionContext): Promise<void> | void;
  next?: AgentId;
}

const sanitize = (value: string) => value.trim();

const extractEmail = (message: string) => {
  const match = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0] : sanitize(message);
};

const extractDocument = (message: string) => {
  const digits = message.replace(/\D/g, "");
  if (digits.length >= 11) {
    return digits.slice(0, 11);
  }
  return sanitize(message);
};

const extractDate = (message: string) => {
  const match = message.match(/(\d{2}[\/.-]\d{2}[\/.-]\d{4})|(\d{4}-\d{2}-\d{2})/);
  return match ? match[0].replace(/[.]/g, "/") : sanitize(message);
};

export const agents: AgentDefinition[] = [
  {
    id: "patientName",
    description: "Responsible for extracting the patient's full name.",
    requestMessage: "Thank you! Could you provide the patient's email address?",
    extract: ({ message, memory }) => {
      memory.set("patientName", sanitize(message));
    },
    next: "patientEmail",
  },
  {
    id: "patientEmail",
    description: "Collects the patient's email address.",
    requestMessage: "Great! What is the patient's CPF number?",
    extract: ({ message, memory }) => {
      memory.set("patientEmail", extractEmail(message));
    },
    next: "patientDocument",
  },
  {
    id: "patientDocument",
    description: "Captures the patient's CPF document number.",
    requestMessage: "Perfect. Could you tell me the patient's birth date?",
    extract: ({ message, memory }) => {
      memory.set("patientDocument", extractDocument(message));
    },
    next: "patientBirthDate",
  },
  {
    id: "patientBirthDate",
    description: "Retrieves the patient's birth date information.",
    requestMessage: "Thanks! Should we create a new appointment for the patient?",
    extract: ({ message, memory }) => {
      memory.set("patientBirthDate", extractDate(message));
    },
    next: "newAppointment",
  },
  {
    id: "newAppointment",
    description: "Understands the context of a new appointment request.",
    requestMessage: "Please provide the desired appointment date.",
    extract: ({ message, memory }) => {
      memory.set("newAppointment", sanitize(message));
    },
    next: "appointmentDate",
  },
  {
    id: "appointmentDate",
    description: "Extracts the appointment date information.",
    requestMessage: "Which service is the patient scheduling?",
    extract: ({ message, memory }) => {
      memory.set("appointmentDate", extractDate(message));
    },
    next: "appointmentService",
  },
  {
    id: "appointmentService",
    description: "Determines the type of service requested for the appointment.",
    requestMessage: "Who will be the professional responsible for the appointment?",
    extract: ({ message, memory }) => {
      memory.set("appointmentService", sanitize(message));
    },
    next: "appointmentProfessional",
  },
  {
    id: "appointmentProfessional",
    description: "Captures the professional assigned to the appointment.",
    requestMessage: "Finally, what is the payment method for this appointment?",
    extract: ({ message, memory }) => {
      memory.set("appointmentProfessional", sanitize(message));
    },
    next: "appointmentPayment",
  },
  {
    id: "appointmentPayment",
    description: "Extracts information about the appointment payment.",
    requestMessage: "Thank you for the details. Let me know if you need anything else!",
    extract: ({ message, memory }) => {
      memory.set("appointmentPayment", sanitize(message));
    },
  },
];

export const agentsById = agents.reduce<Record<AgentId, AgentDefinition>>((acc, agent) => {
  acc[agent.id] = agent;
  return acc;
}, {} as Record<AgentId, AgentDefinition>);

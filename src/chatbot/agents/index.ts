import type { Agent } from "@/chatbot/types";
import {
  AppointmentDateExtractor,
  AppointmentPaymentExtractor,
  AppointmentProfessionalExtractor,
  AppointmentServiceExtractor,
  NewAppointmentExtractor,
} from "./extractors/appointment";
import {
  PatientBirthdateExtractor,
  PatientCpfExtractor,
  PatientEmailExtractor,
  PatientNameExtractor,
} from "./extractors/patient";

export const agents: Agent[] = [
  {
    name: "patientName",
    requestMessage: "Hello! Could you please share the patient's full name?",
    nextAgent: "patientEmail",
    extractor: new PatientNameExtractor(),
  },
  {
    name: "patientEmail",
    requestMessage:
      "Great, thank you. What is the patient's email address so we can send the confirmation?",
    nextAgent: "patientCpf",
    extractor: new PatientEmailExtractor(),
  },
  {
    name: "patientCpf",
    requestMessage:
      "Perfect. Please provide the patient's CPF number so we can keep the records updated.",
    nextAgent: "patientBirthdate",
    extractor: new PatientCpfExtractor(),
  },
  {
    name: "patientBirthdate",
    requestMessage:
      "Thanks! Could you inform the patient's date of birth to complete the registration?",
    nextAgent: "newAppointment",
    extractor: new PatientBirthdateExtractor(),
  },
  {
    name: "newAppointment",
    requestMessage:
      "Would you like to book a new appointment for the patient now? Please confirm yes or no.",
    nextAgent: "appointmentDate",
    extractor: new NewAppointmentExtractor(),
  },
  {
    name: "appointmentDate",
    requestMessage:
      "Great! On which date would you like to schedule the appointment?",
    nextAgent: "appointmentService",
    extractor: new AppointmentDateExtractor(),
  },
  {
    name: "appointmentService",
    requestMessage:
      "Thank you. What service or procedure should we schedule for this appointment?",
    nextAgent: "appointmentProfessional",
    extractor: new AppointmentServiceExtractor(),
  },
  {
    name: "appointmentProfessional",
    requestMessage:
      "Understood. Which professional would you like to assign to this appointment?",
    nextAgent: "appointmentPayment",
    extractor: new AppointmentProfessionalExtractor(),
  },
  {
    name: "appointmentPayment",
    requestMessage:
      "Almost done! What will be the payment method for this appointment?",
    extractor: new AppointmentPaymentExtractor(),
  },
];

export const agentMap = new Map(agents.map((agent) => [agent.name, agent]));

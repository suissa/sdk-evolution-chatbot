export type AgentName =
  | "patientName"
  | "patientEmail"
  | "patientCpf"
  | "patientBirthdate"
  | "newAppointment"
  | "appointmentDate"
  | "appointmentService"
  | "appointmentProfessional"
  | "appointmentPayment";

export interface ClassificationInput {
  phone: string;
  message: string;
}

export interface ClassificationResult {
  agent: AgentName;
}

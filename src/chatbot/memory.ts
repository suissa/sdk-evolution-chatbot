import type { AgentName } from "@/services/classification";

import type { MemorySnapshot } from "./types";

export class ConversationMemory {
  private readonly storage = new Map<string, MemorySnapshot>();

  get(phone: string): MemorySnapshot {
    if (!this.storage.has(phone)) {
      this.storage.set(phone, {
        patient: {},
        appointment: {},
      });
    }

    return this.storage.get(phone)!;
  }

  update(phone: string, agent: AgentName, data: Record<string, unknown>): MemorySnapshot {
    const snapshot = this.get(phone);

    switch (agent) {
      case "patientName": {
        snapshot.patient.name = String(data.name ?? data.value ?? data.text ?? "").trim();
        break;
      }
      case "patientEmail": {
        snapshot.patient.email = String(data.email ?? data.value ?? data.text ?? "").trim();
        break;
      }
      case "patientCpf": {
        snapshot.patient.cpf = String(data.cpf ?? data.value ?? data.text ?? "").trim();
        break;
      }
      case "patientBirthdate": {
        snapshot.patient.birthdate = String(
          data.birthdate ?? data.date ?? data.value ?? data.text ?? ""
        ).trim();
        break;
      }
      case "newAppointment": {
        const rawValue = data.isNewAppointment ?? data.value ?? data.text ?? "";
        if (typeof rawValue === "boolean") {
          snapshot.appointment.isNewAppointment = rawValue;
        } else {
          const value = String(rawValue).trim().toLowerCase();
          snapshot.appointment.isNewAppointment = value.startsWith("y");
        }
        break;
      }
      case "appointmentDate": {
        snapshot.appointment.date = String(
          data.date ?? data.value ?? data.text ?? ""
        ).trim();
        break;
      }
      case "appointmentService": {
        snapshot.appointment.service = String(
          data.service ?? data.value ?? data.text ?? ""
        ).trim();
        break;
      }
      case "appointmentProfessional": {
        snapshot.appointment.professional = String(
          data.professional ?? data.value ?? data.text ?? ""
        ).trim();
        break;
      }
      case "appointmentPayment": {
        snapshot.appointment.payment = String(
          data.payment ?? data.value ?? data.text ?? ""
        ).trim();
        break;
      }
      default:
        break;
    }

    return snapshot;
  }
}

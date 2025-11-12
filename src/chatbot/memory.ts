export interface ConversationMemoryData {
  patientName?: string;
  patientEmail?: string;
  patientDocument?: string;
  patientBirthDate?: string;
  newAppointment?: string;
  appointmentDate?: string;
  appointmentService?: string;
  appointmentProfessional?: string;
  appointmentPayment?: string;
}

export class ConversationMemory {
  private data: ConversationMemoryData = {};

  getAll(): ConversationMemoryData {
    return { ...this.data };
  }

  set<K extends keyof ConversationMemoryData>(key: K, value: ConversationMemoryData[K]) {
    this.data[key] = value;
  }

  get<K extends keyof ConversationMemoryData>(key: K): ConversationMemoryData[K] | undefined {
    return this.data[key];
  }
}

export class MemoryStore {
  private conversations = new Map<string, ConversationMemory>();

  get(phoneNumber: string): ConversationMemory {
    if (!this.conversations.has(phoneNumber)) {
      this.conversations.set(phoneNumber, new ConversationMemory());
    }

    return this.conversations.get(phoneNumber)!;
  }
}

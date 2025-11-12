import type { EvolutionClient } from "@/index";

export interface WhatsAppMessageSender {
  sendTextMessage(to: string, text: string): Promise<void>;
}

export class EvolutionWhatsAppMessageSender implements WhatsAppMessageSender {
  constructor(private readonly client: EvolutionClient) {}

  async sendTextMessage(to: string, text: string): Promise<void> {
    await this.client.messages.sendText({
      number: to,
      text,
    });
  }
}

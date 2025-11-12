import type { MessagesModule } from "@/modules/messages";

import type { MessagingService } from "./types";

export class WhatsAppMessagingService implements MessagingService {
  constructor(private readonly messages: MessagesModule) {}

  async sendText(phone: string, text: string): Promise<void> {
    await this.messages.sendText({
      number: phone,
      text,
    });
  }
}

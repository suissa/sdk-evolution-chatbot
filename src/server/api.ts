import Fastify, { type FastifyInstance } from "fastify";
import { phoneNumberFromJid } from "@/utils/phone-numer-from-jid";
import type { ChatbotFlow } from "@/chatbot/flow";
import type { MessageClassifier } from "@/services/message-classifier";

interface WebhookMessage {
  key?: {
    remoteJid?: string;
  };
  message?: {
    conversation?: string;
    extendedTextMessage?: {
      text?: string;
    };
  };
}

interface WebhookPayload {
  event: string;
  data?: {
    messages?: WebhookMessage[];
  };
}

export interface CreateServerOptions {
  classifier: MessageClassifier;
  flow: Pick<ChatbotFlow, "handleAgentResult">;
}

const extractMessageText = (payloadMessage?: WebhookMessage): string | null => {
  if (!payloadMessage) {
    return null;
  }

  const text =
    payloadMessage.message?.conversation ||
    payloadMessage.message?.extendedTextMessage?.text;

  return text ?? null;
};

const extractPhoneNumber = (payloadMessage?: WebhookMessage): string | null => {
  const remoteJid = payloadMessage?.key?.remoteJid;
  if (!remoteJid) {
    return null;
  }

  try {
    return phoneNumberFromJid(remoteJid);
  } catch (error) {
    return null;
  }
};

export const createServer = ({ classifier, flow }: CreateServerOptions): FastifyInstance => {
  const app = Fastify();

  app.post("/webhook", async (request, reply) => {
    const payload = request.body as WebhookPayload | undefined;

    if (payload?.event === "messages.upsert") {
      const message = payload.data?.messages?.[0];
      const text = extractMessageText(message);
      const phoneNumber = extractPhoneNumber(message);

      if (text && phoneNumber) {
        const classification = await classifier.classify({
          message: text,
          phoneNumber,
        });

        await flow.handleAgentResult(classification.agentId, phoneNumber, text);
      }
    }

    return reply.status(200).send({ status: "received" });
  });

  return app;
};

export type { WebhookPayload };

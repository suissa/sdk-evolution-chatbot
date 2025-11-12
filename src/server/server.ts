import Fastify, { type FastifyInstance } from "fastify";

import type { ChatbotOrchestrator } from "@/chatbot/orchestrator";
import type { WebhookPayload } from "./webhook-types";

export function buildServer(orchestrator: ChatbotOrchestrator): FastifyInstance {
  const fastify = Fastify();

  fastify.post("/webhook", async (request, reply) => {
    const payload = request.body as WebhookPayload | undefined;

    if (payload?.event === "messages.upsert") {
      const message = payload.data?.messages?.[0];
      const phone = message?.from;
      const text =
        message?.text?.body ?? message?.message?.conversation ?? "";

      if (phone && text) {
        await orchestrator.handleIncomingMessage({
          phone,
          message: text,
        });
      }
    }

    return reply.status(200).send({ received: true });
  });

  return fastify;
}

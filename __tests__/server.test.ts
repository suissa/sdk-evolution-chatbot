import { createServer } from "@/server/api";
import type { ChatbotFlow } from "@/chatbot/flow";
import type { MessageClassifier } from "@/services/message-classifier";

describe("Fastify webhook server", () => {
  const remoteJid = "5511999999999@s.whatsapp.net";
  const phoneNumber = "+5511999999999";

  const buildPayload = (event: string) => ({
    event,
    data: {
      messages: [
        {
          key: { remoteJid },
          message: {
            conversation: "Hello",
          },
        },
      ],
    },
  });

  it("routes messages to the classifier and flow", async () => {
    const classifier: Pick<MessageClassifier, "classify"> = {
      classify: jest.fn().mockResolvedValue({ agentId: "patientName", confidence: 1 }),
    };
    const flow: Pick<ChatbotFlow, "handleAgentResult"> = {
      handleAgentResult: jest.fn().mockResolvedValue(undefined),
    };

    const app = createServer({ classifier: classifier as MessageClassifier, flow });

    const response = await app.inject({
      method: "POST",
      url: "/webhook",
      payload: buildPayload("messages.upsert"),
    });

    expect(response.statusCode).toBe(200);
    expect(classifier.classify).toHaveBeenCalledWith({
      message: "Hello",
      phoneNumber,
    });
    expect(flow.handleAgentResult).toHaveBeenCalledWith("patientName", phoneNumber, "Hello");
  });

  it("ignores non upsert events", async () => {
    const classifier: Pick<MessageClassifier, "classify"> = {
      classify: jest.fn(),
    };
    const flow: Pick<ChatbotFlow, "handleAgentResult"> = {
      handleAgentResult: jest.fn(),
    };

    const app = createServer({ classifier: classifier as MessageClassifier, flow });

    await app.inject({
      method: "POST",
      url: "/webhook",
      payload: buildPayload("connection.update"),
    });

    expect(classifier.classify).not.toHaveBeenCalled();
    expect(flow.handleAgentResult).not.toHaveBeenCalled();
  });
});

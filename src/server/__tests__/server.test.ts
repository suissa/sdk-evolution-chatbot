import { buildServer } from "@/server";

class OrchestratorStub {
  public received: Array<{ phone: string; message: string }> = [];

  async handleIncomingMessage(payload: { phone: string; message: string }) {
    this.received.push(payload);
  }
}

describe("buildServer", () => {
  it("processes webhook events and forwards messages to the orchestrator", async () => {
    const orchestrator = new OrchestratorStub();
    const server = buildServer(orchestrator as any);

    await server.inject({
      method: "POST",
      url: "/webhook",
      payload: {
        event: "messages.upsert",
        data: {
          messages: [
            {
              from: "5511999999999",
              text: { body: "Hello" },
            },
          ],
        },
      },
    });

    expect(orchestrator.received).toEqual([
      { phone: "5511999999999", message: "Hello" },
    ]);
  });

  it("ignores events without the expected payload", async () => {
    const orchestrator = new OrchestratorStub();
    const server = buildServer(orchestrator as any);

    await server.inject({
      method: "POST",
      url: "/webhook",
      payload: { event: "other.event" },
    });

    expect(orchestrator.received).toHaveLength(0);
  });
});

import { ClassificationService } from "@/services/classification";
import type { LLMService } from "@/services/llm";

class FakeLLM implements LLMService {
  constructor(private readonly response: string) {}

  async generateText(): Promise<string> {
    return this.response;
  }
}

describe("ClassificationService", () => {
  it("parses the LLM response and returns the agent", async () => {
    const llm = new FakeLLM('{"agent":"patientEmail"}');
    const service = new ClassificationService(llm);

    await expect(
      service.classify({
        phone: "5511999999999",
        message: "The email is patient@example.com",
      })
    ).resolves.toEqual({ agent: "patientEmail" });
  });

  it("throws when the response is not valid JSON", async () => {
    const llm = new FakeLLM("invalid response");
    const service = new ClassificationService(llm);

    await expect(
      service.classify({
        phone: "5511999999999",
        message: "content",
      })
    ).rejects.toThrow(/Unable to parse classification response/);
  });
});

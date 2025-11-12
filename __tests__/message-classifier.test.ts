import { agents } from "@/chatbot/agents";
import { MessageClassifier } from "@/services/message-classifier";
import type { LLMService } from "@/services/llm-service";

class FakeLLM implements LLMService {
  public lastPrompt: string | null = null;
  constructor(private readonly response: string) {}

  async generateResponse(prompt: string): Promise<string> {
    this.lastPrompt = prompt;
    return this.response;
  }
}

describe("MessageClassifier", () => {
  it("classifies a message using the LLM response", async () => {
    const llm = new FakeLLM('{"agentId":"patientName","confidence":0.9}');
    const classifier = new MessageClassifier(llm, agents);

    const result = await classifier.classify({
      message: "John Doe",
      phoneNumber: "+5511999999999",
    });

    expect(result.agentId).toBe("patientName");
    expect(result.confidence).toBe(0.9);
    expect(llm.lastPrompt).toContain("Phone: +5511999999999");
    expect(llm.lastPrompt).toContain("Content: John Doe");
  });

  it("throws when the response is not valid JSON", async () => {
    const llm = new FakeLLM("I am not JSON");
    const classifier = new MessageClassifier(llm, agents);

    await expect(
      classifier.classify({ message: "Hello", phoneNumber: "+1" })
    ).rejects.toThrow("Unable to classify message");
  });
});

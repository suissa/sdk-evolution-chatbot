export interface WebhookMessage {
  from: string;
  text?: {
    body?: string;
  };
  message?: {
    conversation?: string;
  };
}

export interface WebhookPayload {
  event: string;
  data?: {
    messages?: WebhookMessage[];
  };
}

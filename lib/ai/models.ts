export const DEFAULT_CHAT_MODEL: string = "chat-model";

export type ChatModel = {
  id: string;
  name: string;
  description: string;
};

export const chatModels: ChatModel[] = [
  {
    id: "chat-model",
    name: "DeepSeek Chat",
    description: "A versatile model for general-purpose conversations",
  },
  {
    id: "chat-model-reasoning",
    name: "DeepSeek Reasoning",
    description: "Optimized for complex reasoning and problem-solving tasks",
  },
];

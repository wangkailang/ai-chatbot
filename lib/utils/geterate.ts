import {
  generateText as aiGenerateText,
  generateObject,
  streamObject,
  streamText,
  wrapLanguageModel,
} from "ai";
import { wrapAISDK } from "langsmith/experimental/vercel";

export const generateText = wrapAISDK({
  generateText: aiGenerateText,
  streamText,
  streamObject,
  generateObject,
  wrapLanguageModel,
}).generateText;

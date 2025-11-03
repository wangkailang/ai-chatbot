import * as ai from "ai";
import { wrapAISDK } from "langsmith/experimental/vercel";

export const generateText = wrapAISDK(ai).generateText;

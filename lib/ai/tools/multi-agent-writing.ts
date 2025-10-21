import { tool } from "ai";
import { z } from "zod";
import { formatMultiAgentOutput } from "@/lib/ai/formatters/multi-agent-output";
import {
  createInitialState,
  executeWritingWorkflow,
} from "@/lib/ai/langgraph/graph";
import { SynthesisStrategy } from "@/lib/ai/langgraph/types";

export const multiAgentWriting = tool({
  description:
    "Use multiple AI agents to collaboratively write high-quality content. " +
    "The system automatically identifies 2-4 specialized roles (like technical expert, storyteller, editor, etc.) " +
    "based on the writing request, then combines their outputs into cohesive content. " +
    "Best for: articles, documentation, marketing content, reports, creative writing, etc.",
  inputSchema: z.object({
    request: z
      .string()
      .describe(
        "The detailed writing request describing what content to create"
      ),
    tone: z
      .enum(["professional", "casual", "technical", "creative", "academic"])
      .optional()
      .describe("The desired tone of the content"),
    targetAudience: z
      .string()
      .optional()
      .describe(
        "Who the content is for (e.g., 'developers', 'general public')"
      ),
    maxLength: z
      .number()
      .optional()
      .describe("Maximum length in words (approximate)"),
    synthesisStrategy: z
      .enum([
        SynthesisStrategy.INTERLEAVING,
        SynthesisStrategy.LAYERING,
        SynthesisStrategy.HIGHLIGHTING,
        SynthesisStrategy.BLENDING,
      ])
      .optional()
      .describe(
        "How to combine agent outputs: " +
          "interleaving (mix sections), layering (stack sequentially), " +
          "highlighting (present distinctly), blending (unified narrative)"
      ),
  }),
  execute: async ({
    request,
    tone,
    targetAudience,
    maxLength,
    synthesisStrategy,
  }) => {
    try {
      // Create initial state with user constraints
      const state = createInitialState(request, {
        tone,
        targetAudience,
        maxLength,
        preferredRoles: undefined,
        synthesisStrategy: synthesisStrategy || SynthesisStrategy.INTERLEAVING,
      });

      // Execute the workflow
      const finalState = await executeWritingWorkflow(state);

      // Format the output
      const output = formatMultiAgentOutput(finalState);

      // Return formatted result for the chat
      return {
        success: true,
        content: output.finalContent,
        metadata: {
          roles: output.identifiedRoles.map((role) => role.name).join(", "),
          strategy: output.metadata.synthesisStrategy,
          duration: output.metadata.duration,
          agents: Object.entries(output.agents).map(([_id, agent]) => ({
            role: agent.roleName,
            confidence: agent.confidence,
          })),
        },
      };
    } catch (error) {
      console.error("Multi-agent writing error:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate content with multi-agent system",
      };
    }
  },
});

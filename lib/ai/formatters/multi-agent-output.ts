/**
 * Output formatter for multi-agent writing results
 */

import { z } from "zod";
import type { WritingGraphState } from "@/lib/ai/langgraph/types";

/**
 * Output schema for API response
 */
export const MultiAgentOutputSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  request: z.string(),
  identifiedRoles: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
    })
  ),
  roleAnalysis: z.object({
    reasoning: z.string(),
    confidence: z.number(),
  }),
  agents: z.record(
    z.object({
      roleName: z.string(),
      roleDescription: z.string(),
      contribution: z.string(),
      reasoning: z.string(),
      confidence: z.number(),
    })
  ),
  finalContent: z.string(),
  metadata: z.object({
    tokensUsed: z.number().optional(),
    duration: z.number(),
    graphExecutionId: z.string(),
    synthesisStrategy: z.string(),
    warnings: z.array(z.string()),
  }),
});

export type MultiAgentOutput = z.infer<typeof MultiAgentOutputSchema>;

/**
 * Format the workflow state into a structured API response
 */
export function formatMultiAgentOutput(
  state: WritingGraphState
): MultiAgentOutput {
  const duration = Date.now() - state.startTime;

  // Format role analysis
  const identifiedRoles =
    state.roleAnalysis?.identifiedRoles.map((role) => ({
      id: role.id,
      name: role.name,
      description: role.description,
    })) || [];

  const roleAnalysis = {
    reasoning: state.roleAnalysis?.reasoning || "No analysis available",
    confidence: state.roleAnalysis?.confidence || 0,
  };

  // Format agent contributions
  const agents: Record<string, MultiAgentOutput["agents"][string]> = {};
  for (const [roleId, output] of Object.entries(state.agentOutputs)) {
    agents[roleId] = {
      roleName: output.roleName,
      roleDescription: output.roleDescription,
      contribution: output.content,
      reasoning: output.reasoning,
      confidence: output.confidence,
    };
  }

  // Get synthesis strategy
  const synthesisStrategy =
    state.userConstraints?.synthesisStrategy || "blending";

  return {
    id: state.graphExecutionId,
    timestamp: new Date().toISOString(),
    request: state.userRequest,
    identifiedRoles,
    roleAnalysis,
    agents,
    finalContent: state.synthesizedContent || "",
    metadata: {
      duration,
      graphExecutionId: state.graphExecutionId,
      synthesisStrategy,
      warnings: state.errors.length > 0 ? state.errors : [],
    },
  };
}

/**
 * LangGraph nodes for the multi-agent writing system
 */

import { agentFactory } from "../agents/writing/dynamic-agent-factory";
import { analyzeRoles } from "../agents/writing/role-analyzer";
import { synthesizeOutputs } from "../agents/writing/synthesizer-agent";
import type { WritingGraphState } from "./types";
import { SynthesisStrategy } from "./types";

/**
 * Role Analyzer Node: Determines optimal writing roles
 */
export async function roleAnalyzerNode(
  state: WritingGraphState
): Promise<Partial<WritingGraphState>> {
  try {
    const roleAnalysis = await analyzeRoles(
      state.userRequest,
      state.userConstraints
    );

    return {
      roleAnalysis,
      currentNode: "role_analyzer",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error in role analyzer";
    return {
      errors: [errorMessage],
      currentNode: "role_analyzer",
    };
  }
}

/**
 * Dynamic Agent Executor Node: Executes agents based on identified roles
 */
export async function dynamicAgentExecutorNode(
  state: WritingGraphState
): Promise<Partial<WritingGraphState>> {
  if (!state.roleAnalysis) {
    return {
      errors: ["No role analysis found"],
      currentNode: "dynamic_agent_executor",
    };
  }

  try {
    const { identifiedRoles } = state.roleAnalysis;

    // Execute all agents in parallel
    const agentPromises = identifiedRoles.map(async (role) => {
      const agent = agentFactory.createAgent(role);
      const output = await agent.generate(
        state.userRequest,
        state.userConstraints
      );
      return { roleId: role.id, output };
    });

    const results = await Promise.allSettled(agentPromises);

    // Collect successful outputs
    const agentOutputs: Record<
      string,
      WritingGraphState["agentOutputs"][string]
    > = {};
    const errors: string[] = [];

    for (const result of results) {
      if (result.status === "fulfilled") {
        const { roleId, output } = result.value;
        agentOutputs[roleId] = output;
      } else {
        errors.push(`Agent failed: ${result.reason}`);
      }
    }

    const result: Partial<WritingGraphState> = {
      agentOutputs,
      currentNode: "dynamic_agent_executor",
    };

    if (errors.length > 0) {
      result.errors = errors;
    }

    return result;
  } catch (error) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Unknown error in agent executor";
    return {
      errors: [errorMessage],
      currentNode: "dynamic_agent_executor",
    };
  }
}

/**
 * Synthesizer Node: Combines agent outputs into final content
 */
export async function synthesizerNode(
  state: WritingGraphState
): Promise<Partial<WritingGraphState>> {
  try {
    const agentOutputsArray = Object.values(state.agentOutputs);

    if (agentOutputsArray.length === 0) {
      return {
        errors: ["No agent outputs to synthesize"],
        currentNode: "synthesizer",
      };
    }

    const strategy =
      state.userConstraints?.synthesisStrategy || SynthesisStrategy.BLENDING;

    const { content, reasoning } = await synthesizeOutputs(
      agentOutputsArray,
      state.userRequest,
      strategy
    );

    return {
      synthesizedContent: content,
      finalReasoning: reasoning,
      currentNode: "synthesizer",
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error in synthesizer";
    return {
      errors: [errorMessage],
      currentNode: "synthesizer",
    };
  }
}

/**
 * Error Handler Node: Handles errors gracefully
 */
export function errorHandlerNode(
  state: WritingGraphState
): Partial<WritingGraphState> {
  const errorMessage = state.errors.join("; ");

  return {
    synthesizedContent: `An error occurred during content generation: ${errorMessage}`,
    finalReasoning: "Error occurred, returning error message",
    currentNode: "error_handler",
  };
}

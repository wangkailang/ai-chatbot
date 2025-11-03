/**
 * Multi-Agent Writing Workflow
 * Simplified sequential execution for reliable operation
 */

import { nanoid } from "nanoid";
import {
  dynamicAgentExecutorNode,
  errorHandlerNode,
  roleAnalyzerNode,
  synthesizerNode,
} from "./nodes";
import type { WritingGraphState } from "./types";

/**
 * Create the initial state for the graph
 */
export function createInitialState(
  userRequest: string,
  constraints?: WritingGraphState["userConstraints"]
): WritingGraphState {
  return {
    userRequest,
    userConstraints: constraints,
    agentOutputs: {},
    errors: [],
    graphExecutionId: nanoid(),
    startTime: Date.now(),
  };
}

/**
 * Execute the multi-agent writing workflow
 * Simplified implementation without LangGraph for now
 */
export async function executeWritingWorkflow(
  state: WritingGraphState
): Promise<WritingGraphState> {
  let currentState = { ...state };

  try {
    // Step 1: Analyze roles
    const roleAnalysisResult = await roleAnalyzerNode(currentState);
    currentState = { ...currentState, ...roleAnalysisResult };

    if (currentState.errors.length > 0) {
      const errorResult = errorHandlerNode(currentState);
      return { ...currentState, ...errorResult };
    }

    // Step 2: Execute dynamic agents
    const agentExecutorResult = await dynamicAgentExecutorNode(currentState);
    currentState = { ...currentState, ...agentExecutorResult };

    if (Object.keys(currentState.agentOutputs).length === 0) {
      const errorResult = errorHandlerNode(currentState);
      return { ...currentState, ...errorResult };
    }

    // Step 3: Synthesize outputs
    const synthesizerResult = await synthesizerNode(currentState);
    currentState = { ...currentState, ...synthesizerResult };

    return currentState;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown workflow error";
    currentState.errors.push(errorMessage);
    const errorResult = errorHandlerNode(currentState);
    return { ...currentState, ...errorResult };
  }
}

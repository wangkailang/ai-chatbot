/**
 * Multi-Agent Writing Workflow
 * LangGraph implementation for orchestrated multi-agent collaboration
 */

import { Annotation, END, START, StateGraph } from "@langchain/langgraph";
import { nanoid } from "nanoid";
import {
  dynamicAgentExecutorNode,
  errorHandlerNode,
  roleAnalyzerNode,
  synthesizerNode,
} from "./nodes";
import type { WritingGraphState } from "./types";

/**
 * Define the state annotation for LangGraph
 */
const WritingStateAnnotation = Annotation.Root({
  userRequest: Annotation<string>,
  userConstraints: Annotation<WritingGraphState["userConstraints"]>({
    reducer: (a, b) => b ?? a,
  }),
  roleAnalysis: Annotation<WritingGraphState["roleAnalysis"]>({
    reducer: (a, b) => b ?? a,
  }),
  agentOutputs: Annotation<WritingGraphState["agentOutputs"]>({
    reducer: (a, b) => ({ ...a, ...b }),
    default: () => ({}),
  }),
  synthesizedContent: Annotation<string | undefined>({
    reducer: (a, b) => b ?? a,
  }),
  finalReasoning: Annotation<string | undefined>({
    reducer: (a, b) => b ?? a,
  }),
  graphExecutionId: Annotation<string>,
  startTime: Annotation<number>,
  currentNode: Annotation<string | undefined>({
    reducer: (a, b) => b ?? a,
  }),
  errors: Annotation<string[]>({
    reducer: (a, b) => [...a, ...(Array.isArray(b) ? b : [])],
    default: () => [],
  }),
});

/**
 * Conditional edge function: Route after role analysis
 */
function shouldContinueAfterRoleAnalysis(
  state: typeof WritingStateAnnotation.State
) {
  if (state.errors && state.errors.length > 0) {
    return "error_handler";
  }
  return "agent_executor";
}

/**
 * Conditional edge function: Route after agent execution
 */
function shouldContinueAfterAgentExecution(
  state: typeof WritingStateAnnotation.State
) {
  if (state.agentOutputs && Object.keys(state.agentOutputs).length > 0) {
    return "synthesizer";
  }
  return "error_handler";
}

/**
 * Create the LangGraph StateGraph for multi-agent writing
 */
function createWritingGraph() {
  const workflow = new StateGraph(WritingStateAnnotation)
    // Add nodes
    .addNode("role_analyzer", roleAnalyzerNode)
    .addNode("agent_executor", dynamicAgentExecutorNode)
    .addNode("synthesizer", synthesizerNode)
    .addNode("error_handler", errorHandlerNode)
    // Add edges
    .addEdge(START, "role_analyzer")
    .addConditionalEdges("role_analyzer", shouldContinueAfterRoleAnalysis)
    .addConditionalEdges("agent_executor", shouldContinueAfterAgentExecution)
    .addEdge("synthesizer", END)
    .addEdge("error_handler", END);

  return workflow.compile();
}

/**
 * Export the compiled graph for LangGraph CLI
 */
export const graph = createWritingGraph();

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
 * Now using the LangGraph compiled graph
 */
export async function executeWritingWorkflow(
  state: WritingGraphState
): Promise<WritingGraphState> {
  try {
    const result = await graph.invoke(state);
    return result as WritingGraphState;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown workflow error";
    return {
      ...state,
      errors: [...state.errors, errorMessage],
      synthesizedContent: `An error occurred during content generation: ${errorMessage}`,
      finalReasoning: "Error occurred during graph execution",
    };
  }
}

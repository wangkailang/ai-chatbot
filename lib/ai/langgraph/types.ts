/**
 * Core types for the dynamic multi-agent writing system using LangGraph
 */

/**
 * Synthesis strategy for combining agent outputs
 */
export const SynthesisStrategy = {
  INTERLEAVING: "interleaving", // Interleave sections from different agents
  LAYERING: "layering", // Stack outputs sequentially
  HIGHLIGHTING: "highlighting", // Present side-by-side
  BLENDING: "blending", // Create new content inspired by all agents
} as const;

export type SynthesisStrategy =
  (typeof SynthesisStrategy)[keyof typeof SynthesisStrategy];

/**
 * Definition of a dynamic role for content generation
 */
export type RoleDefinition = {
  id: string; // e.g., "technical_expert"
  name: string; // e.g., "Technical Expert"
  description: string; // What perspective this role brings
  promptTemplate: string; // Template for generating role-specific prompts
  priority: number; // Execution priority (1 = highest)
  constraints?: {
    maxLength?: number;
    tone?: string;
    focusAreas?: string[];
  };
};

/**
 * Result of role analysis
 */
export type RoleAnalysis = {
  identifiedRoles: RoleDefinition[];
  reasoning: string; // Why these roles were selected
  confidence: number; // 0.0-1.0 confidence in role selection
};

/**
 * Output from a single agent
 */
export type AgentOutput = {
  roleId: string;
  roleName: string;
  roleDescription: string;
  content: string; // Markdown content
  reasoning: string; // Agent's reasoning for its choices
  confidence: number; // 0.0-1.0 confidence in output
  metadata: Record<string, unknown>;
};

/**
 * User constraints for content generation
 */
export type UserConstraints = {
  maxLength?: number;
  tone?: string;
  targetAudience?: string;
  preferredRoles?: string[]; // Optional: user can suggest roles
  synthesisStrategy?: SynthesisStrategy;
};

/**
 * LangGraph state for the multi-agent writing workflow
 */
export type WritingGraphState = {
  // Input
  userRequest: string;
  userConstraints?: UserConstraints;

  // Dynamic Role Analysis
  roleAnalysis?: RoleAnalysis;

  // Dynamic Agent Outputs
  agentOutputs: Record<string, AgentOutput>;

  // Final Output
  synthesizedContent?: string;
  finalReasoning?: string;

  // Metadata
  graphExecutionId: string;
  startTime: number;
  currentNode?: string;
  errors: string[];
};

/**
 * Interface for writing agents
 */
export type WritingAgent = {
  roleDefinition: RoleDefinition;
  generate(
    request: string,
    constraints?: UserConstraints
  ): Promise<AgentOutput>;
};

/**
 * Configuration for the multi-agent system
 */
export type MultiAgentConfig = {
  minRoles?: number; // Minimum number of roles (default: 2)
  maxRoles?: number; // Maximum number of roles (default: 4)
  timeout?: number; // Timeout per agent in ms (default: 30000)
  synthesisStrategy?: SynthesisStrategy;
  enableCaching?: boolean;
};

/**
 * Role types and Zod schemas for validation
 */

import { z } from "zod";

/**
 * Zod schema for role definition constraints
 */
export const RoleConstraintsSchema = z.object({
  maxLength: z.number().optional(),
  tone: z.string().optional(),
  focusAreas: z.array(z.string()).optional(),
});

/**
 * Zod schema for role definition
 */
export const RoleDefinitionSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  promptTemplate: z.string(),
  priority: z.number().int().min(1),
  constraints: RoleConstraintsSchema.optional(),
});

/**
 * Zod schema for role analysis result
 */
export const RoleAnalysisSchema = z.object({
  identifiedRoles: z.array(RoleDefinitionSchema).min(2).max(4),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
});

/**
 * Zod schema for agent output
 */
export const AgentOutputSchema = z.object({
  roleId: z.string(),
  roleName: z.string(),
  roleDescription: z.string(),
  content: z.string(),
  reasoning: z.string(),
  confidence: z.number().min(0).max(1),
  metadata: z.record(z.unknown()),
});

/**
 * Export types from schemas
 */
export type RoleConstraints = z.infer<typeof RoleConstraintsSchema>;
export type RoleDefinition = z.infer<typeof RoleDefinitionSchema>;
export type RoleAnalysis = z.infer<typeof RoleAnalysisSchema>;
export type AgentOutput = z.infer<typeof AgentOutputSchema>;

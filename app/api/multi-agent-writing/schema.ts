/**
 * Request and response schemas for multi-agent writing API
 */

import { z } from "zod";
import { SynthesisStrategy } from "@/lib/ai/langgraph/types";

/**
 * Request schema
 */
export const MultiAgentWritingRequestSchema = z.object({
  request: z.string().min(10).max(5000),
  constraints: z
    .object({
      maxLength: z.number().int().positive().optional(),
      tone: z.string().max(100).optional(),
      targetAudience: z.string().max(200).optional(),
      preferredRoles: z.array(z.string()).max(4).optional(),
      synthesisStrategy: z
        .enum([
          SynthesisStrategy.INTERLEAVING,
          SynthesisStrategy.LAYERING,
          SynthesisStrategy.HIGHLIGHTING,
          SynthesisStrategy.BLENDING,
        ])
        .optional(),
    })
    .optional(),
});

export type MultiAgentWritingRequest = z.infer<
  typeof MultiAgentWritingRequestSchema
>;

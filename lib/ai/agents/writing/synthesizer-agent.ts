/**
 * Synthesizer Agent: Combines outputs from multiple agents into cohesive content
 */

import { generateText } from "ai";
import { SynthesisStrategy } from "@/lib/ai/langgraph/types";
import { myProvider } from "@/lib/ai/providers";
import type { AgentOutput } from "./role-types";

/**
 * System prompt for the synthesizer
 */
const SYNTHESIZER_SYSTEM_PROMPT = `You are an expert content synthesizer. Your role is to combine multiple writing perspectives into a single, cohesive, high-quality piece of content.

Your responsibilities:
- Merge content from multiple specialized agents while preserving their unique insights
- Ensure smooth transitions between different perspectives
- Eliminate redundancy while maintaining comprehensive coverage
- Resolve any contradictions by choosing the most appropriate information
- Produce well-structured markdown content that flows naturally
- Maintain professional quality and readability

Guidelines:
- The final output should read as a unified piece, not a collection of separate sections
- Preserve the best elements from each agent's contribution
- Ensure logical flow and coherent structure
- Use appropriate markdown formatting (headings, lists, emphasis)
- Keep the target audience and purpose in mind`;

/**
 * Synthesize outputs from multiple agents
 */
export async function synthesizeOutputs(
  agentOutputs: AgentOutput[],
  userRequest: string,
  strategy: SynthesisStrategy = SynthesisStrategy.BLENDING
): Promise<{ content: string; reasoning: string }> {
  if (agentOutputs.length === 0) {
    throw new Error("No agent outputs to synthesize");
  }

  if (agentOutputs.length === 1) {
    return {
      content: agentOutputs[0].content,
      reasoning: `Single agent output from ${agentOutputs[0].roleName}`,
    };
  }

  const prompt = buildSynthesisPrompt(agentOutputs, userRequest, strategy);

  const result = await generateText({
    model: myProvider.languageModel("chat-model"),
    system: SYNTHESIZER_SYSTEM_PROMPT,
    prompt,
    temperature: 0.7,
  });

  const reasoningText =
    result.reasoning && result.reasoning.length > 0
      ? result.reasoning.map((r) => r.text).join("\n")
      : "";

  return {
    content: result.text,
    reasoning:
      reasoningText || `Synthesized content using ${strategy} strategy`,
  };
}

/**
 * Build the synthesis prompt based on strategy
 */
function buildSynthesisPrompt(
  agentOutputs: AgentOutput[],
  userRequest: string,
  strategy: SynthesisStrategy
): string {
  let prompt = `Original request: ${userRequest}\n\n`;
  prompt += `Synthesis strategy: ${strategy}\n\n`;
  prompt += `You have ${agentOutputs.length} agent outputs to combine:\n\n`;

  // Add each agent's output
  for (const output of agentOutputs) {
    prompt += `=== ${output.roleName} (${output.roleDescription}) ===\n`;
    prompt += `${output.content}\n\n`;
    if (output.reasoning) {
      prompt += `Agent's reasoning: ${output.reasoning}\n\n`;
    }
  }

  // Add strategy-specific instructions
  prompt += getStrategyInstructions(strategy);

  return prompt;
}

/**
 * Get strategy-specific instructions
 */
function getStrategyInstructions(strategy: SynthesisStrategy): string {
  switch (strategy) {
    case SynthesisStrategy.INTERLEAVING:
      return `\nSynthesis Instructions:
- Divide the content into logical sections (introduction, main points, conclusion)
- Interleave insights from different agents throughout each section
- Maintain smooth transitions between different perspectives
- Create a cohesive narrative that naturally incorporates all viewpoints
- Use the strongest opening from any agent, and the most impactful closing`;

    case SynthesisStrategy.LAYERING:
      return `\nSynthesis Instructions:
- Stack content sequentially based on agent priorities
- Use clear section headers to distinguish different perspectives
- Ensure each layer adds unique value without redundancy
- Create smooth transitions between sections
- Conclude with a unified summary that ties all perspectives together`;

    case SynthesisStrategy.HIGHLIGHTING:
      return `\nSynthesis Instructions:
- Present each agent's complete output as a distinct section
- Add clear labels identifying each perspective
- Provide a brief introduction explaining the multi-perspective approach
- Include a summary that compares and contrasts the viewpoints
- Help readers understand the value of each perspective`;

    default:
      return `\nSynthesis Instructions:
- Create entirely new, cohesive content inspired by all agent outputs
- Synthesize key ideas and themes from all perspectives
- Apply a unified, professional style throughout
- Ensure all important points from each agent are represented
- The result should feel like a single, well-crafted piece, not a merger
- Prioritize clarity, flow, and reader engagement`;
  }
}

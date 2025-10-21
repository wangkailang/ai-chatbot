/**
 * Universal Writing Agent: Adapts to any role definition
 */

import { generateText } from "ai";
import type { UserConstraints } from "@/lib/ai/langgraph/types";
import { myProvider } from "@/lib/ai/providers";
import {
  type AgentOutput,
  AgentOutputSchema,
  type RoleDefinition,
} from "./role-types";

const DEFAULT_TIMEOUT = 30_000; // 30 seconds

/**
 * Universal agent that can execute any role
 */
export class UniversalWritingAgent {
  readonly roleDefinition: RoleDefinition;
  private readonly timeout: number;

  constructor(
    roleDefinition: RoleDefinition,
    timeout: number = DEFAULT_TIMEOUT
  ) {
    this.roleDefinition = roleDefinition;
    this.timeout = timeout;
  }

  /**
   * Generate content based on the role definition
   */
  async generate(
    userRequest: string,
    constraints?: UserConstraints
  ): Promise<AgentOutput> {
    const prompt = this.buildPrompt(userRequest, constraints);

    // Execute with timeout
    const { text, reasoning } = await Promise.race([
      this.executeGeneration(prompt),
      this.timeoutPromise(),
    ]);

    // Build agent output
    const output: AgentOutput = {
      roleId: this.roleDefinition.id,
      roleName: this.roleDefinition.name,
      roleDescription: this.roleDefinition.description,
      content: text,
      reasoning: reasoning || `Generated as ${this.roleDefinition.name}`,
      confidence: 0.8, // Default confidence, could be enhanced with model feedback
      metadata: {
        priority: this.roleDefinition.priority,
        constraints: this.roleDefinition.constraints,
      },
    };

    // Validate output
    const validated = AgentOutputSchema.parse(output);
    return validated;
  }

  /**
   * Execute the generation with AI model
   */
  private async executeGeneration(
    prompt: string
  ): Promise<{ text: string; reasoning?: string }> {
    const result = await generateText({
      model: myProvider.languageModel("chat-model"),
      system: this.roleDefinition.promptTemplate,
      prompt,
      temperature: 0.7,
    });

    const reasoningText =
      result.reasoning && result.reasoning.length > 0
        ? result.reasoning.map((r) => r.text).join("\n")
        : "";

    return {
      text: result.text,
      reasoning: reasoningText,
    };
  }

  /**
   * Timeout promise
   */
  private timeoutPromise(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(
          new Error(
            `Agent ${this.roleDefinition.id} timed out after ${this.timeout}ms`
          )
        );
      }, this.timeout);
    });
  }

  /**
   * Build the prompt for the agent
   */
  private buildPrompt(
    userRequest: string,
    constraints?: UserConstraints
  ): string {
    let prompt = `Write content for the following request from the perspective of a ${this.roleDefinition.name}:\n\n${userRequest}`;

    // Add role-specific constraints
    if (this.roleDefinition.constraints) {
      prompt += "\n\nRole-specific guidelines:";

      if (this.roleDefinition.constraints.tone) {
        prompt += `\n- Tone: ${this.roleDefinition.constraints.tone}`;
      }

      if (
        this.roleDefinition.constraints.focusAreas &&
        this.roleDefinition.constraints.focusAreas.length > 0
      ) {
        prompt += `\n- Focus on: ${this.roleDefinition.constraints.focusAreas.join(", ")}`;
      }
    }

    // Add user constraints
    if (constraints) {
      prompt += "\n\nAdditional requirements:";

      if (constraints.maxLength) {
        prompt += `\n- Maximum length: approximately ${Math.floor(constraints.maxLength / 4)} words`;
      }

      if (constraints.tone) {
        prompt += `\n- Overall tone: ${constraints.tone}`;
      }

      if (constraints.targetAudience) {
        prompt += `\n- Target audience: ${constraints.targetAudience}`;
      }
    }

    prompt +=
      "\n\nProvide well-structured markdown content that fulfills your role.";

    return prompt;
  }
}

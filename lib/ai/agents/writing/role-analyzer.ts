/**
 * Role Analyzer: AI-powered analysis to determine optimal writing roles
 */

import { generateObject } from "ai";
import type { UserConstraints } from "@/lib/ai/langgraph/types";
import { myProvider } from "@/lib/ai/providers";
import { roleTemplates } from "./role-templates";
import { type RoleAnalysis, RoleAnalysisSchema } from "./role-types";

const DEFAULT_MIN_ROLES = 2;
const DEFAULT_MAX_ROLES = 4;

/**
 * System prompt for role analysis
 */
const ROLE_ANALYZER_SYSTEM_PROMPT = `You are an expert at analyzing writing requests and identifying the optimal combination of writing roles/perspectives to produce high-quality content.

Your task is to:
1. Analyze the user's request and understand the writing domain, audience, and purpose
2. Identify 2-4 optimal writing roles that would best serve this request
3. For each role, provide a clear role definition with:
   - A unique ID (snake_case)
   - A descriptive name
   - The perspective/expertise this role brings
   - A prompt template tailored to this specific request
   - Priority (1 = highest, executed first)
4. Provide reasoning for your role selections
5. Assign a confidence score (0.0-1.0) for your overall role selection

Available role templates you can use or adapt:
${Object.entries(roleTemplates)
  .map(([id, template]) => `- ${id}: ${template.description}`)
  .join("\n")}

You can use these templates as-is or create custom roles based on the specific request.

Guidelines:
- Choose roles that provide complementary perspectives (not redundant)
- Consider the writing domain, target audience, and content goals
- Prioritize roles that add unique value
- Balance specialist expertise with broad accessibility
- Ensure selected roles cover all key aspects of the request

IMPORTANT: Return your response in JSON format following the provided schema.`;

/**
 * Analyze a user request and determine optimal writing roles
 */
export async function analyzeRoles(
  userRequest: string,
  constraints?: UserConstraints
): Promise<RoleAnalysis> {
  const minRoles = DEFAULT_MIN_ROLES;
  const maxRoles = constraints?.preferredRoles
    ? Math.min(constraints.preferredRoles.length, DEFAULT_MAX_ROLES)
    : DEFAULT_MAX_ROLES;

  const userPrompt = buildUserPrompt(userRequest, constraints);

  try {
    const result = await generateObject({
      model: myProvider.languageModel("chat-model"),
      system: ROLE_ANALYZER_SYSTEM_PROMPT,
      prompt: userPrompt,
      schema: RoleAnalysisSchema,
      temperature: 0.7,
    });

    if (!result.object) {
      throw new Error("No object generated from role analysis");
    }

    const object = result.object;

    // Validate role count
    if (object.identifiedRoles.length < minRoles) {
      throw new Error(
        `Role analysis must identify at least ${minRoles} roles, got ${object.identifiedRoles.length}`
      );
    }

    if (object.identifiedRoles.length > maxRoles) {
      // Trim to max roles, keeping highest priority
      object.identifiedRoles = object.identifiedRoles
        .sort((a, b) => a.priority - b.priority)
        .slice(0, maxRoles);
    }

    return object;
  } catch (error) {
    console.error("Role analysis error:", error);
    // Fallback to default roles if analysis fails
    return {
      identifiedRoles: [
        {
          id: "content_writer",
          name: "Content Writer",
          description: "Professional content writer with broad expertise",
          promptTemplate: `You are a professional content writer. Create high-quality content for: ${userRequest}`,
          priority: 1,
        },
        {
          id: "editor",
          name: "Editor",
          description: "Editorial expert ensuring clarity and quality",
          promptTemplate: `You are an experienced editor. Review and refine content for: ${userRequest}`,
          priority: 2,
        },
      ],
      reasoning: "Using fallback roles due to analysis error",
      confidence: 0.5,
    };
  }
}

/**
 * Build the user prompt for role analysis
 */
function buildUserPrompt(
  userRequest: string,
  constraints?: UserConstraints
): string {
  let prompt = `Analyze this writing request and identify optimal roles. Return the result as a JSON object:\n\nRequest: ${userRequest}`;

  if (constraints) {
    prompt += "\n\nConstraints:";

    if (constraints.maxLength) {
      prompt += `\n- Maximum length: ${constraints.maxLength} characters`;
    }

    if (constraints.tone) {
      prompt += `\n- Desired tone: ${constraints.tone}`;
    }

    if (constraints.targetAudience) {
      prompt += `\n- Target audience: ${constraints.targetAudience}`;
    }

    if (constraints.preferredRoles && constraints.preferredRoles.length > 0) {
      prompt += `\n- User suggested roles: ${constraints.preferredRoles.join(", ")}`;
      prompt +=
        "\n  (Consider these suggestions but optimize as needed for best results)";
    }
  }

  prompt += `\n\nReturn a JSON object with exactly this structure:
{
  "identifiedRoles": [
    {
      "id": "role_id_in_snake_case",
      "name": "Role Name",
      "description": "Brief description of this role's perspective",
      "promptTemplate": "You are a [role]. Your task is to contribute to: ${userRequest}",
      "priority": 1
    }
  ],
  "reasoning": "Explanation of why these roles were selected",
  "confidence": 0.85
}

Requirements:
- identifiedRoles array must have 2-4 items
- Each role must have: id, name, description, promptTemplate, priority
- priority must be an integer (1, 2, 3, or 4)
- confidence must be between 0.0 and 1.0
- promptTemplate should be detailed instructions for that role`;

  return prompt;
}

/**
 * Validate role analysis result
 */
export function validateRoleAnalysis(analysis: RoleAnalysis): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Check role count
  if (analysis.identifiedRoles.length < DEFAULT_MIN_ROLES) {
    errors.push(
      `Must have at least ${DEFAULT_MIN_ROLES} roles, got ${analysis.identifiedRoles.length}`
    );
  }

  if (analysis.identifiedRoles.length > DEFAULT_MAX_ROLES) {
    errors.push(
      `Must have at most ${DEFAULT_MAX_ROLES} roles, got ${analysis.identifiedRoles.length}`
    );
  }

  // Check for duplicate role IDs
  const roleIds = analysis.identifiedRoles.map((r) => r.id);
  const uniqueIds = new Set(roleIds);
  if (roleIds.length !== uniqueIds.size) {
    errors.push("Role IDs must be unique");
  }

  // Check confidence score
  if (analysis.confidence < 0 || analysis.confidence > 1) {
    errors.push("Confidence must be between 0.0 and 1.0");
  }

  // Check each role has required fields
  for (const role of analysis.identifiedRoles) {
    if (!role.id || !role.name || !role.description || !role.promptTemplate) {
      errors.push(`Role ${role.id || "unknown"} is missing required fields`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

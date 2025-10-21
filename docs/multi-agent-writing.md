# Multi-Agent Writing System

A dynamic multi-agent collaborative writing system built with AI SDK and a workflow orchestrator.

## Overview

This system generates professional content by dynamically creating specialized writing agents based on user requests. Instead of hardcoded agents, it analyzes each request and assembles the optimal combination of writing perspectives.

## Features

- **Dynamic Role Generation**: AI analyzes requests and identifies 2-4 optimal writing roles
- **Flexible Perspectives**: Supports unlimited writing scenarios (technical, creative, marketing, academic, etc.)
- **Intelligent Synthesis**: Combines multiple agent outputs into cohesive content
- **Structured Output**: Returns JSON with markdown-formatted content and metadata

## Architecture

```
User Request
    ↓
Role Analyzer (AI) → Identifies optimal roles dynamically
    ↓
Dynamic Agent Factory → Creates specialized agents on-demand
    ↓
Agent Execution → 2-4 agents write in parallel
    ↓
Synthesizer → Combines outputs intelligently
    ↓
Final Content (Markdown)
```

## API Usage

### Endpoint

```
POST /api/multi-agent-writing
```

### Request Schema

```typescript
{
  request: string;              // 10-5000 characters
  constraints?: {
    maxLength?: number;         // Target length in characters
    tone?: string;              // Desired tone (e.g., "professional", "casual")
    targetAudience?: string;    // Target audience description
    preferredRoles?: string[];  // Optional role suggestions (max 4)
    synthesisStrategy?: 'interleaving' | 'layering' | 'highlighting' | 'blending';
  };
}
```

### Example Request

```json
{
  "request": "Write an article about the benefits of outdoor hiking for physical and mental health",
  "constraints": {
    "tone": "informative and engaging",
    "targetAudience": "health-conscious adults",
    "synthesisStrategy": "blending"
  }
}
```

### Response Schema

```typescript
{
  id: string;
  timestamp: string;
  request: string;
  identifiedRoles: Array<{
    id: string;
    name: string;
    description: string;
  }>;
  roleAnalysis: {
    reasoning: string;
    confidence: number;
  };
  agents: Record<string, {
    roleName: string;
    roleDescription: string;
    contribution: string;
    reasoning: string;
    confidence: number;
  }>;
  finalContent: string;  // Markdown
  metadata: {
    duration: number;
    graphExecutionId: string;
    synthesisStrategy: string;
    warnings: string[];
  };
}
```

## Implementation Details

### Core Components

1. **Role Analyzer** (`lib/ai/agents/writing/role-analyzer.ts`)

   - Uses AI SDK `generateObject` to analyze requests
   - Returns 2-4 optimal role definitions
   - Provides reasoning and confidence scores

2. **Dynamic Agent Factory** (`lib/ai/agents/writing/dynamic-agent-factory.ts`)

   - Creates agents on-demand for any role
   - Implements caching for performance
   - Manages agent lifecycle

3. **Universal Agent** (`lib/ai/agents/writing/universal-agent.ts`)

   - Single agent class that adapts to any role
   - Uses role-specific prompts and constraints
   - Generates markdown content with reasoning

4. **Synthesizer** (`lib/ai/agents/writing/synthesizer-agent.ts`)

   - Combines outputs from multiple agents
   - Supports multiple synthesis strategies
   - Produces cohesive final content

5. **Workflow Orchestrator** (`lib/ai/langgraph/graph.ts`)
   - Executes nodes sequentially with error handling
   - Manages state transitions
   - Provides execution metadata

### Available Role Templates

Pre-defined templates for common perspectives:

- **Technical Expert**: Technical accuracy, detailed explanations
- **Storyteller**: Narrative flow, emotional engagement
- **Content Strategist**: SEO, audience targeting, conversion
- **Editor**: Clarity, grammar, readability
- **Subject Matter Expert**: Domain expertise, authority
- **Educator**: Teaching, explaining, learning outcomes
- **Analyst**: Data-driven insights, comparisons
- **Marketer**: Persuasion, benefits, motivation
- **Journalist**: Objectivity, facts, balanced reporting
- **Researcher**: Evidence-based, citations, rigor

## Synthesis Strategies

1. **Blending** (default): Creates new cohesive content inspired by all agents
2. **Interleaving**: Merges sections from different agents throughout
3. **Layering**: Stacks outputs sequentially with clear sections
4. **Highlighting**: Presents each agent's output distinctly

## Example Use Cases

### Technical Documentation

```json
{
  "request": "Explain how OAuth 2.0 authentication works",
  "constraints": {
    "targetAudience": "web developers",
    "tone": "clear and instructional"
  }
}
```

### Creative Writing

```json
{
  "request": "Write a short story about a robot learning to paint",
  "constraints": {
    "tone": "whimsical and heartwarming",
    "maxLength": 2000
  }
}
```

### Marketing Content

```json
{
  "request": "Create a product description for eco-friendly water bottles",
  "constraints": {
    "targetAudience": "environmentally conscious consumers",
    "synthesisStrategy": "blending"
  }
}
```

### Academic Writing

```json
{
  "request": "Analyze the impact of remote work on productivity",
  "constraints": {
    "tone": "scholarly and objective",
    "preferredRoles": ["researcher", "analyst", "subject_expert"]
  }
}
```

## Performance

- **Execution Time**: Typically 10-30 seconds depending on content complexity
- **Parallel Processing**: Agents execute concurrently for optimal performance
- **Caching**: Agent instances are cached for repeated use
- **Timeout Handling**: 30-second timeout per agent with graceful degradation

## Error Handling

The system handles errors gracefully:

- Invalid role analysis → fallback to default roles
- Agent timeout → continues with available outputs
- Synthesis failure → returns partial results with error metadata
- API errors → returns appropriate HTTP status codes with messages

## Extension

To add new role templates, edit `lib/ai/agents/writing/role-templates.ts`:

```typescript
export const customRoleTemplate: RoleDefinition = {
  id: "custom_role",
  name: "Custom Role",
  description: "What perspective this role brings",
  promptTemplate: `You are a Custom Role. Your role is to...`,
  priority: 2,
  constraints: {
    tone: "professional",
    focusAreas: ["accuracy", "engagement"],
  },
};
```

## Testing

Authentication is required. Use an authenticated session to test:

```bash
# Start dev server
pnpm dev

# Make request with auth token
curl -X POST http://localhost:3000/api/multi-agent-writing \
  -H "Content-Type: application/json" \
  -H "Cookie: your-auth-cookie" \
  -d '{
    "request": "Write about the future of AI",
    "constraints": {
      "tone": "optimistic",
      "targetAudience": "general public"
    }
  }'
```

## Future Enhancements

- [ ] Streaming support for real-time output
- [ ] User feedback loop for role quality improvement
- [ ] Template versioning and A/B testing
- [ ] Advanced caching with semantic similarity
- [ ] Custom synthesis strategies
- [ ] Multi-language support
- [ ] Integration with existing chat interface

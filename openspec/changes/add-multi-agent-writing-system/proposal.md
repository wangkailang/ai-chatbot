# Proposal: Multi-Agent Writing System with LangGraph

## Overview

Implement a dynamic multi-agent collaborative writing system that leverages AI SDK and LangGraph to produce professional content from multiple writing perspectives. The system uses a **flexible, role-based architecture** that dynamically generates specialized agents based on user requests, rather than relying on predefined agent types. Initial example roles include outdoor sports, marketing copy, and prose/essay writing, but the system can adapt to any writing scenario.

## Why

The current chatbot provides single-agent responses that lack specialized domain expertise and stylistic diversity. Professional content creation often requires multiple perspectives and specialized knowledge that vary widely across domains and scenarios.

By implementing a **dynamic multi-agent system** with LangGraph orchestration, we can:

- **Dynamic Specialization**: Generate agents tailored to any writing domain on-demand (technical writing, legal content, academic papers, creative fiction, journalism, etc.)
- **Quality Improvement**: Multiple perspectives lead to more comprehensive and polished content
- **Transparent Reasoning**: Users can see how different agents contribute to the final output
- **Infinitely Scalable**: No code changes needed to support new writing scenarios - the system adapts automatically

This capability addresses the need for professional, multi-faceted content across unlimited domains without manual agent implementation for each new scenario.

## Motivation

The current chatbot provides single-agent responses that lack specialized domain expertise and stylistic diversity. Professional content creation often benefits from multiple perspectives across diverse domains:

- **Domain Examples** (not exhaustive):
  - **Outdoor Sports**: Technical knowledge, safety awareness, engaging narrative
  - **Marketing Copy**: Persuasive language, brand alignment, audience targeting
  - **Prose/Essay**: Literary quality, emotional depth, structural coherence
  - **Technical Documentation**: Clarity, accuracy, structured explanations
  - **Legal Content**: Precise terminology, compliance awareness, formal tone
  - **Academic Writing**: Research rigor, citation, scholarly style
  - **Journalism**: Objectivity, fact-checking, inverted pyramid structure
  - **Creative Fiction**: Character development, plot, dialogue
  - **Medical Writing**: Clinical accuracy, patient-friendly language
  - ...and any other writing scenario

By implementing a multi-agent system with LangGraph orchestration, we can:

1. **Dynamically generate** specialized agents for any writing domain
2. Ensure quality through collaborative refinement across multiple viewpoints
3. Provide transparent reasoning from each agent's perspective
4. Scale to unlimited writing styles without code changes

## Goals

1. **Dynamic Agent Generation**: Create specialized agents on-demand based on user request analysis, not hardcoded agent types
2. **LangGraph Integration**: Use LangGraph for state-based agent orchestration and workflow management
3. **Structured Output**: Return JSON objects with markdown-formatted content and agent metadata
4. **AI SDK Compatibility**: Build on existing AI SDK infrastructure without breaking changes
5. **Unlimited Extensibility**: Support any writing scenario through dynamic role definition, not code deployment

## Non-Goals

- Real-time collaborative editing with human writers
- Multi-modal content (images, videos) in this iteration
- Fine-tuned models for each writing style (use prompt engineering exclusively)
- Version control or document history (focus on single-generation workflows)
- Hardcoded agent libraries (no manual implementation per domain)

## Proposed Solution

### Architecture

```
User Request → Role Analyzer → LangGraph State Machine
                                      ↓
                   Dynamic Agent Role Generation
                                      ↓
                ┌──────────────────┬──────────────────┐
                ↓                  ↓                  ↓
        [Role Agent 1]    [Role Agent 2]    [Role Agent 3]
        (e.g., Technical)  (e.g., Creative)  (e.g., Audience)
                ↓                  ↓                  ↓
                └──────────────────┼──────────────────┘
                                   ↓
                         Synthesizer Agent
                                   ↓
                        JSON Output (Markdown)
```

**Key Difference**: Instead of predefined agents (outdoor, marketing, prose), the system:

1. Analyzes the user request
2. **Dynamically determines** optimal writing roles/perspectives
3. **Generates agent prompts** on-the-fly for those roles
4. Executes agents with role-specific instructions

### Key Components

1. **Dynamic Agent System** (`lib/ai/agents/writing/`)

   - `dynamic-agent-factory.ts`: Creates agents based on role definitions
   - `role-analyzer.ts`: AI-powered analysis to determine optimal roles
   - `role-templates.ts`: Reusable prompt patterns for common role types
   - `agent-validator.ts`: Universal validation for any agent output

2. **LangGraph Orchestration** (`lib/ai/langgraph/`)

   - `writing-graph.ts`: State machine definition for dynamic agent collaboration
   - `state-types.ts`: TypeScript types for graph state (role-agnostic)
   - `nodes.ts`: Generic agent execution nodes
   - `edges.ts`: Conditional routing based on dynamic role count

3. **Output Formatting** (`lib/ai/formatters/`)

   - `writing-output-schema.ts`: Zod schema for structured JSON output
   - `markdown-formatter.ts`: Utilities for markdown generation

4. **API Integration** (`app/api/multi-agent-writing/`)
   - `route.ts`: Endpoint for multi-agent writing requests
   - `schema.ts`: Request/response validation

### Data Flow

1. **Input**: User provides writing request and optional constraints
2. **Role Analysis**: AI analyzes request to determine optimal writing roles/perspectives (e.g., "technical + engaging + safety-focused" for outdoor content)
3. **Dynamic Agent Creation**: System generates 2-4 specialized agents with role-specific prompts
4. **Parallel Execution**: Dynamically created agents generate content simultaneously
5. **State Management**: LangGraph tracks intermediate results from any number of agents
6. **Synthesis**: Synthesizer agent combines perspectives intelligently
7. **Output**: JSON object with markdown content, role descriptions, and metadata

### Output Schema

```typescript
{
  id: string;
  timestamp: string;
  request: string;
  identifiedRoles: string[];  // e.g., ["technical_expert", "storyteller", "safety_advisor"]
  agents: {
    [agentId: string]: {
      name: string;           // Human-readable role name
      roleDescription: string; // What perspective this agent brings
      contribution: string;    // markdown
      reasoning: string;
      confidence: number;
    }
  };
  finalContent: string; // markdown
  metadata: {
    tokensUsed: number;
    duration: number;
    roleAnalysis: string;  // How roles were determined
    graphState: string;
  }
}
```

### Example: Dynamic Role Selection

**User Request**: "Write about hiking Mount Fuji for a travel blog"

**System Analysis**:

- **Role 1**: Local Culture Expert (cultural significance, traditions)
- **Role 2**: Practical Travel Guide (logistics, tips, timing)
- **Role 3**: Storyteller (engaging narrative, vivid descriptions)

**User Request**: "Create a product launch email for a SaaS tool"

**System Analysis**:

- **Role 1**: Product Marketing (features, benefits, positioning)
- **Role 2**: Copywriter (persuasive language, CTAs)
- **Role 3**: Customer Success (user pain points, solutions)

**User Request**: "Explain quantum computing for a research paper"

**System Analysis**:

- **Role 1**: Technical Researcher (scientific accuracy, citations)
- **Role 2**: Educator (clear explanations, analogies)
- **Role 3**: Academic Writer (formal style, structure)

## Success Criteria

1. Successfully generate content using **dynamically determined** 2-4 agent collaboration
2. System can handle **any writing domain** without code changes
3. LangGraph orchestrates agent workflow without errors
4. Output validates against defined JSON schema
5. Content quality meets basic readability standards (subjective evaluation)
6. System handles errors gracefully and provides fallback responses
7. Performance: Complete workflow in <30 seconds for typical requests

## Risks & Mitigations

| Risk                       | Impact                 | Mitigation                                                         |
| -------------------------- | ---------------------- | ------------------------------------------------------------------ |
| LangGraph learning curve   | Delayed implementation | Start with simple linear graph, iterate to complex workflows       |
| Dynamic role quality       | Irrelevant agents      | Implement role validation and fallback to common patterns          |
| Agent output inconsistency | Poor synthesis quality | Implement strict output schemas and quality scoring                |
| Increased token costs      | Budget concerns        | Add token limits, caching for similar requests, and monitoring     |
| Slow response time         | Poor UX                | Implement streaming and progress indicators                        |
| Role analysis errors       | Wrong agent selection  | Log all role decisions, allow manual override, learn from feedback |

## Dependencies

- **New**: `@langchain/langgraph` (LangGraph core)
- **New**: `@langchain/core` (LangChain primitives)
- **Existing**: `ai` (AI SDK for model calls)
- **Existing**: `zod` (Schema validation)

## Timeline Estimate

- **Phase 1** (Foundation): 2-3 days

  - Setup LangGraph dependencies
  - Create dynamic agent factory and role analyzer
  - Implement role-agnostic graph structure
  - Build role template system

- **Phase 2** (Dynamic Agents): 2-3 days

  - Develop role analysis AI component
  - Implement dynamic prompt generation
  - Create universal agent executor
  - Add parallel execution for any role count
  - Create synthesizer agent

- **Phase 3** (Integration): 1-2 days

  - API endpoint implementation
  - Output schema validation
  - Error handling and fallbacks

- **Phase 4** (Polish): 1-2 days
  - Testing across multiple domains
  - Role quality validation
  - Documentation
  - Performance optimization

**Total**: 6-10 days

## Open Questions

1. How many roles should the system generate per request? (default 2-4, configurable?)
2. Should users be able to manually specify roles or always rely on AI analysis?
3. Do we need user authentication/rate limiting for this endpoint?
4. Should we support streaming responses or only final output?
5. How do we handle conflicts when agents disagree?
6. Should we maintain a cache/library of common role patterns to reduce analysis costs?
7. How do we validate that generated roles are truly useful and not redundant?

## Alternatives Considered

1. **Predefined Agent Library**: Create hardcoded agents (outdoor, marketing, prose) - Rejected because it requires code deployment for each new domain and limits flexibility
2. **Simple Sequential Calls**: Easier but lacks parallelism and state management
3. **Custom State Machine**: More control but reinventing LangGraph features
4. **Single Agent with Role Prompts**: Simpler but less modular and harder to debug
5. **Rule-Based Role Selection**: Faster but lacks adaptability to novel scenarios

**Chosen Approach**: Dynamic agent generation offers the best balance of flexibility, scalability, and maintainability.

## References

- [LangGraph Documentation](https://langchain-ai.github.io/langgraph/)
- [AI SDK Multi-Agent Patterns](https://sdk.vercel.ai/docs)
- [Agent Architecture Best Practices](https://www.anthropic.com/research/building-effective-agents)
- [Dynamic Agent Systems](https://arxiv.org/abs/2308.08155)

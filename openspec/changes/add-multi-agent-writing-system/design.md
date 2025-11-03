# Design: Dynamic Multi-Agent Writing System Architecture

## System Architecture

### High-Level Design

The multi-agent writing system uses a **dynamic, role-based architecture** that generates specialized agents on-demand:

```
┌─────────────────────────────────────────────────────────────┐
│                        API Layer                             │
│  (Next.js API Route + Request Validation)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   LangGraph Orchestration                    │
│  (State Machine, Graph Definition, Node Execution)          │
└────────────────────────┬────────────────────────────────────┘
                         │
           ┌─────────────▼─────────────┐
           │   Role Analyzer (AI)       │
           │ Identifies optimal roles   │
           └─────────────┬──────────────┘
                         │
           ┌─────────────▼─────────────┐
           │ Dynamic Agent Factory      │
           │ Generates role-based agents│
           └─────────────┬──────────────┘
                         │
         ┌───────────────┼───────────────┐
         ↓               ↓               ↓
┌────────────────┐ ┌──────────┐ ┌──────────────┐
│ [Role Agent 1] │ │ [Role 2] │ │  [Role 3]    │
│ Dynamic Prompt │ │ Dynamic  │ │  Dynamic     │
└────────┬───────┘ └────┬─────┘ └──────┬───────┘
         │              │              │
         └──────────────┼──────────────┘
                        │
           ┌────────────▼────────────┐
           │   Synthesizer Agent     │
           │  (Combines & Refines)   │
           └────────────┬────────────┘
                        │
           ┌────────────▼────────────┐
           │    Output Formatter     │
           │  (JSON + Markdown)      │
           └─────────────────────────┘
```

### Component Details

#### 1. LangGraph State Machine

**State Schema**:

```typescript
interface WritingGraphState {
  // Input
  userRequest: string;
  userConstraints?: {
    maxLength?: number;
    tone?: string;
    targetAudience?: string;
    preferredRoles?: string[];  // Optional: user can suggest roles
  };

  // Dynamic Role Analysis
  roleAnalysis: {
    identifiedRoles: RoleDefinition[];  // AI-generated roles
    reasoning: string;
    confidence: number;
  };

  // Dynamic Agent Outputs
  agentOutputs: {
    [roleId: string]: {
      roleName: string;
      roleDescription: string;
      content: string;
      reasoning: string;
      confidence: number;
      metadata: Record<string, any>;
    };
  };

  // Final Output
  synthesizedContent: string;
  finalReasoning: string;

  // Metadata
  graphExecutionId: string;
  startTime: number;
  currentNode: string;
  errors: string[];
}

interface RoleDefinition {
  id: string;              // e.g., "technical_expert"
  name: string;            // e.g., "Technical Expert"
  description: string;     // What perspective this role brings
  promptTemplate: string;  // Role-specific system prompt
  priority: number;        // Importance (1-10)
}
}
```

**Graph Structure**:

```typescript
// Node Types (Dynamic)
enum NodeType {
  ROLE_ANALYZER = "role_analyzer",
  DYNAMIC_AGENT_EXECUTOR = "dynamic_agent_executor",  // Universal executor
  SYNTHESIZER = "synthesizer",
  OUTPUT_FORMATTER = "output_formatter",
  ERROR_HANDLER = "error_handler"
}

// Edge Conditions (Dynamic)
- Role Analyzer → Dynamic Agent Executor (for each identified role)
- [All Agent Executors] → Synthesizer (parallel join, variable count)
- Synthesizer → Output Formatter (always)
- Any Node → Error Handler (on exception)
```

**Execution Flow**:

1. **Role Analyzer Node**: AI analyzes request, generates 2-4 role definitions
2. **Dynamic Agent Executor Nodes**: Created dynamically for each role, execute in parallel
3. **Synthesizer Node**: Waits for all agents, combines outputs intelligently
4. **Formatter Node**: Structures final JSON response

#### 2. Dynamic Agent System

**Core Components**:

##### Role Analyzer

Uses AI to determine optimal writing roles for any request:

```typescript
interface RoleAnalyzer {
  analyze(input: {
    userRequest: string;
    constraints?: UserConstraints;
  }): Promise<RoleAnalysis>;
}

interface RoleAnalysis {
  identifiedRoles: RoleDefinition[];
  reasoning: string;
  confidence: number;
  alternativeRoles?: RoleDefinition[];  // Backup options
}

// Example output for "Write about hiking Mount Fuji"
{
  identifiedRoles: [
    {
      id: "cultural_expert",
      name: "Cultural & Historical Expert",
      description: "Provides context about Mount Fuji's cultural significance",
      promptTemplate: "You are a cultural expert...",
      priority: 9
    },
    {
      id: "practical_guide",
      name: "Practical Travel Guide",
      description: "Offers logistics, timing, and practical advice",
      promptTemplate: "You are a practical travel guide...",
      priority: 8
    },
    {
      id: "narrative_writer",
      name: "Storyteller",
      description: "Creates engaging, vivid narrative",
      promptTemplate: "You are a storytelling expert...",
      priority: 7
    }
  ],
  reasoning: "Request requires cultural context, practical information, and engaging narrative",
  confidence: 0.92
}
```

##### Dynamic Agent Factory

Creates agents on-the-fly based on role definitions:

```typescript
interface DynamicAgentFactory {
  createAgent(role: RoleDefinition): WritingAgent;

  // Agent lifecycle management
  cacheAgent(roleId: string, agent: WritingAgent): void;
  getCachedAgent(roleId: string): WritingAgent | null;
}

// Universal Agent Interface
interface WritingAgent {
  id: string;
  roleName: string;
  roleDescription: string;

  generate(input: {
    request: string;
    context: WritingGraphState;
  }): Promise<AgentOutput>;

  validate(output: string): ValidationResult;
}

interface AgentOutput {
  content: string; // markdown
  reasoning: string;
  confidence: number;
  metadata: {
    styleScore: number;
    keyElements: string[];
    suggestions: string[];
  };
}
```

**Outdoor Sports Agent**:

- **Focus**: Technical accuracy, safety, engagement
- **Prompt Elements**:
  - Expertise in outdoor activities (hiking, climbing, cycling, etc.)
  - Safety-first mindset
  - Descriptive, adventurous tone
  - Practical tips and gear recommendations
- **Validation**: Check for safety disclaimers, technical terminology

**Marketing Copy Agent**:

- **Focus**: Persuasion, clarity, brand voice
- **Prompt Elements**:
  - Understanding of marketing frameworks (AIDA, PAS)
  - Strong CTAs (Call-to-Action)
  - Benefit-driven language
  - Audience awareness
- **Validation**: Verify CTA presence, persuasive elements

**Prose/Essay Agent**:

- **Focus**: Literary quality, narrative structure
- **Prompt Elements**:
  - Storytelling techniques
  - Emotional resonance
  - Varied sentence structure
  - Thematic depth
- **Validation**: Check for narrative arc, literary devices

#### 3. Synthesizer Agent

**Responsibilities**:

- Combine multiple agent outputs into cohesive content
- Resolve contradictions or overlaps
- Maintain best elements from each perspective
- Ensure smooth transitions

**Synthesis Strategies**:

1. **Interleaving**: Weave sections from different agents
2. **Layering**: Stack perspectives (intro → body → conclusion)
3. **Highlighting**: Include multiple versions with labels
4. **Blending**: Create new content inspired by all inputs

**Selection Logic**:

- Default: Interleaving for diverse content
- User can specify preference via API parameter

#### 4. AI SDK Integration

**Model Selection**:

```typescript
// Use existing provider infrastructure
import { myProvider } from "@/lib/ai/providers";

// Agent-specific model configuration
const agentModel = myProvider("chat-model", {
  temperature: 0.7, // Creative writing
  maxTokens: 2000,
});

// Synthesizer uses reasoning model for complex decisions
const synthesizerModel = myProvider("chat-model-reasoning", {
  temperature: 0.5,
  maxTokens: 3000,
});
```

**Streaming Consideration**:

- Phase 1: Complete responses only (simpler)
- Phase 2: Stream agent outputs as they complete
- Use AI SDK's `streamText` with custom callbacks

### Data Flow Diagram

```
User Request
    │
    ▼
[API Endpoint]
    │ (validate input)
    ▼
[LangGraph Graph.invoke()]
    │
    ▼
[Router Node]
    │ (analyze request)
    ├─────────┬─────────┐
    ▼         ▼         ▼
[Outdoor] [Marketing] [Prose]
    │         │         │
    │ (parallel execution)
    │         │         │
    └─────────┼─────────┘
              ▼
        [Synthesizer]
              │ (combine outputs)
              ▼
        [Formatter]
              │ (structure JSON)
              ▼
        JSON Response
```

### Error Handling

**Error Types**:

1. **Validation Error**: Invalid input format
2. **Agent Timeout**: Agent exceeds time limit
3. **Model Error**: AI provider failure
4. **Synthesis Conflict**: Agents produce incompatible outputs

**Handling Strategy**:

```typescript
try {
  // Execute graph
  const result = await graph.invoke(state);
  return formatSuccess(result);
} catch (error) {
  if (error instanceof ValidationError) {
    return formatError("Invalid input", 400);
  }

  if (error instanceof TimeoutError) {
    // Return partial results if available
    return formatPartialSuccess(state.agentOutputs);
  }

  if (error instanceof ModelError) {
    // Retry with fallback model
    return retryWithFallback(state);
  }

  // Generic error
  return formatError("Internal error", 500);
}
```

### Performance Considerations

**Optimization Strategies**:

1. **Parallel Execution**: Run agents concurrently (estimated 3x speedup)
2. **Caching**: Cache router decisions for similar requests
3. **Token Limits**: Enforce per-agent token budgets
4. **Streaming**: Stream synthesizer output as agents complete

**Resource Estimates**:

- **Token Usage**: ~5,000-10,000 tokens per request (3 agents + synthesizer)
- **Latency**: 15-25 seconds for full workflow
- **Memory**: ~50MB per concurrent request (LangGraph state)

### Security & Privacy

**Considerations**:

1. **Input Sanitization**: Validate and sanitize user requests
2. **Output Filtering**: Screen for sensitive content
3. **Rate Limiting**: Prevent abuse (implement per-user limits)
4. **Logging**: Log requests for debugging but redact PII

### Extensibility

**Adding New Writing Styles**:

1. Create new agent class in `lib/ai/agents/writing/`
2. Register in LangGraph node definitions
3. Update router logic to recognize new style
4. Add validation rules

**Adding New Orchestration Patterns**:

1. Define new graph structure in `lib/ai/langgraph/`
2. Implement custom edge conditions
3. Update state schema if needed
4. Add new synthesis strategies

### Technology Choices

**Why LangGraph?**

- Built for complex agent workflows
- State management out of the box
- Conditional routing and parallel execution
- Debugging and visualization tools
- TypeScript support

**Why Not Alternatives?**

- **Plain AI SDK**: No built-in orchestration, would require custom state machine
- **AutoGPT/BabyAGI**: Too heavyweight, opinionated architectures
- **Custom Solution**: Reinventing the wheel, maintenance burden

### Testing Strategy

**Unit Tests**:

- Individual agent output validation
- Router decision logic
- Synthesizer combination algorithms

**Integration Tests**:

- Full graph execution with mock models
- Error handling paths
- Output schema validation

**E2E Tests**:

- Real model calls with sample requests
- Performance benchmarking
- Quality evaluation (manual review)

### Monitoring & Observability

**Metrics to Track**:

- Request volume and success rate
- Latency per graph node
- Token usage per agent
- Error types and frequency
- User satisfaction (if feedback mechanism exists)

**Instrumentation**:

```typescript
// Use existing OpenTelemetry setup
import { trace } from "@opentelemetry/api";

const span = trace.getTracer("multi-agent-writing").startSpan("graph.invoke");

// Track node execution
span.addEvent("router.complete", { selectedAgents });
span.addEvent("agents.complete", { tokenCount });
span.addEvent("synthesizer.complete", { outputLength });

span.end();
```

## Migration Path

No breaking changes to existing functionality. New capability added alongside current chat system.

**Phase 1**: Standalone API endpoint
**Phase 2**: Integrate into chat UI as optional mode
**Phase 3**: Expand to additional writing styles

## Future Enhancements

1. **Streaming Responses**: Real-time agent output display
2. **User Feedback Loop**: Ratings influence agent selection
3. **Custom Agent Training**: Fine-tune models for specific styles
4. **Multi-Language Support**: Extend to languages beyond English
5. **Artifact Integration**: Save multi-agent outputs as versioned artifacts

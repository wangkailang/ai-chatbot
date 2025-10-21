# Spec: Collaborative Content Output

## ADDED Requirements

### Requirement: Synthesizer Agent

The system SHALL implement a synthesizer agent that combines outputs from multiple writing agents.

#### Scenario: Combine Agent Outputs

**Given** multiple agents have completed execution (e.g., technical_writer + content_strategist)  
**When** the synthesizer agent executes  
**Then** the agent SHALL:

- Receive all agent outputs from state
- Analyze outputs for complementary elements
- Combine outputs into a single coherent markdown document
- Preserve the best elements from each agent
- Ensure smooth transitions between sections

**Acceptance Criteria**:

- Synthesized content is valid markdown
- Content length is appropriate (not just concatenation)
- Transitions are natural and coherent
- All agent perspectives are represented
- Output includes reasoning for synthesis decisions

#### Scenario: Handle Overlapping Content

**Given** multiple agents produce similar content sections  
**When** synthesizing outputs  
**Then** the synthesizer SHALL:

- Detect overlapping or redundant content
- Select the highest-quality version
- Merge complementary details
- Remove duplication

**Acceptance Criteria**:

- Overlap detection uses semantic similarity (not just string matching)
- Quality selection considers confidence scores and style adherence
- Final content has no redundant sections

#### Scenario: Resolve Contradictions

**Given** agents produce contradictory information  
**When** synthesizing outputs  
**Then** the synthesizer SHALL:

- Detect contradictions using reasoning capabilities
- Apply resolution strategy (majority vote, highest confidence, user preference)
- Document the contradiction and resolution in metadata

**Acceptance Criteria**:

- Contradictions are logged with agent IDs
- Resolution strategy is configurable
- User can see which information was chosen

---

### Requirement: Synthesis Strategies

The system SHALL support multiple strategies for combining agent outputs.

#### Scenario: Interleaving Strategy

**Given** the synthesis strategy is set to "interleaving"  
**When** combining agent outputs  
**Then** the synthesizer SHALL:

- Divide outputs into logical sections (intro, body paragraphs, conclusion)
- Interleave sections from different agents
- Maintain thematic coherence
- Add bridging sentences for transitions

**Acceptance Criteria**:

- Sections are identified using markdown structure or AI analysis
- Interleaving follows a logical order
- Transitions are smooth and natural
- Final document reads as a unified piece

#### Scenario: Layering Strategy

**Given** the synthesis strategy is set to "layering"  
**When** combining agent outputs  
**Then** the synthesizer SHALL:

- Stack outputs sequentially based on role priorities (e.g., researcher intro → analyst body → storyteller conclusion)
- Add section headers or labels to distinguish role perspectives
- Ensure each layer contributes unique value

**Acceptance Criteria**:

- Layers are clearly delineated
- No layer is redundant
- Combined document has logical flow

#### Scenario: Highlighting Strategy

**Given** the synthesis strategy is set to "highlighting"  
**When** combining agent outputs  
**Then** the synthesizer SHALL:

- Present multiple versions side-by-side or sequentially
- Label each version with agent name and style
- Optionally include a summary recommending the best version

**Acceptance Criteria**:

- Each version is complete and standalone
- Labels are clear and descriptive
- Summary provides rationale for recommendations

#### Scenario: Blending Strategy

**Given** the synthesis strategy is set to "blending"  
**When** combining agent outputs  
**Then** the synthesizer SHALL:

- Create entirely new content inspired by all agent outputs
- Synthesize key ideas and themes
- Apply a unified style while incorporating diverse perspectives

**Acceptance Criteria**:

- Blended content is original (not direct quotes)
- Key ideas from all agents are represented
- Style is coherent and professional

---

### Requirement: JSON Output Schema

The system SHALL return structured JSON output with markdown-formatted content.

#### Scenario: Output Structure

**Given** the graph execution completes successfully  
**When** formatting the final output  
**Then** the system SHALL:

- Return a JSON object matching the defined schema
- Include `id`, `timestamp`, `request`, and `identifiedRoles`
- Include `roleAnalysis` with role selection reasoning
- Include `agents` object with each agent's contribution keyed by role ID
- Include `finalContent` as markdown string
- Include `metadata` with execution details

**Acceptance Criteria**:

- Output validates against Zod schema
- All timestamps use ISO 8601 format
- IDs are unique and traceable
- Markdown is properly escaped in JSON

#### Scenario: Agent Contributions

**Given** the output includes agent details  
**When** structuring the `agents` object  
**Then** each agent entry SHALL:

- Use role ID as key (e.g., `"technical_expert"`, `"research_analyst"`)
- Include `roleName` (human-readable role name)
- Include `roleDescription` (role's perspective and focus)
- Include `contribution` (markdown string of agent's output)
- Include `reasoning` (explanation of role-specific choices)
- Include `confidence` (0.0-1.0 score)

**Acceptance Criteria**:

- Agent contributions are complete and unmodified
- Reasoning provides insight into agent decisions
- Confidence scores are meaningful and calibrated

#### Scenario: Metadata Structure

**Given** the output includes metadata  
**When** populating the `metadata` object  
**Then** it SHALL include:

- `tokensUsed`: total tokens consumed across all agents
- `duration`: execution time in milliseconds
- `graphState`: final LangGraph state as string or object
- `synthesisStrategy`: strategy used for combining outputs
- `warnings`: array of non-critical issues encountered

**Acceptance Criteria**:

- Token count is accurate (sum of all model calls)
- Duration includes graph overhead
- Warnings are actionable and descriptive

---

### Requirement: Markdown Formatting

The system SHALL ensure all content is properly formatted as markdown.

#### Scenario: Valid Markdown Syntax

**Given** content is generated by agents or synthesizer  
**When** validating markdown  
**Then** the system SHALL:

- Check for valid markdown syntax (headings, lists, links, etc.)
- Validate that code blocks are properly closed
- Ensure links have valid URL format
- Verify image references are well-formed

**Acceptance Criteria**:

- Markdown parser (e.g., `marked`, `remark`) validates syntax
- Invalid markdown is corrected or flagged
- Output renders correctly in markdown viewers

#### Scenario: Consistent Formatting

**Given** multiple agents produce markdown content  
**When** synthesizing outputs  
**Then** the system SHALL:

- Normalize heading levels (consistent hierarchy)
- Standardize list formatting (bullets vs. numbers)
- Apply consistent link formatting
- Use uniform code block syntax

**Acceptance Criteria**:

- Heading levels start at `##` (not `#` for document title)
- Lists use consistent markers
- Code blocks specify language where applicable
- Links follow `[text](url)` format

#### Scenario: Escape Special Characters

**Given** markdown content is embedded in JSON  
**When** serializing the output  
**Then** the system SHALL:

- Properly escape newlines, quotes, and backslashes
- Use JSON-safe string encoding
- Preserve markdown formatting after JSON parse

**Acceptance Criteria**:

- JSON.stringify handles markdown correctly
- Parsed content retains original formatting
- No mangled characters in output

---

### Requirement: API Endpoint

The system SHALL provide a Next.js API route for multi-agent writing requests.

#### Scenario: Request Validation

**Given** a POST request is sent to `/api/multi-agent-writing`  
**When** the endpoint receives the request  
**Then** it SHALL:

- Validate request body against schema (Zod)
- Check required fields: `request` (string), `styles` (optional array)
- Check optional fields: `constraints`, `synthesisStrategy`
- Return 400 error for invalid requests

**Acceptance Criteria**:

- Request schema is documented in `schema.ts`
- Validation uses Zod `.safeParse()`
- Error responses include field-specific messages

#### Scenario: Authentication and Authorization

**Given** the endpoint requires authentication  
**When** a request is received  
**Then** the system SHALL:

- Verify user session using Next-Auth
- Check user entitlements for multi-agent feature access
- Return 401 for unauthenticated requests
- Return 403 for unauthorized users

**Acceptance Criteria**:

- Uses existing auth infrastructure from `@/app/(auth)/auth`
- Entitlements check uses `entitlementsByUserType`
- Premium feature is gated appropriately

#### Scenario: Successful Response

**Given** a valid request is processed successfully  
**When** returning the response  
**Then** the endpoint SHALL:

- Return HTTP 200 status
- Include JSON body matching output schema
- Include `Content-Type: application/json` header
- Include execution time in `X-Response-Time` header

**Acceptance Criteria**:

- Response body validates against output schema
- Headers are set correctly
- Response time is tracked and logged

#### Scenario: Error Response

**Given** an error occurs during processing  
**When** returning an error response  
**Then** the endpoint SHALL:

- Return appropriate HTTP status (400, 500, etc.)
- Include error message and error code
- Log error details for debugging
- Not expose internal implementation details

**Acceptance Criteria**:

- Error responses use `ChatSDKError` class
- Error messages are user-friendly
- Stack traces are not exposed to clients
- Errors are logged with request ID

---

### Requirement: Rate Limiting

The system SHALL implement rate limiting to prevent abuse of the multi-agent endpoint.

#### Scenario: Per-User Rate Limit

**Given** a user sends multiple requests  
**When** checking rate limits  
**Then** the system SHALL:

- Track requests per user per time window (e.g., 10 requests/hour)
- Return 429 (Too Many Requests) when limit is exceeded
- Include `Retry-After` header with wait time

**Acceptance Criteria**:

- Rate limit is configurable per user type
- Limit resets after time window expires
- Premium users have higher limits

#### Scenario: Global Rate Limit

**Given** the system is under high load  
**When** total request volume exceeds capacity  
**Then** the system SHALL:

- Apply global rate limit (e.g., 1000 requests/minute)
- Return 503 (Service Unavailable) with `Retry-After` header
- Log high-load events for monitoring

**Acceptance Criteria**:

- Global limit protects system resources
- Retryable errors are properly signaled
- Monitoring alerts on sustained high load

---

### Requirement: Caching

The system SHALL cache certain operations to improve performance and reduce costs.

#### Scenario: Router Decision Caching

**Given** identical or similar requests have been processed before  
**When** the router analyzes a new request  
**Then** the system SHALL:

- Check cache for similar requests (using semantic similarity)
- Reuse router decisions if available and still valid
- Cache new decisions with TTL (e.g., 1 hour)

**Acceptance Criteria**:

- Cache key is based on request content hash
- Similarity threshold is configurable
- Cache hit rate is monitored

#### Scenario: Agent Output Caching

**Given** an agent generates content for a specific request  
**When** the same request is received again  
**Then** the system SHALL:

- Cache agent outputs with request hash as key
- Return cached output if still valid (TTL: 24 hours)
- Skip agent execution and reduce costs

**Acceptance Criteria**:

- Cache includes all agent metadata
- TTL is configurable per agent type
- Cache invalidation works correctly

---

### Requirement: Monitoring and Telemetry

The system SHALL provide observability into multi-agent workflows.

#### Scenario: Request Tracing

**Given** a multi-agent request is processed  
**When** execution begins  
**Then** the system SHALL:

- Create a trace span for the entire request
- Create child spans for each graph node
- Include span attributes (agent ID, token count, status)
- Propagate trace context through async operations

**Acceptance Criteria**:

- Uses existing OpenTelemetry setup from `instrumentation.ts`
- Spans are nested correctly
- Trace IDs are logged with all events

#### Scenario: Metrics Collection

**Given** the system is running  
**When** requests are processed  
**Then** the system SHALL collect metrics:

- Request count by endpoint and status
- Request duration (p50, p95, p99)
- Token usage by agent type
- Error rate by error type
- Cache hit rate

**Acceptance Criteria**:

- Metrics are exported to monitoring system
- Dashboards display key metrics
- Alerts trigger on anomalies

---

## MODIFIED Requirements

None. This is a new capability.

---

## REMOVED Requirements

None. This is a new capability.

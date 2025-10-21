# Spec: Dynamic Writing Agents

## ADDED Requirements

### Requirement: Role Analyzer

The system SHALL implement an AI-powered role analyzer that determines optimal writing roles for any request.

#### Scenario: Analyze User Request for Roles

**Given** a user request for content generation  
**When** the role analyzer executes  
**Then** the system SHALL:

- Use AI SDK `generateObject` to analyze the request
- Identify 2-4 optimal writing roles/perspectives
- Generate role definitions with name, description, and priority
- Include reasoning for role selection
- Return confidence score for the analysis

**Acceptance Criteria**:

- Role analysis uses structured output (Zod schema)
- Returns between 2-4 roles (configurable)
- Each role has unique perspective
- Reasoning is human-readable
- Confidence score ranges from 0.0 to 1.0

#### Scenario: Handle Domain-Specific Requests

**Given** a user request in a specialized domain (e.g., "Explain quantum entanglement for a research paper")  
**When** the role analyzer executes  
**Then** the system SHALL:

- Identify domain-appropriate roles (e.g., "research_scientist", "academic_writer", "educator")
- Avoid generic roles when specific expertise is needed
- Prioritize roles by relevance to the request

**Acceptance Criteria**:

- Roles match the domain requirements
- No redundant or overlapping roles
- Priority scores reflect importance (1-10 scale)

#### Scenario: Support User-Specified Roles

**Given** a user provides preferred roles in constraints  
**When** the role analyzer executes  
**Then** the system SHALL:

- Incorporate user-specified roles if valid
- Augment with additional AI-suggested roles if needed
- Validate that user roles are relevant to the request

**Acceptance Criteria**:

- User roles are included in final role list
- System can suggest complementary roles
- Invalid user roles are rejected with explanation

---

### Requirement: Dynamic Agent Factory

The system SHALL implement a factory that creates specialized agents based on role definitions.

#### Scenario: Create Agent from Role Definition

**Given** a role definition from the role analyzer  
**When** the agent factory creates an agent  
**Then** the system SHALL:

- Generate a role-specific system prompt
- Instantiate a universal agent executor with the prompt
- Configure agent with appropriate model parameters
- Return a functional `WritingAgent` instance

**Acceptance Criteria**:

- Agent can execute and return valid `AgentOutput`
- System prompt accurately reflects the role
- Agent is reusable for multiple requests with same role
- Factory can create agents for any role definition

#### Scenario: Cache Agent Instances

**Given** an agent has been created for a specific role  
**When** the same role is needed again  
**Then** the factory SHALL:

- Check cache for existing agent with matching role ID
- Reuse cached agent if available
- Create new agent only if not cached

**Acceptance Criteria**:

- Cache is keyed by role ID
- Cache reduces redundant agent creation
- Cache invalidation works correctly

---

### Requirement: Universal Agent Interface

The system SHALL define a universal interface for all dynamically created agents.

#### Scenario: Agent Contract

**Given** any role definition  
**When** an agent is created  
**Then** the agent SHALL:

- Implement the `WritingAgent` interface with required methods
- Accept `request` (string) and `context` (WritingGraphState) as input
- Return `AgentOutput` with `content`, `reasoning`, `confidence`, and `metadata`
- Validate its output against a schema before returning

**Acceptance Criteria**:

- All agents implement the same TypeScript interface
- Input/output types are strongly typed
- Validation uses Zod schemas
- Interface is role-agnostic

---

### Requirement: Role-Specific Prompt Generation

The system SHALL dynamically generate prompts tailored to each role.

#### Scenario: Generate Prompt from Role Definition

**Given** a role definition with name and description  
**When** creating an agent  
**Then** the system SHALL:

- Generate a system prompt that embodies the role
- Include role-specific instructions and constraints
- Specify output format (markdown)
- Request reasoning for decisions

**Acceptance Criteria**:

- Prompt clearly defines the role's expertise
- Prompt includes examples when beneficial
- Prompt specifies expected behavior
- Prompt is coherent and unambiguous

#### Scenario: Incorporate User Constraints

**Given** user provides constraints (tone, length, audience)  
**When** generating role-specific prompts  
**Then** the system SHALL:

- Inject user constraints into each agent's prompt
- Ensure constraints don't conflict with role identity
- Maintain prompt clarity

**Acceptance Criteria**:

- User constraints are applied to all agents
- Core role definition is preserved
- Prompts remain effective with constraints

---

### Requirement: Role Template Library

The system SHALL maintain a library of reusable prompt templates for common role patterns.

#### Scenario: Use Template for Known Roles

**Given** a role matches a known pattern (e.g., "technical_expert", "storyteller")  
**When** generating the agent prompt  
**Then** the system SHALL:

- Check template library for matching pattern
- Use template as base if available
- Customize template with role-specific details

**Acceptance Criteria**:

- Template library includes 10+ common patterns
- Templates are parameterized and reusable
- Custom roles work without templates

#### Scenario: Add New Templates

**Given** a new role pattern is identified  
**When** system learns from successful agents  
**Then** the system SHALL:

- Optionally save successful prompts as templates
- Allow manual template addition
- Version templates for improvement

**Acceptance Criteria**:

- Templates can be added programmatically or manually
- Template versioning is supported
- Templates improve over time

---

### Requirement: Agent Output Validation

The system SHALL validate outputs from all dynamically created agents.

#### Scenario: Schema Validation

**Given** an agent completes generation  
**When** preparing the output  
**Then** the agent SHALL:

- Validate output against `AgentOutput` Zod schema
- Check that `content` is non-empty markdown
- Verify `confidence` is between 0.0 and 1.0
- Ensure required metadata fields are present

**Acceptance Criteria**:

- Validation uses Zod `.parse()` or `.safeParse()`
- Invalid outputs throw or log validation errors
- Error messages indicate which fields failed

#### Scenario: Content Quality Checks

**Given** an agent generates content  
**When** validating quality  
**Then** the agent SHALL:

- Check markdown syntax validity
- Verify minimum length requirements (e.g., >100 characters)
- Detect placeholder text or incomplete sentences
- Assess role-appropriate characteristics

**Acceptance Criteria**:

- Markdown validation uses a library (e.g., `marked`, `remark`)
- Length checks are configurable per agent
- Placeholder detection uses regex or keyword matching
- Role adherence is scored

---

### Requirement: Agent Error Handling

The system SHALL handle agent-specific errors gracefully.

#### Scenario: Model Failure

**Given** an agent calls the AI model  
**When** the model returns an error  
**Then** the agent SHALL:

- Catch the error and wrap it in an `AgentError` class
- Include role ID and error context
- Return a fallback output or rethrow for graph-level handling

**Acceptance Criteria**:

- `AgentError` includes `roleId`, `message`, and `cause`
- Fallback output has low confidence score
- Error is logged with full context

#### Scenario: Validation Failure

**Given** an agent's output fails validation  
**When** the validation error is detected  
**Then** the agent SHALL:

- Log the validation error with details
- Optionally retry generation (up to 2 retries)
- If retries fail, return a minimal valid output

**Acceptance Criteria**:

- Retries use the same prompt with added instructions
- Minimal output meets schema but indicates failure in metadata
- User is notified of degraded quality

---

### Requirement: Multi-Domain Support

The system SHALL support content generation across unlimited domains without code changes.

#### Scenario: Technical Writing

**Given** a request for technical documentation  
**When** the system analyzes roles  
**Then** the system SHALL:

- Identify roles like "technical_writer", "subject_matter_expert", "editor"
- Generate agents with technical writing focus
- Produce accurate, well-structured documentation

**Acceptance Criteria**:

- Content uses appropriate technical terminology
- Structure follows documentation best practices
- Accuracy is prioritized over creativity

#### Scenario: Creative Writing

**Given** a request for creative fiction  
**When** the system analyzes roles  
**Then** the system SHALL:

- Identify roles like "plot_developer", "character_writer", "dialogue_specialist"
- Generate agents with creative writing focus
- Produce engaging, literary content

**Acceptance Criteria**:

- Content demonstrates creativity and originality
- Characters and plot are developed
- Literary quality is high

#### Scenario: Business Writing

**Given** a request for business content (reports, proposals, emails)  
**When** the system analyzes roles  
**Then** the system SHALL:

- Identify roles like "business_analyst", "professional_communicator", "persuader"
- Generate agents with business writing focus
- Produce clear, professional content

**Acceptance Criteria**:

- Content follows business writing conventions
- Tone is professional and appropriate
- Structure supports business objectives

---

## MODIFIED Requirements

None. This is a new capability.

---

## REMOVED Requirements

None. This is a new capability.

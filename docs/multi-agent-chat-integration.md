# Multi-Agent Writing Chat Integration

## Overview

The multi-agent writing system is now integrated into the chat interface as a tool. The AI assistant can automatically invoke it when users request content creation that would benefit from multiple perspectives.

## How It Works

### Automatic Tool Invocation

The AI model will automatically decide to use the `multiAgentWriting` tool when it detects requests like:

- "Write an article about..."
- "Create a comprehensive guide on..."
- "Draft a report about..."
- "Compose content for..."
- Any request that benefits from multiple expert perspectives

### Example Usage

**User:** "Write a comprehensive article about outdoor sports and their health benefits"

**AI Response:** The assistant will:

1. Recognize this as a content creation request
2. Invoke the `multiAgentWriting` tool
3. The system will:
   - Analyze the request and identify 2-4 optimal roles (e.g., Health Expert, Sports Enthusiast, Writer)
   - Each role generates their contribution in parallel
   - Synthesize all contributions into cohesive content
4. Return the final content with metadata about which roles contributed

### Available Parameters

When the AI invokes the tool, it can specify:

- **request** (required): The detailed writing request
- **tone** (optional): `professional`, `casual`, `technical`, `creative`, or `academic`
- **targetAudience** (optional): Who the content is for (e.g., "developers", "general public")
- **maxLength** (optional): Maximum length in words
- **synthesisStrategy** (optional): How to combine outputs:
  - `interleaving`: Mix sections from different agents
  - `layering`: Stack contributions sequentially
  - `highlighting`: Present each role's contribution distinctly
  - `blending`: Create a unified narrative (default)

## User Experience

### What Users See

1. **Tool Invocation**: The chat will show that the multi-agent writing tool is being used
2. **Processing**: A loading indicator while agents work (typically 10-30 seconds)
3. **Result**: The final content with a note about which roles contributed

### Example Interaction

```
User: Write an article about sustainable living practices for urban residents
```

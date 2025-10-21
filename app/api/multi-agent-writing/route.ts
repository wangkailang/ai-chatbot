/**
 * Multi-Agent Writing API Endpoint
 * POST /api/multi-agent-writing
 */

import { NextResponse } from "next/server";
import { auth } from "@/app/(auth)/auth";
import { formatMultiAgentOutput } from "@/lib/ai/formatters/multi-agent-output";
import {
  createInitialState,
  executeWritingWorkflow,
} from "@/lib/ai/langgraph/graph";
import { MultiAgentWritingRequestSchema } from "./schema";

export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const parseResult = MultiAgentWritingRequestSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request",
          details: parseResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { request: userRequest, constraints } = parseResult.data;

    // Create initial state
    const initialState = createInitialState(userRequest, constraints);

    // Execute workflow
    const finalState = await executeWritingWorkflow(initialState);

    // Format output
    const output = formatMultiAgentOutput(finalState);

    // Calculate response time
    const responseTime = Date.now() - startTime;

    // Return response
    return NextResponse.json(output, {
      headers: {
        "Content-Type": "application/json",
        "X-Response-Time": `${responseTime}ms`,
      },
    });
  } catch (error) {
    console.error("Multi-agent writing error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Internal server error",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

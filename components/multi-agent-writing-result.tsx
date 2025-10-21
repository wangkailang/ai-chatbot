"use client";

import { CheckCircle2Icon, SparklesIcon, UsersIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type MultiAgentWritingOutput = {
  success: boolean;
  content?: string;
  metadata?: {
    roles: string;
    strategy: string;
    duration: number;
    agents: Array<{
      role: string;
      confidence: number;
    }>;
  };
  error?: string;
};

export function MultiAgentWritingResult({
  output,
}: {
  output: MultiAgentWritingOutput;
}) {
  if (!output.success || output.error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600 dark:border-red-900 dark:bg-red-950/50">
        <p className="font-medium text-sm">Multi-Agent Writing Error</p>
        <p className="mt-1 text-sm">{output.error || "Unknown error"}</p>
      </div>
    );
  }

  const { metadata } = output;

  if (!metadata) {
    return null;
  }

  const rolesArray = metadata.roles
    ? metadata.roles.split(", ").filter((r) => r.trim())
    : [];

  return (
    <div className="space-y-3">
      {/* Header Section */}
      <div className="flex items-start gap-3 rounded-lg border bg-muted/30 p-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
          <UsersIcon className="size-4 text-primary" />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Multi-Agent Collaboration</h3>
            <Badge className="text-xs" variant="secondary">
              <SparklesIcon className="mr-1 size-3" />
              {metadata.strategy}
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            Generated in {(metadata.duration / 1000).toFixed(1)}s
          </p>
        </div>
      </div>

      {/* Agents Section */}
      {metadata.agents && metadata.agents.length > 0 && (
        <div className="space-y-2">
          <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
            Contributing Agents
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {metadata.agents.map((agent) => (
              <div
                className="flex items-center gap-2 rounded-md border bg-background p-3"
                key={agent.role}
              >
                <CheckCircle2Icon className="size-4 shrink-0 text-green-600" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-sm">{agent.role}</p>
                  <p className="text-muted-foreground text-xs">
                    {(agent.confidence * 100).toFixed(0)}% confidence
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fallback: Show role names if agents array is empty */}
      {(!metadata.agents || metadata.agents.length === 0) &&
        rolesArray.length > 0 && (
          <div className="space-y-2">
            <p className="font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Contributing Roles
            </p>
            <div className="flex flex-wrap gap-2">
              {rolesArray.map((role) => (
                <Badge key={role} variant="outline">
                  <CheckCircle2Icon className="mr-1 size-3 text-green-600" />
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        )}
    </div>
  );
}

/**
 * Dynamic Agent Factory: Creates agents on-demand based on role definitions
 */

import type { RoleDefinition } from "./role-types";
import { UniversalWritingAgent } from "./universal-agent";

/**
 * Factory for creating dynamic agents
 */
export class DynamicAgentFactory {
  private readonly agentCache: Map<string, UniversalWritingAgent> = new Map();
  private readonly timeout: number;
  private readonly enableCaching: boolean;

  constructor(timeout = 30_000, enableCaching = true) {
    this.timeout = timeout;
    this.enableCaching = enableCaching;
  }

  /**
   * Create or retrieve a cached agent for the given role
   */
  createAgent(role: RoleDefinition): UniversalWritingAgent {
    const cacheKey = role.id;

    // Check cache if enabled
    if (this.enableCaching && this.agentCache.has(cacheKey)) {
      const cachedAgent = this.agentCache.get(cacheKey);
      if (cachedAgent) {
        return cachedAgent;
      }
    }

    // Create new agent
    const agent = new UniversalWritingAgent(role, this.timeout);

    // Cache if enabled
    if (this.enableCaching) {
      this.agentCache.set(cacheKey, agent);
    }

    return agent;
  }

  /**
   * Clear the agent cache
   */
  clearCache(): void {
    this.agentCache.clear();
  }

  /**
   * Get cache size
   */
  getCacheSize(): number {
    return this.agentCache.size;
  }
}

/**
 * Singleton factory instance
 */
export const agentFactory = new DynamicAgentFactory();

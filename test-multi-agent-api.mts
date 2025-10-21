/**
 * Simple test script for multi-agent writing API
 * Run with: node --loader ts-node/esm test-multi-agent-api.mts
 */

const TEST_REQUEST = {
  request:
    "Write an article about the benefits of outdoor hiking for physical and mental health",
  constraints: {
    tone: "informative and engaging",
    targetAudience: "health-conscious adults",
    synthesisStrategy: "blending",
  },
};

async function testMultiAgentAPI() {
  console.log("🧪 Testing Multi-Agent Writing API...\n");
  console.log("Request:", JSON.stringify(TEST_REQUEST, null, 2));
  console.log("\n" + "=".repeat(80) + "\n");

  try {
    const response = await fetch(
      "http://localhost:3001/api/multi-agent-writing",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(TEST_REQUEST),
      }
    );

    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log("Response Time:", response.headers.get("X-Response-Time"));
    console.log("\n" + "=".repeat(80) + "\n");

    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));

    if (response.ok && data.finalContent) {
      console.log("\n" + "=".repeat(80));
      console.log("✅ TEST PASSED: Multi-agent writing API is working!");
      console.log("=".repeat(80));
      console.log("\n📝 Final Content:\n");
      console.log(data.finalContent);
      console.log("\n" + "=".repeat(80));
      console.log(
        `\n🎯 Identified Roles: ${data.identifiedRoles.map((r: { name: string }) => r.name).join(", ")}`
      );
      console.log(`⏱️  Duration: ${data.metadata.duration}ms`);
      console.log(`🎭 Agents Used: ${Object.keys(data.agents).length}`);
    } else {
      console.log("\n❌ TEST FAILED:", data.error || "No content generated");
    }
  } catch (error) {
    console.error("\n❌ TEST ERROR:", error);
  }
}

testMultiAgentAPI();

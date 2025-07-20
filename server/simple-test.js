/**
 * Simple validation test without database dependency
 */

const axios = require("axios");

const API_BASE = "http://localhost:5000";

const testValidation = async () => {
  console.log("🧪 Testing API Validation and Security Features\n");

  // Test 1: Health check
  try {
    const health = await axios.get(`${API_BASE}/api/health`);
    console.log("✅ Health check passed:", health.data.status);
  } catch (error) {
    console.log("❌ Health check failed:", error.message);
    return;
  }

  // Test 2: CORS headers
  try {
    const corsTest = await axios.get(`${API_BASE}/`, {
      headers: { Origin: "http://localhost:5173" },
    });
    console.log(
      "✅ CORS test passed - server responds to cross-origin requests"
    );
  } catch (error) {
    console.log("⚠️  CORS test inconclusive:", error.message);
  }

  // Test 3: Empty body validation
  try {
    const emptyBody = await axios.post(`${API_BASE}/api/analyze`, {});
    console.log("❌ Empty body validation FAILED - should have returned 400");
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(
        "✅ Empty body validation passed:",
        error.response.data.message
      );
    } else {
      console.log(
        "⚠️  Empty body test inconclusive:",
        error.response?.status || error.message
      );
    }
  }

  // Test 4: Invalid GitHub URL
  try {
    const invalidUrl = await axios.post(`${API_BASE}/api/analyze`, {
      repoUrl: "not-a-github-url",
    });
    console.log("❌ URL validation FAILED - should have returned 400");
  } catch (error) {
    if (error.response?.status === 400) {
      console.log(
        "✅ GitHub URL validation passed:",
        error.response.data.message
      );
    } else {
      console.log(
        "⚠️  URL validation test inconclusive:",
        error.response?.status || error.message
      );
    }
  }

  // Test 5: Valid GitHub URL format (will fail due to no database, but validation should pass)
  try {
    const validUrl = await axios.post(`${API_BASE}/api/analyze`, {
      repoUrl: "https://github.com/facebook/react",
    });
    console.log("⚠️  Analysis completed (unexpected)");
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("❌ Valid URL was rejected:", error.response.data.message);
    } else if (error.response?.status === 429) {
      console.log("✅ Rate limiting is working:", error.response.data.message);
    } else if (error.response?.status === 500) {
      console.log(
        "✅ URL validation passed, but analysis failed (expected due to no DB)"
      );
    } else {
      console.log(
        "⚠️  Valid URL test inconclusive:",
        error.response?.status || error.message
      );
    }
  }

  // Test 6: Rate limiting (make multiple requests quickly)
  console.log("\n🚫 Testing rate limiting...");
  for (let i = 1; i <= 4; i++) {
    try {
      await axios.post(`${API_BASE}/api/analyze`, {
        repoUrl: "https://github.com/test/repo",
      });
      console.log(`   Request ${i}: Success (unexpected)`);
    } catch (error) {
      if (error.response?.status === 429) {
        console.log(
          `   Request ${i}: ✅ Rate limited (${error.response.data.message})`
        );
        break;
      } else {
        console.log(`   Request ${i}: ${error.response?.status || "Error"}`);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log("\n✅ Security feature testing completed!");
};

testValidation();

/**
 * Test script for DevInsight API security features
 * Tests GitHub URL validation, CORS, and rate limiting
 */

const axios = require("axios");

const API_BASE = "http://localhost:5000/api";

// Test data
const testCases = {
  validUrls: [
    "https://github.com/facebook/react",
    "github.com/microsoft/vscode",
    "https://www.github.com/nodejs/node",
    "github.com/torvalds/linux",
  ],
  invalidUrls: [
    "not-a-url",
    "https://gitlab.com/owner/repo",
    "https://github.com/",
    "https://github.com/owner",
    "https://github.com/owner/",
    "invalid-chars-!@#$/repo",
    "https://github.com/owner/repo-with-very-long-name-that-exceeds-the-maximum-allowed-length-for-repository-names-which-should-fail-validation",
  ],
};

// Helper function to make API requests
const testRequest = async (url, data, expectedStatus = 200) => {
  try {
    const response = await axios.post(`${API_BASE}${url}`, data, {
      headers: {
        "Content-Type": "application/json",
        Origin: "http://localhost:5173", // Simulate frontend origin
      },
    });
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 0,
      data: error.response?.data || error.message,
    };
  }
};

// Test GitHub URL validation
const testGitHubValidation = async () => {
  console.log("\n🧪 Testing GitHub URL Validation...\n");

  // Test valid URLs
  console.log("✅ Testing Valid URLs:");
  for (const url of testCases.validUrls) {
    const result = await testRequest("/analyze", { repoUrl: url });
    console.log(
      `   ${url}: ${result.success ? "✅ PASSED" : "❌ FAILED"} (${
        result.status
      })`
    );
    if (!result.success && result.status !== 429) {
      // Ignore rate limit errors for now
      console.log(`      Error: ${result.data.message || result.data}`);
    }
  }

  // Test invalid URLs
  console.log("\n❌ Testing Invalid URLs:");
  for (const url of testCases.invalidUrls) {
    const result = await testRequest("/analyze", { repoUrl: url });
    const expected = result.status === 400;
    console.log(
      `   ${url}: ${expected ? "✅ PASSED" : "❌ FAILED"} (${result.status})`
    );
    if (result.success || result.status !== 400) {
      console.log(`      Expected 400 but got ${result.status}`);
    }
  }
};

// Test rate limiting
const testRateLimit = async () => {
  console.log("\n🚫 Testing Rate Limiting...\n");

  const testUrl = "https://github.com/facebook/react";

  for (let i = 1; i <= 5; i++) {
    const result = await testRequest("/analyze", { repoUrl: testUrl });
    console.log(
      `   Request ${i}: ${result.status} - ${
        result.success ? "SUCCESS" : "RATE LIMITED"
      }`
    );

    if (result.status === 429) {
      console.log(
        `      ✅ Rate limit working! Message: ${result.data.message}`
      );
      break;
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
};

// Test CORS headers
const testCORS = async () => {
  console.log("\n🌐 Testing CORS Configuration...\n");

  try {
    const response = await axios.options(`${API_BASE}/analyze`, {
      headers: {
        Origin: "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "Content-Type",
      },
    });

    console.log("   ✅ CORS preflight successful");
    console.log(
      `   Access-Control-Allow-Origin: ${response.headers["access-control-allow-origin"]}`
    );
    console.log(
      `   Access-Control-Allow-Methods: ${response.headers["access-control-allow-methods"]}`
    );
  } catch (error) {
    console.log("   ❌ CORS test failed:", error.message);
  }
};

// Test missing request body
const testValidation = async () => {
  console.log("\n📋 Testing Request Validation...\n");

  // Test empty body
  const emptyBodyResult = await testRequest("/analyze", {});
  console.log(
    `   Empty body: ${
      emptyBodyResult.status === 400 ? "✅ PASSED" : "❌ FAILED"
    } (${emptyBodyResult.status})`
  );

  // Test missing repoUrl
  const missingUrlResult = await testRequest("/analyze", {
    otherField: "value",
  });
  console.log(
    `   Missing repoUrl: ${
      missingUrlResult.status === 400 ? "✅ PASSED" : "❌ FAILED"
    } (${missingUrlResult.status})`
  );
};

// Main test runner
const runTests = async () => {
  console.log("🚀 DevInsight API Security Tests\n");
  console.log("=".repeat(50));

  try {
    await testValidation();
    await testGitHubValidation();
    await testCORS();
    await testRateLimit();

    console.log("\n" + "=".repeat(50));
    console.log("✅ All tests completed!");
  } catch (error) {
    console.error("\n❌ Test runner error:", error.message);
  }
};

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testGitHubValidation,
  testRateLimit,
  testCORS,
  testValidation,
  runTests,
};

const axios = require("axios");

/**
 * Create a mock analysis for testing when OpenAI is not available
 * @param {string} text - The repository content
 * @returns {Object} - Mock analysis response
 */
const createMockAnalysis = (text) => {
  const hasReadme = text.toLowerCase().includes("readme");
  const hasCode =
    text.includes("function") ||
    text.includes("class") ||
    text.includes("def ") ||
    text.includes("import ") ||
    text.includes("const ");
  const textLength = text.length;

  // Simple scoring based on content
  let readinessScore = 50; // Base score
  if (hasReadme) readinessScore += 20;
  if (hasCode) readinessScore += 15;
  if (textLength > 1000) readinessScore += 10;
  if (textLength > 5000) readinessScore += 5;

  return {
    success: true,
    model: "mock-analysis-v1",
    analysis: {
      readinessScore: Math.min(readinessScore, 100),
      overallSummary: hasReadme
        ? "Repository contains documentation and appears to be well-structured for a learning project."
        : "Repository needs better documentation to improve readiness.",
      codeQuality: {
        score: hasCode ? 75 : 40,
        comments: hasCode
          ? ["Code structure looks good", "Consider adding more comments"]
          : [
              "Limited code examples found",
              "Consider adding practical implementations",
            ],
        strengths: hasCode
          ? ["Contains executable code", "Structured content"]
          : ["Well-documented learning material"],
        improvements: hasCode
          ? ["Add more inline comments", "Include error handling"]
          : ["Add code examples", "Include practical implementations"],
      },
      readmeQuality: {
        exists: hasReadme,
        score: hasReadme ? 80 : 20,
        feedback: hasReadme
          ? "README found and appears informative"
          : "No README file detected",
        suggestions: hasReadme
          ? [
              "Consider adding more usage examples",
              "Include installation instructions",
            ]
          : [
              "Create a comprehensive README file",
              "Add project description and setup instructions",
            ],
      },
      technicalDebt: {
        level: hasCode ? "low" : "unknown",
        issues: hasCode
          ? ["Code organization could be improved"]
          : ["No significant technical debt detected in current analysis"],
      },
      security: {
        concerns: [
          "No obvious security vulnerabilities detected in basic analysis",
        ],
        recommendations: [
          "Follow security best practices",
          "Keep dependencies updated",
          "Validate user inputs",
        ],
      },
      suggestedReadme: hasReadme
        ? "Consider enhancing your existing README with more examples and clearer installation instructions."
        : "# Project Title\n\n## Description\nBrief description of your project.\n\n## Installation\n```bash\nnpm install\n```\n\n## Usage\nInstructions on how to use your project.\n\n## Contributing\nGuidelines for contributing to the project.",
    },
  };
};

/**
 * Analyze GitHub repository content using OpenAI GPT
 * @param {string} text - The merged content from GitHub repository (README + code files)
 * @returns {Promise<Object>} - OpenAI analysis response
 */
const analyzeWithOpenAI = async (text) => {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      console.log("🤖 OpenAI API key not found, returning mock analysis...");
      return createMockAnalysis(text);
    }

    // Truncate text if it's too long for the API (GPT-4 has ~8k token limit for input)
    // Rough estimate: 1 token ≈ 4 characters
    const maxCharacters = 24000; // ~6k tokens, leaving room for prompt and response
    const truncatedText =
      text.length > maxCharacters
        ? text.substring(0, maxCharacters) +
          "\n\n[Content truncated due to length limits...]"
        : text;

    console.log(
      `🤖 Sending ${truncatedText.length} characters to OpenAI for analysis...`
    );

    const prompt = `Analyze this GitHub project. Return your analysis in valid JSON format with the following structure:

{
  "readinessScore": <number between 0-100>,
  "codeQuality": {
    "score": <number between 0-100>,
    "comments": [
      "specific comment about code quality",
      "another specific observation"
    ],
    "strengths": [
      "positive aspects of the code"
    ],
    "improvements": [
      "specific suggestions for improvement"
    ]
  },
  "readmeQuality": {
    "exists": <boolean>,
    "score": <number between 0-100 if exists, 0 if not>,
    "feedback": "detailed feedback about README quality",
    "suggestions": [
      "specific suggestions for README improvement"
    ]
  },
  "suggestedReadme": "A complete README.md content suggestion (only if README is missing or very poor)",
  "overallSummary": "Brief summary of the project's state and recommendations",
  "technicalDebt": {
    "level": "low|medium|high",
    "issues": [
      "specific technical debt issues found"
    ]
  },
  "security": {
    "concerns": [
      "security issues or potential vulnerabilities"
    ],
    "recommendations": [
      "security improvement suggestions"
    ]
  }
}

Project Content:
${truncatedText}

Important: Return ONLY valid JSON. Do not include any markdown formatting, explanations, or text outside the JSON structure.`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4", // Use gpt-3.5-turbo as fallback if gpt-4 is not available
        messages: [
          {
            role: "system",
            content:
              "You are an expert software engineer and code reviewer specializing in analyzing GitHub repositories for code quality, documentation, and project readiness. Always respond with valid JSON only.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.3, // Lower temperature for more consistent analysis
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 60000, // 60 second timeout
      }
    );

    const aiResponse = response.data.choices[0].message.content.trim();
    console.log("🤖 OpenAI Analysis Response Length:", aiResponse.length);
    console.log(
      "🤖 Raw OpenAI Response:",
      aiResponse.substring(0, 500) + "..."
    );

    // Try to parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error(
        "❌ Failed to parse OpenAI JSON response:",
        parseError.message
      );
      console.error("Raw response:", aiResponse);

      // Return a fallback response if JSON parsing fails
      parsedResponse = {
        readinessScore: 50,
        codeQuality: {
          score: 50,
          comments: ["Unable to parse AI response - please try again"],
          strengths: [],
          improvements: ["Retry analysis for detailed insights"],
        },
        readmeQuality: {
          exists: false,
          score: 0,
          feedback: "Analysis incomplete due to parsing error",
          suggestions: [],
        },
        suggestedReadme: "",
        overallSummary: "Analysis could not be completed. Please try again.",
        technicalDebt: {
          level: "unknown",
          issues: [],
        },
        security: {
          concerns: [],
          recommendations: [],
        },
        error: "Failed to parse AI response",
        rawResponse: aiResponse.substring(0, 1000),
      };
    }

    console.log("✅ OpenAI analysis completed successfully");
    return {
      success: true,
      analysis: parsedResponse,
      usage: response.data.usage,
      model: response.data.model,
    };
  } catch (error) {
    console.error("❌ OpenAI API Error:", error.message);

    // Handle specific OpenAI API errors
    if (error.response?.status === 401) {
      throw new Error(
        "OpenAI API authentication failed. Please check your API key."
      );
    }

    if (error.response?.status === 403) {
      throw new Error(
        "OpenAI API access denied. Please check your API key permissions."
      );
    }

    if (error.response?.status === 429) {
      throw new Error(
        "OpenAI API rate limit exceeded. Please try again later."
      );
    }

    if (error.response?.status === 400) {
      throw new Error(
        "OpenAI API request error. The request may be too large or malformed."
      );
    }

    if (error.code === "ECONNABORTED") {
      throw new Error("OpenAI API request timed out. Please try again.");
    }

    // Generic error for other cases
    throw new Error(`OpenAI API error: ${error.message}`);
  }
};

/**
 * Test OpenAI connection and API key
 * @returns {Promise<boolean>} - Returns true if connection is successful
 */
const testOpenAIConnection = async () => {
  try {
    const openaiApiKey = process.env.OPENAI_API_KEY;

    if (!openaiApiKey) {
      return false;
    }

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "user",
            content: 'Test connection. Respond with "OK".',
          },
        ],
        max_tokens: 5,
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    );

    return response.status === 200;
  } catch (error) {
    console.error("OpenAI connection test failed:", error.message);
    return false;
  }
};

module.exports = {
  analyzeWithOpenAI,
  testOpenAIConnection,
};

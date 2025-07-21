const express = require("express");
const router = express.Router();
const CodeSmellScanner = require("./index");

// Initialize scanner
const scanner = new CodeSmellScanner();

/**
 * POST /api/analyze/code-smells
 * Analyze code quality and detect code smells
 */
router.post("/code-smells", async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({
        success: false,
        error: "Repository URL is required",
      });
    }

    // Extract owner and repo from GitHub URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return res.status(400).json({
        success: false,
        error: "Invalid GitHub URL format",
      });
    }

    const [, owner, repo] = match;
    const cleanRepo = repo.replace(/\.git$/, "");

    console.log(`🔍 Starting code smell analysis for ${owner}/${cleanRepo}`);

    // Perform code analysis
    const analysis = await scanner.analyzeFromGithub(owner, cleanRepo);

    console.log(`✅ Code smell analysis completed for ${owner}/${cleanRepo}`);
    console.log(
      `📊 Analyzed ${analysis.analyzedFiles} files with score: ${analysis.overallScore}/100`
    );

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("Code smell analysis error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze code smells",
      details: error.message,
    });
  }
});

/**
 * GET /api/analyze/code-smells/thresholds
 * Get current code smell detection thresholds
 */
router.get("/thresholds", (req, res) => {
  res.json({
    success: true,
    data: {
      functionLength: scanner.thresholds.functionLength,
      cyclomaticComplexity: scanner.thresholds.cyclomaticComplexity,
      nestingDepth: scanner.thresholds.nestingDepth,
      duplicateLines: scanner.thresholds.duplicateLines,
      supportedLanguages: Object.keys(scanner.languagePatterns),
      codeSmellTypes: Object.keys(scanner.codeSmells),
    },
  });
});

/**
 * POST /api/analyze/code-smells/file
 * Analyze a single file's content
 */
router.post("/file", async (req, res) => {
  try {
    const { content, fileName, language } = req.body;

    if (!content || !fileName) {
      return res.status(400).json({
        success: false,
        error: "File content and name are required",
      });
    }

    const detectedLanguage = language || scanner.detectLanguage(fileName);
    const analysis = scanner.analyzeFileContent(
      content,
      fileName,
      detectedLanguage,
      content.length
    );

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("File analysis error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze file",
      details: error.message,
    });
  }
});

module.exports = router;

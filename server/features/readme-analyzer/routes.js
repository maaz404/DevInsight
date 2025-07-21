const express = require("express");
const ReadmeAnalyzer = require("./index");

const router = express.Router();
const readmeAnalyzer = new ReadmeAnalyzer();

/**
 * Analyze README from GitHub repository
 * POST /api/analyze/readme
 * Body: { owner: string, repo: string }
 */
router.post("/", async (req, res) => {
  try {
    const { owner, repo } = req.body;

    if (!owner || !repo) {
      return res.status(400).json({
        success: false,
        error: "Owner and repo parameters are required",
      });
    }

    console.log(`🔍 Analyzing README for ${owner}/${repo}`);

    const analysis = await readmeAnalyzer.analyzeFromGithub(owner, repo);

    res.json({
      success: true,
      data: {
        repository: `${owner}/${repo}`,
        analysis,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ README analysis error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze README",
    });
  }
});

/**
 * Analyze README from direct content
 * POST /api/analyze/readme/content
 * Body: { content: string, filename?: string }
 */
router.post("/content", async (req, res) => {
  try {
    const { content, filename } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "Content parameter is required",
      });
    }

    console.log("🔍 Analyzing README content directly");

    const analysis = readmeAnalyzer.analyzeContent(content, filename);

    res.json({
      success: true,
      data: {
        analysis,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ README content analysis error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze README content",
    });
  }
});

module.exports = router;

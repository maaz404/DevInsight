const express = require("express");
const DependencyAnalyzer = require("./index");

const router = express.Router();
const dependencyAnalyzer = new DependencyAnalyzer();

/**
 * Analyze dependencies from GitHub repository
 * POST /api/analyze/dependencies
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

    console.log(`🔍 Analyzing dependencies for ${owner}/${repo}`);

    const analysis = await dependencyAnalyzer.analyzeFromGithub(owner, repo);

    res.json({
      success: true,
      data: {
        repository: `${owner}/${repo}`,
        analysis,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Dependency analysis error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze dependencies",
    });
  }
});

/**
 * Analyze dependencies from package.json content
 * POST /api/analyze/dependencies/content
 * Body: { packageJson: object }
 */
router.post("/content", async (req, res) => {
  try {
    const { packageJson } = req.body;

    if (!packageJson) {
      return res.status(400).json({
        success: false,
        error: "packageJson parameter is required",
      });
    }

    console.log("🔍 Analyzing package.json content directly");

    const analysis = await dependencyAnalyzer.analyzePackageJson(
      packageJson,
      "direct-upload"
    );

    res.json({
      success: true,
      data: {
        analysis,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ Package.json analysis error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Failed to analyze package.json content",
    });
  }
});

/**
 * Get package information
 * GET /api/analyze/dependencies/package/:name
 */
router.get("/package/:name", async (req, res) => {
  try {
    const { name } = req.params;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Package name is required",
      });
    }

    const packageInfo = await dependencyAnalyzer.analyzeSinglePackage(
      name,
      "latest"
    );

    res.json({
      success: true,
      data: packageInfo,
    });
  } catch (error) {
    console.error("❌ Package lookup error:", error);

    res.status(500).json({
      success: false,
      error: error.message || "Failed to get package information",
    });
  }
});

module.exports = router;

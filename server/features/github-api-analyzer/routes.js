const express = require("express");
const router = express.Router();
const GitHubApiAnalyzer = require("./index");

// Initialize analyzer
const analyzer = new GitHubApiAnalyzer();

/**
 * POST /api/analyze/github
 * Analyze GitHub repository statistics and metrics
 */
router.post("/github", async (req, res) => {
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

    console.log(`🔍 Starting GitHub API analysis for ${owner}/${cleanRepo}`);

    // Perform GitHub analysis
    const analysis = await analyzer.analyzeFromGithub(owner, cleanRepo);

    console.log(`✅ GitHub analysis completed for ${owner}/${cleanRepo}`);
    console.log(`📊 Repository score: ${analysis.score}/100`);

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error("GitHub analysis error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to analyze GitHub repository",
      details: error.message,
    });
  }
});

/**
 * GET /api/analyze/github/metrics
 * Get available GitHub metrics and thresholds
 */
router.get("/metrics", (req, res) => {
  res.json({
    success: true,
    data: {
      thresholds: analyzer.thresholds,
      weights: analyzer.weights,
      supportedMetrics: [
        "popularity",
        "activity",
        "community",
        "health",
        "languages",
        "timeline",
      ],
      popularityMetrics: ["stars", "forks", "watchers"],
      activityMetrics: ["commits", "releases", "frequency"],
      communityMetrics: ["contributors", "issues"],
      healthMetrics: ["maintenance", "documentation", "issues"],
    },
  });
});

/**
 * POST /api/analyze/github/compare
 * Compare multiple repositories
 */
router.post("/compare", async (req, res) => {
  try {
    const { repositories } = req.body;

    if (
      !repositories ||
      !Array.isArray(repositories) ||
      repositories.length < 2
    ) {
      return res.status(400).json({
        success: false,
        error: "At least 2 repository URLs are required for comparison",
      });
    }

    if (repositories.length > 5) {
      return res.status(400).json({
        success: false,
        error: "Maximum 5 repositories can be compared at once",
      });
    }

    console.log(
      `🔍 Starting comparison of ${repositories.length} repositories`
    );

    // Analyze all repositories in parallel
    const analyses = await Promise.allSettled(
      repositories.map(async (repoUrl) => {
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
        if (!match) {
          throw new Error(`Invalid GitHub URL: ${repoUrl}`);
        }
        const [, owner, repo] = match;
        const cleanRepo = repo.replace(/\.git$/, "");
        return analyzer.analyzeFromGithub(owner, cleanRepo);
      })
    );

    // Extract successful results
    const results = analyses.map((result, index) => ({
      repository: repositories[index],
      success: result.status === "fulfilled",
      data: result.status === "fulfilled" ? result.value : null,
      error: result.status === "rejected" ? result.reason.message : null,
    }));

    // Generate comparison summary
    const comparison = generateComparisonSummary(
      results.filter((r) => r.success).map((r) => r.data)
    );

    console.log(`✅ Repository comparison completed`);

    res.json({
      success: true,
      data: {
        results,
        comparison,
        totalAnalyzed: results.filter((r) => r.success).length,
      },
    });
  } catch (error) {
    console.error("Repository comparison error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to compare repositories",
      details: error.message,
    });
  }
});

/**
 * Generate comparison summary
 */
function generateComparisonSummary(analyses) {
  if (analyses.length === 0) return null;

  const metrics = ["score", "popularity", "activity", "community", "health"];
  const summary = {};

  metrics.forEach((metric) => {
    const values = analyses.map((analysis) => {
      if (metric === "score") return analysis.score;
      return analysis[metric]?.overallScore || 0;
    });

    summary[metric] = {
      highest: Math.max(...values),
      lowest: Math.min(...values),
      average: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
      leader: analyses[values.indexOf(Math.max(...values))]?.repository,
    };
  });

  return summary;
}

module.exports = router;

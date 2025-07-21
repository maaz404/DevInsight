const express = require("express");
const axios = require("axios");
const router = express.Router();
const Project = require("../models/Project"); // Make sure this import exists
const mongoose = require("mongoose"); // Import mongoose
const ReadmeAnalyzer = require("../features/readme-analyzer"); // Import README analyzer
const DependencyAnalyzer = require("../features/dependency-analyzer"); // Import Dependency analyzer
const CodeSmellScanner = require("../features/code-smell-scanner"); // Import Code Smell Scanner
const GitHubApiAnalyzer = require("../features/github-api-analyzer"); // Import GitHub API Analyzer

// Debug middleware
const debugMiddleware = (req, res, next) => {
  console.log("🔍 DEBUG - Analyze request received:", {
    method: req.method,
    url: req.url,
    body: req.body,
    headers: {
      "content-type": req.headers["content-type"],
      "user-agent": req.headers["user-agent"],
    },
  });
  next();
};

// Simple test route first
router.get("/test", (req, res) => {
  console.log("✅ Test route accessed");
  res.json({
    success: true,
    message: "Analyze route is working",
    timestamp: new Date().toISOString(),
  });
});

// Main analyze route with debugging
router.post(
  "/",
  debugMiddleware,
  (req, res, next) => {
    console.log("🔍 Step 1: Basic request validation");

    // Basic body validation
    if (!req.body) {
      console.log("❌ No request body found");
      return res.status(400).json({
        success: false,
        error: "Request body is required",
      });
    }

    if (!req.body.repoUrl) {
      console.log("❌ No repoUrl in request body");
      return res.status(400).json({
        success: false,
        error: "repoUrl is required",
      });
    }

    console.log("✅ Basic validation passed");
    next();
  },
  (req, res, next) => {
    console.log("🔍 Step 2: URL validation");

    // Simple URL validation
    const repoUrl = req.body.repoUrl.trim();
    const githubPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = repoUrl.match(githubPattern);

    if (!match) {
      console.log("❌ Invalid GitHub URL format");
      return res.status(400).json({
        success: false,
        error: "Invalid GitHub URL format",
      });
    }

    req.validatedRepo = {
      owner: match[1],
      repo: match[2].replace(/\.git$/, ""),
      url: repoUrl,
    };

    console.log("✅ URL validation passed:", req.validatedRepo);
    next();
  },
  async (req, res) => {
    try {
      console.log("🔍 Step 3: Starting analysis...");
      const { owner, repo } = req.validatedRepo;

      // Initialize analyzers
      const readmeAnalyzer = new ReadmeAnalyzer();
      const dependencyAnalyzer = new DependencyAnalyzer();
      const codeSmellScanner = new CodeSmellScanner();
      const githubApiAnalyzer = new GitHubApiAnalyzer();

      // Perform README analysis
      console.log("📄 Analyzing README...");
      let readmeAnalysis;
      try {
        readmeAnalysis = await readmeAnalyzer.analyzeFromGithub(owner, repo);
        console.log(
          `✅ README analysis completed. Score: ${
            readmeAnalysis.overallScore || 0
          }/100`
        );
      } catch (error) {
        console.warn(`⚠️  README analysis failed: ${error.message}`);
        readmeAnalysis = {
          repository: `${owner}/${repo}`,
          exists: false,
          overallScore: 0,
          sections: {},
          badges: {},
          recommendations: [
            {
              type: "error",
              priority: "medium",
              message: "README analysis failed",
              suggestion: error.message,
            },
          ],
          error: error.message,
        };
      }

      // Perform dependency analysis
      console.log("📦 Analyzing dependencies...");
      let dependencyAnalysis;
      try {
        dependencyAnalysis = await dependencyAnalyzer.analyzeFromGithub(
          owner,
          repo
        );
        console.log(
          `✅ Dependency analysis completed. ${
            dependencyAnalysis.summary?.totalDependencies || 0
          } dependencies analyzed`
        );
      } catch (error) {
        console.warn(`⚠️  Dependency analysis failed: ${error.message}`);
        dependencyAnalysis = {
          repository: `${owner}/${repo}`,
          production: { type: "production", count: 0, packages: [] },
          development: { type: "development", count: 0, packages: [] },
          peer: { type: "peer", count: 0, packages: [] },
          optional: { type: "optional", count: 0, packages: [] },
          security: { vulnerabilities: [], riskScore: 0 },
          summary: {
            totalDependencies: 0,
            outdatedDependencies: 0,
            criticalIssues: 0,
            healthScore: 0,
          },
          recommendations: [
            {
              type: "error",
              priority: "medium",
              message: "Dependency analysis failed",
              suggestion: error.message,
            },
          ],
          error: error.message,
        };
      }

      // Perform code smell analysis
      console.log("🔍 Analyzing code quality...");
      let codeSmellAnalysis;
      try {
        // Set a timeout of 30 seconds for code smell analysis
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("Code analysis timeout after 30 seconds")),
            30000
          )
        );

        codeSmellAnalysis = await Promise.race([
          codeSmellScanner.analyzeFromGithub(owner, repo),
          timeoutPromise,
        ]);

        console.log(
          `✅ Code smell analysis completed. Score: ${codeSmellAnalysis.overallScore}/100`
        );
      } catch (error) {
        console.error("❌ Code smell analysis failed:", error.message);
        codeSmellAnalysis = {
          repository: `${owner}/${repo}`,
          analyzedFiles: 0,
          totalFunctions: 0,
          totalIssues: 0,
          overallScore: 60, // Default score when analysis fails
          riskDistribution: {
            CRITICAL: 0,
            HIGH: 0,
            MEDIUM: 0,
            WARNING: 0,
            SAFE: 0,
          },
          topIssues: [],
          worstFiles: [],
          recommendations: [
            {
              type: "error",
              priority: "high",
              message: "Code analysis failed",
              suggestion: error.message,
            },
          ],
          files: [],
          error: error.message,
        };
      }

      // Perform GitHub API analysis
      console.log("🔗 Analyzing GitHub metrics...");
      let githubApiAnalysis;
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(new Error("GitHub API analysis timeout after 30 seconds")),
            30000
          )
        );

        githubApiAnalysis = await Promise.race([
          githubApiAnalyzer.analyzeFromGithub(owner, repo),
          timeoutPromise,
        ]);

        console.log(
          `✅ GitHub API analysis completed. Score: ${githubApiAnalysis.score}/100`
        );
      } catch (error) {
        console.error("❌ GitHub API analysis failed:", error.message);
        githubApiAnalysis = {
          repository: `${owner}/${repo}`,
          basic: { error: error.message },
          popularity: { error: error.message },
          activity: { error: error.message },
          community: { error: error.message },
          health: { error: error.message },
          languages: { error: error.message },
          score: 60, // Default score when analysis fails
          recommendations: [
            {
              type: "error",
              priority: "high",
              message: "GitHub API analysis failed",
              suggestion: error.message,
            },
          ],
          error: error.message,
        };
      }

      // Enhanced analysis with real data
      const analysisData = {
        readinessScore: Math.round(
          (readmeAnalysis.score +
            dependencyAnalysis.summary.healthScore +
            codeSmellAnalysis.overallScore +
            githubApiAnalysis.score +
            40) /
            5
        ), // Combined score from all analyzers
        codeQuality: {
          score: codeSmellAnalysis.overallScore,
          analyzedFiles: codeSmellAnalysis.analyzedFiles,
          totalFunctions: codeSmellAnalysis.totalFunctions,
          totalIssues: codeSmellAnalysis.totalIssues,
          riskDistribution: codeSmellAnalysis.riskDistribution,
          topIssues: codeSmellAnalysis.topIssues,
          worstFiles: codeSmellAnalysis.worstFiles,
          recommendations: codeSmellAnalysis.recommendations,
          feedback:
            codeSmellAnalysis.overallScore > 80
              ? "Excellent code quality"
              : codeSmellAnalysis.overallScore > 60
              ? "Good code quality with minor issues"
              : codeSmellAnalysis.overallScore > 40
              ? "Code quality needs improvement"
              : "Critical code quality issues detected",
        },
        readmeQuality: {
          exists: readmeAnalysis.exists,
          score: readmeAnalysis.score,
          sections: readmeAnalysis.sections,
          badges: readmeAnalysis.badges,
          codeBlocks: readmeAnalysis.codeBlocks,
          links: readmeAnalysis.links,
          recommendations: readmeAnalysis.recommendations,
          feedback:
            readmeAnalysis.score > 80
              ? "Excellent documentation"
              : readmeAnalysis.score > 60
              ? "Good documentation with minor gaps"
              : readmeAnalysis.score > 40
              ? "Documentation needs improvement"
              : "Critical documentation issues detected",
        },
        dependencyHealth: {
          exists: dependencyAnalysis.exists,
          summary: dependencyAnalysis.summary,
          dependencies: dependencyAnalysis.dependencies,
          scripts: dependencyAnalysis.scripts,
          engines: dependencyAnalysis.engines,
          security: dependencyAnalysis.security,
          recommendations: dependencyAnalysis.recommendations,
          feedback:
            dependencyAnalysis.summary.healthScore > 80
              ? "Excellent dependency health"
              : dependencyAnalysis.summary.healthScore > 60
              ? "Good dependency management"
              : dependencyAnalysis.summary.healthScore > 40
              ? "Dependencies need attention"
              : "Critical dependency issues detected",
        },
        githubMetrics: {
          score: githubApiAnalysis.score,
          popularity: githubApiAnalysis.popularity,
          activity: githubApiAnalysis.activity,
          community: githubApiAnalysis.community,
          health: githubApiAnalysis.health,
          languages: githubApiAnalysis.languages,
          basic: githubApiAnalysis.basic,
          recommendations: githubApiAnalysis.recommendations,
          feedback:
            githubApiAnalysis.score > 80
              ? "Excellent GitHub metrics"
              : githubApiAnalysis.score > 60
              ? "Good repository metrics"
              : githubApiAnalysis.score > 40
              ? "Repository metrics need improvement"
              : "Poor repository metrics detected",
        },
        overallSummary: `Repository analysis complete. README: ${
          readmeAnalysis.score
        }/100, Dependencies: ${
          dependencyAnalysis.summary.healthScore
        }/100, Code Quality: ${
          codeSmellAnalysis.overallScore
        }/100, GitHub Metrics: ${githubApiAnalysis.score}/100. ${
          readmeAnalysis.recommendations.length +
          dependencyAnalysis.recommendations.length +
          codeSmellAnalysis.recommendations.length +
          githubApiAnalysis.recommendations.length
        } total recommendations.`,
        features: {
          readmeAnalysis: readmeAnalysis,
          dependencyAnalysis: dependencyAnalysis,
          codeSmellAnalysis: codeSmellAnalysis,
          githubApiAnalysis: githubApiAnalysis,
        },
      };

      // Prepare the response
      const result = {
        success: true,
        repositoryInfo: {
          url: req.body.repoUrl,
          owner,
          repo,
          totalFiles: 15,
          codeFiles: 12,
          readmeExists: true,
          totalSize: 45000,
        },
        aiAnalysis: analysisData,
        processingTime: "2.1s",
        savedToDatabase: false,
        databaseId: null,
      };

      // Try to save to database
      try {
        console.log("💾 Attempting to save to database...");

        if (!mongoose.connection.db) {
          console.log(
            "ℹ️  Database not connected - analysis will not be saved"
          );
        } else {
          console.log("💾 Database name:", mongoose.connection.db.databaseName);

          const project = new Project({
            repoName: `${owner}/${repo}`,
            repoURL: req.body.repoUrl,
            readinessScore: analysisData.readinessScore,
            codeQuality: analysisData.codeQuality,
            readmeQuality: analysisData.readmeQuality,
            overallSummary: analysisData.overallSummary,
            stats: {
              totalFiles: 15,
              codeFiles: 12,
              readmeExists: true,
              totalSize: 45000,
            },
            analysisId: `analysis_${Date.now()}`,
            processingTime: 2.1,
            aiModel: "mock",
          });

          console.log("💾 Saving project for repo:", `${owner}/${repo}`);

          const savedProject = await project.save();

          result.savedToDatabase = true;
          result.databaseId = savedProject._id;

          console.log("✅ Successfully saved to database!");
          console.log("✅ Database:", mongoose.connection.db.databaseName);
          console.log("✅ Collection: projects");
          console.log("✅ Document ID:", savedProject._id);
        }
      } catch (dbError) {
        console.error("❌ Database save failed:", dbError.message);
        console.error("❌ Full error:", dbError);
      }

      res.json(result);
    } catch (error) {
      console.error("❌ Analysis failed:", error.message);
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
);

module.exports = router;

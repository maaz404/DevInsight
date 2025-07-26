const express = require("express");
const router = express.Router();
const Project = require("../models/Project"); // Make sure this import exists
const mongoose = require("mongoose"); // Import mongoose
const RepositoryAnalyzer = require("../src/services/analyzeRepo"); // Import new analysis service
const { validateGitHubUrl } = require("../src/utils/validators"); // Import URL validator
const {
  asyncHandler,
  ValidationError,
  createResponse,
  logPerformance,
} = require("../src/utils/errorUtils"); // Import error utilities

// Simple test route first
router.get("/test", (req, res) => {
  console.log("✅ Test route accessed");
  res.json({
    success: true,
    message: "Analyze route is working",
    timestamp: new Date().toISOString(),
  });
});

// Main analyze route with new service architecture
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const startTime = Date.now();
    console.log("🔍 Starting repository analysis");

    // Validate request body
    if (!req.body || !req.body.repoUrl) {
      throw new ValidationError("Repository URL is required");
    }

    const repoUrl = req.body.repoUrl.trim();

    // Validate GitHub URL
    const urlValidation = validateGitHubUrl(repoUrl);
    if (!urlValidation.isValid) {
      throw new ValidationError(urlValidation.error);
    }

    const repoInfo = {
      owner: urlValidation.owner,
      repo: urlValidation.repo,
      url: urlValidation.normalizedUrl,
    };

    console.log("✅ URL validation passed:", repoInfo);

    try {
      // Initialize the repository analyzer
      const analyzer = new RepositoryAnalyzer();

      // Perform comprehensive analysis
      console.log("🔍 Starting comprehensive repository analysis...");
      const analysisResult = await analyzer.analyzeRepository(
        repoInfo.owner,
        repoInfo.repo
      );

      // Log performance
      const analysisTime = Date.now() - startTime;
      logPerformance("Repository Analysis", startTime, {
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        overallScore: analysisResult.scores.overall,
      });

      // Save to database
      try {
        const project = new Project({
          repoName: repoInfo.repo,
          repoURL: repoUrl,
          analysisId: `${repoInfo.owner}-${repoInfo.repo}-${Date.now()}`,
          readinessScore: analysisResult.scores.overall,
          codeQuality: analysisResult.analysis.codeQuality?.data || {},
          readmeQuality: analysisResult.analysis.readme?.data || {},
          technicalDebt: analysisResult.analysis.dependency?.data || {},
          security: analysisResult.analysis.dependency?.data?.security || {},
          overallSummary:
            analysisResult.recommendations?.insights?.join(". ") || "",
          stats: {
            owner: repoInfo.owner,
            repo: repoInfo.repo,
            overallScore: analysisResult.scores.overall,
            analyzedAt: new Date(),
            analysisTime: `${analysisTime}ms`,
          },
          analysisData: analysisResult,
          overallScore: analysisResult.scores.overall,
          lastAnalyzed: new Date(),
        });

        await project.save();
        console.log("✅ Analysis saved to database");
      } catch (dbError) {
        console.warn("⚠️ Failed to save to database:", dbError.message);
        // Continue without database save - don't fail the entire request
      }

      // Return successful response
      res.json(
        createResponse(true, analysisResult, null, {
          analysisTime: Date.now() - startTime,
          repository: {
            owner: repoInfo.owner,
            name: repoInfo.repo,
            url: repoUrl,
          },
        })
      );
    } catch (error) {
      console.error("❌ Analysis failed:", error.message);

      // Log performance even for failures
      logPerformance("Repository Analysis (Failed)", startTime, {
        owner: repoInfo.owner,
        repo: repoInfo.repo,
        error: error.message,
      });

      throw error;
    }
  })
);

module.exports = router;

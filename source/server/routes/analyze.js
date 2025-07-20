const express = require("express");
const axios = require("axios");
const router = express.Router();
const Project = require("../models/Project"); // Make sure this import exists
const mongoose = require("mongoose"); // Import mongoose

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

      // Mock analysis result
      const analysisData = {
        readinessScore: 85,
        codeQuality: {
          score: 80,
          comments: ["Well-structured code"],
          strengths: ["Good practices"],
          improvements: ["Add tests"],
        },
        readmeQuality: {
          exists: true,
          score: 90,
          feedback: "Good documentation",
        },
        overallSummary: "This is a well-maintained project",
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

const axios = require("axios");
const GitHubService = require("./githubService");
const ReadmeService = require("./readmeService");
const DependencyService = require("./dependencyService");
const CodeQualityService = require("./codeQualityService");
const { calculateWeightedScore } = require("../utils/scoringUtils");

/**
 * Enhanced Repository Analysis Service
 *
 * This service orchestrates the complete analysis of a GitHub repository
 * by coordinating different specialized services and providing comprehensive insights.
 *
 * @class RepositoryAnalyzer
 */
class RepositoryAnalyzer {
  constructor() {
    this.services = {
      github: new GitHubService(),
      readme: new ReadmeService(),
      dependency: new DependencyService(),
      codeQuality: new CodeQualityService(),
    };

    // Analysis weights for final score calculation
    this.weights = {
      readme: 0.25,
      dependencies: 0.25,
      codeQuality: 0.3,
      github: 0.2,
    };

    console.log("🔧 Repository Analyzer initialized with enhanced services");
  }

  /**
   * Main analysis method - analyzes a complete GitHub repository
   *
   * @param {string} owner - GitHub repository owner
   * @param {string} repo - GitHub repository name
   * @returns {Promise<Object>} Complete analysis results
   */
  async analyzeRepository(owner, repo) {
    const startTime = Date.now();
    console.log(`🚀 Starting comprehensive analysis for: ${owner}/${repo}`);

    try {
      console.log(`📊 Analyzing repository: ${owner}/${repo}`);

      // 2. Run all analyses in parallel for better performance
      console.log("🔄 Starting parallel analysis...");
      const [githubData, readmeData, dependencyData, codeQualityData] =
        await Promise.allSettled([
          this.services.github.analyzeRepository(owner, repo),
          this.services.readme.analyzeReadme(owner, repo),
          this.services.dependency.analyzeDependencies(owner, repo),
          this.services.codeQuality.analyzeCodeQuality(owner, repo),
        ]); // 3. Process results and handle errors gracefully
      const results = this._processAnalysisResults({
        github: githubData,
        readme: readmeData,
        dependency: dependencyData,
        codeQuality: codeQualityData,
      });

      // 4. Calculate comprehensive scores
      const scores = this._calculateScores(results);

      // 5. Generate actionable recommendations
      const recommendations = this._generateRecommendations(results, scores);

      // 6. Compile final analysis
      const analysisTime = ((Date.now() - startTime) / 1000).toFixed(1);

      const finalResult = {
        success: true,
        repositoryInfo: {
          url: `https://github.com/${owner}/${repo}`,
          owner,
          repo,
          analyzedAt: new Date().toISOString(),
          processingTime: `${analysisTime}s`,
        },
        scores,
        analysis: results,
        recommendations,
        metadata: {
          analysisVersion: "2.0",
          confidence: this._calculateConfidence(results),
          limitations: this._identifyLimitations(results),
        },
      };

      console.log(
        `✅ Analysis completed in ${analysisTime}s - Overall Score: ${scores.overall}/100`
      );
      return finalResult;
    } catch (error) {
      console.error("❌ Analysis failed:", error.message);
      throw new Error(`Repository analysis failed: ${error.message}`);
    }
  }

  /**
   * Process analysis results from all services
   * Handles both successful and failed analyses gracefully
   */
  _processAnalysisResults(rawResults) {
    const results = {};

    Object.keys(rawResults).forEach((service) => {
      const result = rawResults[service];

      if (result.status === "fulfilled") {
        results[service] = {
          success: true,
          data: result.value,
          error: null,
        };
        console.log(`✅ ${service} analysis completed successfully`);
      } else {
        results[service] = {
          success: false,
          data: this._getDefaultData(service),
          error: result.reason.message,
        };
        console.warn(`⚠️ ${service} analysis failed: ${result.reason.message}`);
      }
    });

    return results;
  }

  /**
   * Calculate comprehensive scores based on analysis results
   */
  _calculateScores(results) {
    const individualScores = {
      readme: this._extractScore(results.readme, "readme"),
      dependencies: this._extractScore(results.dependency, "dependency"),
      codeQuality: this._extractScore(results.codeQuality, "codeQuality"),
      github: this._extractScore(results.github, "github"),
    };

    // Calculate weighted overall score
    const overall = calculateWeightedScore(individualScores, this.weights);

    // Add completeness bonus (up to 10 points)
    const completenessBonus = this._calculateCompletenessBonus(results);
    const finalOverall = Math.min(100, overall + completenessBonus);

    return {
      overall: Math.round(finalOverall),
      breakdown: {
        readme: Math.round(individualScores.readme),
        dependencies: Math.round(individualScores.dependencies),
        codeQuality: Math.round(individualScores.codeQuality),
        github: Math.round(individualScores.github),
      },
      weights: this.weights,
      completenessBonus: Math.round(completenessBonus),
      confidence: this._calculateScoreConfidence(results),
    };
  }

  /**
   * Generate actionable recommendations based on analysis
   */
  _generateRecommendations(results, scores) {
    const recommendations = {
      priority: [],
      suggestions: [],
      insights: [],
    };

    // High priority recommendations (score < 40)
    if (scores.breakdown.readme < 40) {
      recommendations.priority.push({
        category: "Documentation",
        issue: "Missing or incomplete README",
        action:
          "Create comprehensive README with installation, usage, and examples",
        impact: "High",
        effort: "Medium",
      });
    }

    if (scores.breakdown.dependencies < 40) {
      recommendations.priority.push({
        category: "Security",
        issue: "Dependency vulnerabilities or missing package.json",
        action: "Audit dependencies and update vulnerable packages",
        impact: "High",
        effort: "High",
      });
    }

    // Medium priority suggestions (score 40-70)
    if (
      scores.breakdown.codeQuality >= 40 &&
      scores.breakdown.codeQuality < 70
    ) {
      recommendations.suggestions.push({
        category: "Code Quality",
        issue: "Code complexity or maintainability issues",
        action: "Refactor complex functions and improve code structure",
        impact: "Medium",
        effort: "High",
      });
    }

    if (scores.breakdown.github >= 40 && scores.breakdown.github < 70) {
      recommendations.suggestions.push({
        category: "Community",
        issue: "Low repository engagement",
        action:
          "Improve repository description, add topics, and engage with community",
        impact: "Medium",
        effort: "Low",
      });
    }

    // Strategic insights
    if (scores.overall >= 80) {
      recommendations.insights.push(
        "Excellent project quality! Consider sharing best practices with the community."
      );
    } else if (scores.overall >= 60) {
      recommendations.insights.push(
        "Good project foundation. Focus on addressing priority recommendations."
      );
    } else {
      recommendations.insights.push(
        "Project needs significant improvements across multiple areas."
      );
    }

    return recommendations;
  }

  /**
   * Extract score from service result with fallback
   */
  _extractScore(result, serviceType) {
    if (!result.success) {
      return 0; // Failed analysis gets 0 score
    }

    const data = result.data;

    switch (serviceType) {
      case "readme":
        return data.score || 0;
      case "dependency":
        return data.healthScore || 0;
      case "codeQuality":
        return data.overallScore || 0;
      case "github":
        return data.score || 0;
      default:
        return 0;
    }
  }

  /**
   * Calculate completeness bonus based on successful analyses
   */
  _calculateCompletenessBonus(results) {
    const successfulAnalyses = Object.values(results).filter(
      (r) => r.success
    ).length;
    const totalAnalyses = Object.keys(results).length;

    // Bonus: 2.5 points per successful analysis (max 10 points)
    return (successfulAnalyses / totalAnalyses) * 10;
  }

  /**
   * Calculate overall confidence in the analysis
   */
  _calculateConfidence(results) {
    const confidenceScores = [];

    Object.values(results).forEach((result) => {
      if (result.success) {
        // High confidence for successful analyses
        confidenceScores.push(result.data.confidence || 0.8);
      } else {
        // Low confidence for failed analyses
        confidenceScores.push(0.2);
      }
    });

    const avgConfidence =
      confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;
    return Math.round(avgConfidence * 100);
  }

  /**
   * Calculate confidence in scoring accuracy
   */
  _calculateScoreConfidence(results) {
    const githubSuccess = results.github.success;
    const readmeSuccess = results.readme.success;

    if (githubSuccess && readmeSuccess) {
      return "High";
    } else if (githubSuccess || readmeSuccess) {
      return "Medium";
    } else {
      return "Low";
    }
  }

  /**
   * Identify analysis limitations
   */
  _identifyLimitations(results) {
    const limitations = [];

    if (!results.github.success) {
      limitations.push(
        "GitHub API analysis failed - repository metrics may be incomplete"
      );
    }

    if (!results.dependency.success) {
      limitations.push(
        "Dependency analysis failed - security assessment unavailable"
      );
    }

    if (!results.codeQuality.success) {
      limitations.push(
        "Code quality analysis failed - complexity metrics unavailable"
      );
    }

    if (!results.readme.success) {
      limitations.push(
        "README analysis failed - documentation score may be inaccurate"
      );
    }

    return limitations;
  }

  /**
   * Get default data for failed analyses
   */
  _getDefaultData(serviceType) {
    const defaults = {
      github: {
        score: 0,
        stars: 0,
        forks: 0,
        watchers: 0,
        issues: 0,
        confidence: 0.1,
      },
      readme: {
        score: 0,
        exists: false,
        sections: 0,
        confidence: 0.1,
      },
      dependency: {
        healthScore: 0,
        vulnerabilities: "unknown",
        dependencies: 0,
        confidence: 0.1,
      },
      codeQuality: {
        overallScore: 0,
        complexity: "unknown",
        issues: "unknown",
        confidence: 0.1,
      },
    };

    return defaults[serviceType] || {};
  }
}

module.exports = RepositoryAnalyzer;

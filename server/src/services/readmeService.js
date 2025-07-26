const axios = require("axios");

/**
 * Enhanced README Analysis Service
 *
 * Analyzes README.md files for completeness, quality, and best practices.
 * Provides detailed scoring and actionable recommendations.
 *
 * @class ReadmeService
 */
class ReadmeService {
  constructor() {
    this.timeout = 15000;

    // Configure GitHub API headers
    this.headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "DevInsight-Analyzer/2.0",
    };

    // Add GitHub token if available
    this._configureAuthentication();

    // README section patterns and their importance weights
    this.sectionPatterns = [
      {
        name: "title",
        patterns: [/^#\s+.+/m],
        weight: 10,
        description: "Project title",
      },
      {
        name: "description",
        patterns: [
          /^#{1,3}\s*(description|about|overview)/im,
          /^[^#\n].{50,}/m, // Any substantial text in first paragraphs
        ],
        weight: 15,
        description: "Project description",
      },
      {
        name: "installation",
        patterns: [
          /^#{1,3}\s*(install|installation|setup|getting started)/im,
          /npm install|yarn add|pip install|go get|composer install/im,
        ],
        weight: 20,
        description: "Installation instructions",
      },
      {
        name: "usage",
        patterns: [
          /^#{1,3}\s*(usage|example|examples|how to|quick start)/im,
          /```[\s\S]*?```/m, // Code blocks indicating usage examples
        ],
        weight: 20,
        description: "Usage examples",
      },
      {
        name: "api",
        patterns: [
          /^#{1,3}\s*(api|reference|documentation)/im,
          /^#{1,3}\s*methods?/im,
        ],
        weight: 10,
        description: "API documentation",
      },
      {
        name: "contributing",
        patterns: [/^#{1,3}\s*contribut/im, /CONTRIBUTING\.md/i],
        weight: 8,
        description: "Contributing guidelines",
      },
      {
        name: "license",
        patterns: [/^#{1,3}\s*license/im, /LICENSE|MIT|Apache|GPL/i],
        weight: 7,
        description: "License information",
      },
      {
        name: "changelog",
        patterns: [/^#{1,3}\s*(changelog|changes|release)/im, /CHANGELOG\.md/i],
        weight: 5,
        description: "Changelog or release notes",
      },
      {
        name: "acknowledgments",
        patterns: [/^#{1,3}\s*(acknowledgments?|credits?|thanks)/im],
        weight: 5,
        description: "Acknowledgments or credits",
      },
    ];

    // Badge patterns for quality indicators
    this.badgePatterns = [
      {
        name: "build",
        patterns: [/!\[.*build.*\]/i, /!\[.*ci.*\]/i, /!\[.*workflow.*\]/i],
        description: "Build status",
      },
      {
        name: "coverage",
        patterns: [/!\[.*coverage.*\]/i, /!\[.*codecov.*\]/i],
        description: "Test coverage",
      },
      {
        name: "version",
        patterns: [/!\[.*version.*\]/i, /!\[.*npm.*\]/i, /!\[.*pypi.*\]/i],
        description: "Version badge",
      },
      {
        name: "license",
        patterns: [/!\[.*license.*\]/i],
        description: "License badge",
      },
      {
        name: "downloads",
        patterns: [/!\[.*download.*\]/i, /!\[.*npm.*download.*\]/i],
        description: "Download stats",
      },
      {
        name: "dependencies",
        patterns: [/!\[.*dependencies.*\]/i, /!\[.*deps.*\]/i],
        description: "Dependencies status",
      },
    ];

    // Quality indicators
    this.qualityMetrics = {
      minLength: 200, // Minimum character count for decent documentation
      goodLength: 1000, // Good documentation length
      excellentLength: 3000, // Comprehensive documentation
      codeBlockBonus: 5, // Points per code block
      linkBonus: 2, // Points per external link
      imageBonus: 3, // Points per image
      tableBonus: 5, // Points per table
    };
  }

  /**
   * Configure GitHub API authentication
   * @private
   */
  _configureAuthentication() {
    const token = process.env.GITHUB_TOKEN;

    if (token && token !== "your_github_token_here" && token.length > 10) {
      if (
        token.startsWith("ghp_") ||
        token.startsWith("gho_") ||
        token.startsWith("ghu_") ||
        token.startsWith("github_pat_")
      ) {
        this.headers["Authorization"] = `Bearer ${token}`;
      } else {
        this.headers["Authorization"] = `token ${token}`;
      }
      console.log("🔑 README Service: Authentication configured");
    } else {
      console.log(
        "⚠️ README Service: No authentication - rate limits may apply"
      );
    }
  }

  /**
   * Analyze README from GitHub repository
   *
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} README analysis results
   */
  async analyzeReadme(owner, repo) {
    console.log(`📄 README Service: Analyzing ${owner}/${repo}`);

    try {
      // Try to fetch README content
      const readmeContent = await this._fetchReadmeContent(owner, repo);

      if (!readmeContent) {
        return this._createEmptyAnalysis();
      }

      // Perform comprehensive analysis
      const analysis = await this._analyzeContent(readmeContent);

      console.log(
        `✅ README analysis completed - Score: ${analysis.score}/100`
      );
      return analysis;
    } catch (error) {
      console.error(`❌ README Service error: ${error.message}`);
      return this._createEmptyAnalysis(error.message);
    }
  }

  /**
   * Fetch README content from GitHub
   * @private
   */
  async _fetchReadmeContent(owner, repo) {
    // Try multiple README filename variations
    const readmeNames = [
      "README.md",
      "readme.md",
      "README.rst",
      "README.txt",
      "README",
    ];

    for (const filename of readmeNames) {
      try {
        // Try GitHub API first
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filename}`;
        const response = await axios.get(apiUrl, {
          headers: this.headers,
          timeout: this.timeout,
        });

        if (response.data.content) {
          const content = Buffer.from(response.data.content, "base64").toString(
            "utf8"
          );
          console.log(`📄 Found README: ${filename} (${content.length} chars)`);
          return content;
        }
      } catch (error) {
        // If API fails, try raw GitHub content
        if (filename === "README.md") {
          try {
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${filename}`;
            const rawResponse = await axios.get(rawUrl, {
              timeout: this.timeout,
            });

            if (rawResponse.data && rawResponse.data.length > 10) {
              console.log(
                `📄 Found README via raw: ${filename} (${rawResponse.data.length} chars)`
              );
              return rawResponse.data;
            }
          } catch (rawError) {
            // Try master branch as fallback
            try {
              const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/${filename}`;
              const masterResponse = await axios.get(masterUrl, {
                timeout: this.timeout,
              });

              if (masterResponse.data && masterResponse.data.length > 10) {
                console.log(
                  `📄 Found README via raw (master): ${filename} (${masterResponse.data.length} chars)`
                );
                return masterResponse.data;
              }
            } catch (masterError) {
              // Continue to next filename
            }
          }
        }
      }
    }

    console.log("⚠️ No README file found");
    return null;
  }

  /**
   * Analyze README content comprehensively
   * @private
   */
  async _analyzeContent(content) {
    const analysis = {
      exists: true,
      length: content.length,
      score: 0,
      sections: {},
      badges: {},
      quality: {},
      recommendations: [],
      confidence: 0.9,
    };

    // 1. Analyze sections (60% of score)
    const sectionScore = this._analyzeSections(content, analysis);

    // 2. Analyze badges and quality indicators (20% of score)
    const badgeScore = this._analyzeBadges(content, analysis);

    // 3. Analyze content quality (20% of score)
    const qualityScore = this._analyzeQuality(content, analysis);

    // Calculate final score
    analysis.score = Math.round(
      sectionScore * 0.6 + badgeScore * 0.2 + qualityScore * 0.2
    );

    // Generate recommendations
    analysis.recommendations = this._generateRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze README sections
   * @private
   */
  _analyzeSections(content, analysis) {
    let totalScore = 0;
    let foundSections = 0;
    const totalWeight = this.sectionPatterns.reduce(
      (sum, section) => sum + section.weight,
      0
    );

    analysis.sections.found = [];
    analysis.sections.missing = [];

    for (const section of this.sectionPatterns) {
      const isFound = section.patterns.some((pattern) => pattern.test(content));

      if (isFound) {
        totalScore += section.weight;
        foundSections++;
        analysis.sections.found.push({
          name: section.name,
          description: section.description,
          weight: section.weight,
        });
      } else {
        analysis.sections.missing.push({
          name: section.name,
          description: section.description,
          weight: section.weight,
        });
      }
    }

    analysis.sections.count = foundSections;
    analysis.sections.completeness =
      foundSections / this.sectionPatterns.length;

    return (totalScore / totalWeight) * 100;
  }

  /**
   * Analyze badges and quality indicators
   * @private
   */
  _analyzeBadges(content, analysis) {
    analysis.badges.found = [];
    analysis.badges.missing = [];

    let badgeScore = 0;
    const maxBadgeScore = this.badgePatterns.length * 10;

    for (const badge of this.badgePatterns) {
      const isFound = badge.patterns.some((pattern) => pattern.test(content));

      if (isFound) {
        badgeScore += 10;
        analysis.badges.found.push({
          name: badge.name,
          description: badge.description,
        });
      } else {
        analysis.badges.missing.push({
          name: badge.name,
          description: badge.description,
        });
      }
    }

    analysis.badges.count = analysis.badges.found.length;

    return (badgeScore / maxBadgeScore) * 100;
  }

  /**
   * Analyze content quality metrics
   * @private
   */
  _analyzeQuality(content, analysis) {
    const quality = analysis.quality;
    let qualityScore = 0;

    // Length scoring (40% of quality score)
    if (content.length >= this.qualityMetrics.excellentLength) {
      quality.lengthScore = 100;
    } else if (content.length >= this.qualityMetrics.goodLength) {
      quality.lengthScore = 80;
    } else if (content.length >= this.qualityMetrics.minLength) {
      quality.lengthScore = 60;
    } else {
      quality.lengthScore = Math.max(
        20,
        (content.length / this.qualityMetrics.minLength) * 60
      );
    }
    qualityScore += quality.lengthScore * 0.4;

    // Code blocks (20% of quality score)
    const codeBlocks = (content.match(/```[\s\S]*?```/g) || []).length;
    quality.codeBlocks = codeBlocks;
    quality.codeBlockScore = Math.min(
      100,
      codeBlocks * this.qualityMetrics.codeBlockBonus * 4
    );
    qualityScore += quality.codeBlockScore * 0.2;

    // Links (20% of quality score)
    const links = (content.match(/\[.*?\]\(.*?\)/g) || []).length;
    quality.links = links;
    quality.linkScore = Math.min(
      100,
      links * this.qualityMetrics.linkBonus * 10
    );
    qualityScore += quality.linkScore * 0.2;

    // Images (10% of quality score)
    const images = (content.match(/!\[.*?\]\(.*?\)/g) || []).length;
    quality.images = images;
    quality.imageScore = Math.min(
      100,
      images * this.qualityMetrics.imageBonus * 8
    );
    qualityScore += quality.imageScore * 0.1;

    // Tables (10% of quality score)
    const tables = (content.match(/\|.*\|/g) || []).length;
    quality.tables = Math.floor(tables / 3); // Rough table count
    quality.tableScore = Math.min(
      100,
      quality.tables * this.qualityMetrics.tableBonus * 4
    );
    qualityScore += quality.tableScore * 0.1;

    // Additional quality indicators
    quality.hasTableOfContents = /table of contents|toc/i.test(content);
    quality.hasEmojis =
      /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]/u.test(
        content
      );
    quality.hasCodeHighlighting = /```\w+/g.test(content);
    quality.hasMultipleHeaders =
      (content.match(/^#{1,6}\s/gm) || []).length > 3;

    return Math.round(qualityScore);
  }

  /**
   * Generate actionable recommendations
   * @private
   */
  _generateRecommendations(analysis) {
    const recommendations = [];

    // Missing critical sections
    const criticalSections = analysis.sections.missing.filter((s) =>
      ["installation", "usage", "description"].includes(s.name)
    );

    if (criticalSections.length > 0) {
      recommendations.push({
        type: "critical",
        category: "sections",
        message: `Add missing critical sections: ${criticalSections
          .map((s) => s.name)
          .join(", ")}`,
        impact: "high",
      });
    }

    // Length recommendations
    if (analysis.length < this.qualityMetrics.minLength) {
      recommendations.push({
        type: "important",
        category: "content",
        message:
          "README is too short. Add more detailed descriptions and examples.",
        impact: "high",
      });
    }

    // Code examples
    if (analysis.quality.codeBlocks < 2) {
      recommendations.push({
        type: "important",
        category: "examples",
        message: "Add code examples to demonstrate usage.",
        impact: "medium",
      });
    }

    // Badges
    if (analysis.badges.count === 0) {
      recommendations.push({
        type: "suggestion",
        category: "badges",
        message:
          "Consider adding badges for build status, version, and license.",
        impact: "low",
      });
    }

    // Images and visual content
    if (analysis.quality.images === 0) {
      recommendations.push({
        type: "suggestion",
        category: "visual",
        message:
          "Add screenshots or diagrams to make the README more engaging.",
        impact: "medium",
      });
    }

    // API documentation
    if (
      !analysis.sections.found.some((s) => s.name === "api") &&
      analysis.quality.codeBlocks > 0
    ) {
      recommendations.push({
        type: "suggestion",
        category: "documentation",
        message: "Consider adding API documentation section.",
        impact: "medium",
      });
    }

    return recommendations;
  }

  /**
   * Create empty analysis for repositories without README
   * @private
   */
  _createEmptyAnalysis(error = null) {
    return {
      exists: false,
      length: 0,
      score: 0,
      sections: {
        found: [],
        missing: this.sectionPatterns.map((s) => ({
          name: s.name,
          description: s.description,
          weight: s.weight,
        })),
        count: 0,
        completeness: 0,
      },
      badges: {
        found: [],
        missing: this.badgePatterns.map((b) => ({
          name: b.name,
          description: b.description,
        })),
        count: 0,
      },
      quality: {
        lengthScore: 0,
        codeBlocks: 0,
        links: 0,
        images: 0,
        tables: 0,
        hasTableOfContents: false,
        hasEmojis: false,
        hasCodeHighlighting: false,
        hasMultipleHeaders: false,
      },
      recommendations: [
        {
          type: "critical",
          category: "missing",
          message:
            "Create a README.md file with project description and usage instructions.",
          impact: "high",
        },
      ],
      error: error,
      confidence: error ? 0.1 : 0.9,
    };
  }
}

module.exports = ReadmeService;

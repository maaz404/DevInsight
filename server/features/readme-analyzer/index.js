const axios = require("axios");

/**
 * README Analyzer Feature
 * Analyzes README.md files for completeness and quality
 */
class ReadmeAnalyzer {
  constructor() {
    this.requiredSections = [
      { key: "title", patterns: [/^#\s+.+/m], weight: 15 },
      {
        key: "description",
        patterns: [/^#{1,3}\s*(description|about|overview)/im],
        weight: 15,
      },
      {
        key: "installation",
        patterns: [/^#{1,3}\s*(install|setup|getting started)/im],
        weight: 20,
      },
      {
        key: "usage",
        patterns: [/^#{1,3}\s*(usage|example|how to)/im],
        weight: 20,
      },
      {
        key: "license",
        patterns: [/^#{1,3}\s*license/im, /license/i],
        weight: 10,
      },
      { key: "contributing", patterns: [/^#{1,3}\s*contribut/im], weight: 5 },
    ];

    this.badges = [
      { key: "build", patterns: [/!\[.*build.*\]/i, /!\[.*ci.*\]/i] },
      { key: "coverage", patterns: [/!\[.*coverage.*\]/i] },
      { key: "version", patterns: [/!\[.*version.*\]/i, /!\[.*npm.*\]/i] },
      { key: "license", patterns: [/!\[.*license.*\]/i] },
      { key: "downloads", patterns: [/!\[.*download.*\]/i] },
    ];

    // Network configuration
    this.requestConfig = {
      timeout: 15000, // 15 second timeout
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "DevInsight-Analyzer",
      },
    };

    // Add GitHub token if available
    if (process.env.GITHUB_TOKEN) {
      this.requestConfig.headers[
        "Authorization"
      ] = `token ${process.env.GITHUB_TOKEN}`;
    }
  }

  /**
   * Make API request with retry logic
   */
  async makeApiRequest(url, retries = 2) {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await axios.get(url, this.requestConfig);
        return response;
      } catch (error) {
        console.warn(
          `⚠️  README API request failed (attempt ${attempt + 1}/${
            retries + 1
          }): ${error.message}`
        );

        if (attempt === retries) {
          throw error;
        }

        // Wait before retry (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
  }

  /**
   * Analyze README content from GitHub repository
   */
  async analyzeFromGithub(owner, repo) {
    try {
      // Fetch README content from GitHub API
      const readmeUrl = `https://api.github.com/repos/${owner}/${repo}/readme`;
      const response = await this.makeApiRequest(readmeUrl);

      // Decode base64 content
      const content = Buffer.from(response.data.content, "base64").toString(
        "utf-8"
      );

      return this.analyzeContent(content, response.data.name);
    } catch (error) {
      console.warn(
        `⚠️  README analysis failed for ${owner}/${repo}: ${error.message}`
      );

      // Handle different error types gracefully
      if (error.response?.status === 404) {
        return this.createEmptyAnalysis("README.md not found");
      } else if (error.response?.status === 403) {
        return this.createEmptyAnalysis(
          "GitHub API rate limit exceeded - README analysis skipped"
        );
      } else if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
        return this.createEmptyAnalysis(
          "Network timeout - README analysis skipped"
        );
      } else {
        return this.createEmptyAnalysis(
          `README analysis failed: ${error.message}`
        );
      }
    }
  }

  /**
   * Analyze README content string
   */
  analyzeContent(content, filename = "README.md") {
    const analysis = {
      filename,
      exists: true,
      length: content.length,
      sections: this.analyzeSections(content),
      badges: this.analyzeBadges(content),
      codeBlocks: this.analyzeCodeBlocks(content),
      links: this.analyzeLinks(content),
      score: 0,
      recommendations: [],
    };

    // Calculate overall score
    analysis.score = this.calculateScore(analysis);

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  /**
   * Analyze README sections
   */
  analyzeSections(content) {
    const sections = {};
    let totalWeight = 0;
    let foundWeight = 0;

    this.requiredSections.forEach((section) => {
      totalWeight += section.weight;
      const found = section.patterns.some((pattern) => pattern.test(content));

      sections[section.key] = {
        found,
        weight: section.weight,
        required: section.weight >= 15, // High-weight sections are required
      };

      if (found) {
        foundWeight += section.weight;
      }
    });

    return {
      details: sections,
      completeness: Math.round((foundWeight / totalWeight) * 100),
    };
  }

  /**
   * Analyze badges presence
   */
  analyzeBadges(content) {
    const badges = {};
    let totalBadges = this.badges.length;
    let foundBadges = 0;

    this.badges.forEach((badge) => {
      const found = badge.patterns.some((pattern) => pattern.test(content));
      badges[badge.key] = found;
      if (found) foundBadges++;
    });

    return {
      details: badges,
      count: foundBadges,
      total: totalBadges,
      coverage: Math.round((foundBadges / totalBadges) * 100),
    };
  }

  /**
   * Analyze code blocks
   */
  analyzeCodeBlocks(content) {
    const codeBlockPattern = /```[\s\S]*?```/g;
    const inlineCodePattern = /`[^`\n]+`/g;

    const codeBlocks = content.match(codeBlockPattern) || [];
    const inlineCode = content.match(inlineCodePattern) || [];

    return {
      blocks: codeBlocks.length,
      inline: inlineCode.length,
      hasExamples: codeBlocks.length > 0,
    };
  }

  /**
   * Analyze links
   */
  analyzeLinks(content) {
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const matches = [...content.matchAll(linkPattern)];

    const external = matches.filter(
      (match) => match[2].startsWith("http") && !match[2].includes("github.com")
    );

    return {
      total: matches.length,
      external: external.length,
      hasDocumentation: matches.some((match) =>
        /docs?|documentation|wiki/i.test(match[1])
      ),
    };
  }

  /**
   * Calculate overall README score
   */
  calculateScore(analysis) {
    let score = 0;

    // Sections completeness (60% of score)
    score += analysis.sections.completeness * 0.6;

    // Badges presence (15% of score)
    score += analysis.badges.coverage * 0.15;

    // Code examples (15% of score)
    if (analysis.codeBlocks.hasExamples) {
      score += 15;
    }

    // Links and documentation (10% of score)
    if (analysis.links.hasDocumentation) {
      score += 5;
    }
    if (analysis.links.external > 0) {
      score += 5;
    }

    return Math.min(Math.round(score), 100);
  }

  /**
   * Generate improvement recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    // Missing sections
    Object.entries(analysis.sections.details).forEach(([key, section]) => {
      if (!section.found && section.required) {
        recommendations.push({
          type: "section",
          priority: "high",
          message: `Add ${key} section to improve README completeness`,
          suggestion: this.getSectionSuggestion(key),
        });
      }
    });

    // Badge recommendations
    if (analysis.badges.count === 0) {
      recommendations.push({
        type: "badges",
        priority: "medium",
        message: "Add status badges to show project health",
        suggestion:
          "Consider adding build status, coverage, and version badges",
      });
    }

    // Code examples
    if (!analysis.codeBlocks.hasExamples) {
      recommendations.push({
        type: "examples",
        priority: "high",
        message: "Add code examples to help users understand usage",
        suggestion: "Include basic usage examples with code blocks",
      });
    }

    // Length check
    if (analysis.length < 500) {
      recommendations.push({
        type: "content",
        priority: "medium",
        message: "README seems too brief, consider adding more details",
        suggestion: "Expand with more comprehensive documentation",
      });
    }

    return recommendations;
  }

  /**
   * Get section-specific suggestions
   */
  getSectionSuggestion(sectionKey) {
    const suggestions = {
      title: "Add a clear project title using # heading",
      description: "Describe what your project does and why it exists",
      installation: "Provide step-by-step installation instructions",
      usage: "Show how to use your project with practical examples",
      license: "Specify the license under which your project is released",
      contributing: "Explain how others can contribute to your project",
    };

    return (
      suggestions[sectionKey] || "Add this section to improve documentation"
    );
  }

  /**
   * Create empty analysis for missing README
   */
  createEmptyAnalysis(reason) {
    return {
      filename: "README.md",
      exists: false,
      reason,
      length: 0,
      sections: { details: {}, completeness: 0 },
      badges: { details: {}, count: 0, total: 0, coverage: 0 },
      codeBlocks: { blocks: 0, inline: 0, hasExamples: false },
      links: { total: 0, external: 0, hasDocumentation: false },
      score: 0,
      recommendations: [
        {
          type: "missing",
          priority: "critical",
          message: "Create a README.md file for your project",
          suggestion:
            "A README is essential for project documentation and user adoption",
        },
      ],
    };
  }
}

module.exports = ReadmeAnalyzer;

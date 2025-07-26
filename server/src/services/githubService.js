const axios = require("axios");

/**
 * Enhanced GitHub Service
 *
 * Provides comprehensive GitHub repository analysis including:
 * - Repository statistics and metrics
 * - Community engagement analysis
 * - Development activity tracking
 * - Repository health assessment
 *
 * @class GitHubService
 */
class GitHubService {
  constructor() {
    this.baseUrl = "https://api.github.com";
    this.timeout = 15000;

    // Configure GitHub API headers with token support
    this.headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "DevInsight-Analyzer/2.0",
    };

    // Add GitHub token if available
    this._configureAuthentication();

    // Scoring thresholds based on real-world repository data
    this.thresholds = {
      stars: { excellent: 10000, good: 1000, average: 100, poor: 10 },
      forks: { excellent: 1000, good: 100, average: 10, poor: 1 },
      watchers: { excellent: 1000, good: 100, average: 10, poor: 1 },
      commits: { excellent: 1000, good: 500, average: 100, poor: 10 },
      contributors: { excellent: 50, good: 10, average: 3, poor: 1 },
      issues: { excellent: 0.1, good: 0.2, average: 0.4, poor: 0.8 }, // ratio of open/total
    };

    // Scoring weights for different aspects
    this.weights = {
      popularity: 0.3, // Stars, forks, watchers
      activity: 0.3, // Recent commits, releases
      community: 0.2, // Contributors, issue management
      health: 0.2, // Maintenance indicators
    };
  }

  /**
   * Configure GitHub API authentication
   * @private
   */
  _configureAuthentication() {
    const token = process.env.GITHUB_TOKEN;

    if (
      token &&
      token !== "your_github_token_here" &&
      token !== "your_actual_token_here" &&
      token.length > 10
    ) {
      // Support different token formats
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

      console.log("🔑 GitHub Service: Authentication configured");
      console.log(`🔑 Token type: ${token.substring(0, 8)}...`);
      this.hasValidAuth = true;
    } else {
      console.log(
        "⚠️ GitHub Service: No valid token - using unauthenticated mode with rate limits"
      );
      this.hasValidAuth = false;
    }
  }

  /**
   * Analyze a GitHub repository comprehensively
   *
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} Analysis results
   */
  async analyzeRepository(owner, repo) {
    console.log(`📊 GitHub Service: Analyzing ${owner}/${repo}`);

    try {
      // Try to fetch basic repository info even without auth
      let repoData, contributorsData, commitsData, releasesData, issuesData, languagesData;

      if (!this.hasValidAuth) {
        console.log(
          "⚠️ GitHub Service: Attempting unauthenticated analysis with rate limits"
        );
        
        // Try basic repository info without auth
        try {
          repoData = await Promise.resolve({
            status: 'fulfilled',
            value: await this._fetchRepositoryInfo(owner, repo)
          });
        } catch (error) {
          console.warn(`Could not fetch repo info: ${error.message}`);
          repoData = { status: 'rejected', reason: error };
        }

        // Set other data as rejected to use fallbacks
        contributorsData = { status: 'rejected', reason: new Error('No auth') };
        commitsData = { status: 'rejected', reason: new Error('No auth') };
        releasesData = { status: 'rejected', reason: new Error('No auth') };
        issuesData = { status: 'rejected', reason: new Error('No auth') };
        languagesData = { status: 'rejected', reason: new Error('No auth') };
      } else {
        // Fetch all data in parallel for better performance
        [
          repoData,
          contributorsData,
          commitsData,
          releasesData,
          issuesData,
          languagesData,
        ] = await Promise.allSettled([
          this._fetchRepositoryInfo(owner, repo),
          this._fetchContributors(owner, repo),
          this._fetchRecentCommits(owner, repo),
          this._fetchReleases(owner, repo),
          this._fetchIssuesInfo(owner, repo),
          this._fetchLanguages(owner, repo),
        ]);
      }

      // Process the results
      const analysis = this._processRepositoryData({
        repository: repoData,
        contributors: contributorsData,
        commits: commitsData,
        releases: releasesData,
        issues: issuesData,
        languages: languagesData,
      });

      // Calculate comprehensive score
      analysis.score = this._calculateRepositoryScore(analysis);
      analysis.confidence = this._calculateConfidence(analysis);

      console.log(
        `✅ GitHub analysis completed - Score: ${analysis.score}/100`
      );
      return analysis;
    } catch (error) {
      console.error(`❌ GitHub Service error: ${error.message}`);
      // Return fallback analysis instead of throwing
      console.log("⚠️ Falling back to minimal GitHub analysis");
      return this._createFallbackAnalysis(owner, repo, error.message);
    }
  }

  /**
   * Fetch basic repository information
   * @private
   */
  async _fetchRepositoryInfo(owner, repo) {
    const url = `${this.baseUrl}/repos/${owner}/${repo}`;
    const response = await this._makeRequest(url);
    return response.data;
  }

  /**
   * Fetch repository contributors
   * @private
   */
  async _fetchContributors(owner, repo) {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/contributors`;
    try {
      const response = await this._makeRequest(url);
      return response.data.slice(0, 100); // Limit to top 100 contributors
    } catch (error) {
      console.warn("⚠️ Contributors data unavailable");
      return [];
    }
  }

  /**
   * Fetch recent commits (last 100)
   * @private
   */
  async _fetchRecentCommits(owner, repo) {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/commits`;
    try {
      const response = await this._makeRequest(url, { per_page: 100 });
      return response.data;
    } catch (error) {
      console.warn("⚠️ Commits data unavailable");
      return [];
    }
  }

  /**
   * Fetch repository releases
   * @private
   */
  async _fetchReleases(owner, repo) {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/releases`;
    try {
      const response = await this._makeRequest(url);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Releases data unavailable");
      return [];
    }
  }

  /**
   * Fetch issues information
   * @private
   */
  async _fetchIssuesInfo(owner, repo) {
    try {
      const [openIssues, closedIssues] = await Promise.all([
        this._makeRequest(`${this.baseUrl}/repos/${owner}/${repo}/issues`, {
          state: "open",
        }),
        this._makeRequest(`${this.baseUrl}/repos/${owner}/${repo}/issues`, {
          state: "closed",
          per_page: 100,
        }),
      ]);

      return {
        open: openIssues.data,
        closed: closedIssues.data,
      };
    } catch (error) {
      console.warn("⚠️ Issues data unavailable");
      return { open: [], closed: [] };
    }
  }

  /**
   * Fetch repository languages
   * @private
   */
  async _fetchLanguages(owner, repo) {
    const url = `${this.baseUrl}/repos/${owner}/${repo}/languages`;
    try {
      const response = await this._makeRequest(url);
      return response.data;
    } catch (error) {
      console.warn("⚠️ Languages data unavailable");
      return {};
    }
  }

  /**
   * Process all repository data into structured analysis
   * @private
   */
  _processRepositoryData(rawData) {
    const repo =
      rawData.repository.status === "fulfilled"
        ? rawData.repository.value
        : null;
    const contributors =
      rawData.contributors.status === "fulfilled"
        ? rawData.contributors.value
        : [];
    const commits =
      rawData.commits.status === "fulfilled" ? rawData.commits.value : [];
    const releases =
      rawData.releases.status === "fulfilled" ? rawData.releases.value : [];
    const issues =
      rawData.issues.status === "fulfilled"
        ? rawData.issues.value
        : { open: [], closed: [] };
    const languages =
      rawData.languages.status === "fulfilled" ? rawData.languages.value : {};

    if (!repo) {
      throw new Error("Repository not found or inaccessible");
    }

    // Calculate activity metrics
    const recentCommits = this._analyzeCommitActivity(commits);
    const issueMetrics = this._analyzeIssueMetrics(issues, repo);
    const communityMetrics = this._analyzeCommunityMetrics(contributors, repo);
    const releaseMetrics = this._analyzeReleaseActivity(releases);

    return {
      basic: {
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        size: repo.size,
        language: repo.language,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
        pushedAt: repo.pushed_at,
        isPrivate: repo.private,
        isFork: repo.fork,
        hasIssues: repo.has_issues,
        hasWiki: repo.has_wiki,
        hasPages: repo.has_pages,
        license: repo.license,
        topics: repo.topics || [],
        defaultBranch: repo.default_branch,
      },
      popularity: {
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        watchers: repo.watchers_count,
        networkCount: repo.network_count || 0,
        subscribersCount: repo.subscribers_count || 0,
      },
      activity: recentCommits,
      community: communityMetrics,
      issues: issueMetrics,
      releases: releaseMetrics,
      languages: this._processLanguages(languages),
      health: {
        hasReadme: true, // Will be verified by README service
        hasLicense: !!repo.license,
        hasDescription: !!repo.description,
        hasTopics: repo.topics && repo.topics.length > 0,
        hasWiki: repo.has_wiki,
        hasIssues: repo.has_issues,
        lastActivity: repo.pushed_at,
      },
    };
  }

  /**
   * Analyze commit activity patterns
   * @private
   */
  _analyzeCommitActivity(commits) {
    if (!commits || commits.length === 0) {
      return {
        totalRecent: 0,
        averageInterval: 0,
        lastCommit: null,
        activeContributors: 0,
        commitFrequency: "inactive",
      };
    }

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const recentCommits = commits.filter(
      (commit) => new Date(commit.commit.author.date) > oneMonthAgo
    );

    const weeklyCommits = commits.filter(
      (commit) => new Date(commit.commit.author.date) > oneWeekAgo
    );

    // Calculate commit frequency
    let frequency = "inactive";
    if (weeklyCommits.length >= 5) frequency = "very-active";
    else if (weeklyCommits.length >= 2) frequency = "active";
    else if (recentCommits.length >= 5) frequency = "moderate";
    else if (recentCommits.length >= 1) frequency = "low";

    // Unique contributors in recent commits
    const uniqueContributors = new Set(
      recentCommits.map((commit) => commit.author?.login).filter(Boolean)
    ).size;

    return {
      totalRecent: recentCommits.length,
      weeklyCommits: weeklyCommits.length,
      lastCommit: commits[0]?.commit?.author?.date,
      activeContributors: uniqueContributors,
      commitFrequency: frequency,
      averageInterval: this._calculateAverageCommitInterval(
        commits.slice(0, 20)
      ),
    };
  }

  /**
   * Calculate average interval between commits
   * @private
   */
  _calculateAverageCommitInterval(commits) {
    if (commits.length < 2) return 0;

    let totalInterval = 0;
    for (let i = 0; i < commits.length - 1; i++) {
      const current = new Date(commits[i].commit.author.date);
      const next = new Date(commits[i + 1].commit.author.date);
      totalInterval += current - next;
    }

    return Math.round(
      totalInterval / (commits.length - 1) / (1000 * 60 * 60 * 24)
    ); // Days
  }

  /**
   * Analyze issue management metrics
   * @private
   */
  _analyzeIssueMetrics(issues, repo) {
    const openIssues = issues.open || [];
    const closedIssues = issues.closed || [];
    const totalIssues = openIssues.length + closedIssues.length;

    return {
      open: openIssues.length,
      closed: closedIssues.length,
      total: totalIssues,
      ratio: totalIssues > 0 ? openIssues.length / totalIssues : 0,
      responseTime: this._calculateIssueResponseTime(openIssues),
      hasIssueTemplate: false, // Would need to check .github folder
    };
  }

  /**
   * Calculate average issue response time
   * @private
   */
  _calculateIssueResponseTime(issues) {
    // This is a simplified calculation
    // In a real implementation, you'd analyze comment timestamps
    return "unknown";
  }

  /**
   * Analyze community engagement metrics
   * @private
   */
  _analyzeCommunityMetrics(contributors, repo) {
    return {
      contributors: contributors.length,
      topContributors: contributors.slice(0, 5).map((c) => ({
        login: c.login,
        contributions: c.contributions,
        avatar: c.avatar_url,
      })),
      hasMultipleContributors: contributors.length > 1,
      contributionDistribution:
        this._analyzeContributionDistribution(contributors),
    };
  }

  /**
   * Analyze how contributions are distributed among contributors
   * @private
   */
  _analyzeContributionDistribution(contributors) {
    if (contributors.length === 0) return "none";
    if (contributors.length === 1) return "single";

    const totalContributions = contributors.reduce(
      (sum, c) => sum + c.contributions,
      0
    );
    const topContributorRatio =
      contributors[0]?.contributions / totalContributions;

    if (topContributorRatio > 0.8) return "concentrated";
    if (topContributorRatio > 0.6) return "dominated";
    return "distributed";
  }

  /**
   * Analyze release activity and versioning
   * @private
   */
  _analyzeReleaseActivity(releases) {
    if (!releases || releases.length === 0) {
      return {
        total: 0,
        latest: null,
        frequency: "none",
        hasReleases: false,
      };
    }

    const now = new Date();
    const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
    const recentReleases = releases.filter(
      (r) => new Date(r.published_at) > oneYearAgo
    );

    let frequency = "none";
    if (recentReleases.length >= 12) frequency = "monthly";
    else if (recentReleases.length >= 4) frequency = "quarterly";
    else if (recentReleases.length >= 1) frequency = "yearly";

    return {
      total: releases.length,
      recentCount: recentReleases.length,
      latest: releases[0]
        ? {
            name: releases[0].name,
            tagName: releases[0].tag_name,
            publishedAt: releases[0].published_at,
            isPrerelease: releases[0].prerelease,
          }
        : null,
      frequency,
      hasReleases: releases.length > 0,
    };
  }

  /**
   * Process language statistics
   * @private
   */
  _processLanguages(languages) {
    const total = Object.values(languages).reduce(
      (sum, bytes) => sum + bytes,
      0
    );

    if (total === 0) {
      return { primary: "Unknown", distribution: {}, diversity: 0 };
    }

    const distribution = {};
    Object.entries(languages).forEach(([lang, bytes]) => {
      distribution[lang] = Math.round((bytes / total) * 100);
    });

    const languageCount = Object.keys(languages).length;
    const diversity =
      languageCount > 5 ? "high" : languageCount > 2 ? "medium" : "low";

    return {
      primary: Object.keys(languages)[0] || "Unknown",
      distribution,
      diversity,
      count: languageCount,
    };
  }

  /**
   * Calculate comprehensive repository score
   * @private
   */
  _calculateRepositoryScore(analysis) {
    const scores = {
      popularity: this._calculatePopularityScore(analysis.popularity),
      activity: this._calculateActivityScore(analysis.activity),
      community: this._calculateCommunityScore(analysis.community),
      health: this._calculateHealthScore(analysis.health),
    };

    // Weighted average
    const weightedScore = Object.keys(scores).reduce((total, key) => {
      return total + scores[key] * this.weights[key];
    }, 0);

    return Math.round(Math.min(100, Math.max(0, weightedScore)));
  }

  /**
   * Calculate popularity score based on stars, forks, watchers
   * @private
   */
  _calculatePopularityScore(popularity) {
    const starScore = this._getThresholdScore(
      popularity.stars,
      this.thresholds.stars
    );
    const forkScore = this._getThresholdScore(
      popularity.forks,
      this.thresholds.forks
    );
    const watcherScore = this._getThresholdScore(
      popularity.watchers,
      this.thresholds.watchers
    );

    return (starScore + forkScore + watcherScore) / 3;
  }

  /**
   * Calculate activity score based on recent commits and releases
   * @private
   */
  _calculateActivityScore(activity) {
    let score = 0;

    // Commit frequency scoring
    const frequencyScores = {
      "very-active": 100,
      active: 80,
      moderate: 60,
      low: 40,
      inactive: 10,
    };
    score += frequencyScores[activity.commitFrequency] || 0;

    // Recent activity bonus
    if (activity.weeklyCommits > 0) score += 10;
    if (activity.totalRecent > 10) score += 10;

    return Math.min(100, score);
  }

  /**
   * Calculate community score based on contributors and collaboration
   * @private
   */
  _calculateCommunityScore(community) {
    let score = 0;

    // Contributor count scoring
    const contributorScore = this._getThresholdScore(
      community.contributors,
      this.thresholds.contributors
    );
    score += contributorScore * 0.6;

    // Contribution distribution bonus
    const distributionScores = {
      distributed: 40,
      dominated: 25,
      concentrated: 15,
      single: 5,
      none: 0,
    };
    score += distributionScores[community.contributionDistribution] || 0;

    return Math.min(100, score);
  }

  /**
   * Calculate health score based on maintenance indicators
   * @private
   */
  _calculateHealthScore(health) {
    let score = 0;

    // Basic health indicators
    if (health.hasLicense) score += 20;
    if (health.hasDescription) score += 15;
    if (health.hasTopics) score += 10;
    if (health.hasWiki) score += 10;
    if (health.hasIssues) score += 10;

    // Recent activity
    if (health.lastActivity) {
      const daysSinceLastActivity =
        (Date.now() - new Date(health.lastActivity)) / (1000 * 60 * 60 * 24);
      if (daysSinceLastActivity < 30) score += 25;
      else if (daysSinceLastActivity < 90) score += 15;
      else if (daysSinceLastActivity < 365) score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Get score based on threshold comparison
   * @private
   */
  _getThresholdScore(value, thresholds) {
    if (value >= thresholds.excellent) return 100;
    if (value >= thresholds.good) return 80;
    if (value >= thresholds.average) return 60;
    if (value >= thresholds.poor) return 40;
    return 20;
  }

  /**
   * Calculate confidence in the analysis
   * @private
   */
  _calculateConfidence(analysis) {
    let confidence = 1.0;

    // Reduce confidence for private repositories
    if (analysis.basic.isPrivate) confidence *= 0.8;

    // Reduce confidence for very new repositories
    const ageInDays =
      (Date.now() - new Date(analysis.basic.createdAt)) / (1000 * 60 * 60 * 24);
    if (ageInDays < 30) confidence *= 0.7;

    // Reduce confidence for inactive repositories
    if (analysis.activity.commitFrequency === "inactive") confidence *= 0.6;

    return confidence;
  }

  /**
   * Make HTTP request with error handling and retries
   * @private
   */
  async _makeRequest(url, params = {}) {
    const config = {
      timeout: this.timeout,
      headers: this.headers,
      params,
    };

    try {
      return await axios.get(url, config);
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error("Repository not found");
      }
      if (error.response?.status === 403) {
        throw new Error("GitHub API rate limit exceeded or access denied");
      }
      if (error.response?.status === 401) {
        throw new Error("GitHub API authentication failed");
      }

      throw new Error(`GitHub API request failed: ${error.message}`);
    }
  }

  /**
   * Create a fallback analysis when GitHub API is unavailable
   * @private
   */
  _createFallbackAnalysis(owner, repo, errorMessage = null) {
    return {
      score: 0,
      stars: 0,
      forks: 0,
      watchers: 0,
      openIssues: 0,
      contributors: 0,
      commits: 0,
      releases: 0,
      languages: {},
      activity: {
        lastCommit: null,
        commitFrequency: "unknown",
        releaseFrequency: "unknown",
      },
      community: {
        contributorDiversity: "unknown",
        issueManagement: "unknown",
        documentation: "unknown",
      },
      health: {
        maintenance: "unknown",
        updateFrequency: "unknown",
        communityActivity: "unknown",
      },
      confidence: 0.1,
      limitations: [
        "GitHub API analysis failed - repository metrics may be incomplete",
        errorMessage
          ? `Error: ${errorMessage}`
          : "Authentication required for full analysis",
      ],
    };
  }
}

module.exports = GitHubService;

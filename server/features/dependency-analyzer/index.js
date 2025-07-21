const axios = require("axios");

/**
 * Dependency Health Check Feature
 * Analyzes package.json for outdated dependencies and security issues
 */
class DependencyAnalyzer {
  constructor() {
    this.npmRegistryBase = "https://registry.npmjs.org";
    this.securityAdvisoryBase =
      "https://registry.npmjs.org/-/npm/v1/security/audits";

    // Network configuration with timeout
    this.requestConfig = {
      timeout: 10000, // 10 second timeout per request
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

    // Risk levels for version differences
    this.riskLevels = {
      CRITICAL: { days: 365 * 2, color: "red", priority: "critical" }, // 2+ years old
      HIGH: { days: 365, color: "orange", priority: "high" }, // 1+ year old
      MEDIUM: { days: 180, color: "yellow", priority: "medium" }, // 6+ months old
      LOW: { days: 90, color: "blue", priority: "low" }, // 3+ months old
      SAFE: { days: 0, color: "green", priority: "safe" }, // Up to date
    };

    // Common vulnerability patterns
    this.vulnerabilityKeywords = [
      "security",
      "vulnerability",
      "exploit",
      "injection",
      "xss",
      "csrf",
      "prototype pollution",
      "denial of service",
      "remote code execution",
    ];
  }

  /**
   * Analyze dependencies from GitHub repository
   */
  async analyzeFromGithub(owner, repo) {
    try {
      console.log(`🔍 Fetching package.json for ${owner}/${repo}`);

      // Fetch package.json from GitHub API
      const packageUrl = `https://api.github.com/repos/${owner}/${repo}/contents/package.json`;
      const response = await axios.get(packageUrl, this.requestConfig);

      // Decode base64 content
      const content = Buffer.from(response.data.content, "base64").toString(
        "utf-8"
      );
      const packageJson = JSON.parse(content);

      return await this.analyzePackageJson(packageJson, `${owner}/${repo}`);
    } catch (error) {
      console.warn(
        `⚠️  Dependency analysis failed for ${owner}/${repo}: ${error.message}`
      );

      // Handle different error types gracefully
      if (error.response?.status === 404) {
        return this.createEmptyAnalysis("package.json not found");
      } else if (error.response?.status === 403) {
        return this.createEmptyAnalysis(
          "GitHub API rate limit exceeded - dependency analysis skipped"
        );
      } else if (error.code === "ECONNRESET" || error.code === "ETIMEDOUT") {
        return this.createEmptyAnalysis(
          "Network timeout - dependency analysis skipped"
        );
      } else {
        return this.createEmptyAnalysis(
          `Dependency analysis failed: ${error.message}`
        );
      }
    }
  }

  /**
   * Analyze package.json object
   */
  async analyzePackageJson(packageJson, repoName = "unknown") {
    console.log(`📦 Analyzing dependencies for ${repoName}`);

    const analysis = {
      packageName: packageJson.name || "unknown",
      version: packageJson.version || "0.0.0",
      repository: repoName,
      exists: true,
      dependencies: {
        production: await this.analyzeDependencyGroup(
          packageJson.dependencies || {},
          "production"
        ),
        development: await this.analyzeDependencyGroup(
          packageJson.devDependencies || {},
          "development"
        ),
        peer: await this.analyzeDependencyGroup(
          packageJson.peerDependencies || {},
          "peer"
        ),
        optional: await this.analyzeDependencyGroup(
          packageJson.optionalDependencies || {},
          "optional"
        ),
      },
      scripts: this.analyzeScripts(packageJson.scripts || {}),
      engines: this.analyzeEngines(packageJson.engines || {}),
      security: {
        vulnerabilities: [],
        riskScore: 0,
      },
      summary: {
        totalDependencies: 0,
        outdatedDependencies: 0,
        criticalIssues: 0,
        healthScore: 0,
      },
      recommendations: [],
    };

    // Calculate summary statistics
    this.calculateSummary(analysis);

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    console.log(
      `✅ Analysis complete: ${analysis.summary.totalDependencies} deps, ${analysis.summary.outdatedDependencies} outdated`
    );
    return analysis;
  }

  /**
   * Analyze a group of dependencies (prod, dev, peer, optional)
   */
  async analyzeDependencyGroup(dependencies, type) {
    const results = {
      type,
      count: Object.keys(dependencies).length,
      packages: [],
    };

    if (results.count === 0) {
      return results;
    }

    console.log(`  📋 Analyzing ${results.count} ${type} dependencies`);

    // Process dependencies in batches to avoid overwhelming the npm registry
    const dependencyEntries = Object.entries(dependencies);
    const batchSize = 5; // Smaller batch size for better reliability

    for (let i = 0; i < dependencyEntries.length; i += batchSize) {
      const batch = dependencyEntries.slice(i, i + batchSize);

      // Analyze batch with Promise.allSettled for better error handling
      const batchPromises = batch.map(async ([name, currentVersion]) => {
        try {
          const packageInfo = await this.analyzeSinglePackage(
            name,
            currentVersion
          );
          return packageInfo;
        } catch (error) {
          console.warn(`⚠️  Failed to analyze ${name}: ${error.message}`);
          return {
            name,
            currentVersion,
            status: "error",
            error: error.message,
            riskLevel: "UNKNOWN",
          };
        }
      });

      // Wait for batch to complete
      const batchResults = await Promise.allSettled(batchPromises);

      // Add all results (fulfilled and rejected)
      batchResults.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          results.packages.push(result.value);
        }
      });

      // Delay between batches to be respectful to npm registry
      if (i + batchSize < dependencyEntries.length) {
        await this.delay(200);
      }
    }

    return results;
  }

  /**
   * Analyze a single package
   */
  async analyzeSinglePackage(name, currentVersion) {
    try {
      // Fetch package info from npm registry
      const response = await axios.get(
        `${this.npmRegistryBase}/${encodeURIComponent(name)}`,
        {
          timeout: 10000, // Increased timeout
          headers: {
            "User-Agent": "DevInsight-Analyzer",
          },
        }
      );

      const packageData = response.data;
      const latestVersion = packageData["dist-tags"]?.latest;
      const versions = Object.keys(packageData.versions || {});

      // Clean version strings
      const cleanCurrent = this.cleanVersion(currentVersion);
      const cleanLatest = this.cleanVersion(latestVersion);

      // Get version dates
      const currentVersionData = packageData.versions?.[cleanCurrent];
      const latestVersionData = packageData.versions?.[cleanLatest];

      const currentDate =
        currentVersionData?.time || packageData.time?.[cleanCurrent];
      const latestDate =
        latestVersionData?.time || packageData.time?.[cleanLatest];

      // Calculate risk level
      const riskAssessment = this.assessVersionRisk(
        cleanCurrent,
        cleanLatest,
        currentDate,
        latestDate
      );

      // Check for security keywords in recent versions
      const securityIssues = this.checkSecurityIssues(
        packageData,
        cleanCurrent
      );

      return {
        name,
        currentVersion: cleanCurrent,
        latestVersion: cleanLatest,
        versionsAvailable: versions.length,
        publishedDate: currentDate,
        latestPublishedDate: latestDate,
        isOutdated: cleanCurrent !== cleanLatest,
        riskLevel: riskAssessment.level,
        riskReasons: riskAssessment.reasons,
        securityIssues,
        status: "analyzed",
        repository: packageData.repository?.url,
        description: packageData.description,
        license: packageData.license,
        maintainers: packageData.maintainers?.length || 0,
        dependencies: Object.keys(
          packageData.versions?.[cleanLatest]?.dependencies || {}
        ).length,
      };
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          name,
          currentVersion,
          status: "not_found",
          error: "Package not found in npm registry",
          riskLevel: "HIGH",
        };
      }
      throw error;
    }
  }

  /**
   * Assess version risk based on age and difference
   */
  assessVersionRisk(currentVersion, latestVersion, currentDate, latestDate) {
    const reasons = [];

    if (currentVersion !== latestVersion) {
      reasons.push("Outdated version");
    }

    if (currentDate && latestDate) {
      const currentTime = new Date(currentDate).getTime();
      const latestTime = new Date(latestDate).getTime();
      const daysDifference = Math.floor(
        (latestTime - currentTime) / (1000 * 60 * 60 * 24)
      );

      if (daysDifference > this.riskLevels.CRITICAL.days) {
        reasons.push(
          `Current version is ${Math.floor(daysDifference / 365)} years old`
        );
        return { level: "CRITICAL", reasons };
      }

      if (daysDifference > this.riskLevels.HIGH.days) {
        reasons.push(
          `Current version is ${Math.floor(daysDifference / 30)} months old`
        );
        return { level: "HIGH", reasons };
      }

      if (daysDifference > this.riskLevels.MEDIUM.days) {
        reasons.push(
          `Current version is ${Math.floor(daysDifference / 30)} months old`
        );
        return { level: "MEDIUM", reasons };
      }

      if (daysDifference > this.riskLevels.LOW.days) {
        reasons.push(`Current version is ${daysDifference} days old`);
        return { level: "LOW", reasons };
      }
    }

    if (currentVersion === latestVersion) {
      return { level: "SAFE", reasons: ["Up to date"] };
    }

    return { level: "MEDIUM", reasons };
  }

  /**
   * Check for security-related issues
   */
  checkSecurityIssues(packageData, currentVersion) {
    const issues = [];

    // Check recent version changelogs for security keywords
    const versions = Object.keys(packageData.versions || {});
    const recentVersions = versions.slice(-5); // Last 5 versions

    recentVersions.forEach((version) => {
      const versionData = packageData.versions[version];
      const changelog = versionData?.changelog || "";
      const description = versionData?.description || "";

      this.vulnerabilityKeywords.forEach((keyword) => {
        if (
          changelog.toLowerCase().includes(keyword) ||
          description.toLowerCase().includes(keyword)
        ) {
          issues.push({
            version,
            keyword,
            type: "potential_security_fix",
            message: `Version ${version} mentions "${keyword}"`,
          });
        }
      });
    });

    return issues;
  }

  /**
   * Analyze package scripts
   */
  analyzeScripts(scripts) {
    const analysis = {
      total: Object.keys(scripts).length,
      hasTest: !!scripts.test,
      hasBuild: !!(scripts.build || scripts["build:prod"]),
      hasLint: !!(scripts.lint || scripts.eslint),
      hasStart: !!scripts.start,
      hasDev: !!(scripts.dev || scripts.develop),
      customScripts: Object.keys(scripts).filter(
        (key) =>
          ![
            "test",
            "start",
            "build",
            "dev",
            "lint",
            "install",
            "postinstall",
            "preinstall",
          ].includes(key)
      ),
    };

    return analysis;
  }

  /**
   * Analyze engine requirements
   */
  analyzeEngines(engines) {
    return {
      hasNodeRequirement: !!engines.node,
      hasNpmRequirement: !!engines.npm,
      nodeVersion: engines.node,
      npmVersion: engines.npm,
      otherEngines: Object.keys(engines).filter(
        (key) => !["node", "npm"].includes(key)
      ),
    };
  }

  /**
   * Calculate summary statistics
   */
  calculateSummary(analysis) {
    let totalDeps = 0;
    let outdatedDeps = 0;
    let criticalIssues = 0;
    let riskScore = 0;

    // Count all dependencies
    Object.values(analysis.dependencies).forEach((group) => {
      totalDeps += group.count;

      group.packages.forEach((pkg) => {
        if (pkg.isOutdated) outdatedDeps++;
        if (pkg.riskLevel === "CRITICAL" || pkg.riskLevel === "HIGH")
          criticalIssues++;

        // Add to risk score
        switch (pkg.riskLevel) {
          case "CRITICAL":
            riskScore += 10;
            break;
          case "HIGH":
            riskScore += 5;
            break;
          case "MEDIUM":
            riskScore += 2;
            break;
          case "LOW":
            riskScore += 1;
            break;
        }
      });
    });

    // Calculate health score (0-100, higher is better)
    const outdatedRatio = totalDeps > 0 ? outdatedDeps / totalDeps : 0;
    const healthScore = Math.max(
      0,
      100 - outdatedRatio * 50 - Math.min(riskScore, 50)
    );

    analysis.summary = {
      totalDependencies: totalDeps,
      outdatedDependencies: outdatedDeps,
      criticalIssues,
      healthScore: Math.round(healthScore),
      riskScore: Math.min(riskScore, 100),
    };

    analysis.security.riskScore = Math.min(riskScore, 100);
  }

  /**
   * Generate improvement recommendations
   */
  generateRecommendations(analysis) {
    const recommendations = [];

    // Critical/High risk packages
    Object.values(analysis.dependencies).forEach((group) => {
      group.packages.forEach((pkg) => {
        if (pkg.riskLevel === "CRITICAL") {
          recommendations.push({
            type: "dependency",
            priority: "critical",
            package: pkg.name,
            message: `Update ${pkg.name} immediately - critical security risk`,
            suggestion: `Update from ${pkg.currentVersion} to ${pkg.latestVersion}`,
            command: `npm update ${pkg.name}`,
          });
        } else if (pkg.riskLevel === "HIGH") {
          recommendations.push({
            type: "dependency",
            priority: "high",
            package: pkg.name,
            message: `Update ${pkg.name} - high priority`,
            suggestion: `Update from ${pkg.currentVersion} to ${pkg.latestVersion}`,
            command: `npm update ${pkg.name}`,
          });
        }
      });
    });

    // Script recommendations
    if (!analysis.scripts.hasTest) {
      recommendations.push({
        type: "scripts",
        priority: "medium",
        message: "Add test script to package.json",
        suggestion: "Testing is essential for code quality and CI/CD pipelines",
      });
    }

    if (!analysis.scripts.hasLint) {
      recommendations.push({
        type: "scripts",
        priority: "low",
        message: "Add linting script for code quality",
        suggestion: "Consider adding ESLint or similar linting tools",
      });
    }

    // Engine recommendations
    if (!analysis.engines.hasNodeRequirement) {
      recommendations.push({
        type: "engines",
        priority: "low",
        message: "Specify Node.js version requirement",
        suggestion: 'Add "engines" field to ensure compatibility',
      });
    }

    // Overall health
    if (analysis.summary.healthScore < 60) {
      recommendations.push({
        type: "general",
        priority: "high",
        message: "Overall dependency health needs improvement",
        suggestion:
          "Consider updating multiple outdated packages and reviewing security",
      });
    }

    return recommendations.slice(0, 10); // Limit to top 10 recommendations
  }

  /**
   * Helper functions
   */
  cleanVersion(version) {
    if (!version) return "";
    return version.replace(/[^0-9.]/g, "").replace(/^\.+|\.+$/g, "");
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create empty analysis for missing package.json
   */
  createEmptyAnalysis(reason) {
    return {
      packageName: "unknown",
      version: "0.0.0",
      repository: "unknown",
      exists: false,
      reason,
      dependencies: {
        production: { type: "production", count: 0, packages: [] },
        development: { type: "development", count: 0, packages: [] },
        peer: { type: "peer", count: 0, packages: [] },
        optional: { type: "optional", count: 0, packages: [] },
      },
      scripts: { total: 0, hasTest: false, hasBuild: false, hasLint: false },
      engines: { hasNodeRequirement: false, hasNpmRequirement: false },
      security: { vulnerabilities: [], riskScore: 0 },
      summary: {
        totalDependencies: 0,
        outdatedDependencies: 0,
        criticalIssues: 0,
        healthScore: 0,
      },
      recommendations: [
        {
          type: "missing",
          priority: "critical",
          message: "Create a package.json file for your project",
          suggestion:
            "Package.json is essential for Node.js projects to manage dependencies",
        },
      ],
    };
  }
}

module.exports = DependencyAnalyzer;

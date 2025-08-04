const axios = require("axios");

/**
 * Enhanced Dependency Analysis Service
 *
 * Analyzes package.json and other dependency files for:
 * - Security vulnerabilities
 * - Outdated packages
 * - Dependency health and maintenance
 * - License compatibility
 * - Bundle size implications
 *
 * @class DependencyService
 */
class DependencyService {
  constructor() {
    this.timeout = 15000;

    // Configure GitHub API headers
    this.headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "DevInsight-Analyzer/2.0",
    };

    // Add GitHub token if available
    this._configureAuthentication();

    // Supported package managers and their files
    this.packageFiles = [
      { name: "package.json", type: "npm", primary: true },
      { name: "requirements.txt", type: "pip", primary: true },
      { name: "Pipfile", type: "pipenv", primary: false },
      { name: "pyproject.toml", type: "poetry", primary: false },
      { name: "Gemfile", type: "bundler", primary: true },
      { name: "composer.json", type: "composer", primary: true },
      { name: "go.mod", type: "go", primary: true },
      { name: "Cargo.toml", type: "cargo", primary: true },
      { name: "pom.xml", type: "maven", primary: true },
      { name: "build.gradle", type: "gradle", primary: true },
    ];

    // Known problematic packages (security/maintenance issues)
    this.problematicPackages = {
      npm: ["event-stream", "flatmap-stream", "eslint-scope", "getcookies"],
      pip: ["django-debug-toolbar", "pillow"],
      // Add more as needed
    };

    // Scoring weights
    this.weights = {
      security: 0.4, // Security vulnerabilities
      maintenance: 0.3, // Package maintenance and updates
      compatibility: 0.2, // License and version compatibility
      performance: 0.1, // Bundle size and performance impact
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
      console.log("🔑 Dependency Service: Authentication configured");
    } else {
      console.log(
        "⚠️ Dependency Service: No authentication - rate limits may apply"
      );
    }
  }

  /**
   * Analyze dependencies from GitHub repository
   *
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} Dependency analysis results
   */
  async analyzeDependencies(owner, repo) {
    console.log(`📦 Dependency Service: Analyzing ${owner}/${repo}`);

    try {
      // Find and analyze all package files
      const packageFiles = await this._findPackageFiles(owner, repo);

      if (packageFiles.length === 0) {
        return this._createEmptyAnalysis();
      }

      // Analyze each package file
      const analyses = await Promise.allSettled(
        packageFiles.map((file) => this._analyzePackageFile(owner, repo, file))
      );

      // Combine results
      const combinedAnalysis = this._combineAnalyses(analyses, packageFiles);

      console.log(
        `✅ Dependency analysis completed - Health Score: ${combinedAnalysis.healthScore}/100`
      );
      return combinedAnalysis;
    } catch (error) {
      console.error(`❌ Dependency Service error: ${error.message}`);
      return this._createEmptyAnalysis(error.message);
    }
  }

  /**
   * Find all package files in the repository
   * @private
   */
  async _findPackageFiles(owner, repo) {
    const foundFiles = [];

    for (const packageFile of this.packageFiles) {
      try {
        const url = `https://api.github.com/repos/${owner}/${repo}/contents/${packageFile.name}`;
        const response = await axios.get(url, {
          headers: this.headers,
          timeout: this.timeout,
        });

        if (response.data && response.data.content) {
          foundFiles.push({
            ...packageFile,
            content: Buffer.from(response.data.content, "base64").toString(
              "utf8"
            ),
            size: response.data.size,
            sha: response.data.sha,
          });
          console.log(`📦 Found ${packageFile.name} (${packageFile.type})`);
        }
      } catch (error) {
        // File doesn't exist, try raw GitHub content as fallback
        if (packageFile.primary) {
          try {
            const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${packageFile.name}`;
            const rawResponse = await axios.get(rawUrl, {
              timeout: this.timeout,
            });

            if (rawResponse.data) {
              foundFiles.push({
                ...packageFile,
                content:
                  typeof rawResponse.data === "string"
                    ? rawResponse.data
                    : JSON.stringify(rawResponse.data),
                size:
                  typeof rawResponse.data === "string"
                    ? rawResponse.data.length
                    : JSON.stringify(rawResponse.data).length,
                source: "raw",
              });
              console.log(
                `📦 Found ${packageFile.name} via raw (${packageFile.type})`
              );
            }
          } catch (rawError) {
            // Try master branch
            try {
              const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/${packageFile.name}`;
              const masterResponse = await axios.get(masterUrl, {
                timeout: this.timeout,
              });

              if (masterResponse.data) {
                foundFiles.push({
                  ...packageFile,
                  content:
                    typeof masterResponse.data === "string"
                      ? masterResponse.data
                      : JSON.stringify(masterResponse.data),
                  size:
                    typeof masterResponse.data === "string"
                      ? masterResponse.data.length
                      : JSON.stringify(masterResponse.data).length,
                  source: "raw-master",
                });
                console.log(
                  `📦 Found ${packageFile.name} via raw-master (${packageFile.type})`
                );
              }
            } catch (masterError) {
              // Continue to next file
            }
          }
        }
      }
    }

    return foundFiles;
  }

  /**
   * Analyze individual package file
   * @private
   */
  async _analyzePackageFile(owner, repo, packageFile) {
    console.log(`🔍 Analyzing ${packageFile.name} (${packageFile.type})`);

    try {
      let analysis = {
        file: packageFile.name,
        type: packageFile.type,
        size: packageFile.size,
        dependencies: {},
        devDependencies: {},
        scripts: {},
        engines: {},
        security: {},
        maintenance: {},
        compatibility: {},
        healthScore: 0,
      };

      // Parse based on file type
      switch (packageFile.type) {
        case "npm":
          analysis = await this._analyzeNpmPackage(
            packageFile.content,
            analysis
          );
          break;
        case "pip":
          analysis = await this._analyzePipPackage(
            packageFile.content,
            analysis
          );
          break;
        case "bundler":
          analysis = await this._analyzeGemfile(packageFile.content, analysis);
          break;
        case "composer":
          analysis = await this._analyzeComposerPackage(
            packageFile.content,
            analysis
          );
          break;
        case "go":
          analysis = await this._analyzeGoMod(packageFile.content, analysis);
          break;
        case "cargo":
          analysis = await this._analyzeCargoToml(
            packageFile.content,
            analysis
          );
          break;
        default:
          console.warn(`⚠️ Unsupported package type: ${packageFile.type}`);
      }

      // Calculate health score
      analysis.healthScore = this._calculateHealthScore(analysis);

      return analysis;
    } catch (error) {
      console.error(`❌ Error analyzing ${packageFile.name}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Analyze npm package.json
   * @private
   */
  async _analyzeNpmPackage(content, analysis) {
    try {
      // Ensure content is a string before parsing
      const contentStr =
        typeof content === "string" ? content : JSON.stringify(content);
      const packageJson = JSON.parse(contentStr);

      // Extract dependencies
      analysis.dependencies = packageJson.dependencies || {};
      analysis.devDependencies = packageJson.devDependencies || {};
      analysis.peerDependencies = packageJson.peerDependencies || {};
      analysis.scripts = packageJson.scripts || {};
      analysis.engines = packageJson.engines || {};

      // Count dependencies
      const depCount = Object.keys(analysis.dependencies).length;
      const devDepCount = Object.keys(analysis.devDependencies).length;
      const totalDeps = depCount + devDepCount;

      analysis.summary = {
        totalDependencies: totalDeps,
        prodDependencies: depCount,
        devDependencies: devDepCount,
        peerDependencies: Object.keys(analysis.peerDependencies).length,
        hasLockFile: false, // Would need to check for package-lock.json
        hasScripts: Object.keys(analysis.scripts).length > 0,
        hasEngines: Object.keys(analysis.engines).length > 0,
      };

      // Analyze security issues
      analysis.security = await this._analyzeNpmSecurity(
        analysis.dependencies,
        analysis.devDependencies
      );

      // Analyze maintenance
      analysis.maintenance = this._analyzeNpmMaintenance(
        packageJson,
        totalDeps
      );

      // Analyze compatibility
      analysis.compatibility = this._analyzeNpmCompatibility(
        analysis.dependencies
      );

      return analysis;
    } catch (error) {
      throw new Error(`Invalid package.json: ${error.message}`);
    }
  }

  /**
   * Analyze npm security issues
   * @private
   */
  async _analyzeNpmSecurity(dependencies, devDependencies) {
    const security = {
      vulnerabilities: 0,
      problematicPackages: [],
      outdatedPackages: [],
      securityScore: 100,
    };

    // Check for known problematic packages
    const allDeps = { ...dependencies, ...devDependencies };

    for (const [packageName, version] of Object.entries(allDeps)) {
      if (this.problematicPackages.npm.includes(packageName)) {
        security.problematicPackages.push({
          name: packageName,
          version: version,
          reason: "Known security issues",
        });
        security.vulnerabilities++;
      }

      // Check for very old versions (basic heuristic)
      if (this._isLikelyOutdated(version)) {
        security.outdatedPackages.push({
          name: packageName,
          version: version,
          reason: "Potentially outdated version",
        });
      }
    }

    // Calculate security score
    const totalPackages = Object.keys(allDeps).length;
    if (totalPackages > 0) {
      const problemRatio =
        (security.vulnerabilities + security.outdatedPackages.length) /
        totalPackages;
      security.securityScore = Math.max(0, 100 - problemRatio * 100);
    }

    return security;
  }

  /**
   * Analyze npm maintenance indicators
   * @private
   */
  _analyzeNpmMaintenance(packageJson, totalDeps) {
    const maintenance = {
      hasVersion: !!packageJson.version,
      hasDescription: !!packageJson.description,
      hasRepository: !!packageJson.repository,
      hasAuthor: !!packageJson.author,
      hasLicense: !!packageJson.license,
      hasKeywords:
        Array.isArray(packageJson.keywords) && packageJson.keywords.length > 0,
      hasHomepage: !!packageJson.homepage,
      hasBugs: !!packageJson.bugs,
      dependencyCount: totalDeps,
      maintenanceScore: 0,
    };

    // Calculate maintenance score
    let score = 0;
    if (maintenance.hasVersion) score += 15;
    if (maintenance.hasDescription) score += 15;
    if (maintenance.hasRepository) score += 15;
    if (maintenance.hasAuthor) score += 10;
    if (maintenance.hasLicense) score += 20;
    if (maintenance.hasKeywords) score += 10;
    if (maintenance.hasHomepage) score += 5;
    if (maintenance.hasBugs) score += 5;

    // Penalty for too many dependencies
    if (totalDeps > 100) score -= 20;
    else if (totalDeps > 50) score -= 10;

    maintenance.maintenanceScore = Math.max(0, score);
    return maintenance;
  }

  /**
   * Analyze npm compatibility
   * @private
   */
  _analyzeNpmCompatibility(dependencies) {
    const compatibility = {
      versionConstraints: {},
      hasConflicts: false,
      compatibilityScore: 90,
    };

    // Analyze version constraints
    for (const [packageName, version] of Object.entries(dependencies)) {
      compatibility.versionConstraints[packageName] = {
        constraint: version,
        type: this._getVersionConstraintType(version),
        strictness: this._getVersionStrictness(version),
      };
    }

    // Simple conflict detection (could be enhanced)
    const strictVersions = Object.values(
      compatibility.versionConstraints
    ).filter((v) => v.strictness === "strict").length;

    if (strictVersions > Object.keys(dependencies).length * 0.8) {
      compatibility.hasConflicts = true;
      compatibility.compatibilityScore -= 20;
    }

    return compatibility;
  }

  /**
   * Analyze pip requirements.txt
   * @private
   */
  async _analyzePipPackage(content, analysis) {
    const lines = content
      .split("\n")
      .filter((line) => line.trim() && !line.trim().startsWith("#"));

    const dependencies = {};

    for (const line of lines) {
      const match = line.match(/^([a-zA-Z0-9-_.]+)([>=<~!]*[0-9.]*)?/);
      if (match) {
        dependencies[match[1]] = match[2] || "";
      }
    }

    analysis.dependencies = dependencies;
    analysis.summary = {
      totalDependencies: Object.keys(dependencies).length,
      prodDependencies: Object.keys(dependencies).length,
      devDependencies: 0,
      hasRequirementsTxt: true,
    };

    // Basic security analysis for Python packages
    analysis.security = {
      vulnerabilities: 0,
      problematicPackages: [],
      securityScore: 90,
    };

    analysis.maintenance = {
      hasRequirements: true,
      dependencyCount: Object.keys(dependencies).length,
      maintenanceScore: 70,
    };

    analysis.compatibility = {
      compatibilityScore: 80,
    };

    return analysis;
  }

  /**
   * Analyze other package types (simplified implementations)
   * @private
   */
  async _analyzeGemfile(content, analysis) {
    // Simplified Gemfile analysis
    const gemMatches = content.match(/gem\s+['"]([^'"]+)['"]/g) || [];
    const dependencies = {};

    gemMatches.forEach((match) => {
      const gemName = match.match(/gem\s+['"]([^'"]+)['"]/)[1];
      dependencies[gemName] = "";
    });

    analysis.dependencies = dependencies;
    analysis.summary = { totalDependencies: Object.keys(dependencies).length };
    analysis.security = { securityScore: 80 };
    analysis.maintenance = { maintenanceScore: 70 };
    analysis.compatibility = { compatibilityScore: 80 };

    return analysis;
  }

  async _analyzeComposerPackage(content, analysis) {
    try {
      // Ensure content is a string before parsing
      const contentStr =
        typeof content === "string" ? content : JSON.stringify(content);
      const composer = JSON.parse(contentStr);
      analysis.dependencies = composer.require || {};
      analysis.devDependencies = composer["require-dev"] || {};
      analysis.summary = {
        totalDependencies:
          Object.keys(analysis.dependencies).length +
          Object.keys(analysis.devDependencies).length,
      };
      analysis.security = { securityScore: 80 };
      analysis.maintenance = { maintenanceScore: 75 };
      analysis.compatibility = { compatibilityScore: 85 };
    } catch (error) {
      throw new Error(`Invalid composer.json: ${error.message}`);
    }
    return analysis;
  }

  async _analyzeGoMod(content, analysis) {
    const requireMatches =
      content.match(/require\s+([^\s]+)\s+([^\s]+)/g) || [];
    const dependencies = {};

    requireMatches.forEach((match) => {
      const parts = match.match(/require\s+([^\s]+)\s+([^\s]+)/);
      if (parts) {
        dependencies[parts[1]] = parts[2];
      }
    });

    analysis.dependencies = dependencies;
    analysis.summary = { totalDependencies: Object.keys(dependencies).length };
    analysis.security = { securityScore: 85 };
    analysis.maintenance = { maintenanceScore: 80 };
    analysis.compatibility = { compatibilityScore: 90 };

    return analysis;
  }

  async _analyzeCargoToml(content, analysis) {
    // Simplified Cargo.toml analysis
    // In a real implementation, you'd use a TOML parser
    const dependencySection = content.match(/\[dependencies\]([\s\S]*?)(\[|$)/);
    const dependencies = {};

    if (dependencySection) {
      const lines = dependencySection[1].split("\n");
      lines.forEach((line) => {
        const match = line.match(/^([a-zA-Z0-9-_]+)\s*=\s*['"]([^'"]+)['"]/);
        if (match) {
          dependencies[match[1]] = match[2];
        }
      });
    }

    analysis.dependencies = dependencies;
    analysis.summary = { totalDependencies: Object.keys(dependencies).length };
    analysis.security = { securityScore: 90 };
    analysis.maintenance = { maintenanceScore: 85 };
    analysis.compatibility = { compatibilityScore: 90 };

    return analysis;
  }

  /**
   * Calculate overall health score for a package file
   * @private
   */
  _calculateHealthScore(analysis) {
    const securityScore = analysis.security.securityScore || 0;
    const maintenanceScore = analysis.maintenance.maintenanceScore || 0;
    const compatibilityScore = analysis.compatibility.compatibilityScore || 0;
    const performanceScore = 80; // Default performance score

    return Math.round(
      securityScore * this.weights.security +
        maintenanceScore * this.weights.maintenance +
        compatibilityScore * this.weights.compatibility +
        performanceScore * this.weights.performance
    );
  }

  /**
   * Combine analyses from multiple package files
   * @private
   */
  _combineAnalyses(analyses, packageFiles) {
    const successfulAnalyses = analyses
      .filter((result) => result.status === "fulfilled")
      .map((result) => result.value);

    if (successfulAnalyses.length === 0) {
      return this._createEmptyAnalysis("All package file analyses failed");
    }

    // Find primary analysis (npm > pip > others)
    const primaryAnalysis =
      successfulAnalyses.find((a) => a.type === "npm") ||
      successfulAnalyses.find((a) => a.type === "pip") ||
      successfulAnalyses[0];

    // Combine metrics
    const combined = {
      exists: true,
      packageFiles: successfulAnalyses.map((a) => ({
        file: a.file,
        type: a.type,
        healthScore: a.healthScore,
      })),
      primary: {
        type: primaryAnalysis.type,
        file: primaryAnalysis.file,
      },
      summary: primaryAnalysis.summary,
      security: primaryAnalysis.security,
      maintenance: primaryAnalysis.maintenance,
      compatibility: primaryAnalysis.compatibility,
      healthScore: this._calculateCombinedHealthScore(successfulAnalyses),
      recommendations: this._generateRecommendations(primaryAnalysis),
      confidence: 0.8,
    };

    return combined;
  }

  /**
   * Calculate combined health score from multiple analyses
   * @private
   */
  _calculateCombinedHealthScore(analyses) {
    if (analyses.length === 1) {
      return analyses[0].healthScore;
    }

    // Weight primary package manager more heavily
    const npmAnalysis = analyses.find((a) => a.type === "npm");
    if (npmAnalysis) {
      const otherScores = analyses
        .filter((a) => a.type !== "npm")
        .map((a) => a.healthScore);
      const otherAverage =
        otherScores.length > 0
          ? otherScores.reduce((sum, score) => sum + score, 0) /
            otherScores.length
          : 0;

      return Math.round(npmAnalysis.healthScore * 0.7 + otherAverage * 0.3);
    }

    // If no npm, take weighted average
    const totalScore = analyses.reduce((sum, a) => sum + a.healthScore, 0);
    return Math.round(totalScore / analyses.length);
  }

  /**
   * Generate recommendations based on analysis
   * @private
   */
  _generateRecommendations(analysis) {
    const recommendations = [];

    // Security recommendations
    if (analysis.security.vulnerabilities > 0) {
      recommendations.push({
        type: "critical",
        category: "security",
        message: `${analysis.security.vulnerabilities} security vulnerabilities detected`,
        action: "Run security audit and update vulnerable packages",
        impact: "high",
      });
    }

    if (analysis.security.outdatedPackages.length > 0) {
      recommendations.push({
        type: "important",
        category: "maintenance",
        message: `${analysis.security.outdatedPackages.length} packages may be outdated`,
        action: "Update dependencies to latest stable versions",
        impact: "medium",
      });
    }

    // Maintenance recommendations
    if (analysis.type === "npm") {
      if (!analysis.maintenance.hasLicense) {
        recommendations.push({
          type: "important",
          category: "legal",
          message: "No license specified in package.json",
          action: "Add license field to package.json",
          impact: "medium",
        });
      }

      if (!analysis.maintenance.hasDescription) {
        recommendations.push({
          type: "suggestion",
          category: "documentation",
          message: "Package description is missing",
          action: "Add description field to package.json",
          impact: "low",
        });
      }

      if (analysis.summary.totalDependencies > 100) {
        recommendations.push({
          type: "suggestion",
          category: "performance",
          message: "High number of dependencies may impact bundle size",
          action: "Review and remove unnecessary dependencies",
          impact: "medium",
        });
      }
    }

    return recommendations;
  }

  /**
   * Helper functions
   * @private
   */
  _isLikelyOutdated(version) {
    // Simple heuristic: version starting with 0.x or very old patterns
    return /^0\.|^1\.[0-5]\.|^\^0\.|~0\./.test(version);
  }

  _getVersionConstraintType(version) {
    if (version.startsWith("^")) return "caret";
    if (version.startsWith("~")) return "tilde";
    if (version.startsWith(">=")) return "gte";
    if (version.startsWith(">")) return "gt";
    if (version.startsWith("<=")) return "lte";
    if (version.startsWith("<")) return "lt";
    if (version.match(/^\d+\.\d+\.\d+$/)) return "exact";
    return "range";
  }

  _getVersionStrictness(version) {
    if (version.match(/^\d+\.\d+\.\d+$/)) return "strict";
    if (version.startsWith("~")) return "patch";
    if (version.startsWith("^")) return "minor";
    return "flexible";
  }

  /**
   * Create empty analysis for repositories without package files
   * @private
   */
  _createEmptyAnalysis(error = null) {
    return {
      exists: false,
      packageFiles: [],
      primary: null,
      summary: {
        totalDependencies: 0,
        prodDependencies: 0,
        devDependencies: 0,
      },
      security: {
        vulnerabilities: 0,
        securityScore: 0,
      },
      maintenance: {
        maintenanceScore: 0,
      },
      compatibility: {
        compatibilityScore: 0,
      },
      healthScore: 0,
      recommendations: [
        {
          type: "critical",
          category: "missing",
          message: "No package manager files found",
          action: "Add package.json or equivalent dependency file",
          impact: "high",
        },
      ],
      error: error,
      confidence: error ? 0.1 : 0.9,
    };
  }
}

module.exports = DependencyService;

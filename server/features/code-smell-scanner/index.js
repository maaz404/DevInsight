const axios = require("axios");

/**
 * Code Smell Scanner Feature
 * Analyzes code files for complexity, large functions, and quality issues
 */
class CodeSmellScanner {
  constructor() {
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

    // Code smell thresholds
    this.thresholds = {
      functionLength: {
        CRITICAL: 150, // Functions over 150 lines
        HIGH: 100, // Functions over 100 lines
        MEDIUM: 80, // Functions over 80 lines
        WARNING: 50, // Functions over 50 lines
      },
      cyclomaticComplexity: {
        CRITICAL: 20, // Extremely complex
        HIGH: 15, // Very complex
        MEDIUM: 10, // Complex
        WARNING: 6, // Moderately complex
      },
      nestingDepth: {
        CRITICAL: 6, // Deep nesting
        HIGH: 5, // High nesting
        MEDIUM: 4, // Medium nesting
        WARNING: 3, // Some nesting
      },
      duplicateLines: {
        CRITICAL: 20, // 20+ duplicate lines
        HIGH: 15, // 15+ duplicate lines
        MEDIUM: 10, // 10+ duplicate lines
        WARNING: 5, // 5+ duplicate lines
      },
    };

    // Language-specific patterns
    this.languagePatterns = {
      javascript: {
        functionDeclarations: [
          /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
          /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g,
          /let\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g,
          /var\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g,
          /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*function/g,
          /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*\(/g,
        ],
        complexityPatterns: [
          /if\s*\(/g,
          /else\s+if\s*\(/g,
          /while\s*\(/g,
          /for\s*\(/g,
          /switch\s*\(/g,
          /case\s+/g,
          /catch\s*\(/g,
          /&&/g,
          /\|\|/g,
          /\?\s*.*\s*:/g,
        ],
        nestingPatterns: [/{/g, /}/g],
        commentPatterns: [/\/\*[\s\S]*?\*\//g, /\/\/.*$/gm],
      },
      typescript: {
        functionDeclarations: [
          /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g,
          /const\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*\(/g,
          /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\([^)]*\)\s*:\s*[^=]*=>/g,
          /([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:\s*\([^)]*\)\s*=>/g,
        ],
        complexityPatterns: [
          /if\s*\(/g,
          /else\s+if\s*\(/g,
          /while\s*\(/g,
          /for\s*\(/g,
          /switch\s*\(/g,
          /case\s+/g,
          /catch\s*\(/g,
          /&&/g,
          /\|\|/g,
          /\?\s*.*\s*:/g,
        ],
        nestingPatterns: [/{/g, /}/g],
        commentPatterns: [/\/\*[\s\S]*?\*\//g, /\/\/.*$/gm],
      },
      python: {
        functionDeclarations: [
          /def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
          /async\s+def\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*\(/g,
        ],
        complexityPatterns: [
          /if\s+/g,
          /elif\s+/g,
          /while\s+/g,
          /for\s+/g,
          /except\s+/g,
          /and\s+/g,
          /or\s+/g,
        ],
        nestingPatterns: [/:\s*$/gm],
        commentPatterns: [/#.*$/gm, /"""[\s\S]*?"""/g, /'''[\s\S]*?'''/g],
      },
    };

    // Common code smells patterns
    this.codeSmells = {
      longParameterList: {
        pattern: /\([^)]{50,}\)/g,
        description: "Function has too many parameters",
        severity: "MEDIUM",
      },
      deepNesting: {
        pattern: /{\s*[\s\S]*?{\s*[\s\S]*?{\s*[\s\S]*?{\s*[\s\S]*?{/g,
        description: "Code has deep nesting levels",
        severity: "HIGH",
      },
      magicNumbers: {
        pattern: /(?<![a-zA-Z0-9_])[0-9]{2,}(?![a-zA-Z0-9_])/g,
        description: "Magic numbers should be constants",
        severity: "LOW",
      },
      todoComments: {
        pattern: /(TODO|FIXME|HACK|XXX):/gi,
        description: "Unresolved TODO/FIXME comments",
        severity: "LOW",
      },
      duplicateCode: {
        pattern: /(.{20,})\s*\n[\s\S]*?\1/g,
        description: "Potential duplicate code blocks",
        severity: "MEDIUM",
      },
    };
  }

  /**
   * Analyze code from GitHub repository
   */
  async analyzeFromGithub(owner, repo) {
    try {
      console.log(`🔍 Scanning code for ${owner}/${repo}`);

      // Get repository file tree
      const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`;
      const treeResponse = await axios.get(treeUrl, this.requestConfig);

      // Filter code files
      const codeFiles = this.filterCodeFiles(treeResponse.data.tree);
      console.log(`📁 Found ${codeFiles.length} code files to analyze`);

      // Analyze up to 20 files to avoid rate limits
      const filesToAnalyze = codeFiles.slice(0, 20);
      const fileAnalyses = [];

      for (const file of filesToAnalyze) {
        try {
          const analysis = await this.analyzeFile(owner, repo, file);
          if (analysis) {
            fileAnalyses.push(analysis);
          }

          // Small delay to avoid rate limiting
          await this.delay(200);
        } catch (error) {
          console.warn(`⚠️  Failed to analyze ${file.path}: ${error.message}`);
        }
      }

      return this.generateSummary(fileAnalyses, owner, repo);
    } catch (error) {
      console.error(`❌ Code analysis failed: ${error.message}`);
      return this.createEmptyAnalysis(
        `Failed to analyze repository: ${error.message}`
      );
    }
  }

  /**
   * Filter files to only include code files
   */
  filterCodeFiles(tree) {
    const codeExtensions = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".py",
      ".java",
      ".c",
      ".cpp",
      ".cs",
      ".php",
      ".rb",
      ".go",
      ".rs",
      ".swift",
      ".kt",
      ".scala",
      ".vue",
    ];

    return tree
      .filter(
        (item) =>
          item.type === "blob" &&
          codeExtensions.some((ext) => item.path.endsWith(ext)) &&
          !item.path.includes("node_modules") &&
          !item.path.includes(".git") &&
          !item.path.includes("dist/") &&
          !item.path.includes("build/") &&
          !item.path.includes("coverage/") &&
          item.size < 100000 // Skip very large files
      )
      .sort((a, b) => b.size - a.size); // Analyze larger files first
  }

  /**
   * Analyze a single file
   */
  async analyzeFile(owner, repo, file) {
    try {
      // Fetch file content
      const contentUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${file.path}`;
      const response = await axios.get(contentUrl, this.requestConfig);

      const content = Buffer.from(response.data.content, "base64").toString(
        "utf-8"
      );
      const language = this.detectLanguage(file.path);

      return this.analyzeFileContent(content, file.path, language, file.size);
    } catch (error) {
      console.warn(`Failed to fetch ${file.path}: ${error.message}`);
      return null;
    }
  }

  /**
   * Analyze file content for code smells
   */
  analyzeFileContent(content, filePath, language, fileSize) {
    const lines = content.split("\n");
    const analysis = {
      filePath,
      language,
      fileSize,
      lineCount: lines.length,
      functions: this.analyzeFunctions(content, language),
      codeSmells: this.detectCodeSmells(content),
      metrics: this.calculateMetrics(content, language),
      score: 0,
      issues: [],
    };

    // Calculate file score
    analysis.score = this.calculateFileScore(analysis);

    // Generate issues
    analysis.issues = this.generateFileIssues(analysis);

    return analysis;
  }

  /**
   * Analyze functions in the file
   */
  analyzeFunctions(content, language) {
    const languagePatterns = this.languagePatterns[language];
    if (!languagePatterns) return [];

    const functions = [];
    const lines = content.split("\n");

    // Find function declarations
    languagePatterns.functionDeclarations.forEach((pattern) => {
      let match;
      while ((match = pattern.exec(content)) !== null) {
        const functionName = match[1];
        const startLine = content.substring(0, match.index).split("\n").length;

        // Estimate function length (basic heuristic)
        const functionLength = this.estimateFunctionLength(
          lines,
          startLine,
          language
        );
        const complexity = this.calculateCyclomaticComplexity(
          this.extractFunctionBody(lines, startLine, functionLength),
          language
        );

        functions.push({
          name: functionName,
          startLine,
          length: functionLength,
          complexity,
          riskLevel: this.assessFunctionRisk(functionLength, complexity),
          issues: this.analyzeFunctionIssues(
            functionName,
            functionLength,
            complexity
          ),
        });
      }
    });

    return functions;
  }

  /**
   * Estimate function length (simplified)
   */
  estimateFunctionLength(lines, startLine, language) {
    let braceCount = 0;
    let functionLines = 0;
    let inFunction = false;

    for (let i = startLine; i < lines.length && i < startLine + 200; i++) {
      const line = lines[i].trim();

      if (
        !inFunction &&
        (line.includes("{") || (language === "python" && line.endsWith(":")))
      ) {
        inFunction = true;
      }

      if (inFunction) {
        functionLines++;

        if (language === "python") {
          // Python: function ends when indentation returns to original level
          if (
            i > startLine &&
            line &&
            !line.startsWith(" ") &&
            !line.startsWith("\t")
          ) {
            break;
          }
        } else {
          // Brace-based languages
          braceCount += (line.match(/{/g) || []).length;
          braceCount -= (line.match(/}/g) || []).length;

          if (braceCount <= 0 && i > startLine) {
            break;
          }
        }
      }
    }

    return Math.min(functionLines, 200);
  }

  /**
   * Extract function body
   */
  extractFunctionBody(lines, startLine, length) {
    return lines.slice(startLine, startLine + length).join("\n");
  }

  /**
   * Calculate cyclomatic complexity
   */
  calculateCyclomaticComplexity(functionBody, language) {
    const patterns = this.languagePatterns[language]?.complexityPatterns || [];
    let complexity = 1; // Base complexity

    patterns.forEach((pattern) => {
      const matches = functionBody.match(pattern) || [];
      complexity += matches.length;
    });

    return complexity;
  }

  /**
   * Assess function risk level
   */
  assessFunctionRisk(length, complexity) {
    if (
      length > this.thresholds.functionLength.CRITICAL ||
      complexity > this.thresholds.cyclomaticComplexity.CRITICAL
    ) {
      return "CRITICAL";
    }
    if (
      length > this.thresholds.functionLength.HIGH ||
      complexity > this.thresholds.cyclomaticComplexity.HIGH
    ) {
      return "HIGH";
    }
    if (
      length > this.thresholds.functionLength.MEDIUM ||
      complexity > this.thresholds.cyclomaticComplexity.MEDIUM
    ) {
      return "MEDIUM";
    }
    if (
      length > this.thresholds.functionLength.WARNING ||
      complexity > this.thresholds.cyclomaticComplexity.WARNING
    ) {
      return "WARNING";
    }
    return "SAFE";
  }

  /**
   * Analyze function-specific issues
   */
  analyzeFunctionIssues(name, length, complexity) {
    const issues = [];

    if (length > this.thresholds.functionLength.CRITICAL) {
      issues.push({
        type: "function_length",
        severity: "CRITICAL",
        message: `Function '${name}' is extremely long (${length} lines)`,
        suggestion:
          "Consider breaking this function into smaller, more focused functions",
      });
    } else if (length > this.thresholds.functionLength.HIGH) {
      issues.push({
        type: "function_length",
        severity: "HIGH",
        message: `Function '${name}' is very long (${length} lines)`,
        suggestion: "Consider refactoring into smaller functions",
      });
    }

    if (complexity > this.thresholds.cyclomaticComplexity.CRITICAL) {
      issues.push({
        type: "complexity",
        severity: "CRITICAL",
        message: `Function '${name}' has extremely high complexity (${complexity})`,
        suggestion:
          "Reduce complexity by extracting methods or simplifying logic",
      });
    } else if (complexity > this.thresholds.cyclomaticComplexity.HIGH) {
      issues.push({
        type: "complexity",
        severity: "HIGH",
        message: `Function '${name}' has high complexity (${complexity})`,
        suggestion:
          "Consider simplifying the logic or breaking down the function",
      });
    }

    return issues;
  }

  /**
   * Detect general code smells
   */
  detectCodeSmells(content) {
    const smells = [];

    Object.entries(this.codeSmells).forEach(([smellType, config]) => {
      const matches = content.match(config.pattern) || [];
      if (matches.length > 0) {
        smells.push({
          type: smellType,
          count: matches.length,
          severity: config.severity,
          description: config.description,
          examples: matches.slice(0, 3), // Show first 3 examples
        });
      }
    });

    return smells;
  }

  /**
   * Calculate file metrics
   */
  calculateMetrics(content, language) {
    const lines = content.split("\n");
    const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
    const commentLines = this.countCommentLines(content, language);

    return {
      totalLines: lines.length,
      codeLines: nonEmptyLines.length - commentLines,
      commentLines,
      commentRatio: commentLines / Math.max(nonEmptyLines.length, 1),
      averageLineLength:
        nonEmptyLines.reduce((sum, line) => sum + line.length, 0) /
        Math.max(nonEmptyLines.length, 1),
      longestLine: Math.max(...lines.map((line) => line.length)),
    };
  }

  /**
   * Count comment lines
   */
  countCommentLines(content, language) {
    const patterns = this.languagePatterns[language]?.commentPatterns || [];
    let commentLines = 0;

    patterns.forEach((pattern) => {
      const matches = content.match(pattern) || [];
      matches.forEach((match) => {
        commentLines += match.split("\n").length;
      });
    });

    return commentLines;
  }

  /**
   * Calculate file score (0-100, higher is better)
   */
  calculateFileScore(analysis) {
    let score = 100;

    // Penalize for long functions
    analysis.functions.forEach((func) => {
      switch (func.riskLevel) {
        case "CRITICAL":
          score -= 20;
          break;
        case "HIGH":
          score -= 10;
          break;
        case "MEDIUM":
          score -= 5;
          break;
        case "WARNING":
          score -= 2;
          break;
      }
    });

    // Penalize for code smells
    analysis.codeSmells.forEach((smell) => {
      switch (smell.severity) {
        case "CRITICAL":
          score -= smell.count * 5;
          break;
        case "HIGH":
          score -= smell.count * 3;
          break;
        case "MEDIUM":
          score -= smell.count * 2;
          break;
        case "LOW":
          score -= smell.count * 1;
          break;
      }
    });

    // Bonus for good comment ratio
    if (analysis.metrics.commentRatio > 0.1) {
      score += 5;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Generate file issues
   */
  generateFileIssues(analysis) {
    const issues = [];

    // Collect function issues
    analysis.functions.forEach((func) => {
      issues.push(...func.issues);
    });

    // Add code smell issues
    analysis.codeSmells.forEach((smell) => {
      if (smell.severity === "CRITICAL" || smell.severity === "HIGH") {
        issues.push({
          type: smell.type,
          severity: smell.severity,
          message: `${smell.description} (${smell.count} occurrences)`,
          suggestion: this.getCodeSmellSuggestion(smell.type),
        });
      }
    });

    // File-level issues
    if (analysis.lineCount > 500) {
      issues.push({
        type: "file_length",
        severity: "MEDIUM",
        message: `File is very long (${analysis.lineCount} lines)`,
        suggestion: "Consider splitting this file into smaller modules",
      });
    }

    if (analysis.metrics.commentRatio < 0.05) {
      issues.push({
        type: "low_comments",
        severity: "LOW",
        message: "File has very few comments",
        suggestion: "Add comments to explain complex logic and functions",
      });
    }

    return issues;
  }

  /**
   * Get suggestion for code smell type
   */
  getCodeSmellSuggestion(smellType) {
    const suggestions = {
      longParameterList:
        "Consider using parameter objects or configuration objects",
      deepNesting:
        "Extract nested logic into separate functions or use early returns",
      magicNumbers: "Replace magic numbers with named constants",
      todoComments:
        "Resolve outstanding TODO/FIXME items or create issues for them",
      duplicateCode:
        "Extract duplicate code into reusable functions or modules",
    };

    return suggestions[smellType] || "Review and refactor this code pattern";
  }

  /**
   * Generate overall analysis summary
   */
  generateSummary(fileAnalyses, owner, repo) {
    const summary = {
      repository: `${owner}/${repo}`,
      analyzedFiles: fileAnalyses.length,
      totalFunctions: 0,
      totalIssues: 0,
      overallScore: 0,
      riskDistribution: {
        CRITICAL: 0,
        HIGH: 0,
        MEDIUM: 0,
        WARNING: 0,
        SAFE: 0,
      },
      topIssues: [],
      worstFiles: [],
      recommendations: [],
      files: fileAnalyses,
    };

    // Calculate totals
    fileAnalyses.forEach((file) => {
      summary.totalFunctions += file.functions.length;
      summary.totalIssues += file.issues.length;

      file.functions.forEach((func) => {
        summary.riskDistribution[func.riskLevel]++;
      });
    });

    // Calculate overall score
    const scores = fileAnalyses.map((f) => f.score);
    summary.overallScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    // Find worst files
    summary.worstFiles = fileAnalyses
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .map((file) => ({
        path: file.filePath,
        score: file.score,
        issues: file.issues.length,
        functions: file.functions.length,
      }));

    // Collect top issues
    const allIssues = fileAnalyses.flatMap((file) =>
      file.issues.map((issue) => ({ ...issue, file: file.filePath }))
    );

    summary.topIssues = allIssues
      .filter(
        (issue) => issue.severity === "CRITICAL" || issue.severity === "HIGH"
      )
      .slice(0, 10);

    // Generate recommendations
    summary.recommendations = this.generateRecommendations(summary);

    return summary;
  }

  /**
   * Generate improvement recommendations
   */
  generateRecommendations(summary) {
    const recommendations = [];

    if (summary.riskDistribution.CRITICAL > 0) {
      recommendations.push({
        type: "critical_functions",
        priority: "critical",
        message: `${summary.riskDistribution.CRITICAL} functions have critical complexity issues`,
        suggestion:
          "Immediately refactor the most complex functions to reduce risk",
      });
    }

    if (summary.riskDistribution.HIGH > 5) {
      recommendations.push({
        type: "high_complexity",
        priority: "high",
        message: `${summary.riskDistribution.HIGH} functions have high complexity`,
        suggestion: "Plan refactoring sessions to break down complex functions",
      });
    }

    if (summary.overallScore < 60) {
      recommendations.push({
        type: "code_quality",
        priority: "high",
        message: "Overall code quality score is low",
        suggestion:
          "Implement code review processes and refactoring guidelines",
      });
    }

    if (summary.totalIssues > summary.totalFunctions * 0.5) {
      recommendations.push({
        type: "code_smells",
        priority: "medium",
        message: "High number of code smells detected",
        suggestion: "Set up linting tools and code quality gates in CI/CD",
      });
    }

    return recommendations.slice(0, 8);
  }

  /**
   * Detect programming language from file extension
   */
  detectLanguage(filePath) {
    const extension = filePath.split(".").pop().toLowerCase();
    const languageMap = {
      js: "javascript",
      jsx: "javascript",
      ts: "typescript",
      tsx: "typescript",
      py: "python",
      java: "java",
      c: "c",
      cpp: "cpp",
      cs: "csharp",
      php: "php",
      rb: "ruby",
      go: "go",
      rs: "rust",
      swift: "swift",
      kt: "kotlin",
    };

    return languageMap[extension] || "unknown";
  }

  /**
   * Helper delay function
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create empty analysis for errors
   */
  createEmptyAnalysis(reason) {
    return {
      repository: "unknown",
      analyzedFiles: 0,
      totalFunctions: 0,
      totalIssues: 0,
      overallScore: 0,
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
          priority: "critical",
          message: "Code analysis failed",
          suggestion: reason,
        },
      ],
      files: [],
      error: reason,
    };
  }
}

module.exports = CodeSmellScanner;

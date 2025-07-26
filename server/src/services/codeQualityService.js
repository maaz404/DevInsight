const axios = require("axios");

/**
 * Enhanced Code Quality Analysis Service
 *
 * Analyzes source code for:
 * - Code complexity and maintainability
 * - Code smells and anti-patterns
 * - Test coverage indicators
 * - Documentation quality
 * - Architectural patterns
 *
 * @class CodeQualityService
 */
class CodeQualityService {
  constructor() {
    this.timeout = 15000;

    // Configure GitHub API headers
    this.headers = {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "DevInsight-Analyzer/2.0",
    };

    // Add GitHub token if available
    this._configureAuthentication();

    // File extensions to analyze by language
    this.supportedLanguages = {
      javascript: [".js", ".jsx", ".ts", ".tsx", ".mjs"],
      python: [".py", ".pyi", ".pyw"],
      java: [".java"],
      csharp: [".cs"],
      cpp: [".cpp", ".cc", ".cxx", ".h", ".hpp"],
      go: [".go"],
      rust: [".rs"],
      php: [".php"],
      ruby: [".rb"],
      swift: [".swift"],
      kotlin: [".kt", ".kts"],
    };

    // Code smell patterns (simplified heuristics)
    this.codeSmells = {
      javascript: {
        longFunction: /function[^{]*{[^}]{500,}}/g,
        magicNumbers: /\b(?<![\w.])[0-9]{2,}\b(?![\w.])/g,
        todoComments: /\/\/\s*(TODO|FIXME|HACK|XXX)/gi,
        consoleLog: /console\.log\(/g,
        varDeclaration: /\bvar\b/g,
        emptyFunctions: /function[^{]*{\s*}/g,
      },
      python: {
        longFunction: /def\s+\w+[^:]*:[\s\S]{800,}?(?=\n(?:def|class|\Z))/g,
        magicNumbers: /\b(?<![\w.])[0-9]{2,}\b(?![\w.])/g,
        todoComments: /#\s*(TODO|FIXME|HACK|XXX)/gi,
        printStatements: /print\(/g,
        broadExcept: /except:/g,
      },
      java: {
        longFunction:
          /(?:public|private|protected)[\s\w]*\([^)]*\)\s*{[^}]{800,}}/g,
        magicNumbers: /\b(?<![\w.])[0-9]{2,}\b(?![\w.])/g,
        todoComments: /\/\/\s*(TODO|FIXME|HACK|XXX)/gi,
        systemOut: /System\.out\.print/g,
      },
    };

    // Quality thresholds
    this.thresholds = {
      maxFileSize: 1000, // Lines per file
      maxFunctionSize: 50, // Lines per function
      maxComplexity: 10, // Cyclomatic complexity
      minTestCoverage: 70, // Percentage
      maxCodeSmells: 5, // Per file
    };

    // Scoring weights
    this.weights = {
      complexity: 0.3,
      maintainability: 0.25,
      testability: 0.25,
      documentation: 0.2,
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
      console.log("🔑 Code Quality Service: Authentication configured");
    } else {
      console.log(
        "⚠️ Code Quality Service: No authentication - rate limits may apply"
      );
    }
  }

  /**
   * Analyze code quality from GitHub repository
   *
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} Code quality analysis results
   */
  async analyzeCodeQuality(owner, repo) {
    console.log(`🐛 Code Quality Service: Analyzing ${owner}/${repo}`);

    try {
      // Get repository file tree
      const fileTree = await this._getRepositoryFileTree(owner, repo);

      if (!fileTree || fileTree.length === 0) {
        return this._createEmptyAnalysis("No files found in repository");
      }

      // Filter and categorize code files
      const codeFiles = this._filterCodeFiles(fileTree);

      if (codeFiles.length === 0) {
        return this._createEmptyAnalysis("No source code files found");
      }

      // Analyze code files (limit to prevent rate limiting)
      const filesToAnalyze = codeFiles.slice(0, 50);
      const analyses = await this._analyzeFiles(owner, repo, filesToAnalyze);

      // Combine results and calculate scores
      const combinedAnalysis = this._combineAnalyses(analyses, codeFiles);

      console.log(
        `✅ Code quality analysis completed - Score: ${combinedAnalysis.overallScore}/100`
      );
      return combinedAnalysis;
    } catch (error) {
      console.error(`❌ Code Quality Service error: ${error.message}`);
      return this._createEmptyAnalysis(error.message);
    }
  }

  /**
   * Get repository file tree from GitHub API
   * @private
   */
  async _getRepositoryFileTree(owner, repo) {
    try {
      // Get default branch first
      const repoUrl = `https://api.github.com/repos/${owner}/${repo}`;
      const repoResponse = await axios.get(repoUrl, {
        headers: this.headers,
        timeout: this.timeout,
      });

      const defaultBranch = repoResponse.data.default_branch || "main";

      // Get file tree
      const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
      const treeResponse = await axios.get(treeUrl, {
        headers: this.headers,
        timeout: this.timeout,
      });

      return treeResponse.data.tree || [];
    } catch (error) {
      console.warn(`⚠️ Could not fetch file tree: ${error.message}`);
      return [];
    }
  }

  /**
   * Filter files to only include source code files
   * @private
   */
  _filterCodeFiles(fileTree) {
    const codeFiles = [];

    for (const file of fileTree) {
      if (file.type !== "blob") continue;

      const path = file.path;
      const extension = this._getFileExtension(path);
      const language = this._detectLanguage(extension);

      if (language && !this._isIgnoredPath(path)) {
        codeFiles.push({
          path,
          size: file.size || 0,
          sha: file.sha,
          extension,
          language,
          url: file.url,
        });
      }
    }

    return codeFiles.sort((a, b) => b.size - a.size); // Sort by size, largest first
  }

  /**
   * Analyze multiple files
   * @private
   */
  async _analyzeFiles(owner, repo, files) {
    const analyses = [];
    const batchSize = 10; // Process in batches to avoid rate limits

    console.log(`🔍 Analyzing ${files.length} code files...`);

    for (let i = 0; i < files.length; i += batchSize) {
      const batch = files.slice(i, i + batchSize);

      const batchPromises = batch.map(async (file) => {
        try {
          return await this._analyzeSingleFile(owner, repo, file);
        } catch (error) {
          console.warn(`⚠️ Failed to analyze ${file.path}: ${error.message}`);
          return this._createEmptyFileAnalysis(file, error.message);
        }
      });

      const batchResults = await Promise.allSettled(batchPromises);
      const successfulResults = batchResults
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value);

      analyses.push(...successfulResults);

      // Small delay between batches
      if (i + batchSize < files.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    return analyses;
  }

  /**
   * Analyze a single file
   * @private
   */
  async _analyzeSingleFile(owner, repo, file) {
    // Fetch file content
    const content = await this._fetchFileContent(owner, repo, file);

    if (!content) {
      return this._createEmptyFileAnalysis(
        file,
        "Could not fetch file content"
      );
    }

    const analysis = {
      file: file.path,
      language: file.language,
      size: file.size,
      lines: content.split("\n").length,
      characters: content.length,
      complexity: {},
      maintainability: {},
      smells: {},
      documentation: {},
      score: 0,
    };

    // Analyze based on language
    analysis.complexity = this._analyzeComplexity(content, file.language);
    analysis.maintainability = this._analyzeMaintainability(
      content,
      file.language
    );
    analysis.smells = this._analyzeCodeSmells(content, file.language);
    analysis.documentation = this._analyzeDocumentation(content, file.language);

    // Calculate file score
    analysis.score = this._calculateFileScore(analysis);

    return analysis;
  }

  /**
   * Fetch file content from GitHub
   * @private
   */
  async _fetchFileContent(owner, repo, file) {
    try {
      // Try GitHub API first
      if (file.url) {
        const response = await axios.get(file.url, {
          headers: this.headers,
          timeout: this.timeout,
        });

        if (response.data && response.data.content) {
          return Buffer.from(response.data.content, "base64").toString("utf8");
        }
      }

      // Fallback to raw GitHub content
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/${file.path}`;
      const rawResponse = await axios.get(rawUrl, {
        timeout: this.timeout,
        maxContentLength: 500000, // 500KB limit
      });

      return rawResponse.data;
    } catch (error) {
      // Try master branch as fallback
      try {
        const masterUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/${file.path}`;
        const masterResponse = await axios.get(masterUrl, {
          timeout: this.timeout,
          maxContentLength: 500000,
        });
        return masterResponse.data;
      } catch (masterError) {
        throw new Error(`Could not fetch file content: ${error.message}`);
      }
    }
  }

  /**
   * Analyze code complexity
   * @private
   */
  _analyzeComplexity(content, language) {
    const lines = content.split("\n");
    const complexity = {
      lines: lines.length,
      functions: 0,
      classes: 0,
      imports: 0,
      cyclomaticComplexity: 0,
      nestingDepth: 0,
      complexityScore: 100,
    };

    // Count functions, classes, imports based on language
    switch (language) {
      case "javascript":
        complexity.functions = (
          content.match(/function\s+\w+|=>\s*{|function\s*\(/g) || []
        ).length;
        complexity.classes = (content.match(/class\s+\w+/g) || []).length;
        complexity.imports = (
          content.match(/import\s+.*from|require\s*\(/g) || []
        ).length;
        break;
      case "python":
        complexity.functions = (content.match(/def\s+\w+/g) || []).length;
        complexity.classes = (content.match(/class\s+\w+/g) || []).length;
        complexity.imports = (
          content.match(/import\s+|from\s+.*import/g) || []
        ).length;
        break;
      case "java":
        complexity.functions = (
          content.match(/(?:public|private|protected)[\s\w]*\([^)]*\)\s*{/g) ||
          []
        ).length;
        complexity.classes = (
          content.match(/(?:public\s+)?class\s+\w+/g) || []
        ).length;
        complexity.imports = (content.match(/import\s+[\w.]+;/g) || []).length;
        break;
    }

    // Calculate cyclomatic complexity (simplified)
    const complexityKeywords =
      content.match(/\b(if|else|while|for|switch|case|catch|&&|\|\|)\b/g) || [];
    complexity.cyclomaticComplexity = complexityKeywords.length + 1;

    // Calculate nesting depth (simplified)
    complexity.nestingDepth = this._calculateMaxNestingDepth(content);

    // Calculate complexity score
    let score = 100;

    // Penalize based on file size
    if (complexity.lines > this.thresholds.maxFileSize) {
      score -= Math.min(
        30,
        (complexity.lines - this.thresholds.maxFileSize) / 50
      );
    }

    // Penalize high cyclomatic complexity
    if (complexity.cyclomaticComplexity > this.thresholds.maxComplexity) {
      score -= Math.min(
        40,
        (complexity.cyclomaticComplexity - this.thresholds.maxComplexity) * 2
      );
    }

    // Penalize deep nesting
    if (complexity.nestingDepth > 4) {
      score -= (complexity.nestingDepth - 4) * 10;
    }

    complexity.complexityScore = Math.max(0, Math.round(score));
    return complexity;
  }

  /**
   * Analyze maintainability indicators
   * @private
   */
  _analyzeMaintainability(content, language) {
    const maintainability = {
      functionSize: 0,
      duplicatedCode: 0,
      cohesion: 0,
      coupling: 0,
      maintainabilityScore: 80,
    };

    // Analyze function sizes
    const functions = this._extractFunctions(content, language);
    if (functions.length > 0) {
      const avgFunctionSize =
        functions.reduce((sum, fn) => sum + fn.lines, 0) / functions.length;
      maintainability.functionSize = Math.round(avgFunctionSize);

      // Penalize large functions
      if (avgFunctionSize > this.thresholds.maxFunctionSize) {
        maintainability.maintainabilityScore -= Math.min(
          30,
          avgFunctionSize - this.thresholds.maxFunctionSize
        );
      }
    }

    // Simple duplication detection (repeated lines)
    const lines = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 10);
    const uniqueLines = new Set(lines);
    maintainability.duplicatedCode = Math.round(
      ((lines.length - uniqueLines.size) / lines.length) * 100
    );

    if (maintainability.duplicatedCode > 10) {
      maintainability.maintainabilityScore -= maintainability.duplicatedCode;
    }

    return maintainability;
  }

  /**
   * Analyze code smells
   * @private
   */
  _analyzeCodeSmells(content, language) {
    const smells = {
      longFunctions: 0,
      magicNumbers: 0,
      todoComments: 0,
      debugStatements: 0,
      smellScore: 100,
    };

    const patterns = this.codeSmells[language];
    if (!patterns) return smells;

    // Count different types of code smells
    smells.longFunctions = (content.match(patterns.longFunction) || []).length;
    smells.magicNumbers = (content.match(patterns.magicNumbers) || []).length;
    smells.todoComments = (content.match(patterns.todoComments) || []).length;

    // Debug statements (language specific)
    if (patterns.consoleLog) {
      smells.debugStatements += (
        content.match(patterns.consoleLog) || []
      ).length;
    }
    if (patterns.printStatements) {
      smells.debugStatements += (
        content.match(patterns.printStatements) || []
      ).length;
    }
    if (patterns.systemOut) {
      smells.debugStatements += (
        content.match(patterns.systemOut) || []
      ).length;
    }

    // Calculate smell score
    let totalSmells =
      smells.longFunctions +
      smells.magicNumbers +
      smells.todoComments +
      smells.debugStatements;
    smells.smellScore = Math.max(0, 100 - totalSmells * 5);

    return smells;
  }

  /**
   * Analyze documentation quality
   * @private
   */
  _analyzeDocumentation(content, language) {
    const documentation = {
      comments: 0,
      docstrings: 0,
      commentRatio: 0,
      documentationScore: 50,
    };

    const lines = content.split("\n");
    const codeLines = lines.filter(
      (line) => line.trim() && !this._isCommentLine(line, language)
    );
    const commentLines = lines.filter((line) =>
      this._isCommentLine(line, language)
    );

    documentation.comments = commentLines.length;
    documentation.commentRatio =
      codeLines.length > 0
        ? Math.round((commentLines.length / codeLines.length) * 100)
        : 0;

    // Count docstrings/JSDoc
    switch (language) {
      case "javascript":
        documentation.docstrings = (
          content.match(/\/\*\*[\s\S]*?\*\//g) || []
        ).length;
        break;
      case "python":
        documentation.docstrings = (
          content.match(/"""[\s\S]*?"""|'''[\s\S]*?'''/g) || []
        ).length;
        break;
      case "java":
        documentation.docstrings = (
          content.match(/\/\*\*[\s\S]*?\*\//g) || []
        ).length;
        break;
    }

    // Calculate documentation score
    let score = 30; // Base score

    if (documentation.commentRatio > 10) score += 30;
    else if (documentation.commentRatio > 5) score += 20;
    else if (documentation.commentRatio > 2) score += 10;

    if (documentation.docstrings > 0) score += 40;

    documentation.documentationScore = Math.min(100, score);
    return documentation;
  }

  /**
   * Calculate overall file score
   * @private
   */
  _calculateFileScore(analysis) {
    const scores = {
      complexity: analysis.complexity.complexityScore,
      maintainability: analysis.maintainability.maintainabilityScore,
      smells: analysis.smells.smellScore,
      documentation: analysis.documentation.documentationScore,
    };

    // Weighted average
    return Math.round(
      scores.complexity * this.weights.complexity +
        scores.maintainability * this.weights.maintainability +
        scores.smells * this.weights.testability + // Using smells as testability proxy
        scores.documentation * this.weights.documentation
    );
  }

  /**
   * Combine all file analyses into repository-wide metrics
   * @private
   */
  _combineAnalyses(analyses, allFiles) {
    if (analyses.length === 0) {
      return this._createEmptyAnalysis("No files could be analyzed");
    }

    // Calculate aggregate metrics
    const totalLines = analyses.reduce((sum, a) => sum + a.lines, 0);
    const totalFunctions = analyses.reduce(
      (sum, a) => sum + a.complexity.functions,
      0
    );
    const avgComplexity =
      analyses.reduce((sum, a) => sum + a.complexity.cyclomaticComplexity, 0) /
      analyses.length;
    const avgScore =
      analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;

    // Language distribution
    const languageStats = {};
    allFiles.forEach((file) => {
      languageStats[file.language] = (languageStats[file.language] || 0) + 1;
    });

    // Identify problematic files
    const problematicFiles = analyses
      .filter((a) => a.score < 60)
      .sort((a, b) => a.score - b.score)
      .slice(0, 10);

    // Calculate test coverage indicators
    const testFiles = allFiles.filter(
      (file) =>
        file.path.includes("test") ||
        file.path.includes("spec") ||
        file.path.includes("__tests__")
    );
    const testCoverageIndicator =
      allFiles.length > 0
        ? Math.round((testFiles.length / allFiles.length) * 100)
        : 0;

    return {
      overallScore: Math.round(avgScore),
      summary: {
        totalFiles: allFiles.length,
        analyzedFiles: analyses.length,
        totalLines,
        totalFunctions,
        averageComplexity: Math.round(avgComplexity),
        languageDistribution: languageStats,
        testCoverageIndicator,
      },
      complexity: {
        averageFileSize: Math.round(totalLines / analyses.length),
        averageFunctionCount: Math.round(totalFunctions / analyses.length),
        averageComplexity: Math.round(avgComplexity),
        maxComplexity: Math.max(
          ...analyses.map((a) => a.complexity.cyclomaticComplexity)
        ),
        complexityDistribution: this._calculateComplexityDistribution(analyses),
      },
      maintainability: {
        averageScore: Math.round(
          analyses.reduce(
            (sum, a) => sum + a.maintainability.maintainabilityScore,
            0
          ) / analyses.length
        ),
        duplicationRate: Math.round(
          analyses.reduce(
            (sum, a) => sum + a.maintainability.duplicatedCode,
            0
          ) / analyses.length
        ),
        averageFunctionSize: Math.round(
          analyses.reduce((sum, a) => sum + a.maintainability.functionSize, 0) /
            analyses.length
        ),
      },
      codeSmells: {
        totalSmells: analyses.reduce(
          (sum, a) =>
            sum +
            a.smells.longFunctions +
            a.smells.magicNumbers +
            a.smells.todoComments +
            a.smells.debugStatements,
          0
        ),
        smellDensity: Math.round(
          (analyses.reduce(
            (sum, a) =>
              sum +
              a.smells.longFunctions +
              a.smells.magicNumbers +
              a.smells.todoComments +
              a.smells.debugStatements,
            0
          ) /
            totalLines) *
            1000
        ), // per 1000 lines
        distribution: this._calculateSmellDistribution(analyses),
      },
      documentation: {
        averageCommentRatio: Math.round(
          analyses.reduce((sum, a) => sum + a.documentation.commentRatio, 0) /
            analyses.length
        ),
        totalDocstrings: analyses.reduce(
          (sum, a) => sum + a.documentation.docstrings,
          0
        ),
        documentationScore: Math.round(
          analyses.reduce(
            (sum, a) => sum + a.documentation.documentationScore,
            0
          ) / analyses.length
        ),
      },
      problematicFiles: problematicFiles.map((file) => ({
        path: file.file,
        score: file.score,
        issues: this._identifyFileIssues(file),
      })),
      recommendations: this._generateRecommendations(analyses, allFiles),
      confidence: this._calculateConfidence(analyses, allFiles),
    };
  }

  /**
   * Helper methods
   * @private
   */
  _getFileExtension(path) {
    const match = path.match(/\.([^.]+)$/);
    return match ? `.${match[1]}` : "";
  }

  _detectLanguage(extension) {
    for (const [language, extensions] of Object.entries(
      this.supportedLanguages
    )) {
      if (extensions.includes(extension)) {
        return language;
      }
    }
    return null;
  }

  _isIgnoredPath(path) {
    const ignoredPatterns = [
      /node_modules/,
      /\.git/,
      /dist/,
      /build/,
      /target/,
      /\.min\./,
      /vendor/,
      /__pycache__/,
      /\.egg-info/,
    ];
    return ignoredPatterns.some((pattern) => pattern.test(path));
  }

  _calculateMaxNestingDepth(content) {
    const lines = content.split("\n");
    let maxDepth = 0;
    let currentDepth = 0;

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.includes("{") || trimmed.includes(":")) {
        currentDepth++;
        maxDepth = Math.max(maxDepth, currentDepth);
      }
      if (trimmed.includes("}")) {
        currentDepth = Math.max(0, currentDepth - 1);
      }
    }

    return maxDepth;
  }

  _extractFunctions(content, language) {
    const functions = [];
    // Simplified function extraction - would need proper AST parsing for accuracy
    const lines = content.split("\n");

    let inFunction = false;
    let functionStartLine = 0;
    let braceCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (!inFunction && this._isFunctionStart(line, language)) {
        inFunction = true;
        functionStartLine = i;
        braceCount = 0;
      }

      if (inFunction) {
        braceCount += (line.match(/{/g) || []).length;
        braceCount -= (line.match(/}/g) || []).length;

        if (braceCount === 0 && line.includes("}")) {
          functions.push({
            startLine: functionStartLine,
            endLine: i,
            lines: i - functionStartLine + 1,
          });
          inFunction = false;
        }
      }
    }

    return functions;
  }

  _isFunctionStart(line, language) {
    switch (language) {
      case "javascript":
        return /function\s+\w+|=>\s*{|function\s*\(/.test(line);
      case "python":
        return /def\s+\w+/.test(line);
      case "java":
        return /(?:public|private|protected)[\s\w]*\([^)]*\)\s*{/.test(line);
      default:
        return false;
    }
  }

  _isCommentLine(line, language) {
    const trimmed = line.trim();
    switch (language) {
      case "javascript":
      case "java":
      case "csharp":
      case "cpp":
        return (
          trimmed.startsWith("//") ||
          trimmed.startsWith("/*") ||
          trimmed.startsWith("*")
        );
      case "python":
        return trimmed.startsWith("#");
      default:
        return false;
    }
  }

  _calculateComplexityDistribution(analyses) {
    const distribution = { low: 0, medium: 0, high: 0, extreme: 0 };

    analyses.forEach((analysis) => {
      const complexity = analysis.complexity.cyclomaticComplexity;
      if (complexity <= 5) distribution.low++;
      else if (complexity <= 10) distribution.medium++;
      else if (complexity <= 20) distribution.high++;
      else distribution.extreme++;
    });

    return distribution;
  }

  _calculateSmellDistribution(analyses) {
    const distribution = {
      longFunctions: 0,
      magicNumbers: 0,
      todoComments: 0,
      debugStatements: 0,
    };

    analyses.forEach((analysis) => {
      distribution.longFunctions += analysis.smells.longFunctions;
      distribution.magicNumbers += analysis.smells.magicNumbers;
      distribution.todoComments += analysis.smells.todoComments;
      distribution.debugStatements += analysis.smells.debugStatements;
    });

    return distribution;
  }

  _identifyFileIssues(fileAnalysis) {
    const issues = [];

    if (fileAnalysis.complexity.cyclomaticComplexity > 15) {
      issues.push("High cyclomatic complexity");
    }
    if (fileAnalysis.lines > 500) {
      issues.push("Large file size");
    }
    if (fileAnalysis.maintainability.functionSize > 100) {
      issues.push("Large function size");
    }
    if (fileAnalysis.smells.todoComments > 5) {
      issues.push("Many TODO comments");
    }
    if (fileAnalysis.documentation.commentRatio < 5) {
      issues.push("Low comment ratio");
    }

    return issues;
  }

  _generateRecommendations(analyses, allFiles) {
    const recommendations = [];
    const avgScore =
      analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;

    if (avgScore < 60) {
      recommendations.push({
        type: "critical",
        category: "overall",
        message: "Code quality is below acceptable standards",
        action:
          "Focus on refactoring complex functions and improving documentation",
        impact: "high",
      });
    }

    const highComplexityFiles = analyses.filter(
      (a) => a.complexity.cyclomaticComplexity > 15
    ).length;
    if (highComplexityFiles > analyses.length * 0.2) {
      recommendations.push({
        type: "important",
        category: "complexity",
        message: `${highComplexityFiles} files have high cyclomatic complexity`,
        action:
          "Break down complex functions into smaller, more manageable pieces",
        impact: "high",
      });
    }

    const lowDocumentationFiles = analyses.filter(
      (a) => a.documentation.commentRatio < 5
    ).length;
    if (lowDocumentationFiles > analyses.length * 0.5) {
      recommendations.push({
        type: "important",
        category: "documentation",
        message: "Many files lack adequate documentation",
        action: "Add comments and documentation to improve code readability",
        impact: "medium",
      });
    }

    const testFiles = allFiles.filter(
      (file) => file.path.includes("test") || file.path.includes("spec")
    ).length;
    if (testFiles < allFiles.length * 0.1) {
      recommendations.push({
        type: "suggestion",
        category: "testing",
        message: "Low test coverage detected",
        action: "Add unit tests to improve code reliability",
        impact: "high",
      });
    }

    return recommendations;
  }

  _calculateConfidence(analyses, allFiles) {
    let confidence = 0.8;

    // Reduce confidence if we analyzed very few files
    const analysisRatio = analyses.length / allFiles.length;
    if (analysisRatio < 0.5) confidence *= 0.7;
    if (analysisRatio < 0.2) confidence *= 0.5;

    // Reduce confidence for very small repositories
    if (allFiles.length < 5) confidence *= 0.6;

    return confidence;
  }

  _createEmptyFileAnalysis(file, error) {
    return {
      file: file.path,
      language: file.language,
      size: file.size,
      lines: 0,
      characters: 0,
      complexity: { complexityScore: 0 },
      maintainability: { maintainabilityScore: 0 },
      smells: { smellScore: 0 },
      documentation: { documentationScore: 0 },
      score: 0,
      error,
    };
  }

  /**
   * Create empty analysis for repositories without code files
   * @private
   */
  _createEmptyAnalysis(error = null) {
    return {
      overallScore: 0,
      summary: {
        totalFiles: 0,
        analyzedFiles: 0,
        totalLines: 0,
        totalFunctions: 0,
        averageComplexity: 0,
        languageDistribution: {},
        testCoverageIndicator: 0,
      },
      complexity: {
        averageFileSize: 0,
        averageFunctionCount: 0,
        averageComplexity: 0,
        maxComplexity: 0,
        complexityDistribution: { low: 0, medium: 0, high: 0, extreme: 0 },
      },
      maintainability: {
        averageScore: 0,
        duplicationRate: 0,
        averageFunctionSize: 0,
      },
      codeSmells: {
        totalSmells: 0,
        smellDensity: 0,
        distribution: {
          longFunctions: 0,
          magicNumbers: 0,
          todoComments: 0,
          debugStatements: 0,
        },
      },
      documentation: {
        averageCommentRatio: 0,
        totalDocstrings: 0,
        documentationScore: 0,
      },
      problematicFiles: [],
      recommendations: [
        {
          type: "critical",
          category: "missing",
          message: "No source code files found for analysis",
          action: "Ensure repository contains analyzable source code files",
          impact: "high",
        },
      ],
      error: error,
      confidence: error ? 0.1 : 0.9,
    };
  }
}

module.exports = CodeQualityService;

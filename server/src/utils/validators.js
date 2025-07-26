/**
 * URL Validation Utilities
 *
 * Provides comprehensive GitHub URL validation and parsing
 */

/**
 * Validate and parse GitHub repository URL
 *
 * @param {string} url - The URL to validate
 * @returns {Object} Validation result with parsed components
 */
function validateGitHubUrl(url) {
  if (!url || typeof url !== "string") {
    return {
      isValid: false,
      error: "URL is required and must be a string",
    };
  }

  const trimmedUrl = url.trim();

  // GitHub URL patterns
  const patterns = [
    // Standard GitHub URLs
    /^https?:\/\/(www\.)?github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)\/([a-zA-Z0-9._-]+?)(?:\.git)?(?:\/.*)?$/i,
    // GitHub URLs without protocol
    /^(?:www\.)?github\.com\/([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)\/([a-zA-Z0-9._-]+?)(?:\.git)?(?:\/.*)?$/i,
    // Git clone URLs
    /^git@github\.com:([a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?)\/([a-zA-Z0-9._-]+?)(?:\.git)?$/i,
  ];

  let match = null;
  let owner = "";
  let repo = "";

  // Try each pattern
  for (const pattern of patterns) {
    match = trimmedUrl.match(pattern);
    if (match) {
      if (pattern.source.includes("git@")) {
        // SSH format: git@github.com:owner/repo.git
        owner = match[1];
        repo = match[2];
      } else if (match[2] && match[3]) {
        // HTTPS format with www capture group
        owner = match[2];
        repo = match[3];
      } else {
        // HTTPS format without www capture group
        owner = match[1];
        repo = match[2];
      }
      break;
    }
  }

  if (!match) {
    return {
      isValid: false,
      error:
        "Invalid GitHub URL format. Expected: https://github.com/owner/repo",
    };
  }

  // Clean up repo name
  repo = repo.replace(/\.git$/, "");

  // Validate owner and repo names
  const ownerValidation = validateGitHubUsername(owner);
  if (!ownerValidation.isValid) {
    return {
      isValid: false,
      error: `Invalid repository owner: ${ownerValidation.error}`,
    };
  }

  const repoValidation = validateGitHubRepoName(repo);
  if (!repoValidation.isValid) {
    return {
      isValid: false,
      error: `Invalid repository name: ${repoValidation.error}`,
    };
  }

  // Construct normalized URL
  const normalizedUrl = `https://github.com/${owner}/${repo}`;

  return {
    isValid: true,
    owner,
    repo,
    originalUrl: trimmedUrl,
    normalizedUrl,
    apiUrl: `https://api.github.com/repos/${owner}/${repo}`,
    cloneUrl: `https://github.com/${owner}/${repo}.git`,
    sshUrl: `git@github.com:${owner}/${repo}.git`,
  };
}

/**
 * Validate GitHub username/organization name
 *
 * @param {string} username - Username to validate
 * @returns {Object} Validation result
 */
function validateGitHubUsername(username) {
  if (!username || typeof username !== "string") {
    return {
      isValid: false,
      error: "Username is required",
    };
  }

  const trimmed = username.trim();

  // GitHub username rules:
  // - May only contain alphanumeric characters or single hyphens
  // - Cannot begin or end with a hyphen
  // - Maximum 39 characters
  const usernamePattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]*[a-zA-Z0-9])?$/;

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: "Username cannot be empty",
    };
  }

  if (trimmed.length > 39) {
    return {
      isValid: false,
      error: "Username cannot exceed 39 characters",
    };
  }

  if (!usernamePattern.test(trimmed)) {
    return {
      isValid: false,
      error:
        "Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen",
    };
  }

  // Reserved usernames
  const reservedNames = [
    "www",
    "api",
    "blog",
    "status",
    "support",
    "about",
    "security",
    "admin",
    "ghost",
    "help",
    "docs",
    "developer",
    "desktop",
  ];

  if (reservedNames.includes(trimmed.toLowerCase())) {
    return {
      isValid: false,
      error: "Username is reserved",
    };
  }

  return {
    isValid: true,
    username: trimmed,
  };
}

/**
 * Validate GitHub repository name
 *
 * @param {string} repoName - Repository name to validate
 * @returns {Object} Validation result
 */
function validateGitHubRepoName(repoName) {
  if (!repoName || typeof repoName !== "string") {
    return {
      isValid: false,
      error: "Repository name is required",
    };
  }

  const trimmed = repoName.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: "Repository name cannot be empty",
    };
  }

  if (trimmed.length > 100) {
    return {
      isValid: false,
      error: "Repository name cannot exceed 100 characters",
    };
  }

  // GitHub repository name rules:
  // - Can contain alphanumeric characters, hyphens, underscores, and periods
  // - Cannot start with a period or hyphen
  // - Cannot end with .git (case insensitive)
  const repoPattern = /^[a-zA-Z0-9_][a-zA-Z0-9._-]*$/;

  if (!repoPattern.test(trimmed)) {
    return {
      isValid: false,
      error:
        "Repository name can only contain alphanumeric characters, hyphens, underscores, and periods, and cannot start with a period or hyphen",
    };
  }

  if (trimmed.toLowerCase().endsWith(".git")) {
    return {
      isValid: false,
      error: "Repository name cannot end with .git",
    };
  }

  // Check for consecutive special characters
  if (/[._-]{2,}/.test(trimmed)) {
    return {
      isValid: false,
      error: "Repository name cannot contain consecutive special characters",
    };
  }

  return {
    isValid: true,
    repoName: trimmed,
  };
}

/**
 * Extract repository information from various GitHub URL formats
 *
 * @param {string} url - GitHub URL in any format
 * @returns {Object|null} Repository info or null if invalid
 */
function extractRepoInfo(url) {
  const validation = validateGitHubUrl(url);

  if (!validation.isValid) {
    return null;
  }

  return {
    owner: validation.owner,
    repo: validation.repo,
    fullName: `${validation.owner}/${validation.repo}`,
    urls: {
      github: validation.normalizedUrl,
      api: validation.apiUrl,
      clone: validation.cloneUrl,
      ssh: validation.sshUrl,
    },
  };
}

/**
 * Check if URL is a valid GitHub repository URL (boolean)
 *
 * @param {string} url - URL to check
 * @returns {boolean} True if valid GitHub repo URL
 */
function isValidGitHubUrl(url) {
  return validateGitHubUrl(url).isValid;
}

/**
 * Normalize GitHub URL to standard format
 *
 * @param {string} url - GitHub URL to normalize
 * @returns {string|null} Normalized URL or null if invalid
 */
function normalizeGitHubUrl(url) {
  const validation = validateGitHubUrl(url);
  return validation.isValid ? validation.normalizedUrl : null;
}

/**
 * Get repository API URL from GitHub URL
 *
 * @param {string} url - GitHub repository URL
 * @returns {string|null} API URL or null if invalid
 */
function getApiUrl(url) {
  const validation = validateGitHubUrl(url);
  return validation.isValid ? validation.apiUrl : null;
}

module.exports = {
  validateGitHubUrl,
  validateGitHubUsername,
  validateGitHubRepoName,
  extractRepoInfo,
  isValidGitHubUrl,
  normalizeGitHubUrl,
  getApiUrl,
};

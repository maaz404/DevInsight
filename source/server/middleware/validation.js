/**
 * Validation middleware for DevInsight API
 */

/**
 * Validates GitHub repository URLs
 * @param {string} url - The URL to validate
 * @returns {object} - Validation result with isValid and parsed data
 */
const validateGitHubURL = (url) => {
  if (!url || typeof url !== "string") {
    return {
      isValid: false,
      error: "URL is required and must be a string",
    };
  }

  // Remove trailing slash and whitespace
  const cleanUrl = url.trim().replace(/\/$/, "");

  // GitHub URL patterns to match
  const patterns = [
    // Standard github.com URLs
    /^https?:\/\/github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)(?:\/.*)?$/,
    // GitHub URLs without protocol
    /^github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)(?:\/.*)?$/,
    // www.github.com URLs
    /^https?:\/\/www\.github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)(?:\/.*)?$/,
  ];

  let match = null;
  let normalizedUrl = cleanUrl;

  // Try to match against patterns
  for (const pattern of patterns) {
    match = cleanUrl.match(pattern);
    if (match) {
      // Normalize URL to https://github.com format
      normalizedUrl = `https://github.com/${match[1]}/${match[2]}`;
      break;
    }
  }

  if (!match) {
    return {
      isValid: false,
      error:
        "Invalid GitHub repository URL format. Expected: https://github.com/owner/repo",
    };
  }

  const [, owner, repo] = match;

  // Additional validation rules
  if (owner.length < 1 || owner.length > 39) {
    return {
      isValid: false,
      error: "GitHub username must be 1-39 characters long",
    };
  }

  if (repo.length < 1 || repo.length > 100) {
    return {
      isValid: false,
      error: "GitHub repository name must be 1-100 characters long",
    };
  }

  // Check for invalid characters
  const invalidOwnerChars = /[^a-zA-Z0-9._-]/.test(owner);
  const invalidRepoChars = /[^a-zA-Z0-9._-]/.test(repo);

  if (invalidOwnerChars) {
    return {
      isValid: false,
      error:
        "GitHub username contains invalid characters. Only letters, numbers, dots, underscores, and hyphens are allowed",
    };
  }

  if (invalidRepoChars) {
    return {
      isValid: false,
      error:
        "GitHub repository name contains invalid characters. Only letters, numbers, dots, underscores, and hyphens are allowed",
    };
  }

  // Check for reserved names
  const reservedNames = [
    "api",
    "www",
    "ftp",
    "mail",
    "pop",
    "pop3",
    "imap",
    "smtp",
    "stage",
    "stats",
  ];
  if (reservedNames.includes(owner.toLowerCase())) {
    return {
      isValid: false,
      error: "Invalid GitHub username (reserved name)",
    };
  }

  return {
    isValid: true,
    normalizedUrl,
    owner,
    repo,
    originalUrl: url,
  };
};

/**
 * Express middleware for validating GitHub URLs in request body
 */
const validateGitHubURLMiddleware = (req, res, next) => {
  const { repoUrl } = req.body;

  const validation = validateGitHubURL(repoUrl);

  if (!validation.isValid) {
    return res.status(400).json({
      error: "Invalid GitHub URL",
      message: validation.error,
      providedUrl: repoUrl,
    });
  }

  // Add validated data to request object
  req.validatedRepo = {
    url: validation.normalizedUrl,
    owner: validation.owner,
    repo: validation.repo,
    originalUrl: validation.originalUrl,
  };

  next();
};

/**
 * General request validation middleware
 */
const validateAnalyzeRequest = (req, res, next) => {
  const { repoUrl } = req.body;

  // Check if body exists
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      error: "Request body is required",
      message: "Please provide a valid JSON body with repoUrl field",
    });
  }

  // Check for required fields
  if (!repoUrl) {
    return res.status(400).json({
      error: "Missing required field",
      message: "repoUrl field is required in request body",
    });
  }

  next();
};

module.exports = {
  validateGitHubURL,
  validateGitHubURLMiddleware,
  validateAnalyzeRequest,
};

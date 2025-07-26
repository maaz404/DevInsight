/**
 * Error Handling Utilities
 *
 * Provides standardized error handling and logging for the application
 */

/**
 * Custom error classes for different types of errors
 */

class AppError extends Error {
  constructor(message, statusCode = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, "VALIDATION_ERROR");
    this.field = field;
  }
}

class RateLimitError extends AppError {
  constructor(message = "Rate limit exceeded") {
    super(message, 429, "RATE_LIMIT_ERROR");
  }
}

class GitHubApiError extends AppError {
  constructor(message, statusCode = 500, apiResponse = null) {
    super(message, statusCode, "GITHUB_API_ERROR");
    this.apiResponse = apiResponse;
  }
}

class AnalysisError extends AppError {
  constructor(message, analysisType = null) {
    super(message, 500, "ANALYSIS_ERROR");
    this.analysisType = analysisType;
  }
}

/**
 * Error handler middleware for Express
 */
function errorHandler(err, req, res, next) {
  // Log error details
  console.error("Error occurred:", {
    message: err.message,
    statusCode: err.statusCode,
    code: err.code,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Default error response
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal server error";
  let code = err.code || "INTERNAL_ERROR";

  // Handle specific error types
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    code = "VALIDATION_ERROR";
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = "Invalid data format";
    code = "CAST_ERROR";
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate entry";
    code = "DUPLICATE_ERROR";
  } else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
    code = "INVALID_TOKEN";
  } else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
    code = "TOKEN_EXPIRED";
  }

  // Prepare error response
  const errorResponse = {
    success: false,
    error: {
      message,
      code,
      timestamp: new Date().toISOString(),
    },
  };

  // Add additional error details in development
  if (process.env.NODE_ENV === "development") {
    errorResponse.error.stack = err.stack;
    errorResponse.error.details = err;
  }

  // Add field information for validation errors
  if (err instanceof ValidationError && err.field) {
    errorResponse.error.field = err.field;
  }

  res.status(statusCode).json(errorResponse);
}

/**
 * Async error wrapper for handling async route errors
 */
function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Handle GitHub API errors with appropriate fallbacks
 */
function handleGitHubApiError(error, operation = "GitHub API operation") {
  console.error(`GitHub API Error during ${operation}:`, error.message);

  let statusCode = 500;
  let message = `Failed to ${operation}`;

  if (error.response) {
    statusCode = error.response.status;

    switch (statusCode) {
      case 401:
        message = "GitHub API authentication failed";
        break;
      case 403:
        if (error.response.headers["x-ratelimit-remaining"] === "0") {
          message = "GitHub API rate limit exceeded";
        } else {
          message = "GitHub API access forbidden";
        }
        break;
      case 404:
        message = "Repository not found or not accessible";
        break;
      case 422:
        message = "Invalid repository or request parameters";
        break;
      default:
        message = `GitHub API error: ${error.response.statusText}`;
    }
  } else if (error.request) {
    message = "Unable to connect to GitHub API";
  }

  throw new GitHubApiError(message, statusCode, error.response?.data);
}

/**
 * Handle analysis errors with appropriate fallbacks
 */
function handleAnalysisError(error, analysisType, fallbackData = null) {
  console.error(`Analysis Error in ${analysisType}:`, error.message);

  // If we have fallback data, return it with a warning
  if (fallbackData) {
    console.warn(`Using fallback data for ${analysisType} analysis`);
    return {
      ...fallbackData,
      warning: `Analysis completed with limited data due to: ${error.message}`,
      confidence: Math.max(0, (fallbackData.confidence || 50) - 20),
    };
  }

  // Otherwise, throw an analysis error
  throw new AnalysisError(
    `Failed to analyze ${analysisType}: ${error.message}`,
    analysisType
  );
}

/**
 * Retry function with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on certain errors
      if (
        error.statusCode === 404 ||
        error.statusCode === 422 ||
        error.statusCode === 401
      ) {
        throw error;
      }

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      console.log(
        `Attempt ${attempt} failed, retrying in ${Math.round(delay)}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Safe async execution with timeout
 */
async function safeExecute(fn, timeout = 30000, fallbackValue = null) {
  return new Promise(async (resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeout}ms`));
    }, timeout);

    try {
      const result = await fn();
      clearTimeout(timeoutId);
      resolve(result);
    } catch (error) {
      clearTimeout(timeoutId);

      if (fallbackValue !== null) {
        console.warn("Safe execute failed, using fallback:", error.message);
        resolve(fallbackValue);
      } else {
        reject(error);
      }
    }
  });
}

/**
 * Validate and sanitize input data
 */
function validateInput(data, schema) {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

    // Check required fields
    if (
      rules.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors.push(`${field} is required`);
      continue;
    }

    // Skip validation if field is not required and not provided
    if (!rules.required && (value === undefined || value === null)) {
      continue;
    }

    // Type validation
    if (rules.type && typeof value !== rules.type) {
      errors.push(`${field} must be of type ${rules.type}`);
      continue;
    }

    // String length validation
    if (
      rules.minLength &&
      typeof value === "string" &&
      value.length < rules.minLength
    ) {
      errors.push(
        `${field} must be at least ${rules.minLength} characters long`
      );
    }

    if (
      rules.maxLength &&
      typeof value === "string" &&
      value.length > rules.maxLength
    ) {
      errors.push(
        `${field} must be no more than ${rules.maxLength} characters long`
      );
    }

    // Numeric range validation
    if (rules.min && typeof value === "number" && value < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
    }

    if (rules.max && typeof value === "number" && value > rules.max) {
      errors.push(`${field} must be no more than ${rules.max}`);
    }

    // Pattern validation
    if (
      rules.pattern &&
      typeof value === "string" &&
      !rules.pattern.test(value)
    ) {
      errors.push(`${field} format is invalid`);
    }

    // Custom validation
    if (rules.validate && typeof rules.validate === "function") {
      const customError = rules.validate(value);
      if (customError) {
        errors.push(customError);
      }
    }
  }

  if (errors.length > 0) {
    throw new ValidationError(`Validation failed: ${errors.join(", ")}`);
  }

  return true;
}

/**
 * Log performance metrics
 */
function logPerformance(operation, startTime, additionalData = {}) {
  const duration = Date.now() - startTime;
  console.log(
    `Performance: ${operation} completed in ${duration}ms`,
    additionalData
  );

  // Log warning for slow operations
  if (duration > 5000) {
    console.warn(`Slow operation detected: ${operation} took ${duration}ms`);
  }
}

/**
 * Create a standardized response object
 */
function createResponse(success, data = null, error = null, meta = {}) {
  const response = {
    success,
    timestamp: new Date().toISOString(),
    ...meta,
  };

  if (success) {
    response.data = data;
  } else {
    response.error = error;
  }

  return response;
}

/**
 * Handle partial failures in batch operations
 */
function handlePartialFailures(results, operation = "batch operation") {
  const successful = results.filter((r) => r.success);
  const failed = results.filter((r) => !r.success);

  console.log(
    `${operation}: ${successful.length} successful, ${failed.length} failed`
  );

  if (failed.length > 0) {
    console.warn(
      `Failed items in ${operation}:`,
      failed.map((f) => f.error)
    );
  }

  return {
    successful: successful.map((r) => r.data),
    failed: failed.map((r) => ({ error: r.error, input: r.input })),
    totalCount: results.length,
    successCount: successful.length,
    failureCount: failed.length,
    successRate: successful.length / results.length,
  };
}

module.exports = {
  // Error classes
  AppError,
  ValidationError,
  RateLimitError,
  GitHubApiError,
  AnalysisError,

  // Error handling functions
  errorHandler,
  asyncHandler,
  handleGitHubApiError,
  handleAnalysisError,
  retryWithBackoff,
  safeExecute,
  validateInput,
  logPerformance,
  createResponse,
  handlePartialFailures,
};

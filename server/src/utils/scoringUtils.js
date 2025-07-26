/**
 * Scoring and Analysis Utilities
 *
 * Provides functions for calculating scores, metrics, and aggregations
 */

/**
 * Calculate weighted score from individual scores and weights
 *
 * @param {Object} scores - Object with score values
 * @param {Object} weights - Object with weight values (should sum to 1.0)
 * @returns {number} Weighted score (0-100)
 */
function calculateWeightedScore(scores, weights) {
  if (!scores || !weights) {
    throw new Error("Scores and weights are required");
  }

  let totalScore = 0;
  let totalWeight = 0;

  // Calculate weighted sum
  for (const [key, weight] of Object.entries(weights)) {
    if (scores.hasOwnProperty(key) && typeof scores[key] === "number") {
      totalScore += scores[key] * weight;
      totalWeight += weight;
    }
  }

  // Handle case where weights don't sum to 1.0
  if (totalWeight === 0) {
    return 0;
  }

  if (Math.abs(totalWeight - 1.0) > 0.01) {
    // Normalize if weights don't sum to 1.0
    totalScore = totalScore / totalWeight;
  }

  return Math.max(0, Math.min(100, totalScore));
}

/**
 * Calculate percentile rank for a value in a dataset
 *
 * @param {number} value - Value to rank
 * @param {number[]} dataset - Array of values to compare against
 * @returns {number} Percentile rank (0-100)
 */
function calculatePercentileRank(value, dataset) {
  if (!Array.isArray(dataset) || dataset.length === 0) {
    return 50; // Default to median if no dataset
  }

  const sortedDataset = [...dataset].sort((a, b) => a - b);
  const count = sortedDataset.filter((v) => v <= value).length;

  return Math.round((count / sortedDataset.length) * 100);
}

/**
 * Calculate score based on threshold ranges
 *
 * @param {number} value - Value to score
 * @param {Object} thresholds - Threshold object with excellent, good, average, poor
 * @param {boolean} inverse - If true, lower values get higher scores
 * @returns {number} Score (0-100)
 */
function calculateThresholdScore(value, thresholds, inverse = false) {
  if (typeof value !== "number" || !thresholds) {
    return 0;
  }

  const { excellent, good, average, poor } = thresholds;

  if (!inverse) {
    // Higher values = better scores
    if (value >= excellent) return 100;
    if (value >= good) return 80;
    if (value >= average) return 60;
    if (value >= poor) return 40;
    return 20;
  } else {
    // Lower values = better scores (e.g., for issues, vulnerabilities)
    if (value <= excellent) return 100;
    if (value <= good) return 80;
    if (value <= average) return 60;
    if (value <= poor) return 40;
    return 20;
  }
}

/**
 * Calculate exponential decay score
 * Useful for time-based metrics where recent activity is more important
 *
 * @param {number} value - Base value
 * @param {number} daysAgo - Days since the event
 * @param {number} halfLife - Half-life in days (default 30)
 * @returns {number} Decayed score
 */
function calculateDecayScore(value, daysAgo, halfLife = 30) {
  if (typeof value !== "number" || typeof daysAgo !== "number") {
    return 0;
  }

  const decayFactor = Math.exp((-Math.log(2) * daysAgo) / halfLife);
  return value * decayFactor;
}

/**
 * Calculate confidence interval for a score
 *
 * @param {number} score - The calculated score
 * @param {number} sampleSize - Size of the sample used
 * @param {number} confidence - Confidence level (default 0.95)
 * @returns {Object} Confidence interval with lower and upper bounds
 */
function calculateConfidenceInterval(score, sampleSize, confidence = 0.95) {
  if (sampleSize <= 1) {
    return { lower: score, upper: score, margin: 0 };
  }

  // Simple approximation using normal distribution
  const z = confidence === 0.95 ? 1.96 : confidence === 0.99 ? 2.576 : 1.645;
  const standardError = Math.sqrt((score * (100 - score)) / sampleSize);
  const margin = z * standardError;

  return {
    lower: Math.max(0, score - margin),
    upper: Math.min(100, score + margin),
    margin: margin,
  };
}

/**
 * Normalize score to 0-100 range
 *
 * @param {number} value - Value to normalize
 * @param {number} min - Minimum possible value
 * @param {number} max - Maximum possible value
 * @returns {number} Normalized score (0-100)
 */
function normalizeScore(value, min, max) {
  if (max <= min) {
    return 50; // Default to middle if invalid range
  }

  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized));
}

/**
 * Calculate moving average
 *
 * @param {number[]} values - Array of values
 * @param {number} window - Window size for moving average
 * @returns {number[]} Array of moving averages
 */
function calculateMovingAverage(values, window) {
  if (!Array.isArray(values) || window <= 0) {
    return [];
  }

  const result = [];
  for (let i = 0; i <= values.length - window; i++) {
    const slice = values.slice(i, i + window);
    const average = slice.reduce((sum, val) => sum + val, 0) / slice.length;
    result.push(average);
  }

  return result;
}

/**
 * Calculate standard deviation
 *
 * @param {number[]} values - Array of numbers
 * @returns {number} Standard deviation
 */
function calculateStandardDeviation(values) {
  if (!Array.isArray(values) || values.length <= 1) {
    return 0;
  }

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDifferences = values.map((val) => Math.pow(val - mean, 2));
  const variance =
    squaredDifferences.reduce((sum, val) => sum + val, 0) / values.length;

  return Math.sqrt(variance);
}

/**
 * Calculate coefficient of variation (relative variability)
 *
 * @param {number[]} values - Array of numbers
 * @returns {number} Coefficient of variation (0-1)
 */
function calculateCoefficientOfVariation(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return 0;
  }

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  if (mean === 0) {
    return 0;
  }

  const standardDeviation = calculateStandardDeviation(values);
  return standardDeviation / mean;
}

/**
 * Calculate trend from time series data
 *
 * @param {Array} timeSeries - Array of {timestamp, value} objects
 * @returns {Object} Trend analysis with direction and strength
 */
function calculateTrend(timeSeries) {
  if (!Array.isArray(timeSeries) || timeSeries.length < 2) {
    return { direction: "stable", strength: 0, slope: 0 };
  }

  // Simple linear regression
  const n = timeSeries.length;
  let sumX = 0,
    sumY = 0,
    sumXY = 0,
    sumXX = 0;

  timeSeries.forEach((point, index) => {
    const x = index; // Use index as x value
    const y = point.value || 0;

    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  });

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Calculate R-squared to determine trend strength
  const yMean = sumY / n;
  let totalSumSquares = 0;
  let residualSumSquares = 0;

  timeSeries.forEach((point, index) => {
    const y = point.value || 0;
    const yPred = slope * index + intercept;

    totalSumSquares += Math.pow(y - yMean, 2);
    residualSumSquares += Math.pow(y - yPred, 2);
  });

  const rSquared = 1 - residualSumSquares / totalSumSquares;
  const strength = Math.abs(rSquared);

  let direction = "stable";
  if (Math.abs(slope) > 0.1 && strength > 0.3) {
    direction = slope > 0 ? "increasing" : "decreasing";
  }

  return {
    direction,
    strength: Math.round(strength * 100),
    slope: slope,
    rSquared: rSquared,
  };
}

/**
 * Calculate quality score based on multiple metrics
 *
 * @param {Object} metrics - Object containing various quality metrics
 * @param {Object} weights - Weights for each metric
 * @param {Object} benchmarks - Benchmark values for comparison
 * @returns {Object} Quality score with breakdown
 */
function calculateQualityScore(metrics, weights, benchmarks = {}) {
  const scores = {};
  let totalScore = 0;
  let totalWeight = 0;

  for (const [metric, weight] of Object.entries(weights)) {
    if (metrics.hasOwnProperty(metric)) {
      const value = metrics[metric];
      const benchmark = benchmarks[metric];

      let score = 0;
      if (benchmark && typeof benchmark === "object") {
        // Use threshold-based scoring if benchmark has thresholds
        score = calculateThresholdScore(value, benchmark);
      } else if (typeof value === "number") {
        // Simple normalization if just a number
        score = Math.min(100, Math.max(0, value));
      }

      scores[metric] = score;
      totalScore += score * weight;
      totalWeight += weight;
    }
  }

  const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;

  return {
    overall: Math.round(overallScore),
    breakdown: scores,
    confidence: totalWeight / Object.keys(weights).length, // Percentage of metrics available
  };
}

/**
 * Calculate maturity score based on repository age and activity
 *
 * @param {Date} createdAt - Repository creation date
 * @param {Date} lastActivity - Last activity date
 * @param {number} commitCount - Total number of commits
 * @returns {number} Maturity score (0-100)
 */
function calculateMaturityScore(createdAt, lastActivity, commitCount) {
  const now = new Date();
  const ageInDays = (now - new Date(createdAt)) / (1000 * 60 * 60 * 24);
  const daysSinceLastActivity =
    (now - new Date(lastActivity)) / (1000 * 60 * 60 * 24);

  let score = 0;

  // Age component (40% of score)
  if (ageInDays > 365 * 2) score += 40; // 2+ years
  else if (ageInDays > 365) score += 30; // 1+ year
  else if (ageInDays > 180) score += 20; // 6+ months
  else if (ageInDays > 30) score += 10; // 1+ month

  // Activity component (30% of score)
  if (daysSinceLastActivity < 7) score += 30; // Active within week
  else if (daysSinceLastActivity < 30) score += 25; // Active within month
  else if (daysSinceLastActivity < 90) score += 15; // Active within 3 months
  else if (daysSinceLastActivity < 365) score += 5; // Active within year

  // Commit history component (30% of score)
  if (commitCount > 1000) score += 30;
  else if (commitCount > 500) score += 25;
  else if (commitCount > 100) score += 20;
  else if (commitCount > 50) score += 15;
  else if (commitCount > 10) score += 10;

  return Math.min(100, score);
}

module.exports = {
  calculateWeightedScore,
  calculatePercentileRank,
  calculateThresholdScore,
  calculateDecayScore,
  calculateConfidenceInterval,
  normalizeScore,
  calculateMovingAverage,
  calculateStandardDeviation,
  calculateCoefficientOfVariation,
  calculateTrend,
  calculateQualityScore,
  calculateMaturityScore,
};

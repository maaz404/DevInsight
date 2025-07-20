const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    repoName: {
      type: String,
      required: true,
      trim: true,
    },
    repoURL: {
      type: String,
      required: true,
      trim: true,
    },
    readinessScore: {
      type: Number,
      default: 0,
    },
    codeQuality: {
      type: Object,
      default: {},
    },
    readmeQuality: {
      type: Object,
      default: {},
    },
    technicalDebt: {
      type: Object,
      default: {},
    },
    security: {
      type: Object,
      default: {},
    },
    overallSummary: {
      type: String,
      default: "",
    },
    suggestedReadme: {
      type: String,
      default: "",
    },
    stats: {
      type: Object,
      default: {},
    },
    analysisId: {
      type: String,
      required: true,
      unique: true,
    },
    processingTime: {
      type: Number, // in milliseconds
      default: 0,
    },
    aiModel: {
      type: String,
      default: "gpt-4",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Indexes for better query performance
projectSchema.index({ repoURL: 1 });
projectSchema.index({ date: -1 });
projectSchema.index({ readinessScore: -1 });
projectSchema.index({ userId: 1, date: -1 });
projectSchema.index({ analysisId: 1 }, { unique: true });

// Virtual for formatted date
projectSchema.virtual("formattedDate").get(function () {
  if (this.createdAt) {
    return this.createdAt.toLocaleDateString();
  }
  return "N/A";
});

// Virtual for score category
projectSchema.virtual("scoreCategory").get(function () {
  if (this.readinessScore >= 80) return "excellent";
  if (this.readinessScore >= 60) return "good";
  if (this.readinessScore >= 40) return "fair";
  return "poor";
});

// Static method to find recent projects
projectSchema.statics.findRecent = function (limit = 10) {
  return this.find({ status: "completed" })
    .sort({ date: -1 })
    .limit(limit)
    .select(
      "repoName repoURL date readinessScore feedbackSummary scoreCategory"
    );
};

// Static method to find by score range
projectSchema.statics.findByScoreRange = function (minScore, maxScore) {
  return this.find({
    status: "completed",
    readinessScore: { $gte: minScore, $lte: maxScore },
  }).sort({ readinessScore: -1 });
};

// Instance method to get summary
projectSchema.methods.getSummary = function () {
  return {
    id: this._id,
    repoName: this.repoName,
    repoURL: this.repoURL,
    date: this.formattedDate,
    readinessScore: this.readinessScore,
    scoreCategory: this.scoreCategory,
    feedbackSummary: this.feedbackSummary,
    analysisId: this.analysisId,
  };
};

// Pre-save middleware to extract repo name from URL
projectSchema.pre("save", function (next) {
  if (this.isNew && this.repoURL && !this.repoName) {
    // Extract repo name from GitHub URL
    const urlParts = this.repoURL.replace(/\/$/, "").split("/");
    this.repoName = urlParts[urlParts.length - 1] || "Unknown Repository";
  }
  next();
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;

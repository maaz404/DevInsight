const express = require("express");
const Project = require("../models/Project");
const router = express.Router();

// GET /api/projects - Retrieve project analysis history
router.get("/", async (req, res) => {
  try {
    const {
      limit = 20,
      page = 1,
      sortBy = "date",
      sortOrder = "desc",
      minScore,
      maxScore,
      userId,
    } = req.query;

    // Build query
    const query = { status: "completed" };

    // Add score range filter if provided
    if (minScore || maxScore) {
      query.readinessScore = {};
      if (minScore) query.readinessScore.$gte = parseInt(minScore);
      if (maxScore) query.readinessScore.$lte = parseInt(maxScore);
    }

    // Add user filter if provided (for future authentication)
    if (userId) {
      query.userId = userId;
    }

    // Calculate pagination
    const limitNum = Math.min(parseInt(limit), 100); // Max 100 results
    const skip = (parseInt(page) - 1) * limitNum;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query
    const projects = await Project.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .select(
        "repoName repoURL date readinessScore feedbackSummary analysisId statistics scoreCategory"
      )
      .lean();

    // Get total count for pagination
    const totalCount = await Project.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limitNum);

    console.log(
      `📊 Retrieved ${projects.length} projects (page ${page}/${totalPages})`
    );

    res.json({
      success: true,
      data: projects,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1,
        limit: limitNum,
      },
      filters: {
        sortBy,
        sortOrder,
        minScore: minScore || null,
        maxScore: maxScore || null,
        userId: userId || null,
      },
    });
  } catch (error) {
    console.error("❌ Error retrieving projects:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve project history",
      message: error.message,
    });
  }
});

// GET /api/projects/recent - Get recent projects (simplified endpoint)
router.get("/recent", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const projects = await Project.findRecent(parseInt(limit));

    console.log(`📊 Retrieved ${projects.length} recent projects`);

    res.json({
      success: true,
      data: projects,
      message: `Retrieved ${projects.length} recent projects`,
    });
  } catch (error) {
    console.error("❌ Error retrieving recent projects:", error);
    res.status(500).json({
      success: false,
      error: "Failed to retrieve recent projects",
      message: error.message,
    });
  }
});

// GET /api/projects/stats - Get analysis statistics
router.get("/stats", async (req, res) => {
  try {
    const totalProjects = await Project.countDocuments({ status: "completed" });

    // Get score distribution
    const scoreDistribution = await Project.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: {
            $switch: {
              branches: [
                { case: { $gte: ["$readinessScore", 80] }, then: "excellent" },
                { case: { $gte: ["$readinessScore", 60] }, then: "good" },
                { case: { $gte: ["$readinessScore", 40] }, then: "fair" },
              ],
              default: "poor",
            },
          },
          count: { $sum: 1 },
          avgScore: { $avg: "$readinessScore" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Get average scores
    const avgStats = await Project.aggregate([
      { $match: { status: "completed" } },
      {
        $group: {
          _id: null,
          avgReadinessScore: { $avg: "$readinessScore" },
          avgCodeQuality: { $avg: "$analysisDetails.codeQuality.score" },
          avgReadmeScore: { $avg: "$analysisDetails.readmeQuality.score" },
          totalFiles: { $sum: "$statistics.totalFiles" },
          totalCodeFiles: { $sum: "$statistics.codeFiles" },
        },
      },
    ]);

    // Get recent analysis trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCount = await Project.countDocuments({
      status: "completed",
      date: { $gte: thirtyDaysAgo },
    });

    console.log(`📊 Generated statistics for ${totalProjects} projects`);

    res.json({
      success: true,
      data: {
        totalProjects,
        recentAnalyses: recentCount,
        scoreDistribution: scoreDistribution.reduce((acc, item) => {
          acc[item._id] = {
            count: item.count,
            avgScore: Math.round(item.avgScore * 10) / 10,
          };
          return acc;
        }, {}),
        averageScores: avgStats[0]
          ? {
              readinessScore:
                Math.round(avgStats[0].avgReadinessScore * 10) / 10,
              codeQuality:
                Math.round((avgStats[0].avgCodeQuality || 0) * 10) / 10,
              readmeScore:
                Math.round((avgStats[0].avgReadmeScore || 0) * 10) / 10,
            }
          : null,
        fileStats: avgStats[0]
          ? {
              totalFiles: avgStats[0].totalFiles,
              totalCodeFiles: avgStats[0].totalCodeFiles,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("❌ Error generating statistics:", error);
    res.status(500).json({
      success: false,
      error: "Failed to generate statistics",
      message: error.message,
    });
  }
});

// GET /api/projects/:id - Get specific project details
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
        message: "No project found with the specified ID",
      });
    }

    console.log(`📊 Retrieved project details: ${project.repoName}`);

    res.json({
      success: true,
      data: project,
      message: "Project details retrieved successfully",
    });
  } catch (error) {
    console.error("❌ Error retrieving project details:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid project ID",
        message: "The provided project ID is not valid",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to retrieve project details",
      message: error.message,
    });
  }
});

// DELETE /api/projects/:id - Delete a specific project (optional)
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const project = await Project.findByIdAndDelete(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        error: "Project not found",
        message: "No project found with the specified ID",
      });
    }

    console.log(`🗑️ Deleted project: ${project.repoName}`);

    res.json({
      success: true,
      message: "Project deleted successfully",
      data: { id: project._id, repoName: project.repoName },
    });
  } catch (error) {
    console.error("❌ Error deleting project:", error);

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        error: "Invalid project ID",
        message: "The provided project ID is not valid",
      });
    }

    res.status(500).json({
      success: false,
      error: "Failed to delete project",
      message: error.message,
    });
  }
});

module.exports = router;

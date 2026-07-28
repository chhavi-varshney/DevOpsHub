import Issue from "../models/Issue.js";

// Create Issue
export const createIssue = async (req, res) => {
  try {
    const issue = await Issue.create({
      ...req.body,
      reporter: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      issue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to create issue",
    });
  }
};

// Get All Issues
export const getAllIssues = async (req, res) => {
  try {
    const { status, priority, project, search, sort } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (project) filter.project = project;

    if (search) {
      filter.title = {
        $regex: search,
        $options: "i",
      };
    }

    let query = Issue.find(filter)
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("reporter", "name email");

    if (sort === "oldest") {
      query = query.sort({ createdAt: 1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const issues = await query;

    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch issues",
    });
  }
};

// Get Single Issue
export const getIssueById = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id)
      .populate("project", "name")
      .populate("assignedTo", "name email")
      .populate("reporter", "name email");

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      issue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch issue",
    });
  }
};

// Update Issue
export const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      issue,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to update issue",
    });
  }
};

// Delete Issue
export const deleteIssue = async (req, res) => {
  try {
    const issue = await Issue.findByIdAndDelete(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Issue deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to delete issue",
    });
  }
};
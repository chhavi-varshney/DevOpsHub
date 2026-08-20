import Issue from "../models/Issue.js";
import { createNotification } from "../services/notificationService.js";

// Create Issue
export const createIssue = async (req, res) => {
  try {
    const issue = await Issue.create({
      ...req.body,
      reporter: req.user.id,
    });
    // Create notification if issue is assigned
    if (issue.assignedTo) {
      await createNotification({
        recipient: issue.assignedTo,
        sender: req.user.id,
        type: "BUG_ASSIGNED",
        message: `You have been assigned a new bug: ${issue.title}`,
        relatedId: issue._id,
      });
    }

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
// Update Issue
export const updateIssue = async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);

    if (!issue) {
      return res.status(404).json({
        success: false,
        message: "Issue not found",
      });
    }

    const previousAssignedTo = issue.assignedTo?.toString();

    // Update issue fields
    Object.assign(issue, req.body);

    await issue.save();

    // Notify when bug is assigned to a new user
    if (
      issue.assignedTo &&
      issue.assignedTo.toString() !== previousAssignedTo
    ) {
      await createNotification({
        recipient: issue.assignedTo,
        sender: req.user.id,
        type: "BUG_ASSIGNED",
        message: `You have been assigned a new bug: ${issue.title}`,
        relatedId: issue._id,
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
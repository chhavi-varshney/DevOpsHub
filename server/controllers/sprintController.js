import Sprint from "../models/Sprint.js";
import Project from "../models/Project.js";
import { createNotification } from "../services/notificationService.js";

// Create Sprint
export const createSprint = async (req, res) => {
  try {
    const {
      name,
      description,
      project,
      startDate,
      endDate,
    } = req.body;

    if (!name || !project || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Name, Project, Start Date and End Date are required",
      });
    }

    const existingProject = await Project.findById(project);

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const sprint = await Sprint.create({
      name,
      description,
      project,
      startDate,
      endDate,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Sprint created successfully",
      sprint,
    });
  } catch (error) {
    console.error("Create Sprint Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get All Sprints
export const getSprints = async (req, res) => {
  try {
    const { project } = req.query;

    const filter = project ? { project } : {};

    const sprints = await Sprint.find(filter)
      .populate("project", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: sprints.length,
      sprints,
    });
  } catch (error) {
    console.error("Get Sprints Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Get Single Sprint
export const getSprintById = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id)
      .populate("project", "name")
      .populate("createdBy", "name email");

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: "Sprint not found",
      });
    }

    res.status(200).json({
      success: true,
      sprint,
    });
  } catch (error) {
    console.error("Get Sprint Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Update Sprint
export const updateSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: "Sprint not found",
      });
    }

    const {
      name,
      description,
      startDate,
      endDate,
      status,
    } = req.body;

    sprint.name = name ?? sprint.name;
    sprint.description = description ?? sprint.description;
    sprint.startDate = startDate ?? sprint.startDate;
    sprint.endDate = endDate ?? sprint.endDate;
    sprint.status = status ?? sprint.status;

    await sprint.save();

    res.status(200).json({
      success: true,
      message: "Sprint updated successfully",
      sprint,
    });
  } catch (error) {
    console.error("Update Sprint Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Delete Sprint
export const deleteSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: "Sprint not found",
      });
    }

    await sprint.deleteOne();

    res.status(200).json({
      success: true,
      message: "Sprint deleted successfully",
    });
  } catch (error) {
    console.error("Delete Sprint Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// Complete Sprint
export const completeSprint = async (req, res) => {
  try {
    const sprint = await Sprint.findById(req.params.id);

    if (!sprint) {
      return res.status(404).json({
        success: false,
        message: "Sprint not found",
      });
    }

    // Prevent duplicate completion notification
    if (sprint.status === "Completed") {
      return res.status(400).json({
        success: false,
        message: "Sprint is already completed",
      });
    }

    // Get project
    const project = await Project.findById(sprint.project);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Complete sprint
    sprint.status = "Completed";

    await sprint.save();

    // Notify project owner
        // Notify project owner
    if (project.owner) {
      await createNotification({
        recipient: project.owner,
        sender: req.user.id,
        type: "SPRINT_COMPLETE",
        message: `Sprint "${sprint.name}" has been completed`,
        relatedId: sprint._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Sprint completed successfully",
      sprint,
    });
  } catch (error) {
    console.error("Complete Sprint Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
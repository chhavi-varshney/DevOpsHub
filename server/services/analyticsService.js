import Task from "../models/Task.js";
import Issue from "../models/Issue.js";
import Sprint from "../models/Sprint.js";
import Deployment from "../models/Deployment.js";

import {
  getRepositories,
  getCommits,
} from "./githubService.js";

export const getDashboardAnalytics = async (
  userId,
  range = "7days"
) => {
  try {
    // =========================
    // TASK ANALYTICS
    // =========================

    const [
      todoTasks,
      inProgressTasks,
      reviewTasks,
      doneTasks,
    ] = await Promise.all([
      Task.countDocuments({ status: "Todo" }),
      Task.countDocuments({ status: "In Progress" }),
      Task.countDocuments({ status: "Review" }),
      Task.countDocuments({ status: "Done" }),
    ]);

    // =========================
    // ISSUE ANALYTICS
    // =========================

    const [
      openIssues,
      resolvedIssues,
      closedIssues,
    ] = await Promise.all([
      Issue.countDocuments({ status: "Open" }),
      Issue.countDocuments({ status: "Resolved" }),
      Issue.countDocuments({ status: "Closed" }),
    ]);

    // =========================
    // SPRINT ANALYTICS
    // =========================

    const [
      plannedSprints,
      activeSprints,
      completedSprints,
    ] = await Promise.all([
      Sprint.countDocuments({ status: "Planned" }),
      Sprint.countDocuments({ status: "Active" }),
      Sprint.countDocuments({ status: "Completed" }),
    ]);

    // =========================
    // GITHUB COMMIT ANALYTICS
    // =========================

    let commitAnalytics = [];

    try {
      const repositories = await getRepositories(userId);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let numberOfDays = 7;

      if (range === "30days") {
        numberOfDays = 30;
      }

      if (range === "month") {
        numberOfDays = today.getDate();
      }

      const startDate = new Date(today);

      startDate.setDate(
        today.getDate() - numberOfDays + 1
      );

      const commitDays = [];

      for (let i = 0; i < numberOfDays; i++) {
        const date = new Date(startDate);

        date.setDate(
          startDate.getDate() + i
        );

        commitDays.push({
          date: date.toISOString().split("T")[0],
          commits: 0,
        });
      }

      for (const repo of repositories) {
        const owner = repo.owner?.login;
        const repoName = repo.name;

        if (!owner || !repoName) {
          continue;
        }

        try {
          const commits = await getCommits(
            userId,
            owner,
            repoName
          );

          commits.forEach((commit) => {
            const commitDate =
              commit.commit?.author?.date;

            if (!commitDate) {
              return;
            }

            const formattedDate =
              new Date(commitDate)
                .toISOString()
                .split("T")[0];

            const day = commitDays.find(
              (item) =>
                item.date === formattedDate
            );

            if (day) {
              day.commits += 1;
            }
          });
        } catch (error) {
          if (
            !error.message?.includes(
              "Git Repository is empty"
            )
          ) {
            console.error(
              `Commit analytics error for ${owner}/${repoName}:`,
              error.message
            );
          }
        }
      }

      commitAnalytics = commitDays;
    } catch (error) {
      console.error(
        "GitHub commit analytics error:",
        error.message
      );

      commitAnalytics = [];
    }

    // =========================
    // DEPLOYMENT ANALYTICS
    // =========================

    const [
      successfulDeployments,
      failedDeployments,
    ] = await Promise.all([
      Deployment.countDocuments({
        status: "Success",
      }),
      Deployment.countDocuments({
        status: "Failed",
      }),
    ]);

    // =========================
    // FINAL ANALYTICS RESPONSE
    // =========================

    return {
      tasks: {
        todo: todoTasks,
        inProgress: inProgressTasks,
        review: reviewTasks,
        done: doneTasks,
      },

      issues: {
        open: openIssues,
        resolved: resolvedIssues,
        closed: closedIssues,
      },

      sprints: {
        planned: plannedSprints,
        active: activeSprints,
        completed: completedSprints,
      },

      commits: commitAnalytics,

      deployments: {
        success: successfulDeployments,
        failed: failedDeployments,
      },
    };
  } catch (error) {
    console.error(
      "Dashboard Analytics Error:",
      error
    );

    throw error;
  }
};
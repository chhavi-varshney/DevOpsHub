import express from "express";
import {
  connectGitHub,
  githubCallback,
  fetchRepositories,
  fetchCommits,
  fetchPullRequests,
  fetchIssues,
  fetchGitHubStats,
} from "../controllers/githubController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Start GitHub OAuth
router.get("/connect", authMiddleware, connectGitHub);

// GitHub OAuth callback
router.get("/callback", githubCallback);
router.get(
  "/repositories",
  authMiddleware,
  fetchRepositories
);

router.get(
  "/repos/:owner/:repo/commits",
  authMiddleware,
  fetchCommits
);
router.get(
  "/repos/:owner/:repo/pulls",
  authMiddleware,
  fetchPullRequests
);

router.get(
  "/repos/:owner/:repo/issues",
  authMiddleware,
  fetchIssues
);

router.get(
  "/stats",
  authMiddleware,
  fetchGitHubStats
);

export default router;
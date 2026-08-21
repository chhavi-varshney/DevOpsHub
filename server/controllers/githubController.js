import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {
  getRepositories,
  getCommits,
  getPullRequests,
  getIssues,
  getGitHubStats,
} from "../services/githubService.js";

const GITHUB_AUTHORIZE_URL =
  "https://github.com/login/oauth/authorize";

const GITHUB_TOKEN_URL =
  "https://github.com/login/oauth/access_token";

const GITHUB_USER_URL =
  "https://api.github.com/user";

// Start GitHub OAuth
export const connectGitHub = async (req, res) => {
  try {
    const state = jwt.sign(
      {
        id: req.user.id,
        purpose: "github-oauth",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "10m",
      }
    );

    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID,
      redirect_uri: process.env.GITHUB_CALLBACK_URL,
      scope: "read:user user:email repo",
      state,
    });

    const githubAuthUrl =
      `${GITHUB_AUTHORIZE_URL}?${params.toString()}`;

    res.status(200).json({
      success: true,
      url: githubAuthUrl,
    });
  } catch (error) {
    console.error("GitHub Connect Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to start GitHub authentication",
    });
  }
};

// GitHub OAuth callback
export const githubCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code || !state) {
      return res.status(400).send(
        "GitHub authorization code or state is missing."
      );
    }

    // Verify state
    let decodedState;

    try {
      decodedState = jwt.verify(
        state,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(401).send(
        "Invalid or expired GitHub OAuth state."
      );
    }

    if (decodedState.purpose !== "github-oauth") {
      return res.status(401).send(
        "Invalid GitHub OAuth state."
      );
    }

    // Exchange code for access token
    const tokenResponse = await fetch(
      GITHUB_TOKEN_URL,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret:
            process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri:
            process.env.GITHUB_CALLBACK_URL,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok || !tokenData.access_token) {
      console.error(
        "GitHub Token Error:",
        tokenData
      );

      return res.status(400).send(
        "Failed to get GitHub access token."
      );
    }

    // Get GitHub user
    const githubResponse = await fetch(
      GITHUB_USER_URL,
      {
        headers: {
          Accept: "application/vnd.github+json",
          Authorization:
            `Bearer ${tokenData.access_token}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    const githubUser = await githubResponse.json();

    if (!githubResponse.ok) {
      console.error(
        "GitHub User Error:",
        githubUser
      );

      return res.status(400).send(
        "Failed to fetch GitHub user."
      );
    }

    // Save GitHub connection
    const user = await User.findByIdAndUpdate(
      decodedState.id,
      {
        githubId: String(githubUser.id),
        githubUsername:
          githubUser.login || "",
        githubAccessToken:
          tokenData.access_token,
      },
      {
        new: true,
      }
    );

    if (!user) {
      return res.status(404).send(
        "DevOpsHub user not found."
      );
    }

    // Redirect to frontend
    const frontendUrl =
      process.env.CLIENT_URL ||
      "http://localhost:5173";

    return res.redirect(
      `${frontendUrl}/github?connected=true`
    );
  } catch (error) {
    console.error(
      "GitHub Callback Error:",
      error
    );

    res.status(500).send(
      "GitHub authentication failed."
    );
  }
};

// Get GitHub repositories
export const fetchRepositories = async (req, res) => {
  try {
    const repositories = await getRepositories(req.user.id);

    res.status(200).json({
      success: true,
      count: repositories.length,
      repositories,
    });
  } catch (error) {
    console.error(
      "Fetch GitHub Repositories Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch GitHub repositories",
    });
  }
};

// Get GitHub repository commits
export const fetchCommits = async (req, res) => {
  try {
    const { owner, repo } = req.params;

    if (!owner || !repo) {
      return res.status(400).json({
        success: false,
        message: "Owner and repository are required",
      });
    }

    const commits = await getCommits(
      req.user.id,
      owner,
      repo
    );

    res.status(200).json({
      success: true,
      count: commits.length,
      commits,
    });
  } catch (error) {
    console.error(
      "Fetch GitHub Commits Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch GitHub commits",
    });
  }
};

// Get GitHub repository pull requests
export const fetchPullRequests = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state = "all" } = req.query;

    if (!owner || !repo) {
      return res.status(400).json({
        success: false,
        message: "Owner and repository are required",
      });
    }

    const pullRequests = await getPullRequests(
      req.user.id,
      owner,
      repo,
      state
    );

    res.status(200).json({
      success: true,
      count: pullRequests.length,
      pullRequests,
    });
  } catch (error) {
    console.error(
      "Fetch GitHub Pull Requests Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch GitHub pull requests",
    });
  }
};

// Get GitHub repository issues
export const fetchIssues = async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { state = "open" } = req.query;

    if (!owner || !repo) {
      return res.status(400).json({
        success: false,
        message: "Owner and repository are required",
      });
    }

    const issues = await getIssues(
      req.user.id,
      owner,
      repo,
      state
    );

    res.status(200).json({
      success: true,
      count: issues.length,
      issues,
    });
  } catch (error) {
    console.error(
      "Fetch GitHub Issues Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch GitHub issues",
    });
  }
};

// Get GitHub dashboard statistics
export const fetchGitHubStats = async (req, res) => {
  try {
    const stats = await getGitHubStats(req.user.id);

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error(
      "Fetch GitHub Stats Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to fetch GitHub statistics",
    });
  }
};
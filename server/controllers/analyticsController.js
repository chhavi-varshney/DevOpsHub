import { getDashboardAnalytics } from "../services/analyticsService.js";

export const getAnalytics = async (req, res) => {
  try {
    const analytics = await getDashboardAnalytics(req.user.id);

    res.status(200).json({
      success: true,
      analytics,
    });
  } catch (error) {
    console.error("Get Analytics Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard analytics",
    });
  }
};
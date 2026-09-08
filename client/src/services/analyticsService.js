import api from "./api";

export const getDashboardAnalytics = async (
  range = "7days"
) => {
  const response = await api.get(
    "/analytics/dashboard",
    {
      params: { range },
    }
  );

  return response.data;
};
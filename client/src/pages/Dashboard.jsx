import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const [stats, setStats] = useState({
  organizations: 0,
  projects: 0,
  tasks: 0,
  users: 0,
});

  const fetchDashboard = async () => {
  try {
    const [orgRes, projectRes] = await Promise.all([
      api.get("/organizations"),
      api.get("/projects"),
    ]);

    setStats({
      organizations: orgRes.data.organizations.length,
      projects: projectRes.data.projects.length,
      tasks: 0,
      users: 0,
    });
  } catch (error) {
    toast.error("Failed to load dashboard");
  }
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };


  useEffect(() => {
  fetchDashboard();
}, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-10">
      <div className="max-w-4xl mx-auto">

        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-blue-500">
            DevOpsHub Dashboard
          </h1>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg"
          >
            Logout
          </button>
        </div>

        <div className="bg-slate-900 rounded-xl p-8 border border-slate-800">

          <h2 className="text-2xl font-semibold mb-6">
            Welcome 
          </h2>

          <div className="space-y-4 text-lg">

            <p>
              <span className="font-semibold text-blue-400">
                Name :
              </span>{" "}
              {user?.name}
            </p>

            <p>
              <span className="font-semibold text-blue-400">
                Email :
              </span>{" "}
              {user?.email}
            </p>

            <p>
              <span className="font-semibold text-blue-400">
                Role :
              </span>{" "}
              {user?.role}
            </p>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-gray-400">Organizations</h3>
            <p className="text-4xl font-bold text-blue-400 mt-3">
              {stats.organizations}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-gray-400">Projects</h3>
            <p className="text-4xl font-bold text-green-400 mt-3">
              {stats.projects}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-gray-400">Tasks</h3>
            <p className="text-4xl font-bold text-yellow-400 mt-3">
              {stats.tasks}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
            <h3 className="text-gray-400">Users</h3>
            <p className="text-4xl font-bold text-pink-400 mt-3">
              {stats.users}
            </p>
          </div>

        </div>

        <div className="mt-8 flex gap-4">
  <button
    onClick={() => navigate("/organizations")}
    className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold"
  >
    Organizations
  </button>

  <button
    onClick={() => navigate("/projects")}
    className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold"
  >
    Projects
  </button>
</div>

      </div>
    </div>
  );
}

export default Dashboard;
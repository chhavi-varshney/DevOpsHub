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

  totalTasks: 0,

  todo: 0,
  progress: 0,
  review: 0,
  done: 0,

  highPriority: 0,

  recentTasks: [],
});

  const fetchDashboard = async () => {
    try {
      const [orgRes, projectRes, taskRes] = await Promise.all([
        api.get("/organizations"),
        api.get("/projects"),
        api.get("/tasks"),
      ]);

      const tasks = taskRes.data.tasks;

        setStats({
          organizations: orgRes.data.organizations.length,
          projects: projectRes.data.projects.length,

          totalTasks: tasks.length,

          todo: tasks.filter((t) => t.status === "To Do").length,

          progress: tasks.filter((t) => t.status === "In Progress").length,

          review: tasks.filter((t) => t.status === "Review").length,

          done: tasks.filter((t) => t.status === "Done").length,

          highPriority: tasks.filter((t) => t.priority === "High").length,

          recentTasks: tasks.slice(0, 5),
        });
    } catch (error) {
      console.error(error);
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
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-blue-500">
            DevOpsHub Dashboard
          </h1>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>

        {/* Welcome Card */}
        <div className="bg-slate-900 rounded-xl p-8 border border-slate-800">

          <h2 className="text-2xl font-semibold mb-2">
            Welcome,
            <span className="text-blue-400">
              {" "}
              {user?.name}
            </span>{" "}
            
          </h2>

          <p className="text-gray-400 mb-6">
            Manage your organizations, projects and tasks from one place.
          </p>

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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-blue-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <h3 className="text-gray-400">
              Organizations
            </h3>

            <p className="text-4xl font-bold text-blue-400 mt-3">
              {stats.organizations}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-green-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <h3 className="text-gray-400">
              Projects
            </h3>

            <p className="text-4xl font-bold text-green-400 mt-3">
              {stats.projects}
            </p>
          </div>

          <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-yellow-500 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
            <h3 className="text-gray-400">
              Tasks
            </h3>

            <p className="text-4xl font-bold text-yellow-400 mt-3">
              {stats.totalTasks}
            </p>
          </div>

          {/* <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 hover:border-pink-500 transition">
            <h3 className="text-gray-400">
              Users
            </h3>

            <p className="text-4xl font-bold text-pink-400 mt-3">
              {stats.users}
            </p>
          </div> */}

        </div>

        {/* Task Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-8">

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300">
            <p className="text-gray-400">To Do</p>
            <h2 className="text-3xl font-bold text-blue-400 mt-2">
              {stats.todo}
            </h2>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300">
            <p className="text-gray-400">In Progress</p>
            <h2 className="text-3xl font-bold text-yellow-400 mt-2">
              {stats.progress}
            </h2>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300">
            <p className="text-gray-400">Review</p>
            <h2 className="text-3xl font-bold text-purple-400 mt-2">
              {stats.review}
            </h2>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300">
            <p className="text-gray-400">Done</p>
            <h2 className="text-3xl font-bold text-green-400 mt-2">
              {stats.done}
            </h2>
          </div>

          <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 hover:border-blue-500 hover:-translate-y-1 transition-all duration-300">
            <p className="text-gray-400">High Priority</p>
            <h2 className="text-3xl font-bold text-red-400 mt-2">
              {stats.highPriority}
            </h2>
          </div>

        </div>

        {/* Navigation Buttons
        // <div className="mt-8 flex gap-4 flex-wrap">

        //   <button
        //     onClick={() => navigate("/organizations")}
        //     className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-semibold transition"
        //   >
        //     Organizations
        //   </button>

        //   <button
        //     onClick={() => navigate("/projects")}
        //     className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-semibold transition"
        //   >
        //     Projects
        //   </button>

        //   <button
        //     onClick={() => navigate("/tasks")}
        //     className="bg-yellow-600 hover:bg-yellow-700 px-6 py-3 rounded-lg font-semibold transition"
        //   >
        //     Tasks
        //   </button>

        // </div> */}

        {/* Recent Tasks */}
<div className="mt-10 bg-slate-900 rounded-xl border border-slate-800 p-6">
  <h2 className="text-2xl font-bold text-blue-400 mb-6">
    Recent Tasks
  </h2>

  {stats.recentTasks.length === 0 ? (
    <p className="text-gray-400">No tasks available.</p>
  ) : (
    <div className="space-y-4">
      {stats.recentTasks.map((task) => (
        <div
          key={task._id}
          className="flex justify-between items-center border border-slate-800 rounded-lg p-4 hover:border-blue-500 hover:bg-slate-800 transition-all duration-300"
        >
          <div>
            <h3 className="font-semibold text-lg">{task.title}</h3>
            <p className="text-sm text-gray-400">
              {task.project?.name || "No Project"}
            </p>
          </div>

          <div className="text-right">
            <p className="text-sm text-blue-400">{task.status}</p>
            <p className="text-xs text-red-400">{task.priority}</p>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

{/* Quick Actions */}
<div className="mt-10">
  <h2 className="text-2xl font-bold text-blue-400 mb-6">
    Quick Actions
  </h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    <button
      onClick={() => navigate("/tasks")}
      className="bg-slate-900 border border-slate-800 hover:border-yellow-500 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-left"
    >
      <h3 className="text-xl font-semibold text-yellow-400">
         Manage Tasks
      </h3>

      <p className="text-gray-400 mt-2">
        Create, edit and organize tasks.
      </p>
    </button>

    <button
      onClick={() => navigate("/projects")}
      className="bg-slate-900 border border-slate-800 hover:border-green-500 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-left"
    >
      <h3 className="text-xl font-semibold text-green-400">
        View Projects
      </h3>

      <p className="text-gray-400 mt-2">
        Manage all your projects.
      </p>
    </button>

    <button
      onClick={() => navigate("/organizations")}
      className="bg-slate-900 border border-slate-800 hover:border-blue-500 rounded-xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl text-left"
    >
      <h3 className="text-xl font-semibold text-blue-400">
         Organizations
      </h3>

      <p className="text-gray-400 mt-2">
        View and manage organizations.
      </p>
    </button>

  </div>
</div>
                  

      </div>
    </div>
  );
}

export default Dashboard;
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/");
  };

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

      </div>
    </div>
  );
}

export default Dashboard;
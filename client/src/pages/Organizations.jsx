import { useEffect, useState } from "react";
import api from "../services/api";
import toast from "react-hot-toast";

function Organizations() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [organizations, setOrganizations] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [selectedOrganization, setSelectedOrganization] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Fetch Organizations
  const fetchOrganizations = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await api.get("/organizations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrganizations(res.data.organizations);
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditClick = (org) => {
    setEditingId(org._id);
    setEditName(org.name);
    setEditDescription(org.description);
  };

  // Create Organization
  const handleCreateOrganization = async () => {
  if (!name || !description) {
    toast.error("Please fill all fields.");
    return;
  }

  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    const res = await api.post(
      "/organizations",
      {
        name,
        description,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(res.data.message);

    setName("");
    setDescription("");

    fetchOrganizations();

  } catch (error) {
    toast.error(
      error.response?.data?.message || "Something went wrong"
    );
  } finally {
    setLoading(false);
  }
};

  const handleUpdateOrganization = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await api.put(
      `/organizations/${editingId}`,
      {
        name: editName,
        description: editDescription,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(res.data.message);

    setEditingId(null);
    setEditName("");
    setEditDescription("");

    fetchOrganizations();

  } catch (error) {
    toast.error(
      error.response?.data?.message || "Failed to update organization"
);
  }
};


const handleDeleteOrganization = async (id) => {
  const confirmDelete = window.confirm(
    "Are you sure you want to delete this organization?"
  );

  if (!confirmDelete) return;

  try {
    const token = localStorage.getItem("token");

    const res = await api.delete(`/organizations/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    toast.success(res.data.message || "Organization deleted successfully");

    fetchOrganizations();

  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Failed to delete organization"
    );
  }
};

const handleInviteClick = (organizationId) => {
  setSelectedOrganization(organizationId);
  setInviteEmail("");
  setShowInviteModal(true);
};

const handleInviteMember = async () => {
  if (!inviteEmail) {
    toast.error("Please enter member email");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const res = await api.post(
      `/organizations/${selectedOrganization}/invite`,
      {
        email: inviteEmail,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    toast.success(res.data.message);

    setInviteEmail("");
    setShowInviteModal(false);

    fetchOrganizations();

  } catch (error) {
    toast.error(
      error.response?.data?.message ||
      "Failed to invite member"
    );
  }
};

  // Load organizations when page opens
  useEffect(() => {
    fetchOrganizations();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold">
            Organizations
          </h1>

          <p className="text-slate-400 mt-2">
            Create and manage your organizations.
          </p>
        </div>

        {/* Create Organization */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl mb-10">

          <h2 className="text-2xl font-semibold mb-6">
            Create Organization
          </h2>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateOrganization();
            }}
          >
            <div>
              <label className="block mb-2 text-slate-300">
                Organization Name
              </label>

              <input
                type="text"
                placeholder="Google India"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block mb-2 text-slate-300">
                Description
              </label>

              <textarea
                rows="4"
                placeholder="Developer Organization..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition"
            >
              {loading ? "Creating..." : "Create Organization"}
            </button>
          </form>

        </div>

        {/* Organizations List */}
        <div>

          <h2 className="text-2xl font-semibold mb-5">
            My Organizations
          </h2>

          {organizations.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
              No organizations found.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {organizations.map((org) => (
                <div
                    key={org._id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl hover:border-blue-500 hover:scale-[1.02] transition duration-300"
                  >
                    <div className="flex justify-between items-start mb-4">

                      <div className="flex-1">
                      {editingId === org._id ? (
                          <>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 mb-3 outline-none focus:border-blue-500"
                            />

                            <textarea
                              rows="3"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500"
                            />
                          </>
                        ) : (
                          <>
                            <h3 className="text-2xl font-bold">
                              {org.name}
                            </h3>

                            <p className="text-slate-400 mt-2">
                              {org.description}
                            </p>
                          </>
                        )}
                      </div>

                      <div className="bg-blue-600 px-3 py-1 rounded-full text-sm">
                        {org.members.length} Members
                      </div>

                    </div>

                    <div className="border-t border-slate-700 pt-4">

                      <p className="text-sm text-slate-500 mb-4">
                        Created: {new Date(org.createdAt).toLocaleDateString()}
                      </p>

                      {editingId === org._id ? (
                        <div className="grid grid-cols-2 gap-3 mt-4">

                        <button
                          type="button"
                          onClick={handleUpdateOrganization}
                          className="bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition"
                        >
                          Save
                        </button>

                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditName("");
                          setEditDescription("");
                        }}
                        className="bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition"
                      >
                        Cancel
                      </button>

                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-2 gap-3">

                          <button
                            type="button"
                            onClick={() => handleEditClick(org)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-medium transition"
                          >
                            Edit
                          </button>

                         <button
                            type="button"
                            onClick={() => handleDeleteOrganization(org._id)}
                            className="bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition"
                          >
                            Delete
                          </button>

                        </div>

                        <button
                          type="button"
                          onClick={() => handleInviteClick(org._id)}
                          className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
                        >
                          Invite Member
                        </button>
                      </>
                    )}

                      </div>
                  </div>
              ))}
            </div>
          )}

                </div>

      </div>

      {showInviteModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-slate-900 p-8 rounded-xl w-[420px]">

            <h2 className="text-2xl font-bold mb-6">
              Invite Member
            </h2>

            <input
              type="email"
              placeholder="Enter member email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 mb-6 outline-none focus:border-blue-500"
            />

            <div className="flex gap-4">

              <button
                type="button"
                onClick={handleInviteMember}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
              >
                Send Invite
              </button>

              <button
                type="button"
                onClick={() => setShowInviteModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg"
              >
                Cancel
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default Organizations;
  
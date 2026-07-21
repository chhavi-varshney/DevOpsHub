const TaskFilters = ({
  search,
  setSearch,
  status,
  setStatus,
  priority,
  setPriority,
  project,
  setProject,
  projects,
  clearFilters,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search Task..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 outline-none focus:border-blue-500"
        />

        {/* Status */}
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3"
        >
          <option value="All">All Status</option>
          <option value="To Do">To Do</option>
          <option value="In Progress">In Progress</option>
          <option value="Review">Review</option>
          <option value="Done">Done</option>
        </select>

        {/* Priority */}
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3"
        >
          <option value="All">All Priority</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        {/* Project */}
        <select
          value={project}
          onChange={(e) => setProject(e.target.value)}
          className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-3"
        >
          <option value="All">All Projects</option>

          {projects.map((item) => (
            <option key={item._id} value={item._id}>
              {item.name}
            </option>
          ))}
        </select>

        {/* Clear */}
        <button
          onClick={clearFilters}
          className="bg-red-600 hover:bg-red-700 rounded-lg px-4 py-3 font-semibold"
        >
          Clear Filters
        </button>

      </div>
    </div>
  );
};

export default TaskFilters;
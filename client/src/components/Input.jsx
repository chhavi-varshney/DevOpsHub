function Input({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
}) {
  return (
    <div className="mb-5">
      <label className="block mb-2 text-sm text-slate-300">
        {label}
      </label>

      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-4 py-3 rounded-lg bg-slate-800 text-white border
        ${
          error
            ? "border-red-500"
            : "border-slate-700 focus:border-blue-500"
        }
        focus:outline-none`}
      />

      {error && (
        <p className="text-red-400 text-sm mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

export default Input;
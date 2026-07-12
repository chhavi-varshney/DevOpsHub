import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";

import Logo from "../components/Logo";
import Input from "../components/Input";
import Button from "../components/Button";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      return setMessage("Invalid or Missing Reset Token");
    }

    try {
      setLoading(true);
      setMessage("");

      const res = await api.post("/auth/reset-password", {
        token,
        password,
      });

      setMessage(res.data.message);

      setPassword("");

      // Redirect to login after success
      setTimeout(() => {
        navigate("/");
      }, 2000);

    } catch (error) {
      setMessage(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex justify-center items-center px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8">

        <Logo />

        {message && (
          <p
            className={`text-center mb-4 ${
              message.toLowerCase().includes("success")
                ? "text-green-400"
                : "text-red-400"
            }`}
          >
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>

          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            text={loading ? "Resetting..." : "Reset Password"}
            type="submit"
          />

        </form>

        <p className="text-center mt-5">
          <Link
            to="/"
            className="text-blue-400"
          >
            Back to Login
          </Link>
        </p>

      </div>
    </div>
  );
}

export default ResetPassword;
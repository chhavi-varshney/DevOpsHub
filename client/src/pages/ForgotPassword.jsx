import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

import Logo from "../components/Logo";
import Input from "../components/Input";
import Button from "../components/Button";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const res = await api.post("/auth/forgot-password", {
        email,
      });

      setMessage(res.data.message);

      setEmail("");
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
          <p className="text-center text-green-400 mb-5">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit}>

          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            type="submit"
            text={loading ? "Sending..." : "Send Reset Link"}
          />

        </form>

        <p className="text-center text-slate-400 mt-5">
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

export default ForgotPassword;
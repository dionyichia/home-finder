import React, { useState } from "react";
import { api } from "~/api";

interface SignInFormProps {
  onToggleForm: () => void;
  onLoginSuccess: (userId: number) => void;
}

export default function SignInForm({ onToggleForm, onLoginSuccess }: SignInFormProps) {
  const [formData, setFormData] = useState({
    username_or_email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      const response = await api.verifyUser(formData);
      setSuccess("Login successful!");
      onLoginSuccess(response.user_id);
    } catch (err: any) {
      setError(err.message || "Sign in failed.");
    }
  };

  const isFormValid = formData.username_or_email.trim() !== "" && formData.password.trim() !== "";

  return (
    <div className="w-full max-w-md p-8 bg-white/30 backdrop-blur-md rounded-xl shadow-xl border border-white/20 transition-all duration-300">
      <h2 className="text-2xl font-bold text-center mb-6 text-purple-700">Sign In</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username_or_email" className="block text-sm font-medium text-gray-700">
            Email or Username
          </label>
          <input
            id="username_or_email"
            name="username_or_email"
            type="text"
            value={formData.username_or_email}
            onChange={handleChange}
            placeholder="Enter email or username"
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white/70 backdrop-blur-sm"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter password"
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 shadow-sm focus:ring-purple-500 focus:border-purple-500 bg-white/70 backdrop-blur-sm"
          />
        </div>

        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full px-4 py-2 rounded-md font-medium transition duration-200 ${
            isFormValid
              ? "bg-gradient-to-r from-purple-500 to-purple-700 text-white hover:from-purple-600 hover:to-purple-800"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          Sign In
        </button>
      </form>

      {error && <p className="mt-3 text-center text-red-600 text-sm">{error}</p>}
      {success && <p className="mt-3 text-center text-green-600 text-sm">{success}</p>}

      <p className="mt-4 text-center text-sm text-gray-700">
        Don’t have an account?{" "}
        <button onClick={onToggleForm} className="text-purple-600 hover:underline font-medium">
          Sign up
        </button>
      </p>
    </div>
  );
}

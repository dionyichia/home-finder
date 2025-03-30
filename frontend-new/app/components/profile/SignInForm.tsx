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
      onLoginSuccess(response.user_id); // Pass user ID to ProfilePage
    } catch (err: any) {
      setError(err.message || "Sign in failed.");
    }
  };

  const isFormValid = formData.username_or_email.trim() !== "" && formData.password.trim() !== "";

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-semibold text-purple-700 text-center">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username_or_email" className="block text-sm font-medium text-gray-600">
            Email or Username
          </label>
          <input
            id="username_or_email"
            name="username_or_email"
            type="text"
            value={formData.username_or_email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter email or username"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-600">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-purple-500 focus:border-purple-500"
            placeholder="Enter password"
          />
        </div>
        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full px-4 py-2 rounded-md transition duration-200 ${
            isFormValid ? "bg-purple-600 hover:bg-purple-700 text-white" : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          Sign In
        </button>
      </form>
      {error && <p className="mt-3 text-center text-red-600 text-sm">{error}</p>}
      {success && <p className="mt-3 text-center text-green-600 text-sm">{success}</p>}
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <button onClick={onToggleForm} className="text-purple-600 hover:underline">
          Sign up
        </button>
      </p>
    </div>
  );
}

import React, { useState } from "react";
import { api } from "../api";

interface SignInFormProps {
  onToggleForm: () => void;
}

export default function SignInForm({ onToggleForm }: SignInFormProps) {
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
      // Call the verifyUser API endpoint with the sign in credentials.
      const response = await api.verifyUser(formData);
      console.log("Sign in form submitted:", response);
      setSuccess(response.message);
      // Optionally, redirect the user upon successful sign in.
    } catch (err: any) {
      console.error("Sign in error:", err);
      setError(err.message || "Sign in failed.");
    }
  };

  // Validate that both fields are filled in.
  const isFormValid =
    formData.username_or_email.trim() !== "" && formData.password.trim() !== "";

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h1 className="font-bold">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="user_email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="user_email"
            name="user_email"
            type="email"
            value={formData.username_or_email}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Insert here"
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
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            placeholder="Insert here"
          />
        </div>
        <button
          type="submit"
          disabled={!isFormValid}
          className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
            !isFormValid ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          Sign In
        </button>
      </form>
      {error && (
        <p className="mt-4 text-center text-sm text-red-600">{error}</p>
      )}
      {success && (
        <p className="mt-4 text-center text-sm text-green-600">{success}</p>
      )}
      <p className="mt-4 text-center text-sm text-gray-600">
        Don't have an account?{" "}
        <button onClick={onToggleForm} className="text-blue-600 hover:underline">
          Sign up
        </button>
      </p>
    </div>
  );
}
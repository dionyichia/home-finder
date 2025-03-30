import React, { useState } from "react";
import { api } from "../api";
import type { UserRegistrationData } from "../api";

interface SignUpFormProps {
  onToggleForm: () => void;
}

export default function SignUpForm({ onToggleForm }: SignUpFormProps) {
  // State for controlling the step in the multi-step form
  const [step, setStep] = useState(1);

  // Combined state for all registration data.
  const [formData, setFormData] = useState<UserRegistrationData>({
    username: "",
    user_email: "",
    password: "",
    price: "",
    crime_rate: "",
    schools: "",
    malls: "",
    transport: "",
    importance_rank: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Validate fields for step 1 (basic information)
  const isStep1Valid =
    formData.username.trim() !== "" &&
    formData.user_email.trim() !== "" &&
    formData.password.trim() !== "";

  // Validate fields for step 2 (additional preferences)
  const isStep2Valid =
    formData.price.trim() !== "" &&
    formData.crime_rate.trim() !== "" &&
    formData.schools.trim() !== "" &&
    formData.malls.trim() !== "" &&
    formData.transport.trim() !== "" &&
    formData.importance_rank.trim() !== "";

  // Update state when input values change.
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Step 1 submission: Check if user exists and move to step 2 if not.
  const handleNext = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isStep1Valid) return;
    setError(null);

    try {
      // Call the checkUserExist API method with partial credentials
      await api.checkUserExist({
        username: formData.username,
        user_email: formData.user_email,
      });
      // If no error thrown, proceed to step 2
      setStep(2);
    } catch (err: any) {
      // If an error occurs (i.e. user exists), show an error message.
      setError(err.message || "User already exists, please try again.");
    }
  };

  // Final form submission in step 2.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isStep2Valid) return; // Prevent submission if fields are missing

    try {
      const response = await api.registerUser(formData);
      console.log("Form submitted:", response);
      setSuccess(response.message);
      // Optionally, reset form or redirect upon success.
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed.");
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
      <h1 className="font-bold">
        {step === 1 ? "Sign Up" : "Set Preferences"}
      </h1>
      {step === 1 && (
        <form onSubmit={handleNext} className="space-y-4">
          {/* Basic Registration Fields */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Insert here"
            />
          </div>
          <div>
            <label
              htmlFor="user_email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="user_email"
              name="user_email"
              type="email"
              value={formData.user_email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Insert here"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
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
          <p className="mt-1 text-xs text-gray-500">
            Your password must be at least 8 characters long.
          </p>
          <button
            type="submit"
            disabled={!isStep1Valid}
            className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              !isStep1Valid ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Next
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Additional Registration Fields */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Price
            </label>
            <input
              id="price"
              name="price"
              type="text"
              value={formData.price}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Insert here"
            />
          </div>
          <div>
            <label
              htmlFor="crime_rate"
              className="block text-sm font-medium text-gray-700"
            >
              Crime Rate
            </label>
            <input
              id="crime_rate"
              name="crime_rate"
              type="text"
              value={formData.crime_rate}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Insert here"
            />
          </div>
          <div>
            <label
              htmlFor="schools"
              className="block text-sm font-medium text-gray-700"
            >
              Schools
            </label>
            <input
              id="schools"
              name="schools"
              type="text"
              value={formData.schools}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Insert here"
            />
          </div>
          <div>
            <label
              htmlFor="malls"
              className="block text-sm font-medium text-gray-700"
            >
              Malls
            </label>
            <input
              id="malls"
              name="malls"
              type="text"
              value={formData.malls}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Insert here"
            />
          </div>
          <div>
            <label
              htmlFor="transport"
              className="block text-sm font-medium text-gray-700"
            >
              Transport
            </label>
            <input
              id="transport"
              name="transport"
              type="text"
              value={formData.transport}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Insert here"
            />
          </div>
          <div>
            <label
              htmlFor="importance_rank"
              className="block text-sm font-medium text-gray-700"
            >
              Importance Rank
            </label>
            <input
              id="importance_rank"
              name="importance_rank"
              type="text"
              value={formData.importance_rank}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Insert here"
            />
          </div>
          <button
            type="submit"
            disabled={!isStep2Valid}
            className={`w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              !isStep2Valid ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Submit
          </button>
        </form>
      )}

      {error && <p className="mt-4 text-center text-sm text-red-600">{error}</p>}
      {success && <p className="mt-4 text-center text-sm text-green-600">{success}</p>}

      {/* Toggle link to SignInForm */}
      <p className="mt-4 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button onClick={onToggleForm} className="text-blue-600 hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { api } from "~/api";
import type { UserRegistrationData } from "~/api";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";

interface SignUpFormProps {
  onToggleForm: () => void;
  onSignupSuccess: (userId: number) => void;
}

// Preference option type for the drag and drop ranking
interface PreferenceOption {
  id: string;
  label: string;
}

export default function SignUpForm({ onToggleForm, onSignupSuccess }: SignUpFormProps) {
  // State for controlling the step in the multi-step form
  const [step, setStep] = useState(1);

  // Preference options for ranking
  const [preferences, setPreferences] = useState<PreferenceOption[]>([
    { id: "price", label: "Price" },
    { id: "crime_rate", label: "Crime Rate" },
    { id: "schools", label: "Schools" },
    { id: "malls", label: "Malls" },
    { id: "transport", label: "Transport" },
  ]);

  // Combined state for all registration data
  const [formData, setFormData] = useState<UserRegistrationData>({
    username: "",
    user_email: "",
    password: "",
    price: "1000000", // Default to middle of range
    crime_rate: "50", // Default to middle of range
    schools: "10", // Default to middle of range
    malls: "10", // Default to middle of range
    transport: "10", // Default to middle of range
    importance_rank: [],
  });

  // Password validation state
  const [passwordValid, setPasswordValid] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Update importance_rank whenever preferences order changes
  useEffect(() => {
    setFormData({
      ...formData,
      importance_rank: preferences.map(pref => pref.id),
    });
  }, [preferences]);

  // Validate fields for step 1 (basic information)
  const isStep1Valid =
    formData.username.trim() !== "" &&
    formData.user_email.trim() !== "" &&
    passwordValid;

  // Validate fields for step 2 (additional preferences)
  const isStep2Valid = true; // All sliders have default values now

  // Update state when input values change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Special handling for password validation
    if (name === "password") {
      if (value.length < 8) {
        setPasswordValid(false);
        setPasswordError("Password must be at least 8 characters long");
      } else {
        setPasswordValid(true);
        setPasswordError("");
      }
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle slider changes
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle drag and drop for preference ranking
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const items = Array.from(preferences);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setPreferences(items);
  };

  // Step 1 submission: Check if user exists and move to step 2 if not
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
      // If an error occurs (i.e. user exists), show an error message
      setError(err.message || "User already exists, please try again.");
    }
  };

  // Final form submission in step 2
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isStep2Valid) return; // Prevent submission if fields are missing

    try {
      // Ensure importance_rank is formatted correctly for API
      const finalFormData = {
        ...formData,
        importance_rank: preferences.map(pref => pref.id),
      };
      
      const response = await api.registerUser(finalFormData);
      console.log("Form submitted:", response);

      onSignupSuccess(response.user_id); // Pass user ID to ProfilePage
      setSuccess(response.message);
      // Optionally, reset form or redirect upon success
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed.");
    }
  };

  // Format currency for price display
  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      maximumFractionDigits: 0 
    }).format(Number(value));
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md border-t-4 border-purple-300">
      <h1 className="text-2xl font-bold text-purple-600 mb-6 text-center">
        {step === 1 ? "Create Account" : "Set Home Preferences"}
      </h1>
      
      {/* Progress indicator */}
      <div className="flex mb-6">
        <div className={`h-1 flex-1 ${step === 1 ? 'bg-purple-500' : 'bg-blue-300'} rounded-l`}></div>
        <div className={`h-1 flex-1 ${step === 2 ? 'bg-purple-500' : 'bg-blue-100'} rounded-r`}></div>
      </div>

      {step === 1 && (
        <form onSubmit={handleNext} className="space-y-4">
          {/* Basic Registration Fields */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-purple-300 focus:border-purple-300"
              placeholder="John Smith"
              required
            />
          </div>
          
          <div>
            <label
              htmlFor="user_email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              id="user_email"
              name="user_email"
              type="email"
              value={formData.user_email}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-3 focus:ring-purple-300 focus:border-purple-300"
              placeholder="john@example.com"
              required
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
              className={`mt-1 block w-full border ${passwordError ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm p-3 focus:ring-purple-300 focus:border-purple-300`}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
            />
            {passwordError && (
              <p className="mt-1 text-xs text-red-500">{passwordError}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={!isStep1Valid}
            className={`w-full px-4 py-3 mt-4 bg-gradient-to-r from-purple-400 to-blue-400 text-white rounded-md hover:from-purple-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-300 transition-colors ${
              !isStep1Valid ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Continue
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Price Slider */}
          <div>
            <div className="flex justify-between items-center">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price
              </label>
              <span className="text-sm font-medium text-purple-600">
                {formatCurrency(formData.price)}
              </span>
            </div>
            <input
              id="price"
              name="price"
              type="range"
              min="0"
              max="2000000"
              step="50000"
              value={formData.price}
              onChange={handleSliderChange}
              className="mt-2 w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>$0</span>
              <span>$2,000,000</span>
            </div>
          </div>
          
          {/* Crime Rate Slider */}
          <div>
            <div className="flex justify-between items-center">
              <label
                htmlFor="crime_rate"
                className="block text-sm font-medium text-gray-700"
              >
                Crime Rate
              </label>
              <span className="text-sm font-medium text-purple-600">
                {formData.crime_rate}/100
              </span>
            </div>
            <input
              id="crime_rate"
              name="crime_rate"
              type="range"
              min="1"
              max="100"
              value={formData.crime_rate}
              onChange={handleSliderChange}
              className="mt-2 w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Low (1)</span>
              <span>High (100)</span>
            </div>
          </div>
          
          {/* Number of Schools Slider */}
          <div>
            <div className="flex justify-between items-center">
              <label
                htmlFor="schools"
                className="block text-sm font-medium text-gray-700"
              >
                Number of Schools
              </label>
              <span className="text-sm font-medium text-purple-600">
                {formData.schools}
              </span>
            </div>
            <input
              id="schools"
              name="schools"
              type="range"
              min="1"
              max="20"
              value={formData.schools}
              onChange={handleSliderChange}
              className="mt-2 w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>20</span>
            </div>
          </div>
          
          {/* Number of Malls Slider */}
          <div>
            <div className="flex justify-between items-center">
              <label
                htmlFor="malls"
                className="block text-sm font-medium text-gray-700"
              >
                Number of Malls
              </label>
              <span className="text-sm font-medium text-purple-600">
                {formData.malls}
              </span>
            </div>
            <input
              id="malls"
              name="malls"
              type="range"
              min="1"
              max="20"
              value={formData.malls}
              onChange={handleSliderChange}
              className="mt-2 w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>20</span>
            </div>
          </div>
          
          {/* Number of Stations Slider */}
          <div>
            <div className="flex justify-between items-center">
              <label
                htmlFor="transport"
                className="block text-sm font-medium text-gray-700"
              >
                Number of Stations
              </label>
              <span className="text-sm font-medium text-purple-600">
                {formData.transport}
              </span>
            </div>
            <input
              id="transport"
              name="transport"
              type="range"
              min="1"
              max="20"
              value={formData.transport}
              onChange={handleSliderChange}
              className="mt-2 w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1</span>
              <span>20</span>
            </div>
          </div>
          
          {/* Importance Ranking with Drag and Drop */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rank in terms of Importance
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Drag and drop to reorder. Most important on the left.
            </p>
            
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="preferences" direction="horizontal">
                {(provided) => (
                  <div
                    className="flex space-x-2 bg-blue-50 p-4 rounded-lg"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {preferences.map((pref, index) => (
                      <Draggable key={pref.id} draggableId={pref.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="flex-1 bg-white border border-purple-200 p-2 rounded-md text-center text-sm font-medium shadow-sm cursor-move hover:bg-purple-50 transition-colors"
                          >
                            <div className="text-gray-600">{pref.label}</div>
                            <div className="text-xs text-purple-500 mt-1">#{index + 1}</div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 px-4 py-3 border border-purple-300 text-purple-600 rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-300 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-400 to-blue-400 text-white rounded-md hover:from-purple-500 hover:to-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-300 transition-colors"
            >
              Complete Setup
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 text-green-600 text-sm rounded-md">
          {success}
        </div>
      )}

      {/* Toggle link to SignInForm */}
      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <button onClick={onToggleForm} className="text-blue-500 hover:text-blue-600 hover:underline">
          Sign in
        </button>
      </p>
    </div>
  );
}
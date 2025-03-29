import React, { useState } from "react";
import SignUpForm from "../components/SignUpForm";
import SignInForm from "../components/SignInForm";

export default function AuthPage() {
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {showSignIn ? (
        <SignInForm onToggleForm={() => setShowSignIn(false)} />
      ) : (
        <SignUpForm onToggleForm={() => setShowSignIn(true)} />
      )}
    </div>
  );
}
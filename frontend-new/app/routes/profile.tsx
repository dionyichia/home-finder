import React, { useState, useEffect } from "react";
import SignUpForm from "~/components/profile/SignUpForm";
import SignInForm from "~/components/profile/SignInForm";
import UserProfile from "~/components/profile/UserProfile";
import { useNavigate } from "react-router";

export default function ProfilePage() {
  const [showSignIn, setShowSignIn] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userId = sessionStorage.getItem("user_id");
    setIsLoggedIn(!!userId);
  }, []);

  const handleLogin = (userId: number) => {
    setUserId(userId);
    sessionStorage.setItem("user_id", userId.toString());
    setIsLoggedIn(true);
    navigate("/")
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-50 to-white">
      {isLoggedIn ? (
        <UserProfile />
      ) : (
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
          {showSignIn ? (
            <SignInForm 
              onToggleForm={() => setShowSignIn(false)} 
              onLoginSuccess={handleLogin} 
            />
          ) : (
            <SignUpForm 
              onToggleForm={() => setShowSignIn(true)}
              onSignupSuccess={handleLogin} 
            />
          )}
        </div>
      )}
    </div>
  );
}

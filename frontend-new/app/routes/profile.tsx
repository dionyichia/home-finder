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
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E0C3FC] via-[#8EC5FC] to-[#FFFFFF] px-4">
      {isLoggedIn ? (
        <UserProfile />
      ) : showSignIn ? (
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
  );
}
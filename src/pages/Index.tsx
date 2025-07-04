import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "@/components/auth/LoginForm";
import { useAuth } from "@/context/AuthContext";

const Index = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { user, login } = useAuth();

  useEffect(() => {
    // If user is already logged in, redirect to activities
    if (user) {
      navigate('/activities');
    }
  }, [user, navigate]);

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    navigate('/activities');
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
  };

  return (
    <LoginForm 
      onLogin={handleLogin}
      onToggleMode={toggleAuthMode}
      isSignUp={isSignUp}
    />
  );
};

export default Index;

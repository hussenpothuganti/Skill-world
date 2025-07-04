import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { toast } from "react-hot-toast";
import ForgotPasswordForm from "./ForgotPasswordForm";

// Added type definition for AuthMode
type AuthMode = "login" | "signup" | "forgot-password";

const AuthForm = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { login, signup, isLoading } = useAuth();
  // Added state to track if component is mounted
  const [isMounted, setIsMounted] = useState(true);

  // Added cleanup for async operations
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || (mode === "signup" && !fullName)) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await signup(email, password, fullName);
      }
      // Only update state if component is still mounted
      if (isMounted) {
        // Success handling would be here
      }
    } catch (error) {
      console.error("Authentication error:", error);
      // Only update state if component is still mounted
      if (isMounted) {
        toast.error("Authentication failed. Please check your credentials and try again.");
      }
    }
  };

  const toggleMode = () => {
    setMode(mode === "login" ? "signup" : "login");
  };

  const handleForgotPassword = () => {
    setMode("forgot-password");
  };

  const handleBackToLogin = () => {
    setMode("login");
  };

  if (mode === "forgot-password") {
    return <ForgotPasswordForm onBackToLogin={handleBackToLogin} />;
  }

  return (
    <Card className="w-[350px] md:w-[400px] shadow-lg animate-scale-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl text-center">
          {mode === "login" ? "Welcome Back!" : "Create Account"}
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                disabled={isLoading}
                aria-label="Full Name"
                required={mode === "signup"}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              aria-label="Email"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              aria-label="Password"
              required
            />
          </div>
          {mode === "login" && (
            <div className="text-sm text-right">
              <button 
                type="button"
                onClick={handleForgotPassword}
                className="text-primary hover:underline focus:outline-none"
                aria-label="Forgot password"
              >
                Forgot password?
              </button>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full skill-gradient hover:opacity-90 transition-opacity"
            disabled={isLoading}
            aria-label={mode === "login" ? "Login" : "Sign Up"}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : mode === "login" ? (
              "Login"
            ) : (
              "Sign Up"
            )}
          </Button>
          <div className="text-center text-sm">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            <button
              type="button"
              onClick={toggleMode}
              className="ml-1 text-primary hover:underline focus:outline-none"
              aria-label={mode === "login" ? "Switch to sign up" : "Switch to login"}
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default AuthForm;

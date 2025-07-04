import { useState, useEffect, useRef } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { toast } from "sonner";

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

const ForgotPasswordForm = ({ onBackToLogin }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // Added ref to track component mount state
  const isMounted = useRef(true);

  // Added cleanup for async operations
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Only update state if component is still mounted
      if (isMounted.current) {
        setIsSubmitted(true);
        toast.success("Password reset instructions sent to your email");
      }
    } catch (error) {
      console.error("Password reset error:", error);
      // Only update state if component is still mounted
      if (isMounted.current) {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      // Only update state if component is still mounted
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  };

  if (isSubmitted) {
    return (
      <Card className="w-[350px] md:w-[400px] shadow-lg animate-scale-in">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">
            We've sent password reset instructions to:
          </p>
          <p className="font-medium mb-6">{email}</p>
          <p className="text-sm text-muted-foreground">
            If you don't see the email, check your spam folder or make sure you entered the correct email address.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            onClick={onBackToLogin}
            className="w-full"
            variant="outline"
            aria-label="Back to Login"
          >
            Back to Login
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-[350px] md:w-[400px] shadow-lg animate-scale-in">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground mb-4">
            Enter your email address and we'll send you instructions to reset your password.
          </p>
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
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button 
            type="submit" 
            className="w-full skill-gradient hover:opacity-90 transition-opacity"
            disabled={isLoading}
            aria-label="Send Reset Instructions"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              "Send Reset Instructions"
            )}
          </Button>
          <div className="text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-sm text-primary hover:underline focus:outline-none"
              aria-label="Back to Login"
            >
              Back to Login
            </button>
          </div>
        </CardFooter>
      </form>
    </Card>
  );
};

export default ForgotPasswordForm;

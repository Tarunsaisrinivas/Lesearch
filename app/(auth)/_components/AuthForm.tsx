"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FcGoogle } from "react-icons/fc";
import { FiInfo } from "react-icons/fi";
import Link from "next/link";
import { IoCloseCircleOutline } from "react-icons/io5";
import OtpInput from "react-otp-input";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ Logintype }: { Logintype: "login" | "signup" }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState<boolean>(false);
  const supabase = createClient();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const Login = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Sign in using Supabase's `signInWithPassword` method
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      console.log(error?.message);
      if (error) {
        if (error.message === "Invalid login credentials") {
          setError(
            "Invalid credentials. Please check your email and password.",
          );
        } else {
          setError(error.message);
        }
        return;
      }

      // Redirect on successful login
      if (data.session) {
        router.push("/documents");
      }
    } catch (error) {
      console.error("Unexpected error during login:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const requestOTP = async () => {
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch(
        "/api/auth/request-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );
      const data = await response.json();
      if (response.ok) {
        setShowOtpInput(true);
        setResendTimer(30);
      } else {
        if (
          data.message === "An OTP is already active. Please check your email."
        ) {
          setShowOtpInput(true);
          setResendTimer(30);
        }
        setError(data.message);
      }
    } catch (error) {
      console.log(error);
      setError("Failed to send OTP. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const validatePassword = (password: string) => {
    // Regular expression to validate password: 8+ characters, at least 1 lowercase, 1 uppercase, and 1 digit
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Validate password against regex
    if (!validatePassword(password) && !validatePassword(confirmPassword)) {
      setError(
        "Password must contain at least 8 characters, 1 lowercase letter, 1 uppercase letter, and 1 digit.",
      );
      return;
    }

    // Check if password and confirm password match (only for signup)
    if (Logintype === "signup" && password !== confirmPassword) {
      setError("Passwords must match");
      return;
    }

    setIsLoading(true);

    try {
      if (Logintype === "signup") {
        // Trigger OTP request for signup
        await requestOTP();
      } else {
        // Handle login for existing users
        await Login();
      }
    } catch (err) {
      console.log(err);
      setError("An error occurred while processing your request");
    } finally {
      setIsLoading(false); // Always reset loading state
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer === 0) {
      setOtp("");
      setError(null);
      await requestOTP();
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/api/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
    } else {
      router.push("/documents");
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, otp }),
      });
      const data = await response.json();
      if (response.ok) {
        await Login();
      } else if (data.error) {
        setError(data.error);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAll = () => {
    setShowOtpInput(false);
    setIsLoading(false);
    setError(null);
    setOtp("");
  };

  return (
    <>
      <div>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          {Logintype === "login" ? (
            <p>Welcome Back!!</p>
          ) : (
            <p>Create your account!!</p>
          )}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          {Logintype === "login"
            ? "Please sign in to your account"
            : showOtpInput
              ? "Check your mail for verification code"
              : "Sign Up to get started"}
        </p>
      </div>
      <div className="w-full max-w-md space-y-8">
        {error && (
          <Alert variant="destructive">
            <div className="flex justify-between">
              <AlertTitle>Error</AlertTitle>
              <IoCloseCircleOutline onClick={() => setError(null)} />
            </div>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {showOtpInput ? (
          <form onSubmit={handleOtpSubmit} className="mt-8 space-y-6">
            <div>
              <Label htmlFor="otp">Enter OTP</Label>
              <OtpInput
                value={otp}
                onChange={setOtp}
                numInputs={4}
                shouldAutoFocus
                renderSeparator={<span>-</span>}
                renderInput={(props) => <Input {...props} />}
                inputStyle="!w-12 h-12 mx-4 text-2xl rounded border border-black/30 select-none"
                containerStyle="flex justify-between mt-1"
              />
            </div>
            <Button type="submit" className="w-full">
              Verify OTP
            </Button>
            <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {resendTimer > 0 ? (
                <p>Resend OTP in {resendTimer} seconds</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Resend OTP
                </button>
              )}
            </div>
            <div className="mt-5 flex justify-center gap-x-1 text-sm ">
              <Button
                variant="link-blue"
                className="h-auto p-0 font-normal"
                onClick={clearAll}
              >
                Go Back
              </Button>
            </div>
          </form>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 dark:bg-black"
                />
              </div>
              <div className="relative">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 mb-2 dark:bg-black"
                />

                {Logintype === "signup" && (
                  <>
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="mt-1"
                    />
                  </>
                )}
                <div className="absolute top-0 right-0 mt-1 mr-2 cursor-pointer group">
                  <FiInfo className="w-5 h-5 text-gray-500" />
                  <div className="hidden group-hover:block absolute top-full right-0 w-64 p-2 mt-1 text-sm text-white bg-gray-800 rounded-md shadow-lg">
                    Password must contain at least:
                    <ul className="list-disc ml-4">
                      <li>8 characters</li>
                      <li>1 lowercase letter</li>
                      <li>1 uppercase letter</li>
                      <li>1 digit (0-9)</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? `${Logintype === "login" ? "Signing In..." : "Loading..."}`
                  : `${Logintype === "login" ? "Sign In" : "Create Account"}`}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-black text-gray-500 ">
                    Or continue with
                  </span>
                </div>
              </div>
              <div className="mt-6">
                <Button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center"
                  variant="outline"
                >
                  <FcGoogle className="w-5 h-5 mr-2" />
                  Google
                </Button>
              </div>
            </div>
            <div className="mt-5 flex justify-center gap-x-1 text-sm">
              {Logintype === "login" ? (
                <p>Don&apos;t have an account?</p>
              ) : (
                <p>Have an account?</p>
              )}
              <Button
                variant="link-blue"
                className="h-auto p-0 mb-3 font-normal"
                asChild
              >
                <Link href={Logintype === "login" ? "/signup" : "/login"} className="no-underline">
                  {Logintype === "login" ? "Sign Up here" : "Login here"}
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}

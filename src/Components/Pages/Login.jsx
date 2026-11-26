"use client";
import React, { useState, useEffect } from "react";
import { login } from "../../services/AuthService";
import { Eye, EyeOff, Mail, Lock, LogIn, Theater } from "lucide-react";
import Header from "../Header/Header";
import "../../assets/css/Login.css";
import Footer from "../Footer/Footer";
import { useNavigate } from "../../utils/useNavigateCompat";
import { useAuth } from "../../utils/AuthContext";
import GoogleLoginButton from "../GoogleLoginButton";
import notify from "../../utils/notify";
import StageDramaButton from "../common/StageDramaButton";

const Login = ({ onLoginSuccess }) => {
  const navigate = useNavigate();
  const { user, setUser, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (user) {
      const route = getDashboardRoute(user.role);
      navigate(route);
    }
  }, [user, loading, navigate]);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (loginError) setLoginError("");
  };

  // Function to determine dashboard route based on user role
  const getDashboardRoute = (userRole) => {
    switch (userRole?.toLowerCase()) {
      case "admin":
        return "/admin-dashboard";
      case "theater manager":
      case "theater_manager":
      case "theatermanager":
        return "/theater-manager-dashboard";
      case "organizer":
        return "/organizer-dashboard";
      case "customer":
        return "/user-dashboard";
      default:
        return "/user-dashboard";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    try {
      const response = await login(loginData.email, loginData.password);

      const user = response.data;
      if (user) {
        notify.success(`Welcome back, ${user.fname} ${user.lname}!`);
        setUser(user);

        if (onLoginSuccess) onLoginSuccess({ user });

        const dashboardRoute = getDashboardRoute(user.role);
        navigate(dashboardRoute);
      }
    } catch (error) {
      let errMsg = "Login failed. Please check your credentials.";
      if (error.response) {
        const status = error.response.status;
        const message = error.response.data?.message || "Login failed";

        if (status === 401) {
          errMsg = "Invalid email or password";
        } else if (status === 400) {
          errMsg = "Please check your input";
        } else if (status === 500) {
          errMsg = "Server error. Please try again later";
        } else {
          errMsg = message;
        }
      } else if (error.request) {
        errMsg = "Network error. Please check your connection";
      } else {
        errMsg = "An unexpected error occurred";
      }

      setLoginError(errMsg);
      notify.error(errMsg);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 booking-btn rounded-full mb-4">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600">Please sign in to your account</p>
          </div>

          {/* Form */}
          <div className="space-y-6">
            {/* email Field */}
            <div className="relative">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="relative">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 animate-pulse">
                <p className="text-red-600 text-sm font-medium">{loginError}</p>
              </div>
            )}

            {/* Theatrical Stage Login Button */}
            <StageDramaButton
              fullWidth
              size="lg"
              variant="theatre"
              loading={isLoading}
              loadingText="Opening Backstage Pass..."
              disabled={isLoading || !loginData.email || !loginData.password}
              onClick={handleSubmit}
              icon={Theater}
            >
              Sign In
            </StageDramaButton>

            {/* Forgot Password */}
            <div className="mb-5 text-center">
              <a
                href="#"
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                Forgot your password?
              </a>
            </div>
          </div>

          <GoogleLoginButton />

          <div className="mt-3 pt-6 border-t border-gray-200">
            <p className="text-center text-gray-600">
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-blue-600 hover:text-blue-800 font-semibold transition-colors underline"
                disabled={isLoading}
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Login;

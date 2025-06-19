import React, { useState } from "react";
import "../../assets/css/Register.css";
import Logo from "../../assets/logo nataka white.png";
import { register } from "../../services/AuthService";
import { useNavigate } from "react-router-dom";

function Register({ switchToLogin, onRegisterSuccess }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    password: "",
    confirmPassword: "",
    role: "User",
    showRoleSelection: false,
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    // First Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last Name validation
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Mobile number validation (Sri Lankan format)
    const mobileRegex = /^(0|94|\+94)?[0-9]{9}$/;
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = "Mobile number is required";
    } else if (!mobileRegex.test(formData.mobileNumber.replace(/\s/g, ""))) {
      newErrors.mobileNumber = "Please enter a valid Sri Lankan mobile number";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    // Confirm Password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    // Role validation for special roles
    if (formData.showRoleSelection && !formData.role) {
      newErrors.role = "Please select your role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleToggle = () => {
    setFormData((prev) => ({
      ...prev,
      showRoleSelection: !prev.showRoleSelection,
      role: prev.showRoleSelection ? "User" : "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const apiPayload = {
        fname: formData.firstName.trim(),
        lname: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.mobileNumber.trim(),
        password: formData.password,
        image: "",
        role: formData.role,
      };
      const response = await register(apiPayload);

      if (response.data == "User Registered Successfully") {
        alert("Registration successful! Please login to continue.");
        if (onRegisterSuccess) {
          onRegisterSuccess(response.data);
           navigator ("/login");
        }
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          mobileNumber: "",
          password: "",
          confirmPassword: "",
          role: "User",
          showRoleSelection: false,
        });

      } else {
        alert(response.data || "Registration failed. Please try again.");
      }
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response) {
        alert(
          error.response.data.message ||
            "Registration failed. Please try again."
        );
      } else if (error.request) {
        alert("Network error. Please check your connection and try again.");
      } else {
        alert("Network error. Please check your connection and try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        {/* Left Side - Branding */}
        <div className="branding-side">
          <div className="branding-content">
            <a href="/" className="branding-logo-link">
              <img src={Logo}></img>
              <h2 className="mt-10 branding-subtitle"> - </h2>
            </a>
            <p className="branding-description">
              Sri Lanka's Premier Stage Drama Ticketing Platform
            </p>
            <div className="branding-features">
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span>Book tickets for amazing performances</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span>Discover new theatrical experiences</span>
              </div>
              <div className="feature-item">
                <div className="feature-dot"></div>
                <span>Support local theatre community</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="form-side">
          <div className="form-header">
            <h2 className="form-title">Create Account</h2>
            <p className="form-description">Join our theatre community today</p>
          </div>

          {/* Registration Form */}
          <div className="form-container">
            {/* Name Fields Row */}
            <div className="form-row">
              {/* First Name */}
              <div className="form-group">
                <label htmlFor="firstName" className="form-label">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`form-input ${errors.firstName ? "error" : ""}`}
                  placeholder="First name"
                />
                {errors.firstName && (
                  <p className="error-message">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div className="form-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`form-input ${errors.lastName ? "error" : ""}`}
                  placeholder="Last name"
                />
                {errors.lastName && (
                  <p className="error-message">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`form-input ${errors.email ? "error" : ""}`}
                placeholder="your.email@example.com"
              />
              {errors.email && <p className="error-message">{errors.email}</p>}
            </div>

            {/* Mobile Number */}
            <div className="form-group">
              <label htmlFor="mobileNumber" className="form-label">
                Mobile Number *
              </label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                className={`form-input ${errors.mobileNumber ? "error" : ""}`}
                placeholder="0771234567"
              />
              {errors.mobileNumber && (
                <p className="error-message">{errors.mobileNumber}</p>
              )}
            </div>

            {/* Password Fields Row */}
            <div className="form-row">
              {/* Password */}
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`form-input ${errors.password ? "error" : ""}`}
                  placeholder="Password"
                />
                {errors.password && (
                  <p className="error-message">{errors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="form-group">
                <label htmlFor="confirmPassword" className="form-label">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`form-input ${
                    errors.confirmPassword ? "error" : ""
                  }`}
                  placeholder="Confirm password"
                />
                {errors.confirmPassword && (
                  <p className="error-message">{errors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Role Selection */}
            <div className="role-section">
              <div className="role-checkbox-container">
                <input
                  type="checkbox"
                  id="roleToggle"
                  checked={formData.showRoleSelection}
                  onChange={handleRoleToggle}
                  className="role-checkbox"
                />
                <div className="role-checkbox-content">
                  <label htmlFor="roleToggle" className="role-checkbox-label">
                    I am a Theatre Manager or Event Organizer
                  </label>
                  <p className="role-checkbox-description">
                    Check this if you manage a theatre or organize drama events
                  </p>
                </div>
              </div>

              {/* Role Selection Dropdown */}
              {formData.showRoleSelection && (
                <div className="role-dropdown">
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`form-select ${errors.role ? "error" : ""}`}
                  >
                    <option value="">Select Your Role</option>
                    <option value="TheatreManager">Theatre Manager</option>
                    <option value="Organizer">Event Organizer</option>
                  </select>
                  {errors.role && (
                    <p className="error-message">{errors.role}</p>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="submit-button"
            >
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  Creating Account...
                </div>
              ) : (
                "Create Account"
              )}
            </button>

            {/* Login Link */}
            <p className="login-link-container">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="login-link">
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { Eye, EyeOff } from "lucide-react";
import Bowizzy from "../assets/bowizzy.png";

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [gender, setGender] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agree) return setError("You must agree to the terms to continue.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");

    try {
      await api.post("/auth", {
        type: "signup",
        email,
        password,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        phone_number: phoneNumber,
        linkedin_url: linkedinUrl,
        gender,
      });

      navigate("/login");
    } catch (err) {
      setError(err?.response?.data?.message || "Signup error");
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[700px_1fr] font-['Baloo_2']">

      {/* LEFT FIXED PANEL */}
      <div className="hidden md:flex flex-col justify-between bg-[#FFE9D6] p-12
                      sticky top-0 h-screen overflow-hidden">
        
        <img src={Bowizzy} alt="Logo" className="w-32" />

        <h1 className="text-4xl md:text-5xl font-semibold text-orange-700 leading-snug">
          Prep for interviews. <br /> Grow your career.
        </h1>

        <p className="text-sm text-gray-700">
          Ready to get started? Sign up for free.
        </p>
      </div>

      {/* RIGHT SCROLLABLE PANEL */}
      <div className="h-screen overflow-y-auto bg-white">
        <div className="max-w-3xl mx-auto px-6 py-10">

          <h2 className="text-2xl font-semibold text-gray-900 mb-10">
            Create Account
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* FORM GRID */}
            <div className="grid grid-cols-12 gap-4">

              {/* FIRST NAME */}
              <div className="col-span-12 md:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  First Name*
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="Enter your first name"
                />
              </div>

              {/* MIDDLE NAME */}
              <div className="col-span-12 md:col-span-6">
                <label className="block text-sm font-medium text-gray-700">
                  Middle Name
                </label>
                <input
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="Enter your middle name"
                />
              </div>

              {/* LAST NAME */}
              <div className="col-span-12">
                <label className="block text-sm font-medium text-gray-700">
                  Last Name*
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="Enter your last name"
                />
              </div>

              {/* PHONE */}
              <div className="col-span-12">
                <label className="block text-sm font-medium text-gray-700">
                  Phone Number*
                </label>
                <input
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* EMAIL */}
              <div className="col-span-12">
                <label className="block text-sm font-medium text-gray-700">
                  Email*
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="Enter your email"
                />
              </div>

              {/* LINKEDIN */}
              <div className="col-span-12">
                <label className="block text-sm font-medium text-gray-700">
                  LinkedIn URL*
                </label>
                <input
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  required
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>

              {/* GENDER */}
              <div className="col-span-12">
                <label className="block text-sm font-medium text-gray-700">
                  Gender*
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg 
                             focus:ring-2 focus:ring-orange-400 outline-none"
                >
                  <option value="">Select gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                  <option>Prefer not to say</option>
                </select>
              </div>

              {/* PASSWORD */}
              <div className="col-span-12">
                <label className="block text-sm font-medium text-gray-700">
                  Password*
                </label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               focus:ring-2 focus:ring-orange-400 outline-none"
                    placeholder="Enter a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="col-span-12">
                <label className="block text-sm font-medium text-gray-700">
                  Confirm Password*
                </label>
                <div className="relative mt-2">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg 
                               focus:ring-2 focus:ring-orange-400 outline-none"
                    placeholder="Re-enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3 text-gray-500"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* ERROR MESSAGE */}
            {error && <div className="text-red-500 text-sm">{error}</div>}

            {/* AGREEMENT */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="h-4 w-4 text-orange-500 border-gray-300 rounded"
              />
              <p className="text-sm text-gray-700">
                By continuing, I agree to the Wizzybox{" "}
                <span className="text-orange-600 font-medium cursor-pointer">
                  Terms of Service
                </span>{" "}
                and{" "}
                <span className="text-orange-600 font-medium cursor-pointer">
                  Privacy Policy
                </span>.
              </p>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={!agree}
              className={`w-full py-3 rounded-lg text-white font-medium ${
                agree
                  ? "bg-gray-700 hover:bg-gray-800"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              Sign Up
            </button>

            {/* SIGN IN LINK */}
            <p className="text-sm text-gray-700">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-orange-500 cursor-pointer font-medium hover:underline"
              >
                Sign in.
              </span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}

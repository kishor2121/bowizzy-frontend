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
  // Store only the LinkedIn username/handle part (the prefix is auto-filled)
  const [linkedinUsername, setLinkedinUsername] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState(""); // <-- Date Field State
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Allow only letters and spaces in name fields (prevents digits and special chars)
  const sanitizeName = (value: string) => {
    return value.replace(/[^A-Za-z\s]/g, "");
  };

  // Extract username from a full LinkedIn URL or sanitize a typed username
  const extractLinkedinUsername = (value: string) => {
    if (!value) return "";
    // If user pasted a full linkedin URL, try to extract the username
    const m = value.match(/linkedin\.com\/in\/([^/?#\s]+)/i);
    if (m && m[1]) return m[1];
    // Otherwise sanitize the value to allow letters, numbers and hyphens
    return value.replace(/[^A-Za-z0-9-]/g, "");
  };

  // Allow only digits for phone and limit length to 10
  const sanitizePhone = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 10);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!agree) return setError("You must agree to the terms to continue.");
    if (password !== confirmPassword)
      return setError("Passwords do not match.");

    // Validate phone number: must be 10 digits and start with 6-9
    if (!/^[6-9]\d{9}$/.test(phoneNumber))
      return setError("Phone number must be 10 digits and start with 6, 7, 8, or 9.");

    // Validate LinkedIn username
    if (!linkedinUsername || !/^[A-Za-z0-9-]+$/.test(linkedinUsername))
      return setError("Please enter a valid LinkedIn profile identifier.");

    try {
      await api.post("/auth", {
        type: "signup",
        email,
        password,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        phone_number: phoneNumber,
        date_of_birth: dateOfBirth, // <-- Added to Payload
        linkedin_url: `https://www.linkedin.com/in/${linkedinUsername}`,
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

            <div className="grid grid-cols-12 gap-4">

              {/* FIRST NAME */}
              <div className="col-span-12 md:col-span-6">
                <label className="block text-sm font-medium text-gray-700">First Name*</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(sanitizeName(e.target.value))}
                  required
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="Enter your first name"
                />
              </div>

              {/* MIDDLE NAME */}
              <div className="col-span-12 md:col-span-6">
                <label className="block text-sm font-medium text-gray-700">Middle Name</label>
                <input
                  value={middleName}
                  onChange={(e) => setMiddleName(sanitizeName(e.target.value))}
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="Enter your middle name"
                />
              </div>

              {/* LAST NAME */}
              <div className="col-span-12">
                <label className="block text-sm font-medium text-gray-700">Last Name*</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(sanitizeName(e.target.value))}
                  required
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="Enter your last name"
                />
              </div>

              {/* PHONE */}
              <div className="col-span-12">
                <label className="block text-sm font-medium text-gray-700">Phone Number*</label>
                <input
                  type="tel"
                  inputMode="numeric"
                  value={phoneNumber}
                  onChange={(e) => {
                    const v = sanitizePhone(e.target.value);
                    // If there's at least one digit, ensure the first digit is 6-9.
                    // If not, do not accept the input (prevents entering invalid starting digits).
                    if (v.length > 0 && !/^[6-9]/.test(v)) {
                      return;
                    }
                    setPhoneNumber(v);
                  }}
                  required
                  pattern="[6-9][0-9]{9}"
                  maxLength={10}
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="Enter your phone number"
                />
              </div>

              {/* DATE OF BIRTH */}
              <div className="col-span-12">
                <label className="block text-sm font-medium text-gray-700">Date of Birth*</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)} // <-- Works
                  required
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                />
              </div>

              {/* EMAIL */}
              <div className="col-span-12">
                <label className="block text-sm font-medium text-gray-700">Email*</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                  placeholder="Enter your email"
                />
              </div>

              {/* LINKEDIN */}
              <div className="col-span-12">
                <label className="block text-sm font-medium text-gray-700">LinkedIn URL*</label>
                <div className="mt-2 flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-sm text-gray-600">
                    https://www.linkedin.com/in/
                  </span>
                  <input
                    type="text"
                    value={linkedinUsername}
                    onChange={(e) => {
                      const v = e.target.value;
                      const extracted = extractLinkedinUsername(v);
                      setLinkedinUsername(extracted);
                    }}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-orange-400 outline-none"
                    placeholder="your-profile-identifier"
                  />
                </div>
              </div>

              {/* GENDER */}
              <div className="col-span-12">
                <label className="block text-sm font-medium text-gray-700">Gender*</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  required
                  className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-Binary</option>
                  <option value="prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* PASSWORD */}
              <div className="col-span-12">
                <label className="block text-sm font-medium text-gray-700">Password*</label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
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
                <label className="block text-sm font-medium text-gray-700">Confirm Password*</label>
                <div className="relative mt-2">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-400 outline-none"
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
                <span className="text-orange-600 font-medium cursor-pointer">Terms of Service</span> and{" "}
                <span className="text-orange-600 font-medium cursor-pointer">Privacy Policy</span>.
              </p>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={!agree}
              className={`w-full py-3 rounded-lg text-white font-medium ${
                agree ? "bg-gray-700 hover:bg-gray-800" : "bg-gray-300 cursor-not-allowed cursor-pointer"
              }`}
            >
              Sign Up
            </button>

            <p className="text-sm text-gray-700">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="text-orange-500 cursor-pointer font-medium hover:underline cursor-pointer">
                Sign in.
              </span>
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}

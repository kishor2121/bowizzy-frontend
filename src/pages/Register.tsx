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
  const [linkedinUsername, setLinkedinUsername] = useState("");
  const [gender, setGender] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [coupon, setCoupon] = useState("");
  const [couponStatus, setCouponStatus] = useState(""); // "valid" | "invalid" | ""
  const [couponMessage, setCouponMessage] = useState("");
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const [agree, setAgree] = useState(false);
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const [loading, setLoading] = useState(false);

  type RegisterErrors = {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    phone?: string;
    dob?: string;
    email?: string;
    linkedin?: string;
    password?: string;
    confirmPassword?: string;
  };
  const [errors, setErrors] = useState<RegisterErrors>({});

  const setFieldError = (field, message) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  };

  const sanitizeName = (value) => value.replace(/[^A-Za-z\s]/g, "");
  const sanitizePhone = (value) => value.replace(/\D/g, "").slice(0, 10);

  const extractLinkedinUsername = (value) => {
    if (!value) return "";
    const m = value.match(/linkedin\.com\/in\/([^/?#\s]+)/i);
    if (m?.[1]) return m[1];
    return value.replace(/[^A-Za-z0-9-]/g, "");
  };

  // Check if DOB is 18+
  const isAdult = (dob) => {
    const birth = new Date(dob);
    const today = new Date();
    const age = today.getFullYear() - birth.getFullYear();
    const month = today.getMonth() - birth.getMonth();

    return age > 18 || (age === 18 && month >= 0);
  };

  // Password rule
  const validPassword = (pwd) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_#])[A-Za-z\d@$!%*?&_#]{8,}$/.test(
      pwd
    );
  };
  const handleCouponCheck = async () => {
    if (!coupon.trim()) {
      setCouponStatus("invalid coupon code");
      setCouponMessage("Please enter coupon code");
      return;
    }

    try {
      setCheckingCoupon(true);
      setCouponStatus("");
      setCouponMessage("");

      // ✅ call backend to validate coupon
      // Your brother needs to create this API in backend
      const res = await api.post("/auth", {
        type: "check_coupon",
        coupon_code: coupon.trim(),
      });

      // if success
      setCouponStatus("valid");
      setCouponMessage(res?.data?.message || "Coupon applied");
    } catch (err) {
      setCouponStatus("invalid");
      setCouponMessage(
        err?.response?.data?.message || "Invalid coupon"
      );
    } finally {
      setCheckingCoupon(false);
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    

    if (!agree) return setFormError("You must agree to the terms.");

    if (password !== confirmPassword)
      return setFormError("Passwords do not match.");

    if (!validPassword(password))
      return setFormError(
        "Password must be 8+ chars, include upper, lower, number, symbol."
      );

    if (!/^[6-9]\d{9}$/.test(phoneNumber))
      return setFormError("Phone number must be valid.");

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(email))
      return setFormError("Enter a valid Gmail address.");

    if (!isAdult(dateOfBirth))
      return setFormError("You must be 18 years or older.");

    if (!linkedinUsername || !/^[A-Za-z0-9-]+$/.test(linkedinUsername))
      return setFormError("Invalid LinkedIn identifier.");
     setLoading(true);

    try {
      await api.post("/auth", {
        type: "signup",
        email,
        password,
        first_name: firstName,
        middle_name: middleName,
        last_name: lastName,
        phone_number: phoneNumber,
        date_of_birth: dateOfBirth,
        linkedin_url: `https://www.linkedin.com/in/${linkedinUsername}`,
        gender,
        coupon_code: coupon,
      });

      navigate("/login");
    } catch (err) {
      setFormError(err?.response?.data?.message || "Signup error");
    } finally {
      setLoading(false);
      
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[700px_1fr] font-['Baloo_2']">
      {/* LEFT SIDE */}
      <div className="hidden md:flex flex-col justify-between bg-[#FFE9D6] p-12 sticky top-0 h-screen">
        <img src={Bowizzy} alt="Logo" className="w-32" />
        <h1 className="text-4xl md:text-5xl font-semibold text-orange-700">
          Prep for interviews. <br /> Grow your career.
        </h1>
        <p className="text-sm text-gray-700">
          Ready to get started? Sign up for free.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div className="h-screen overflow-y-auto bg-white">
        <div className="max-w-3xl mx-auto px-6 py-10">
          <h2 className="text-2xl font-semibold mb-10">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-12 gap-4">
              {/* FIRST NAME */}
              <div className="col-span-12 md:col-span-6">
                <label>First Name*</label>
                <input
                  value={firstName}
                  onChange={(e) => {
                    const raw = e.target.value;

                    if (/[^A-Za-z\s]/.test(raw)) {
                      setFieldError("firstName", "Only letters allowed");
                    } else if (raw.length > 32) {
                      setFieldError("firstName", "Max 32 characters");
                    } else {
                      setFieldError("firstName", "");
                    }

                    const val = sanitizeName(raw);
                    setFirstName(val.slice(0, 32));
                  }}
                  className="mt-2 w-full px-4 py-3 border rounded-lg"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm">{errors.firstName}</p>
                )}
              </div>

              {/* MIDDLE NAME */}
              <div className="col-span-12 md:col-span-6">
                <label>Middle Name</label>
                <input
                  value={middleName}
                  onChange={(e) => {
                    const raw = e.target.value;

                    if (/[^A-Za-z\s]/.test(raw)) {
                      setFieldError("middleName", "Only letters allowed");
                    } else if (raw.length > 32) {
                      setFieldError("middleName", "Max 32 characters");
                    } else {
                      setFieldError("middleName", "");
                    }

                    const val = sanitizeName(raw);
                    setMiddleName(val.slice(0, 32));
                  }}
                  className="mt-2 w-full px-4 py-3 border rounded-lg"
                />
                {errors.middleName && (
                  <p className="text-red-500 text-sm">{errors.middleName}</p>
                )}
              </div>

              {/* LAST NAME */}
              <div className="col-span-12">
                <label>Last Name*</label>
                <input
                  value={lastName}
                  onChange={(e) => {
                    const raw = e.target.value;

                    if (/[^A-Za-z\s]/.test(raw)) {
                      setFieldError("lastName", "Only letters allowed");
                    } else if (raw.length > 32) {
                      setFieldError("lastName", "Max 32 characters");
                    } else {
                      setFieldError("lastName", "");
                    }

                    const val = sanitizeName(raw);
                    setLastName(val.slice(0, 32));
                  }}
                  className="mt-2 w-full px-4 py-3 border rounded-lg"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm">{errors.lastName}</p>
                )}
              </div>

              {/* PHONE */}
              <div className="col-span-12">
                <label>Phone Number*</label>
                <input
                  value={phoneNumber}
                  onChange={(e) => {
                    const v = sanitizePhone(e.target.value);
                    if (v.length > 0 && !/^[6-9]/.test(v)) {
                      setFieldError("phone", "Must start with 6-9");
                      return;
                    } else {
                      setFieldError("phone", "");
                    }
                    setPhoneNumber(v);
                  }}
                  className="mt-2 w-full px-4 py-3 border rounded-lg"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm">{errors.phone}</p>
                )}
              </div>

              {/* DOB */}
              <div className="col-span-12">
                <label>Date of Birth*</label>
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={dateOfBirth}
                  onChange={(e) => {
                    const val = e.target.value;
                    setDateOfBirth(val);

                    if (!isAdult(val)) {
                      setFieldError("dob", "You must above 18 years");
                    } else {
                      setFieldError("dob", "");
                    }
                  }}
                  className="mt-2 w-full px-4 py-3 border rounded-lg"
                />
                {errors.dob && (
                  <p className="text-red-500 text-sm">{errors.dob}</p>
                )}
              </div>

              {/* EMAIL */}
              <div className="col-span-12">
                <label>Email*</label>
                <input
                  value={email}
                  onChange={(e) => {
                    const val = e.target.value;
                    setEmail(val);

                    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(val)) {
                      setFieldError("email", "Only Gmail allowed");
                    } else {
                      setFieldError("email", "");
                    }
                  }}
                  className="mt-2 w-full px-4 py-3 border rounded-lg"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>

              {/* LINKEDIN */}
              <div className="col-span-12">
                <label>LinkedIn URL*</label>
                <div className="flex mt-2">
                  <span className="px-3 rounded-l-lg border bg-gray-100 flex items-center">
                    https://www.linkedin.com/in/
                  </span>
                  <input
                    value={linkedinUsername}
                    onChange={(e) => {
                      let val = e.target.value;

                      if (val.startsWith("http")) {
                        setFieldError("linkedin", "Do not enter full URL");
                        val = val.replace(
                          /^https?:\/\/(www\.)?linkedin\.com\/in\//,
                          ""
                        );
                      } else {
                        setFieldError("linkedin", "");
                      }

                      const extracted = extractLinkedinUsername(val);
                      setLinkedinUsername(extracted);
                    }}
                    className="w-full px-4 py-3 border rounded-r-lg"
                  />
                </div>
                {errors.linkedin && (
                  <p className="text-red-500 text-sm">{errors.linkedin}</p>
                )}
              </div>

              {/* GENDER */}
              <div className="col-span-12">
                <label>Gender*</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="mt-2 w-full px-4 py-3 border rounded-lg"
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-Binary</option>
                </select>
              </div>

              {/* PASSWORD */}
              <div className="col-span-12">
                <label>Password*</label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      const val = e.target.value;
                      setPassword(val);

                      if (!validPassword(val)) {
                        setFieldError(
                          "password",
                          "Min 8 chars, 1 upper, 1 lower, 1 number, 1 symbol"
                        );
                      } else {
                        setFieldError("password", "");
                      }
                    }}
                    className="w-full px-4 py-3 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div className="col-span-12">
                <label>Confirm Password*</label>
                <div className="relative mt-2">
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      const val = e.target.value;
                      setConfirmPassword(val);

                      if (password !== val) {
                        setFieldError(
                          "confirmPassword",
                          "Passwords do not match"
                        );
                      } else {
                        setFieldError("confirmPassword", "");
                      }
                    }}
                    className="w-full px-4 py-3 border rounded-lg"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {errors.confirmPassword && (
                  <p className="text-red-500 text-sm">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
              {/* COUPON */}
              <div className="col-span-12">
                <label>Coupon Code</label>

                <div className="flex gap-2 mt-2">
                  <input
                    value={coupon}
                    onChange={(e) => {
                      setCoupon(e.target.value);
                      setCouponStatus("");
                      setCouponMessage("");
                    }}
                    className="w-full px-4 py-3 border rounded-lg"
                    placeholder="Enter coupon code"
                  />

                  <button
                    type="button"
                    onClick={handleCouponCheck}
                    disabled={checkingCoupon}
                    className={`px-4 py-3 rounded-lg text-white font-medium ${checkingCoupon ? "bg-gray-400 cursor-not-allowed" : "bg-orange-500"
                      }`}
                  >
                    {checkingCoupon ? "Checking..." : "Check"}
                  </button>
                </div>

                {couponMessage && (
                  <p
                    className={`text-sm mt-2 ${couponStatus === "valid" ? "text-green-600" : "text-red-500"
                      }`}
                  >
                    {couponMessage}
                  </p>
                )}
              </div>


            </div>

            {formError && <p className="text-red-500 text-sm">{formError}</p>}

            {/* AGREE */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <p className="text-sm">
                I agree to the Terms and Privacy Policy.
              </p>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={!agree || loading}
              className={`w-full py-3 rounded-lg text-white font-medium flex items-center justify-center ${agree ? "bg-gray-700" : "bg-gray-300 cursor-not-allowed"
                } ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Sign Up"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

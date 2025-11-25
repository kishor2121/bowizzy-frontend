import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/login";  

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const data = await loginUser(email, password); 

      localStorage.setItem(
        "user",
        JSON.stringify({
          user_id: data.user_id,
          email: data.email,
          token: data.token,
        })
      );

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 font-['Baloo_2'] px-4">
      <div className="bg-white shadow-lg rounded-2xl w-full max-w-md p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 text-center mb-6">
          Welcome Back
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center -mt-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl text-white font-medium shadow-sm 
            transition-all duration-300 hover:opacity-90"
            style={{
              background:
                "linear-gradient(180deg, #FF9D48 0%, #FF8251 100%)",
            }}
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-5">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-orange-500 cursor-pointer font-medium hover:underline"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}

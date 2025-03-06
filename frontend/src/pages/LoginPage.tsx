import { useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Simulazione autenticazione
    if (email === "admin@admin.com" && password === "password") {
      localStorage.setItem("authToken", "fake-token"); // Simulazione di un token JWT
      navigate("/dashboard"); // Redireziona dopo il login
    } else {
      setError("Invalid email or password");
    }
  };


  return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white shadow-lg rounded-2xl">
          {/* VisIVO Science Gateway Logo */}
          <div className="flex justify-center">
            <img
              src="/logo.png" // Make sure the logo is available in public/logo.png
              alt="VisIVO Science Gateway Logo"
              className="w-32 h-32"
            />
          </div>
  
          <h2 className="text-center text-2xl font-bold text-gray-900">
            VisIVO Science Gateway
          </h2>
  
          <form className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                required
                className="mt-1 w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your email"
              />
            </div>
  
            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                className="mt-1 w-full px-4 py-2 border rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
              />
            </div>
  
            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
            >
              Sign In
            </button>
          </form>
  
          {/* Link to Registration */}
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <a href="/register" className="text-indigo-600 hover:underline">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    );
  };
  
  export default LoginPage;
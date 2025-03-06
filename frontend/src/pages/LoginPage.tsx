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
        {/* Logo VisIVO Science Gateway */}
        <div className="flex justify-center">
          <img
            src="/logo.png" // Assicurati che il logo sia disponibile in public/logo.png
            alt="VisIVO Science Gateway Logo"
            className="w-32 h-32"
          />
        </div>

        <h2 className="text-center text-2xl font-bold text-gray-900">
          Accedi al VisIVO Science Gateway
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
              placeholder="Inserisci la tua email"
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
              placeholder="Inserisci la tua password"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full px-4 py-2 text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            Accedi
          </button>
        </form>

        {/* Link per la registrazione */}
        <p className="text-center text-sm text-gray-600">
          Non hai un account?{" "}
          <a href="/register" className="text-indigo-600 hover:underline">
            Registrati qui
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
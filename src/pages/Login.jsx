import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";

import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8000/api/auth/login/", {
        email,
        password,
      });

      const { token, user } = response.data;

      login(user, token);
      navigate("/");

    } catch (error) {
      console.error(error);
      alert("Login failed! Check your credentials.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h1 className="text-3xl font-bold text-forest mb-6 text-center">
          Welcome Back
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50"
            required
          />
          <button
            type="submit"
            className="px-4 py-3 bg-forest text-white rounded-lg hover:bg-forest/90 transition-all font-medium shadow-md hover:shadow-lg"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-muted-foreground">
          Don't have an account?{" "}
          <span
            className="text-orange hover:underline cursor-pointer font-medium"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

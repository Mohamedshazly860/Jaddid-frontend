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
        <h1 className="text-3xl font-bold text-foreground mb-6 text-center">
          Login
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-forest transition-colors"
          >
            Login
          </button>
        </form>
        <p className="mt-4 text-center text-muted-foreground">
          Don't have an account?{" "}
          <span
            className="text-secondary hover:underline cursor-pointer"
            onClick={() => navigate("/register")}
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}

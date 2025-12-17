import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import './Register.css';

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState(""); 

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await axios.post("http://localhost:8000/api/auth/register/", {
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        role,
      });

      navigate("/login");

    } catch (error) {
      console.error(error);
      alert("Registration failed! Check your data.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-form-container">
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="w-full max-w-md p-8 bg-card rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-foreground mb-6 text-center">
              Register
            </h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
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
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="individual">Individual</option>
                <option value="company">Company</option>
                <option value="admin">Admin</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-orange transition-colors"
              >
                Register
              </button>
            </form>
            <p className="mt-4 text-center text-muted-foreground">
              Already have an account?{" "}
              <span
                className="text-primary hover:underline cursor-pointer"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

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
      await axios.post("http://localhost:8000/api/accounts/register/", {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        confirm_password: confirmPassword,
        role: role,
      });

      navigate("/login");
    } catch (error) {
      console.error(error);
      console.error("Backend Error:", error.response?.data || error.message);
      alert("Registration failed! Check your data.");
    }
  };

  return (
    <div className="register-page">
      <div className="register-form-container">
        <h1 className="text-3xl font-bold text-forest mb-6 text-center">
          Create Account
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50"
            required
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50"
            required
          />
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
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50"
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50"
            required
          >
            <option value="">Select Role</option>
            <option value="Individual">Individual</option>
            <option value="Company">Company</option>
            <option value="Admin">Admin</option>
          </select>
          <button
            type="submit"
            className="px-4 py-3 bg-orange text-white rounded-lg hover:bg-orange/90 transition-all font-medium shadow-md hover:shadow-lg"
          >
            Create Account
          </button>
        </form>
        <p className="mt-4 text-center text-muted-foreground">
          Already have an account?{" "}
          <span
            className="text-forest hover:underline cursor-pointer font-medium"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation: Check if passwords match
    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة! / Passwords do not match!");
      return;
    }

    // Validation: Check password strength
    if (password.length < 8) {
      setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل / Password must be at least 8 characters");
      return;
    }

    // Validation: Check if role is selected
    if (!role) {
      setError("الرجاء اختيار نوع الحساب / Please select account type");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/accounts/register/", {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
        confirm_password: confirmPassword,
        role: role,
      });

      console.log("Registration successful:", response.data);
      alert("تم التسجيل بنجاح! / Registration successful!");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      console.error("Backend Error:", error.response?.data || error.message);
      
      // Handle different error types
      let errorMessage = "";
      
      if (error.response?.data) {
        const data = error.response.data;
        
        // Handle field-specific errors
        if (data.email) {
          errorMessage = `البريد الإلكتروني: ${Array.isArray(data.email) ? data.email.join(', ') : data.email}`;
        } else if (data.password) {
          errorMessage = `كلمة المرور: ${Array.isArray(data.password) ? data.password.join(', ') : data.password}`;
        } else if (data.first_name) {
          errorMessage = `الاسم الأول: ${Array.isArray(data.first_name) ? data.first_name.join(', ') : data.first_name}`;
        } else if (data.last_name) {
          errorMessage = `الاسم الأخير: ${Array.isArray(data.last_name) ? data.last_name.join(', ') : data.last_name}`;
        } else if (data.detail) {
          errorMessage = data.detail;
        } else if (data.message) {
          errorMessage = data.message;
        } else {
          // Collect all error messages
          const errors = Object.entries(data)
            .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
            .join('\n');
          errorMessage = errors || "فشل التسجيل! / Registration failed!";
        }
      } else if (error.message === "Network Error") {
        errorMessage = "خطأ في الاتصال بالسيرفر! تأكد من تشغيل السيرفر / Network Error! Check if backend is running";
      } else {
        errorMessage = error.message || "فشل التسجيل! / Registration failed!";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-form-container">
        <h1 className="text-3xl font-bold text-forest mb-6 text-center">
          Create Account
        </h1>
        
        {/* Error Message Display */}
        {error && (
          <div className="mb-4 p-4 bg-orange/10 border border-orange/30 rounded-lg">
            <p className="text-orange text-sm whitespace-pre-line">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="First Name / الاسم الأول"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50"
            required
            disabled={isLoading}
          />
          <input
            type="text"
            placeholder="Last Name / الاسم الأخير"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50"
            required
            disabled={isLoading}
          />
          <input
            type="email"
            placeholder="Email / البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50"
            required
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Password / كلمة المرور (8 أحرف على الأقل)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50"
            required
            minLength={8}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Confirm Password / تأكيد كلمة المرور"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="px-4 py-3 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50"
            required
            disabled={isLoading}
          />
          
          {/* Select Role with Custom Styling */}
          <Select value={role} onValueChange={setRole} disabled={isLoading} required>
            <SelectTrigger className="px-4 py-3 h-12 border border-sage/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-sage focus:border-transparent transition-all bg-white/50 hover:border-sage/50">
              <SelectValue placeholder="Select Role / اختر نوع الحساب" />
            </SelectTrigger>
            <SelectContent className="bg-white border-sage/30 shadow-lg">
              <SelectItem 
                value="Individual" 
                className="cursor-pointer hover:bg-sage/10 focus:bg-sage/20 py-3 px-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">👤</span>
                  <div>
                    <div className="font-medium">Individual</div>
                    <div className="text-xs text-muted-foreground">فرد</div>
                  </div>
                </div>
              </SelectItem>
              <SelectItem 
                value="Company" 
                className="cursor-pointer hover:bg-sage/10 focus:bg-sage/20 py-3 px-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏢</span>
                  <div>
                    <div className="font-medium">Company</div>
                    <div className="text-xs text-muted-foreground">شركة</div>
                  </div>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-3 bg-orange text-white rounded-lg hover:bg-orange/90 transition-all font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "جاري التسجيل... / Creating..." : "Create Account / إنشاء حساب"}
          </button>
        </form>
        <p className="mt-4 text-center text-muted-foreground">
          Already have an account? / لديك حساب؟{" "}
          <span
            className="text-forest hover:underline cursor-pointer font-medium"
            onClick={() => navigate("/login")}
          >
            Login / تسجيل الدخول
          </span>
        </p>
      </div>
    </div>
  );
}

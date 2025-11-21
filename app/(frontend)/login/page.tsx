"use client";

import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, LogIn,Eye,EyeOff, } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ userIdOrEmail: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.userIdOrEmail || !form.password) {
      toast.error("Please fill all fields");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/users/login", form);
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", res.data.user.userId);
        localStorage.setItem("fullName",res.data.user.fullName)
        localStorage.setItem("role", res.data.user.role);
        toast.success("Login successful 🎉");
         switch (res.data.user.role) {
          case 2:
            router.push("/super-admin/dashboard");
            break;
          case 1:
            router.push("/admin/dashboard");
            break;
          default:
            router.push("user/dashboard");
        }
      } else {
        toast.error(res.data.message || "Login failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="bg-white/70 backdrop-blur-lg shadow-2xl rounded-2xl p-10 w-[380px] border border-blue-100">
        <h2 className="text-3xl font-semibold text-center text-blue-700 mb-2">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Sign in with your User ID or Email
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User ID / Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              User ID / Email
            </label>
            <input
              type="text"
              name="userIdOrEmail"
              value={form.userIdOrEmail}
              onChange={handleChange}
              placeholder="Enter your 6-digit ID or email"
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/80"
            />
          </div>

          {/* Password */}
          <div  className="relative">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password
            </label>
            <input
             type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white/80"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-10 right-3 text-gray-500 hover:text-blue-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-all font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Signing in...
              </>
            ) : (
              <>
                <LogIn size={20} />
                Login
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="my-6 border-t border-gray-200"></div>

        <p className="text-sm text-gray-500 text-center">
          Don’t have an account?{" "}
          <a href="/register" className="text-blue-600 hover:underline font-medium">
            Register now
          </a>
        </p>
      </div>
    </div>
  );
}

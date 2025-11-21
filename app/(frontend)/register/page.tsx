"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  Loader2,
  UserPlus,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSponsorValid, setIsSponsorValid] = useState<boolean | null>(null);
  const [checkingSponsor, setCheckingSponsor] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    sponsorId: "",
  });

  // 🟦 Check Sponsor Validity (debounced)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (form.sponsorId.length >= 6) {
        setCheckingSponsor(true);
        try {
          const res = await axios.post("/api/users/verify-sponsor", {
            sponsorId: form.sponsorId,
          });
          setIsSponsorValid(res.data.valid);
        } catch {
          setIsSponsorValid(false);
        } finally {
          setCheckingSponsor(false);
        }
      } else {
        setIsSponsorValid(null);
      }
    }, 600);

    return () => clearTimeout(delayDebounce);
  }, [form.sponsorId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.fullName ||
      !form.email ||
      !form.password ||
      !form.confirmPassword ||
      !form.sponsorId
    ) {
      toast.error("All fields are required");
      return;
    }

    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!isSponsorValid) {
      toast.error("Please enter a valid Sponsor ID");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post("/api/users/register", form);

      if (res.data.userId) {
        await Swal.fire({
          icon: "success",
          title: "🎉 Registration Successful!",
          html: `
            <p class="text-lg font-semibold mb-2">Your Account Details</p>
            <div class="p-3 border rounded-xl bg-blue-50 text-left text-sm">
              <strong>User ID:</strong> ${res.data.userId}<br>
              <strong>Password:</strong> ${form.password}
            </div>
            <p class="mt-3 text-gray-600 text-sm">Please save this information securely.</p>
          `,
          confirmButtonText: "Go to Login",
          confirmButtonColor: "#2563eb",
        });
        router.push("/login");
      } else {
        toast.error(res.data.message || "Registration failed");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100">
      <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-10 w-[400px] border border-blue-100">
        <h2 className="text-3xl font-semibold text-center text-blue-700 mb-2">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Join our MLM network today 🚀
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Sponsor ID */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Sponsor ID <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="sponsorId"
                value={form.sponsorId}
                onChange={handleChange}
                placeholder="Enter your sponsor ID"
                required
                className={`w-full p-3 rounded-xl border ${
                  isSponsorValid === true
                    ? "border-green-500"
                    : isSponsorValid === false
                    ? "border-red-500"
                    : "border-gray-300"
                } focus:ring-2 focus:ring-blue-500 outline-none bg-white/80`}
              />
              <div className="absolute top-3 right-3">
                {checkingSponsor ? (
                  <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                ) : isSponsorValid === true ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : isSponsorValid === false ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : null}
              </div>
            </div>
            {isSponsorValid === true && (
              <p className="text-sm text-green-600 mt-1">Valid Sponsor ✅</p>
            )}
            {isSponsorValid === false && (
              <p className="text-sm text-red-500 mt-1">Invalid Sponsor ❌</p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white/80"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white/80 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-9 right-3 text-gray-500 hover:text-blue-600"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white/80 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute top-9 right-3 text-gray-500 hover:text-blue-600"
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-all font-semibold"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Registering...
              </>
            ) : (
              <>
                <UserPlus size={20} />
                Register
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

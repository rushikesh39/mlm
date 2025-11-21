"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, Upload, FileCheck, FileX, IdCard } from "lucide-react";
import Layout from "../layout/Layout";

export default function DashboardKycPage() {
  const [form, setForm] = useState({
    userId: "",
    userName: "",
    panNumber: "",
    aadharNumber: "",
    accountHolderName: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    documentImage: "",
  });

  const [kycStatus, setKycStatus] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // 🔹 Fetch current user and their KYC status
  useEffect(() => {
    async function fetchKyc() {
      try {
        setLoading(true);
        const userId = localStorage.getItem("userId");
        const userName = localStorage.getItem("fullName");

        if (!userId) return;
        setForm((prev) => ({
          ...prev,
          userId: userId || "",
          userName: userName || "",
        }));

        const res = await axios.get(`/api/users/kyc-status?userId=${userId}`);
        if (res.data.success) {
          setKycStatus(res.data.status);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchKyc();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !form.userId ||
      !form.userName ||
      !form.panNumber ||
      !form.aadharNumber ||
      !form.accountHolderName ||
      !form.bankName ||
      !form.accountNumber ||
      !form.ifscCode
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const res = await axios.post("/api/users/kyc", form);
      if (res.data.success) {
        toast.success("KYC submitted successfully!");
        setKycStatus(0);
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusLabel = () => {
    switch (kycStatus) {
      case 0:
        return (
          <span className="flex items-center gap-2 text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full font-medium">
            <Loader2 className="animate-spin w-4 h-4" /> Pending
          </span>
        );
      case 1:
        return (
          <span className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-1 rounded-full font-medium">
            <FileCheck className="w-4 h-4" /> Approved
          </span>
        );
      case 2:
        return (
          <span className="flex items-center gap-2 text-red-700 bg-red-100 px-3 py-1 rounded-full font-medium">
            <FileX className="w-4 h-4" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto bg-white p-6 sm:p-10 rounded-2xl shadow-lg border border-gray-100 mt-4 sm:mt-8">
        <div className="flex items-center gap-3 mb-4">
          <IdCard className="text-blue-600 w-8 h-8" />
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-700">
            KYC Verification
          </h2>
        </div>
        <p className="text-gray-500 mb-8">
          Please complete your KYC to unlock full account access, withdrawals,
          and commission eligibility.
        </p>

        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
          </div>
        ) : (
          <>
            {kycStatus !== null && (
              <div className="mb-6">
                <h4 className="text-sm text-gray-700 font-medium mb-1">
                  Current Status:
                </h4>
                {getStatusLabel()}
              </div>
            )}

            {kycStatus === 0 ? (
              <p className="text-blue-600 font-medium bg-blue-50 p-3 rounded-xl">
                ⏳ Your KYC is under review. You will be notified once verified.
              </p>
            ) : kycStatus === 1 ? (
              <p className="text-green-600 font-medium bg-green-50 p-3 rounded-xl">
                ✅ Your KYC is verified successfully.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* User ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="userId"
                    value={form.userId || ""}
                    onChange={handleChange}
                    readOnly
                    className="w-full p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-600 font-medium cursor-not-allowed"
                  />
                </div>

                {/* User Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={form.userName || ""}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Two-column grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { name: "panNumber", label: "PAN Number" },
                    { name: "aadharNumber", label: "Aadhar Number" },
                    { name: "accountHolderName", label: "Account Holder Name" },
                    { name: "bankName", label: "Bank Name" },
                    { name: "accountNumber", label: "Account Number" },
                    { name: "ifscCode", label: "IFSC Code" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name={field.name}
                        value={(form as any)[field.name] || ""}
                        onChange={handleChange}
                        placeholder={`Enter ${field.label}`}
                        required
                        className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  ))}
                </div>

                {/* Document Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Image URL (optional)
                  </label>
                  <input
                    type="text"
                    name="documentImage"
                    value={form.documentImage || ""}
                    onChange={handleChange}
                    placeholder="Paste Cloudinary URL (optional)"
                    className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all font-semibold"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload size={20} />
                      Submit KYC
                    </>
                  )}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

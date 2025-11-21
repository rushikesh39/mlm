"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../layout/Layout";
import toast from "react-hot-toast";
import { Loader2, ShoppingCart, Wallet } from "lucide-react";

export default function UserPlanPurchasePage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [topupWalletBalance, setTopupWalletBalance] = useState(0);

  const [form, setForm] = useState({
    userId: "",
    planId: "",
  });

  // Load userId + Wallet Balance
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (userId) setForm((prev) => ({ ...prev, userId }));

    // Load wallet
    const loadWallet = async () => {
      try {
        const res = await axios.get("/api/users/topup-wallet-balance", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) setTopupWalletBalance(res.data.user.topupWalletBalance);
      } catch {
        toast.error("Unable to load wallet");
      }
    };

    loadWallet();
  }, []);

  // Load Plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/plans");
      if (res.data.success) {
        setPlans(res.data.plans.filter((p: any) => p.isActive));
      }
    } catch {
      toast.error("Unable to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // Handle Purchase
  const handlePurchase = async () => {
    if (!form.planId) return toast.error("Please select a plan");

    const selectedPlan = plans.find((p) => p._id === form.planId);

    if (!selectedPlan) return toast.error("Invalid plan");

    // Check wallet balance
    if (setTopupWalletBalance < selectedPlan.amount) {
      return toast.error("Insufficient Topup Wallet Balance");
    }

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post("/api/users/purchase-plan", {
        token,
        planId: form.planId,
      });

      if (res.data.success) {
        toast.success("Plan Purchased Successfully!");
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Purchase failed");
    }
  };

  return (
    <Layout>
      <div className="max-w-xl mx-auto bg-white shadow-lg rounded-2xl p-6 border mt-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-3 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-blue-600" />
          Purchase a Plan
        </h2>

        {/* Wallet Section */}
        <div className="flex items-center gap-3 p-3 bg-blue-50 border rounded-lg mb-5">
          <Wallet className="text-blue-600" />
          <div>
            <p className="text-gray-600 text-sm">Topup Wallet Balance</p>
            <p className="text-xl font-bold text-blue-700">₹{topupWalletBalance}</p>
          </div>
        </div>

        <p className="text-gray-600 mb-6">
          💡 <b>Amount will be deducted from your Topup Wallet.</b>
        </p>

        {/* User ID */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700">User ID</label>
          <input
            type="text"
            value={form.userId}
            readOnly
            className="w-full border p-3 rounded-lg mt-1 bg-gray-100 text-gray-600"
          />
        </div>

        {/* Select Plan */}
        <div className="mb-4">
          <label className="text-sm font-semibold text-gray-700">
            Select Plan
          </label>
          <select
            value={form.planId}
            onChange={(e) => setForm({ ...form, planId: e.target.value })}
            className="w-full border p-3 rounded-lg mt-1 focus:ring-2 focus:ring-blue-600"
          >
            <option value="">Choose a Plan</option>
            {plans.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} — ₹{p.amount}
              </option>
            ))}
          </select>
        </div>

        {/* Purchase Button */}
        <button
          onClick={handlePurchase}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold flex items-center justify-center gap-2"
        >
          <ShoppingCart size={18} />
          Purchase Plan
        </button>

        {loading && (
          <div className="flex justify-center mt-4">
            <Loader2 className="animate-spin text-blue-600 w-7 h-7" />
          </div>
        )}
      </div>

      {/* Plans List */}
      <div className="mt-10 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {plans.map((p) => (
          <div
            key={p._id}
            className="border shadow-lg p-5 rounded-xl bg-white hover:shadow-2xl transition relative"
          >
            <h3 className="text-lg font-bold text-blue-700">{p.name}</h3>

            <div className="mt-2 text-gray-700">
              <p>Amount: ₹{p.amount}</p>
              <p>Daily: {p.dailyCommission}%</p>
              <p>Monthly: {p.monthlyCommission}%</p>
              <p>Levels: {p.levels.length}</p>
            </div>

            <button
              onClick={() => setForm({ ...form, planId: p._id })}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:bg-blue-700"
            >
              Select This Plan
            </button>

            {/* Highlight Selected Card */}
            {form.planId === p._id && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs">
                Selected
              </div>
            )}
          </div>
        ))}
      </div>
    </Layout>
  );
}

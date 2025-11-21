"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layout/Layout";
import StatCard from "../../components/StatCard";
import { Wallet, DollarSign, Users, ShieldCheck } from "lucide-react";

interface DashboardData {
  walletBalance: number;
  totalInvestment: number;
  referralCount: number;
  kycStatus: number; // 0 = pending, 1 = approved, 2 = rejected
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        const res = await axios.get("/api/users/dashboard", {
          params: { userId },
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading)
    return (
      <Layout>
        <div className="flex justify-center items-center h-[80vh]">
          <p className="text-blue-600 text-lg animate-pulse">
            Loading dashboard...
          </p>
        </div>
      </Layout>
    );

  // ✅ KYC color and label helpers
  const getKycColor = (status: number) => {
    switch (status) {
      case 0:
        return "border-yellow-500 text-yellow-600";
      case 1:
        return "border-green-500 text-green-600";
      case 2:
        return "border-red-500 text-red-600";
      default:
        return "border-gray-400 text-gray-500";
    }
  };

  const getKycLabel = (status: number | undefined) => {
    switch (status) {
      case 0:
        return "Pending";
      case 1:
        return "Approved";
      case 2:
        return "Rejected";
      default:
        return "Not Submitted";
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-blue-700">Dashboard</h2>
        <p className="text-gray-500 mb-6">
          Overview of system performance and user statistics
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Total Investment */}
          <StatCard
            title="Total Investment"
            value={`₹${stats?.totalInvestment ?? 0}`}
            icon={<DollarSign size={24} />}
            color="border-green-500"
          />

          {/* Wallet Balance */}
          <StatCard
            title="Total Wallet Balance"
            value={`₹${stats?.walletBalance ?? 0}`}
            icon={<Wallet size={24} />}
            color="border-yellow-500"
          />

          {/* Total Referrals */}
          <StatCard
            title="Total Referrals"
            value={stats?.referralCount?? 0}
            icon={<Users size={24} />}
            color="border-blue-500"
          />

          {/* KYC Status */}
          <StatCard
            title="KYC Status"
            value={getKycLabel(stats?.kycStatus)}
            icon={<ShieldCheck size={24} />}
            color={getKycColor(stats?.kycStatus ?? -1)}
          />
        </div>
      </div>
    </Layout>
  );
}

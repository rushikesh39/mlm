"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layout/Layout";
import StatCard from "../../components/StatCard";
import {
  Users,
  Wallet,
  DollarSign,
  UserCheck,
  UserX,
  FileCheck,
  FileClock,
} from "lucide-react";

interface DashboardData {
  totalUsers: number;
  totalPaidUsers: number;
  totalFreeUsers: number;
  totalWalletBalance: number;
  totalInvestment: number;
  totalKycApproved: number;
  totalKycPending: number;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/admin/dashboard",{ headers: { Authorization: `Bearer ${token}` },});
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
          <p className="text-blue-600 text-lg animate-pulse">Loading dashboard...</p>
        </div>
      </Layout>
    );

  return (
    <Layout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-blue-700">Admin Dashboard</h2>
        <p className="text-gray-500 mb-6">
          Overview of system performance and user statistics
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Investment"
            value={`₹${stats?.totalInvestment.toLocaleString()}`}
            icon={<DollarSign size={24} />}
            color="border-green-500"
          />
          <StatCard
            title="Total Wallet Balance"
            value={`₹${stats?.totalWalletBalance.toLocaleString()}`}
            icon={<Wallet size={24} />}
            color="border-yellow-500"
          />
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={<Users size={24} />}
            color="border-blue-500"
          />
          <StatCard
            title="Paid Users"
            value={stats?.totalPaidUsers || 0}
            icon={<UserCheck size={24} />}
            color="border-green-600"
          />
          <StatCard
            title="Free Users"
            value={stats?.totalFreeUsers || 0}
            icon={<UserX size={24} />}
            color="border-red-500"
          />
          <StatCard
            title="KYC Approved"
            value={stats?.totalKycApproved || 0}
            icon={<FileCheck size={24} />}
            color="border-indigo-500"
          />
          <StatCard
            title="KYC Pending"
            value={stats?.totalKycPending || 0}
            icon={<FileClock size={24} />}
            color="border-orange-500"
          />
        </div>
      </div>
    </Layout>
  );
}

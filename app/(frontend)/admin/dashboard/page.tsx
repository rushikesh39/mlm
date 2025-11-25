"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../../layout/Layout";
import StatCard from "../../components/StatCard";

import {
  Users,
  Wallet,
  IndianRupee,
  UserCheck,
  UserX,
  FileCheck,
  FileClock,
  UserRound,
} from "lucide-react";

// Shadcn UI
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

// Recharts
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

interface DashboardData {
  totalUsers: number;
  totalPaidUsers: number;
  totalFreeUsers: number;
  totalBlockedUsers:number;
  totalWalletBalance: number;
  totalInvestment: number;
  totalKycApproved: number;
  totalKycPending: number;
  monthlySignup: { month: string; count: number }[];
  revenueData: { month: string; amount: number }[];
  recentTransactions: {
    _id: string;
    userId: string;
    amount: number;
    type: number;
    source:number;
    status:number;
    date: string;
  }[];
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    async function fetchDashboard() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/admin/dashboard", {
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

  const txnSource:Record<string, string> ={'1':"Topup fund Request", '2':"Withdrawal Request",'3':"Fund Transfer",'4':"Deposit",'5':"Daily Income",'6':"Monthly Income",'7':"Level Income",'8':"Direct Income",'9':"Admin Adjustment"}

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

  // CHART DATA
  const userTypeData = [
    { name: "Paid Users", value: stats?.totalPaidUsers || 0 },
    { name: "Free Users", value: stats?.totalFreeUsers || 0 },
  ];
  const COLORS = ["#22c55e", "#ef4444"];

  const kycData = [
    { name: "Approved", count: stats?.totalKycApproved || 0 },
    { name: "Pending", count: stats?.totalKycPending || 0 },
  ];

  return (
    <Layout>
      <div className="space-y-8">

        {/* Heading */}
        <h2 className="text-3xl font-bold text-blue-700">Dashboard</h2>
        <p className="text-gray-500 -mt-3 mb-6">
          Overview of system performance and analytics
        </p>

        {/* STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Investment"
            value={`₹${stats?.totalInvestment.toLocaleString()}`}
            icon={<IndianRupee size={24} />}
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
            icon={<UserRound size={24} />}
            color="border-yellow-500"
          />
          <StatCard
            title="Blocked Users"
            value={stats?.totalBlockedUsers || 0}
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

        {/* CHARTS ROW 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

          {/* REVENUE LINE GRAPH */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={stats?.revenueData || []}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#2563eb"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* MONTHLY SIGNUP BAR CHART */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Signup</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats?.monthlySignup || []}>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#16a34a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* CHARTS ROW 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* USER PIE CHART */}
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={userTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={5}
                  >
                    {userTypeData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* KYC BAR GRAPH */}
          <Card>
            <CardHeader>
              <CardTitle>KYC Status</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={kycData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* RECENT TRANSACTIONS TABLE */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats?.recentTransactions?.map((txn) => (
                  <TableRow key={txn._id}>
                    <TableCell>{txn.userId}</TableCell>
                    <TableCell>₹{txn.amount}</TableCell>
                    <TableCell>{txn.type==1?"credit":"Debit"}</TableCell>
                    <TableCell>{txnSource[txn.source]}</TableCell>
                    <TableCell>
                      {new Date(txn.date).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}

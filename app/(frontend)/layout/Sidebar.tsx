"use client";

import {
  Home,
  Users,
  Wallet,
  Settings,
  IdCard,
  FileText,
  Database,
  Shield,
  Boxes,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface SidebarProps {
  isOpen: boolean;
}

export default function Sidebar({ isOpen }: SidebarProps) {
  // Simulate logged-in role
  // 0 = user, 1 = admin, 2 = super_admin
  const [role, setRole] = useState<number>(0);

  useEffect(() => {
    // Fetch role from localStorage or context (set during login)
    const storedRole = Number(localStorage.getItem("role"));
    setRole(storedRole || 1);
  }, []);

  return (
    <aside
      className={`fixed lg:static top-0 left-0 h-full lg:h-auto w-64 bg-blue-700 text-white transition-transform duration-300 z-20 ${
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      {/* Logo */}
      <div className="p-4 text-2xl font-semibold border-b border-blue-500 tracking-wide">
        MLM Raja
      </div>

      {/* User / Common Menu */}
      <nav className="p-4 space-y-3 text-sm font-medium">
        <Link
          href="dashboard"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-600 transition"
        >
          <Home className="w-5 h-5" /> Dashboard
        </Link>

        <Link
          href="kyc"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-600 transition"
        >
          <IdCard className="w-5 h-5" /> My KYC
        </Link>

        <Link
          href="/users"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-600 transition"
        >
          <Users className="w-5 h-5" /> My Referrals
        </Link>
        <Link
          href="plan-purchase"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-600 transition"
        >
          <Boxes className="w-5 h-5" />
          Plan
        </Link>
        <Link
          href="/wallet"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-600 transition"
        >
          <Wallet className="w-5 h-5" /> Wallet
        </Link>
      </nav>

      {/* Divider */}
      {(role === 1 || role === 2) && (
        <>
          <div className="border-t border-blue-600 my-3"></div>

          {/* Admin / Super Admin Section */}
          <div className="px-4 pb-2 text-xs uppercase text-blue-200 font-semibold tracking-wide">
            Administator
          </div>

          <nav className="p-2 space-y-2 text-sm font-medium">
            <Link
              href="plans"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-600 transition"
            >
              <Boxes className="w-5 h-5" />
              Plans
            </Link>
            <Link
              href="kyc-management"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-600 transition"
            >
              <FileText className="w-5 h-5" /> KYC Management
            </Link>

            <Link
              href="user-management"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-600 transition"
            >
              <Users className="w-5 h-5" /> User Management
            </Link>

            <Link
              href="/admin-wallet"
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-600 transition"
            >
              <Database className="w-5 h-5" /> Wallet Management
            </Link>

            {role === 2 && (
              <Link
                href="/admin-settings"
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-600 transition"
              >
                <Shield className="w-5 h-5" /> System Settings
              </Link>
            )}
          </nav>
        </>
      )}

      {/* Footer / Settings */}
      <div className="absolute bottom-0 left-0 w-full border-t border-blue-600 p-4">
        <Link
          href="/settings"
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-blue-600 transition"
        >
          <Settings className="w-5 h-5" /> Settings
        </Link>
      </div>
    </aside>
  );
}

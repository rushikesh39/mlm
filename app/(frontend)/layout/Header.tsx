"use client";
import { Menu, User, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [user, setUser] = useState<{ fullName: string; userId: string } | null>(
    null
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    const fullName = localStorage.getItem("fullName") || "User";
    const userId = localStorage.getItem("userId") || "";
    setUser({ fullName, userId });
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm flex items-center justify-between px-4 py-3">
      <SidebarTrigger className="h-9 w-9" />

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-2 hover:bg-gray-100 rounded-full transition"
        >
          <User className="w-6 h-6 text-gray-700" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2 animate-fadeIn">
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-800">
                {user?.fullName}
              </p>
              <p className="text-xs text-gray-500">ID: {user?.userId}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 text-sm transition"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

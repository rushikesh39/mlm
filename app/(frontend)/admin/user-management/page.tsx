"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Edit,
  Ban,
  Unlock,
  Download,
  LogIn,
  Loader2,
  Eye,
  EyeOff,
  X,
  Calendar,
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Layout from "../../layout/Layout";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 Fetch users with filters
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/user-management", {
        params: { page, limit, search, filter, startDate, endDate },
      });
      if (res.data.success) {
        setUsers(res.data.users);
        setTotalPages(res.data.pages);
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit, search, filter, startDate, endDate]);

const handleSave = async () => {
  if (!selectedUser.fullName || !selectedUser.email) {
    toast.error("Full Name and Email are required!");
    return;
  }

  try {
    setSaving(true);

    // ✅ Create update payload
    const updateData: any = {
      fullName: selectedUser.fullName,
      email: selectedUser.email,
      sponsorId: selectedUser.sponsorId || undefined,
    };

    // ✅ Include password only if admin entered it
    if (newPassword.trim() !== "") {
      updateData.password = newPassword.trim();
    }

    const res = await axios.patch("/api/admin/user-management", {
      userId: selectedUser.userId,
      updateData,
    });

    if (res.data.success) {
      toast.success(
        newPassword
          ? "User and password updated successfully!"
          : "User details updated successfully!"
      );
      setEditModal(false);
      setNewPassword(""); // clear the input
      fetchUsers();
    } else {
      toast.error(res.data.message || "Failed to update user");
    }
  } catch {
    toast.error("Failed to update user");
  } finally {
    setSaving(false);
  }
};


  // 🔹 Toggle active/inactive
  const handleToggleActive = async (user: any) => {
    const willBlock = user.isActive;
    const confirm = await Swal.fire({
      title: willBlock ? "Deactivate this user?" : "Activate this user?",
      text: willBlock
        ? "User will lose access to the system."
        : "User will regain access.",
      icon: willBlock ? "warning" : "success",
      showCancelButton: true,
      confirmButtonText: willBlock ? "Deactivate" : "Activate",
      confirmButtonColor: willBlock ? "#ef4444" : "#22c55e",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.patch("/api/admin/user-management", {
        userId: user.userId,
        updateData: { isActive: !user.isActive },
      });
      if (res.data.success) {
        toast.success(user.isActive ? "User Deactivated" : "User Activated");
        fetchUsers();
      }
    } catch {
      toast.error("Error updating user status");
    }
  };

  // 🔹 Excel download
  const handleExport = async () => {
    try {
      const res = await fetch(
        `/api/admin/user-management?export=excel&filter=${filter}&search=${search}&startDate=${startDate}&endDate=${endDate}`
      );
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users_data.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      toast.error("Excel download failed");
    }
  };

  // 🔹 Admin -> Login as user (no password)
  const handleLoginAsUser = async (userId: string) => {
    try {
      const res = await axios.post("/api/admin/login-as-user", { userId });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("userId", userId);
        toast.success("Logged in as user!");
        window.location.href = "/user/dashboard";
      } else {
        toast.error("Failed to login as user");
      }
    } catch {
      toast.error("Error logging in as user");
    }
  };

  return (
    <Layout>
      <div className="p-6 sm:p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <h2 className="text-2xl font-bold text-blue-700">User Management</h2>

          <div className="flex flex-wrap items-center gap-3">
            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border p-2 rounded-lg text-sm"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            {/* Search */}
            <input
              type="text"
              placeholder="Search user..."
              className="border p-2 rounded-lg text-sm w-48"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* Date Filter */}
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border p-2 rounded-lg text-sm"
              />
              <span className="text-gray-500">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border p-2 rounded-lg text-sm"
              />
              <Calendar className="w-4 h-4 text-gray-500" />
            </div>

            {/* Limit */}
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="border p-2 rounded-lg text-sm"
            >
              {[10, 20, 50, 100, 500].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>

            {/* Export */}
            <button
              onClick={handleExport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm transition"
            >
              <Download size={16} /> Export Excel
            </button>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg max-h-[70vh] overflow-y-auto">
            <table className="min-w-full text-sm border-collapse">
              <thead className="bg-blue-50 text-blue-700 sticky top-0">
                <tr>
                  <th className="p-3 text-left">User ID</th>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Sponsor ID</th>
                  <th className="p-3 text-left">Created On</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length ? (
                  users.map((u, i) => (
                    <tr key={u._id} className={`hover:bg-blue-50 transition ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}>
                      <td className="p-3 font-semibold">{u.userId}</td>
                      <td className="p-3">{u.fullName}</td>
                      <td className="p-3">{u.email}</td>
                      <td className="p-3">{u.sponsorId || "—"}</td>
                      <td className="p-3 text-gray-600">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-3">
                        {u.isActive ? (
                          <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs font-semibold">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-3 flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setEditModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit User"
                        >
                          <Edit size={18} />
                        </button>

                        <button
                          onClick={() => handleToggleActive(u)}
                          className={`${
                            u.isActive
                              ? "text-red-600 hover:text-red-800"
                              : "text-green-600 hover:text-green-800"
                          }`}
                          title={u.isActive ? "Deactivate" : "Activate"}
                        >
                          {u.isActive ? (
                            <Ban size={18} />
                          ) : (
                            <Unlock size={18} />
                          )}
                        </button>

                        <button
                          onClick={() => handleLoginAsUser(u.userId)}
                          className="text-purple-600 hover:text-purple-800"
                          title="Login as User"
                        >
                          <LogIn size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-end items-center mt-4 gap-2 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            disabled={page === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      {/* Edit Modal */}
      {editModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl relative animate-fadeIn overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setEditModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-xl font-bold text-blue-700 mb-6 border-b pb-2">
              Edit User — {selectedUser.fullName}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={selectedUser.fullName}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      fullName: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) =>
                    setSelectedUser({ ...selectedUser, email: e.target.value })
                  }
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              {/* 
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sponsor ID
                </label>
                <input
                  type="text"
                  value={selectedUser.sponsorId || ""}
                  onChange={(e) =>
                    setSelectedUser({
                      ...selectedUser,
                      sponsorId: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div> */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password (optional)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    placeholder="Enter new password"
                    onChange={(e) => setNewPassword(e.target.value)}
                    // onChange={(e) =>
                    //   setSelectedUser({
                    //     ...selectedUser,
                    //     password: e.target.value,
                    //   })
                    // }
                    className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t pt-4">
              <button
                onClick={() => setEditModal(false)}
                className="px-4 py-2 rounded-lg border text-gray-600 hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-all"
              >
                {saving && <Loader2 className="animate-spin w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

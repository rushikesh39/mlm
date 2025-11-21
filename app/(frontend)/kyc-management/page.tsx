"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Loader2,
  Eye,
  FileText,
  Download,
  Check,
  X,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Layout from "../layout/Layout";

export default function AdminKycPage() {
  const [kycList, setKycList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedKyc, setSelectedKyc] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // ✅ Fetch KYC list
  const fetchKycList = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`/api/admin/kyc-list`, {
        params: { status: statusFilter, search: searchTerm, limit, page },
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setKycList(res.data.kycs);
        setTotalPages(res.data.pages);
      } else {
        toast.error("Failed to load KYC records");
      }
    } catch {
      toast.error("Error loading KYC list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycList();
  }, [statusFilter, searchTerm, limit, page]);

  // ✅ Approve / Reject with Confirmation
  const handleAction = async (kycId: string, status: number) => {
    const action = status === 1 ? "approve" : "reject";

    // SweetAlert2 confirmation + optional remarks input
    let { value: remarks, isConfirmed } = await Swal.fire({
      title: status === 1 ? "Approve KYC?" : "Reject KYC?",
      text:
        status === 1
          ? "Are you sure you want to approve this KYC?"
          : "Please provide reason for rejection:",
      icon: status === 1 ? "success" : "warning",
      input: status === 2 ? "text" : undefined,
      inputPlaceholder: status === 2 ? "Enter rejection reason" : undefined,
      showCancelButton: true,
      confirmButtonText: status === 1 ? "Approve" : "Reject",
      confirmButtonColor: status === 1 ? "#22c55e" : "#ef4444",
    });

    if (!isConfirmed) return;
    if (status === 2 && !remarks) {
      toast.error("Remarks are required to reject a KYC");
      return;
    }
    if (status === 1) {
      remarks = "";
    }
    try {
      const res = await axios.patch("/api/admin/kyc-update", {
        kycId,
        status,
        remarks,
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchKycList();
      } else {
        toast.error(res.data.message);
      }
    } catch {
      toast.error("Something went wrong");
    }
  };

  const handleExport = async () => {
    try {
      const res = await fetch(`/api/admin/kyc-list?export=excel`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kyc_data.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      toast.error("Excel download failed");
    }
  };

  const deleteKyc = async (kycId: string) => {
    const confirmed = await Swal.fire({
      title: "Delete KYC Record?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
    });

    if (!confirmed.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`/api/admin/delete-kyc`, {
        data: { kycId },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success("KYC record deleted successfully!");
        fetchKycList(); // refresh table
      } else {
        toast.error(res.data.message || "Failed to delete KYC");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting KYC record");
    }
  };

  const getStatusBadge = (status: number) => {
    const base =
      "px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center justify-center";
    switch (status) {
      case 0:
        return (
          <span className={`${base} bg-yellow-100 text-yellow-700`}>
            Pending
          </span>
        );
      case 1:
        return (
          <span className={`${base} bg-green-100 text-green-700`}>
            Approved
          </span>
        );
      case 2:
        return (
          <span className={`${base} bg-red-100 text-red-700`}>Rejected</span>
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="p-6 sm:p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" />
            KYC Management
          </h2>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border p-2 rounded-lg text-sm"
            >
              <option value="all">All</option>
              <option value="0">Pending</option>
              <option value="1">Approved</option>
              <option value="2">Rejected</option>
            </select>

            <input
              type="text"
              placeholder="Search by User ID or Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border p-2 rounded-lg text-sm w-48"
            />

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
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border border-gray-200 rounded-lg shadow-md">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800">
                <tr>
                  <th className="py-3 px-4 text-left">User ID</th>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">PAN</th>
                  <th className="py-3 px-4 text-left">Bank</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Created On</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {kycList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-500">
                      No KYC requests found
                    </td>
                  </tr>
                ) : (
                  kycList.map((kyc, i) => (
                    <tr
                      key={kyc._id}
                      className={`hover:bg-blue-50 transition ${
                        i % 2 === 0 ? "bg-white" : "bg-gray-50"
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold text-gray-800">
                        {kyc.userId}
                      </td>
                      <td className="py-3 px-4">{kyc.userName}</td>
                      <td className="py-3 px-4">{kyc.panNumber}</td>
                      <td className="py-3 px-4">{kyc.bankName}</td>
                      <td className="py-3 px-4">
                        {getStatusBadge(kyc.status)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(kyc.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-center flex justify-center gap-2">
                        <button
                          onClick={() => setSelectedKyc(kyc)}
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          <Eye size={18} />
                        </button>
                        {kyc.status === 0 && (
                          <>
                            <button
                              onClick={() => handleAction(kyc._id, 1)}
                              className="text-green-600 hover:text-green-800"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => handleAction(kyc._id, 2)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => deleteKyc(kyc._id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
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

      {/* View Modal */}
      {selectedKyc && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-40 bg-opacity-80 z-50">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedKyc(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
            >
              ✕
            </button>

            <h3 className="text-xl font-bold text-blue-700 mb-4">
              KYC Details — {selectedKyc.userName}
            </h3>

            <div className="space-y-2 text-sm text-gray-700">
              <p>
                <strong>User ID:</strong> {selectedKyc.userId}
              </p>
              <p>
                <strong>PAN Number:</strong> {selectedKyc.panNumber}
              </p>
              <p>
                <strong>Aadhar Number:</strong> {selectedKyc.aadharNumber}
              </p>
              <p>
                <strong>Bank Name:</strong> {selectedKyc.bankName}
              </p>
              <p>
                <strong>Account Number:</strong> {selectedKyc.accountNumber}
              </p>
              <p>
                <strong>IFSC Code:</strong> {selectedKyc.ifscCode}
              </p>
              <p>
                <strong>Created On:</strong>{" "}
                {new Date(selectedKyc.createdAt).toLocaleString()}
              </p>
            </div>

            {selectedKyc.documentImage && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-1">Uploaded Document:</p>
                <img
                  src={selectedKyc.documentImage}
                  alt="Document"
                  className="w-full rounded-lg border"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  );
}

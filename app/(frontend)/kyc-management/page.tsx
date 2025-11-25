"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "../layout/Layout";

import { Eye, Check, X, Trash2, Download } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

// -------------------------------
// STATUS BADGE
// -------------------------------
const StatusBadge = ({ status }: { status: number }) => {
  if (status === 0)
    return <Badge className="bg-yellow-100 text-yellow-700">Pending</Badge>;
  if (status === 1)
    return <Badge className="bg-green-100 text-green-700">Approved</Badge>;
  if (status === 2)
    return <Badge className="bg-red-100 text-red-700">Rejected</Badge>;
  return null;
};

// -------------------------------
// MAIN PAGE
// -------------------------------
export default function AdminKycPage() {
  const [kycList, setKycList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedKyc, setSelectedKyc] = useState<any | null>(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Controlled dialog state (store the kycId of the open approve dialog or null)
  const [openApproveId, setOpenApproveId] = useState<string | null>(null);

  // Global reject dialog state (single dialog outside the table)
  const [rejectData, setRejectData] = useState<{
    open: boolean;
    id: string | null;
    remarks: string;
  }>({ open: false, id: null, remarks: "" });

  // -------------------------------
  // FETCH KYC LIST
  // -------------------------------
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
        setTotalPages(res.data.pages || 1);
      } else {
        setKycList([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load KYC list");
      setKycList([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKycList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm, limit, page]);

  // -------------------------------
  // APPROVE / REJECT (updated signature)
  // -------------------------------
  // remarks defaults to empty string for approve
  const handleAction = async (
    id: string | null,
    status: number,
    remarks: string = ""
  ) => {
    if (!id) return;
    try {
      const token = localStorage.getItem("token");

      const res = await axios.patch(
        "/api/admin/kyc-update",
        { kycId: id, status, remarks },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message || "Updated successfully");
        // close any open dialogs for that id
        if (openApproveId === id) setOpenApproveId(null);
        // close global reject dialog if it was that id
        if (rejectData.id === id)
          setRejectData({ open: false, id: null, remarks: "" });
        fetchKycList();
      } else {
        toast.error(res.data.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update");
    }
  };

  // -------------------------------
  // DELETE
  // -------------------------------
  const handleDelete = async (id: string) => {
    try {
      if (!confirm("Delete KYC record? This action cannot be undone.")) return;

      const token = localStorage.getItem("token");

      const res = await axios.delete("/api/admin/delete-kyc", {
        data: { kycId: id },
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data?.success) {
        toast.success("KYC deleted");
        fetchKycList();
      } else {
        toast.error(res.data?.message || "Delete failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  // -------------------------------
  // EXPORT
  // -------------------------------
  const handleExport = async () => {
    try {
      const res = await fetch(`/api/admin/kyc-list?export=excel`);
      const blob = await res.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "kyc_data.xlsx";
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      toast.error("Failed to export");
    }
  };

  // -------------------------------
  // TABLE COLUMNS
  // -------------------------------
  const columns: ColumnDef<any>[] = [
    { accessorKey: "userId", header: "User ID" },
    { accessorKey: "userName", header: "Name" },
    { accessorKey: "panNumber", header: "PAN" },
    { accessorKey: "bankName", header: "Bank" },

    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.original.status} />,
    },

    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => {
        try {
          return format(
            new Date(row.original.createdAt),
            "yyyy-MM-dd hh:mm:ss a"
          );
        } catch {
          return row.original.createdAt ?? "-";
        }
      },
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const kyc = row.original as any;
        const isApproveOpen = openApproveId === kyc._id;

        return (
          <div className="inline-flex rounded-md shadow-sm border overflow-hidden">
            {/* APPROVE (AlertDialog controlled per-row) */}
            {kyc.status === 0 && (
              <AlertDialog
                open={isApproveOpen}
                onOpenChange={(open) => setOpenApproveId(open ? kyc._id : null)}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          className="rounded-none border-l bg-green-600 hover:bg-green-700 text-white cursor-pointer"
                        >
                          <Check size={18} />
                        </Button>
                      </AlertDialogTrigger>
                    </TooltipTrigger>
                    <TooltipContent>Approve KYC</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Approve KYC?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to approve this KYC? This action
                      will mark the KYC as approved.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => handleAction(kyc._id, 1, "")}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}

            {/* REJECT: open global reject dialog by setting rejectData */}
            {kyc.status === 0 && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="rounded-none border-l bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                      onClick={() =>
                        setRejectData({ open: true, id: kyc._id, remarks: "" })
                      }
                    >
                      <X size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Reject KYC</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* DELETE */}
            <AlertDialog>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-none border-l text-red-600 hover:text-red-800 cursor-pointer"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </AlertDialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>Delete Record</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete KYC Record?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. Do you really want to delete
                    this KYC permanently?
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>

                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={() => handleDelete(kyc._id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            {/* VIEW (ShadCN Dialog per-row is fine since it's read-only) */}
            {/* VIEW */}
            <Dialog>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <DialogTrigger asChild>
                      <Button
                        size="icon"
                        className="rounded-none bg-blue-600 hover:bg-blue-700 cursor-pointer"
                      >
                        <Eye size={18} className="text-white" />
                      </Button>
                    </DialogTrigger>
                  </TooltipTrigger>
                  <TooltipContent>View Details</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>KYC Details — {kyc.userName}</DialogTitle>
                  <DialogDescription>
                    User KYC information overview
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 text-sm">
                  <p>
                    <b>User ID:</b> {kyc.userId}
                  </p>
                  <p>
                    <b>PAN:</b> {kyc.panNumber}
                  </p>
                  <p>
                    <b>Aadhar:</b> {kyc.aadharNumber}
                  </p>
                  <p>
                    <b>Bank:</b> {kyc.bankName}
                  </p>
                  <p>
                    <b>Account Number:</b> {kyc.accountNumber}
                  </p>
                  <p>
                    <b>IFSC Code:</b> {kyc.ifscCode}
                  </p>
                  <p>
                    <b>Created At:</b>{" "}
                    {format(new Date(kyc.createdAt), "yyyy-MM-dd hh:mm:ss a")}
                  </p>
                </div>

                {kyc.documentImage && (
                  <div className="mt-4">
                    <img
                      src={kyc.documentImage}
                      alt="Document"
                      className="w-full rounded-lg border"
                    />
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        );
      },
    },
  ];

  // -------------------------------
  // TABLE INIT
  // -------------------------------
  const table = useReactTable({
    data: kycList,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // -------------------------------
  // SKELETON ROWS
  // -------------------------------
  const SkeletonRows = Array.from({ length: 8 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: 7 }).map((_, c) => (
        <TableCell key={c}>
          <Skeleton className="h-5 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));

  return (
    <Layout>
      <div className="p-6 sm:p-10 bg-white rounded-xl border shadow">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-700">KYC Management</h2>

          <Button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white flex gap-2"
          >
            <Download size={16} /> Export Excel
          </Button>
        </div>

        {/* FILTERS – Updated ShadCN Style */}
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(value: any) => {
              setStatusFilter(value);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[150px] cursor-pointer">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="0">Pending</SelectItem>
              <SelectItem value="1">Approved</SelectItem>
              <SelectItem value="2">Rejected</SelectItem>
            </SelectContent>
          </Select>

          {/* Search */}
          <Input
            placeholder="Search user ID or name..."
            className="w-[220px]"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
          />

          {/* Limit */}
          <Select
            value={String(limit)}
            onValueChange={(value: any) => {
              setLimit(Number(value));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] cursor-pointer">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent>
              {[10, 20, 50, 100].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* TABLE */}
        <div className="rounded border">
          <Table>
            <TableHeader className="bg-blue-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {loading ? (
                SkeletonRows
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    No KYC records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION */}
        <div className="flex justify-end mt-4 gap-3 text-sm">
          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Prev
          </Button>

          <span>
            Page {page} of {totalPages}
          </span>

          <Button
            variant="outline"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* GLOBAL REJECT DIALOG (moved outside the table to avoid flicker & reverse typing) */}
      <Dialog
        open={rejectData.open}
        onOpenChange={(open) => setRejectData((d) => ({ ...d, open }))}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject KYC?</DialogTitle>
            <DialogDescription>
              Provide a reason for rejection.
            </DialogDescription>
          </DialogHeader>

          <textarea
            className="w-full border rounded p-2 text-sm mt-2"
            placeholder="Enter rejection remarks..."
            value={rejectData.remarks}
            onChange={(e) =>
              setRejectData((d) => ({ ...d, remarks: e.target.value }))
            }
            rows={4}
          />

          <DialogFooter className="mt-3">
            <Button
              variant="outline"
              onClick={() =>
                setRejectData({ open: false, id: null, remarks: "" })
              }
            >
              Cancel
            </Button>

            <Button
              disabled={!rejectData.remarks.trim() || !rejectData.id}
              onClick={() => {
                handleAction(rejectData.id, 2, rejectData.remarks.trim());
                setRejectData({ open: false, id: null, remarks: "" });
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Layout from "../../layout/Layout";

import {
  Edit,
  Ban,
  Unlock,
  Download,
  LogIn,
  Loader2,
  Eye,
  EyeOff,
  Calendar as CalendarIcon,
} from "lucide-react";

import { format, formatISO } from "date-fns";

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

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

// ShadCN date-picker pieces
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// -------------------------------
// Helpers / Small components
// -------------------------------
const StatusBadge = ({ isActive }: { isActive: boolean }) =>
  isActive ? (
    <Badge className="bg-green-100 text-green-700">Active</Badge>
  ) : (
    <Badge className="bg-red-100 text-red-700">Block</Badge>
  );

// -------------------------------
// Main
// -------------------------------
export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // Global Edit dialog state (single dialog)
  const [editData, setEditData] = useState<{
    open: boolean;
    user: any | null;
    newPassword: string;
    showPassword: boolean;
    saving: boolean;
  }>({
    open: false,
    user: null,
    newPassword: "",
    showPassword: false,
    saving: false,
  });

  // -------------------------------
  // Fetch users
  // -------------------------------
  const fetchUsers = async () => {
    try {
      setLoading(true);

      // convert dates to yyyy-MM-dd when sending to backend.z
      const start = startDate ? format(startDate, "yyyy-MM-dd") : "";
      const end = endDate ? format(endDate, "yyyy-MM-dd") : "";

      const res = await axios.get("/api/admin/user-management", {
        params: { page, limit, search, filter, startDate: start, endDate: end },
      });
      if (res.data.success) {
        setUsers(res.data.users || []);
        setTotalPages(res.data.pages || 1);
      } else {
        setUsers([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
      setUsers([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, search, filter, startDate, endDate]);

  // -------------------------------
  // Table columns (tanstack) — SR NO is first column
  // -------------------------------
  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "sr",
        header: "SR NO",
        cell: ({ row }) => {
          // continuous numbering across pages: (page-1)*limit + index + 1
          const sr = (page - 1) * limit + row.index + 1;
          return sr;
        },
        enableSorting: false,
      },
      { accessorKey: "userId", header: "User ID" },
      { accessorKey: "fullName", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "sponsorId", header: "Sponsor ID" },
      {
        accessorKey: "createdAt",
        header: "Created On",
        cell: ({ row }) => {
          const raw = row.original?.createdAt;
          try {
            return format(new Date(raw), "yyyy-MM-dd hh:mm:ss a");
          } catch {
            return raw ?? "-";
          }
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => <StatusBadge isActive={row.original.isActive} />,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const u = row.original as any;

          return (
            <div className="inline-flex rounded-md overflow-hidden border">
              {/* Edit - blue background */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="icon"
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded-none border-r"
                      onClick={() =>
                        setEditData((d) => ({
                          ...d,
                          open: true,
                          user: u,
                          newPassword: "",
                          showPassword: false,
                        }))
                      }
                    >
                      <Edit size={16} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit User</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Activate / Deactivate - green or red */}
              <AlertDialog>
                <TooltipProvider>
                  <Tooltip>
                    {/* TooltipTrigger must wrap ONLY the Button */}
                    <AlertDialogTrigger asChild>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          className={
                            u.isActive
                              ? "bg-green-100 hover:bg-green-200 text-green-700 rounded-none border-r"
                              : "bg-red-100 hover:bg-red-200 text-red-700 rounded-none border-r"
                          }
                        >
                          {u.isActive ? (
                            <Unlock size={16} />
                          ) : (
                            <Ban size={16} />
                          )}
                        </Button>
                      </TooltipTrigger>
                    </AlertDialogTrigger>

                    <TooltipContent>
                      {u.isActive ? "Block" : "Activate"}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                {/* Dialog content (unchanged) */}
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {u.isActive ? "Deactivate User?" : "Activate User?"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      {u.isActive
                        ? "Deactivating will prevent the user from logging in."
                        : "Activating will allow the user to log in again."}
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className={
                        u.isActive
                          ? "bg-red-600 hover:bg-red-700"
                          : "bg-green-600 hover:bg-green-700"
                      }
                      onClick={async () => {
                        try {
                          const res = await axios.patch(
                            "/api/admin/user-management",
                            {
                              userId: u.userId,
                              updateData: { isActive: !u.isActive },
                            }
                          );

                          if (res.data.success) {
                            toast.success(
                              u.isActive ? "User deactivated" : "User activated"
                            );
                            fetchUsers();
                          } else {
                            toast.error(
                              res.data.message || "Failed to update status"
                            );
                          }
                        } catch (err) {
                          console.error(err);
                          toast.error("Error updating status");
                        }
                      }}
                    >
                      {u.isActive ? "Deactivate" : "Activate"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              {/* Login as user - purple */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          className="bg-purple-600 hover:bg-purple-700 text-white rounded-none border-r"
                        >
                          <LogIn size={16} />
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Login as {u.fullName}?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            You'll be signed in as this user (admin
                            impersonation). Continue?
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={async () => {
                              try {
                                const res = await axios.post(
                                  "/api/admin/login-as-user",
                                  { userId: u.userId }
                                );
                                if (res.data.success) {
                                  localStorage.setItem("token", res.data.token);
                                  localStorage.setItem("userId", u.userId);
                                  toast.success("Logged in as user");
                                  window.location.href = "/user/dashboard";
                                } else {
                                  toast.error("Failed to login as user");
                                }
                              } catch (err) {
                                console.error(err);
                                toast.error("Error logging in as user");
                              }
                            }}
                          >
                            Continue
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TooltipTrigger>
                  <TooltipContent>Login as user</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* NOTE: Delete removed as requested */}
            </div>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [page, limit]
  );

  const table = useReactTable({
    data: users,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  // -------------------------------
  // Skeleton rows
  // -------------------------------
  const SkeletonRows = Array.from({ length: 8 }).map((_, i) => (
    <TableRow key={i}>
      {Array.from({ length: 8 }).map((_, c) => (
        <TableCell key={c}>
          <Skeleton className="h-5 w-full" />
        </TableCell>
      ))}
    </TableRow>
  ));

  // -------------------------------
  // Export handler
  // -------------------------------
  const handleExport = async () => {
    try {
      const start = startDate ? format(startDate, "yyyy-MM-dd") : "";
      const end = endDate ? format(endDate, "yyyy-MM-dd") : "";

      const res = await fetch(
        `/api/admin/user-management?export=excel&filter=${filter}&search=${encodeURIComponent(
          search
        )}&startDate=${start}&endDate=${end}`
      );
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "users_data.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      toast.error("Excel download failed");
    }
  };

  // -------------------------------
  // Save edited user
  // -------------------------------
  const handleSave = async () => {
    if (!editData.user) return;
    const user = editData.user;
    if (!user.fullName || !user.email) {
      toast.error("Full name and email are required");
      return;
    }

    try {
      setEditData((d) => ({ ...d, saving: true }));
      const updateData: any = {
        fullName: user.fullName,
        email: user.email,
        sponsorId: user.sponsorId || undefined,
      };
      if (editData.newPassword?.trim())
        updateData.password = editData.newPassword.trim();

      const res = await axios.patch("/api/admin/user-management", {
        userId: user.userId,
        updateData,
      });

      if (res.data.success) {
        toast.success(
          editData.newPassword ? "User + password updated" : "User updated"
        );
        setEditData({
          open: false,
          user: null,
          newPassword: "",
          showPassword: false,
          saving: false,
        });
        fetchUsers();
      } else {
        toast.error(res.data.message || "Update failed");
        setEditData((d) => ({ ...d, saving: false }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Update failed");
      setEditData((d) => ({ ...d, saving: false }));
    }
  };

  return (
    <Layout>
      <div className="p-6 sm:p-10 bg-white rounded-2xl shadow-xl border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-700">Users Management</h2>

          <Button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white flex gap-2"
          >
            <Download size={16} /> Export Excel
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter (ShadCN Select) */}
            <Select
              value={filter}
              onValueChange={(v: any) => {
                setFilter(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Block</SelectItem>
              </SelectContent>
            </Select>

            {/* Search (ShadCN Input) */}
            <Input
              placeholder="Search user..."
              className="w-[220px]"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />

            {/* Date filter — ShadCN Popover + Calendar */}
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-start">
                    {startDate ? format(startDate, "yyyy-MM-dd") : "Start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(d) => {
                      if (!d) return;
                      setStartDate(d);
                      setPage(1);
                    }}
                    captionLayout="dropdown" // show month & year selectors
                    required={false}
                  />
                </PopoverContent>
              </Popover>

              <span className="text-gray-500">to</span>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[140px] justify-start">
                    {endDate ? format(endDate, "yyyy-MM-dd") : "End date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(d) => {
                      if (!d) return;
                      setEndDate(d);
                      setPage(1);
                    }}
                    captionLayout="dropdown"
                    required={false}
                  />
                </PopoverContent>
              </Popover>

              <CalendarIcon className="w-4 h-4 text-gray-500" />
            </div>

            {/* Limit */}
            <Select
              value={String(limit)}
              onValueChange={(v: any) => {
                setLimit(Number(v));
                setPage(1);
              }}
            >
              <SelectTrigger className="w-[140px]">
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
        </div>

        {/* Table */}
        <div className="rounded border">
          <Table>
            <TableHeader className="bg-blue-50">
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
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
                  <TableRow
                    key={row.id}
                    className="hover:bg-blue-50 odd:bg-white even:bg-gray-50"
                  >
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
                  <TableCell
                    colSpan={8}
                    className="text-center py-8 text-gray-500"
                  >
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-end items-center mt-4 gap-2 text-sm">
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

      {/* Global Edit Dialog */}
      <Dialog
        open={editData.open}
        onOpenChange={(open) => {
          if (!open)
            setEditData({
              open: false,
              user: null,
              newPassword: "",
              showPassword: false,
              saving: false,
            });
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user details.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={editData.user?.fullName || ""}
                onChange={(e) =>
                  setEditData((d) => ({
                    ...d,
                    user: { ...d.user, fullName: e.target.value },
                  }))
                }
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={editData.user?.email || ""}
                onChange={(e) =>
                  setEditData((d) => ({
                    ...d,
                    user: { ...d.user, email: e.target.value },
                  }))
                }
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sponsor ID
              </label>
              <input
                type="text"
                value={editData.user?.sponsorId || ""}
                onChange={(e) =>
                  setEditData((d) => ({
                    ...d,
                    user: { ...d.user, sponsorId: e.target.value },
                  }))
                }
                className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password (optional)
              </label>
              <div className="relative">
                <input
                  type={editData.showPassword ? "text" : "password"}
                  value={editData.newPassword}
                  onChange={(e) =>
                    setEditData((d) => ({ ...d, newPassword: e.target.value }))
                  }
                  placeholder="Enter new password"
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none pr-10"
                />
                <button
                  type="button"
                  onClick={() =>
                    setEditData((d) => ({
                      ...d,
                      showPassword: !d.showPassword,
                    }))
                  }
                  className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
                >
                  {editData.showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() =>
                setEditData({
                  open: false,
                  user: null,
                  newPassword: "",
                  showPassword: false,
                  saving: false,
                })
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              {editData.saving ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

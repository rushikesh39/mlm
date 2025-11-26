"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, Plus, Edit, Save, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import Layout from "../layout/Layout";
import { onlyPositive } from "../utils/onlyPositive";

interface Level {
  level: number;
  commissionPercent: number;
}

interface Plan {
  _id: string;
  name: string;
  type: number;
  amount: number;
  dailyCommission: number;
  monthlyCommission: number;
  description: string;
  isActive: boolean;
  levels: Level[];
}

interface PlansApiResponse {
  success: boolean;
  plans: Plan[];
  total: number;
  message?: string;
}

export default function AdminPlansPage() {
  // data state
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // dialog & form state
  const [open, setOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);

  // local form (for editing/creating)
  const [form, setForm] = useState<Omit<Plan, "_id"> & { _id?: string }>({
    _id: "",
    name: "",
    type: 1,
    amount: 0,
    dailyCommission: 0,
    monthlyCommission: 0,
    description: "",
    isActive: true,
    levels: [{ level: 1, commissionPercent: 0 }],
  });

  // separate status string used by the Select ("active" | "inactive")
  const [status, setStatus] = useState<"active" | "inactive">("active");

  // pagination (server-side)
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalItems, setTotalItems] = useState<number>(0);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const pageSizes = [10, 25, 50];

  // fetch plans from server with ?page=&pageSize=
  const fetchPlans = async (p = page, ps = pageSize) => {
    try {
      setLoading(true);
      const res = await axios.get<PlansApiResponse>(
        `/api/admin/plans?page=${p}&limit=${ps}`
      );

      if (res.data?.success) {
        setPlans(res.data.plans || []);
        setTotalItems(res.data.total ?? 0);
      } else {
        toast.error(res.data?.message || "Failed to load plans");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // refetch when page or size changes
  useEffect(() => {
    fetchPlans(page, pageSize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const openCreate = () => {
    setEditPlan(null);
    setForm({
      _id: "",
      name: "",
      type: 1,
      amount: 0,
      dailyCommission: 0,
      monthlyCommission: 0,
      description: "",
      isActive: true,
      levels: [{ level: 1, commissionPercent: 0 }],
    });
    setStatus("active");
    setOpen(true);
  };

  const openEdit = (p: Plan) => {
    setEditPlan(p);
    setForm({
      _id: p._id,
      name: p.name,
      type: p.type,
      amount: p.amount,
      dailyCommission: p.dailyCommission,
      monthlyCommission: p.monthlyCommission,
      description: p.description,
      isActive: p.isActive,
      levels: p.levels ?? [{ level: 1, commissionPercent: 0 }],
    });
    setStatus(p.isActive ? "active" : "inactive");
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Build payload: map status string to boolean isActive
      const payloadData = {
        ...form,
        isActive: status === "active",
      };

      const payload = editPlan
        ? { id: editPlan._id, updateData: payloadData }
        : payloadData;

      const res = await axios[editPlan ? "patch" : "post"](
        "/api/admin/plans",
        payload
      );

      if (res.data?.success) {
        toast.success(editPlan ? "Plan updated" : "Plan created");
        setOpen(false);
        // refresh current page (server side)
        fetchPlans(page, pageSize);
      } else {
        toast.error(res.data?.message || "Failed to save plan");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save plan");
    }
  };

  // Level helpers
  const addLevel = () => {
    setForm((prev) => ({
      ...prev,
      levels: [
        ...prev.levels,
        { level: prev.levels.length + 1, commissionPercent: 0 },
      ],
    }));
  };

  const removeLevel = (index: number) => {
    setForm((prev) => {
      const updated = [...prev.levels];
      updated.splice(index, 1);
      return { ...prev, levels: updated };
    });
  };

  const updateLevelField = (index: number, field: keyof Level, value: number) => {
    setForm((prev) => {
      const updated = [...prev.levels];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, levels: updated };
    });
  };

  // Pagination helpers
  const gotoPage = (p: number) => {
    const newPage = Math.max(1, Math.min(totalPages, p));
    setPage(newPage);
  };

  // srStart for serial number computation
  const srStart = (page - 1) * pageSize;

  // build page items with ellipsis (dataTables style)
  const pageItems = useMemo(() => {
    const total = totalPages;
    const current = page;
    const delta = 2; // how many neighbors
    const range: (number | string)[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) range.push(i);
    } else {
      // always show first
      range.push(1);

      const left = Math.max(2, current - delta);
      const right = Math.min(total - 1, current + delta);

      if (left > 2) range.push("...");
      for (let i = left; i <= right; i++) range.push(i);
      if (right < total - 1) range.push("...");
      range.push(total);
    }
    return range;
  }, [page, totalPages]);

  // "Showing X to Y of Z entries" calculations
  const showingFrom = totalItems === 0 ? 0 : srStart + 1;
  const showingTo = Math.min(totalItems, srStart + plans.length);

  return (
    <TooltipProvider delayDuration={150}>
      <Layout>
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-blue-700">Plans Management</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Create and manage subscription plans
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Label className="text-sm">Page size</Label>
                <Select
                  onValueChange={(val) => {
                    const ps = Number(val);
                    setPageSize(ps);
                    setPage(1); // reset to first page when pageSize changes
                  }}
                  defaultValue={String(pageSize)}
                >
                  <SelectTrigger className="w-[80px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pageSizes.map((s) => (
                      <SelectItem key={s} value={String(s)}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={openCreate} className="flex items-center gap-2">
                <Plus size={16} /> New Plan
              </Button>
            </div>
          </div>

          <Separator />

          <CardContent className="mt-4">
            <ScrollArea>
              <div className="rounded border">
                <Table>
                  <TableHeader className="bg-blue-50">
                    <TableRow>
                      <TableHead className="w-[60px]">Sr.</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Daily</TableHead>
                      <TableHead>Monthly</TableHead>
                      <TableHead>Levels</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {loading ? (
                      // Skeleton rows while loading
                      Array.from({ length: pageSize }).map((_, i) => (
                        <TableRow key={`skeleton-${i}`} className="animate-pulse">
                          <TableCell>
                            <div className="h-4 w-6 bg-gray-200 rounded" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-32 bg-gray-200 rounded" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-16 bg-gray-200 rounded" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-12 bg-gray-200 rounded" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-12 bg-gray-200 rounded" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-20 bg-gray-200 rounded" />
                          </TableCell>
                          <TableCell>
                            <div className="h-4 w-20 bg-gray-200 rounded" />
                          </TableCell>
                          <TableCell>
                            <div className="h-8 w-24 bg-gray-200 rounded" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : plans.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8">
                          No plans found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      plans.map((p, idx) => (
                        <TableRow
                          key={p._id}
                          className="hover:bg-muted/50 odd:bg-white even:bg-gray-50"
                        >
                          <TableCell className="font-medium">
                            {srStart + idx + 1}
                          </TableCell>

                          <TableCell className="font-medium">{p.name}</TableCell>

                          <TableCell>₹{p.amount}</TableCell>
                          <TableCell>{p.dailyCommission}%</TableCell>
                          <TableCell>{p.monthlyCommission}%</TableCell>
                          <TableCell>{p.levels?.length ?? 0} Levels</TableCell>

                          <TableCell>
                            {p.isActive ? (
                              <Badge className="text-green-700 border-green-200" variant="outline">
                                Active
                              </Badge>
                            ) : (
                              <Badge className="text-red-700 border-red-200" variant="outline">
                                Inactive
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="flex justify-center">
                            {/* Only Edit button */}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                                  onClick={() => openEdit(p)}
                                >
                                  <Edit size={18} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="top">Edit Plan</TooltipContent>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>

            {/* Pagination bar: left - info, right - page controls (right-aligned) */}
            <div className="flex items-center justify-between gap-4 mt-4">
              {/* Left: showing text */}
              <div className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium">{showingFrom}</span> to{" "}
                <span className="font-medium">{showingTo}</span> of{" "}
                <span className="font-medium">{totalItems}</span> entries
              </div>

              {/* Right: pagination controls (DataTables-like, right-aligned) */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1 || loading}
                  onClick={() => gotoPage(page - 1)}
                >
                  Previous
                </Button>

                <nav className="inline-flex items-center gap-2" aria-label="Pagination">
                  {pageItems.map((pItem, idx) =>
                    pItem === "..." ? (
                      <span
                        key={`dots-${idx}`}
                        className="inline-flex h-8 min-w-[36px] items-center justify-center rounded-md bg-transparent px-3 text-sm text-muted-foreground"
                      >
                        …
                      </span>
                    ) : (
                      <Button
                        key={`page-${pItem}`}
                        size="sm"
                        variant={pItem === page ? "default" : "ghost"}
                        className={pItem === page ? "bg-emerald-500 text-white" : "bg-transparent"}
                        onClick={() => gotoPage(Number(pItem))}
                        aria-current={pItem === page ? "page" : undefined}
                      >
                        {pItem}
                      </Button>
                    )
                  )}
                </nav>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages || loading}
                  onClick={() => gotoPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create / Edit Dialog */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editPlan ? "Edit Plan" : "Create New Plan"}</DialogTitle>
              <DialogDescription>
                Setup the plan details and commissions.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-5 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="pb-2">Plan Name</Label>
                  <Input
                    value={form.name}
                    required
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <Label className="pb-2">Amount</Label>
                  <Input
                    type="number"
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: onlyPositive(e.target.value) })
                    }
                  />
                </div>

                <div>
                  <Label className="pb-2">Daily Commission (%)</Label>
                  <Input
                    type="number"
                    value={form.dailyCommission}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dailyCommission: onlyPositive(e.target.value),
                      })
                    }
                  />
                </div>

                <div>
                  <Label className="pb-2">Monthly Commission (%)</Label>
                  <Input
                    type="number"
                    value={form.monthlyCommission}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        monthlyCommission: onlyPositive(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              {/* Levels */}
              <div>
                <div className="flex items-center justify-between">
                  <Label className="pb-2">Level Income</Label>

                  <Button type="button" variant="link" size="sm" onClick={addLevel}>
                    <Plus size={12} /> Add Level
                  </Button>
                </div>

                <div className="space-y-2 mt-2">
                  {form.levels.map((lvl, i) => (
                    <div key={i} className="flex items-center gap-2 bg-muted p-2 rounded">
                      <div className="w-20 text-sm font-medium">Level {i + 1}</div>

                      <Input
                        type="number"
                        value={lvl.commissionPercent}
                        onChange={(e) =>
                          updateLevelField(i, "commissionPercent", onlyPositive(e.target.value))
                        }
                        className="flex-1"
                        placeholder="Commission %"
                      />

                      {form.levels.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeLevel(i)}>
                          <Trash2 size={14} />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Status select */}
              <div>
                <Label className="pb-2">Status</Label>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as "active" | "inactive")}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">active</SelectItem>
                    <SelectItem value="inactive">inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="pb-2">Description</Label>
                <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex items-center gap-2">
                  <Save size={16} />
                  {editPlan ? "Update Plan" : "Create Plan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Layout>
    </TooltipProvider>
  );
}

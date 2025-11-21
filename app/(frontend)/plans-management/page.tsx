"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Edit, Power, Loader2, Save, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Layout from "../layout/Layout";
import { onlyPositive } from "../utils/onlyPositive";

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<any | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: 1,
    amount: 0,
    dailyCommission: 0,
    monthlyCommission: 0,
    description: "",
    levels: [{ level: 1, commissionPercent: 0 }],
  });

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/plans");
      if (res.data.success) setPlans(res.data.plans);
    } catch {
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const payload = editPlan ? { id: editPlan._id, updateData: form } : form;
      const res = await axios[editPlan ? "patch" : "post"](
        "/api/admin/plans",
        payload
      );
      if (res.data.success) {
        toast.success(editPlan ? "Plan updated" : "Plan created");
        setModalOpen(false);
        fetchPlans();
      } else toast.error(res.data.message);
    } catch {
      toast.error("Failed to save plan");
    }
  };

  const handleToggleStatus = async (plan: any) => {
    const action = plan.isActive ? "deactivate" : "activate";
    const confirm = await Swal.fire({
      title: `Confirm ${action}?`,
      text: `This will ${action} the plan.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}`,
      confirmButtonColor: plan.isActive ? "#ef4444" : "#22c55e",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await axios.patch("/api/admin/plans", {
        id: plan._id,
        updateData: { isActive: !plan.isActive },
      });
      if (res.data.success) {
        toast.success(`Plan ${action}d`);
        fetchPlans();
      }
    } catch {
      toast.error("Action failed");
    }
  };

  // 🧩 Add new level
  const addLevel = () => {
    setForm({
      ...form,
      levels: [
        ...form.levels,
        { level: form.levels.length + 1, commissionPercent: 0 },
      ],
    });
  };

  // 🧩 Remove level
  const removeLevel = (index: number) => {
    const updated = [...form.levels];
    updated.splice(index, 1);
    setForm({ ...form, levels: updated });
  };

  // 🧩 Update level field
  const updateLevelField = (index: number, field: string, value: number) => {
    const updated = [...form.levels];
    (updated[index] as any)[field] = value;
    setForm({ ...form, levels: updated });
  };

  return (
    <Layout>
      <div className="p-6 sm:p-10 bg-white rounded-2xl shadow-lg border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-blue-700 flex items-center gap-2">
            Plans Management
          </h2>
          <button
            onClick={() => {
              setEditPlan(null);
              setForm({
                name: "",
                type: 1,
                amount: 0,
                dailyCommission: 0,
                monthlyCommission: 0,
                description: "",
                levels: [{ level: 1, commissionPercent: 0 }],
              });
              setModalOpen(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Plus size={18} /> New Plan
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-blue-600 w-8 h-8" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm">
              <thead className="bg-blue-50 text-blue-700">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Daily</th>
                  <th className="p-3 text-left">Monthly</th>
                  <th className="p-3 text-left">Levels</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p._id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3">₹{p.amount}</td>
                    <td className="p-3">{p.dailyCommission}%</td>
                    <td className="p-3">{p.monthlyCommission}%</td>
                    <td className="p-3">
                      {p.levels?.length ? `${p.levels.length} Levels` : "—"}
                    </td>
                    <td className="p-3">
                      {p.isActive ? (
                        <span className="text-green-700 bg-green-100 px-2 py-1 rounded-full text-xs">
                          Active
                        </span>
                      ) : (
                        <span className="text-red-700 bg-red-100 px-2 py-1 rounded-full text-xs">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="p-3 flex justify-center gap-2">
                      <button
                        onClick={() => {
                          setEditPlan(p);
                          setForm(p);
                          setModalOpen(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(p)}
                        className={`${
                          p.isActive
                            ? "text-red-600 hover:text-red-800"
                            : "text-green-600 hover:text-green-800"
                        }`}
                      >
                        <Power size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative 
                    max-h-[90vh] overflow-y-auto p-6"
          >
            {/* Close Button */}
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-3 right-4 text-gray-500 hover:text-red-600"
            >
              ✕
            </button>

            {/* Title */}
            <h3 className="text-lg font-bold text-blue-700 mb-4">
              {editPlan ? "Edit Plan" : "Create New Plan"}
            </h3>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* BASIC INPUTS */}
              {[
                ["name", "Plan Name", "text"],
                ["amount", "Amount", "number"],
                ["dailyCommission", "Daily Commission (%)", "number"],
                ["monthlyCommission", "Monthly Commission (%)", "number"],
              ].map(([name, label, type]) => (
                <div key={name}>
                  <label className="text-sm font-semibold text-gray-700">
                    {label}
                  </label>
                  <input
                    type={type}
                    name={name}
                    value={(form as any)[name]}
                    onChange={(e) => {
                      const value =
                        type === "number"
                          ? onlyPositive(e.target.value)
                          : e.target.value;

                      setForm({ ...form, [name]: value });
                    }}
                    min={type === "number" ? 0 : undefined}
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              ))}

              {/* LEVEL INCOME SECTION */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-gray-700">
                    Level Income
                  </label>
                  <button
                    type="button"
                    onClick={addLevel}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 text-sm"
                  >
                    <Plus size={14} /> Add Level
                  </button>
                </div>

                {/* LEVELS LIST */}
                {form.levels.map((lvl, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 mb-2 border p-2 rounded-md bg-gray-50"
                  >
                    {/* Level number is FIXED */}
                    <span className="w-16 text-sm font-medium text-gray-800">
                      Level {i + 1}
                    </span>

                    {/* Commission Input */}
                    <input
                      type="number"
                      value={lvl.commissionPercent}
                      min={0}
                      onChange={(e) =>
                        updateLevelField(
                          i,
                          "commissionPercent",
                          onlyPositive(e.target.value)
                        )
                      }
                      className="flex-1 border p-1 rounded text-sm"
                      placeholder="Commission %"
                    />

                    {/* Remove button only if more than 1 level */}
                    {form.levels.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLevel(i)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-600"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg flex items-center justify-center gap-2"
              >
                <Save size={18} />
                {editPlan ? "Update Plan" : "Create Plan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
}

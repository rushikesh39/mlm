"use client";

import { useState } from "react";
import axios from "axios";
import { Upload, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function UserFundRequestForm() {
  const [form, setForm] = useState({
    amount: "",
    txnNo: "",
    date: "",
    note: "",
    attachment: null as File | null,
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!form.amount) return toast.error("Enter amount");
    if (!form.txnNo) return toast.error("Enter transaction number");

    const fd = new FormData();
    fd.append("amount", form.amount);
    fd.append("txnNo", form.txnNo);
    fd.append("date", form.date);
    fd.append("note", form.note);
    if (form.attachment) fd.append("attachment", form.attachment);

    try {
      setLoading(true);
      const res = await axios.post("/api/users/fund-request", fd);

      if (res.data.success) {
        toast.success("Fund Request Sent!");
        setForm({ amount: "", txnNo: "", date: "", note: "", attachment: null });
      } else toast.error(res.data.message);
    } catch {
      toast.error("Failed to submit request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-lg border mt-10">
      <h2 className="text-xl font-bold text-blue-700 mb-4">
        Request Fund (Topup Wallet)
      </h2>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Amount</label>
          <input
            type="number"
            className="w-full border rounded-lg p-3 mt-1"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Txn No</label>
          <input
            type="text"
            className="w-full border rounded-lg p-3 mt-1"
            value={form.txnNo}
            onChange={(e) => setForm({ ...form, txnNo: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Date</label>
          <input
            type="date"
            className="w-full border rounded-lg p-3 mt-1"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Note</label>
          <textarea
            className="w-full border rounded-lg p-3 mt-1"
            rows={3}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          ></textarea>
        </div>

        <div>
          <label className="text-sm font-medium">Attachment</label>
          <label className="flex items-center gap-3 border rounded-lg p-3 cursor-pointer mt-1">
            <Upload size={20} className="text-blue-600" />
            <span>{form.attachment ? form.attachment.name : "Upload File"}</span>
            <input
              type="file"
              hidden
              onChange={(e) =>
                setForm({ ...form, attachment: e.target.files?.[0] || null })
              }
            />
          </label>
        </div>

        <button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2"
          onClick={handleSubmit}
        >
          {loading ? <Loader2 className="animate-spin" /> : "Submit Request"}
        </button>
      </div>
    </div>
  );
}

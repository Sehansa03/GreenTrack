
import { useState, useEffect } from "react";
import { incomeAPI } from "../../../api/income";
import { currencies } from "../../../data/currencies";

export default function IncomeForm({ onClose, editData }) {
  const [form, setForm] = useState({
    amount: "",
    source: "Salary",
    date: "",
    description: "",
    currency: "LKR",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isEdit = Boolean(editData);

  // ✅ AUTO-FILL FORM WHEN EDITING
  useEffect(() => {
    if (editData) {
      setForm({
        amount: editData.amount ?? "",
        source: editData.source ?? "Salary",
        currency: editData.currency ?? "LKR",
        description: editData.description ?? "",
        date: editData.date
          ? editData.date.split("T")[0]
          : "",
      });
    }
  }, [editData]);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // ✅ ADD / UPDATE
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.amount || Number(form.amount) <= 0) {
      setError("Enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isEdit) {
        // ✏️ UPDATE
        await incomeAPI.update(editData._id, {
          ...form,
          amount: Number(form.amount),
        });

        setSuccess("Income updated successfully ✅");
      } else {
        // ➕ CREATE
        await incomeAPI.create({
          type: "income",
          amount: Number(form.amount),
          source: form.source,
          date: form.date,
          description: form.description,
          category: form.source,
          currency: form.currency,
        });

        setSuccess("Income added successfully ✅");
      }

      setTimeout(() => {
        onClose();
        window.location.reload(); // simple refresh for now
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to save income");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={card}>
        {/* HEADER */}
        <div style={header}>
          <div>
            <h3 style={title}>
              💰 {isEdit ? "Edit Income" : "Add Income"}
            </h3>
            <p style={subTitle}>Track your financial growth</p>
          </div>

          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>

        {/* ERROR */}
        {error && <div style={errorBox}>⚠ {error}</div>}

        {/* SUCCESS */}
        {success && <div style={successBox}>{success}</div>}

        {/* FORM */}
        <form onSubmit={handleSubmit} style={formStyle}>
          <div>
            <label style={label}>Amount</label>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div>
            <label style={label}>Currency</label>
            <select
              name="currency"
              value={form.currency}
              onChange={handleChange}
              style={select}
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={label}>Source</label>
            <select
              name="source"
              value={form.source}
              onChange={handleChange}
              style={select}
            >
              <option>Salary</option>
              <option>Freelance</option>
              <option>Business</option>
              <option>Investment</option>
              <option>Other</option>
            </select>
          </div>

          <div>
            <label style={label}>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              style={input}
            />
          </div>

          <div>
            <label style={label}>Notes</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              style={{ ...input, height: 80 }}
            />
          </div>

          <button type="submit" style={btn} disabled={loading}>
            {loading
              ? "Saving..."
              : isEdit
              ? "Update Income →"
              : "Add Income →"}
          </button>
        </form>
      </div>
    </div>
  );

  

}
/* ================= UI STYLE ================= */

const overlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.75)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backdropFilter: "blur(8px)",
  zIndex: 1000,
};

const card = {
  width: "100%",
  maxWidth: 420,
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 20,
  padding: 28,
  color: "#fff",
  boxShadow: "0 40px 120px rgba(0,0,0,0.6)",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 18,
};

const title = {
  fontSize: 20,
  fontWeight: 700,
  margin: 0,
};

const subTitle = {
  fontSize: 13,
  color: "rgba(255,255,255,0.4)",
};

const closeBtn = {
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#aaa",
  width: 34,
  height: 34,
  borderRadius: 10,
  cursor: "pointer",
};

const label = {
  fontSize: 12,
  color: "rgba(255,255,255,0.5)",
  display: "block",
  marginBottom: 6,
};

const input = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 10,
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#fff",
  outline: "none",
};

const select = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: 10,
  background: "#151d18",
  border: "1px solid rgba(74,222,128,0.18)",
  color: "#f9fafb",
  outline: "none",
  cursor: "pointer",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const btn = {
  marginTop: 10,
  padding: "12px",
  borderRadius: 12,
  border: "none",
  background: "linear-gradient(135deg,#16a34a,#22c55e)",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const errorBox = {
  background: "rgba(239,68,68,0.1)",
  border: "1px solid rgba(239,68,68,0.3)",
  color: "#f87171",
  padding: "10px",
  borderRadius: 10,
  fontSize: 13,
  marginBottom: 12,
};

const successBox = {
  background: "rgba(34,197,94,0.1)",
  border: "1px solid rgba(34,197,94,0.3)",
  color: "#4ade80",
  padding: "10px",
  borderRadius: 10,
  fontSize: 13,
  marginBottom: 12,
};
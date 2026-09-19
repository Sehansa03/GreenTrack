import { useEffect, useState } from "react";
import { authAPI } from "../api";
import countries from "../data/countries";
import { currencies } from "../data/currencies";
import countryCurrencyMap from "../data/countryCurrencyMap";

export default function ProfileModal({ onClose }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    country: "",
    currency: "",
  });

  const [loading, setLoading] = useState(false);

  // 🔹 Load profile when popup opens
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await authAPI.getProfile();
      setForm(res.data);
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "country") {
      setForm({
        ...form,
        country: value,
        currency: countryCurrencyMap[value] || "",
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // 🔹 Save profile
  const handleSave = async () => {
    try {
      setLoading(true);
      await authAPI.updateProfile({
        fullName: form.fullName,
        country: form.country,
        currency: form.currency,
      });
      alert("Profile updated successfully");
      onClose();
    } catch (err) {
      console.error("Update failed", err);
      alert("Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlay}>
      <div style={modal}>
        <h2>My Profile</h2>

        {/* Name */}
        <input
          name="fullName"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Full Name"
        />

        {/* Email (readonly) */}
        <input value={form.email} disabled />

        {/* Country */}
        <select
          name="country"
          value={form.country}
          onChange={handleChange}
        >
          {countries.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* Currency */}
        <select
          name="currency"
          value={form.currency}
          onChange={handleChange}
        >
          {currencies.map((c) => (
            <option key={c.code} value={c.code}>
              {c.code} – {c.name}
            </option>
          ))}
        </select>

        <div style={{ marginTop: 20 }}>
          <button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>
          <button onClick={onClose} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

/* styles */
const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modal = {
  background: "#fff",
  padding: 20,
  borderRadius: 8,
  width: 400,
};
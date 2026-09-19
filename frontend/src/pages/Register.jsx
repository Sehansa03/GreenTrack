import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import countries from "../data/countries";
import { currencies } from "../data/currencies";
import countryCurrencyMap from "../data/countryCurrencyMap";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    country: "Sri Lanka",
    currency: "LKR",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const handleChange = (e) => {
  const { name, value } = e.target;

  if (name === "country") {
    const currencyCode = countryCurrencyMap[value];

    setForm((prev) => ({
      ...prev,
      country: value,
      currency: currencyCode ?? "", // force empty if missing
    }));
  } else {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  setErrors((prev) => ({ ...prev, [name]: "" }));
  setServerError("");
};

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = "Full name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email address";
    if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    return e;
  };


  

  const handleSubmit = async (e) => {
  e.preventDefault();

  const errs = validate();
  if (Object.keys(errs).length) {
    setErrors(errs);
    return;
  }

  setLoading(true);
  setServerError("");

  try {
    const currencyCode = countryCurrencyMap[form.country]; // ✅ ALWAYS FRESH

    const payload = {
      fullName: form.fullName,
      email: form.email,
      password: form.password,
      country: form.country,
      currency: currencyCode || "LKR",
    };

    console.log("FINAL PAYLOAD:", payload);

    

    const res = await axios.post(
      "http://localhost:5000/api/auth/register",
      payload
    );

    console.log("REGISTERED:", res.data);
    navigate("/login");
  } catch (error) {
    console.log("ERROR:", error.response);
    setServerError(error.response?.data?.message || "Registration failed.");
  } finally {
    setLoading(false);
  }
};

  const strengthLevel = Math.min(4, Math.floor(form.password.length / 3));
  const strengthColors = ["#f87171", "#fb923c", "#facc15", "#4ade80"];
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0f0d",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px 16px",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      position: "relative",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::placeholder { color: rgba(255,255,255,0.2); font-family: 'DM Sans', sans-serif; }
        input:-webkit-autofill,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 100px #111a14 inset !important;
          -webkit-text-fill-color: #fff !important;
          caret-color: #fff;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .reg-card { animation: fadeUp 0.5s ease both; }
        .reg-input:focus { border-color: rgba(74,222,128,0.5) !important; outline: none; }
        .reg-input.error { border-color: rgba(248,113,113,0.6) !important; }
        .reg-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        .reg-btn:active:not(:disabled) { transform: translateY(0); }
        .oauth-btn:hover { background: rgba(255,255,255,0.07) !important; }
      `}</style>

      {/* Background glows */}
      <div style={{
        position: "fixed", top: "25%", left: "50%", transform: "translateX(-50%)",
        width: 700, height: 500, borderRadius: "50%",
        background: "rgba(34,197,94,0.07)", filter: "blur(120px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", bottom: "10%", right: "15%",
        width: 300, height: 300, borderRadius: "50%",
        background: "rgba(16,163,74,0.05)", filter: "blur(80px)", pointerEvents: "none",
      }} />

      <div className="reg-card" style={{ width: "100%", maxWidth: 440, position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, fontSize: 20,
              background: "linear-gradient(135deg,#16a34a,#22c55e)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>🌿</div>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#fff", letterSpacing: "-0.3px" }}>
              Green<span style={{ color: "#4ade80" }}>Track</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 22,
          padding: "36px 36px 32px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 40px 120px rgba(0,0,0,0.5)",
        }}>
          <h1 style={{ fontSize: 23, fontWeight: 700, color: "#fff", marginBottom: 6, letterSpacing: "-0.3px" }}>
            Create your account
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.38)", marginBottom: 28 }}>
            Free forever — no credit card needed.
          </p>

          {/* Server error banner */}
          {serverError && (
            <div style={{
              background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: 10, padding: "11px 14px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 15 }}>⚠</span>
              <p style={{ fontSize: 13, color: "#f87171" }}>{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 7 }}>
                Full name
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Sehansa Wijewardena"
                className={`reg-input${errors.fullName ? " error" : ""}`}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${errors.fullName ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.09)"}`,
                  color: "#fff", fontSize: 14.5, transition: "border-color 0.2s",
                }}
              />
              {errors.fullName && (
                <p style={{ marginTop: 5, fontSize: 12, color: "#f87171" }}>⚠ {errors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 7 }}>
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`reg-input${errors.email ? " error" : ""}`}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${errors.email ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.09)"}`,
                  color: "#fff", fontSize: 14.5, transition: "border-color 0.2s",
                }}
              />
              {errors.email && (
                <p style={{ marginTop: 5, fontSize: 12, color: "#f87171" }}>⚠ {errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)", marginBottom: 7 }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="At least 8 characters"
                className={`reg-input${errors.password ? " error" : ""}`}
                style={{
                  width: "100%", padding: "11px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.05)",
                  border: `1px solid ${errors.password ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.09)"}`,
                  color: "#fff", fontSize: 14.5, transition: "border-color 0.2s",
                }}
              />
              {errors.password && (
                <p style={{ marginTop: 5, fontSize: 12, color: "#f87171" }}>⚠ {errors.password}</p>
              )}

              {/* Password strength */}
              {form.password.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                    {[0, 1, 2, 3].map((i) => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 2,
                        background: i < strengthLevel
                          ? strengthColors[strengthLevel - 1]
                          : "rgba(255,255,255,0.09)",
                        transition: "background 0.3s",
                      }} />
                    ))}
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
                    {strengthLabels[strengthLevel]} password
                  </p>
                </div>
              )}
            </div>

            {/* Country */}
<div style={{ marginBottom: 18 }}>
  <label
    style={{
      display: "block",
      fontSize: 13,
      fontWeight: 500,
      color: "rgba(255,255,255,0.55)",
      marginBottom: 7,
    }}
  >
    Country
  </label>

  <select
    name="country"
    value={form.country}
    onChange={handleChange}
    className="reg-input"
    style={{
      width: "100%",
      padding: "11px 14px",
      borderRadius: 10,
      background: "rgba(255,255,255,0.05)",
      border: "1px solid rgba(255,255,255,0.09)",
      color: "#fff",
      fontSize: 14.5,
    }}
  >
    {countries.map((c) => (
      <option key={c} value={c} style={{ color: "#000" }}>
        {c}
      </option>
    ))}
  </select>
</div>



            {/* Terms */}
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.28)", marginBottom: 22, lineHeight: 1.65 }}>
              By signing up you agree to our{" "}
              <Link to="/terms" style={{ color: "#4ade80", textDecoration: "none" }}>Terms of Service</Link>
              {" "}and{" "}
              <Link to="/privacy" style={{ color: "#4ade80", textDecoration: "none" }}>Privacy Policy</Link>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="reg-btn"
              style={{
                width: "100%", padding: "13px", borderRadius: 12, border: "none",
                background: loading
                  ? "rgba(74,222,128,0.25)"
                  : "linear-gradient(135deg,#16a34a,#22c55e)",
                color: "#fff", fontSize: 15, fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                transition: "filter 0.2s, transform 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 15, height: 15,
                    border: "2px solid rgba(255,255,255,0.25)",
                    borderTopColor: "#fff", borderRadius: "50%",
                    display: "inline-block", animation: "spin 0.7s linear infinite",
                  }} />
                  Creating account…
                </>
              ) : "Create account →"}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "22px 0" }}>
            <div style={{ flex: 1, height: "0.5px", background: "rgba(255,255,255,0.08)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.22)" }}>or continue with</span>
            <div style={{ flex: 1, height: "0.5px", background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* OAuth */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[{ label: "Google", badge: "G" }, { label: "GitHub", badge: "GH" }].map(({ label, badge }) => (
              <button
                key={label}
                className="oauth-btn"
                style={{
                  padding: "10px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 500,
                  cursor: "pointer", transition: "background 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 12, color: "#4ade80" }}>{badge}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Footer link */}
        <p style={{ textAlign: "center", marginTop: 22, fontSize: 14, color: "rgba(255,255,255,0.32)" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#4ade80", textDecoration: "none", fontWeight: 500 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

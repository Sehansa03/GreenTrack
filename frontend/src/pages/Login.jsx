import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";


export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors]       = useState({});
  const [loading, setLoading]     = useState(false);
  const [serverError, setServerError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
    setServerError("");
  };

  const validate = () => {
    const e = {};
    if (!form.email.includes("@")) e.email = "Enter a valid email address";
    if (!form.password)            e.password = "Password is required";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError("");

    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", {
  email: form.email,
  password: form.password,
});

console.log("LOGIN RESPONSE:", res.data);

// ✅ CHECK FIRST
if (!res.data.token || !res.data.user) {
  throw new Error("Invalid server response");
}

localStorage.setItem("token", res.data.token);
localStorage.setItem("user", JSON.stringify(res.data.user));


      navigate("/dashboard");
    } catch (error) {
      console.log(error);
      setServerError(error.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

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
        .login-card { animation: fadeUp 0.5s ease both; }
        .login-input:focus { border-color: rgba(74,222,128,0.5) !important; outline: none; }
        .login-input.error { border-color: rgba(248,113,113,0.6) !important; }
        .login-btn:hover:not(:disabled) { filter: brightness(1.1); transform: translateY(-1px); }
        .login-btn:active:not(:disabled) { transform: translateY(0); }
        .oauth-btn:hover { background: rgba(255,255,255,0.07) !important; }
        .forgot-link:hover { color: #4ade80 !important; }
        .pw-toggle:hover { color: rgba(255,255,255,0.7) !important; }
      `}</style>

      {/* Background glows */}
      <div style={{
        position: "fixed", top: "20%", left: "50%", transform: "translateX(-50%)",
        width: 700, height: 500, borderRadius: "50%",
        background: "rgba(34,197,94,0.07)", filter: "blur(120px)", pointerEvents: "none",
      }} />
      <div style={{
        position: "fixed", top: "60%", left: "20%",
        width: 280, height: 280, borderRadius: "50%",
        background: "rgba(16,163,74,0.05)", filter: "blur(80px)", pointerEvents: "none",
      }} />

      <div className="login-card" style={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>

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
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.38)", marginBottom: 28 }}>
            Sign in to your GreenTrack account.
          </p>

          {/* Server error banner */}
          {serverError && (
            <div style={{
              background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.25)",
              borderRadius: 10, padding: "11px 14px", marginBottom: 20,
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <span style={{ fontSize: 15, flexShrink: 0 }}>⚠</span>
              <p style={{ fontSize: 13, color: "#f87171" }}>{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: "block", fontSize: 13, fontWeight: 500,
                color: "rgba(255,255,255,0.55)", marginBottom: 7,
              }}>
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className={`login-input${errors.email ? " error" : ""}`}
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
            <div style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label style={{ fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.55)" }}>
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="forgot-link"
                  style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "none", transition: "color 0.2s" }}
                >
                  Forgot password?
                </Link>
              </div>

              {/* Password field with show/hide toggle */}
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={`login-input${errors.password ? " error" : ""}`}
                  style={{
                    width: "100%", padding: "11px 44px 11px 14px", borderRadius: 10,
                    background: "rgba(255,255,255,0.05)",
                    border: `1px solid ${errors.password ? "rgba(248,113,113,0.6)" : "rgba(255,255,255,0.09)"}`,
                    color: "#fff", fontSize: 14.5, transition: "border-color 0.2s",
                  }}
                />
                <button
                  type="button"
                  className="pw-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 16, color: "rgba(255,255,255,0.3)", transition: "color 0.2s",
                    lineHeight: 1,
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
              {errors.password && (
                <p style={{ marginTop: 5, fontSize: 12, color: "#f87171" }}>⚠ {errors.password}</p>
              )}
            </div>

            {/* Remember me */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "18px 0 22px" }}>
              <input
                type="checkbox"
                id="remember"
                style={{
                  width: 15, height: 15, accentColor: "#4ade80", cursor: "pointer",
                }}
              />
              <label htmlFor="remember" style={{ fontSize: 13, color: "rgba(255,255,255,0.38)", cursor: "pointer" }}>
                Keep me signed in
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="login-btn"
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
                  Signing in…
                </>
              ) : "Sign in →"}
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
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#4ade80", textDecoration: "none", fontWeight: 500 }}>
            Sign up free
          </Link>
        </p>
      </div>
    </div>
  );
}

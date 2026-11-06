
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../api/auth";
import GreenTrackLogo from "../components/GreenTrackLogo";
import "./Auth.css";

export default function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Enter a valid email address.";
    }

    if (!form.password) {
      nextErrors.password = "Password is required.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const res = await authAPI.login({
        email: form.email.trim(),
        password: form.password,
      });

      if (!res.data?.token || !res.data?.user) {
        throw new Error("Invalid server response");
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Unable to sign in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      navigate("/");
    }
  };

  return (
    <main
      className="gt-auth"
      onClick={handleBackgroundClick}
    >
      <div className="gt-auth-wrap">

        

        <div className="gt-auth-brand">
          <GreenTrackLogo />
        </div>

        <div className="gt-auth-card">
          <h1>Welcome back</h1>

          <p className="gt-auth-subtitle">
            Sign in to continue managing your finances.
          </p>

          {serverError && (
            <div className="gt-auth-alert" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            <div className="gt-auth-field">
              <label htmlFor="login-email">
                Email address
              </label>

              <input
                id="login-email"
                className="gt-auth-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={Boolean(errors.email)}
              />

              {errors.email && (
                <p className="gt-auth-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="gt-auth-field">
              <label htmlFor="login-password">
                Password
              </label>

              <div className="gt-auth-password">
                <input
                  id="login-password"
                  className="gt-auth-input"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                />

                <button
                  type="button"
                  className="gt-auth-toggle"
                  onClick={() =>
                    setShowPassword((prev) => !prev)
                  }
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              {errors.password && (
                <p className="gt-auth-error">
                  {errors.password}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="gt-auth-button"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign in →"}
            </button>

          </form>
        </div>

        <p className="gt-auth-footer">
          Don't have an account?{" "}
          <Link to="/register">
            Create an account
          </Link>
        </p>

      </div>
    </main>
  );
}

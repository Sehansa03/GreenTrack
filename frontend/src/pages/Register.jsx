
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../api/auth";
import GreenTrackLogo from "../components/GreenTrackLogo";
import countries from "../data/countries";
import { currencies } from "../data/currencies";
import countryCurrencyMap from "../data/countryCurrencyMap";
import "./Auth.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    country: "Sri Lanka",
    currency: "LKR",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => {
      if (name === "country") {
        return {
          ...prev,
          country: value,
          currency: countryCurrencyMap[value] || "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setServerError("");
  };

  const validate = () => {
    const next = {};

    if (!form.fullName.trim()) {
      next.fullName = "Full name is required.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Enter a valid email address.";
    }

    if (form.password.length < 8) {
      next.password =
        "Password must contain at least 8 characters.";
    }

    if (!form.country) {
      next.country = "Select your country.";
    }

    if (!form.currency) {
      next.currency = "Select a currency.";
    }

    return next;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = validate();

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      await authAPI.register({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
        country: form.country,
        currency: form.currency,
      });

      navigate("/login", { replace: true });
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Registration failed. Please try again."
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
          <h1>Create your account</h1>

          <p className="gt-auth-subtitle">
            Start organizing your financial journey
            with GreenTrack.
          </p>

          {serverError && (
            <div className="gt-auth-alert" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>

            <div className="gt-auth-field">
              <label htmlFor="reg-name">
                Full name
              </label>

              <input
                id="reg-name"
                className="gt-auth-input"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                autoComplete="name"
              />

              {errors.fullName && (
                <p className="gt-auth-error">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="gt-auth-field">
              <label htmlFor="reg-email">
                Email address
              </label>

              <input
                id="reg-email"
                className="gt-auth-input"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
              />

              {errors.email && (
                <p className="gt-auth-error">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="gt-auth-field">
              <label htmlFor="reg-password">
                Password
              </label>

              <div className="gt-auth-password">
                <input
                  id="reg-password"
                  className="gt-auth-input"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
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

              <p className="gt-auth-hint">
                Use a unique password with at least
                8 characters.
              </p>
            </div>

            <div className="gt-auth-field">
              <label htmlFor="reg-country">
                Country
              </label>

              <select
                id="reg-country"
                className="gt-auth-input"
                name="country"
                value={form.country}
                onChange={handleChange}
              >
                {countries.map((country) => (
                  <option
                    key={country}
                    value={country}
                  >
                    {country}
                  </option>
                ))}
              </select>

              {errors.country && (
                <p className="gt-auth-error">
                  {errors.country}
                </p>
              )}
            </div>

            <div className="gt-auth-field">
              <label htmlFor="reg-currency">
                Base currency
              </label>

              <select
                id="reg-currency"
                className="gt-auth-input"
                name="currency"
                value={form.currency}
                onChange={handleChange}
              >
                <option value="">
                  Select currency
                </option>

                {currencies.map((currency) => {
                  const code =
                    typeof currency === "string"
                      ? currency
                      : currency.code;

                  return (
                    <option
                      key={code}
                      value={code}
                    >
                      {code}
                    </option>
                  );
                })}
              </select>

              {errors.currency && (
                <p className="gt-auth-error">
                  {errors.currency}
                </p>
              )}

              <p className="gt-auth-hint">
                Automatically selected based on your
                country. You can change it if needed.
              </p>
            </div>

            <button
              type="submit"
              className="gt-auth-button"
              disabled={loading}
            >
              {loading
                ? "Creating account..."
                : "Create account →"}
            </button>

          </form>
        </div>

        <p className="gt-auth-footer">
          Already have an account?{" "}
          <Link to="/login">
            Sign in
          </Link>
        </p>

      </div>
    </main>
  );
}

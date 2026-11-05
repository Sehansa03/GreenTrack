
import { useEffect, useState } from "react";
import { authAPI } from "../api/auth";
import countries from "../data/countries";
import { currencies } from "../data/currencies";
import countryCurrencyMap from "../data/countryCurrencyMap";
import { useCurrency } from "../context/CurrencyContext";
import "./ProfileModal.css";

export default function ProfileModal({ onClose }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    country: "",
    currency: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const { updatePreferredCurrency } = useCurrency();

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await authAPI.getProfile();

        const profile =
          res.data?.data?.user ||
          res.data?.data ||
          res.data?.user ||
          res.data;

        if (!active) return;

        setForm({
          fullName: profile?.fullName || "",
          email: profile?.email || "",
          country: profile?.country || "",
          currency: profile?.currency || "LKR",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);

        if (active) {
          setError("Unable to load your profile. Please try again.");
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose, saving]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setError("");
    setSuccess("");

    if (name === "country") {
      setForm((prev) => ({
        ...prev,
        country: value,
        currency: countryCurrencyMap[value] || prev.currency,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!form.fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!form.currency) {
      setError("Please select your preferred currency.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      await authAPI.updateProfile({
        fullName: form.fullName.trim(),
        country: form.country,
        currency: form.currency,
      });

      // Update global currency context
      await updatePreferredCurrency(form.currency);

      setSuccess("Profile updated successfully!");

      onClose();
    } catch (err) {
      console.error("Profile update failed:", err);

      setError(
        "Unable to complete the update. Please check your connection and refresh your profile before retrying."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="gt-profile-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) {
          onClose();
        }
      }}
    >
      <section
        className="gt-profile-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="gt-profile-title"
      >
        {/* Header */}
        <div className="gt-profile-modal-header">
          <div className="gt-profile-modal-heading">
            <div className="gt-profile-modal-icon">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
              </svg>
            </div>

            <div>
              <h2 id="gt-profile-title">My Profile</h2>
              <p>Manage your personal information</p>
            </div>
          </div>

          <button
            type="button"
            className="gt-profile-modal-close"
            onClick={onClose}
            disabled={saving}
            aria-label="Close profile"
          >
            ×
          </button>
        </div>

        {loading ? (
          <div className="gt-profile-loading" role="status">
            Loading your profile...
          </div>
        ) : (
          <form onSubmit={handleSave} className="gt-profile-form">
            {error && (
              <div className="gt-profile-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="gt-profile-success" role="status">
                {success}
              </div>
            )}

            {/* Full name */}
            <div className="gt-profile-field">
              <label htmlFor="gt-profile-name">
                Full Name
              </label>

              <input
                id="gt-profile-name"
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                required
                disabled={saving}
              />
            </div>

            {/* Email */}
            <div className="gt-profile-field">
              <label htmlFor="gt-profile-email">
                Email Address
              </label>

              <input
                id="gt-profile-email"
                type="email"
                value={form.email}
                disabled
              />

              <small>
                Your registered email address cannot be changed here.
              </small>
            </div>

            {/* Country */}
            <div className="gt-profile-field">
              <label htmlFor="gt-profile-country">
                Country
              </label>

              <select
                id="gt-profile-country"
                name="country"
                value={form.country}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="">Select your country</option>

                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Preferred currency */}
            <div className="gt-profile-field">
              <label htmlFor="gt-profile-currency">
                Preferred Currency
              </label>

              <select
                id="gt-profile-currency"
                name="currency"
                value={form.currency}
                onChange={handleChange}
                disabled={saving}
                required
              >
                <option value="">Select currency</option>

                {currencies.map((currency) => (
                  <option
                    key={currency.code}
                    value={currency.code}
                  >
                    {currency.code} – {currency.name}
                  </option>
                ))}
              </select>

              <small>
                Your financial totals and charts will use this currency.
                Original transaction currencies remain unchanged.
              </small>
            </div>

            {/* Actions */}
            <div className="gt-profile-modal-actions">
              <button
                type="button"
                className="gt-profile-cancel"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="gt-profile-save"
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

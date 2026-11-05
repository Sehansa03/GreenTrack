import { useEffect, useState } from "react";
import { authAPI } from "../api/auth";
import countries from "../data/countries";
import { currencies } from "../data/currencies";
import countryCurrencyMap from "../data/countryCurrencyMap";
import { useCurrency } from "../context/CurrencyContext";

export default function ProfileModal({ onClose }) {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    country: "",
    currency: "",
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const { updatePreferredCurrency } = useCurrency();

  // Load profile details
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const res = await authAPI.getProfile();

        setForm({
          fullName: res.data.fullName || "",
          email: res.data.email || "",
          country: res.data.country || "",
          currency: res.data.currency || "LKR",
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

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

  // Save profile
 
const handleSave = async () => {
  if (!form.fullName.trim()) {
    alert("Please enter your full name.");
    return;
  }

  try {
    setSaving(true);

    await authAPI.updateProfile({
      fullName: form.fullName.trim(),
      country: form.country,
      currency: form.currency,
    });

    // Update the global preferred currency
    await updatePreferredCurrency(form.currency);

    alert("Profile updated successfully!");
    onClose();
  } catch (error) {
    console.error("Profile update failed:", error);
    alert("Failed to update profile. Please try again.");
  } finally {
    setSaving(false);
  }
};


  return (
    <>
      <style>{`
        .profile-overlay {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background: rgba(0, 0, 0, 0.78);
          backdrop-filter: blur(6px);
          animation: profileFade 0.2s ease;
        }

        .profile-modal {
          width: 100%;
          max-width: 470px;
          background: #101a14;
          border: 1px solid rgba(74, 222, 128, 0.16);
          border-radius: 18px;
          padding: 28px;
          color: #fff;
          font-family: 'DM Sans', 'Segoe UI', sans-serif;
          box-shadow: 0 25px 70px rgba(0, 0, 0, 0.55);
          animation: profileSlide 0.25s ease;
        }

        .profile-input,
        .profile-select {
          width: 100%;
          box-sizing: border-box;
          height: 45px;
          padding: 0 13px;
          border-radius: 9px;
          border: 1px solid rgba(255,255,255,0.09);
          outline: none;
          background: #0a120e;
          color: #fff;
          font-family: inherit;
          font-size: 13px;
          transition: border 0.2s, box-shadow 0.2s;
        }

        .profile-input:focus,
        .profile-select:focus {
          border-color: #4ade80;
          box-shadow: 0 0 0 3px rgba(74,222,128,0.08);
        }

        .profile-input:disabled {
          color: rgba(255,255,255,0.4);
          cursor: not-allowed;
          background: rgba(255,255,255,0.025);
        }

        .profile-select option {
          background: #101a14;
          color: #fff;
        }

        .profile-label {
          display: block;
          margin-bottom: 8px;
          color: rgba(255,255,255,0.58);
          font-size: 12px;
          font-weight: 500;
        }

        .profile-save {
          flex: 1;
          height: 43px;
          border: none;
          border-radius: 9px;
          background: linear-gradient(135deg, #16a34a, #22c55e);
          color: white;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.2s;
        }

        .profile-save:hover:not(:disabled) {
          opacity: 0.9;
          transform: translateY(-1px);
        }

        .profile-save:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .profile-cancel {
          flex: 1;
          height: 43px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 9px;
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.7);
          font-family: inherit;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .profile-cancel:hover {
          background: rgba(255,255,255,0.08);
        }

        .profile-close {
          width: 32px;
          height: 32px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.55);
          font-size: 19px;
          cursor: pointer;
        }

        .profile-close:hover {
          color: #fff;
          background: rgba(255,255,255,0.09);
        }

        @keyframes profileFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes profileSlide {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 480px) {
          .profile-modal {
            padding: 22px 18px;
          }
        }
      `}</style>

      <div className="profile-overlay" onClick={onClose}>
        <div
          className="profile-modal"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 25,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 12,
                  background: "rgba(74,222,128,0.1)",
                  border: "1px solid rgba(74,222,128,0.18)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                👤
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 19,
                    fontWeight: 700,
                    letterSpacing: "-0.4px",
                  }}
                >
                  My Profile
                </h2>

                <p
                  style={{
                    margin: "4px 0 0",
                    color: "rgba(255,255,255,0.38)",
                    fontSize: 11,
                  }}
                >
                  Manage your personal information
                </p>
              </div>
            </div>

            <button
              className="profile-close"
              onClick={onClose}
              title="Close"
            >
              ×
            </button>
          </div>

          <div
            style={{
              height: 1,
              background: "rgba(255,255,255,0.07)",
              marginBottom: 23,
            }}
          />

          {loading ? (
            <p
              style={{
                textAlign: "center",
                padding: "35px 0",
                color: "rgba(255,255,255,0.45)",
                fontSize: 13,
              }}
            >
              Loading profile...
            </p>
          ) : (
            <>
              {/* Full Name */}
              <div style={{ marginBottom: 18 }}>
                <label className="profile-label">Full Name</label>

                <input
                  className="profile-input"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label className="profile-label">Email Address</label>

                <input
                  className="profile-input"
                  value={form.email}
                  disabled
                />

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "rgba(255,255,255,0.28)",
                    fontSize: 10,
                  }}
                >
                  Your registered email address cannot be changed here.
                </p>
              </div>

              {/* Country */}
              <div style={{ marginBottom: 18 }}>
                <label className="profile-label">Country</label>

                <select
                  className="profile-select"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                >
                  <option value="">Select your country</option>

                  {countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              {/* Currency */}
              <div style={{ marginBottom: 25 }}>
                <label className="profile-label">
                  Preferred Currency
                </label>

                <select
                  className="profile-select"
                  name="currency"
                  value={form.currency}
                  onChange={handleChange}
                >
                  {currencies.map((currency) => (
                    <option key={currency.code} value={currency.code}>
                      {currency.code} – {currency.name}
                    </option>
                  ))}
                </select>

                <p
                  style={{
                    margin: "6px 0 0",
                    color: "rgba(255,255,255,0.28)",
                    fontSize: 10,
                  }}
                >
                  Used to display your financial information.
                </p>
              </div>

              {/* Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  paddingTop: 18,
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                }}
              >
                <button
                  className="profile-cancel"
                  onClick={onClose}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  className="profile-save"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
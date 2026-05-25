// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/api";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "", email: "", first_name: "", last_name: "", password: "", password2: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.password2) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 520 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/">
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "2.5rem", color: "var(--jumia-orange)", letterSpacing: "-2px" }}>
              jumia
            </div>
          </Link>
          <p style={{ color: "var(--jumia-grey)", marginTop: 6 }}>Create your account</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {error && <div className="alert alert-error"><i className="bi-exclamation-circle" /> {error}</div>}

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="form-group">
                <label>First Name</label>
                <input value={form.first_name} onChange={set("first_name")} placeholder="John" />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input value={form.last_name} onChange={set("last_name")} placeholder="Doe" />
              </div>
            </div>

            <div className="form-group">
              <label><i className="bi-person" /> Username *</label>
              <input required value={form.username} onChange={set("username")} placeholder="johndoe" autoFocus />
            </div>

            <div className="form-group">
              <label><i className="bi-envelope" /> Email Address</label>
              <input type="email" value={form.email} onChange={set("email")} placeholder="john@example.com" />
            </div>

            <div className="form-group">
              <label><i className="bi-lock" /> Password *</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="At least 6 characters"
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--jumia-grey)", fontSize: "1.1rem" }}>
                  <i className={showPwd ? "bi-eye-slash" : "bi-eye"} />
                </button>
              </div>
            </div>

            <div className="form-group">
              <label><i className="bi-lock-fill" /> Confirm Password *</label>
              <input
                type={showPwd ? "text" : "password"}
                required
                value={form.password2}
                onChange={set("password2")}
                placeholder="Repeat your password"
                style={{ borderColor: form.password2 && form.password !== form.password2 ? "var(--jumia-red)" : undefined }}
              />
              {form.password2 && form.password !== form.password2 && (
                <p className="form-error"><i className="bi-exclamation-circle" /> Passwords don't match</p>
              )}
            </div>

            <button type="submit" className="btn btn-orange btn-full" style={{ padding: 14, fontSize: "1rem", marginTop: 8 }} disabled={loading}>
              {loading
                ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 3, display: "inline-block", margin: "0 8px 0 0" }} />Creating account...</>
                : <><i className="bi-person-plus" /> Create Account</>}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--jumia-border)" }}>
            <p style={{ color: "#555", fontSize: "0.9rem" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "var(--jumia-orange)", fontWeight: 700 }}>Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
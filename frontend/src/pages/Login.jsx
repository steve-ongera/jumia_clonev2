// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err) || "Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link to="/">
            <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "2.5rem", color: "var(--jumia-orange)", letterSpacing: "-2px" }}>
              jumia
            </div>
          </Link>
          <p style={{ color: "var(--jumia-grey)", marginTop: 6 }}>Sign in to your account</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          {error && <div className="alert alert-error"><i className="bi-exclamation-circle" /> {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label><i className="bi-person" /> Username</label>
              <input
                type="text"
                value={form.username}
                onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label><i className="bi-lock" /> Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                  style={{ paddingRight: 44 }}
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: "var(--jumia-grey)", fontSize: "1.1rem" }}>
                  <i className={showPwd ? "bi-eye-slash" : "bi-eye"} />
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-orange btn-full" style={{ padding: 14, fontSize: "1rem", marginTop: 8 }} disabled={loading}>
              {loading
                ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 3, display: "inline-block", margin: "0 8px 0 0" }} />Signing in...</>
                : <><i className="bi-box-arrow-in-right" /> Sign In</>}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--jumia-border)" }}>
            <p style={{ color: "#555", fontSize: "0.9rem" }}>
              Don't have an account?{" "}
              <Link to="/register" style={{ color: "var(--jumia-orange)", fontWeight: 700 }}>Create Account</Link>
            </p>
          </div>
        </div>

        <div style={{ marginTop: 20, background: "var(--jumia-orange-light)", borderRadius: 8, padding: 16 }}>
          <p style={{ fontSize: "0.82rem", fontWeight: 600, color: "var(--jumia-orange-dark)", textAlign: "center" }}>
            <i className="bi-shield-lock-fill" /> Your data is protected with industry-standard encryption
          </p>
        </div>
      </div>
    </div>
  );
}
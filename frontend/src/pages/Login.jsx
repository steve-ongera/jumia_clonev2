// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/api";

export default function Login() {
  const { login }    = useAuth();
  const navigate     = useNavigate();
  const location     = useLocation();
  const from         = location.state?.from?.pathname || "/";

  const [form, setForm]       = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
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
    <div className="auth-page">
      <div className="auth-container auth-container-sm">

        {/* Logo */}
        <div className="auth-logo-wrap">
          <Link to="/" className="auth-logo">jumia</Link>
          <p className="auth-tagline">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="auth-card">

          {error && (
            <div className="alert alert-error">
              <i className="bi bi-exclamation-circle" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Username */}
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-person" /> Username
              </label>
              <input
                className="form-control"
                type="text"
                value={form.username}
                onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-lock" /> Password
              </label>
              <div className="input-password-wrapper">
                <input
                  className="form-control"
                  type={showPwd ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  className="input-password-toggle"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  <i className={`bi ${showPwd ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-orange btn-full btn-lg"
              style={{ marginTop: 8 }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm spinner-inline" />
                  Signing in…
                </>
              ) : (
                <>
                  <i className="bi bi-box-arrow-in-right" /> Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="auth-footer-link">
            <p>
              Don&rsquo;t have an account?{" "}
              <Link to="/register">Create Account</Link>
            </p>
          </div>
        </div>

        {/* Trust note */}
        <div className="auth-trust-note">
          <i className="bi bi-shield-lock-fill" /> Your data is protected with
          industry-standard encryption
        </div>

      </div>
    </div>
  );
}
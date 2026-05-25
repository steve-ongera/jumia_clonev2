// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/api";

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm] = useState({
    username: "", email: "", first_name: "", last_name: "",
    password: "", password2: "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

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

  const passwordMismatch = form.password2 && form.password !== form.password2;

  return (
    <div className="auth-page">
      <div className="auth-container auth-container-md">

        {/* Logo */}
        <div className="auth-logo-wrap">
          <Link to="/" className="auth-logo">jumia</Link>
          <p className="auth-tagline">Create your free account</p>
        </div>

        {/* Card */}
        <div className="auth-card">

          {error && (
            <div className="alert alert-error">
              <i className="bi bi-exclamation-circle" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* First / Last name */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name</label>
                <input
                  className="form-control"
                  value={form.first_name}
                  onChange={set("first_name")}
                  placeholder="John"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name</label>
                <input
                  className="form-control"
                  value={form.last_name}
                  onChange={set("last_name")}
                  placeholder="Doe"
                />
              </div>
            </div>

            {/* Username */}
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-person" /> Username <span className="text-red">*</span>
              </label>
              <input
                className="form-control"
                required
                value={form.username}
                onChange={set("username")}
                placeholder="johndoe"
                autoFocus
              />
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-envelope" /> Email Address
              </label>
              <input
                className="form-control"
                type="email"
                value={form.email}
                onChange={set("email")}
                placeholder="john@example.com"
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-lock" /> Password <span className="text-red">*</span>
              </label>
              <div className="input-password-wrapper">
                <input
                  className="form-control"
                  type={showPwd ? "text" : "password"}
                  required
                  minLength={6}
                  value={form.password}
                  onChange={set("password")}
                  placeholder="At least 6 characters"
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

            {/* Confirm password */}
            <div className="form-group">
              <label className="form-label">
                <i className="bi bi-lock-fill" /> Confirm Password <span className="text-red">*</span>
              </label>
              <input
                className={`form-control${passwordMismatch ? " form-control--error" : ""}`}
                style={passwordMismatch ? { borderColor: "var(--j-red)" } : undefined}
                type={showPwd ? "text" : "password"}
                required
                value={form.password2}
                onChange={set("password2")}
                placeholder="Repeat your password"
              />
              {passwordMismatch && (
                <p className="form-error">
                  <i className="bi bi-exclamation-circle" /> Passwords don&rsquo;t match
                </p>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-orange btn-full btn-lg"
              style={{ marginTop: 8 }}
              disabled={loading || passwordMismatch}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm spinner-inline" />
                  Creating account…
                </>
              ) : (
                <>
                  <i className="bi bi-person-plus" /> Create Account
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="auth-footer-link">
            <p>
              Already have an account?{" "}
              <Link to="/login">Sign In</Link>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
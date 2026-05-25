// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, textAlign: "center" }}>
      <div>
        <div style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "8rem", color: "var(--jumia-orange)", lineHeight: 1, marginBottom: 16 }}>
          404
        </div>
        <i className="bi-emoji-frown" style={{ fontSize: "3rem", color: "#ccc", marginBottom: 20, display: "block" }} />
        <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "1.5rem", marginBottom: 10 }}>
          Oops! Page Not Found
        </h2>
        <p style={{ color: "var(--jumia-grey)", marginBottom: 30, maxWidth: 380, margin: "0 auto 30px" }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link to="/" className="btn btn-orange">
            <i className="bi-house" /> Back to Home
          </Link>
          <Link to="/products" className="btn btn-outline">
            <i className="bi-bag" /> Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
}
// src/components/Footer.jsx
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer style={{ background: "var(--jumia-dark)", color: "#ccc", marginTop: 40 }}>
      <div className="container" style={{ padding: "40px 16px 20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 32, marginBottom: 32 }}>
          <div>
            <h4 style={{ color: "white", fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "1.4rem", marginBottom: 12 }}>jumia</h4>
            <p style={{ fontSize: "0.85rem", lineHeight: 1.7 }}>Kenya's #1 online shopping destination. Safe, fast and secure.</p>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              {["facebook", "twitter-x", "instagram", "youtube"].map(s => (
                <a key={s} href="#" style={{ color: "#ccc", fontSize: "1.2rem" }}>
                  <i className={`bi-${s}`} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h5 style={{ color: "white", fontWeight: 700, marginBottom: 12 }}>Need Help?</h5>
            <ul style={{ listStyle: "none", fontSize: "0.85rem", lineHeight: 2.2 }}>
              <li><Link to="/orders" style={{ color: "#ccc" }}>Track My Order</Link></li>
              <li><a href="#" style={{ color: "#ccc" }}>Returns & Refunds</a></li>
              <li><a href="#" style={{ color: "#ccc" }}>Help Center</a></li>
              <li><a href="#" style={{ color: "#ccc" }}>Contact Us</a></li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: "white", fontWeight: 700, marginBottom: 12 }}>About Jumia</h5>
            <ul style={{ listStyle: "none", fontSize: "0.85rem", lineHeight: 2.2 }}>
              <li><a href="#" style={{ color: "#ccc" }}>About Us</a></li>
              <li><a href="#" style={{ color: "#ccc" }}>Seller Portal</a></li>
              <li><a href="#" style={{ color: "#ccc" }}>Affiliate Program</a></li>
              <li><a href="#" style={{ color: "#ccc" }}>Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h5 style={{ color: "white", fontWeight: 700, marginBottom: 12 }}>Payment Methods</h5>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {["M-Pesa", "Visa", "Mastercard", "Cash on Delivery"].map(p => (
                <span key={p} style={{
                  background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 4, padding: "4px 10px", fontSize: "0.75rem", color: "white", fontWeight: 600,
                }}>
                  {p}
                </span>
              ))}
            </div>
            <h5 style={{ color: "white", fontWeight: 700, marginBottom: 10, marginTop: 20 }}>Download App</h5>
            <div style={{ display: "flex", gap: 8 }}>
              {["App Store", "Google Play"].map(s => (
                <a key={s} href="#" style={{
                  background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: 4, padding: "6px 12px", fontSize: "0.75rem", color: "white", fontWeight: 600,
                }}>
                  <i className={`bi-${s === "App Store" ? "apple" : "google-play"} me-1`} />{s}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 16, textAlign: "center", fontSize: "0.8rem" }}>
          © {new Date().getFullYear()} Jumia Clone. Built with Django + React + M-Pesa.
        </div>
      </div>
    </footer>
  );
}
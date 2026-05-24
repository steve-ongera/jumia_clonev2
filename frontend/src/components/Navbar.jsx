import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const CATEGORIES = [
  { label: "Phones & Tablets", icon: "bi-phone", slug: "phones-tablets" },
  { label: "Electronics", icon: "bi-laptop", slug: "electronics" },
  { label: "Fashion", icon: "bi-bag", slug: "fashion" },
  { label: "Home & Office", icon: "bi-house", slug: "home-office" },
  { label: "Appliances", icon: "bi-lightning", slug: "appliances" },
  { label: "Supermarket", icon: "bi-cart3", slug: "supermarket" },
  { label: "Health & Beauty", icon: "bi-heart-pulse", slug: "health-beauty" },
  { label: "Baby Products", icon: "bi-emoji-smile", slug: "baby-products" },
  { label: "Sporting Goods", icon: "bi-bicycle", slug: "sporting-goods" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?search=${encodeURIComponent(search.trim())}`);
  };

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 1000 }}>
      {/* Top bar */}
      <div style={{ background: "var(--jumia-orange)", padding: "10px 0" }}>
        <div className="container" style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* Logo */}
          <Link to="/" style={{ flexShrink: 0 }}>
            <div style={{
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 900,
              fontSize: "1.6rem",
              color: "white",
              letterSpacing: "-1px",
            }}>
              jumia
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearch} style={{ flex: 1, display: "flex", maxWidth: 700 }}>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, brands and categories..."
              style={{
                flex: 1,
                padding: "10px 16px",
                border: "none",
                borderRadius: "4px 0 0 4px",
                fontSize: "0.95rem",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                background: "var(--jumia-dark)",
                color: "white",
                padding: "10px 18px",
                borderRadius: "0 4px 4px 0",
                fontSize: "1.1rem",
              }}
            >
              <i className="bi-search" />
            </button>
          </form>

          {/* Nav Icons */}
          <nav style={{ display: "flex", gap: 8, alignItems: "center", marginLeft: "auto" }}>
            {/* Account */}
            <div ref={userMenuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  color: "white", padding: "4px 10px", borderRadius: 4,
                  fontSize: "0.75rem", fontWeight: 700, gap: 2,
                  background: userMenuOpen ? "rgba(0,0,0,0.15)" : "transparent",
                }}
              >
                <i className="bi-person" style={{ fontSize: "1.3rem" }} />
                {user ? user.first_name || user.username : "Account"}
              </button>
              {userMenuOpen && (
                <div style={{
                  position: "absolute", top: "110%", right: 0,
                  background: "white", borderRadius: 4,
                  boxShadow: "var(--shadow-md)", minWidth: 160, overflow: "hidden",
                }}>
                  {user ? (
                    <>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                        style={{ display: "block", padding: "10px 16px", fontWeight: 600, fontSize: "0.9rem", color: "#333" }}
                        className="nav-dd-item"
                      >
                        <i className="bi-bag-check me-2" /> My Orders
                      </Link>
                      <button
                        onClick={() => { logout(); setUserMenuOpen(false); navigate("/"); }}
                        style={{ width: "100%", textAlign: "left", padding: "10px 16px", fontWeight: 600, fontSize: "0.9rem", color: "var(--jumia-red)" }}
                      >
                        <i className="bi-box-arrow-right" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" onClick={() => setUserMenuOpen(false)}
                        style={{ display: "block", padding: "10px 16px", fontWeight: 700, fontSize: "0.9rem", color: "var(--jumia-orange)" }}>
                        <i className="bi-box-arrow-in-right" /> Login
                      </Link>
                      <Link to="/register" onClick={() => setUserMenuOpen(false)}
                        style={{ display: "block", padding: "10px 16px", fontWeight: 600, fontSize: "0.9rem", color: "#333" }}>
                        <i className="bi-person-plus" /> Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              color: "white", padding: "4px 10px", borderRadius: 4,
              fontSize: "0.75rem", fontWeight: 700, gap: 2, position: "relative",
            }}>
              <div style={{ position: "relative" }}>
                <i className="bi-cart3" style={{ fontSize: "1.3rem" }} />
                {itemCount > 0 && (
                  <span style={{
                    position: "absolute", top: -6, right: -8,
                    background: "var(--jumia-dark)", color: "white",
                    borderRadius: "50%", width: 18, height: 18,
                    fontSize: "0.65rem", fontWeight: 900,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </div>
              Cart
            </Link>
          </nav>

          {/* Hamburger (mobile) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ color: "white", fontSize: "1.5rem", display: "none" }}
            className="hamburger-btn"
          >
            <i className={menuOpen ? "bi-x-lg" : "bi-list"} />
          </button>
        </div>
      </div>

      {/* Category Bar */}
      <div style={{ background: "white", borderBottom: "1px solid var(--jumia-border)", overflow: "hidden" }}>
        <div className="container">
          <ul style={{
            display: "flex", gap: 0, listStyle: "none",
            overflowX: "auto", scrollbarWidth: "none",
          }}>
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link
                  to={`/products?category=${cat.slug}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "10px 14px", whiteSpace: "nowrap",
                    fontSize: "0.82rem", fontWeight: 600, color: "#333",
                    borderBottom: "2px solid transparent",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--jumia-orange)";
                    e.currentTarget.style.borderBottomColor = "var(--jumia-orange)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#333";
                    e.currentTarget.style.borderBottomColor = "transparent";
                  }}
                >
                  <i className={`bi ${cat.icon}`} />
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}
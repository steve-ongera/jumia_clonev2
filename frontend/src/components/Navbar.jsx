// src/components/Navbar.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";

const CATEGORIES = [
  { label: "Phones & Tablets", icon: "bi-phone",       slug: "phones-tablets" },
  { label: "Electronics",      icon: "bi-laptop",       slug: "electronics" },
  { label: "Fashion",          icon: "bi-bag",          slug: "fashion" },
  { label: "Home & Office",    icon: "bi-house",        slug: "home-office" },
  { label: "Appliances",       icon: "bi-lightning",    slug: "appliances" },
  { label: "Supermarket",      icon: "bi-cart3",        slug: "supermarket" },
  { label: "Health & Beauty",  icon: "bi-heart-pulse",  slug: "health-beauty" },
  { label: "Baby Products",    icon: "bi-emoji-smile",  slug: "baby-products" },
  { label: "Sporting Goods",   icon: "bi-bicycle",      slug: "sporting-goods" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { itemCount }    = useCart();
  const navigate         = useNavigate();

  const [search,      setSearch]      = useState("");
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close mobile drawer on route change or resize
  useEffect(() => {
    const onResize = () => { if (window.innerWidth > 768) setMenuOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setMenuOpen(false);
    }
  };

  const closeMobileMenu = () => setMenuOpen(false);

  return (
    <header className="navbar">

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <div className="navbar-top">
        <div className="container navbar-top-inner">

          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={closeMobileMenu}>
            <span className="navbar-logo-text">jumia</span>
          </Link>

          {/* Search (hidden on very small screens, shown in mobile drawer) */}
          <form
            onSubmit={handleSearch}
            className="search-bar"
            role="search"
            aria-label="Product search"
          >
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, brands and categories…"
              aria-label="Search"
            />
            <button type="submit" aria-label="Submit search">
              <i className="bi bi-search" />
            </button>
          </form>

          {/* Desktop nav actions */}
          <nav className="navbar-actions" aria-label="Account and cart">

            {/* Account dropdown */}
            <div className="nav-dropdown-wrapper" ref={userMenuRef}>
              <button
                className={`nav-action-btn${userMenuOpen ? " active" : ""}`}
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-haspopup="true"
                aria-expanded={userMenuOpen}
              >
                <i className="bi bi-person" />
                <span>{user ? (user.first_name || user.username) : "Account"}</span>
              </button>

              {userMenuOpen && (
                <div className="nav-dropdown" role="menu">
                  {user ? (
                    <>
                      <Link
                        to="/orders"
                        className="nav-dd-item orange"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <i className="bi bi-bag-check" /> My Orders
                      </Link>
                      <div className="nav-dd-divider" />
                      <button
                        className="nav-dd-item red"
                        role="menuitem"
                        onClick={() => {
                          logout();
                          setUserMenuOpen(false);
                          navigate("/");
                        }}
                      >
                        <i className="bi bi-box-arrow-right" /> Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="nav-dd-item orange"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <i className="bi bi-box-arrow-in-right" /> Login
                      </Link>
                      <Link
                        to="/register"
                        className="nav-dd-item"
                        role="menuitem"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <i className="bi bi-person-plus" /> Register
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link to="/cart" className="nav-action-btn cart-badge-wrapper" aria-label={`Cart, ${itemCount} items`}>
              <div style={{ position: "relative" }}>
                <i className="bi bi-cart3" style={{ fontSize: "1.3rem" }} />
                {itemCount > 0 && (
                  <span className="cart-count">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </div>
              <span>Cart</span>
            </Link>
          </nav>

          {/* Hamburger (mobile only) */}
          <button
            className="hamburger-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            <i className={`bi ${menuOpen ? "bi-x-lg" : "bi-list"}`} />
          </button>
        </div>
      </div>

      {/* ── Category bar ─────────────────────────────────────────────────── */}
      <nav className="category-bar" aria-label="Product categories">
        <div className="container">
          <ul className="category-bar-inner">
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <Link
                  to={`/products?category=${cat.slug}`}
                  className="cat-bar-link"
                  onClick={closeMobileMenu}
                >
                  <i className={`bi ${cat.icon}`} />
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* ── Mobile drawer ─────────────────────────────────────────────────── */}
      {menuOpen && (
        <div className="mobile-nav open" role="dialog" aria-modal="true" aria-label="Mobile navigation">
          <div
            className="mobile-nav-overlay"
            onClick={closeMobileMenu}
            aria-hidden="true"
          />
          <div className="mobile-nav-drawer">

            {/* Mobile search */}
            <form onSubmit={handleSearch} className="search-bar" style={{ marginBottom: 20 }} role="search">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                aria-label="Search"
              />
              <button type="submit" aria-label="Search">
                <i className="bi bi-search" />
              </button>
            </form>

            {/* Account links */}
            <div style={{ marginBottom: 16 }}>
              {user ? (
                <>
                  <p style={{ fontWeight: 700, marginBottom: 8, fontSize: "0.9rem", color: "var(--j-orange)" }}>
                    Hi, {user.first_name || user.username}
                  </p>
                  <Link
                    to="/orders"
                    className="nav-dd-item"
                    style={{ borderRadius: 4 }}
                    onClick={closeMobileMenu}
                  >
                    <i className="bi bi-bag-check" /> My Orders
                  </Link>
                  <button
                    className="nav-dd-item red"
                    style={{ borderRadius: 4, width: "100%" }}
                    onClick={() => { logout(); closeMobileMenu(); navigate("/"); }}
                  >
                    <i className="bi bi-box-arrow-right" /> Logout
                  </button>
                </>
              ) : (
                <div style={{ display: "flex", gap: 8 }}>
                  <Link to="/login"    className="btn btn-orange btn-sm flex-1" onClick={closeMobileMenu}>Login</Link>
                  <Link to="/register" className="btn btn-outline btn-sm flex-1" onClick={closeMobileMenu}>Register</Link>
                </div>
              )}
            </div>

            <div className="divider" />

            {/* Cart shortcut */}
            <Link
              to="/cart"
              className="nav-dd-item"
              style={{ borderRadius: 4, marginBottom: 4 }}
              onClick={closeMobileMenu}
            >
              <i className="bi bi-cart3" />
              Cart
              {itemCount > 0 && (
                <span className="badge badge-dark" style={{ marginLeft: "auto" }}>{itemCount}</span>
              )}
            </Link>

            <div className="divider" />

            {/* Mobile categories */}
            <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--j-grey)", textTransform: "uppercase", letterSpacing: "0.06em", margin: "8px 0" }}>
              Categories
            </p>
            <ul style={{ listStyle: "none" }}>
              {CATEGORIES.map((cat) => (
                <li key={cat.slug}>
                  <Link
                    to={`/products?category=${cat.slug}`}
                    className="cat-bar-link"
                    style={{ paddingLeft: 4 }}
                    onClick={closeMobileMenu}
                  >
                    <i className={`bi ${cat.icon}`} />
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>

          </div>
        </div>
      )}
    </header>
  );
}
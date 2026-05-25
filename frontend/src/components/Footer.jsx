// src/components/Footer.jsx
import { Link } from "react-router-dom";

const SOCIAL_LINKS = [
  { icon: "bi-facebook",   href: "#", label: "Facebook" },
  { icon: "bi-twitter-x",  href: "#", label: "Twitter/X" },
  { icon: "bi-instagram",  href: "#", label: "Instagram" },
  { icon: "bi-youtube",    href: "#", label: "YouTube" },
];

const HELP_LINKS = [
  { label: "Track My Order",    to: "/orders",  internal: true },
  { label: "Returns & Refunds", href: "#" },
  { label: "Help Center",       href: "#" },
  { label: "Contact Us",        href: "#" },
];

const ABOUT_LINKS = [
  { label: "About Us",          href: "#" },
  { label: "Seller Portal",     href: "#" },
  { label: "Affiliate Program", href: "#" },
  { label: "Privacy Policy",    href: "#" },
];

const PAYMENT_METHODS = ["M-Pesa", "Visa", "Mastercard", "Cash on Delivery"];

const APP_BUTTONS = [
  { label: "App Store",   icon: "bi-apple",       href: "#" },
  { label: "Google Play", icon: "bi-google-play", href: "#" },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-top">
        <div className="container">
          <div className="footer-grid">

            {/* Brand column */}
            <div>
              <Link to="/" className="footer-logo">jumia</Link>
              <p className="footer-desc">
                Kenya&rsquo;s #1 online shopping destination.
                Safe, fast and secure delivery across the country.
              </p>
              <div className="footer-socials">
                {SOCIAL_LINKS.map(({ icon, href, label }) => (
                  <a
                    key={icon}
                    href={href}
                    aria-label={label}
                    className="footer-social-link"
                  >
                    <i className={`bi ${icon}`} />
                  </a>
                ))}
              </div>
            </div>

            {/* Need Help */}
            <div>
              <h5 className="footer-col-title">Need Help?</h5>
              <ul className="footer-links">
                {HELP_LINKS.map(({ label, to, href, internal }) => (
                  <li key={label}>
                    {internal ? (
                      <Link to={to}>{label}</Link>
                    ) : (
                      <a href={href}>{label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* About Jumia */}
            <div>
              <h5 className="footer-col-title">About Jumia</h5>
              <ul className="footer-links">
                {ABOUT_LINKS.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href}>{label}</a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment + App */}
            <div>
              <h5 className="footer-col-title">Payment Methods</h5>
              <div className="footer-payment-methods">
                {PAYMENT_METHODS.map((method) => (
                  <span key={method} className="footer-payment-badge">
                    {method}
                  </span>
                ))}
              </div>

              <h5 className="footer-col-title" style={{ marginTop: 20 }}>
                Download App
              </h5>
              <div className="footer-app-buttons">
                {APP_BUTTONS.map(({ label, icon, href }) => (
                  <a key={label} href={href} className="footer-app-btn">
                    <i className={`bi ${icon}`} />
                    {label}
                  </a>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          &copy; {new Date().getFullYear()} Jumia Clone. Built with Django + React + M-Pesa.
        </div>
      </div>
    </footer>
  );
}
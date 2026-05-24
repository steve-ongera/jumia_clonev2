// src/components/ProductCard.jsx
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { formatPrice } from "../utils/api";
import StarRating from "./StarRating";
import { useState } from "react";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddToCart = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setAdding(true);
    try {
      await addToCart(product.id);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } finally {
      setAdding(false);
    }
  };

  const imgSrc = product.image || `https://placehold.co/300x300/f5f5f5/aaa?text=${encodeURIComponent(product.name.slice(0, 10))}`;

  return (
    <Link to={`/products/${product.slug}`} className="card" style={{ display: "block", transition: "transform 0.2s, box-shadow 0.2s" }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
    >
      {/* Image */}
      <div style={{ position: "relative", aspectRatio: "1", overflow: "hidden", background: "#fafafa" }}>
        <img src={imgSrc} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }} />
        {product.discount_percent > 0 && (
          <span className="badge badge-red" style={{ position: "absolute", top: 8, left: 8 }}>
            -{product.discount_percent}%
          </span>
        )}
        {product.is_flash_sale && (
          <span className="badge badge-orange" style={{ position: "absolute", top: 8, right: 8 }}>
            <i className="bi-lightning-fill" /> FLASH
          </span>
        )}
      </div>

      {/* Info */}
      <div style={{ padding: "10px 12px 12px" }}>
        <p style={{ fontSize: "0.82rem", color: "var(--jumia-grey)", marginBottom: 4, fontWeight: 600 }}>
          {product.brand || product.category_name}
        </p>
        <h3 style={{ fontSize: "0.88rem", fontWeight: 700, lineHeight: 1.3, marginBottom: 8,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {product.name}
        </h3>

        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
          <StarRating rating={product.average_rating} size="sm" />
          <span style={{ fontSize: "0.75rem", color: "var(--jumia-grey)" }}>
            ({product.review_count})
          </span>
        </div>

        <div style={{ marginBottom: 10 }}>
          <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "1rem", color: "var(--jumia-dark)" }}>
            {formatPrice(product.price)}
          </span>
          {product.old_price && (
            <span style={{ fontSize: "0.78rem", color: "var(--jumia-grey)", textDecoration: "line-through", marginLeft: 6 }}>
              {formatPrice(product.old_price)}
            </span>
          )}
        </div>

        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          style={{
            width: "100%", padding: "8px", borderRadius: 4, fontWeight: 700, fontSize: "0.85rem",
            background: added ? "var(--jumia-green)" : product.stock === 0 ? "#ccc" : "var(--jumia-orange)",
            color: "white", transition: "background 0.2s",
          }}
        >
          {product.stock === 0
            ? "Out of Stock"
            : adding
            ? "Adding..."
            : added
            ? <><i className="bi-check2" /> Added!</>
            : <><i className="bi-cart-plus" /> Add to Cart</>}
        </button>
      </div>
    </Link>
  );
}
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
  const { user }      = useAuth();
  const navigate      = useNavigate();
  const [adding, setAdding] = useState(false);
  const [added,  setAdded]  = useState(false);

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

  const imgSrc =
    product.image ||
    `https://placehold.co/300x300/f5f5f5/aaa?text=${encodeURIComponent(
      product.name.slice(0, 10)
    )}`;

  /* Button state → CSS modifier class */
  const btnClass = added
    ? "product-card-add-btn green"
    : product.stock === 0
    ? "product-card-add-btn disabled"
    : "product-card-add-btn orange";

  return (
    <Link
      to={`/products/${product.slug}`}
      className="product-card"
    >
      {/* ── Image ──────────────────────────────────────────────────────── */}
      <div className="product-card-image-wrap">
        <img
          src={imgSrc}
          alt={product.name}
          className="product-card-image"
        />

        {/* Badges – left */}
        {(product.discount_percent > 0 || product.is_flash_sale) && (
          <div className="product-card-badges">
            {product.discount_percent > 0 && (
              <span className="badge badge-red">
                -{product.discount_percent}%
              </span>
            )}
            {product.is_flash_sale && (
              <span className="badge badge-orange">
                <i className="bi bi-lightning-fill" /> FLASH
              </span>
            )}
          </div>
        )}

        {/* Out-of-stock overlay badge – right */}
        {product.stock === 0 && (
          <div className="product-card-badge-right">
            <span className="badge badge-dark">Out of Stock</span>
          </div>
        )}
      </div>

      {/* ── Info ───────────────────────────────────────────────────────── */}
      <div className="product-card-body">

        {/* Brand / category */}
        <p className="product-card-brand">
          {product.brand || product.category_name}
        </p>

        {/* Product name */}
        <h3 className="product-card-name">{product.name}</h3>

        {/* Star rating */}
        <div className="product-card-rating">
          <StarRating rating={product.average_rating} size="sm" />
          <span className="star-count">({product.review_count})</span>
        </div>

        {/* Price */}
        <div className="product-card-price-wrap">
          <span className="product-card-price">
            {formatPrice(product.price)}
          </span>
          {product.old_price && (
            <span className="product-card-old-price">
              {formatPrice(product.old_price)}
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={adding || product.stock === 0}
          className={btnClass}
        >
          {product.stock === 0 ? (
            "Out of Stock"
          ) : adding ? (
            <>
              <span className="spinner spinner-sm spinner-inline" />
              Adding…
            </>
          ) : added ? (
            <>
              <i className="bi bi-check2" /> Added!
            </>
          ) : (
            <>
              <i className="bi bi-cart-plus" /> Add to Cart
            </>
          )}
        </button>

      </div>
    </Link>
  );
}
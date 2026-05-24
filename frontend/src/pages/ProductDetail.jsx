import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI, formatPrice } from "../utils/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";
import Spinner from "../components/Spinner";

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [mainImg, setMainImg] = useState(null);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [tab, setTab] = useState("description");

  useEffect(() => {
    productAPI.detail(slug).then(({ data }) => {
      setProduct(data);
      setMainImg(data.image);
    }).catch(() => navigate("/404")).finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) return <Spinner />;
  if (!product) return null;

  const allImages = [product.image, ...(product.images || []).map(i => i.image)].filter(Boolean);

  const handleAddToCart = async () => {
    if (!user) { navigate("/login"); return; }
    setAdding(true);
    try {
      await addToCart(product.id, qty);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } finally { setAdding(false); }
  };

  const handleBuyNow = async () => {
    if (!user) { navigate("/login"); return; }
    await addToCart(product.id, qty);
    navigate("/checkout");
  };

  return (
    <div className="container" style={{ padding: "16px" }}>
      {/* Breadcrumb */}
      <nav style={{ fontSize: "0.82rem", color: "var(--jumia-grey)", marginBottom: 16 }}>
        <a href="/" style={{ color: "var(--jumia-orange)" }}>Home</a> &rsaquo;{" "}
        {product.category && (
          <><a href={`/products?category=${product.category.slug}`} style={{ color: "var(--jumia-orange)" }}>{product.category.name}</a> &rsaquo; </>
        )}
        <span>{product.name}</span>
      </nav>

      {/* Main product section */}
      <div style={{ display: "grid", gridTemplateColumns: "minmax(300px, 420px) 1fr", gap: 24, marginBottom: 24 }}>
        {/* Images */}
        <div className="card" style={{ padding: 16 }}>
          <img src={mainImg || `https://placehold.co/500x500/f5f5f5/aaa?text=${encodeURIComponent(product.name.slice(0, 15))}`}
            alt={product.name} style={{ width: "100%", aspectRatio: "1", objectFit: "contain", borderRadius: 4, marginBottom: 12 }} />
          {allImages.length > 1 && (
            <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
              {allImages.map((img, i) => (
                <img key={i} src={img} alt="" onClick={() => setMainImg(img)}
                  style={{ width: 64, height: 64, objectFit: "contain", borderRadius: 4, cursor: "pointer",
                    border: img === mainImg ? "2px solid var(--jumia-orange)" : "1px solid var(--jumia-border)", padding: 4, flexShrink: 0 }} />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="card" style={{ padding: 24, marginBottom: 16 }}>
            {product.brand && <p style={{ color: "var(--jumia-orange)", fontWeight: 700, fontSize: "0.85rem", marginBottom: 6 }}>{product.brand}</p>}
            <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "1.4rem", marginBottom: 12, lineHeight: 1.3 }}>
              {product.name}
            </h1>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <StarRating rating={product.average_rating} />
              <span style={{ fontWeight: 700, color: "var(--jumia-orange)" }}>{product.average_rating}</span>
              <span style={{ color: "var(--jumia-grey)", fontSize: "0.85rem" }}>({product.review_count} reviews)</span>
            </div>

            <div style={{ borderTop: "1px solid var(--jumia-border)", borderBottom: "1px solid var(--jumia-border)", padding: "16px 0", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "2rem", color: "var(--jumia-dark)" }}>
                  {formatPrice(product.price)}
                </span>
                {product.old_price && (
                  <span style={{ fontSize: "1rem", color: "var(--jumia-grey)", textDecoration: "line-through" }}>
                    {formatPrice(product.old_price)}
                  </span>
                )}
                {product.discount_percent > 0 && (
                  <span className="badge badge-red" style={{ fontSize: "0.85rem", padding: "4px 10px" }}>
                    -{product.discount_percent}%
                  </span>
                )}
              </div>
              {product.stock > 0 ? (
                <span style={{ color: "var(--jumia-green)", fontWeight: 700, fontSize: "0.9rem" }}>
                  <i className="bi-check-circle-fill" /> In Stock ({product.stock} available)
                </span>
              ) : (
                <span style={{ color: "var(--jumia-red)", fontWeight: 700 }}>
                  <i className="bi-x-circle-fill" /> Out of Stock
                </span>
              )}
            </div>

            {/* Quantity */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <span style={{ fontWeight: 700 }}>Quantity:</span>
              <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--jumia-border)", borderRadius: 4, overflow: "hidden" }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} style={{ padding: "8px 14px", fontSize: "1.2rem", color: "var(--jumia-grey)" }}>−</button>
                <span style={{ padding: "8px 20px", fontWeight: 800, fontSize: "1rem", borderLeft: "1px solid var(--jumia-border)", borderRight: "1px solid var(--jumia-border)" }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} style={{ padding: "8px 14px", fontSize: "1.2rem", color: "var(--jumia-grey)" }}>+</button>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <button onClick={handleAddToCart} disabled={adding || product.stock === 0}
                className="btn btn-outline" style={{ flex: 1, padding: "14px", fontSize: "1rem" }}>
                <i className="bi-cart-plus" /> {added ? "Added!" : adding ? "Adding..." : "Add to Cart"}
              </button>
              <button onClick={handleBuyNow} disabled={product.stock === 0}
                className="btn btn-orange" style={{ flex: 1, padding: "14px", fontSize: "1rem" }}>
                <i className="bi-bag-check" /> Buy Now
              </button>
            </div>
          </div>

          {/* Delivery info */}
          <div className="card" style={{ padding: 16 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Delivery & Returns</h3>
            {[
              { icon: "bi-truck", text: "Free delivery on orders over KES 2,000" },
              { icon: "bi-geo-alt", text: "Delivered to your door in Nairobi (1-2 days)" },
              { icon: "bi-arrow-counterclockwise", text: "7-day return policy" },
              { icon: "bi-shield-check", text: "Secure payment via M-Pesa" },
            ].map(d => (
              <div key={d.text} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, fontSize: "0.85rem" }}>
                <i className={`bi ${d.icon}`} style={{ color: "var(--jumia-orange)", fontSize: "1.1rem", flexShrink: 0 }} />
                {d.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: 24 }}>
        <div style={{ display: "flex", gap: 0, borderBottom: "2px solid var(--jumia-border)", marginBottom: 24 }}>
          {["description", "reviews"].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "10px 24px", fontWeight: 700, fontSize: "0.95rem",
              color: tab === t ? "var(--jumia-orange)" : "var(--jumia-grey)",
              borderBottom: tab === t ? "2px solid var(--jumia-orange)" : "none",
              marginBottom: -2,
            }}>
              {t === "description" ? "Description" : `Reviews (${product.review_count})`}
            </button>
          ))}
        </div>
        {tab === "description" && (
          <div style={{ lineHeight: 1.8, color: "#444" }}>
            {product.description || "No description available."}
          </div>
        )}
        {tab === "reviews" && (
          <div>
            {product.reviews?.length === 0 ? (
              <p style={{ color: "var(--jumia-grey)" }}>No reviews yet. Be the first!</p>
            ) : (
              product.reviews?.map(r => (
                <div key={r.id} style={{ borderBottom: "1px solid var(--jumia-border)", paddingBottom: 16, marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <strong>{r.user}</strong>
                    <StarRating rating={r.rating} size="sm" />
                    <span style={{ fontSize: "0.75rem", color: "var(--jumia-grey)" }}>{new Date(r.created_at).toLocaleDateString()}</span>
                  </div>
                  {r.title && <p style={{ fontWeight: 700, marginBottom: 4 }}>{r.title}</p>}
                  <p style={{ color: "#555", fontSize: "0.9rem" }}>{r.body}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
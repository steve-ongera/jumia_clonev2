// src/pages/Cart.jsx
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/api";
import Spinner from "../components/Spinner";

export default function Cart() {
  const { cart, cartLoading, updateItem, removeItem } = useCart();
  const navigate = useNavigate();

  if (cartLoading) return <Spinner />;
  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: "60px 16px", textAlign: "center" }}>
        <i className="bi-cart-x" style={{ fontSize: "4rem", color: "#ddd" }} />
        <h2 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, marginTop: 16, marginBottom: 8 }}>Your cart is empty</h2>
        <p style={{ color: "var(--jumia-grey)", marginBottom: 24 }}>Looks like you haven't added anything yet.</p>
        <Link to="/products" className="btn btn-orange">
          <i className="bi-bag" /> Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: "16px" }}>
      <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, marginBottom: 20 }}>
        <i className="bi-cart3" style={{ color: "var(--jumia-orange)" }} /> Shopping Cart ({items.length} {items.length === 1 ? "item" : "items"})
      </h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "flex-start" }}>
        {/* Items */}
        <div>
          {items.map(item => (
            <div key={item.id} className="card" style={{ display: "flex", gap: 16, padding: 16, marginBottom: 12, alignItems: "center" }}>
              <img
                src={item.product.image || `https://placehold.co/100x100/f5f5f5/aaa?text=...`}
                alt={item.product.name}
                style={{ width: 90, height: 90, objectFit: "contain", borderRadius: 4, flexShrink: 0, border: "1px solid var(--jumia-border)", padding: 4 }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Link to={`/products/${item.product.slug}`} style={{ fontWeight: 700, fontSize: "0.9rem", color: "#333", display: "block", marginBottom: 4 }}>
                  {item.product.name}
                </Link>
                <p style={{ color: "var(--jumia-orange)", fontWeight: 800, fontSize: "1.1rem" }}>
                  {formatPrice(item.product.price)}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", border: "1.5px solid var(--jumia-border)", borderRadius: 4, overflow: "hidden", flexShrink: 0 }}>
                <button onClick={() => updateItem(item.id, item.quantity - 1)} disabled={item.quantity <= 1}
                  style={{ padding: "6px 12px", fontSize: "1rem", color: "var(--jumia-grey)" }}>−</button>
                <span style={{ padding: "6px 16px", fontWeight: 800, borderLeft: "1px solid var(--jumia-border)", borderRight: "1px solid var(--jumia-border)" }}>
                  {item.quantity}
                </span>
                <button onClick={() => updateItem(item.id, item.quantity + 1)} disabled={item.quantity >= item.product.stock}
                  style={{ padding: "6px 12px", fontSize: "1rem", color: "var(--jumia-grey)" }}>+</button>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "1rem" }}>{formatPrice(item.subtotal)}</p>
                <button onClick={() => removeItem(item.id)} style={{ color: "var(--jumia-red)", fontSize: "0.82rem", fontWeight: 700, marginTop: 6 }}>
                  <i className="bi-trash3" /> Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="card" style={{ padding: 20, position: "sticky", top: 80 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Order Summary</h3>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.9rem" }}>
            <span>Subtotal ({cart.item_count} items)</span>
            <span style={{ fontWeight: 700 }}>{formatPrice(cart.total)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, fontSize: "0.9rem" }}>
            <span>Shipping</span>
            <span style={{ color: cart.total >= 2000 ? "var(--jumia-green)" : "#333", fontWeight: 700 }}>
              {cart.total >= 2000 ? "FREE" : formatPrice(200)}
            </span>
          </div>
          <div style={{ borderTop: "2px solid var(--jumia-border)", paddingTop: 16, display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Total</span>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "1.3rem", color: "var(--jumia-orange)" }}>
              {formatPrice(cart.total >= 2000 ? cart.total : cart.total + 200)}
            </span>
          </div>
          <button className="btn btn-orange btn-full" style={{ padding: 14, fontSize: "1rem" }}
            onClick={() => navigate("/checkout")}>
            <i className="bi-lock-fill" /> Proceed to Checkout
          </button>
          <Link to="/products" style={{ display: "block", textAlign: "center", marginTop: 12, color: "var(--jumia-grey)", fontSize: "0.85rem" }}>
            <i className="bi-arrow-left" /> Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
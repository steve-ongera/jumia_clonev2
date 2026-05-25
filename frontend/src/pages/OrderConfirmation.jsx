// src/pages/OrderConfirmation.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { orderAPI, formatPrice } from "../utils/api";
import MpesaModal from "../components/MpesaModal";
import Spinner from "../components/Spinner";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showMpesa, setShowMpesa] = useState(false);

  const fetchOrder = async () => {
    try {
      const { data } = await orderAPI.detail(orderId);
      setOrder(data);
    } catch {
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrder(); }, [orderId]);

  const handleMpesaSuccess = () => {
    setShowMpesa(false);
    fetchOrder(); // Refresh order to show paid status
  };

  if (loading) return <Spinner />;
  if (!order) return null;

  const isPaid = order.payment_status === "paid";
  const needsMpesa = order.payment_method === "mpesa" && !isPaid;

  return (
    <div className="container" style={{ padding: "24px 16px", maxWidth: 720 }}>
      {/* Success / pending header */}
      <div className="card" style={{ padding: 32, textAlign: "center", marginBottom: 20 }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", margin: "0 auto 20px",
          background: isPaid ? "#e8f5e9" : "var(--jumia-orange-light)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "2.5rem", color: isPaid ? "var(--jumia-green)" : "var(--jumia-orange)",
        }}>
          <i className={isPaid ? "bi-check-circle-fill" : "bi-bag-check-fill"} />
        </div>
        <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "1.6rem", marginBottom: 8 }}>
          {isPaid ? "Payment Confirmed!" : "Order Placed Successfully!"}
        </h1>
        <p style={{ color: "#555", marginBottom: 4 }}>
          Order <strong style={{ color: "var(--jumia-orange)" }}>#{order.order_number}</strong>
        </p>
        <p style={{ color: "var(--jumia-grey)", fontSize: "0.9rem" }}>
          {new Date(order.created_at).toLocaleString("en-KE", { dateStyle: "full", timeStyle: "short" })}
        </p>
      </div>

      {/* Payment status & M-Pesa CTA */}
      {needsMpesa && (
        <div style={{ background: "#fff3e0", border: "2px solid var(--jumia-orange)", borderRadius: 8, padding: 20, marginBottom: 20, textAlign: "center" }}>
          <i className="bi-phone-fill" style={{ fontSize: "2rem", color: "var(--jumia-orange)", marginBottom: 10, display: "block" }} />
          <h3 style={{ fontWeight: 800, marginBottom: 8 }}>Complete Your Payment via M-Pesa</h3>
          <p style={{ color: "#555", marginBottom: 16, fontSize: "0.9rem" }}>
            Your order is reserved. Pay <strong>{formatPrice(order.total)}</strong> via M-Pesa to confirm it.
          </p>
          <button className="btn btn-orange" style={{ padding: "12px 32px", fontSize: "1rem" }}
            onClick={() => setShowMpesa(true)}>
            <i className="bi-phone" /> Pay with M-Pesa Now
          </button>
        </div>
      )}

      {isPaid && (
        <div className="alert alert-success" style={{ textAlign: "center" }}>
          <i className="bi-check-circle-fill" /> Payment of <strong>{formatPrice(order.total)}</strong> received via{" "}
          {order.payment_method === "mpesa" ? "M-Pesa" : order.payment_method}.
        </div>
      )}

      {/* Order details */}
      <div className="card" style={{ padding: 24, marginBottom: 20 }}>
        <h2 style={{ fontWeight: 800, marginBottom: 16 }}>Order Details</h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
          {[
            { label: "Order Status", value: order.status.toUpperCase(), color: "var(--jumia-orange)" },
            { label: "Payment Status", value: order.payment_status.toUpperCase(), color: isPaid ? "var(--jumia-green)" : "var(--jumia-orange)" },
            { label: "Payment Method", value: order.payment_method === "mpesa" ? "M-Pesa" : order.payment_method === "cod" ? "Cash on Delivery" : "Card" },
            { label: "Total Amount", value: formatPrice(order.total), color: "var(--jumia-dark)" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: "#fafafa", borderRadius: 6, padding: "12px 16px" }}>
              <p style={{ fontSize: "0.78rem", color: "var(--jumia-grey)", fontWeight: 600, marginBottom: 4 }}>{label}</p>
              <p style={{ fontWeight: 800, color: color || "#333" }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Items */}
        <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: "0.95rem", borderTop: "1px solid var(--jumia-border)", paddingTop: 16 }}>
          Items Ordered
        </h3>
        {order.items.map(item => (
          <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--jumia-border)", fontSize: "0.9rem" }}>
            <div>
              <p style={{ fontWeight: 700 }}>{item.product_name}</p>
              <p style={{ color: "var(--jumia-grey)", fontSize: "0.82rem" }}>
                {formatPrice(item.product_price)} × {item.quantity}
              </p>
            </div>
            <span style={{ fontWeight: 800 }}>{formatPrice(item.subtotal)}</span>
          </div>
        ))}

        {/* Totals */}
        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: 6 }}>
            <span>Subtotal</span><span style={{ fontWeight: 700 }}>{formatPrice(order.subtotal)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", marginBottom: 12 }}>
            <span>Shipping</span>
            <span style={{ fontWeight: 700, color: order.shipping_cost == 0 ? "var(--jumia-green)" : "#333" }}>
              {order.shipping_cost == 0 ? "FREE" : formatPrice(order.shipping_cost)}
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid var(--jumia-border)", paddingTop: 12 }}>
            <strong style={{ fontSize: "1.1rem" }}>Total</strong>
            <strong style={{ fontFamily: "'Montserrat', sans-serif", fontSize: "1.3rem", color: "var(--jumia-orange)" }}>
              {formatPrice(order.total)}
            </strong>
          </div>
        </div>
      </div>

      {/* Delivery address */}
      {order.shipping_address && (
        <div className="card" style={{ padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 10 }}>
            <i className="bi-geo-alt-fill" style={{ color: "var(--jumia-orange)" }} /> Delivery Address
          </h3>
          <p style={{ fontWeight: 700 }}>{order.shipping_address.full_name}</p>
          <p style={{ color: "#555", fontSize: "0.9rem" }}>{order.shipping_address.phone}</p>
          <p style={{ color: "#555", fontSize: "0.9rem" }}>
            {order.shipping_address.street}, {order.shipping_address.city}
            {order.shipping_address.county ? `, ${order.shipping_address.county}` : ""}
          </p>
        </div>
      )}

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        <Link to="/orders" className="btn btn-outline" style={{ flex: 1, justifyContent: "center", padding: 14 }}>
          <i className="bi-bag" /> View All Orders
        </Link>
        <Link to="/products" className="btn btn-orange" style={{ flex: 1, justifyContent: "center", padding: 14 }}>
          <i className="bi-shop" /> Continue Shopping
        </Link>
      </div>

      {showMpesa && (
        <MpesaModal order={order} onClose={() => setShowMpesa(false)} onSuccess={handleMpesaSuccess} />
      )}
    </div>
  );
}
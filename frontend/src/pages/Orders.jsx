// src/pages/Orders.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { orderAPI, formatPrice } from "../utils/api";
import Spinner from "../components/Spinner";

const STATUS_COLOR = {
  pending: "#f39c12",
  confirmed: "var(--jumia-orange)",
  processing: "#3498db",
  shipped: "#8e44ad",
  delivered: "var(--jumia-green)",
  cancelled: "var(--jumia-red)",
};

const PAYMENT_COLOR = {
  unpaid: "var(--jumia-red)",
  pending: "#f39c12",
  paid: "var(--jumia-green)",
  failed: "var(--jumia-red)",
  refunded: "#3498db",
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.list().then(({ data }) => {
      setOrders(data.results || data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="container" style={{ padding: "16px" }}>
      <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, marginBottom: 24, fontSize: "1.4rem" }}>
        <i className="bi-bag-check" style={{ color: "var(--jumia-orange)" }} /> My Orders
      </h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 8 }}>
          <i className="bi-bag-x" style={{ fontSize: "4rem", color: "#ddd" }} />
          <h2 style={{ fontWeight: 800, marginTop: 16, marginBottom: 8 }}>No orders yet</h2>
          <p style={{ color: "var(--jumia-grey)", marginBottom: 24 }}>Start shopping to see your orders here.</p>
          <Link to="/products" className="btn btn-orange">
            <i className="bi-bag" /> Start Shopping
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map(order => (
            <div key={order.id} className="card" style={{ padding: 20 }}>
              {/* Order header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16, paddingBottom: 16, borderBottom: "1px solid var(--jumia-border)" }}>
                <div>
                  <p style={{ fontWeight: 800, fontSize: "1rem" }}>
                    Order <span style={{ color: "var(--jumia-orange)" }}>#{order.order_number}</span>
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "var(--jumia-grey)", marginTop: 2 }}>
                    <i className="bi-calendar3" /> {new Date(order.created_at).toLocaleDateString("en-KE", { dateStyle: "medium" })}
                  </p>
                </div>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <span style={{
                    padding: "4px 12px", borderRadius: 20, fontWeight: 700, fontSize: "0.78rem",
                    background: `${STATUS_COLOR[order.status]}20`,
                    color: STATUS_COLOR[order.status],
                    border: `1px solid ${STATUS_COLOR[order.status]}40`,
                  }}>
                    <i className="bi-circle-fill" style={{ fontSize: "0.5rem", marginRight: 4 }} />
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                  <span style={{
                    padding: "4px 12px", borderRadius: 20, fontWeight: 700, fontSize: "0.78rem",
                    background: `${PAYMENT_COLOR[order.payment_status]}20`,
                    color: PAYMENT_COLOR[order.payment_status],
                    border: `1px solid ${PAYMENT_COLOR[order.payment_status]}40`,
                  }}>
                    {order.payment_status === "paid" ? <><i className="bi-check-circle" /> Paid</> : order.payment_status.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Items preview */}
              <div style={{ marginBottom: 16 }}>
                {order.items.slice(0, 3).map(item => (
                  <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.88rem", marginBottom: 6 }}>
                    <span style={{ color: "#444" }}>
                      {item.product_name.slice(0, 45)}{item.product_name.length > 45 ? "..." : ""}
                      <span style={{ color: "var(--jumia-grey)" }}> ×{item.quantity}</span>
                    </span>
                    <span style={{ fontWeight: 700, flexShrink: 0 }}>{formatPrice(item.subtotal)}</span>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p style={{ fontSize: "0.82rem", color: "var(--jumia-grey)" }}>
                    +{order.items.length - 3} more item(s)
                  </p>
                )}
              </div>

              {/* Footer */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <span style={{ color: "var(--jumia-grey)", fontSize: "0.85rem" }}>Total: </span>
                  <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "1.1rem", color: "var(--jumia-dark)" }}>
                    {formatPrice(order.total)}
                  </span>
                  <span style={{ fontSize: "0.78rem", color: "var(--jumia-grey)", marginLeft: 8 }}>
                    via {order.payment_method === "mpesa" ? "M-Pesa" : order.payment_method === "cod" ? "Cash on Delivery" : "Card"}
                  </span>
                </div>
                <Link to={`/order-confirmation/${order.id}`} className="btn btn-outline" style={{ fontSize: "0.85rem", padding: "8px 18px" }}>
                  View Details <i className="bi-arrow-right" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
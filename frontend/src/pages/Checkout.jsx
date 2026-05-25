// src/pages/Checkout.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addressAPI, orderAPI, formatPrice, getErrorMessage } from "../utils/api";
import { useCart } from "../context/CartContext";
import Spinner from "../components/Spinner";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, fetchCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");

  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [notes, setNotes] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // New address form
  const [newAddr, setNewAddr] = useState({ full_name: "", phone: "", street: "", city: "", county: "", is_default: false });
  const [savingAddr, setSavingAddr] = useState(false);

  useEffect(() => {
    addressAPI.list().then(({ data }) => {
      setAddresses(data);
      const def = data.find(a => a.is_default) || data[0];
      if (def) setSelectedAddress(def.id);
      if (data.length === 0) setShowAddForm(true);
    }).finally(() => setLoading(false));
  }, []);

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      const { data } = await addressAPI.create(newAddr);
      setAddresses(prev => [...prev, data]);
      setSelectedAddress(data.id);
      setShowAddForm(false);
      setNewAddr({ full_name: "", phone: "", street: "", city: "", county: "", is_default: false });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally { setSavingAddr(false); }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { setError("Please select a delivery address."); return; }
    setPlacing(true);
    setError("");
    try {
      const { data: order } = await orderAPI.place({
        address_id: selectedAddress,
        payment_method: paymentMethod,
        notes,
      });
      await fetchCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally { setPlacing(false); }
  };

  if (loading) return <Spinner />;
  if (!cart?.items?.length) {
    navigate("/cart");
    return null;
  }

  const shipping = cart.total >= 2000 ? 0 : 200;
  const total = cart.total + shipping;

  return (
    <div className="container" style={{ padding: "16px" }}>
      <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, marginBottom: 24, fontSize: "1.4rem" }}>
        <i className="bi-bag-check" style={{ color: "var(--jumia-orange)" }} /> Checkout
      </h1>

      {error && <div className="alert alert-error"><i className="bi-exclamation-circle" /> {error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "flex-start" }}>
        <div>
          {/* ── Delivery Address ── */}
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 style={{ fontWeight: 800, fontSize: "1rem" }}>
                <i className="bi-geo-alt-fill" style={{ color: "var(--jumia-orange)" }} /> Delivery Address
              </h2>
              <button onClick={() => setShowAddForm(!showAddForm)}
                style={{ color: "var(--jumia-orange)", fontWeight: 700, fontSize: "0.85rem" }}>
                <i className="bi-plus-circle" /> Add New
              </button>
            </div>

            {addresses.map(addr => (
              <label key={addr.id} style={{
                display: "flex", gap: 12, padding: 14, borderRadius: 6, cursor: "pointer",
                border: `2px solid ${selectedAddress === addr.id ? "var(--jumia-orange)" : "var(--jumia-border)"}`,
                background: selectedAddress === addr.id ? "var(--jumia-orange-light)" : "white",
                marginBottom: 10, transition: "all 0.2s",
              }}>
                <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id}
                  onChange={() => setSelectedAddress(addr.id)} style={{ marginTop: 3 }} />
                <div>
                  <p style={{ fontWeight: 700 }}>{addr.full_name}</p>
                  <p style={{ fontSize: "0.85rem", color: "#555" }}>{addr.phone}</p>
                  <p style={{ fontSize: "0.85rem", color: "#555" }}>{addr.street}, {addr.city}{addr.county ? `, ${addr.county}` : ""}</p>
                  {addr.is_default && <span className="badge badge-orange" style={{ marginTop: 4 }}>Default</span>}
                </div>
              </label>
            ))}

            {showAddForm && (
              <form onSubmit={handleSaveAddress} style={{ background: "#fafafa", borderRadius: 8, padding: 20, border: "1px dashed var(--jumia-border)", marginTop: 16 }}>
                <h4 style={{ fontWeight: 700, marginBottom: 16, color: "var(--jumia-orange)" }}>New Delivery Address</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label>Full Name *</label>
                    <input required value={newAddr.full_name} onChange={e => setNewAddr(p => ({ ...p, full_name: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input required value={newAddr.phone} onChange={e => setNewAddr(p => ({ ...p, phone: e.target.value }))} placeholder="0712345678" />
                  </div>
                </div>
                <div className="form-group">
                  <label>Street Address *</label>
                  <input required value={newAddr.street} onChange={e => setNewAddr(p => ({ ...p, street: e.target.value }))} placeholder="House/Building No., Street" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <div className="form-group">
                    <label>City *</label>
                    <input required value={newAddr.city} onChange={e => setNewAddr(p => ({ ...p, city: e.target.value }))} placeholder="Nairobi" />
                  </div>
                  <div className="form-group">
                    <label>County</label>
                    <input value={newAddr.county} onChange={e => setNewAddr(p => ({ ...p, county: e.target.value }))} placeholder="Nairobi County" />
                  </div>
                </div>
                <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: "0.9rem", cursor: "pointer" }}>
                  <input type="checkbox" checked={newAddr.is_default} onChange={e => setNewAddr(p => ({ ...p, is_default: e.target.checked }))} />
                  Set as default address
                </label>
                <div style={{ display: "flex", gap: 10 }}>
                  <button type="submit" className="btn btn-orange" disabled={savingAddr}>
                    {savingAddr ? "Saving..." : <><i className="bi-check2" /> Save Address</>}
                  </button>
                  <button type="button" onClick={() => setShowAddForm(false)}
                    style={{ padding: "10px 16px", fontWeight: 700, color: "var(--jumia-grey)" }}>
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* ── Payment Method ── */}
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <h2 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: 16 }}>
              <i className="bi-credit-card" style={{ color: "var(--jumia-orange)" }} /> Payment Method
            </h2>
            {[
              { value: "mpesa", label: "M-Pesa", sub: "Pay via Safaricom STK Push", icon: "bi-phone-fill" },
              { value: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard", icon: "bi-credit-card-2-front" },
              { value: "cod", label: "Cash on Delivery", sub: "Pay when your order arrives", icon: "bi-cash-coin" },
            ].map(pm => (
              <label key={pm.value} style={{
                display: "flex", gap: 14, padding: 14, borderRadius: 6, cursor: "pointer",
                border: `2px solid ${paymentMethod === pm.value ? "var(--jumia-orange)" : "var(--jumia-border)"}`,
                background: paymentMethod === pm.value ? "var(--jumia-orange-light)" : "white",
                marginBottom: 10, alignItems: "center", transition: "all 0.2s",
              }}>
                <input type="radio" name="payment" value={pm.value} checked={paymentMethod === pm.value}
                  onChange={() => setPaymentMethod(pm.value)} />
                <i className={`bi ${pm.icon}`} style={{ fontSize: "1.5rem", color: paymentMethod === pm.value ? "var(--jumia-orange)" : "#888" }} />
                <div>
                  <p style={{ fontWeight: 700 }}>{pm.label}</p>
                  <p style={{ fontSize: "0.82rem", color: "#666" }}>{pm.sub}</p>
                </div>
              </label>
            ))}
          </div>

          {/* ── Order Notes ── */}
          <div className="card" style={{ padding: 24 }}>
            <h2 style={{ fontWeight: 800, fontSize: "1rem", marginBottom: 12 }}>
              <i className="bi-chat-left-text" style={{ color: "var(--jumia-orange)" }} /> Order Notes (Optional)
            </h2>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Any special delivery instructions..."
              rows={3} style={{ width: "100%", padding: "10px 14px", border: "1.5px solid var(--jumia-border)", borderRadius: 6, resize: "vertical", fontSize: "0.9rem" }} />
          </div>
        </div>

        {/* ── Order Summary ── */}
        <div className="card" style={{ padding: 24, position: "sticky", top: 80 }}>
          <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Order Summary</h3>

          <div style={{ maxHeight: 240, overflowY: "auto", marginBottom: 16 }}>
            {cart.items.map(item => (
              <div key={item.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 10, gap: 8 }}>
                <span style={{ fontWeight: 600, flex: 1 }}>
                  {item.product.name.slice(0, 30)}{item.product.name.length > 30 ? "..." : ""}{" "}
                  <span style={{ color: "var(--jumia-grey)" }}>×{item.quantity}</span>
                </span>
                <span style={{ fontWeight: 700, flexShrink: 0 }}>{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid var(--jumia-border)", paddingTop: 14, marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: "0.9rem" }}>
              <span>Subtotal</span><span style={{ fontWeight: 700 }}>{formatPrice(cart.total)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
              <span>Shipping</span>
              <span style={{ fontWeight: 700, color: shipping === 0 ? "var(--jumia-green)" : "#333" }}>
                {shipping === 0 ? "FREE" : formatPrice(shipping)}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid var(--jumia-border)", paddingTop: 14, marginBottom: 20 }}>
            <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>Total</span>
            <span style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "1.4rem", color: "var(--jumia-orange)" }}>
              {formatPrice(total)}
            </span>
          </div>

          <button className="btn btn-orange btn-full" style={{ padding: 16, fontSize: "1rem" }}
            onClick={handlePlaceOrder} disabled={placing}>
            {placing
              ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 3, display: "inline-block", margin: "0 8px 0 0" }} />Placing Order...</>
              : <><i className="bi-lock-fill" /> Place Order — {formatPrice(total)}</>}
          </button>

          <p style={{ fontSize: "0.75rem", color: "var(--jumia-grey)", textAlign: "center", marginTop: 12 }}>
            <i className="bi-shield-check" /> Your data is secure and encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
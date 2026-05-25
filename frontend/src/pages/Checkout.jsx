// src/pages/Checkout.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addressAPI, orderAPI, formatPrice, getErrorMessage } from "../utils/api";
import { useCart } from "../context/CartContext";
import Spinner from "../components/Spinner";

const PAYMENT_METHODS = [
  { value: "mpesa", label: "M-Pesa",               sub: "Pay via Safaricom STK Push", icon: "bi-phone-fill" },
  { value: "card",  label: "Credit / Debit Card",  sub: "Visa, Mastercard",           icon: "bi-credit-card-2-front" },
  { value: "cod",   label: "Cash on Delivery",     sub: "Pay when your order arrives",icon: "bi-cash-coin" },
];

const EMPTY_ADDR = { full_name: "", phone: "", street: "", city: "", county: "", is_default: false };

export default function Checkout() {
  const navigate          = useNavigate();
  const { cart, fetchCart } = useCart();

  const [addresses,       setAddresses]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [placing,         setPlacing]         = useState(false);
  const [error,           setError]           = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod,   setPaymentMethod]   = useState("mpesa");
  const [notes,           setNotes]           = useState("");
  const [showAddForm,     setShowAddForm]     = useState(false);
  const [newAddr,         setNewAddr]         = useState(EMPTY_ADDR);
  const [savingAddr,      setSavingAddr]      = useState(false);

  useEffect(() => {
    addressAPI.list()
      .then(({ data }) => {
        // Handle both plain array and paginated {results:[]} responses
        const list = Array.isArray(data) ? data : (data.results ?? []);
        setAddresses(list);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) setSelectedAddress(def.id);
        if (list.length === 0) setShowAddForm(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const setAddr = (field) => (e) =>
    setNewAddr((p) => ({ ...p, [field]: e.target.value }));

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddr(true);
    try {
      const { data } = await addressAPI.create(newAddr);
      setAddresses((prev) => [...prev, data]);
      setSelectedAddress(data.id);
      setShowAddForm(false);
      setNewAddr(EMPTY_ADDR);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSavingAddr(false);
    }
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
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <Spinner />;
  if (!cart?.items?.length) { navigate("/cart"); return null; }

  const shipping = cart.total >= 2000 ? 0 : 200;
  const total    = cart.total + shipping;

  return (
    <main className="page-main">
      <div className="container">

        <h1 className="font-heading font-800 text-lg mb-lg">
          <i className="bi bi-bag-check text-orange" /> Checkout
        </h1>

        {error && (
          <div className="alert alert-error">
            <i className="bi bi-exclamation-circle" /> {error}
          </div>
        )}

        <div className="checkout-layout">

          {/* ── Left column ──────────────────────────────────────────────── */}
          <div>

            {/* Delivery Address */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h2 className="checkout-card-title">
                  <i className="bi bi-geo-alt-fill" /> Delivery Address
                </h2>
                <button
                  className="checkout-card-action"
                  onClick={() => setShowAddForm((v) => !v)}
                >
                  <i className="bi bi-plus-circle" /> Add New
                </button>
              </div>

              {addresses.map((addr) => (
                <label
                  key={addr.id}
                  className={`address-option${selectedAddress === addr.id ? " selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="address"
                    value={addr.id}
                    checked={selectedAddress === addr.id}
                    onChange={() => setSelectedAddress(addr.id)}
                  />
                  <div>
                    <p className="address-option-name">{addr.full_name}</p>
                    <p className="address-option-phone">{addr.phone}</p>
                    <p className="address-option-addr">
                      {addr.street}, {addr.city}
                      {addr.county ? `, ${addr.county}` : ""}
                    </p>
                    {addr.is_default && (
                      <span className="badge badge-orange" style={{ marginTop: 4 }}>
                        Default
                      </span>
                    )}
                  </div>
                </label>
              ))}

              {showAddForm && (
                <form onSubmit={handleSaveAddress} className="new-address-form">
                  <p className="new-address-form-title">
                    <i className="bi bi-plus-circle" /> New Delivery Address
                  </p>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Full Name <span className="text-red">*</span></label>
                      <input
                        className="form-control"
                        required
                        value={newAddr.full_name}
                        onChange={setAddr("full_name")}
                        placeholder="Jane Wanjiku"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Phone <span className="text-red">*</span></label>
                      <input
                        className="form-control"
                        required
                        value={newAddr.phone}
                        onChange={setAddr("phone")}
                        placeholder="0712 345 678"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Street Address <span className="text-red">*</span></label>
                    <input
                      className="form-control"
                      required
                      value={newAddr.street}
                      onChange={setAddr("street")}
                      placeholder="House/Building No., Street"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">City <span className="text-red">*</span></label>
                      <input
                        className="form-control"
                        required
                        value={newAddr.city}
                        onChange={setAddr("city")}
                        placeholder="Nairobi"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">County</label>
                      <input
                        className="form-control"
                        value={newAddr.county}
                        onChange={setAddr("county")}
                        placeholder="Nairobi County"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-sm text-sm mb-md" style={{ cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={newAddr.is_default}
                      onChange={(e) => setNewAddr((p) => ({ ...p, is_default: e.target.checked }))}
                      style={{ accentColor: "var(--j-orange)" }}
                    />
                    Set as default address
                  </label>

                  <div className="flex gap-sm">
                    <button type="submit" className="btn btn-orange" disabled={savingAddr}>
                      {savingAddr ? (
                        <><span className="spinner spinner-sm spinner-inline" /> Saving…</>
                      ) : (
                        <><i className="bi bi-check2" /> Save Address</>
                      )}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setShowAddForm(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Payment Method */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h2 className="checkout-card-title">
                  <i className="bi bi-credit-card" /> Payment Method
                </h2>
              </div>

              {PAYMENT_METHODS.map((pm) => (
                <label
                  key={pm.value}
                  className={`payment-option${paymentMethod === pm.value ? " selected" : ""}`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={pm.value}
                    checked={paymentMethod === pm.value}
                    onChange={() => setPaymentMethod(pm.value)}
                  />
                  <i className={`bi ${pm.icon} payment-option-icon`} />
                  <div>
                    <p className="payment-option-label">{pm.label}</p>
                    <p className="payment-option-sub">{pm.sub}</p>
                  </div>
                </label>
              ))}
            </div>

            {/* Order Notes */}
            <div className="checkout-card">
              <div className="checkout-card-header">
                <h2 className="checkout-card-title">
                  <i className="bi bi-chat-left-text" /> Order Notes
                  <span className="text-grey text-sm" style={{ fontWeight: 400 }}>&nbsp;(Optional)</span>
                </h2>
              </div>
              <textarea
                className="form-control"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Any special delivery instructions…"
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>
          </div>

          {/* ── Order Summary sidebar ─────────────────────────────────────── */}
          <div className="order-summary-card">
            <p className="order-summary-title">Order Summary</p>

            {/* Items list */}
            <div className="checkout-items-scroll">
              {cart.items.map((item) => (
                <div key={item.id} className="checkout-item-row">
                  <span className="checkout-item-name line-clamp-2">
                    {item.product.name}
                  </span>
                  <span className="checkout-item-qty">×{item.quantity}</span>
                  <span className="checkout-item-subtotal">{formatPrice(item.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="summary-row">
              <span>Subtotal</span>
              <span className="font-700">{formatPrice(cart.total)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span className={shipping === 0 ? "free-shipping" : "font-700"}>
                {shipping === 0 ? "FREE" : formatPrice(shipping)}
              </span>
            </div>

            <div className="summary-row total">
              <span className="summary-total-label">Total</span>
              <span className="summary-total-value">{formatPrice(total)}</span>
            </div>

            <button
              className="btn btn-orange btn-full btn-lg"
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing ? (
                <><span className="spinner spinner-sm spinner-inline" /> Placing Order…</>
              ) : (
                <><i className="bi bi-lock-fill" /> Place Order — {formatPrice(total)}</>
              )}
            </button>

            <p className="text-xs text-grey text-center mt-sm">
              <i className="bi bi-shield-check" /> Your data is secure and encrypted
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
// src/components/MpesaModal.jsx
import { useState, useEffect, useRef } from "react";
import { mpesaAPI, formatPrice } from "../utils/api";

export default function MpesaModal({ order, onClose, onSuccess }) {
  const [phone, setPhone] = useState("254");
  const [step, setStep] = useState("form"); // form | pending | success | failed
  const [checkoutId, setCheckoutId] = useState(null);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  const pollRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStep("pending");
    try {
      const { data } = await mpesaAPI.stkPush(order.id, phone);
      setCheckoutId(data.checkout_request_id);
    } catch (err) {
      setError(err?.response?.data?.detail || "Failed to send STK push.");
      setStep("form");
    }
  };

  // Poll payment status
  useEffect(() => {
    if (step !== "pending" || !checkoutId) return;
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      if (attempts > 30) {
        clearInterval(pollRef.current);
        setStep("failed");
        setError("Payment timed out. Please try again.");
        return;
      }
      try {
        const { data } = await mpesaAPI.status(checkoutId);
        if (data.status === "success") {
          clearInterval(pollRef.current);
          setReceipt(data.mpesa_receipt_number);
          setStep("success");
          onSuccess?.();
        } else if (data.status === "failed" || data.status === "cancelled") {
          clearInterval(pollRef.current);
          setStep("failed");
          setError(data.result_desc || "Payment failed or cancelled.");
        }
      } catch { /* keep polling */ }
    }, 3000);
    return () => clearInterval(pollRef.current);
  }, [step, checkoutId, onSuccess]);

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)",
      zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{ background: "white", borderRadius: 8, width: "100%", maxWidth: 420, overflow: "hidden" }}>
        {/* Header */}
        <div style={{ background: "var(--jumia-orange)", padding: "16px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h3 style={{ color: "white", fontFamily: "'Montserrat', sans-serif", fontWeight: 800, display: "flex", alignItems: "center", gap: 8 }}>
            <i className="bi-phone-fill" /> Pay with M-Pesa
          </h3>
          <button onClick={onClose} style={{ color: "white", fontSize: "1.3rem" }}>
            <i className="bi-x-lg" />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          {step === "form" && (
            <>
              <div style={{ background: "#f0fff4", border: "1px solid #c3e6cb", borderRadius: 4, padding: 12, marginBottom: 20, fontSize: "0.85rem" }}>
                <strong>Amount:</strong> {formatPrice(order.total)} &nbsp;|&nbsp;
                <strong>Order:</strong> {order.order_number}
              </div>
              {error && <div className="alert alert-error">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>M-Pesa Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="254712345678"
                    required
                    pattern="^254[0-9]{9}$"
                    title="Enter number starting with 254 e.g. 254712345678"
                  />
                  <small style={{ color: "var(--jumia-grey)", fontSize: "0.8rem" }}>
                    Format: 254XXXXXXXXX (Safaricom number)
                  </small>
                </div>
                <button type="submit" className="btn btn-orange btn-full" style={{ padding: 14, fontSize: "1rem" }}>
                  <i className="bi-phone" /> Send STK Push
                </button>
              </form>
            </>
          )}

          {step === "pending" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: 70, height: 70, borderRadius: "50%",
                background: "var(--jumia-orange-light)", display: "flex",
                alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
                fontSize: "2rem", color: "var(--jumia-orange)",
                animation: "spin 2s linear infinite",
              }}>
                <i className="bi-phone-vibrate" />
              </div>
              <h4 style={{ fontWeight: 800, marginBottom: 8 }}>Check Your Phone</h4>
              <p style={{ color: "var(--jumia-grey)", fontSize: "0.9rem", lineHeight: 1.6 }}>
                An M-Pesa prompt has been sent to <strong>{phone}</strong>.<br />
                Enter your M-Pesa PIN to complete payment.
              </p>
              <div className="spinner" style={{ width: 24, height: 24, marginTop: 20 }} />
              <p style={{ fontSize: "0.8rem", color: "var(--jumia-grey)", marginTop: 8 }}>Waiting for confirmation...</p>
            </div>
          )}

          {step === "success" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: 70, height: 70, borderRadius: "50%",
                background: "#e8f5e9", display: "flex",
                alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
                fontSize: "2rem", color: "var(--jumia-green)",
              }}>
                <i className="bi-check-circle-fill" />
              </div>
              <h4 style={{ fontWeight: 800, color: "var(--jumia-green)", marginBottom: 8 }}>Payment Successful!</h4>
              {receipt && (
                <p style={{ fontSize: "0.85rem", color: "#555" }}>
                  M-Pesa Receipt: <strong>{receipt}</strong>
                </p>
              )}
              <button className="btn btn-orange btn-full" style={{ marginTop: 20 }} onClick={onClose}>
                View Order
              </button>
            </div>
          )}

          {step === "failed" && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{
                width: 70, height: 70, borderRadius: "50%",
                background: "#ffebee", display: "flex",
                alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
                fontSize: "2rem", color: "var(--jumia-red)",
              }}>
                <i className="bi-x-circle-fill" />
              </div>
              <h4 style={{ fontWeight: 800, color: "var(--jumia-red)", marginBottom: 8 }}>Payment Failed</h4>
              <p style={{ color: "#555", fontSize: "0.9rem" }}>{error}</p>
              <button className="btn btn-outline btn-full" style={{ marginTop: 20 }} onClick={() => { setStep("form"); setError(""); }}>
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
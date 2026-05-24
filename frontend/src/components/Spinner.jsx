// src/components/Spinner.jsx
export default function Spinner({ text = "Loading..." }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <div className="spinner" />
      <p style={{ color: "var(--jumia-grey)", marginTop: 12, fontSize: "0.9rem" }}>{text}</p>
    </div>
  );
}
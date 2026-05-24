// src/components/StarRating.jsx
export default function StarRating({ rating = 0, size = "md" }) {
  const sz = size === "sm" ? "0.75rem" : "1rem";
  return (
    <div style={{ display: "flex", gap: 1 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={rating >= star ? "bi-star-fill" : rating >= star - 0.5 ? "bi-star-half" : "bi-star"}
          style={{ fontSize: sz, color: "#f68b1e" }}
        />
      ))}
    </div>
  );
}
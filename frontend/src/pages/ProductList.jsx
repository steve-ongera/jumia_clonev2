import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { productAPI } from "../utils/api";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");

  const search = searchParams.get("search") || "";
  const category = searchParams.get("category") || "";
  const flashSale = searchParams.get("flash_sale") || "";
  const ordering = searchParams.get("ordering") || "-created_at";

  useEffect(() => {
    setLoading(true);
    const params = { page, ordering };
    if (search) params.search = search;
    if (category) params.category = category;
    if (flashSale) params.flash_sale = flashSale;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;

    productAPI.list(params).then(({ data }) => {
      setProducts(data.results || data);
      setCount(data.count || (data.results || data).length);
      setTotalPages(data.total_pages || 1);
    }).finally(() => setLoading(false));
  }, [search, category, flashSale, ordering, page, minPrice, maxPrice]);

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    const p = new URLSearchParams(searchParams);
    if (minPrice) p.set("min_price", minPrice); else p.delete("min_price");
    if (maxPrice) p.set("max_price", maxPrice); else p.delete("max_price");
    setSearchParams(p);
  };

  const setOrder = (val) => {
    setPage(1);
    const p = new URLSearchParams(searchParams);
    p.set("ordering", val);
    setSearchParams(p);
  };

  const SORT_OPTIONS = [
    { label: "Newest", value: "-created_at" },
    { label: "Price: Low to High", value: "price" },
    { label: "Price: High to Low", value: "-price" },
    { label: "Most Popular", value: "-average_rating" },
  ];

  return (
    <div className="container" style={{ padding: "16px" }}>
      {/* Page header */}
      <div style={{ background: "white", borderRadius: 8, padding: "16px 20px", marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, boxShadow: "var(--shadow-sm)" }}>
        <div>
          <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 800, fontSize: "1.2rem" }}>
            {search ? `Results for "${search}"` : category ? category.replace(/-/g, " ").toUpperCase() : flashSale ? "⚡ Flash Sale" : "All Products"}
          </h1>
          {!loading && <p style={{ color: "var(--jumia-grey)", fontSize: "0.85rem" }}>{count} products found</p>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: "0.85rem", fontWeight: 600 }}>Sort by:</span>
          <select value={ordering} onChange={(e) => setOrder(e.target.value)}
            style={{ padding: "6px 10px", borderRadius: 4, border: "1.5px solid var(--jumia-border)", fontSize: "0.85rem" }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Sidebar filters */}
        <aside style={{ width: 220, flexShrink: 0, background: "white", borderRadius: 8, padding: 16, boxShadow: "var(--shadow-sm)" }}>
          <h3 style={{ fontWeight: 800, marginBottom: 16, fontSize: "0.95rem" }}>
            <i className="bi-funnel-fill" style={{ color: "var(--jumia-orange)" }} /> Filters
          </h3>
          <form onSubmit={applyFilters}>
            <div className="form-group">
              <label>Min Price (KES)</label>
              <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0" min="0" />
            </div>
            <div className="form-group">
              <label>Max Price (KES)</label>
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="100000" min="0" />
            </div>
            <button type="submit" className="btn btn-orange btn-full" style={{ fontSize: "0.85rem" }}>
              Apply Filters
            </button>
            <button type="button" onClick={() => { setMinPrice(""); setMaxPrice(""); setSearchParams({}); }}
              style={{ width: "100%", marginTop: 8, padding: "8px", color: "var(--jumia-grey)", fontSize: "0.8rem", fontWeight: 600 }}>
              Clear All
            </button>
          </form>

          <div style={{ borderTop: "1px solid var(--jumia-border)", marginTop: 20, paddingTop: 16 }}>
            <h4 style={{ fontWeight: 700, marginBottom: 12, fontSize: "0.85rem" }}>Availability</h4>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.85rem", cursor: "pointer" }}>
              <input type="checkbox" checked={searchParams.get("in_stock") === "true"}
                onChange={(e) => {
                  const p = new URLSearchParams(searchParams);
                  if (e.target.checked) p.set("in_stock", "true"); else p.delete("in_stock");
                  setSearchParams(p);
                }} />
              In Stock Only
            </label>
          </div>
        </aside>

        {/* Products */}
        <div style={{ flex: 1 }}>
          {loading ? <Spinner /> : products.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "white", borderRadius: 8 }}>
              <i className="bi-search" style={{ fontSize: "3rem", color: "#ccc" }} />
              <h3 style={{ marginTop: 16, fontWeight: 700 }}>No products found</h3>
              <p style={{ color: "var(--jumia-grey)" }}>Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className="products-grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 24 }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="btn btn-outline" style={{ padding: "8px 16px" }}>
                    <i className="bi-chevron-left" /> Prev
                  </button>
                  <span style={{ padding: "8px 16px", fontWeight: 700, color: "var(--jumia-grey)" }}>
                    Page {page} of {totalPages}
                  </span>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="btn btn-orange" style={{ padding: "8px 16px" }}>
                    Next <i className="bi-chevron-right" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
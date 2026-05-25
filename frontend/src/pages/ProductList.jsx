// src/pages/ProductList.jsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { productAPI } from "../utils/api";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";

const SORT_OPTIONS = [
  { label: "Newest",             value: "-created_at" },
  { label: "Price: Low to High", value: "price" },
  { label: "Price: High to Low", value: "-price" },
  { label: "Most Popular",       value: "-average_rating" },
];

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [count,       setCount]       = useState(0);
  const [page,        setPage]        = useState(1);
  const [totalPages,  setTotalPages]  = useState(1);

  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");

  const search   = searchParams.get("search")   || "";
  const category = searchParams.get("category") || "";
  const flashSale= searchParams.get("flash_sale")|| "";
  const ordering = searchParams.get("ordering") || "-created_at";

  useEffect(() => {
    setLoading(true);
    const params = { page, ordering };
    if (search)    params.search     = search;
    if (category)  params.category   = category;
    if (flashSale) params.flash_sale = flashSale;
    if (minPrice)  params.min_price  = minPrice;
    if (maxPrice)  params.max_price  = maxPrice;

    productAPI
      .list(params)
      .then(({ data }) => {
        setProducts(data.results || data);
        setCount(data.count || (data.results || data).length);
        setTotalPages(data.total_pages || 1);
      })
      .finally(() => setLoading(false));
  }, [search, category, flashSale, ordering, page, minPrice, maxPrice]);

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    const p = new URLSearchParams(searchParams);
    if (minPrice) p.set("min_price", minPrice); else p.delete("min_price");
    if (maxPrice) p.set("max_price", maxPrice); else p.delete("max_price");
    setSearchParams(p);
  };

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setSearchParams({});
  };

  const setOrder = (val) => {
    setPage(1);
    const p = new URLSearchParams(searchParams);
    p.set("ordering", val);
    setSearchParams(p);
  };

  const pageTitle = search
    ? `Results for "${search}"`
    : category
    ? category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : flashSale
    ? "⚡ Flash Sale"
    : "All Products";

  return (
    <main className="page-main">
      <div className="container">

        {/* ── Page header ──────────────────────────────────────────────── */}
        <div className="product-list-header">
          <div>
            <h1 className="product-list-title">{pageTitle}</h1>
            {!loading && (
              <p className="product-list-count">{count} product{count !== 1 ? "s" : ""} found</p>
            )}
          </div>
          <div className="flex items-center gap-sm">
            <span className="text-sm font-600">Sort by:</span>
            <select
              className="sort-select"
              value={ordering}
              onChange={(e) => setOrder(e.target.value)}
              aria-label="Sort products"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Layout: sidebar + grid ────────────────────────────────────── */}
        <div className="product-list-layout">

          {/* Filter sidebar */}
          <aside className="filter-sidebar" aria-label="Product filters">
            <h3 className="filter-sidebar-title">
              <i className="bi bi-funnel-fill" /> Filters
            </h3>

            <form onSubmit={applyFilters}>

              {/* Price range */}
              <div className="filter-section">
                <p className="filter-section-title">Price Range (KES)</p>
                <div className="form-group mb-sm">
                  <label className="form-label text-xs">Min Price</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Max Price</label>
                  <input
                    className="form-control form-control-sm"
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="100,000"
                    min="0"
                  />
                </div>
                <button type="submit" className="btn btn-orange btn-full btn-sm">
                  Apply Filters
                </button>
              </div>

              {/* Availability */}
              <div className="filter-section">
                <p className="filter-section-title">Availability</p>
                <label
                  className="flex items-center gap-sm text-sm"
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="checkbox"
                    checked={searchParams.get("in_stock") === "true"}
                    onChange={(e) => {
                      const p = new URLSearchParams(searchParams);
                      if (e.target.checked) p.set("in_stock", "true");
                      else p.delete("in_stock");
                      setSearchParams(p);
                    }}
                    style={{ accentColor: "var(--j-orange)" }}
                  />
                  In Stock Only
                </label>
              </div>

              <button
                type="button"
                className="filter-clear-all"
                onClick={clearFilters}
              >
                Clear All Filters
              </button>
            </form>
          </aside>

          {/* Products area */}
          <div className="flex-1">
            {loading ? (
              <div className="spinner-page">
                <div className="spinner" />
                <span>Loading products…</span>
              </div>
            ) : products.length === 0 ? (
              <div className="no-results">
                <i className="bi bi-search no-results-icon" />
                <h3>No products found</h3>
                <p>Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <i className="bi bi-chevron-left" /> Prev
                    </button>

                    <span className="pagination-info">
                      Page {page} of {totalPages}
                    </span>

                    <button
                      className="btn btn-orange btn-sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next <i className="bi bi-chevron-right" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
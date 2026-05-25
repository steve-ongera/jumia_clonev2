// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productAPI, categoryAPI } from "../utils/api";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";

// ── Hero slides data ──────────────────────────────────────────────────────────
const HERO_SLIDES = [
  {
    bg: "linear-gradient(135deg, #f68b1e 0%, #e07a10 100%)",
    icon: "bi-bag-heart-fill",
    title: "Up to 70% Off",
    sub: "Flash Sale — Today Only!",
    cta: "Shop Now",
    link: "/products?flash_sale=true",
  },
  {
    bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    icon: "bi-laptop-fill",
    title: "New Electronics",
    sub: "Phones, Laptops & More",
    cta: "Browse Electronics",
    link: "/products?category=electronics",
  },
  {
    bg: "linear-gradient(135deg, #27ae60 0%, #1e8449 100%)",
    icon: "bi-bag-fill",
    title: "Fashion Week",
    sub: "Trending styles at great prices",
    cta: "Shop Fashion",
    link: "/products?category=fashion",
  },
];

// ── Services strip data ───────────────────────────────────────────────────────
const SERVICES = [
  { icon: "bi-truck",                 label: "Free Delivery",     sub: "Orders over KES 2,000" },
  { icon: "bi-shield-check",          label: "Buyer Protection",  sub: "Shop confidently" },
  { icon: "bi-arrow-counterclockwise",label: "Easy Returns",      sub: "Within 7 days" },
  { icon: "bi-headset",               label: "24/7 Support",      sub: "Always here to help" },
];

// ── Sub-components ────────────────────────────────────────────────────────────

function HeroBanner() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const slide = HERO_SLIDES[idx];

  return (
    <div
      className="hero-banner"
      style={{ background: slide.bg }}
      role="banner"
    >
      {/* Background icon */}
      <i className={`bi ${slide.icon} hero-banner-bg-icon`} aria-hidden="true" />

      {/* Content */}
      <div className="hero-banner-content">
        <h1 className="hero-banner-title">{slide.title}</h1>
        <p className="hero-banner-sub">{slide.sub}</p>
        <Link to={slide.link} className="hero-banner-cta">
          {slide.cta} <i className="bi bi-arrow-right" />
        </Link>
      </div>

      {/* Dot indicators */}
      <div className="hero-dots">
        {HERO_SLIDES.map((_, i) => (
          <button
            key={i}
            className={`hero-dot${i === idx ? " active" : ""}`}
            onClick={() => setIdx(i)}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

function ServicesStrip() {
  return (
    <div className="services-strip">
      {SERVICES.map((s) => (
        <div key={s.label} className="service-card">
          <i className={`bi ${s.icon} service-icon`} aria-hidden="true" />
          <div>
            <p className="service-label">{s.label}</p>
            <p className="service-sub">{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryRow({ categories }) {
  return (
    <div className="category-section">
      <div className="section-heading">
        <i className="bi bi-grid-fill section-icon" />
        <h2>Shop by Category</h2>
      </div>
      <div className="category-grid">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.slug}`}
            className="category-tile"
          >
            <div className="category-tile-icon">
              <i className={`bi ${cat.icon || "bi-grid"}`} />
            </div>
            <span className="category-tile-name">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function SectionHeading({ icon, title, viewAllLink }) {
  return (
    <div className="section-heading">
      <i className={`bi ${icon} section-icon`} aria-hidden="true" />
      <h2>{title}</h2>
      {viewAllLink && (
        <Link to={viewAllLink} className="view-all">
          View All <i className="bi bi-arrow-right" />
        </Link>
      )}
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [products,   setProducts]   = useState([]);
  const [flashSale,  setFlashSale]  = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    Promise.all([
      productAPI.list({ page_size: 10 }),
      productAPI.flashSale(),
      categoryAPI.list(),
    ])
      .then(([p, f, c]) => {
        setProducts(p.data.results   || p.data);
        setFlashSale(f.data.results  || f.data);
        setCategories(c.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="page-main">
      <div className="container">

        <HeroBanner />
        <ServicesStrip />

        {loading ? (
          <div className="spinner-page">
            <div className="spinner" />
            <span>Loading products…</span>
          </div>
        ) : (
          <>
            {categories.length > 0 && <CategoryRow categories={categories} />}

            {/* Flash Sale */}
            {flashSale.length > 0 && (
              <section className="page-section" aria-label="Flash Sale">
                <SectionHeading
                  icon="bi-lightning-fill"
                  title="Flash Sale"
                  viewAllLink="/products?flash_sale=true"
                />
                <div className="products-grid">
                  {flashSale.slice(0, 5).map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              </section>
            )}

            {/* Featured Products */}
            <section className="page-section" aria-label="Featured Products">
              <SectionHeading
                icon="bi-star-fill"
                title="Featured Products"
                viewAllLink="/products"
              />
              <div className="products-grid">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </section>
          </>
        )}

      </div>
    </main>
  );
}
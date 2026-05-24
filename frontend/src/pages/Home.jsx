import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productAPI, categoryAPI } from "../utils/api";
import ProductCard from "../components/ProductCard";
import Spinner from "../components/Spinner";

const HERO_SLIDES = [
  { bg: "linear-gradient(135deg, #f68b1e 0%, #e07a10 100%)", title: "Up to 70% Off", sub: "Flash Sale — Today Only!", cta: "Shop Now", link: "/products?flash_sale=true" },
  { bg: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)", title: "New Electronics", sub: "Phones, Laptops & More", cta: "Browse Electronics", link: "/products?category=electronics" },
  { bg: "linear-gradient(135deg, #27ae60 0%, #1e8449 100%)", title: "Fashion Week", sub: "Trending styles at great prices", cta: "Shop Fashion", link: "/products?category=fashion" },
];

function HeroBanner() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);
  const slide = HERO_SLIDES[idx];
  return (
    <div style={{ background: slide.bg, borderRadius: 8, padding: "60px 40px", marginBottom: 24, transition: "background 0.5s", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", right: 40, top: "50%", transform: "translateY(-50%)", opacity: 0.08, fontSize: "12rem", color: "white" }}>
        <i className="bi-bag-heart-fill" />
      </div>
      <h1 style={{ fontFamily: "'Montserrat', sans-serif", fontWeight: 900, fontSize: "clamp(1.8rem, 4vw, 3rem)", color: "white", marginBottom: 8 }}>
        {slide.title}
      </h1>
      <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.1rem", marginBottom: 24 }}>{slide.sub}</p>
      <Link to={slide.link} style={{
        display: "inline-block", background: "white", color: "var(--jumia-orange)",
        padding: "12px 28px", borderRadius: 4, fontWeight: 800, fontSize: "1rem",
      }}>
        {slide.cta} <i className="bi-arrow-right" />
      </Link>
      {/* Dots */}
      <div style={{ position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 6 }}>
        {HERO_SLIDES.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} style={{
            width: i === idx ? 20 : 8, height: 8, borderRadius: 4,
            background: i === idx ? "white" : "rgba(255,255,255,0.5)",
            transition: "all 0.3s",
          }} />
        ))}
      </div>
    </div>
  );
}

function CategoryRow({ categories }) {
  return (
    <div style={{ background: "white", borderRadius: 8, padding: "20px", marginBottom: 24, boxShadow: "var(--shadow-sm)" }}>
      <div className="section-heading" style={{ marginBottom: 20 }}>
        <h2>Shop by Category</h2>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(90px, 1fr))", gap: 12 }}>
        {categories.map(cat => (
          <Link key={cat.id} to={`/products?category=${cat.slug}`} style={{ textAlign: "center", padding: "12px 8px", borderRadius: 8, transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--jumia-orange-light)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <div style={{ width: 50, height: 50, borderRadius: "50%", background: "var(--jumia-orange-light)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 8px", fontSize: "1.4rem", color: "var(--jumia-orange)" }}>
              <i className={`bi ${cat.icon || "bi-grid"}`} />
            </div>
            <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#333", lineHeight: 1.3 }}>{cat.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [flashSale, setFlashSale] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productAPI.list({ page_size: 10 }),
      productAPI.flashSale(),
      categoryAPI.list(),
    ]).then(([p, f, c]) => {
      setProducts(p.data.results || p.data);
      setFlashSale(f.data.results || f.data);
      setCategories(c.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="container" style={{ padding: "16px" }}>
      <HeroBanner />

      {/* Services strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { icon: "bi-truck", label: "Free Delivery", sub: "Orders over KES 2,000" },
          { icon: "bi-shield-check", label: "Buyer Protection", sub: "Shop confidently" },
          { icon: "bi-arrow-counterclockwise", label: "Easy Returns", sub: "Within 7 days" },
          { icon: "bi-headset", label: "24/7 Support", sub: "Always here to help" },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px" }}>
            <i className={`bi ${s.icon}`} style={{ fontSize: "1.6rem", color: "var(--jumia-orange)" }} />
            <div>
              <p style={{ fontWeight: 700, fontSize: "0.85rem" }}>{s.label}</p>
              <p style={{ fontSize: "0.75rem", color: "var(--jumia-grey)" }}>{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {loading ? <Spinner /> : (
        <>
          {categories.length > 0 && <CategoryRow categories={categories} />}

          {/* Flash Sale */}
          {flashSale.length > 0 && (
            <div style={{ marginBottom: 32 }}>
              <div className="section-heading">
                <i className="bi-lightning-fill" style={{ color: "var(--jumia-orange)", fontSize: "1.4rem" }} />
                <h2>Flash Sale</h2>
                <Link to="/products?flash_sale=true" className="view-all">View All <i className="bi-arrow-right" /></Link>
              </div>
              <div className="products-grid">
                {flashSale.slice(0, 5).map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            </div>
          )}

          {/* Featured Products */}
          <div style={{ marginBottom: 32 }}>
            <div className="section-heading">
              <i className="bi-star-fill" style={{ color: "var(--jumia-orange)", fontSize: "1.4rem" }} />
              <h2>Featured Products</h2>
              <Link to="/products" className="view-all">View All <i className="bi-arrow-right" /></Link>
            </div>
            <div className="products-grid">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
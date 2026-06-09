import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import ProductCard from "../components/ProductCard";

function HomePage() {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";

  // Fetch featured products (only on first load, no filters)
  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data } = await api.get("/products?featured=true&pageSize=4");
        setFeaturedProducts(data.products);
      } catch (err) {
        console.error("Failed to fetch featured products", err);
      }
    };
    fetchFeatured();
  }, []);

  // Fetch products with filters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (keyword) params.set("keyword", keyword);
        if (category) params.set("category", category);
        if (sort) params.set("sort", sort);
        params.set("page", page);
        params.set("pageSize", 12);

        const { data } = await api.get(`/products?${params.toString()}`);
        setProducts(data.products);
        setPages(data.pages);
        setTotalProducts(data.totalProducts);
        if (data.categories) setCategories(data.categories);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword, category, sort, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [keyword, category, sort]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    setSearchParams(params);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchParams({});
    setPage(1);
  };

  const hasFilters = keyword || category || sort;

  return (
    <div className="home-page">
      {/* Featured Banner — only show on clean homepage */}
      {!hasFilters && featuredProducts.length > 0 && (
        <div className="featured-section">
          <div className="featured-banner">
            <div className="featured-banner__text">
              <h2>Featured Products</h2>
              <p>Top picks curated for you</p>
            </div>
            <div className="featured-banner__grid">
              {featuredProducts.slice(0, 4).map((product) => (
                <Link
                  key={product._id}
                  to={`/products/${product._id}`}
                  className="featured-item"
                >
                  <img
                    src={product.images?.[0]?.url}
                    alt={product.name}
                    className="featured-item__image"
                  />
                  <div className="featured-item__info">
                    <span className="featured-item__name">{product.name}</span>
                    <span className="featured-item__price">₹{product.discountPrice || product.price}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toolbar: Category Filter + Sort + Search Info */}
      <div className="home-toolbar">
        <div className="home-toolbar__left">
          {keyword && (
            <div className="search-info">
              Results for "<strong>{keyword}</strong>"
              <button onClick={() => updateFilter("keyword", "")} className="search-info__clear">✕</button>
            </div>
          )}

          {/* Category Tabs */}
          <div className="category-tabs">
            <button
              className={`category-tab ${!category ? "category-tab--active" : ""}`}
              onClick={() => updateFilter("category", "")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`category-tab ${category === cat ? "category-tab--active" : ""}`}
                onClick={() => updateFilter("category", cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="home-toolbar__right">
          <span className="product-count">{totalProducts} products</span>
          <select
            className="sort-select"
            value={sort}
            onChange={(e) => updateFilter("sort", e.target.value)}
          >
            <option value="">Sort: Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating">Rating: High to Low</option>
            <option value="newest">Newest First</option>
          </select>

          {hasFilters && (
            <button onClick={clearFilters} className="btn btn--outline btn--sm">
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📦</div>
          <h2>No products found</h2>
          <p>{keyword ? "Try a different search term" : "Check back soon!"}</p>
          {hasFilters && (
            <button onClick={clearFilters} className="btn btn--blue">Clear Filters</button>
          )}
        </div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="pagination">
              <button
                className="pagination__btn"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                ← Previous
              </button>

              {[...Array(pages).keys()].map((x) => (
                <button
                  key={x + 1}
                  className={`pagination__btn pagination__num ${page === x + 1 ? "pagination__num--active" : ""}`}
                  onClick={() => setPage(x + 1)}
                >
                  {x + 1}
                </button>
              ))}

              <button
                className="pagination__btn"
                disabled={page >= pages}
                onClick={() => setPage(page + 1)}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default HomePage;
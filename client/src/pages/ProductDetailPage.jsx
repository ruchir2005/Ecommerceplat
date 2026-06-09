import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState("");

  // Review form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) { navigate("/login"); return; }
    setAdding(true);
    setMessage("");
    try {
      await addToCart(product._id);
      setMessage("Added to cart!");
      setTimeout(() => setMessage(""), 2000);
    } catch {
      setMessage("Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) { navigate("/login"); return; }
    try {
      await addToCart(product._id);
      navigate("/cart");
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) { navigate("/login"); return; }
    setSubmittingReview(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setComment("");
      setRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading product...</p>
      </div>
    );
  }

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="product-detail">
      <div className="product-detail__layout">
        {/* Image Section */}
        <div className="product-detail__image-section">
          <img
            src={product.images?.[0]?.url}
            alt={product.name}
            className="product-detail__image"
          />
          <div className="product-detail__actions">
            <button
              onClick={handleAddToCart}
              disabled={adding || product.stock === 0}
              className="btn btn--yellow"
            >
              {adding ? "Adding..." : "🛒 Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="btn btn--primary"
              style={{ width: "auto" }}
            >
              ⚡ Buy Now
            </button>
          </div>
        </div>

        {/* Info Section */}
        <div className="product-detail__info">
          <h1 className="product-detail__name">{product.name}</h1>

          <div className="product-detail__rating">
            <span className="product-detail__rating-badge">⭐ {product.ratings}</span>
            <span>{product.numReviews} Reviews</span>
            <span>|</span>
            <span>Brand: {product.brand}</span>
          </div>

          {message && (
            <div className={`product-detail__message ${message.includes("Failed") ? "product-detail__message--error" : "product-detail__message--success"}`}>
              {message}
            </div>
          )}

          <div className="product-detail__price-section">
            <span className="product-detail__price">₹{displayPrice}</span>
            {hasDiscount && (
              <>
                <span className="product-detail__price-original">₹{product.price}</span>
                <span className="product-detail__discount">{discountPercent}% off</span>
              </>
            )}
          </div>

          <p className={`product-detail__stock ${product.stock > 0 ? "product-detail__stock--in" : "product-detail__stock--out"}`}>
            {product.stock > 0 ? `In Stock (${product.stock} available)` : "Out of Stock"}
          </p>

          <p className="product-detail__description">{product.description}</p>

          <div className="product-detail__meta">
            <span>Category: {product.category}</span>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <h2>Reviews ({product.numReviews})</h2>

        {user && (
          <form onSubmit={handleSubmitReview} className="review-form">
            <h3>Write a Review</h3>
            <div className="form-group">
              <label>Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(Number(e.target.value))}
                className="form-input"
                style={{ maxWidth: "200px" }}
              >
                <option value={5}>5 — Excellent</option>
                <option value={4}>4 — Good</option>
                <option value={3}>3 — Average</option>
                <option value={2}>2 — Poor</option>
                <option value={1}>1 — Terrible</option>
              </select>
            </div>
            <div className="form-group">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review..."
                required
                rows={3}
                className="form-input"
                style={{ resize: "vertical" }}
              />
            </div>
            <button type="submit" disabled={submittingReview} className="btn btn--blue btn--sm">
              {submittingReview ? "Submitting..." : "Submit Review"}
            </button>
          </form>
        )}

        {product.reviews?.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", marginTop: "16px" }}>No reviews yet. Be the first to review!</p>
        ) : (
          product.reviews?.map((review, idx) => (
            <div key={idx} className="review-item">
              <div className="review-header">
                <span className={`review-rating-badge ${
                  review.rating >= 4 ? "review-rating-badge--good" :
                  review.rating >= 3 ? "review-rating-badge--mid" : "review-rating-badge--bad"
                }`}>
                  ⭐ {review.rating}
                </span>
                <span className="review-name">{review.name}</span>
                <span className="review-date">{new Date(review.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ProductDetailPage;
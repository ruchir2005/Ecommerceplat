import { Link } from "react-router-dom";

function ProductCard({ product }) {
  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const displayPrice = hasDiscount ? product.discountPrice : product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <Link to={`/products/${product._id}`} className="product-card">
      <img
        src={product.images?.[0]?.url}
        alt={product.name}
        className="product-card__image"
      />

      <h3 className="product-card__name">{product.name}</h3>

      <div className="product-card__price">
        <span className="product-card__price-current">₹{displayPrice}</span>
        {hasDiscount && (
          <>
            <span className="product-card__price-original">₹{product.price}</span>
            <span className="product-card__price-discount">{discountPercent}% off</span>
          </>
        )}
      </div>

      <p className="product-card__rating">⭐ {product.ratings} ({product.numReviews})</p>
    </Link>
  );
}

export default ProductCard;
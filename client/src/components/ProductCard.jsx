import { Link } from "react-router-dom";

function ProductCard({ product }) {
  return (
    <div>
      <img
        src={product.images?.[0]?.url}
        alt={product.name}
        width="200"
      />

      <h3>{product.name}</h3>

      <p>₹{product.price}</p>

      <p>⭐ {product.ratings}</p>

      <Link to={`/products/${product._id}`}>
        View Details
      </Link>
    </div>
  );
}

export default ProductCard;
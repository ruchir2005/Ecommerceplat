import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Link, useNavigate } from "react-router-dom";

function CartPage() {
  const { cart, loading, updateQuantity, removeItem } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔒</div>
        <h2>Please login to view your cart</h2>
        <Link to="/login" className="btn btn--blue">Login</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading cart...</p>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add some products to get started!</p>
        <Link to="/" className="btn btn--blue">Shop Now</Link>
      </div>
    );
  }

  const itemsPrice = items.reduce((total, item) => {
    const price = item.product?.discountPrice || item.product?.price || 0;
    return total + price * item.quantity;
  }, 0);
  const shippingPrice = itemsPrice > 500 ? 0 : 40;
  const taxPrice = Math.round(itemsPrice * 0.18);
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  const handleQuantityChange = async (itemId, newQty) => {
    if (newQty < 1) return;
    try {
      await updateQuantity(itemId, newQty);
    } catch {
      toast.error("Failed to update quantity");
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
    } catch {
      toast.error("Failed to remove item");
    }
  };

  return (
    <div className="cart-page">
      <h1>Shopping Cart ({items.length} {items.length === 1 ? "item" : "items"})</h1>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items">
          {items.map((item) => (
            <div key={item._id} className="cart-item">
              <img
                src={item.product?.images?.[0]?.url}
                alt={item.product?.name}
                className="cart-item__image"
              />

              <div className="cart-item__info">
                <h3 className="cart-item__name">
                  <Link to={`/products/${item.product?._id}`}>
                    {item.product?.name}
                  </Link>
                </h3>

                <div className="cart-item__price">
                  ₹{item.product?.discountPrice || item.product?.price}
                  {item.product?.discountPrice > 0 && item.product?.discountPrice < item.product?.price && (
                    <span className="cart-item__price-original">₹{item.product?.price}</span>
                  )}
                </div>

                <div className="cart-item__controls">
                  <button
                    onClick={() => handleQuantityChange(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="qty-btn"
                  >
                    −
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button
                    onClick={() => handleQuantityChange(item._id, item.quantity + 1)}
                    className="qty-btn"
                  >
                    +
                  </button>

                  <button onClick={() => handleRemove(item._id)} className="btn btn--danger-text" style={{ marginLeft: "12px" }}>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Summary */}
        <div className="price-summary">
          <h3>Price Details</h3>

          <div className="price-summary__row">
            <span>Price ({items.length} items)</span>
            <span>₹{itemsPrice}</span>
          </div>

          <div className="price-summary__row">
            <span>Delivery Charges</span>
            <span className={shippingPrice === 0 ? "price-summary__row--free" : ""}>
              {shippingPrice === 0 ? "FREE" : `₹${shippingPrice}`}
            </span>
          </div>

          <div className="price-summary__row">
            <span>Tax (GST 18%)</span>
            <span>₹{taxPrice}</span>
          </div>

          <div className="price-summary__total">
            <span>Total Amount</span>
            <span>₹{totalPrice}</span>
          </div>

          <button onClick={() => navigate("/checkout")} className="btn btn--primary btn--full">
            Place Order
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartPage;

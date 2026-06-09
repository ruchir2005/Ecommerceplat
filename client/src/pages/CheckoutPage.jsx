import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import api from "../api/axios";

// Helper function to load Razorpay script
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function CheckoutPage() {
  const { cart, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [address, setAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [placing, setPlacing] = useState(false);

  if (!user) {
    navigate("/login");
    return null;
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Add items to your cart before checkout.</p>
        <button onClick={() => navigate("/")} className="btn btn--blue">Shop Now</button>
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

  const handleAddressChange = (e) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const handlePaymentSuccess = async (response, orderId) => {
    try {
      await api.post("/payment/verify", {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        order_id: orderId,
      });
      toast.success("Payment successful!");
      await clearCart();
      navigate(`/orders/${orderId}`);
    } catch (error) {
      console.error("Payment verification failed", error);
      toast.error("Payment verification failed.");
      navigate(`/orders/${orderId}`);
    }
  };

  const processOnlinePayment = async (orderId) => {
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error("Failed to load Razorpay SDK. Are you online?");
      navigate(`/orders/${orderId}`);
      return;
    }

    try {
      // 1. Get Razorpay Key ID
      const { data: config } = await api.get("/payment/config");
      const key_id = config.clientId;

      // 2. Create Razorpay order
      const { data: rzpOrder } = await api.post("/payment/create", { amount: totalPrice });

      // 3. Open Razorpay Modal
      const options = {
        key: key_id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "ECplatform",
        description: "Order Payment",
        order_id: rzpOrder.id,
        handler: function (response) {
          handlePaymentSuccess(response, orderId);
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: address.phone,
        },
        theme: {
          color: "#2874f0",
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled. You can pay later from Order Details.");
            clearCart().then(() => navigate(`/orders/${orderId}`));
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Error initiating payment.");
      navigate(`/orders/${orderId}`);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!address.fullName || !address.phone || !address.addressLine1 || !address.city || !address.state || !address.pincode) {
      toast.error("Please fill in all required address fields");
      return;
    }

    setPlacing(true);
    try {
      const orderItems = items.map((item) => ({
        product: item.product._id,
        name: item.product.name,
        image: item.product.images?.[0]?.url || "",
        price: item.product.discountPrice || item.product.price,
        quantity: item.quantity,
      }));

      // Create Order in DB
      const { data: order } = await api.post("/orders", {
        orderItems,
        shippingAddress: address,
        paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
      });

      if (paymentMethod === "COD") {
        await clearCart();
        toast.success("Order placed successfully!");
        navigate(`/orders/${order._id}`);
      } else {
        // Process Razorpay Payment
        processOnlinePayment(order._id);
      }
    } catch (error) {
      console.error("Failed to place order", error);
      toast.error(error.response?.data?.message || "Failed to place order");
      setPlacing(false);
    }
  };

  const paymentOptions = [
    { value: "COD", label: "💵 Cash on Delivery", desc: "Pay when you receive" },
    { value: "Card", label: "💳 Credit / Debit Card", desc: "Visa, Mastercard, RuPay via Razorpay" },
    { value: "UPI", label: "📱 UPI", desc: "Google Pay, PhonePe, Paytm via Razorpay" },
    { value: "NetBanking", label: "🏦 Net Banking", desc: "All major banks via Razorpay" },
  ];

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="checkout-layout">
        {/* Left Column */}
        <div className="checkout-form">
          {/* Shipping Address */}
          <div className="checkout-section">
            <h2>📍 Shipping Address</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" name="fullName" className="form-input" placeholder="Full Name" value={address.fullName} onChange={handleAddressChange} required />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input type="tel" name="phone" className="form-input" placeholder="Phone Number" value={address.phone} onChange={handleAddressChange} required />
              </div>
            </div>

            <div className="form-group">
              <label>Address Line 1</label>
              <input type="text" name="addressLine1" className="form-input" placeholder="House no, Building, Street" value={address.addressLine1} onChange={handleAddressChange} required />
            </div>

            <div className="form-group">
              <label>Address Line 2</label>
              <input type="text" name="addressLine2" className="form-input" placeholder="Area, Colony (optional)" value={address.addressLine2} onChange={handleAddressChange} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" className="form-input" placeholder="City" value={address.city} onChange={handleAddressChange} required />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" name="state" className="form-input" placeholder="State" value={address.state} onChange={handleAddressChange} required />
              </div>
              <div className="form-group">
                <label>Pincode</label>
                <input type="text" name="pincode" className="form-input" placeholder="Pincode" value={address.pincode} onChange={handleAddressChange} required />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="checkout-section">
            <h2>💳 Payment Method</h2>
            {paymentOptions.map((opt) => (
              <label
                key={opt.value}
                className={`payment-option ${paymentMethod === opt.value ? "payment-option--selected" : ""}`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={opt.value}
                  checked={paymentMethod === opt.value}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <div>
                  <div style={{ fontWeight: 600 }}>{opt.label}</div>
                  <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="order-summary-sidebar">
          <div className="price-summary">
            <h3>Order Summary</h3>

            {items.map((item) => (
              <div key={item._id} className="order-summary-item">
                <span>{item.product?.name} × {item.quantity}</span>
                <span style={{ fontWeight: 600, flexShrink: 0 }}>₹{(item.product?.discountPrice || item.product?.price) * item.quantity}</span>
              </div>
            ))}

            <div style={{ borderTop: "1px solid var(--border-light)", marginTop: "12px", paddingTop: "12px" }}>
              <div className="price-summary__row">
                <span>Items Total</span>
                <span>₹{itemsPrice}</span>
              </div>
              <div className="price-summary__row">
                <span>Shipping</span>
                <span style={{ color: shippingPrice === 0 ? "var(--success)" : "inherit" }}>
                  {shippingPrice === 0 ? "FREE" : `₹${shippingPrice}`}
                </span>
              </div>
              <div className="price-summary__row">
                <span>Tax (GST 18%)</span>
                <span>₹{taxPrice}</span>
              </div>
            </div>

            <div className="price-summary__total">
              <span>Total</span>
              <span>₹{totalPrice}</span>
            </div>

            <button type="submit" disabled={placing} className="btn btn--primary btn--full">
              {placing ? "Placing Order..." : (paymentMethod === "COD" ? "Place Order" : "Proceed to Pay")}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CheckoutPage;

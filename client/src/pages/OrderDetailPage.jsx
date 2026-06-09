import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paying, setPaying] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${id}`);
      setOrder(data);
    } catch (err) {
      console.error("Failed to fetch order", err);
      setError(err.response?.data?.message || "Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handlePaymentSuccess = async (response) => {
    try {
      await api.post("/payment/verify", {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        order_id: id,
      });
      toast.success("Payment successful!");
      fetchOrder(); // refresh order
    } catch (error) {
      console.error("Payment verification failed", error);
      toast.error("Payment verification failed.");
    } finally {
      setPaying(false);
    }
  };

  const handlePayNow = async () => {
    setPaying(true);
    const res = await loadRazorpayScript();
    if (!res) {
      toast.error("Failed to load Razorpay SDK. Are you online?");
      setPaying(false);
      return;
    }

    try {
      // 1. Get Razorpay Key ID
      const { data: config } = await api.get("/payment/config");
      const key_id = config.clientId;

      // 2. Create Razorpay order
      const { data: rzpOrder } = await api.post("/payment/create", { amount: order.totalPrice });

      // 3. Open Razorpay Modal
      const options = {
        key: key_id,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "ECplatform",
        description: "Order Payment",
        order_id: rzpOrder.id,
        handler: function (response) {
          handlePaymentSuccess(response);
        },
        prefill: {
          name: user?.name,
          email: user?.email,
          contact: order.shippingAddress?.phone,
        },
        theme: {
          color: "#2874f0",
        },
        modal: {
          ondismiss: function () {
            toast.info("Payment cancelled.");
            setPaying(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Error initiating payment.");
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading order details...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">❌</div>
        <h2>{error || "Order not found"}</h2>
        <Link to="/orders" className="btn btn--blue">Back to Orders</Link>
      </div>
    );
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "Processing": return "status-badge--processing";
      case "Shipped": return "status-badge--shipped";
      case "Delivered": return "status-badge--delivered";
      case "Cancelled": return "status-badge--cancelled";
      default: return "";
    }
  };

  const statusSteps = ["Processing", "Shipped", "Delivered"];
  const currentStepIndex = statusSteps.indexOf(order.orderStatus);

  return (
    <div className="order-detail">
      <Link to="/orders" className="order-detail__back">← Back to Orders</Link>

      <h1>Order Details</h1>

      {/* Status Card */}
      <div className="order-detail__status-card">
        <div className="order-detail__status-header">
          <div className="order-card__id">
            Order ID: <span>{order._id}</span>
          </div>
          <span className={`status-badge ${getStatusClass(order.orderStatus)}`}>
            {order.orderStatus}
          </span>
        </div>

        {/* Progress Bar */}
        {order.orderStatus !== "Cancelled" && (
          <div className="order-detail__progress">
            <div className="order-detail__progress-track" />
            {statusSteps.map((step, idx) => (
              <div key={step} className="order-detail__progress-step">
                <div className={`order-detail__progress-circle ${
                  idx <= currentStepIndex
                    ? "order-detail__progress-circle--active"
                    : "order-detail__progress-circle--inactive"
                }`}>
                  {idx <= currentStepIndex ? "✓" : idx + 1}
                </div>
                <span className="order-detail__progress-label">{step}</span>
              </div>
            ))}
          </div>
        )}

        <div className="order-detail__placed-date">
          Placed on:{" "}
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>

      {/* Content */}
      <div className="order-detail__content">
        {/* Items */}
        <div className="order-detail__items-section">
          <div className="order-detail__card">
            <h3>Items</h3>
            {order.orderItems?.map((item, idx) => (
              <div key={idx} className="order-detail__item">
                {item.image && (
                  <img src={item.image} alt={item.name} className="order-detail__item-image" />
                )}
                <div className="order-detail__item-info">
                  <div className="order-detail__item-name">{item.name}</div>
                  <div className="order-detail__item-qty">Qty: {item.quantity} × ₹{item.price}</div>
                </div>
                <div className="order-detail__item-total">₹{item.quantity * item.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="order-detail__sidebar">
          {/* Shipping Address */}
          <div className="order-detail__card">
            <h3>Shipping Address</h3>
            <div className="order-detail__address">
              <strong>{order.shippingAddress?.fullName}</strong>
              <br />
              {order.shippingAddress?.addressLine1}
              <br />
              {order.shippingAddress?.addressLine2 && (
                <>{order.shippingAddress.addressLine2}<br /></>
              )}
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              <br />
              Phone: {order.shippingAddress?.phone}
            </div>
          </div>

          {/* Payment */}
          <div className="order-detail__card">
            <h3>Payment</h3>
            <p style={{ margin: "0 0 8px", fontSize: "14px" }}>
              Method: <strong>{order.paymentMethod === "COD" ? "Cash on Delivery" : order.paymentMethod}</strong>
            </p>
            <p style={{ margin: 0, color: order.isPaid ? "var(--success)" : "var(--warning)", fontSize: "14px", fontWeight: 600 }}>
              {order.isPaid ? `Paid on ${new Date(order.paidAt).toLocaleDateString()}` : "Payment Pending"}
            </p>
            
            {!order.isPaid && order.paymentMethod !== "COD" && order.orderStatus !== "Cancelled" && (
              <button 
                onClick={handlePayNow} 
                disabled={paying}
                className="btn btn--blue btn--full" 
                style={{ marginTop: "12px" }}
              >
                {paying ? "Opening Payment Gateway..." : "Pay Now"}
              </button>
            )}
          </div>

          {/* Price Details */}
          <div className="price-summary" style={{ position: "static" }}>
            <h3>Price Details</h3>
            <div className="price-summary__row">
              <span>Items</span>
              <span>₹{order.itemsPrice}</span>
            </div>
            <div className="price-summary__row">
              <span>Shipping</span>
              <span>₹{order.shippingPrice}</span>
            </div>
            <div className="price-summary__row">
              <span>Tax</span>
              <span>₹{order.taxPrice}</span>
            </div>
            <div className="price-summary__total">
              <span>Total</span>
              <span>₹{order.totalPrice}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailPage;

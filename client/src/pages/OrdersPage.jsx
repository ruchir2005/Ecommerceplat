import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get("/orders/myorders");
        setOrders(data);
      } catch (error) {
        console.error("Failed to fetch orders", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrders();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">🔒</div>
        <h2>Please login to view your orders</h2>
        <Link to="/login" className="btn btn--blue">Login</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">📦</div>
        <h2>No orders yet</h2>
        <p>Start shopping to see your orders here!</p>
        <Link to="/" className="btn btn--blue">Shop Now</Link>
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

  return (
    <div className="orders-page">
      <h1>My Orders</h1>

      {orders.map((order) => (
        <Link key={order._id} to={`/orders/${order._id}`} className="order-card">
          <div className="order-card__header">
            <div className="order-card__id">
              Order ID: <span>{order._id}</span>
            </div>
            <span className={`status-badge ${getStatusClass(order.orderStatus)}`}>
              {order.orderStatus}
            </span>
          </div>

          <div className="order-card__body">
            <div className="order-card__items">
              {order.orderItems?.map((item, idx) => (
                <div key={idx} className="order-card__item">
                  {item.image && (
                    <img src={item.image} alt={item.name} className="order-card__item-image" />
                  )}
                  <div>
                    <div className="order-card__item-name">{item.name}</div>
                    <div className="order-card__item-qty">Qty: {item.quantity} × ₹{item.price}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-card__footer">
              <span className="order-card__date">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="order-card__total">₹{order.totalPrice}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

export default OrdersPage;

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/admin/dashboard");
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="loading-state"><div className="spinner"></div><p>Loading dashboard...</p></div>;
  }

  if (!stats) {
    return <div className="empty-state"><h2>Failed to load dashboard</h2></div>;
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
    <div>
      <h1>Dashboard</h1>

      <div className="admin-stats">
        <div className="stat-card">
          <span className="stat-card__icon">💰</span>
          <div className="stat-card__label">Total Revenue</div>
          <div className="stat-card__value">₹{stats.totalRevenue?.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon">🧾</span>
          <div className="stat-card__label">Total Orders</div>
          <div className="stat-card__value">{stats.totalOrders}</div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon">📦</span>
          <div className="stat-card__label">Total Products</div>
          <div className="stat-card__value">{stats.totalProducts}</div>
        </div>
        <div className="stat-card">
          <span className="stat-card__icon">👥</span>
          <div className="stat-card__label">Total Users</div>
          <div className="stat-card__value">{stats.totalUsers}</div>
        </div>
      </div>

      {/* Order Status Overview */}
      <div className="admin-stats" style={{ marginBottom: "24px" }}>
        {Object.entries(stats.orderStatusCounts).map(([status, count]) => (
          <div className="stat-card" key={status}>
            <div className="stat-card__label">{status}</div>
            <div className="stat-card__value">{count}</div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <h2>Recent Orders</h2>
          <Link to="/admin/orders" className="btn btn--blue btn--sm">View All</Link>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentOrders?.map((order) => (
              <tr key={order._id}>
                <td style={{ fontSize: "12px" }}>{order._id}</td>
                <td>{order.user?.name || "Deleted User"}</td>
                <td style={{ fontWeight: 600 }}>₹{order.totalPrice}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(order.orderStatus)}`}>
                    {order.orderStatus}
                  </span>
                </td>
                <td style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;

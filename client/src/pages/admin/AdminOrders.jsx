import { useEffect, useState } from "react";
import api from "../../api/axios";
import { useToast } from "../../context/ToastContext";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchOrders = async () => {
    try {
      const { data } = await api.get("/admin/orders");
      setOrders(data);
    } catch { toast.error("Failed to load orders"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
      fetchOrders();
    } catch {
      toast.error("Failed to update order status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await api.delete(`/admin/orders/${id}`);
      toast.success("Order deleted");
      fetchOrders();
    } catch { toast.error("Failed to delete order"); }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Processing": return "status-badge--processing";
      case "Shipped": return "status-badge--shipped";
      case "Delivered": return "status-badge--delivered";
      case "Cancelled": return "status-badge--cancelled";
      default: return "";
    }
  };

  if (loading) {
    return <div className="loading-state"><div className="spinner"></div><p>Loading orders...</p></div>;
  }

  return (
    <div>
      <h1>Manage Orders</h1>

      <div className="admin-table-wrapper">
        <div className="admin-table-header">
          <span>{orders.length} orders</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Paid</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td style={{ fontSize: "11px", maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis" }}>{order._id}</td>
                <td>{order.user?.name || "Deleted"}</td>
                <td>{order.orderItems?.length}</td>
                <td style={{ fontWeight: 600 }}>₹{order.totalPrice}</td>
                <td>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="sort-select"
                    style={{ fontSize: "12px", padding: "4px 8px" }}
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <span style={{ color: order.isPaid ? "var(--success)" : "var(--warning)", fontWeight: 600, fontSize: "13px" }}>
                    {order.isPaid ? "✓ Paid" : "Pending"}
                  </span>
                </td>
                <td style={{ fontSize: "13px", color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td>
                  <button onClick={() => handleDelete(order._id)} className="btn btn--danger-text btn--sm">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminOrders;

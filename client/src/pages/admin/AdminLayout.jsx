import { NavLink, Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__title">⚙️ Admin Panel</div>
        <NavLink to="/admin" end className={({ isActive }) => `admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}>
          📊 Dashboard
        </NavLink>
        <NavLink to="/admin/products" className={({ isActive }) => `admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}>
          📦 Products
        </NavLink>
        <NavLink to="/admin/orders" className={({ isActive }) => `admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}>
          🧾 Orders
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => `admin-sidebar__link ${isActive ? "admin-sidebar__link--active" : ""}`}>
          👥 Users
        </NavLink>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;

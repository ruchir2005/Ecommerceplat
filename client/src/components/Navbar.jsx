import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useState } from "react";

function Navbar() {
  const { user, logoutUser } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?keyword=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        EC<span style={{ display: "inline", color: "#ffe500", fontStyle: "italic", fontSize: "22px" }}>kart</span>
        <span>Explore Plus ✦</span>
      </Link>

      <form className="navbar-search" onSubmit={handleSearch}>
        <input
          type="text"
          placeholder="Search for products, brands and more"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="navbar-search-icon">🔍</span>
      </form>

      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/profile" className="navbar-link">
              👤 {user.name?.split(' ')[0] || 'Profile'}
            </Link>
            <Link to="/orders" className="navbar-link">
              📦 Orders
            </Link>
            {user.role === "admin" && (
              <Link to="/admin" className="navbar-link">
                ⚙️ Admin
              </Link>
            )}
            <Link to="/cart" className="navbar-link navbar-link--cart">
              🛒 Cart
              {itemCount > 0 && (
                <span className="cart-badge">{itemCount}</span>
              )}
            </Link>
            <button onClick={handleLogout} className="navbar-btn navbar-btn--logout">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-btn">
              Login
            </Link>
            <Link to="/register" className="navbar-link">
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
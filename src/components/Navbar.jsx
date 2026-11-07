import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Heart, User, BookOpen, LogOut, Package } from "lucide-react";
import { useApp } from "../context/AppContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout, cartCount, wishlistCount } = useApp();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <BookOpen size={24} />
        <span>Book Worm</span>
      </Link>

      <div className="navbar-links">
        <Link to="/catalogue">My Orders</Link>
        <Link to="/wishlist">My Wishlist</Link>
        <Link to="/catalogue">My Writers</Link>
      </div>

      <div className="navbar-actions">
        <Link to="/wishlist" className="icon-btn" aria-label="Wishlist">
          <Heart size={20} />
          {wishlistCount > 0 && <span className="badge">{wishlistCount}</span>}
        </Link>

        <Link to="/cart" className="icon-btn" aria-label="Cart">
          <ShoppingCart size={20} />
          {cartCount > 0 && <span className="badge">{cartCount}</span>}
        </Link>

        {user ? (
          <div className="user-menu">
            <button className="avatar-btn" aria-label="User menu">
              <span className="avatar">{user.avatar}</span>
            </button>
            <div className="dropdown">
              <div className="dropdown-header">{user.name}</div>
              <div className="dropdown-sub">{user.email}</div>
              <div className="dropdown-divider" />
              <Link to="/orders" className="dropdown-item">
                <Package size={14} /> My Orders
              </Link>
              <button onClick={handleLogout} className="dropdown-item">
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        ) : (
          <Link to="/login" className="icon-btn" aria-label="Login">
            <User size={20} />
          </Link>
        )}
      </div>
    </nav>
  );
}

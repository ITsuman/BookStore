import { Link, useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import BookCover from "../components/BookCover";
import { useApp } from "../context/AppContext";
import "./CartPage.css";

export default function CartPage() {
  const { cart, removeFromCart, updateCartQty, user } = useApp();
  const navigate = useNavigate();

  const subtotal = cart.reduce((s, i) => s + i.book.price * i.quantity, 0);
  const tax      = Math.round(subtotal * 0.18);
  const delivery = subtotal > 500 ? 0 : subtotal === 0 ? 0 : 49;
  const total    = subtotal + tax + delivery;

  if (cart.length === 0) {
    return (
      <div className="empty-cart">
        <ShoppingBag size={64} color="#374151" />
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added any books yet.</p>
        <Link to="/catalogue" className="btn-primary">Browse Catalogue</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-heading">Shopping Cart <span>({cart.length} {cart.length === 1 ? "item" : "items"})</span></h1>

      <div className="cart-layout">
        {/* Items */}
        <div className="cart-items">
          {cart.map(({ book, quantity }) => (
            <div key={book.id} className="cart-item">
              <Link to={`/book/${book.id}`}>
                <BookCover cover={book.cover} size="sm" />
              </Link>
              <div className="cart-item-info">
                <Link to={`/book/${book.id}`} className="cart-item-title">{book.title}</Link>
                <div className="cart-item-author">by {book.author}</div>
                <div className="cart-item-meta">{book.format} · {book.category}</div>
                <div className="cart-item-publisher">by {book.publisher}</div>
                <div className="cart-item-delivery">
                  {book.deliveryDays === 0
                    ? "Instant digital delivery"
                    : `Delivery in ${book.deliveryDays} days`}
                </div>
              </div>
              <div className="cart-item-controls">
                <div className="qty-control">
                  <button
                    onClick={() => updateCartQty(book.id, quantity - 1)}
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                  >
                    <Minus size={12} />
                  </button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => updateCartQty(book.id, quantity + 1)}
                    aria-label="Increase quantity"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <div className="cart-item-price">₹{book.price * quantity}</div>
                <button
                  className="remove-btn"
                  onClick={() => removeFromCart(book.id)}
                  aria-label={`Remove ${book.title} from cart`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order summary */}
        <aside className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Price ({cart.reduce((s, i) => s + i.quantity, 0)} items)</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="summary-row">
            <span>Tax (18% GST)</span>
            <span>₹{tax}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Charges</span>
            <span>{delivery === 0 ? <span className="free">Free</span> : `₹${delivery}`}</span>
          </div>
          {subtotal > 0 && subtotal <= 500 && (
            <p className="free-note">Add ₹{500 - subtotal} more for free delivery</p>
          )}
          <div className="summary-divider" />
          <div className="summary-total">
            <span>Total Amount</span>
            <span>₹{total}</span>
          </div>

          <button
            className="btn-checkout"
            onClick={() => {
              if (!user) {
                navigate("/login");
              } else {
                navigate("/checkout");
              }
            }}
          >
            Proceed to Checkout <ArrowRight size={16} />
          </button>

          {!user && (
            <p className="login-note">
              <Link to="/login">Sign in</Link> to checkout and track your orders.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

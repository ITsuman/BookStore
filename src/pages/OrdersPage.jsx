import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Package, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import BookCover from "../components/BookCover";
import { getBookById } from "../data/books";
import { useApp } from "../context/AppContext";
import "./OrdersPage.css";

export default function OrdersPage() {
  const { user, orders, addToCart, cancelOrder } = useApp();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState({});

  // Merge context orders with user's historic orders
  const liveOrders = orders;
  const historyOrders = (user?.orderHistory || []);

  function toggle(id) {
    setExpanded((e) => ({ ...e, [id]: !e[id] }));
  }

  function buyAgain(bookId) {
    const book = getBookById(bookId);
    if (book) {
      addToCart(book);
      navigate("/cart");
    }
  }

  function handleCancel(orderId) {
    const res = cancelOrder(orderId);
    if (!res.ok) alert(res.error);
  }

  if (!user) {
    return (
      <div className="orders-login-prompt">
        <Package size={56} color="#374151" />
        <h2>Sign in to view your orders</h2>
        <Link to="/login" className="btn-primary">Sign In</Link>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <h1>My Orders</h1>

      {/* Live orders (placed this session) */}
      {liveOrders.length > 0 && (
        <section className="orders-section">
          <h2>Recent Orders</h2>
          {liveOrders.map((order) => {
            const now     = new Date();
            const deadline = new Date(order.cancelDeadline);
            const canCancel = now < deadline && order.status !== "Cancelled";

            return (
              <div key={order.orderId} className="order-card">
                <div className="order-header" onClick={() => toggle(order.orderId)}>
                  <div className="order-id">{order.orderId}</div>
                  <div className="order-date">
                    {new Date(order.date).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </div>
                  <div className={`order-status status-${order.status.toLowerCase().replace(" ", "-")}`}>
                    {order.status}
                  </div>
                  <div className="order-total">₹{order.total}</div>
                  <button className="expand-btn" aria-label={expanded[order.orderId] ? "Collapse" : "Expand"}>
                    {expanded[order.orderId] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {expanded[order.orderId] && (
                  <div className="order-body">
                    {order.items.map(({ book, quantity }) => (
                      <div key={book.id} className="order-item">
                        <Link to={`/book/${book.id}`}>
                          <BookCover cover={book.cover} size="sm" />
                        </Link>
                        <div className="order-item-info">
                          <Link to={`/book/${book.id}`} className="order-item-title">{book.title}</Link>
                          <div className="order-item-author">by {book.author}</div>
                          <div className="order-item-meta">{book.format} · Qty: {quantity}</div>
                          <div className="order-item-price">₹{book.price * quantity}</div>
                        </div>
                        <button className="btn-buy-again" onClick={() => buyAgain(book.id)}>
                          <RefreshCw size={12} /> Buy Again
                        </button>
                      </div>
                    ))}

                    {canCancel && (
                      <div className="order-cancel-row">
                        <span className="cancel-note">Cancel within {Math.max(0, Math.round((deadline - new Date()) / 3600000))} hrs</span>
                        <button className="btn-cancel-order" onClick={() => handleCancel(order.orderId)}>
                          Cancel Order
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Historic order history */}
      <section className="orders-section">
        <h2>Order History</h2>
        {historyOrders.length === 0 ? (
          <div className="empty-orders">
            <Package size={48} color="#374151" />
            <p>No past orders yet.</p>
            <Link to="/catalogue" className="btn-primary">Start Shopping</Link>
          </div>
        ) : (
          historyOrders.map((h, i) => {
            const book = getBookById(h.bookId);
            if (!book) return null;
            return (
              <div key={i} className="history-item">
                <Link to={`/book/${book.id}`}>
                  <BookCover cover={book.cover} size="sm" />
                </Link>
                <div className="history-info">
                  <Link to={`/book/${book.id}`} className="history-title">{book.title}</Link>
                  <div className="history-author">by {book.author}</div>
                  <div className="history-meta">
                    {h.orderId} · {new Date(h.date).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric",
                    })} · {book.format}
                  </div>
                  <div className="history-price">₹{h.price}</div>
                </div>
                <div className={`order-status status-${h.status.toLowerCase()}`}>{h.status}</div>
                <button className="btn-buy-again" onClick={() => buyAgain(h.bookId)}>
                  <RefreshCw size={12} /> Buy Again
                </button>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

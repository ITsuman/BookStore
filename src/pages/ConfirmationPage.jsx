import { useLocation, useNavigate, Link } from "react-router-dom";
import { CheckCircle, Package, ShoppingBag } from "lucide-react";
import BookCover from "../components/BookCover";
import { useApp } from "../context/AppContext";
import "./ConfirmationPage.css";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    weekday: "short", day: "numeric", month: "short", year: "numeric",
  });
}

export default function ConfirmationPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const { cancelOrder, orders } = useApp();

  // If navigated directly without state, pick first order
  const order = state?.order || orders[0];

  if (!order) {
    return (
      <div className="confirm-empty">
        <p>No order found.</p>
        <Link to="/">Go Home</Link>
      </div>
    );
  }

  const now       = new Date();
  const deadline  = new Date(order.cancelDeadline);
  const canCancel = now < deadline && order.status !== "Cancelled";
  const hoursLeft = Math.max(0, Math.round((deadline - now) / 1000 / 3600));

  function handleCancel() {
    const res = cancelOrder(order.orderId);
    if (!res.ok) alert(res.error);
  }

  return (
    <div className="confirm-page">
      {/* Backdrop */}
      <div className="confirm-backdrop" aria-hidden="true" />

      {/* Modal-style card */}
      <div className="confirm-card" role="main">
        {order.status === "Cancelled" ? (
          <>
            <div className="confirm-icon cancelled">
              <Package size={40} />
            </div>
            <h1>Order Cancelled</h1>
            <p className="confirm-sub">Your order {order.orderId} has been cancelled.</p>
          </>
        ) : (
          <>
            <div className="confirm-icon success">
              <CheckCircle size={40} />
            </div>
            <h1>Purchase Successful!</h1>
            <p className="confirm-sub">
              Your purchase of the following {order.items.length === 1 ? "read is" : "reads are"} successful
            </p>
          </>
        )}

        {/* Ordered books */}
        <div className="confirm-items">
          {order.items.map(({ book, quantity }) => (
            <div key={book.id} className="confirm-item">
              <Link to={`/book/${book.id}`}>
                <BookCover cover={book.cover} size="sm" />
              </Link>
              <div className="confirm-item-info">
                <Link to={`/book/${book.id}`} className="confirm-item-title">{book.title}</Link>
                <div className="confirm-item-author">By <span>{book.author}</span></div>
                <div className="confirm-item-meta">{book.format} · {book.category}</div>
                <div className="confirm-item-price">₹{book.price * quantity}</div>
                <div className="confirm-item-delivery">
                  {book.deliveryDays === 0
                    ? "Instant digital download"
                    : `Delivery by ${formatDate(order.cancelDeadline)}`}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order details */}
        <div className="confirm-details">
          <div className="detail-row">
            <span>Order ID</span>
            <span>{order.orderId}</span>
          </div>
          <div className="detail-row">
            <span>Payment</span>
            <span style={{ textTransform: "capitalize" }}>{order.paymentMethod}</span>
          </div>
          <div className="detail-row">
            <span>Total Paid</span>
            <span>₹{order.total}</span>
          </div>
          <div className="detail-row">
            <span>Deliver to</span>
            <span>{order.address.firstName} {order.address.lastName}, {order.address.city}</span>
          </div>
        </div>

        {/* Cancellation */}
        {order.status !== "Cancelled" && (
          <div className="cancel-window">
            {canCancel ? (
              <>
                <p className="cancel-note">You can cancel this order within the next <strong>{hoursLeft} hrs</strong>.</p>
                <button className="btn-cancel" onClick={handleCancel}>
                  Cancel Order
                </button>
              </>
            ) : (
              <p className="cancel-closed">Cancellation window has passed (48 hrs).</p>
            )}
          </div>
        )}

        {/* CTA */}
        <button
          className="btn-continue"
          onClick={() => navigate("/catalogue")}
        >
          <ShoppingBag size={16} />
          Continue your Shopping
        </button>
      </div>
    </div>
  );
}

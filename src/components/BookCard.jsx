import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Truck } from "lucide-react";
import BookCover from "./BookCover";
import StarRating from "./StarRating";
import { useApp } from "../context/AppContext";
import "./BookCard.css";

function deliveryLabel(days) {
  if (days === 0) return "Instant – eBook";
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `Delivery by ${d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}`;
}

export default function BookCard({ book }) {
  const { addToCart, toggleWishlist, wishlist } = useApp();
  const inWishlist = wishlist.some((b) => b.id === book.id);

  return (
    <div className="book-card">
      {book.isNew && <span className="badge-new">New</span>}
      {book.isBestseller && !book.isNew && <span className="badge-best">Bestseller</span>}

      <Link to={`/book/${book.id}`} className="book-card-cover">
        <BookCover cover={book.cover} size="md" />
      </Link>

      <div className="book-card-body">
        <Link to={`/book/${book.id}`} className="book-title">{book.title}</Link>
        <div className="book-author">by <span>{book.author}</span></div>
        <div className="book-meta">
          <span className="book-format">{book.format}</span>
          <span className="separator">·</span>
          <span>{book.category}</span>
        </div>
        <div className="book-rating">
          <StarRating rating={book.rating} />
          <span className="rating-val">{book.rating}</span>
        </div>
        <div className="book-price">₹{book.price}</div>
        <div className="book-delivery">
          <Truck size={12} />
          <span>{deliveryLabel(book.deliveryDays)}</span>
        </div>

        <div className="book-actions">
          <button
            className="btn-cart"
            onClick={() => addToCart(book)}
            aria-label={`Add ${book.title} to cart`}
          >
            <ShoppingCart size={14} /> Add to Cart
          </button>
          <button
            className={`btn-wish ${inWishlist ? "active" : ""}`}
            onClick={() => toggleWishlist(book)}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart size={14} fill={inWishlist ? "#f43f5e" : "none"} />
          </button>
        </div>
      </div>
    </div>
  );
}

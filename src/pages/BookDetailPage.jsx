import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Heart, ShoppingCart, Truck, Star, ChevronRight,
  BookOpen, Globe, Building, Package
} from "lucide-react";
import BookCover from "../components/BookCover";
import BookCard from "../components/BookCard";
import StarRating from "../components/StarRating";
import { getBookById, getRelatedBooks } from "../data/books";
import { useApp } from "../context/AppContext";
import "./BookDetailPage.css";

function deliveryDate(days) {
  if (days === 0) return "Instant download";
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" });
}

// Static reviews
const staticReviews = [
  { name: "John Smith", rating: 5, text: "This book completely changed the way I think about daily productivity. Highly recommend!", date: "Oct 2026" },
  { name: "Meera Iyer",  rating: 4, text: "Great insights and very practical advice. A few chapters felt repetitive but overall excellent.", date: "Sep 2026" },
  { name: "Sam Collins", rating: 4, text: "Concise, actionable, and well-written. Perfect for anyone wanting to take control of their focus.", date: "Aug 2026" },
];

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const book = getBookById(Number(id));
  const { addToCart, toggleWishlist, wishlist, user } = useApp();
  const [reviewText, setReviewText] = useState("");
  const [hoverStar, setHoverStar] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [reviews, setReviews] = useState(staticReviews);

  if (!book) {
    return (
      <div className="not-found">
        <p>Book not found.</p>
        <Link to="/catalogue">Back to catalogue</Link>
      </div>
    );
  }

  const related = getRelatedBooks(book);
  const inWishlist = wishlist.some((b) => b.id === book.id);

  function submitReview(e) {
    e.preventDefault();
    if (!reviewText.trim() || userRating === 0) return;
    setReviews((r) => [
      { name: user?.name || "Guest", rating: userRating, text: reviewText, date: "Now" },
      ...r,
    ]);
    setReviewText("");
    setUserRating(0);
  }

  return (
    <div className="detail-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Home</Link>
        <ChevronRight size={12} />
        <Link to="/catalogue">{book.category}</Link>
        <ChevronRight size={12} />
        <Link to="/catalogue">{book.format}</Link>
        <ChevronRight size={12} />
        <span>{book.title}</span>
      </nav>

      <div className="detail-layout">
        {/* Left: cover + actions */}
        <aside className="detail-cover-col">
          <BookCover cover={book.cover} size="lg" />

          <div className="detail-actions">
            <button className="btn-add-cart" onClick={() => { addToCart(book); navigate("/cart"); }}>
              <ShoppingCart size={16} /> Add to Cart
            </button>
            <button
              className={`btn-wishlist ${inWishlist ? "active" : ""}`}
              onClick={() => toggleWishlist(book)}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart size={16} fill={inWishlist ? "#f43f5e" : "none"} />
              {inWishlist ? "In Wishlist" : "Add to Wishlist"}
            </button>
          </div>

          <div className="detail-meta-box">
            <MetaRow icon={<BookOpen size={13} />} label="Publisher" value={book.publisher} />
            <MetaRow icon={<Package size={13} />} label="Format" value={book.format} />
            <MetaRow icon={<Globe size={13} />} label="Language" value={book.language} />
            <MetaRow icon={<Star size={13} />} label="Sold" value={`${book.soldCopies.toLocaleString()} copies`} />
          </div>
        </aside>

        {/* Center: info */}
        <section className="detail-info">
          <h1>{book.title}</h1>
          <p className="detail-author">
            by <span className="author-link">{book.author}</span>
          </p>

          <div className="detail-badges">
            {book.isBestseller && <span className="badge-best">Bestseller</span>}
            {book.isNew && <span className="badge-new">New</span>}
            <span className="badge-cat">{book.category}</span>
          </div>

          <div className="detail-rating">
            <StarRating rating={book.rating} size={18} />
            <span className="rating-num">{book.rating}</span>
            <span className="rating-count">{book.reviews.toLocaleString()} reviews</span>
          </div>

          <div className="detail-price">₹{book.price}</div>

          <div className="detail-delivery">
            <Truck size={14} />
            <span>
              {book.deliveryDays === 0
                ? "Instant digital delivery"
                : `Delivery by ${deliveryDate(book.deliveryDays)}`}
            </span>
          </div>

          <div className="detail-tags">
            {book.tags.map((t) => (
              <span key={t} className="tag">{t}</span>
            ))}
          </div>

          <h2 className="detail-section-title">About the Book</h2>
          <p className="detail-desc">{book.description}</p>

          <h2 className="detail-section-title">About the Author</h2>
          <div className="author-bio">
            <div className="author-avatar">{book.cover?.author?.slice(0, 2)}</div>
            <div>
              <div className="author-name">{book.author}</div>
              <p className="author-text">
                {book.author} is an acclaimed author known for their insightful and engaging writing style.
                Their works have touched millions of readers around the world and been featured on international bestseller lists.
              </p>
            </div>
          </div>

          {/* Reviews */}
          <h2 className="detail-section-title">Reviews</h2>

          {/* Leave a review */}
          <form className="review-form" onSubmit={submitReview}>
            <div className="star-picker">
              {[1,2,3,4,5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className="star-pick-btn"
                  onMouseEnter={() => setHoverStar(s)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => setUserRating(s)}
                  aria-label={`Rate ${s} star`}
                >
                  <Star
                    size={22}
                    fill={(hoverStar || userRating) >= s ? "#f59e0b" : "none"}
                    color={(hoverStar || userRating) >= s ? "#f59e0b" : "#4b5563"}
                  />
                </button>
              ))}
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this book…"
              rows={3}
              maxLength={400}
            />
            <button type="submit" className="btn-review" disabled={!reviewText.trim() || userRating === 0}>
              Submit Review
            </button>
          </form>

          {reviews.map((r, i) => (
            <div key={i} className="review-item">
              <div className="review-header">
                <span className="review-name">{r.name}</span>
                <StarRating rating={r.rating} size={13} />
                <span className="review-date">{r.date}</span>
              </div>
              <p className="review-text">{r.text}</p>
            </div>
          ))}
        </section>

        {/* Right: related books */}
        <aside className="detail-related">
          <h3 className="related-title">Related Reads</h3>
          {related.map((b) => (
            <div key={b.id} className="related-item">
              <Link to={`/book/${b.id}`}>
                <BookCover cover={b.cover} size="sm" />
              </Link>
              <div className="related-info">
                <Link to={`/book/${b.id}`} className="related-book-title">{b.title}</Link>
                <div className="related-author">by {b.author}</div>
                <div className="related-meta">{b.format} · {b.category}</div>
                <div className="related-price">₹{b.price}</div>
                <div className="related-delivery">
                  <Truck size={11} />
                  <span>{deliveryDate(b.deliveryDays)}</span>
                </div>
              </div>
            </div>
          ))}
        </aside>
      </div>
    </div>
  );
}

function MetaRow({ icon, label, value }) {
  return (
    <div className="meta-row">
      <span className="meta-icon">{icon}</span>
      <span className="meta-label">{label}</span>
      <span className="meta-value">{value}</span>
    </div>
  );
}

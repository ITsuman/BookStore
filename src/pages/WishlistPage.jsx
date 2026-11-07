import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import BookCard from "../components/BookCard";
import { useApp } from "../context/AppContext";
import "./WishlistPage.css";

export default function WishlistPage() {
  const { wishlist } = useApp();

  if (wishlist.length === 0) {
    return (
      <div className="empty-wishlist">
        <Heart size={64} color="#374151" />
        <h2>Your wishlist is empty</h2>
        <p>Save books you'd like to read later.</p>
        <Link to="/catalogue" className="btn-primary">Browse Catalogue</Link>
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <h1>My Wishlist <span>({wishlist.length} {wishlist.length === 1 ? "book" : "books"})</span></h1>
      <div className="wishlist-grid">
        {wishlist.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}

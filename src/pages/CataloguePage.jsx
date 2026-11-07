import { useState, useMemo } from "react";
import { Search, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import BookCard from "../components/BookCard";
import {
  books,
  categories,
  publishers,
  formats,
  languages,
  getRecommendedBooks,
} from "../data/books";
import { useApp } from "../context/AppContext";
import "./CataloguePage.css";

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Rating" },
  { value: "newest", label: "Newest" },
];

export default function CataloguePage() {
  const { user } = useApp();

  const [selectedCat, setSelectedCat] = useState("All");
  const [selectedPub, setSelectedPub] = useState("All");
  const [selectedFmt, setSelectedFmt] = useState("All");
  const [selectedLang, setSelectedLang] = useState("All");
  const [priceRange, setPriceRange] = useState([0, 600]);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("relevance");
  const [filtersOpen, setFiltersOpen] = useState(true);

  const recommended = useMemo(
    () => getRecommendedBooks(user?.orderHistory || []),
    [user]
  );

  const bestsellers = useMemo(() => books.filter((b) => b.isBestseller), []);
  const newLaunches = useMemo(() => books.filter((b) => b.isNew), []);

  const filtered = useMemo(() => {
    let result = [...books];
    if (selectedCat !== "All") result = result.filter((b) => b.category === selectedCat);
    if (selectedPub !== "All") result = result.filter((b) => b.publisher === selectedPub);
    if (selectedFmt !== "All") result = result.filter((b) => b.format === selectedFmt);
    if (selectedLang !== "All") result = result.filter((b) => b.language === selectedLang);
    result = result.filter(
      (b) => b.price >= priceRange[0] && b.price <= priceRange[1]
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.author.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.tags.some((t) => t.includes(q))
      );
    }
    switch (sort) {
      case "price_asc":  result.sort((a, b) => a.price - b.price); break;
      case "price_desc": result.sort((a, b) => b.price - a.price); break;
      case "rating":     result.sort((a, b) => b.rating - a.rating); break;
      case "newest":     result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
    }
    return result;
  }, [selectedCat, selectedPub, selectedFmt, selectedLang, priceRange, search, sort]);

  const isFiltered =
    selectedCat !== "All" ||
    selectedPub !== "All" ||
    selectedFmt !== "All" ||
    selectedLang !== "All" ||
    search.trim() !== "";

  return (
    <div className="catalogue-page">
      {/* Sidebar */}
      <aside className="catalogue-sidebar">
        <div className="sidebar-section">
          <h3>Categories</h3>
          <ul className="cat-list">
            {categories.map((c) => (
              <li key={c}>
                <button
                  className={`cat-item ${selectedCat === c ? "active" : ""}`}
                  onClick={() => setSelectedCat(c)}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Main content */}
      <main className="catalogue-main">
        {/* Top bar */}
        <div className="catalogue-topbar">
          <div className="search-box">
            <Search size={16} />
            <input
              type="search"
              placeholder="Search books, authors…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search books"
            />
          </div>

          <div className="filter-row">
            <Select label="Language" value={selectedLang} options={languages} onChange={setSelectedLang} />
            <Select label="Format" value={selectedFmt} options={formats} onChange={setSelectedFmt} />
            <Select label="Publisher" value={selectedPub} options={publishers} onChange={setSelectedPub} />
            <div className="sort-wrap">
              <label>Sort by</label>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Price range */}
        <div className="price-filter">
          <span>Price: ₹{priceRange[0]} – ₹{priceRange[1]}</span>
          <input
            type="range"
            min={0}
            max={600}
            value={priceRange[1]}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
            aria-label="Maximum price"
          />
        </div>

        {/* Sections */}
        {!isFiltered ? (
          <>
            <Section title="Recommended for You" books={recommended} />
            <Section title="Bestsellers this Month" books={bestsellers} />
            <Section title="New Launches" books={newLaunches} />
          </>
        ) : (
          <div>
            <div className="results-header">
              <span>{filtered.length} {filtered.length === 1 ? "result" : "results"}</span>
              {filtered.length > 0 && (
                <button className="clear-filters" onClick={() => {
                  setSelectedCat("All");
                  setSelectedPub("All");
                  setSelectedFmt("All");
                  setSelectedLang("All");
                  setSearch("");
                }}>
                  Clear filters
                </button>
              )}
            </div>
            <div className="book-grid">
              {filtered.length === 0 ? (
                <p className="no-results">No books found. Try adjusting your filters.</p>
              ) : (
                filtered.map((b) => <BookCard key={b.id} book={b} />)
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Section({ title, books }) {
  return (
    <section className="catalogue-section">
      <h2 className="section-title">{title}</h2>
      <div className="book-row">
        {books.map((b) => (
          <BookCard key={b.id} book={b} />
        ))}
      </div>
    </section>
  );
}

function Select({ label, value, options, onChange }) {
  return (
    <div className="filter-select">
      <label>{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BookOpen, Eye, EyeOff, LogIn } from "lucide-react";
import { useApp } from "../context/AppContext";
import "./LoginPage.css";

export default function LoginPage() {
  const { login, notify } = useApp();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    const result = login(form.email, form.password);
    setLoading(false);
    if (result.ok) {
      notify("Welcome back!", "success");
      navigate("/");
    } else {
      setError(result.error);
    }
  }

  function loginAsDemo(email) {
    setForm({ email, password: email === "priya@example.com" ? "password123" : "pass456" });
  }

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-brand">
          <BookOpen size={40} color="#60a5fa" />
          <h1>Book Worm</h1>
        </div>
        <p className="login-tagline">
          Discover your next favourite read. Thousands of titles across every genre, delivered to your door.
        </p>
        <div className="login-features">
          {["Browse 10,000+ books", "Personalised recommendations", "Fast delivery & easy returns", "Redeem gift points on every order"].map((f) => (
            <div key={f} className="login-feature-item">
              <span className="check">✓</span> {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-card">
          <h2>Sign in to your account</h2>
          <p className="login-sub">Don't have an account? <Link to="/">Browse as guest</Link></p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                aria-describedby={error ? "login-error" : undefined}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPwd ? "text" : "password"}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="toggle-pwd"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label={showPwd ? "Hide password" : "Show password"}
                >
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p id="login-error" className="login-error" role="alert">
                {error}
              </p>
            )}

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? (
                <span className="spinner" />
              ) : (
                <>
                  <LogIn size={16} /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="demo-section">
            <div className="demo-label">Demo accounts</div>
            <div className="demo-btns">
              <button className="demo-btn" onClick={() => loginAsDemo("priya@example.com")}>
                Priya Sharma
              </button>
              <button className="demo-btn" onClick={() => loginAsDemo("arjun@example.com")}>
                Arjun Mehta
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

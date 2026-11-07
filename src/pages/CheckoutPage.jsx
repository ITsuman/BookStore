import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ChevronRight, CreditCard, Smartphone, Wallet, Tag } from "lucide-react";
import BookCover from "../components/BookCover";
import { useApp } from "../context/AppContext";
import "./CheckoutPage.css";

const PAYMENT_METHODS = [
  { id: "credit", label: "Credit Card", icon: CreditCard },
  { id: "debit",  label: "Debit Card",  icon: CreditCard },
  { id: "upi",    label: "UPI",         icon: Smartphone },
  { id: "wallet", label: "Wallet",      icon: Wallet },
];

const VALID_COUPONS = { BOOK10: 100, FIRST50: 50, SAVE20: 200 };

export default function CheckoutPage() {
  const { cart, user, placeOrder, notify } = useApp();
  const navigate = useNavigate();

  const savedAddr = user?.addresses?.[0];

  const [useSaved, setUseSaved] = useState(!!savedAddr);
  const [address, setAddress] = useState({
    firstName: savedAddr?.firstName || "",
    lastName:  savedAddr?.lastName  || "",
    address1:  savedAddr?.address1  || "",
    address2:  savedAddr?.address2  || "",
    city:      savedAddr?.city      || "",
    pin:       savedAddr?.pin       || "",
    state:     savedAddr?.state     || "",
    country:   savedAddr?.country   || "India",
    phone:     savedAddr?.phone     || "",
    email:     user?.email          || "",
  });
  const [payMethod, setPayMethod] = useState("credit");
  const [cardNum, setCardNum]     = useState("");
  const [cardName, setCardName]   = useState("");
  const [cvv, setCvv]             = useState("");
  const [expiry, setExpiry]       = useState("");
  const [upiId, setUpiId]         = useState("");
  const [coupon, setCoupon]       = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [usePoints, setUsePoints] = useState(false);
  const [errors, setErrors]       = useState({});
  const [placing, setPlacing]     = useState(false);

  if (!cart.length) {
    navigate("/cart");
    return null;
  }

  const subtotal = cart.reduce((s, i) => s + i.book.price * i.quantity, 0);
  const tax      = Math.round(subtotal * 0.18);
  const delivery = subtotal > 500 ? 0 : 49;
  const couponDiscount  = couponApplied ? VALID_COUPONS[couponApplied] : 0;
  const pointsDiscount  = usePoints ? Math.min(user?.giftPoints || 0, subtotal) : 0;
  const total    = Math.max(0, subtotal + tax + delivery - couponDiscount - pointsDiscount);

  function handleAddrChange(e) {
    setAddress((a) => ({ ...a, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
  }

  function applyCoupon() {
    const code = coupon.trim().toUpperCase();
    if (VALID_COUPONS[code]) {
      setCouponApplied(code);
      notify(`Coupon "${code}" applied! You save ₹${VALID_COUPONS[code]}`, "success");
    } else {
      notify("Invalid coupon code.", "error");
    }
  }

  function validate() {
    const errs = {};
    const req = ["firstName", "lastName", "address1", "city", "pin", "state", "phone", "email"];
    req.forEach((k) => { if (!address[k].trim()) errs[k] = "Required"; });
    if (payMethod === "credit" || payMethod === "debit") {
      if (cardNum.replace(/\s/g, "").length < 16) errs.cardNum = "Invalid card number";
      if (!cardName.trim()) errs.cardName = "Required";
      if (cvv.length < 3) errs.cvv = "Invalid CVV";
      if (!expiry.trim()) errs.expiry = "Required";
    }
    if (payMethod === "upi" && !upiId.includes("@")) errs.upiId = "Invalid UPI ID";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handlePay(e) {
    e.preventDefault();
    if (!validate()) return;
    setPlacing(true);
    await new Promise((r) => setTimeout(r, 1200)); // simulate gateway
    const order = placeOrder(address, payMethod, couponDiscount + pointsDiscount);
    setPlacing(false);
    navigate("/confirmation", { state: { order } });
  }

  return (
    <div className="checkout-page">
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <Link to="/cart">Shopping Cart</Link>
        <ChevronRight size={12} />
        <span>Checkout</span>
      </nav>

      <form className="checkout-layout" onSubmit={handlePay} noValidate>
        {/* Left col */}
        <div className="checkout-left">

          {/* Cart summary */}
          <section className="checkout-section">
            <h2>Your Items</h2>
            <div className="checkout-items">
              {cart.map(({ book, quantity }) => (
                <div key={book.id} className="checkout-item">
                  <BookCover cover={book.cover} size="sm" />
                  <div className="checkout-item-info">
                    <div className="checkout-item-title">{book.title}</div>
                    <div className="checkout-item-author">by {book.author}</div>
                    <div className="checkout-item-meta">{book.format}</div>
                    <div className="checkout-item-delivery">
                      {book.deliveryDays === 0 ? "Instant" : `Delivery in ${book.deliveryDays} days`}
                    </div>
                  </div>
                  <div className="checkout-item-qty">× {quantity}</div>
                  <div className="checkout-item-price">₹{book.price * quantity}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Address */}
          <section className="checkout-section">
            <h2>Delivery Address</h2>
            {savedAddr && (
              <label className="use-saved">
                <input
                  type="checkbox"
                  checked={useSaved}
                  onChange={(e) => {
                    setUseSaved(e.target.checked);
                    if (e.target.checked) {
                      setAddress({
                        firstName: savedAddr.firstName, lastName: savedAddr.lastName,
                        address1: savedAddr.address1, address2: savedAddr.address2,
                        city: savedAddr.city, pin: savedAddr.pin, state: savedAddr.state,
                        country: savedAddr.country, phone: savedAddr.phone, email: user.email,
                      });
                    }
                  }}
                />
                Use saved address ({savedAddr.label})
              </label>
            )}

            <div className="addr-grid">
              <Field label="First Name" name="firstName" value={address.firstName} onChange={handleAddrChange} error={errors.firstName} />
              <Field label="Last Name"  name="lastName"  value={address.lastName}  onChange={handleAddrChange} error={errors.lastName} />
              <Field label="Address Line 1" name="address1" value={address.address1} onChange={handleAddrChange} error={errors.address1} span={2} />
              <Field label="Address Line 2 (optional)" name="address2" value={address.address2} onChange={handleAddrChange} span={2} />
              <Field label="City"  name="city"  value={address.city}  onChange={handleAddrChange} error={errors.city} />
              <Field label="PIN"   name="pin"   value={address.pin}   onChange={handleAddrChange} error={errors.pin} />
              <Field label="State" name="state" value={address.state} onChange={handleAddrChange} error={errors.state} />
              <Field label="Country" name="country" value={address.country} onChange={handleAddrChange} />
              <Field label="Email"   name="email"   value={address.email}   onChange={handleAddrChange} error={errors.email} type="email" />
              <Field label="Phone"   name="phone"   value={address.phone}   onChange={handleAddrChange} error={errors.phone} type="tel" />
            </div>
          </section>

          {/* Payment */}
          <section className="checkout-section">
            <h2>Payment Method</h2>
            <div className="payment-options">
              {PAYMENT_METHODS.map(({ id, label, icon: Icon }) => (
                <label key={id} className={`payment-option ${payMethod === id ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="payMethod"
                    value={id}
                    checked={payMethod === id}
                    onChange={() => setPayMethod(id)}
                  />
                  <Icon size={18} />
                  <span>{label}</span>
                </label>
              ))}
            </div>

            {(payMethod === "credit" || payMethod === "debit") && (
              <div className="card-fields">
                <div className="card-row">
                  <div className="form-field">
                    <label>Card Number</label>
                    <input
                      type="text"
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      maxLength={19}
                      value={cardNum}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, "").replace(/(.{4})/g, "$1 ").trim();
                        setCardNum(v);
                      }}
                      aria-invalid={!!errors.cardNum}
                    />
                    {errors.cardNum && <span className="field-error">{errors.cardNum}</span>}
                  </div>
                  <div className="form-field">
                    <label>Name on Card</label>
                    <input
                      type="text"
                      placeholder="Name"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      aria-invalid={!!errors.cardName}
                    />
                    {errors.cardName && <span className="field-error">{errors.cardName}</span>}
                  </div>
                </div>
                <div className="card-row">
                  <div className="form-field">
                    <label>CVV</label>
                    <input
                      type="password"
                      placeholder="XXX"
                      maxLength={4}
                      value={cvv}
                      onChange={(e) => setCvv(e.target.value.replace(/\D/g, ""))}
                      aria-invalid={!!errors.cvv}
                    />
                    {errors.cvv && <span className="field-error">{errors.cvv}</span>}
                  </div>
                  <div className="form-field">
                    <label>Date of Expiry</label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      maxLength={5}
                      value={expiry}
                      onChange={(e) => {
                        let v = e.target.value.replace(/\D/g, "");
                        if (v.length > 2) v = v.slice(0,2) + "/" + v.slice(2,4);
                        setExpiry(v);
                      }}
                      aria-invalid={!!errors.expiry}
                    />
                    {errors.expiry && <span className="field-error">{errors.expiry}</span>}
                  </div>
                </div>
              </div>
            )}

            {payMethod === "upi" && (
              <div className="form-field" style={{ marginTop: 12 }}>
                <label>UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  aria-invalid={!!errors.upiId}
                />
                {errors.upiId && <span className="field-error">{errors.upiId}</span>}
              </div>
            )}

            {payMethod === "wallet" && (
              <div className="wallet-info">
                <Wallet size={16} /> Wallet balance: ₹{user?.giftPoints || 0} (Gift Points)
              </div>
            )}
          </section>
        </div>

        {/* Right: Grand Total */}
        <aside className="checkout-summary">
          <h2>Grand Total</h2>

          <div className="summary-row">
            <span>Price of {cart.reduce((s, i) => s + i.quantity, 0)} items</span>
            <span>₹{subtotal}</span>
          </div>
          <div className="summary-row">
            <span>Tax (18%)</span>
            <span>₹{tax}</span>
          </div>
          <div className="summary-row">
            <span>Delivery Charges</span>
            <span>{delivery === 0 ? <span className="free">Free</span> : `₹${delivery}`}</span>
          </div>

          {couponApplied && (
            <div className="summary-row discount">
              <span>Coupon ({couponApplied})</span>
              <span>– ₹{couponDiscount}</span>
            </div>
          )}
          {usePoints && pointsDiscount > 0 && (
            <div className="summary-row discount">
              <span>Gift Points</span>
              <span>– ₹{pointsDiscount}</span>
            </div>
          )}

          {/* Coupon */}
          <div className="coupon-row">
            <div className="coupon-input">
              <Tag size={14} />
              <input
                type="text"
                placeholder="Apply Coupon"
                value={coupon}
                onChange={(e) => setCoupon(e.target.value)}
                aria-label="Coupon code"
              />
            </div>
            <button type="button" className="btn-apply" onClick={applyCoupon}>Apply</button>
          </div>

          {/* Gift points */}
          {user?.giftPoints > 0 && (
            <label className="points-row">
              <input
                type="checkbox"
                checked={usePoints}
                onChange={(e) => setUsePoints(e.target.checked)}
              />
              <span>Redeem {user.giftPoints} Gift Points (₹{user.giftPoints} off)</span>
            </label>
          )}

          <div className="summary-divider" />
          <div className="summary-total">
            <span>Total Amount</span>
            <span>₹{total}</span>
          </div>

          <button type="submit" className="btn-pay" disabled={placing}>
            {placing ? (
              <><span className="spinner" /> Processing…</>
            ) : (
              <>Pay Now ₹{total}</>
            )}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Field({ label, name, value, onChange, error, span = 1, type = "text" }) {
  return (
    <div className="form-field" style={{ gridColumn: span > 1 ? `span ${span}` : undefined }}>
      <label htmlFor={name}>{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-err` : undefined}
      />
      {error && <span id={`${name}-err`} className="field-error">{error}</span>}
    </div>
  );
}

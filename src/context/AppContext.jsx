import { createContext, useContext, useReducer, useEffect } from "react";
import { demoUsers } from "../data/users";

// ─── Initial state ─────────────────────────────────────────────────────────

const initialState = {
  user: null,
  cart: [],          // [{ book, quantity }]
  wishlist: [],      // [book]
  orders: [],        // [{ orderId, items, address, total, date, status, cancelDeadline }]
  notification: null,
};

// ─── Reducer ───────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {

    // Auth
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, user: null, cart: [], wishlist: [] };
    case "UPDATE_USER":
      return { ...state, user: { ...state.user, ...action.payload } };

    // Cart
    case "ADD_TO_CART": {
      const exists = state.cart.find((i) => i.book.id === action.payload.id);
      if (exists) {
        return {
          ...state,
          cart: state.cart.map((i) =>
            i.book.id === action.payload.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { ...state, cart: [...state.cart, { book: action.payload, quantity: 1 }] };
    }
    case "REMOVE_FROM_CART":
      return { ...state, cart: state.cart.filter((i) => i.book.id !== action.payload) };
    case "UPDATE_CART_QTY":
      return {
        ...state,
        cart: state.cart.map((i) =>
          i.book.id === action.payload.id ? { ...i, quantity: action.payload.qty } : i
        ),
      };
    case "CLEAR_CART":
      return { ...state, cart: [] };

    // Wishlist
    case "TOGGLE_WISHLIST": {
      const inList = state.wishlist.find((b) => b.id === action.payload.id);
      return {
        ...state,
        wishlist: inList
          ? state.wishlist.filter((b) => b.id !== action.payload.id)
          : [...state.wishlist, action.payload],
      };
    }

    // Orders
    case "PLACE_ORDER": {
      const newOrder = action.payload;
      const updatedUser = state.user
        ? {
            ...state.user,
            orderHistory: [
              ...(state.user.orderHistory || []),
              ...newOrder.items.map((item) => ({
                orderId: newOrder.orderId,
                bookId: item.book.id,
                quantity: item.quantity,
                price: item.book.price * item.quantity,
                date: newOrder.date,
                status: "Processing",
              })),
            ],
          }
        : state.user;
      return { ...state, orders: [newOrder, ...state.orders], cart: [], user: updatedUser };
    }
    case "CANCEL_ORDER":
      return {
        ...state,
        orders: state.orders.map((o) =>
          o.orderId === action.payload ? { ...o, status: "Cancelled" } : o
        ),
        user: state.user
          ? {
              ...state.user,
              orderHistory: (state.user.orderHistory || []).map((h) =>
                h.orderId === action.payload ? { ...h, status: "Cancelled" } : h
              ),
            }
          : state.user,
      };

    // Notification
    case "NOTIFY":
      return { ...state, notification: action.payload };
    case "CLEAR_NOTIFY":
      return { ...state, notification: null };

    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Helpers
  function login(email, password) {
    const user = demoUsers.find(
      (u) => u.email === email && u.password === password
    );
    if (user) {
      dispatch({ type: "LOGIN", payload: user });
      return { ok: true };
    }
    return { ok: false, error: "Invalid email or password." };
  }

  function logout() {
    dispatch({ type: "LOGOUT" });
  }

  function addToCart(book) {
    dispatch({ type: "ADD_TO_CART", payload: book });
    notify(`"${book.title}" added to cart`, "success");
  }

  function removeFromCart(bookId) {
    dispatch({ type: "REMOVE_FROM_CART", payload: bookId });
  }

  function updateCartQty(id, qty) {
    if (qty < 1) return removeFromCart(id);
    dispatch({ type: "UPDATE_CART_QTY", payload: { id, qty } });
  }

  function toggleWishlist(book) {
    dispatch({ type: "TOGGLE_WISHLIST", payload: book });
  }

  function placeOrder(address, paymentMethod, couponDiscount = 0) {
    const orderId = "ORD-" + Date.now();
    const subtotal = state.cart.reduce((s, i) => s + i.book.price * i.quantity, 0);
    const tax = Math.round(subtotal * 0.18);
    const delivery = subtotal > 500 ? 0 : 49;
    const total = subtotal + tax + delivery - couponDiscount;
    const now = new Date();
    const cancelDeadline = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const order = {
      orderId,
      items: [...state.cart],
      address,
      paymentMethod,
      subtotal,
      tax,
      delivery,
      discount: couponDiscount,
      total,
      date: now.toISOString(),
      status: "Processing",
      cancelDeadline: cancelDeadline.toISOString(),
    };
    dispatch({ type: "PLACE_ORDER", payload: order });
    return order;
  }

  function cancelOrder(orderId) {
    const order = state.orders.find((o) => o.orderId === orderId);
    if (!order) return { ok: false, error: "Order not found." };
    if (order.status === "Cancelled") return { ok: false, error: "Already cancelled." };
    const now = new Date();
    const deadline = new Date(order.cancelDeadline);
    if (now > deadline) return { ok: false, error: "Cancellation window (48 hrs) has passed." };
    dispatch({ type: "CANCEL_ORDER", payload: orderId });
    notify(`Order ${orderId} has been cancelled.`, "info");
    return { ok: true };
  }

  function notify(message, type = "info") {
    dispatch({ type: "NOTIFY", payload: { message, type } });
    setTimeout(() => dispatch({ type: "CLEAR_NOTIFY" }), 3500);
  }

  const cartCount = state.cart.reduce((s, i) => s + i.quantity, 0);
  const wishlistCount = state.wishlist.length;

  return (
    <AppContext.Provider
      value={{
        ...state,
        login,
        logout,
        addToCart,
        removeFromCart,
        updateCartQty,
        toggleWishlist,
        placeOrder,
        cancelOrder,
        notify,
        cartCount,
        wishlistCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}

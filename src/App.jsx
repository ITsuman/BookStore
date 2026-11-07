import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Notification from "./components/Notification";

import LoginPage        from "./pages/LoginPage";
import CataloguePage    from "./pages/CataloguePage";
import BookDetailPage   from "./pages/BookDetailPage";
import CartPage         from "./pages/CartPage";
import CheckoutPage     from "./pages/CheckoutPage";
import ConfirmationPage from "./pages/ConfirmationPage";
import OrdersPage       from "./pages/OrdersPage";
import WishlistPage     from "./pages/WishlistPage";

function ProtectedRoute({ children }) {
  const { user } = useApp();
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Notification />
      <Routes>
        <Route path="/"             element={<CataloguePage />} />
        <Route path="/catalogue"    element={<CataloguePage />} />
        <Route path="/login"        element={<LoginPage />} />
        <Route path="/book/:id"     element={<BookDetailPage />} />
        <Route path="/cart"         element={<CartPage />} />
        <Route path="/wishlist"     element={<WishlistPage />} />
        <Route path="/checkout"     element={
          <ProtectedRoute><CheckoutPage /></ProtectedRoute>
        } />
        <Route path="/confirmation" element={
          <ProtectedRoute><ConfirmationPage /></ProtectedRoute>
        } />
        <Route path="/orders"       element={
          <ProtectedRoute><OrdersPage /></ProtectedRoute>
        } />
        <Route path="*"             element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}

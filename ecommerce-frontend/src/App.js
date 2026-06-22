import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './Components/AuthContext';
import { ProductProvider } from './Components/ProductContext';
import { CartProvider } from './Components/CartContext';
import { WishlistProvider } from './Components/WishlistContext';
import ProtectedRoute from './Components/ProtectedRoute';
import Home from './Pages/Home';
import Account from './Pages/Account';
import Cart from './Pages/Cart';
import Wishlist from './Pages/Wishlist';
import Checkout from './Pages/Checkout';
import OrderConfirmation from './Pages/OrderConfirmation';
import CategoryDetails from './Pages/CategoryDetails';
import SearchResults from './Pages/SearchResults';
import ProductDetails from './Pages/ProductDetails';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import VerifyEmail from './Pages/VerifyEmail';
import AdminLogin from './Pages/AdminLogin';
import AdminForgotPassword from './Pages/AdminLogin/ForgotPassword';
import AdminVerifyOTP from './Pages/AdminLogin/VerifyOTP';
import AdminResetPassword from './Pages/AdminLogin/ResetPassword';
import AdminPhoneLogin from './Pages/AdminLogin/PhoneLogin';
import Admin from './Pages/Admin';
import Header from './Components/Header';

function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <WishlistProvider>
            <BrowserRouter>
              <Header />
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin-login/forgot-password" element={<AdminForgotPassword />} />
                <Route path="/admin-login/verify-otp" element={<AdminVerifyOTP />} />
                <Route path="/admin-login/reset-password" element={<AdminResetPassword />} />
                <Route path="/admin-login/phone-login" element={<AdminPhoneLogin />} />
                
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
                <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmation /></ProtectedRoute>} />
                <Route path="/category/:categoryName" element={<CategoryDetails />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute>} />
              </Routes>
            </BrowserRouter>
          </WishlistProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

export default App;

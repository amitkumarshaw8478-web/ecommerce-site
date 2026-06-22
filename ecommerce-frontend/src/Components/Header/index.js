import React, { useState, useEffect } from 'react';
import Logo from '../../assets/images/ChatGPT Image Feb 2, 2026, 10_03_24 AM.png';

import { Link, useNavigate, useLocation } from "react-router-dom";

import { useAuth } from '../AuthContext';

import Button from '@mui/material/Button';

import 'bootstrap/dist/css/bootstrap.min.css';

import CountryDropdown from './CountryDropdown';

import { IoSearch } from "react-icons/io5";

import {
  FiShoppingCart,
  FiUser,
  FiX,
  FiHeart
} from "react-icons/fi";

import { useCart } from '../CartContext';
import { useWishlist } from '../WishlistContext';

const Header = () => {

  const { isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const location = useLocation();

  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const navigate = useNavigate();

  // Sync search input state with the 'q' URL search parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query) {
      setSearchInput(query);
    } else {
      setSearchInput('');
    }
  }, [location.search]);

  // Hide the store header on admin portal views for cleaner experience
  const isAdminRoute = location.pathname.startsWith('/admin') || location.pathname.startsWith('/admin-login');

  if (isAdminRoute) {
    return null;
  }

  const handleLogout = () => {

    logout();

    navigate('/login', {
      replace: true
    });

  };

  const handleSearch = (e) => {

    if (
      e.key === 'Enter' ||
      e.type === 'click'
    ) {

      if (searchInput.trim()) {

        navigate(
          `/search?q=${encodeURIComponent(searchInput)}`
        );

      }

    }

  };

  return (

    <>
      <header className="headerWrapper">

        {/* Top Strip */}
        <div className="top-strip bg-purple">

          <div className="container-fluid">

            <p className="mb-0 mt-0 text-center">

              Due to the <b>Covid 19</b> epidemic,
              orders may be processed with a slight delay

            </p>

          </div>

        </div>

        {/* Header */}
        <div className="header">

          <div className="container-fluid">

            <div className="header-content">

              {/* Logo */}
              <div className="logoWrapper">

                <Link to="/">

                  <img src={Logo} alt="Logo" />

                </Link>

              </div>

              {/* Search */}
              <div className={`headerSearch ${showMobileSearch ? 'active' : ''}`}>

                <input
                  type="text"
                  placeholder="Search for products..."
                  value={searchInput}
                  onChange={(e) =>
                    setSearchInput(e.target.value)
                  }
                  onKeyDown={handleSearch}
                />

                <Button
                  className="search-btn"
                  onClick={handleSearch}
                >
                  <IoSearch />
                </Button>

              </div>

              {/* Right Side */}
              <div className="header-right">

                {/* Country */}
                <div className="country-wrapper-mobile">
                  <CountryDropdown />
                </div>

                {/* Wishlist */}
                <Link
                  to="/wishlist"
                  className="wishlist-icon"
                  title="My Wishlist"
                >
                  <FiHeart />
                  {wishlistCount > 0 && (
                    <span className="cart-badge">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart */}
                <Link
                  to="/cart"
                  className="cart-icon"
                >

                  <FiShoppingCart />

                  <span className="cart-badge">
                    {cartCount}
                  </span>

                </Link>

                {/* Account */}
                <Link
                  to="/account"
                  className="account-icon"
                >

                  <FiUser />

                </Link>

                {/* Auth Button */}
                {isAuthenticated ? (

                  <button
                    className="btn btn-light logout-btn"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>

                ) : (

                  <Link
                    to="/login"
                    className="btn btn-primary login-btn"
                  >
                    Login
                  </Link>

                )}

                {/* Mobile Search Toggle */}
                <button
                  className="mobile-search-toggle"
                  onClick={() =>
                    setShowMobileSearch(!showMobileSearch)
                  }
                >

                  {showMobileSearch ? (
                    <FiX />
                  ) : (
                    <IoSearch />
                  )}

                </button>

              </div>

            </div>

          </div>

        </div>

      </header>
    </>

  );
};

export default Header;

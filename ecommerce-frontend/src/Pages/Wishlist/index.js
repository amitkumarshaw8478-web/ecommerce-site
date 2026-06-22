import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWishlist } from '../../Components/WishlistContext';
import { useCart } from '../../Components/CartContext';
import { FiHeart, FiTrash2, FiShoppingCart, FiArrowLeft } from 'react-icons/fi';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import './Wishlist.css';

const Wishlist = () => {
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  const handleAddToCart = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addToCart(product);
    setNotification(`${product.name} added to cart!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRemoveFromWishlist = (productId, name, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    removeFromWishlist(productId);
    setNotification(`${name} removed from wishlist`);
    setTimeout(() => setNotification(null), 3000);
  };

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <span key={i}>
            {i < Math.floor(rating) ? (
              <AiFillStar className="star-filled" />
            ) : (
              <AiOutlineStar className="star-empty" />
            )}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="wishlist-page">
      {notification && (
        <div className="wishlist-notification animate-slide-in">
          {notification}
        </div>
      )}

      <div className="container mt-5">
        <div className="wishlist-header d-flex align-items-center justify-content-between mb-4">
          <div className="d-flex align-items-center gap-3">
            <h1 className="wishlist-title mb-0">My Wishlist</h1>
            <span className="wishlist-badge">
              {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <button className="back-btn" onClick={() => navigate('/')}>
            <FiArrowLeft className="me-2" /> Back to Shop
          </button>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist text-center py-5">
            <div className="empty-wishlist-icon">
              <FiHeart size={64} color="#ccc" />
            </div>
            <h2>Your wishlist is empty</h2>
            <p>Save items you like in your wishlist. They will be saved here for you to purchase later.</p>
            <Link to="/" className="btn btn-primary mt-3 continue-shopping-btn">
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {wishlistItems.map((item) => (
              <div key={item.id} className="col-12 col-md-6 col-lg-4">
                <div 
                  className="wishlist-card"
                  onClick={() => navigate(`/product/${item.id}`)}
                >
                  <div className="wishlist-image-wrapper">
                    <img 
                      src={item.image || item.thumbnail} 
                      alt={item.name || item.title} 
                      className="wishlist-image"
                    />
                    {item.discount > 0 && (
                      <span className="wishlist-discount">-{item.discount}%</span>
                    )}
                    <button 
                      className="remove-wishlist-btn"
                      onClick={(e) => handleRemoveFromWishlist(item.id, item.name || item.title, e)}
                      title="Remove from Wishlist"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  <div className="wishlist-info">
                    <h3 className="wishlist-item-name">
                      {item.name || item.title}
                    </h3>
                    
                    <div className="wishlist-rating d-flex align-items-center gap-2 mb-2">
                      {renderStars(item.rating || 4)}
                      <span className="rating-text">({item.reviews || 0})</span>
                    </div>

                    <div className="wishlist-price mb-3">
                      <span className="current-price">${item.price}</span>
                      {item.originalPrice > item.price && (
                        <span className="original-price ms-2">${item.originalPrice}</span>
                      )}
                    </div>

                    <button 
                      className="add-to-cart-btn-wishlist w-100"
                      onClick={(e) => handleAddToCart(item, e)}
                    >
                      <FiShoppingCart className="me-2" /> Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../Components/ProductContext';
import { useCart } from '../../Components/CartContext';
import { useWishlist } from '../../Components/WishlistContext';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { AiOutlineStar, AiFillStar } from 'react-icons/ai';
import './SearchResults.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const query = searchParams.get('q') || '';
  const [notification, setNotification] = useState(null);

  // Derive results directly (no useEffect needed for sync filtering)
  const searchResults = !query.trim() ? [] : (products || []).filter(product => {
    if (!product) return false;
    const name = (product.name || '').toLowerCase();
    const category = (product.category || '').toLowerCase();
    const brand = (product.brand || '').toLowerCase();
    const description = (product.description || '').toLowerCase();
    const queryLower = (query || '').toLowerCase();
    return name.includes(queryLower) ||
           category.includes(queryLower) ||
           brand.includes(queryLower) ||
           description.includes(queryLower);
  });


  const handleAddToCart = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addToCart(product);
    setNotification({
      message: `${product.name} added to cart!`,
      type: 'success'
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const renderStars = (rating) => {
    return (
      <div style={{ color: '#ffc107', display: 'flex', gap: '2px' }}>
        {Array.from({ length: 5 }, (_, i) => (
          <span key={i}>
            {i < Math.floor(rating) ? <AiFillStar /> : <AiOutlineStar />}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="search-results-page">
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: '#333',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: '500',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span style={{ color: '#4caf50' }}>✔</span> {notification.message}
        </div>
      )}

      <div className="container py-4">
        <div className="search-results-header">
          <h1>Search Results</h1>
          <p className="search-query">Results for "{query}"</p>
        </div>

        <p className="results-count">
          Found {searchResults.length} {searchResults.length === 1 ? 'product' : 'products'}
        </p>

        {searchResults.length === 0 ? (
          <div className="no-results">
            <h2>No results found</h2>
            <p>We couldn't find any products matching "{query}". Please check your spelling or try another search term.</p>
            <Link to="/" className="btn btn-primary" style={{
              background: '#667eea',
              border: 'none',
              padding: '10px 24px',
              borderRadius: '20px',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: '600',
              display: 'inline-block'
            }}>Go Home</Link>
          </div>
        ) : (
          <div className="results-grid">
            {searchResults.map(product => (
              <div 
                key={product.id} 
                className="result-card"
                onClick={() => navigate(`/product/${product.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="result-image">
                  <Link to={`/product/${product.id}`} onClick={(e) => e.stopPropagation()}>
                    <img src={product.image} alt={product.name} />
                  </Link>
                  {product.category && (
                    <span className="category-badge">{product.category}</span>
                  )}
                </div>
                <div className="result-info">
                  <h3>
                    <Link to={`/product/${product.id}`} onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {product.name}
                    </Link>
                  </h3>
                  {product.description && (
                    <p className="description">
                      {product.description.length > 100
                        ? `${product.description.substring(0, 97)}...`
                        : product.description}
                    </p>
                  )}
                  <div className="rating">
                    {renderStars(product.rating)}
                    <span className="reviews">({product.reviews || 0} reviews)</span>
                  </div>
                  <div className="price-section">
                    <span className="current-price">${product.price}</span>
                    {product.originalPrice && (
                      <span className="original-price">${product.originalPrice}</span>
                    )}
                  </div>
                  <div className="actions">
                    <button className="add-to-cart-btn" onClick={(e) => handleAddToCart(product, e)}>
                      <FiShoppingCart /> Add to Cart
                    </button>
                    <button
                      className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                      onClick={(e) => {
                        if (e) {
                          e.preventDefault();
                          e.stopPropagation();
                        }
                        toggleWishlist(product);
                      }}
                      style={{
                        color: isInWishlist(product.id) ? '#ff4d4f' : '#667eea',
                        borderColor: isInWishlist(product.id) ? '#ff4d4f' : '#ddd',
                        backgroundColor: isInWishlist(product.id) ? '#fff1f0' : '#f0f0f0'
                      }}
                    >
                      <FiHeart fill={isInWishlist(product.id) ? '#ff4d4f' : 'none'} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
          <Link to="/" style={{
            color: '#667eea',
            fontWeight: '600',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            ← Go back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
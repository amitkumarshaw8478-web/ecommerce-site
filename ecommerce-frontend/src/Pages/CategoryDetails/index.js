import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../Components/ProductContext';
import { useCart } from '../../Components/CartContext';
import { useWishlist } from '../../Components/WishlistContext';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { AiOutlineStar, AiFillStar } from 'react-icons/ai';
import './CategoryDetails.css';

const CategoryDetails = () => {
  const { categoryName } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState('relevant');

  const { products: allProducts } = useProducts();

  // Map frontend categories to DummyJSON categories
  const categoryMapping = {
    "Electronics": ["laptops", "mobile-accessories", "smartphones", "tablets"],
    "Fashion": ["mens-shirts", "mens-shoes", "womens-dresses", "womens-shoes", "tops"],
    "Accessories": ["mens-watches", "womens-watches", "womens-bags", "womens-jewellery", "sunglasses"],
    "Home & Garden": ["furniture", "home-decoration", "kitchen-accessories"],
    "Sports": ["sports-accessories", "motorcycle", "vehicle"],
    "Books": [] // DummyJSON does not have books
  };

  const mappedCategories = categoryMapping[categoryName] || [categoryName.toLowerCase()];
  
  const categoryProducts = allProducts.filter(product => 
    mappedCategories.includes(product.category)
  );

  const availableBrands = [...new Set(categoryProducts.map(p => p.brand).filter(Boolean))].slice(0, 5);
  const brands = availableBrands.length > 0 ? availableBrands : ["Apple", "Samsung", "Nike", "Adidas"];

  // Filter products
  const filteredProducts = categoryProducts.filter(product => {
    const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
    const brandMatch = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    return priceMatch && brandMatch;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const [notification, setNotification] = useState(null);


  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    addToCart(product);
    setNotification(`${product.name} added to cart!`);
    setTimeout(() => setNotification(null), 3000);
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i}>
        {i < Math.floor(rating) ? (
          <AiFillStar color="#FFD700" />
        ) : (
          <AiOutlineStar color="#ddd" />
        )}
      </span>
    ));
  };

  return (
    <div className="category-details">
      {notification && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 1050,
          padding: '16px 24px',
          borderRadius: '12px',
          color: '#ffffff',
          fontWeight: '500',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          animation: 'slideInRight 0.3s ease-out forwards'
        }}>
          {notification}
        </div>
      )}
      <div className="category-header">
        <div className="container">
          <h1 className="category-title">{categoryName}</h1>
          <p className="category-description">Explore our collection of {categoryName}</p>
        </div>
      </div>

      <div className="container">
        <div className="row">
          <div className="col-md-3">
            <div className="category-filters">
              <div className="filter-group">
                <div className="filter-title">Sort By</div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-select"
                >
                  <option value="relevant">Most Relevant</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>

              <div className="filter-group">
                <div className="filter-title">Price Range</div>
                <input
                  type="range"
                  min="0"
                  max="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="form-range"
                />
                <small>${priceRange[0]} - ${priceRange[1]}</small>
              </div>

              <div className="filter-group">
                <div className="filter-title">Brand</div>
                {brands.map(brand => (
                  <div key={brand} className="filter-option">
                    <input
                      type="checkbox"
                      id={brand}
                      checked={selectedBrands.includes(brand)}
                      onChange={() => handleBrandToggle(brand)}
                    />
                    <label htmlFor={brand}>{brand}</label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="col-md-9">
            {sortedProducts.length > 0 ? (
              <div className="products-grid">
                {sortedProducts.map(product => (
                  <div 
                    key={product.id} 
                    className="product-card"
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <Link to={`/product/${product.id}`} onClick={(e) => e.stopPropagation()}>
                      <img src={product.image} alt={product.name} className="product-image" />
                    </Link>
                    <div className="product-info">
                      <div className="product-name">
                        <Link to={`/product/${product.id}`} onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {product.name}
                        </Link>
                      </div>
                      <div className="product-price">
                        <span className="current-price">${product.price}</span>
                        <span className="original-price">${product.originalPrice}</span>
                      </div>
                      <div className="product-rating">
                        {renderStars(product.rating)}
                        <span>({product.reviews})</span>
                      </div>
                      <div className="product-actions">
                        <button
                          className="add-to-cart-btn"
                          onClick={(e) => handleAddToCart(product, e)}
                        >
                          <FiShoppingCart /> Add
                        </button>
                        <button 
                          className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                          onClick={(e) => {
                            if (e) e.stopPropagation();
                            toggleWishlist(product);
                          }}
                        >
                          <FiHeart fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-products">
                No products found matching your filters. Try adjusting your search criteria.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryDetails;

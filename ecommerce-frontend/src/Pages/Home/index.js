import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../Components/ProductContext';
import { useCart } from '../../Components/CartContext';
import { useWishlist } from '../../Components/WishlistContext';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { AiOutlineStar } from 'react-icons/ai';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Banner images
  const banners = [
    {
      id: 1,
      title: "Summer Collection",
      description: "Up to 50% off on all items",
      image: "data:image/webp;base64,UklGRmgHAABXRUJQVlA4IFwHAACQNACdASqtALQAPp1Im0olpKIpK/TqUSATiWVuMPV1+h0hSdcrf89Mn/n3d38apeJk9boWhYzblj+YB6T3hQg/LkNYr6onaXpGM4IJmF0tojy9HGu0ClGLxJKsBzmY4GX7e2QQidb7F1sNDld2IcTrdV1PFycgRks7By4DVsiBO1G7iRzWnce4AlF3UoLxfV4j3uFSSE6/dhY+Ry/BDGOx6dLNGJAjKuAC7p8tfAep+fGjJWGAwkR01U/cZr+SA+H7yVLxklcr5hxjlqL2te7eOYO5kZYFr3nQtbk19O05yMOKyY2zMLVeL7pUxB7KOZ0VeFKAKIC47MWEc7zvv+aG9i51LF+pxuuFBtLwKLCDHo3YNMgiMlMbDKpJmlKzTEw/m+bu83kz61w147cAQlp15Ze7CCGzkudHNGDWVD3iS+Q8SVHBzo6xuAInkywdJnbpT6rQpykTFOW7y45aXKdXaqKZle7ApAZvhDgdzuHpdniMvODEgmgwafAt4m0HQ40gcGNSZdoowOfCufO//XchXYLkGtd7HMlKpnEnJ7r6h56Tvvj2cN4xiYQ8XAAA/vnGDzeTMQ1YXHJFtPBYa2b3mnb7FxsAg4plPqaqteGXA4j73EgNsQPrFDFxUcg2qGAUtvgD3OEfU5TMNmn1qls0boLNSUBTF2DfTCBqeBxGHT5e+pSh7RkbFRy4OmYw0K1JtMh0qVDKQuTgxisx1On0uDpyUApvo/70kULwj2HNNZXTCnI/PILeQ7xtmr6cVupvk+qYnytVUSXzpSBtu1EtHUarII8aALc9UzfuAPunE2f7+QJpLMeT/U+2eP1WWoC2tpRm0t/De3Kyi7SR8JjTkSROutnD2ob5tQ4MwZd1Pg+iSoU1KBhHgSluJt1e05sut0ka3UGGvwAS0/vHHPFGuCu1xmsUBo1SRX3gI4Yx2HGNcmIX852ERNVoukg9XWV6gt7KD5u7+h/OAx1tUwDy86czoIP0kfbi2y4BKTkgmcWVDty9+MlNU73zx1q/N3oMx2kxj7A92ievLhrjXwdgKPjP++cusDbYo5mBM8AV0rELx+U0X/guOqOnLMMiSrf0SI981H3wsQyDNdAX12qLxovYcX2QoBrCg+LhegUIdwmoai/etAnHkvG5Nwf37E0qvjAuVx1NNhZ+sfyBlLPjtdrmVJeF+t4AYD7gXNtqIBcJGy6jzIbEc2eZE+3dvz0oFAIzNGqEgmPUIGrdiYLbyhUDKGMmIJM2iRk9VwG4bjfBBR6NtNC6AhsKOqQ2P0rfm5AXxvtkwhRDMT9L4dWJ6nT7e1mhmZZyOXaJaJfT6Cfrhqme8ZQvtQsswZ2F7rNDC9Ohzf7CkYqs4JjioEEnDZsiv4aTAbcFSoDcxNKiabb7GlGlJfMC0+kUYcBK4GbnjTcXkaEB2qFHona4GPyjTAwRM7cYrXHzrZN2iRQ+ikrjRPkHiRQuUJw15ve/yiicG3AzTi8L0KcNeBaAhEhlspWFeYA4963nG1mQwTAXzxdJoQEdCwhGvtgb/FB5GNcXRpukiKnH3wudut3pytUtVrAjh9NLABbZhJQcUlLfjs6NrWOxSwi7INc2OYnoPvam2kmRL29nSiSwjzMs7cwL0NQRUP9efXY2iObdAC6NvZS2Qj8sRDxeBvodD7Pz8bcEdG3QS8kMGbT2/1eqK5vhDfjx2/CW+pviTLyVfPubRQgrXGAQBfCz9x89DgjzCxfVbfhrHmb1yl9mQTiTE1LB1W8qWtFlTLFXgZ7DexjMsvrTh7LSURXZpHOyTbluw0/wAMnVgY1vw8j1sBJV5wfatsfZc6OHvaOl1k6u4MDmNvicp3dAHYrvZhyN5O1tN6kKVl2Y5rl29z+aDDt+7hqhqkCQ1oqzW0aNo77WBs7uws/4RyMBcCaZmy21rUaQ4m9dDFOvfqTsAHKC3BZ1NGBQmD3KwJQ/+HpfFNUBFx/g8NlJWYAk4hC8mtsiRT7l/ahfKrCmjLmwhBmuVquuAk/nuAbXyMyiA4diG6HGAwZkbYz32HrD66Z2cRc2v8RAGna3XUFdK04NL+jZkWV5a44YrLMOgnV88Wl9SwxL+F3p9bKxuHJAwZKvV/+ncHxMd2eXyr88zRlBW8QZdRGZHjC6EsDdRc6UHgiqW/Ord8OEQm0wTe/nGCZ3nvOzVQVBTo5koK2Er5oPQs30A2j0XsEM8wGfXYNcnnnqBKaE8rIjgpeun6AYpwBiWfBAzucDFbrmwo7knCqVXpcJLUFhPRSM4RxqRV5SrIjkAF78oJldCk9PB4vbMBQnB5aw13m8e7NR8+uBkrLvtVDZpLkSnGAhzE0V13woldYjm2HdEYB209bN0KEFKSmHbK8/KfjnBQ3v8tMZXHKc+MWb17SZhH4h6hWEXFHIUdGafR/VFW0V8lUcpjLjSMhxesHTn8qT1IMPLaVk5w8cCKRJA2Dngf7qmAMHs2ypUH06AAHWLxUnoAaqXvGnbXUuh1feqp9X8aJTFXDZfnZMUigAAAA="
    },
    {
      id: 2,
      title: "New products",
      description: "Latest trends just arrived",
      image: "https://th.bing.com/th/id/OIP.gP_MDG24J9dTa9hcfklVZwHaDL?w=319&h=150&c=7&r=0&o=7&pid=1.7&rm=3"
    },
    {
      id: 3,
      title: "Exclusive Deals",
      description: "Limited time offers",
      image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=1200&h=400&fit=crop"
    }
  ];

  const { products } = useProducts();

  // Categories
  const categories = [
    { id: 1, name: "Electronics", icon: "📱", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=150&h=150&fit=crop" },
    { id: 2, name: "Fashion", icon: "👗", image: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=150&h=150&fit=crop" },
    { id: 3, name: "Accessories", icon: "👜", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=150&h=150&fit=crop" },
    { id: 4, name: "Home & Garden", icon: "🏠", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=150&h=150&fit=crop" },
    { id: 5, name: "Sports", icon: "⚽", image: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=150&h=150&fit=crop" },
    { id: 6, name: "Books", icon: "📚", image: "https://images.unsplash.com/photo-1507842217343-583f20270319?w=150&h=150&fit=crop" },
  ];


  const handleAddToCart = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    addToCart(product);

    // Show notification
    setNotification({
      message: `${product.name} added to cart!`,
      type: 'success'
    });
    
    // Auto-hide notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  };

  const handleShopNowClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const target = document.getElementById('featured-products');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderStars = (rating) => {
    return (
      <div className="stars">
        {[...Array(5)].map((_, i) => (
          <AiOutlineStar
            key={i}
            className={i < Math.floor(rating) ? 'filled' : ''}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="homepage">
      {/* Notification Toast */}
      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}
      {/* Hero Banner Section */}
      <section className="hero-banner">
        <Swiper
          modules={[Pagination, Navigation, Autoplay]}
          pagination={{ clickable: true }}
          navigation
          autoplay={{ delay: 5000 }}
          loop
          className="banner-swiper"
        >
          {banners.map(banner => (
            <SwiperSlide key={banner.id}>
              <div 
                className="banner-slide" 
                onClick={handleShopNowClick}
                style={{ cursor: 'pointer' }}
              >
                <img src={banner.image} alt={banner.title} />
                <div className="banner-content">
                  <h1>{banner.title}</h1>
                  <p>{banner.description}</p>
                  <button className="banner-btn" onClick={handleShopNowClick}>Shop Now</button>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <Link key={category.id} to={`/category/${category.name}`} className="category-card">
                <div className="category-image">
                  <img src={category.image} alt={category.name} />
                </div>
                <p className="category-name">{category.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="featured-products" id="featured-products">
        <div className="container">
          <h2 className="section-title">Featured Products</h2>
          <div className="products-grid">
            {products.map(product => (
              <div 
                key={product.id} 
                className="product-card"
                onClick={() => navigate(`/product/${product.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="product-image-wrapper">
                  <Link to={`/product/${product.id}`} onClick={(e) => e.stopPropagation()}>
                    <img src={product.image} alt={product.name} className="product-image" />
                  </Link>
                  <div className="product-discount">{product.discount}% OFF</div>
                  <button
                    className={`wishlist-btn ${isInWishlist(product.id) ? 'active' : ''}`}
                    onClick={(e) => {
                      if (e) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                      toggleWishlist(product);
                    }}
                  >
                    <FiHeart fill={isInWishlist(product.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className="product-info">
                  <h3 className="product-name">
                    <Link to={`/product/${product.id}`} onClick={(e) => e.stopPropagation()} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {product.name}
                    </Link>
                  </h3>
                  <div className="product-rating">
                    {renderStars(product.rating)}
                    <span className="rating-text">({product.reviews})</span>
                  </div>
                  <div className="product-price">
                    <span className="current-price">${product.price}</span>
                    <span className="original-price">${product.originalPrice}</span>
                  </div>
                  <button className="add-to-cart-btn" onClick={(e) => handleAddToCart(product, e)}>
                    <FiShoppingCart /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Offer Section */}
      <section className="special-offer">
        <div className="container">
          <div className="offer-content">
            <div className="offer-text">
              <h2>Summer Sale Extravaganza</h2>
              <p>Get up to 60% discount on selected items</p>
              <button className="offer-btn" onClick={handleShopNowClick}>Start Shopping</button>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="newsletter-section">
        <div className="container">
          <div className="newsletter-content">
            <h2>Subscribe to Our Newsletter</h2>
            <p>Get exclusive deals, new arrivals & more delivered to your inbox</p>
            <form className="newsletter-form">
              <input
                type="email"
                placeholder="Enter your email address"
                required
              />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>About Us</h4>
              <ul>
                <li><a href="#home">Our Story</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#press">Press</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Customer Service</h4>
              <ul>
                <li><a href="#contact">Contact Us</a></li>
                <li><a href="#shipping">Shipping Info</a></li>
                <li><a href="#returns">Returns</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Legal</h4>
              <ul>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms & Conditions</a></li>
                <li><a href="#cookies">Cookie Policy</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Follow Us</h4>
              <div className="social-links">
                <a href="#facebook">Facebook</a>
                <a href="#twitter">Twitter</a>
                <a href="#instagram">Instagram</a>
                <a href="#linkedin">LinkedIn</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 ECommerce Site. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
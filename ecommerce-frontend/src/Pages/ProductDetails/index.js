import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProducts } from '../../Components/ProductContext';
import { useCart } from '../../Components/CartContext';
import { useWishlist } from '../../Components/WishlistContext';
import { FiShoppingCart, FiHeart, FiMinus, FiPlus, FiArrowLeft, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';
import { AiOutlineStar, AiFillStar } from 'react-icons/ai';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load product and wishlist
  useEffect(() => {
    if (!loading && products.length > 0) {
      const foundProduct = products.find(p => p.id === Number(id));
      if (foundProduct) {
        setProduct(foundProduct);
        setActiveImage(foundProduct.images?.[0] || foundProduct.image);
      } else {
        // Fallback: Fetch directly from API if not found in context (e.g. newly added/modified or direct link)
        fetch(`https://dummyjson.com/products/${id}`)
          .then(res => res.json())
          .then(data => {
            const mapped = {
              ...data,
              name: data.title,
              image: data.thumbnail,
              discount: Math.round(data.discountPercentage),
              originalPrice: (data.price / (1 - (data.discountPercentage || 0) / 100)).toFixed(2),
              reviews: data.reviews ? data.reviews : []
            };
            setProduct(mapped);
            setActiveImage(mapped.images?.[0] || mapped.image);
          })
          .catch(err => {
            console.error("Error fetching product detail:", err);
          });
      }
    }
  }, [id, products, loading]);

  if (loading && !product) {
    return (
      <div className="product-details-loading">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mt-5 text-center">
        <h2>Product Not Found</h2>
        <p>The product you are looking for does not exist or has been removed.</p>
        <Link to="/" className="btn btn-primary mt-3">
          <FiArrowLeft className="me-2" /> Back to Shop
        </Link>
      </div>
    );
  }

  const isCurrentlyInWishlist = product ? isInWishlist(product.id) : false;
 
  const handleToggleWishlist = () => {
    toggleWishlist(product);
 
    // Show notification
    setNotification({
      message: isCurrentlyInWishlist ? 'Removed from Wishlist' : 'Added to Wishlist!',
      type: 'info'
    });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddToCart = () => {
    // Add to cart with selected quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    
    setIsAddedToCart(true);
    setNotification({
      message: `${quantity} ${quantity > 1 ? 'items' : 'item'} added to cart!`,
      type: 'success'
    });
    
    setTimeout(() => {
      setIsAddedToCart(false);
      setNotification(null);
    }, 3000);
  };

  const handleBuyNow = () => {
    // Add to cart with selected quantity
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    // Directly go to checkout page
    navigate('/checkout');
  };

  const handleQuantityChange = (val) => {
    if (val < 1) return;
    if (product.stock && val > product.stock) return;
    setQuantity(val);
  };

  const renderStars = (rating) => {
    return (
      <div className="rating-stars-wrapper">
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

  // Find related products (same category, excluding current product)
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="product-details-page">
      {/* Toast Notification */}
      {notification && (
        <div className={`detail-toast-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="container py-4">
        {/* Breadcrumb Navigation */}
        <nav aria-label="breadcrumb" className="details-breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/">Home</Link></li>
            <li className="breadcrumb-item"><Link to={`/category/${product.category}`}>{product.category}</Link></li>
            <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        {/* Back button */}
        <button className="back-btn-pill mb-4" onClick={() => navigate(-1)}>
          <FiArrowLeft className="me-2" /> Back
        </button>

        <div className="row g-5">
          {/* Left Column: Product Images Gallery */}
          <div className="col-lg-6">
            <div className="product-gallery-container">
              {/* Main Image Frame with Zoom Effect */}
              <div className="main-image-viewport">
                {product.discount > 0 && (
                  <span className="badge-discount-percent">-{product.discount}% OFF</span>
                )}
                <img src={activeImage} alt={product.name} className="img-fluid main-product-image" />
              </div>
              
              {/* Thumbnails list */}
              {product.images && product.images.length > 1 && (
                <div className="thumbnails-flex-row mt-3">
                  {product.images.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`thumbnail-card ${activeImage === img ? 'selected-thumbnail' : ''}`}
                      onClick={() => setActiveImage(img)}
                    >
                      <img src={img} alt={`${product.name} thumb ${idx}`} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Product Detail Buying Panel */}
          <div className="col-lg-6">
            <div className="product-purchase-panel">
              {product.brand && (
                <span className="product-brand-tag">{product.brand}</span>
              )}
              <h1 className="product-details-title">{product.name}</h1>
              
              {/* Reviews and Ratings Summary */}
              <div className="ratings-summary-row mb-3">
                {renderStars(product.rating)}
                <span className="rating-score-value ms-2">{product.rating}</span>
                <span className="divider-dot"></span>
                <span className="reviews-count-link">
                  {product.reviews && Array.isArray(product.reviews) ? product.reviews.length : product.reviews} Customer Reviews
                </span>
              </div>

              {/* Pricing Grid */}
              <div className="pricing-grid-card mb-4">
                <div className="d-flex align-items-center flex-wrap gap-3">
                  <span className="detail-price-current">${product.price}</span>
                  {product.originalPrice > product.price && (
                    <>
                      <span className="detail-price-original">${product.originalPrice}</span>
                      <span className="detail-price-savings">Save ${(product.originalPrice - product.price).toFixed(2)}</span>
                    </>
                  )}
                </div>
                
                {/* Stock status indicator */}
                <div className="stock-status-wrapper mt-3">
                  {product.stock > 0 ? (
                    <span className={`stock-status-badge ${product.stock < 10 ? 'stock-low' : 'stock-in'}`}>
                      {product.stock < 10 ? `Only ${product.stock} left in stock!` : 'In Stock & Ready to Ship'}
                    </span>
                  ) : (
                    <span className="stock-status-badge stock-out">Out of Stock</span>
                  )}
                </div>
              </div>

              {/* Short Description excerpt */}
              <p className="product-short-description-excerpt mb-4">
                {product.description}
              </p>

              {/* Purchase Controls Area */}
              {product.stock > 0 && (
                <div className="purchase-controls-row mb-4">
                  {/* Custom Quantity incrementer */}
                  <div className="quantity-incrementer-wrapper me-3">
                    <span className="qty-label-prefix d-none d-sm-inline">Qty:</span>
                    <button 
                      className="qty-adjust-btn"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                    >
                      <FiMinus />
                    </button>
                    <span className="qty-current-value">{quantity}</span>
                    <button 
                      className="qty-adjust-btn"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={product.stock && quantity >= product.stock}
                    >
                      <FiPlus />
                    </button>
                  </div>

                  {/* Add to Cart Actions */}
                  <button 
                    className={`btn-purchase-add-cart flex-grow-1 ${isAddedToCart ? 'added-success' : ''}`}
                    onClick={handleAddToCart}
                  >
                    <FiShoppingCart className="me-2" />
                    {isAddedToCart ? 'Added to Cart!' : 'Add to Cart'}
                  </button>

                  {/* Buy Now Action */}
                  <button 
                    className="btn-purchase-buy-now flex-grow-1"
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </button>

                  {/* Wishlist Icon Button */}
                  <button 
                    className={`btn-purchase-wishlist ms-3 ${isCurrentlyInWishlist ? 'active' : ''}`}
                    onClick={handleToggleWishlist}
                    title="Add to Wishlist"
                  >
                    <FiHeart fill={isCurrentlyInWishlist ? 'currentColor' : 'none'} />
                  </button>
                </div>
              )}

              {/* Delivery and Trust Guarantees */}
              <div className="trust-guarantees-grid py-3 border-top border-bottom my-4">
                <div className="row g-3">
                  <div className="col-4 text-center border-end">
                    <FiTruck className="guarantee-icon" />
                    <p className="guarantee-text mt-1">Free Delivery</p>
                  </div>
                  <div className="col-4 text-center border-end">
                    <FiShield className="guarantee-icon" />
                    <p className="guarantee-text mt-1">1 Year Warranty</p>
                  </div>
                  <div className="col-4 text-center">
                    <FiRefreshCw className="guarantee-icon" />
                    <p className="guarantee-text mt-1">30 Day Return</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs Section */}
        <section className="product-details-tabs-section mt-5 pt-3">
          <div className="tabs-nav-bar d-flex border-bottom mb-4">
            <button 
              className={`tab-nav-item-btn ${activeTab === 'description' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`tab-nav-item-btn ${activeTab === 'specifications' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button 
              className={`tab-nav-item-btn ${activeTab === 'reviews' ? 'active-tab' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.reviews && Array.isArray(product.reviews) ? product.reviews.length : 0})
            </button>
          </div>

          <div className="tab-content-panel p-2">
            {activeTab === 'description' && (
              <div className="tab-pane-fade-in">
                <h4 className="mb-3">Product Description</h4>
                <p className="text-secondary-custom">{product.description}</p>
                <p className="text-secondary-custom">
                  This premium product is constructed from high-grade materials and is engineered to provide superior performance and long-lasting durability. With exceptional design attention and strict quality control standards, it delivers unmatched value for its category.
                </p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="tab-pane-fade-in">
                <h4 className="mb-3">Product Specifications</h4>
                <div className="table-responsive">
                  <table className="table table-striped table-bordered specs-data-table">
                    <tbody>
                      <tr>
                        <th>Brand</th>
                        <td>{product.brand || 'Generic'}</td>
                      </tr>
                      <tr>
                        <th>Category</th>
                        <td>{product.category}</td>
                      </tr>
                      <tr>
                        <th>SKU</th>
                        <td>{product.sku || 'N/A'}</td>
                      </tr>
                      <tr>
                        <th>Weight</th>
                        <td>{product.weight ? `${product.weight} kg` : 'N/A'}</td>
                      </tr>
                      {product.dimensions && (
                        <tr>
                          <th>Dimensions (W x H x D)</th>
                          <td>
                            {product.dimensions.width} x {product.dimensions.height} x {product.dimensions.depth} cm
                          </td>
                        </tr>
                      )}
                      <tr>
                        <th>Warranty Info</th>
                        <td>{product.warrantyInformation || '1 year local manufacturer warranty'}</td>
                      </tr>
                      <tr>
                        <th>Shipping Info</th>
                        <td>{product.shippingInformation || 'Ships in 3-5 business days'}</td>
                      </tr>
                      <tr>
                        <th>Return Policy</th>
                        <td>{product.returnPolicy || '30 days standard return policy'}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="tab-pane-fade-in">
                <h4 className="mb-4">Customer Feedback</h4>
                {product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0 ? (
                  <div className="reviews-scroller-list">
                    {product.reviews.map((rev, idx) => (
                      <div key={idx} className="review-comment-card mb-3 p-3 rounded shadow-sm border bg-white">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="reviewer-name mb-0">{rev.reviewerName || 'Anonymous'}</h6>
                          <span className="review-timestamp-text">{new Date(rev.date).toLocaleDateString()}</span>
                        </div>
                        <div className="review-star-rating mb-2">
                          {renderStars(rev.rating)}
                        </div>
                        <p className="review-comment-text mb-0 text-muted">{rev.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-reviews-placeholder py-4 text-center text-muted">
                    <p>There are no reviews for this product yet.</p>
                    <p className="small">Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <section className="related-products-carousel-section mt-5 pt-4 border-top">
            <h2 className="section-title mb-4">Related Products</h2>
            <div className="row g-4">
              {relatedProducts.map(related => (
                <div key={related.id} className="col-6 col-md-3">
                  <div className="related-product-item-card shadow-sm h-100 d-flex flex-column bg-white">
                    <Link to={`/product/${related.id}`} className="related-img-wrapper">
                      <img src={related.image} alt={related.name} className="img-fluid" />
                    </Link>
                    <div className="p-3 d-flex flex-column flex-grow-1">
                      <h4 className="related-item-title mb-2">
                        <Link to={`/product/${related.id}`}>{related.name}</Link>
                      </h4>
                      <div className="related-price-row mt-auto">
                        <span className="related-price-val">${related.price}</span>
                        {related.originalPrice > related.price && (
                          <span className="related-price-orig ms-2">${related.originalPrice}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;

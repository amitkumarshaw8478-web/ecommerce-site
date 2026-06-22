import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../Components/CartContext';
import { FiMinus, FiPlus, FiTrash2 } from 'react-icons/fi';

import './Cart.css';

const Cart = () => {
  const { cartItems, cartTotal, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <div className="container mt-5">
        <h1 className="cart-title">My Cart</h1>

        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <div className="empty-cart-icon">🛒</div>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added anything to your cart yet.</p>
            <Link to="/" className="btn btn-primary mt-3">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="row">
            {/* Left Side: Cart Items */}
            <div className="col-md-8">
              <div className="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item">
                    {/* Product Image */}
                    <div className="item-image">
                      <Link to={`/product/${item.id}`}>
                        <img src={item.image || item.thumbnail} alt={item.name || item.title} />
                      </Link>
                    </div>

                    {/* Product Details */}
                    <div className="item-details">
                      <h3>
                        <Link to={`/product/${item.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                          {item.name || item.title}
                        </Link>
                      </h3>
                      <p className="item-price">${item.price}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="item-quantity">
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <FiMinus />
                      </button>
                      <span className="qty-input">{item.quantity}</span>
                      <button 
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <FiPlus />
                      </button>
                    </div>

                    {/* Total Price */}
                    <div className="item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>

                    {/* Remove Button */}
                    <button 
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                      title="Remove Item"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="mt-4">
                <Link to="/" className="continue-shopping-link">
                  ← Continue Shopping
                </Link>
              </div>
            </div>

            {/* Right Side: Summary */}
            <div className="col-md-4">
              <div className="cart-summary">
                <h2>Order Summary</h2>
                
                <div className="summary-row">
                  <span>Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                
                <div className="summary-row">
                  <span>Shipping</span>
                  <span className="free-shipping">FREE</span>
                </div>
                
                <div className="summary-row">
                  <span>Estimated Tax</span>
                  <span>$0.00</span>
                </div>
                
                <hr />
                
                <div className="summary-row total">
                  <span>Total</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>

                <button
                  className="checkout-btn"
                  onClick={handleCheckout}
                >
                  Proceed to Checkout
                </button>
                
                <div className="payment-methods mt-4 text-center">
                  <p className="text-muted small mb-2">We accept</p>
                  <div className="d-flex justify-content-center gap-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" height="20" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" height="20" />
                    <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" height="20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;

import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiTruck, FiClock, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';
import './OrderConfirmation.css';
import './OrderConfirmation.css';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get order data from location state
    if (location.state && location.state.orderData) {
      setOrderData(location.state.orderData);
      // Save order to localStorage for history
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(location.state.orderData);
      localStorage.setItem('orders', JSON.stringify(orders));
    } else {
      // If no order data, redirect to home
      navigate('/');
    }
    setLoading(false);
  }, [location.state, navigate]);

  if (loading) {
    return <div className="container text-center mt-5"><h2>Loading...</h2></div>;
  }

  if (!orderData) {
    return (
      <div className="container mt-5 text-center">
        <h2>No order found</h2>
        <Link to="/" className="btn btn-primary">Back to Home</Link>
      </div>
    );
  }

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  return (
    <div className="order-confirmation-page">
      <div className="container">
        {/* Success Header */}
        <div className="confirmation-header">
          <div className="success-icon">
            <FiCheckCircle />
          </div>
          <h1>Order Confirmed!</h1>
          <p>Thank you for your purchase. Your order has been successfully placed.</p>
        </div>

        <div className="row">
          {/* Order Details */}
          <div className="col-lg-8">
            {/* Order Info Card */}
            <div className="card confirmation-card">
              <div className="card-header">
                <h3>Order Information</h3>
              </div>
              <div className="card-body">
                <div className="info-row">
                  <label>Order Number:</label>
                  <span className="order-number">#{orderData.orderId}</span>
                </div>
                <div className="info-row">
                  <label>Order Date:</label>
                  <span>{new Date(orderData.orderDate).toLocaleDateString()}</span>
                </div>
                <div className="info-row">
                  <label>Estimated Delivery:</label>
                  <span>{estimatedDelivery.toLocaleDateString()}</span>
                </div>
                <div className="info-row">
                  <label>Total Amount:</label>
                  <span className="total-amount">${orderData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="card confirmation-card">
              <div className="card-header">
                <FiMapPin /> Shipping Address
              </div>
              <div className="card-body">
                <p>
                  <strong>{orderData.shippingInfo.firstName} {orderData.shippingInfo.lastName}</strong><br />
                  {orderData.shippingInfo.address}<br />
                  {orderData.shippingInfo.city}, {orderData.shippingInfo.state} {orderData.shippingInfo.zipCode}
                </p>
                <div className="contact-info">
                  <p><FiPhone /> {orderData.shippingInfo.phone}</p>
                  <p><FiMail /> {orderData.shippingInfo.email}</p>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="card confirmation-card">
              <div className="card-header">
                <h3>Order Items</h3>
              </div>
              <div className="card-body">
                <table className="items-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderData.items.map(item => (
                      <tr key={item.id}>
                        <td>
                          <div className="item-info">
                            <img src={item.image} alt={item.name} className="item-image" />
                            <span>{item.name}</span>
                          </div>
                        </td>
                        <td>{item.quantity}</td>
                        <td>${item.price.toFixed(2)}</td>
                        <td>${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Summary */}
            <div className="card confirmation-card">
              <div className="card-body">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>${orderData.subtotal.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Shipping:</span>
                  <span>FREE</span>
                </div>
                <div className="summary-row">
                  <span>Tax:</span>
                  <span>${orderData.tax.toFixed(2)}</span>
                </div>
                <hr />
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>${orderData.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="col-lg-4">
            {/* Delivery Status */}
            <div className="card confirmation-card">
              <div className="card-header">
                <FiTruck /> Delivery Status
              </div>
              <div className="card-body">
                <div className="status-timeline">
                  <div className="status-step active">
                    <div className="step-icon completed">
                      <FiCheckCircle />
                    </div>
                    <div className="step-info">
                      <h4>Order Confirmed</h4>
                      <p>Today</p>
                    </div>
                  </div>
                  <div className="status-step">
                    <div className="step-icon">
                      <FiClock />
                    </div>
                    <div className="step-info">
                      <h4>Processing</h4>
                      <p>1-2 days</p>
                    </div>
                  </div>
                  <div className="status-step">
                    <div className="step-icon">
                      <FiTruck />
                    </div>
                    <div className="step-info">
                      <h4>Shipped</h4>
                      <p>2-3 days</p>
                    </div>
                  </div>
                  <div className="status-step">
                    <div className="step-icon">
                      <FiMapPin />
                    </div>
                    <div className="step-info">
                      <h4>Delivered</h4>
                      <p>3-5 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="card confirmation-card">
              <div className="card-header">
                <h3>What's Next?</h3>
              </div>
              <div className="card-body">
                <ul className="next-steps">
                  <li>You will receive an email confirmation shortly</li>
                  <li>Track your order in your account dashboard</li>
                  <li>We'll notify you when your order ships</li>
                  <li>Delivery estimated in 3-5 business days</li>
                </ul>
              </div>
            </div>

            {/* Actions */}
            <div className="confirmation-actions">
              <Link to="/account" className="btn btn-primary btn-block">
                View Order History
              </Link>
              <Link to="/" className="btn btn-outline-primary btn-block">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
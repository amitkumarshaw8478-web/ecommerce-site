import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiShoppingBag, FiHeart, FiSettings, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../Components/AuthContext';
import './Account.css';

const Account = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [orders, setOrders] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    // We already have `user` from AuthContext, but we might want to populate edit form
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }

    // Load orders from localStorage
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      // Mock orders for demo
      setOrders([
        {
          id: 1,
          date: '2024-01-15',
          status: 'Delivered',
          total: 129.99,
          items: ['Premium Wireless Headphones']
        },
        {
          id: 2,
          date: '2024-01-10',
          status: 'Shipped',
          total: 89.99,
          items: ['Smart Watch']
        }
      ]);
    }

    // Load wishlist correctly for logged in user
    const wishlistKey = user ? `wishlistItems_${user.username || user.email}` : 'wishlistItems';
    const savedWishlist = localStorage.getItem(wishlistKey);
    if (savedWishlist) {
      setWishlist(JSON.parse(savedWishlist));
    }
  }, [user]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    // In a real app this would call an API to update user profile
    // Here we'll just update localStorage user object for frontend demo purposes
    try {
      const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
      const isRemembered = !!localStorage.getItem('user');
      const storage = isRemembered ? localStorage : sessionStorage;
      
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        parsed.name = editForm.name;
        parsed.phone = editForm.phone;
        parsed.address = editForm.address;
        
        storage.setItem('user', JSON.stringify(parsed));
        // We'd ideally need a setUser in context, but refreshing or logging back in works for dummy
        window.location.reload(); 
      }
    } catch(err) {
      console.error(err);
    }

    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    if (user) {
      setEditForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || ''
      });
    }
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const renderProfile = () => (
    <div className="account-section">
      <h3>Profile Information</h3>
      {user ? (
        <div className="profile-info">
          {isEditing ? (
            <div className="edit-profile-form">
              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Email:</label>
                <input
                  type="email"
                  value={editForm.email}
                  disabled
                  title="Email cannot be changed"
                  className="disabled-input"
                />
              </div>
              <div className="form-group">
                <label>Phone:</label>
                <input
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                  placeholder="Enter your phone number"
                />
              </div>
              <div className="form-group">
                <label>Address:</label>
                <textarea
                  value={editForm.address}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                  placeholder="Enter your address"
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" onClick={handleSaveProfile}>Save Changes</button>
                <button className="btn btn-secondary" onClick={handleCancelEdit}>Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="info-group">
                <label>Name:</label>
                <span>{user.name || 'Not provided'}</span>
              </div>
              <div className="info-group">
                <label>Email:</label>
                <span>{user.email || 'Not provided'}</span>
              </div>
              <div className="info-group">
                <label>Phone:</label>
                <span>{user.phone || 'Not provided'}</span>
              </div>
              <div className="info-group">
                <label>Address:</label>
                <span>{user.address || 'Not provided'}</span>
              </div>
              <button className="btn btn-primary mt-3" onClick={handleEditProfile}>Edit Profile</button>
            </>
          )}
        </div>
      ) : (
        <div className="login-prompt">
          <p>Please log in to view your profile.</p>
          <Link to="/login" className="btn btn-primary">Login</Link>
        </div>
      )}
    </div>
  );

  const renderOrders = () => (
    <div className="account-section">
      <h3>Order History</h3>
      {orders.length > 0 ? (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.orderId || order.id} className="order-item">
              <div className="order-header">
                <span>Order #{order.orderId || order.id}</span>
                <span className={`order-status ${order.status ? order.status.toLowerCase() : 'confirmed'}`}>{order.status || 'Confirmed'}</span>
              </div>
              <div className="order-details">
                <p>Date: {order.orderDate ? new Date(order.orderDate).toLocaleDateString() : order.date}</p>
                <p>Items: {Array.isArray(order.items) ? 
                  (order.items.length > 0 ? 
                    (typeof order.items[0] === 'string' ? order.items.join(', ') : `${order.items.length} item(s)`) 
                    : 'N/A') 
                  : order.items}</p>
                <p>Total: ${order.total || 0}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No orders found.</p>
      )}
    </div>
  );

  const renderWishlist = () => (
    <div className="account-section">
      <h3>My Wishlist</h3>
      {wishlist.length > 0 ? (
        <div className="wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {wishlist.map(item => (
            <div key={item.id} className="wishlist-item" style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', textAlign: 'center' }}>
              <img src={item.image || '/placeholder-image.jpg'} alt={item.name || 'Product'} style={{ width: '100%', height: '150px', objectFit: 'contain' }} />
              <h4 style={{ margin: '10px 0', fontSize: '16px' }}>{item.name || 'Unknown Product'}</h4>
              <p style={{ color: '#6366f1', fontWeight: 'bold' }}>${item.price || 0}</p>
              <button className="btn btn-primary" style={{ width: '100%', padding: '8px' }}>Add to Cart</button>
            </div>
          ))}
        </div>
      ) : (
        <p>Your wishlist is empty. <Link to="/">Start shopping</Link></p>
      )}
    </div>
  );

  const renderSettings = () => (
    <div className="account-section">
      <h3>Account Settings</h3>
      <div className="settings-options">
        <div className="setting-item">
          <h4>Notifications</h4>
          <p>Manage your notification preferences</p>
          <button className="btn btn-outline-primary">Configure</button>
        </div>
        <div className="setting-item">
          <h4>Privacy</h4>
          <p>Control your privacy settings</p>
          <button className="btn btn-outline-primary">Manage</button>
        </div>
        <div className="setting-item">
          <h4>Security</h4>
          <p>Change password and security settings</p>
          <button className="btn btn-outline-primary" onClick={() => navigate('/reset-password')}>Update Password</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="account-page">
      <div className="container">
        <div className="account-header">
          <h1>My Account</h1>
          {user && (
            <button className="logout-btn btn btn-outline-danger" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FiLogOut /> Logout
            </button>
          )}
        </div>

        <div className="account-content">
          <div className="account-sidebar">
            <nav className="account-nav">
              <button
                className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                <FiUser /> Profile
              </button>
              <button
                className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <FiShoppingBag /> Orders
              </button>
              <button
                className={`nav-item ${activeTab === 'wishlist' ? 'active' : ''}`}
                onClick={() => setActiveTab('wishlist')}
              >
                <FiHeart /> Wishlist
              </button>
              <button
                className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => setActiveTab('settings')}
              >
                <FiSettings /> Settings
              </button>
            </nav>
          </div>

          <div className="account-main">
            {activeTab === 'profile' && renderProfile()}
            {activeTab === 'orders' && renderOrders()}
            {activeTab === 'wishlist' && renderWishlist()}
            {activeTab === 'settings' && renderSettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
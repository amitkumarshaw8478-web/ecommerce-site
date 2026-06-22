import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Components/AuthContext';
import { useProducts } from '../../Components/ProductContext';
import { FiBarChart2, FiBox, FiShoppingBag, FiUsers, FiLogOut, FiX, FiEdit, FiTrash2, FiPlus, FiEye, FiAlertTriangle } from 'react-icons/fi';
import './Admin.css';
import './AdminSecurity.css';

const Admin = () => {
  const navigate = useNavigate();
  const { user, logout, verifyAdminAccess, updateSessionActivity } = useAuth();
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [adminActions, setAdminActions] = useState([]);

  // Modal states
  const [showProductModal, setShowProductModal] = useState(false);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [viewingOrder, setViewingOrder] = useState(null);

  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: '',
    image: ''
  });

  // Verify admin access on component mount and periodically
  useEffect(() => {
    if (!verifyAdminAccess()) {
      setAccessDenied(true);
      console.warn('Admin access denied - insufficient permissions');
      setTimeout(() => {
        navigate('/');
      }, 2000);
      return;
    }

    // Load admin data
    loadData();

    // Update session activity on user interaction
    const handleActivity = () => {
      updateSessionActivity();
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [verifyAdminAccess, navigate, updateSessionActivity]);

  const loadData = () => {
    // Load orders
    const savedOrders = localStorage.getItem('adminOrders');
    if (savedOrders) {
      setOrders(JSON.parse(savedOrders));
    } else {
      const defaultOrders = [
        { id: 1, customer: 'John Doe', email: 'john@example.com', total: 129.99, status: 'Delivered', date: '2024-01-15', items: ['Wireless Headphones', 'USB-C Cable'] },
        { id: 2, customer: 'Jane Smith', email: 'jane@example.com', total: 89.99, status: 'Shipped', date: '2024-01-10', items: ['Smart Watch'] },
        { id: 3, customer: 'Bob Wilson', email: 'bob@example.com', total: 249.99, status: 'Processing', date: '2024-01-20', items: ['Wireless Headphones', 'Smart Watch'] }
      ];
      setOrders(defaultOrders);
      localStorage.setItem('adminOrders', JSON.stringify(defaultOrders));
    }

    // Load users
    const savedUsers = localStorage.getItem('adminUsers');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      const defaultUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'customer', joinDate: '2024-01-01' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'customer', joinDate: '2024-01-05' },
        { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'admin', joinDate: '2024-01-01' }
      ];
      setUsers(defaultUsers);
      localStorage.setItem('adminUsers', JSON.stringify(defaultUsers));
    }

    // Load admin actions
    const savedActions = localStorage.getItem('adminActionLog');
    if (savedActions) {
      try {
        setAdminActions(JSON.parse(savedActions));
      } catch (error) {
        console.error('Error loading admin actions:', error);
        setAdminActions([]);
      }
    }
  };

  const handleLogout = () => {
    const result = logout();
    if (result.success) {
      navigate('/login', { replace: true });
    }
  };

  // Log admin actions for audit trail
  const logAdminAction = (action, details) => {
    const timestamp = new Date().toISOString();
    const actionLog = {
      action,
      details,
      timestamp,
      admin: user?.email
    };
    
    setAdminActions(prev => [actionLog, ...prev.slice(0, 49)]); // Keep last 50 actions
    
    // Optionally persist to localStorage
    try {
      localStorage.setItem('adminActionLog', JSON.stringify(
        [actionLog, ...JSON.parse(localStorage.getItem('adminActionLog') || '[]').slice(0, 99)]
      ));
    } catch (error) {
      console.error('Error logging admin action:', error);
    }
  };

  // Product CRUD functions
  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', price: '', stock: '', category: '', description: '', image: '' });
    setShowProductModal(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      description: product.description || '',
      image: product.image || ''
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      const product = products.find(p => p.id === productId);
      deleteProduct(productId);
      
      // Log the action
      logAdminAction('DELETE_PRODUCT', {
        productId,
        productName: product?.name,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.price || !productForm.stock || !productForm.category) {
      alert('Please fill in all required fields');
      return;
    }

    let actionType = 'CREATE_PRODUCT';
    
    if (editingProduct) {
      // Edit existing product
      updateProduct({
        ...editingProduct,
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock)
      });
      actionType = 'UPDATE_PRODUCT';
    } else {
      // Add new product
      addProduct({
        ...productForm,
        price: parseFloat(productForm.price),
        stock: parseInt(productForm.stock)
      });
    }

    // Log the action
    logAdminAction(actionType, {
      productName: productForm.name,
      productId: editingProduct?.id,
      timestamp: new Date().toISOString()
    });
    
    setShowProductModal(false);
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    );
    setOrders(updatedOrders);
    localStorage.setItem('adminOrders', JSON.stringify(updatedOrders));
    
    // Log the action
    logAdminAction('UPDATE_ORDER_STATUS', {
      orderId,
      previousStatus: order?.status,
      newStatus,
      timestamp: new Date().toISOString()
    });
  };

  const handleViewOrder = (order) => {
    setViewingOrder(order);
    setShowOrderModal(true);
  };

  const renderDashboard = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const totalProducts = products.length;
    const totalOrders = orders.length;
    const totalUsers = users.filter(u => u.role === 'customer').length;
    const lowStockProducts = products.filter(p => p.stock < 10).length;
    const pendingOrders = orders.filter(o => o.status === 'Processing').length;
    const recentOrders = orders.slice(0, 5);

    return (
      <div className="dashboard">
        <h2>Admin Dashboard</h2>

        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Revenue</h3>
            <p className="stat-value">${totalRevenue.toFixed(2)}</p>
          </div>
          <div className="stat-card">
            <h3>Total Orders</h3>
            <p className="stat-value">{totalOrders}</p>
          </div>
          <div className="stat-card">
            <h3>Total Products</h3>
            <p className="stat-value">{totalProducts}</p>
          </div>
          <div className="stat-card">
            <h3>Total Customers</h3>
            <p className="stat-value">{totalUsers}</p>
          </div>
          <div className="stat-card">
            <h3>Low Stock Items</h3>
            <p className="stat-value">{lowStockProducts}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Orders</h3>
            <p className="stat-value">{pendingOrders}</p>
          </div>
        </div>

        <div className="dashboard-sections">
          <div className="recent-orders">
            <h3>Recent Orders</h3>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id}>
                      <td>#{order.id}</td>
                      <td>{order.customer}</td>
                      <td>${order.total}</td>
                      <td>
                        <span className={`status-badge ${order.status.toLowerCase()}`}>{order.status}</span>
                      </td>
                      <td>{order.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="low-stock-alert">
            <h3>Low Stock Alert</h3>
            {lowStockProducts > 0 ? (
              <ul>
                {products.filter(p => p.stock < 10).map(product => (
                  <li key={product.id}>
                    {product.name} - Only {product.stock} left in stock
                  </li>
                ))}
              </ul>
            ) : (
              <p>All products are well stocked!</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderProducts = () => (
    <div className="products-section">
      <div className="section-header">
        <h2>Products Management</h2>
        <button className="btn btn-primary" onClick={handleAddProduct}>
          <FiPlus /> Add New Product
        </button>
      </div>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.id}</td>
                <td>
                  {product.image ? (
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} 
                    />
                  ) : (
                    <div style={{ width: '50px', height: '50px', backgroundColor: '#f0f0f0', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                      No Image
                    </div>
                  )}
                </td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>${product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <span className={`status-badge ${product.stock < 10 ? 'processing' : 'delivered'}`}>
                    {product.stock < 10 ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td>
                  <button className="btn btn-sm btn-info" onClick={() => handleEditProduct(product)}>
                    <FiEdit /> Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDeleteProduct(product.id)}>
                    <FiTrash2 /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderOrders = () => (
    <div className="orders-section">
      <h2>Orders Management</h2>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.date}</td>
                <td>${order.total}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                    className="status-select"
                  >
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </td>
                <td>
                  <button className="btn btn-sm btn-info" onClick={() => handleViewOrder(order)}>
                    <FiEye /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="users-section">
      <h2>Users Management</h2>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`role-badge ${u.role}`}>{u.role}</span>
                </td>
                <td>
                  <button className="btn btn-sm btn-info">Edit</button>
                  <button className="btn btn-sm btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="activity-section">
      <h2>Admin Activity Log</h2>
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Details</th>
              <th>Admin</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {adminActions.length > 0 ? adminActions.map((action, index) => (
              <tr key={index}>
                <td>{action.action}</td>
                <td>{action.details ? JSON.stringify(action.details) : 'N/A'}</td>
                <td>{action.admin}</td>
                <td>{new Date(action.timestamp).toLocaleString()}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', color: '#666' }}>
                  No admin actions recorded yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Modal Components
  const ProductModal = () => (
    <div className="modal-overlay" onClick={() => setShowProductModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
          <button className="close-btn" onClick={() => setShowProductModal(false)}>
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          <form onSubmit={(e) => { e.preventDefault(); handleSaveProduct(); }}>
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={productForm.name}
                onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={productForm.category}
                onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                <option value="Electronics">Electronics</option>
                <option value="Wearables">Wearables</option>
                <option value="Accessories">Accessories</option>
                <option value="Home">Home</option>
                <option value="Sports">Sports</option>
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Price *</label>
                <input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Stock *</label>
                <input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({...productForm, stock: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={productForm.description}
                onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Image URL</label>
              <input
                type="url"
                value={productForm.image}
                onChange={(e) => setProductForm({...productForm, image: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowProductModal(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editingProduct ? 'Update Product' : 'Add Product'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const OrderModal = () => (
    <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Order Details - #{viewingOrder?.id}</h3>
          <button className="close-btn" onClick={() => setShowOrderModal(false)}>
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          {viewingOrder && (
            <div className="order-details">
              <div className="order-info">
                <div className="info-section">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {viewingOrder.customer}</p>
                  <p><strong>Email:</strong> {viewingOrder.email}</p>
                </div>
                <div className="info-section">
                  <h4>Order Information</h4>
                  <p><strong>Order Date:</strong> {viewingOrder.date}</p>
                  <p><strong>Status:</strong> <span className={`status-badge ${viewingOrder.status.toLowerCase()}`}>{viewingOrder.status}</span></p>
                  <p><strong>Total:</strong> ${viewingOrder.total}</p>
                </div>
              </div>
              <div className="order-items">
                <h4>Items Ordered</h4>
                <ul>
                  {viewingOrder.items.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Show access denied message
  if (accessDenied) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 120px)',
        flexDirection: 'column',
        backgroundColor: '#f8d7da',
        gap: '20px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <FiAlertTriangle size={48} color="#721c24" style={{ marginBottom: '10px' }} />
          <h2 style={{ color: '#721c24', margin: 0 }}>Access Denied</h2>
          <p style={{ color: '#721c24' }}>You do not have permission to access the admin panel.</p>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-sidebar" style={{ left: sidebarOpen ? 0 : '-250px' }}>
        <div className="sidebar-header">
          <h3>Admin Panel</h3>
          <button className="close-btn" onClick={() => setSidebarOpen(false)}>
            <FiX />
          </button>
        </div>
        <nav className="admin-nav">
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => { setActiveTab('dashboard'); setSidebarOpen(false); }}
          >
            <FiBarChart2 /> Dashboard
          </button>
          <button
            className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => { setActiveTab('products'); setSidebarOpen(false); }}
          >
            <FiBox /> Products
          </button>
          <button
            className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => { setActiveTab('orders'); setSidebarOpen(false); }}
          >
            <FiShoppingBag /> Orders
          </button>
          <button
            className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => { setActiveTab('users'); setSidebarOpen(false); }}
          >
            <FiUsers /> Users
          </button>
          <button
            className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
            onClick={() => { setActiveTab('activity'); setSidebarOpen(false); }}
          >
            <FiBarChart2 /> Activity
          </button>
          <button className="nav-item logout" onClick={handleLogout}>
            <FiLogOut /> Logout
          </button>
        </nav>
      </div>

      <div className="admin-content">
        <div className="admin-top-bar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰ Menu
          </button>
          <div className="admin-header-right">
            <div className="admin-user-info">
              <span className="admin-user">{user?.name || 'Admin'}</span>
              <span className="admin-email" title={user?.email}>{user?.email}</span>
            </div>
          </div>
        </div>

        <div className="admin-main">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'products' && renderProducts()}
          {activeTab === 'orders' && renderOrders()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'activity' && renderActivity()}
        </div>
      </div>

      {showProductModal && <ProductModal />}
      {showOrderModal && <OrderModal />}
    </div>
  );
};

export default Admin;

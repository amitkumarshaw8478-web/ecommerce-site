import React, { createContext, useContext, useState, useEffect } from 'react';
const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ API CALL (GET)
  useEffect(() => {
    fetch("https://dummyjson.com/products?limit=0")
      .then(res => res.json())
      .then(data => {
        // Map DummyJSON response to our app's preferred product format
        const mappedProducts = (data.products || []).map(p => ({
          ...p,
          name: p.title,
          image: p.thumbnail,
          discount: Math.round(p.discountPercentage),
          originalPrice: (p.price / (1 - (p.discountPercentage || 0) / 100)).toFixed(2),
          reviews: p.reviews ? p.reviews.length : Math.floor(Math.random() * 200) + 10
        }));
        setProducts(mappedProducts);
        setLoading(false);
      })
      .catch(err => {
        console.log(err);
        setError("Failed to fetch products");
        setLoading(false);
      });
  }, []);

  // ❌ Fake CRUD (only frontend – no real API update)
  const addProduct = (product) => {
    const newProduct = {
      ...product,
      id: Date.now()
    };
    setProducts([...products, newProduct]);
  };

  const updateProduct = (updatedProduct) => {
    const updatedProducts = products.map(p =>
      p.id === updatedProduct.id ? updatedProduct : p
    );
    setProducts(updatedProducts);
  };

  const deleteProduct = (productId) => {
    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
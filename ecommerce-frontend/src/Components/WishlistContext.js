import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  const storageKey = user ? `wishlistItems_${user.username || user.email}` : 'wishlistItems';

  // Load wishlist from localStorage on mount and user change
  useEffect(() => {
    const savedWishlist = localStorage.getItem(storageKey);
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        setWishlistItems(parsedWishlist);
      } catch (error) {
        console.error('Error parsing wishlist from localStorage:', error);
        setWishlistItems([]);
      }
    } else {
      // Fallback: migrate from old key 'wishlist' if present
      if (storageKey === 'wishlistItems') {
        const oldWishlist = localStorage.getItem('wishlist');
        if (oldWishlist) {
          try {
            const parsedWishlist = JSON.parse(oldWishlist);
            setWishlistItems(parsedWishlist);
            localStorage.setItem(storageKey, oldWishlist);
            localStorage.removeItem('wishlist');
          } catch (error) {
            console.error('Error migrating wishlist:', error);
            setWishlistItems([]);
          }
        } else {
          setWishlistItems([]);
        }
      } else {
        setWishlistItems([]);
      }
    }
    setIsInitialized(true);
  }, [storageKey]);

  // Update wishlistCount and localStorage whenever wishlistItems change
  useEffect(() => {
    if (!isInitialized) return;

    setWishlistCount(wishlistItems.length);
    localStorage.setItem(storageKey, JSON.stringify(wishlistItems));
    
    // Set the legacy key only if we're on the guest storage key
    if (storageKey === 'wishlistItems') {
      localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
    }
    
    // Trigger custom events if needed
    window.dispatchEvent(new Event('wishlistUpdated'));
  }, [wishlistItems, isInitialized, storageKey]);

  const addToWishlist = (product) => {
    setWishlistItems(prevItems => {
      const exists = prevItems.some(item => item.id === product.id);
      if (exists) return prevItems;
      return [...prevItems, product];
    });
  };

  const removeFromWishlist = (productId) => {
    setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
  };

  const toggleWishlist = (product) => {
    setWishlistItems(prevItems => {
      const exists = prevItems.some(item => item.id === product.id);
      if (exists) {
        return prevItems.filter(item => item.id !== product.id);
      } else {
        return [...prevItems, product];
      }
    });
  };

  const isInWishlist = (productId) => {
    return wishlistItems.some(item => item.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        wishlistCount,
        addToWishlist,
        removeFromWishlist,
        toggleWishlist,
        isInWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

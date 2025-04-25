import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  addItem, 
  removeItem, 
  updateQuantity, 
  clearCart 
} from '../redux/slices/cartSlice';
import { toast } from 'react-toastify';

/**
 * Custom hook for managing cart operations
 */
const useCart = () => {
  const dispatch = useDispatch();
  const { items, restaurantId, restaurantName } = useSelector(state => state.cart);
  
  /**
   * Add item to cart
   * @param {Object} item - The menu item to add
   * @param {string} item.id - Item ID
   * @param {string} item.name - Item name
   * @param {number} item.price - Item price
   * @param {string} item.image - Item image URL
   * @param {number} quantity - Quantity to add (default: 1)
   * @param {string} restaurantId - ID of the restaurant
   * @param {string} restaurantName - Name of the restaurant
   */
  const handleAddToCart = useCallback((item, quantity = 1, restaurantId, restaurantName) => {
    try {
      dispatch(addItem({ 
        item: { ...item, quantity },
        restaurantId,
        restaurantName
      }));
      toast.success(`${item.name} added to cart`);
    } catch (error) {
      toast.error('Failed to add item to cart');
      console.error('Add to cart error:', error);
    }
  }, [dispatch]);
  
  /**
   * Remove item from cart
   * @param {string} itemId - ID of the item to remove
   */
  const handleRemoveFromCart = useCallback((itemId) => {
    try {
      dispatch(removeItem(itemId));
      toast.info('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item from cart');
      console.error('Remove from cart error:', error);
    }
  }, [dispatch]);
  
  /**
   * Update item quantity in cart
   * @param {string} itemId - ID of the item to update
   * @param {number} quantity - New quantity
   */
  const handleUpdateQuantity = useCallback((itemId, quantity) => {
    try {
      if (quantity < 1) {
        dispatch(removeItem(itemId));
        toast.info('Item removed from cart');
      } else {
        dispatch(updateQuantity({ itemId, quantity }));
      }
    } catch (error) {
      toast.error('Failed to update item quantity');
      console.error('Update quantity error:', error);
    }
  }, [dispatch]);
  
  /**
   * Clear all items from cart
   */
  const handleClearCart = useCallback(() => {
    try {
      dispatch(clearCart());
      toast.info('Cart cleared');
    } catch (error) {
      toast.error('Failed to clear cart');
      console.error('Clear cart error:', error);
    }
  }, [dispatch]);
  
  /**
   * Calculate cart totals
   */
  const getCartTotals = useCallback(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const deliveryFee = items.length > 0 ? 150 : 0; // Example delivery fee
    const tax = subtotal * 0.15; // Example tax rate (15%)
    const total = subtotal + deliveryFee + tax;
    
    return {
      subtotal,
      deliveryFee,
      tax,
      total,
      itemCount: items.reduce((count, item) => count + item.quantity, 0)
    };
  }, [items]);
  
  return {
    items,
    restaurantId,
    restaurantName,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    cartTotals: getCartTotals()
  };
};

export default useCart;
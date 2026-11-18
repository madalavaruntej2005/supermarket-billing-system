import React, { createContext, useContext, useState, useMemo } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [discountType, setDiscountType] = useState('fixed'); // 'fixed' or 'percentage'
  const [discountValue, setDiscountValue] = useState(0);

  // Add a product to the cart
  const addToCart = (product) => {
    if (product.stock <= 0) {
      toast.error(`"${product.name}" is out of stock!`);
      return;
    }

    setCartItems((prevItems) => {
      const existing = prevItems.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.warning(`Cannot add more. Available stock: ${product.stock}`);
          return prevItems;
        }
        return prevItems.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevItems, { product, quantity: 1 }];
      }
    });
  };

  // Increase quantity
  const increaseQuantity = (productId) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId) {
          if (item.quantity >= item.product.stock) {
            toast.warning(`Maximum stock limit reached (${item.product.stock})`);
            return item;
          }
          return { ...item, quantity: item.quantity + 1 };
        }
        return item;
      })
    );
  };

  // Decrease quantity
  const decreaseQuantity = (productId) => {
    setCartItems((prevItems) =>
      prevItems
        .map((item) => {
          if (item.product.id === productId) {
            return { ...item, quantity: item.quantity - 1 };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  // Set specific quantity
  const setItemQuantity = (productId, qty) => {
    const parsedQty = parseInt(qty, 10);
    if (isNaN(parsedQty) || parsedQty <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product.id === productId) {
          if (parsedQty > item.product.stock) {
            toast.warning(`Available stock is only ${item.product.stock}`);
            return { ...item, quantity: item.product.stock };
          }
          return { ...item, quantity: parsedQty };
        }
        return item;
      })
    );
  };

  // Remove item completely
  const removeFromCart = (productId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.product.id !== productId));
  };

  // Clear entire cart
  const clearCart = () => {
    setCartItems([]);
    setSelectedCustomer(null);
    setDiscountValue(0);
    setDiscountType('fixed');
  };

  // Computed calculations
  const totals = useMemo(() => {
    let subtotal = 0;
    let taxAmount = 0;
    let totalItems = 0;

    const itemsWithDetails = cartItems.map((item) => {
      const price = parseFloat(item.product.selling_price) || 0;
      const rate = parseFloat(item.product.tax_rate) || 0;
      const itemSubtotal = price * item.quantity;
      const itemTax = (itemSubtotal * rate) / 100;
      const itemTotal = itemSubtotal + itemTax;

      subtotal += itemSubtotal;
      taxAmount += itemTax;
      totalItems += item.quantity;

      return {
        ...item,
        unitPrice: price,
        taxRate: rate,
        itemSubtotal,
        itemTax,
        itemTotal,
      };
    });

    let discountAmount = 0;
    const numDisc = parseFloat(discountValue) || 0;
    if (discountType === 'percentage') {
      discountAmount = (subtotal * numDisc) / 100;
    } else {
      discountAmount = Math.min(numDisc, subtotal);
    }

    const grandTotal = Math.max(0, subtotal - discountAmount + taxAmount);

    return {
      items: itemsWithDetails,
      subtotal: parseFloat(subtotal.toFixed(2)),
      taxAmount: parseFloat(taxAmount.toFixed(2)),
      discountAmount: parseFloat(discountAmount.toFixed(2)),
      grandTotal: parseFloat(grandTotal.toFixed(2)),
      totalItems,
    };
  }, [cartItems, discountType, discountValue]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        selectedCustomer,
        setSelectedCustomer,
        discountType,
        setDiscountType,
        discountValue,
        setDiscountValue,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        setItemQuantity,
        removeFromCart,
        clearCart,
        totals,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

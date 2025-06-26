import React from 'react';
import { Add, Remove, Delete } from '@mui/icons-material';
import { CartItem as CartItemType } from '../../types/cart';
import { useCart } from '../../context/CartContext';
import Link from 'next/link';
import ROUTES from '@/shared/routes';
import './CartItem.css';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = parseInt(e.target.value);
    if (!isNaN(newQuantity)) {
      updateQuantity(item.productId, newQuantity);
    }
  };
  
  const increaseQuantity = () => {
    updateQuantity(item.productId, item.quantity + 1);
  };
  
  const decreaseQuantity = () => {
    if (item.quantity > 1) {
      updateQuantity(item.productId, item.quantity - 1);
    }
  };
  
  const handleRemove = () => {
    removeFromCart(item.productId);
  };
  
  // Calculate item total price
  const itemPrice = item.salePrice || item.price;
  const itemTotal = itemPrice * item.quantity;
  
  return (
    <div className="cart-item">
      <div className="cart-item-left">
        <div className="cart-item-image">
          <Link href={ROUTES.PRODUCT_DETAIL(item.productId)}>
            <img src={item.image} alt={item.name} />
          </Link>
        </div>
        
        <div className="cart-quantity-selector">
          <button 
            className="quantity-button decrease" 
            onClick={decreaseQuantity}
            disabled={item.quantity <= 1}
          >
            <Remove />
          </button>
          
          <input 
            type="number" 
            min="1" 
            max={item.stockQuantity} 
            value={item.quantity}
            onChange={handleQuantityChange}
          />
          
          <button 
            className="quantity-button increase" 
            onClick={increaseQuantity}
            disabled={item.quantity >= item.stockQuantity}
          >
            <Add />
          </button>
        </div>
      </div>
      
      <div className="cart-item-details">
        <Link href={ROUTES.PRODUCT_DETAIL(item.productId)} className="cart-item-name">
          {item.name}
        </Link>
        <div className="cart-item-category">{item.category}</div>
        
        <div className="cart-item-price-container">
          {item.salePrice ? (
            <>
              <span className="cart-item-original-price">S/ {item.price.toFixed(2)}</span>
              <span className="cart-item-sale-price">S/ {item.salePrice.toFixed(2)}</span>
            </>
          ) : (
            <span className="cart-item-price">S/ {item.price.toFixed(2)}</span>
          )}
        </div>
      </div>
      
      <div className="cart-item-right">
        <div className="cart-item-total">
          Total: <span>S/ {itemTotal.toFixed(2)}</span>
        </div>
        
        <button className="remove-item-button" onClick={handleRemove}>
          <Delete />
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  );
};

export default CartItem;
"use client";

import React from 'react';
import Navbar from '@/shared/components/Navbar/Navbar';
import { useCart } from '@/features/cart/context/CartContext';
import CartItem from '@/features/cart/components/CartItem/CartItem';
import Link from 'next/link';
import ROUTES from '@/shared/routes';
import { ShoppingBag, ArrowBack, ArrowForward } from '@mui/icons-material';
import './page.css';

export default function CartPage() {
  const { cart, getCartTotal, getCartItemsCount, clearCart } = useCart();
  
  // Format price with commas and 2 decimal places
  const formatPrice = (price: number) => {
    return price.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };
  
  return (
    <div className="cart-page">
      <Navbar />
      
      <div className="cart-container">
        <div className="cart-header">
          <h1>Carrito de Compras</h1>
          <div className="cart-summary-info">
            <ShoppingBag />
            <span>{getCartItemsCount()} {getCartItemsCount() === 1 ? 'Artículo' : 'Artículos'}</span>
          </div>
        </div>
        
        {cart.items.length > 0 ? (
          <div className="cart-content">
            <div className="cart-items-container">
              {cart.items.map(item => (
                <CartItem key={item.productId} item={item} />
              ))}
              
              <div className="cart-actions">
                <button className="clear-cart-button" onClick={clearCart}>
                  Vaciar Carrito
                </button>
                <Link href={ROUTES.PRODUCTS} className="continue-shopping-button">
                  <ArrowBack /> Seguir Comprando
                </Link>
              </div>
            </div>
            
            <div className="cart-summary">
              <h2>Resumen de Compra</h2>
              
              <div className="cart-summary-row">
                <span>Subtotal:</span>
                <span>S/ {formatPrice(getCartTotal())}</span>
              </div>
              
              <div className="cart-summary-row shipping">
                <span>Envío:</span>
                <span>Se calculará en el checkout</span>
              </div>
              
              <div className="cart-summary-total">
                <span>Total:</span>
                <span>S/ {formatPrice(getCartTotal())}</span>
              </div>
              
              <Link href={ROUTES.CHECKOUT} className="checkout-button">
                Proceder al Pago <ArrowForward />
              </Link>
              
              <div className="cart-summary-note">
                * Los impuestos y gastos de envío se calcularán durante el proceso de pago.
              </div>
            </div>
          </div>
        ) : (
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <ShoppingBag />
            </div>
            <h2>Tu carrito está vacío</h2>
            <p>Parece que aún no has añadido productos a tu carrito.</p>
            <Link href={ROUTES.PRODUCTS} className="start-shopping-button">
              Comenzar a Comprar
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
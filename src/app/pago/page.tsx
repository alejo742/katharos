"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/features/cart/context/CartContext';
import Navbar from '@/shared/components/Navbar/Navbar';
import ROUTES from '@/shared/routes';
import './page.css';

// WhatsApp business phone number
const WHATSAPP_NUMBER = "51992885774"; // Format: country code + number

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();
  const [countdown, setCountdown] = useState(15);
  
  useEffect(() => {
    // Redirect if cart is empty
    if (cart.items.length === 0) {
      router.push(ROUTES.CART);
      return;
    }
    
    // Start countdown
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          redirectToWhatsApp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [cart.items]);
  
  const formatPrice = (price: number) => {
    return price.toFixed(2);
  };
  
  const redirectToWhatsApp = () => {
    // Create message with order details
    let message = "¡Hola! Me gustaría realizar el siguiente pedido:\n\n";
    
    // Add items
    cart.items.forEach(item => {
      const price = item.salePrice || item.price;
      message += `• ${item.quantity}x ${item.name} - S/ ${formatPrice(price * item.quantity)}\n`;
    });
    
    // Add total
    message += `\nTotal: S/ ${formatPrice(getCartTotal())}\n\n`;
    
    // Add customer info request
    message += "Por favor, necesitaría confirmar este pedido y coordinar el pago y la entrega. ¡Gracias!";
    
    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Create WhatsApp URL
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    
    // Redirect to WhatsApp
    window.location.href = whatsappUrl;
    
    setTimeout(() => clearCart(), 1000);
  };
  
  return (
    <div className="checkout-page">
      <Navbar />
      
      <div className="checkout-container">
        <div className="redirect-card">
          <div className="redirect-icon">
            <img src="/icons/whatsapp-icon.png" alt="WhatsApp" />
          </div>
          
          <h1>Completando tu pedido</h1>
          
          <p className="redirect-message">
            En <span className="countdown">{countdown}</span> segundos te redirigiremos a WhatsApp para que completes tu compra.
          </p>
          
          <div className="order-summary">
            <h2>Resumen de tu pedido:</h2>
            <ul className="order-items">
              {cart.items.map(item => (
                <li key={item.productId} className="order-item">
                  <div className="item-quantity">{item.quantity}x</div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-price">
                    S/ {formatPrice((item.salePrice || item.price) * item.quantity)}
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="order-total">
              <span>Total:</span>
              <span>S/ {formatPrice(getCartTotal())}</span>
            </div>
          </div>
          
          <div className="redirect-actions">
            <button 
              className="redirect-now-button"
              onClick={redirectToWhatsApp}
            >
              Ir a WhatsApp ahora
            </button>
            
            <button 
              className="cancel-button"
              onClick={() => router.push(ROUTES.CART)}
            >
              Volver al carrito
            </button>
          </div>
          
          <p className="redirect-note">
            Se abrirá WhatsApp con un mensaje predefinido para completar tu compra con nuestro equipo.
          </p>
        </div>
      </div>
    </div>
  );
}
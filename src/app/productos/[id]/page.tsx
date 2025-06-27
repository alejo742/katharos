"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/shared/components/Navbar/Navbar';
import LoadingOverlay from '@/shared/components/LoadingOverlay/LoadingOverlay';
import { getProductById } from '@/features/products/services/get/getProductById';
import { Product } from '@/features/products/types/product';
import { 
  CheckCircle, 
  RemoveCircle, 
  ArrowBack, 
  AddShoppingCart,
  Add,
  Remove
} from '@mui/icons-material';
import ROUTES from '@/shared/routes';
import { getCategoryName } from '@/features/products/types/category';
import './page.css';
import { useCart } from '@/features/cart/context/CartContext';
import { CartItem } from '@/features/cart/types/cart';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const productId = params.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  
  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(productId);
        if (data) {
          setProduct(data);
          // Set the main image to the first image in the array
          if (data.images && data.images.length > 0) {
            setMainImage(data.images[0]);
          }
        } else {
          setError('Producto no encontrado');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Error al cargar el producto');
      } finally {
        setLoading(false);
      }
    };
    
    if (productId) {
      fetchProduct();
    }
  }, [productId]);
  
  // Handle changing the main image
  const handleImageChange = (imageUrl: string) => {
    setMainImage(imageUrl);
  };
  
  // Handle quantity changes
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= (product?.stockQuantity || 1)) {
      setQuantity(value);
    }
  };
  
  // Increment quantity
  const incrementQuantity = () => {
    if (quantity < (product?.stockQuantity || 1)) {
      setQuantity(quantity + 1);
    }
  };
  
  // Decrement quantity
  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };
  
  // Handle add to cart
  const handleAddToCart = () => {
    if (product) {
      // Create cart item
      const cartItem: CartItem = {
        productId: product.id,
        quantity: quantity,
        name: product.name,
        price: product.price,
        salePrice: product.salePrice,
        image: product.images[0],
        category: getCategoryName(product.category), // Get display name
        stockQuantity: product.stockQuantity
      };
      
      // Add to cart
      addToCart(cartItem);
      
      // Show feedback
      alert(`Producto añadido al carrito: ${product.name} (x${quantity})`);
    }
  };
  
  // Format date for display
  const formatDate = (date: Date | any) => {
    if (!date) return '';
    
    try {
      let dateObj: Date;
      
      if (typeof date === 'object' && 'seconds' in date) {
        dateObj = new Date(date.seconds * 1000);
      } else if (typeof date === 'string') {
        dateObj = new Date(date);
      } else if (date instanceof Date) {
        dateObj = date;
      } else {
        return '';
      }
      
      return dateObj.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };
  
  return (
    <div className="product-detail-page">
      <Navbar />
      <LoadingOverlay isVisible={loading} />
      
      <div className="product-detail-container">
        {error ? (
          <div className="product-error">
            <h2>{error}</h2>
            <button onClick={() => router.push(ROUTES.PRODUCTS)}>
              <ArrowBack /> Volver a Productos
            </button>
          </div>
        ) : product ? (
          <>
            <div className="product-breadcrumb">
              <button onClick={() => router.push(ROUTES.PRODUCTS)} className="back-button">
                <ArrowBack /> Productos
              </button>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-category" 
                onClick={() => router.push(`${ROUTES.PRODUCTS}?category=${product.category}`)}>
                {getCategoryName(product.category)}
              </span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">{product.name}</span>
            </div>
            
            <div className="product-detail-content">
              <div className="product-gallery">
                <div className="main-image-container">
                  {mainImage ? (
                    <img 
                      src={mainImage} 
                      alt={product.name} 
                      className="main-product-image" 
                    />
                  ) : (
                    <div className="no-image-placeholder">
                      Imagen no disponible
                    </div>
                  )}
                  
                  {product.featured && (
                    <div className="featured-badge">Destacado</div>
                  )}
                  
                  {product.salePrice && product.salePrice < product.price && (
                    <div className="sale-badge">
                      {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
                    </div>
                  )}
                </div>
                
                {product.images && product.images.length > 1 && (
                  <div className="product-thumbnails">
                    {product.images.map((image, index) => (
                      <div 
                        key={index} 
                        className={`thumbnail-item ${image === mainImage ? 'active' : ''}`}
                        onClick={() => handleImageChange(image)}
                      >
                        <img src={image} alt={`${product.name} - Imagen ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="product-info">
                <h1 className="product-title">{product.name}</h1>
                
                <div className="product-pricing">
                  {product.salePrice ? (
                    <>
                      <span className="original-price">S/ {product.price.toFixed(2)}</span>
                      <span className="sale-price">S/ {product.salePrice.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="regular-price">S/ {product.price.toFixed(2)}</span>
                  )}
                </div>
                
                <div className="product-stock-status">
                  {product.stockQuantity > 0 ? (
                    <div className="in-stock">
                      <CheckCircle /> Disponible ({product.stockQuantity} unidades)
                    </div>
                  ) : (
                    <div className="out-of-stock">
                      <RemoveCircle /> Agotado
                    </div>
                  )}
                </div>
                
                <div className="product-description">
                  <p>{product.description}</p>
                </div>
                
                {product.stockQuantity > 0 && (
                  <div className="product-actions">
                    <div className="quantity-selector">
                      <button 
                        className="quantity-button" 
                        onClick={decrementQuantity}
                        disabled={quantity <= 1}
                      >
                        <Remove fontSize="small" />
                      </button>
                      <input 
                        type="number" 
                        min="1" 
                        max={product?.stockQuantity} 
                        value={quantity}
                        onChange={handleQuantityChange}
                      />
                      <button 
                        className="quantity-button" 
                        onClick={incrementQuantity}
                        disabled={quantity >= (product?.stockQuantity || 1)}
                      >
                        <Add fontSize="small" />
                      </button>
                    </div>
                    
                    <button 
                      className="add-to-cart-button"
                      onClick={handleAddToCart}
                    >
                      <AddShoppingCart /> Añadir al Carrito
                    </button>
                  </div>
                )}
                
                <div className="product-category-container">
                  <span className="category-label">Categoría:</span>
                  <span className="category-value">{getCategoryName(product.category)}</span>
                </div>
              </div>
            </div>
            
            <div className="product-specifications">
              <h2>Especificaciones del Producto</h2>
              <div className="specifications-table">
                <div className="spec-row">
                  <div className="spec-label">Categoría</div>
                  <div className="spec-value">{getCategoryName(product.category)}</div>
                </div>
                
                {product.stockQuantity !== undefined && (
                  <div className="spec-row">
                    <div className="spec-label">Disponibilidad</div>
                    <div className="spec-value">
                      {product.stockQuantity > 0 
                        ? `${product.stockQuantity} unidades en stock` 
                        : 'Agotado'}
                    </div>
                  </div>
                )}
                
                {product.createdAt && (
                  <div className="spec-row">
                    <div className="spec-label">Fecha de incorporación</div>
                    <div className="spec-value">{formatDate(product.createdAt)}</div>
                  </div>
                )}
                
                {/* Display all product attributes */}
                {product.attributes && Object.keys(product.attributes).length > 0 && 
                  Object.entries(product.attributes).map(([key, value]) => (
                    <div className="spec-row" key={key}>
                      <div className="spec-label">{key}</div>
                      <div className="spec-value">{value.toString()}</div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
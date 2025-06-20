/**
 * Products page
 * This page displays a list of products available in the store.
 */
"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/shared/components/Navbar/Navbar';
import LoadingOverlay from '@/shared/components/LoadingOverlay/LoadingOverlay';
import './page.css';
import { Product } from '@/features/products/types/product';
import { FilterList, Search, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(true);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);

  // Get URL query parameters
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');
  const queryParam = searchParams.get('query');

  // Fetch products based on URL parameters
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // TODO: replace mock data with actual products
        setTimeout(() => {
          setProducts(mockProducts);
          
          // If category param exists, set the selected category
          if (categoryParam) {
            setSelectedCategory(categoryParam);
          }
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryParam, queryParam]);

  // Filter products based on selected category, search query, and price range
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesQuery = !queryParam || 
      product.name.toLowerCase().includes(queryParam.toLowerCase()) || 
      product.description.toLowerCase().includes(queryParam.toLowerCase());
    const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
    
    return matchesCategory && matchesQuery && matchesPrice;
  });

  // Handler for category filter change
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Toggle filters visibility
  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };

  return (
    <div className="products-page-container">
      <Navbar />
      <LoadingOverlay isVisible={loading} />
      
      <div className="products-hero">
        <div className="products-hero-content">
          <h1>Colección Katharos</h1>
          <h2>Productos sostenibles para todos los gustos</h2>
        </div>
      </div>
      
      <div className="products-container">
        <div className="products-filters">
          <div className="filter-header" onClick={toggleFilters}>
            <div className="filter-title">
              <FilterList className="filter-icon" />
              <h3>Filtros</h3>
            </div>
            {isFiltersOpen ? 
              <KeyboardArrowUp className="filter-toggle-icon" /> : 
              <KeyboardArrowDown className="filter-toggle-icon" />
            }
          </div>
          
          {isFiltersOpen && (
            <div className="filter-content">
              <div className="price-filters">
                <h4>Precio</h4>
                <div className="price-slider-container">
                  <input 
                    type="range" 
                    min="0" 
                    max="200" 
                    value={priceRange[1]} 
                    onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                    className="price-slider"
                  />
                  <div className="price-range-display">
                    <span>S/ {priceRange[0]}</span>
                    <span>S/ {priceRange[1]}</span>
                  </div>
                </div>
              </div>
              
              {/* Additional filters can be added here in the future */}
            </div>
          )}
        </div>
        
        <div className="products-grid">
          <div className="products-header">
            <h3>Productos {queryParam ? `para "${queryParam}"` : ''}</h3>
            <p>{filteredProducts.length} productos encontrados</p>
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="products-list">
              {filteredProducts.map(product => (
                <Link href={`/productos/${product.id}`} key={product.id} className="product-card">
                  <div className="product-image">
                    <img src={product.imageUrl} alt={product.name} />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-category">{product.category}</p>
                    <p className="product-price">S/ {product.price.toFixed(2)}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <Search className="no-results-icon" />
              <h3>No se encontraron productos</h3>
              <p>Intenta con otra búsqueda o categoría</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Mock products for initial development
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Camiseta Orgánica',
    description: 'Camiseta hecha de algodón 100% orgánico, perfecta para el día a día.',
    price: 59.90,
    category: 'hombre',
    imageUrl: '/example/sample-product.webp',
    stock: 25,
    rating: 4.5,
    isFeatured: true
  },
  {
    id: '2',
    name: 'Vestido Sostenible',
    description: 'Vestido elegante hecho con materiales reciclados.',
    price: 129.90,
    category: 'mujer',
    imageUrl: '/example/sample-product.webp',
    stock: 15,
    rating: 4.8
  },
  {
    id: '3',
    name: 'Jeans Eco-friendly',
    description: 'Jeans producidos con menor consumo de agua y materiales reciclados.',
    price: 149.90,
    category: 'hombre',
    imageUrl: '/example/sample-product.webp',
    stock: 20,
    rating: 4.2
  },
  {
    id: '4',
    name: 'Mochila de Lona',
    description: 'Mochila resistente hecha de lona orgánica y botones reciclados.',
    price: 89.90,
    category: 'accesorios',
    imageUrl: '/example/sample-product.webp',
    stock: 10,
    rating: 4.7
  },
  {
    id: '5',
    name: 'Pijama Infantil Orgánico',
    description: 'Pijama suave y cómodo para niños, hecho con algodón orgánico.',
    price: 69.90,
    category: 'niños',
    imageUrl: '/example/sample-product.webp',
    stock: 30,
    rating: 4.9,
    isFeatured: true
  },
  {
    id: '6',
    name: 'Toallas Ecológicas',
    description: 'Set de toallas de baño hechas con algodón orgánico y tintes naturales.',
    price: 79.90,
    category: 'hogar',
    imageUrl: '/example/sample-product.webp',
    stock: 15,
    rating: 4.4
  },
  {
    id: '7',
    name: 'Zapatillas Recicladas',
    description: 'Zapatillas cómodas hechas con materiales reciclados.',
    price: 119.90,
    category: 'hombre',
    imageUrl: '/example/sample-product.webp',
    stock: 12,
    rating: 4.6
  },
  {
    id: '8',
    name: 'Blusa de Lino',
    description: 'Blusa elegante de lino orgánico, perfecta para ocasiones especiales.',
    price: 99.90,
    category: 'mujer',
    imageUrl: '/example/sample-product.webp',
    stock: 18,
    rating: 4.3,
    isFeatured: true
  }
];
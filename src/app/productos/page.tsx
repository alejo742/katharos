"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/shared/components/Navbar/Navbar';
import LoadingOverlay from '@/shared/components/LoadingOverlay/LoadingOverlay';
import './page.css';
import { Product } from '@/features/products/types/product';
import { getAllProducts } from '@/features/products/services/get/getAllProducts';
import { FilterList, Search, KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import Link from 'next/link';
import ROUTES from '@/shared/routes';
import { getCategoryName } from '@/features/products/types/category';

// Number of products per page
const PRODUCTS_PER_PAGE = 16;

// Component that uses searchParams
function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Extract URL parameters
  const categoryParam = searchParams.get('category') || 'all';
  const queryParam = searchParams.get('query') || '';
  const pageParam = parseInt(searchParams.get('page') || '1');
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState<boolean>(true);
  const [maxProductPrice, setMaxProductPrice] = useState<number>(200);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 200]);
  const [currentPage, setCurrentPage] = useState<number>(pageParam);
  const [initialLoadComplete, setInitialLoadComplete] = useState<boolean>(false);
  
  // First load - fetch all products to determine price range
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        // Fetch all products without pagination to determine max price
        const result = await getAllProducts({
          fetchAll: true,
          category: categoryParam,
          query: queryParam
        });
        
        setAllProducts(result.products);
        
        // Find max price among all products
        if (result.products.length > 0) {
          const highestPrice = Math.max(...result.products.map(p => 
            Math.max(p.price, p.salePrice || 0)
          ));
          // Round up to nearest 50 for a nicer UI
          const roundedMax = Math.ceil(highestPrice / 50) * 50;
          setMaxProductPrice(roundedMax);
          setPriceRange([0, roundedMax]);
        }
        
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Error fetching initial products:', error);
        setInitialLoadComplete(true);
      }
    };
    
    fetchAllProducts();
  }, [categoryParam, queryParam]);
  
  // Fetch products based on URL parameters, pagination, and price filter
  useEffect(() => {
    // Don't fetch until initial load is complete
    if (!initialLoadComplete) return;
    
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const result = await getAllProducts({
          page: currentPage,
          limit: PRODUCTS_PER_PAGE,
          category: categoryParam,
          query: queryParam,
          minPrice: priceRange[0],
          maxPrice: priceRange[1]
        });
        
        // Filter client-side by price range if needed
        // This ensures the filter works even if the server doesn't support it
        let filteredProducts = result.products;
        if (priceRange[0] > 0 || priceRange[1] < maxProductPrice) {
          filteredProducts = filteredProducts.filter(product => {
            const productPrice = product.salePrice || product.price;
            return productPrice >= priceRange[0] && productPrice <= priceRange[1];
          });
        }
        
        setProducts(filteredProducts);
        setTotalProducts(filteredProducts.length);
        setHasMore(result.hasMore);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [categoryParam, queryParam, currentPage, priceRange, initialLoadComplete]);
  
  // Update URL when filters change
  const updateUrlParams = (params: {
    category?: string;
    page?: number;
    query?: string;
  }) => {
    const urlParams = new URLSearchParams(searchParams.toString());
    
    if (params.category) {
      urlParams.set('category', params.category);
    }
    
    if (params.page) {
      urlParams.set('page', params.page.toString());
    }
    
    if (params.query !== undefined) {
      if (params.query) {
        urlParams.set('query', params.query);
      } else {
        urlParams.delete('query');
      }
    }
    
    // Reset to page 1 when filters change
    if (params.category || params.query !== undefined) {
      urlParams.set('page', '1');
    }
    
    router.push(`${ROUTES.PRODUCTS}?${urlParams.toString()}`);
  };
  
  // Handler for price range change
  const handlePriceRangeChange = (newRange: [number, number]) => {
    setPriceRange(newRange);
    // Reset to page 1 when price filter changes
    setCurrentPage(1);
  };
  
  // Toggle filters visibility
  const toggleFilters = () => {
    setIsFiltersOpen(!isFiltersOpen);
  };
  
  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrlParams({ page });
    
    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Load more products
  const handleLoadMore = () => {
    handlePageChange(currentPage + 1);
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  // Filter visible products by current price range
  const filteredProducts = products.filter(product => {
    const productPrice = product.salePrice || product.price;
    return productPrice >= priceRange[0] && productPrice <= priceRange[1];
  });

  return (
    <div className="products-page-container">
      <Navbar />
      <LoadingOverlay isVisible={loading && !products.length} />
      
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
                    max={maxProductPrice} 
                    value={priceRange[1]} 
                    onChange={(e) => handlePriceRangeChange([priceRange[0], parseInt(e.target.value)])}
                    className="price-slider"
                  />
                  <div className="price-range-display">
                    <span>S/ {priceRange[0]}</span>
                    <span>S/ {priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="products-grid">
          <div className="products-header">
            <h3>
              {queryParam 
                ? `Resultados para "${queryParam}"` 
                : categoryParam !== 'all' 
                  ? `Categoría: ${getCategoryName(categoryParam)}` 
                  : 'Todos los productos'
              }
            </h3>
            <p>{filteredProducts.length} {filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}</p>
          </div>
          
          {filteredProducts.length > 0 ? (
            <>
              <div className="products-list">
                {filteredProducts.map(product => (
                  <Link href={ROUTES.PRODUCT_DETAIL(product.id)} key={product.id} className="product-card">
                    <div className="product-image">
                      <img src={product.images[0]} alt={product.name} />
                      {product.featured && <span className="featured-badge">Destacado</span>}
                      {product.salePrice && <span className="sale-badge">Oferta</span>}
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-category">{getCategoryName(product.category)}</p>
                      <div className="product-price-container">
                        {product.salePrice ? (
                          <>
                            <span className="original-price">S/ {product.price.toFixed(2)}</span>
                            <span className="sale-price">S/ {product.salePrice.toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="regular-price">S/ {product.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
              <div className="pagination-controls">
                {totalPages > 1 && (
                  <div className="pagination">
                    <button 
                      className="pagination-arrow"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      &lt;
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => 
                        page === 1 || 
                        page === totalPages || 
                        (page >= currentPage - 1 && page <= currentPage + 1)
                      )
                      .map((page, index, array) => {
                        // Add ellipsis
                        const showEllipsisBefore = index > 0 && array[index - 1] !== page - 1;
                        const showEllipsisAfter = index < array.length - 1 && array[index + 1] !== page + 1;
                        
                        return (
                          <React.Fragment key={page}>
                            {showEllipsisBefore && <span className="pagination-ellipsis">...</span>}
                            <button 
                              className={`pagination-page ${currentPage === page ? 'active' : ''}`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                            {showEllipsisAfter && <span className="pagination-ellipsis">...</span>}
                          </React.Fragment>
                        );
                      })
                    }
                    
                    <button 
                      className="pagination-arrow"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      &gt;
                    </button>
                  </div>
                )}
                
                {/* Only show "Cargar más productos" if there are actually more products and we're not on the last page */}
                {hasMore && currentPage < totalPages && (
                  <button className="load-more-button" onClick={handleLoadMore}>
                    Cargar más productos
                  </button>
                )}
              </div>
            </>
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

// Loading component for Suspense fallback
function ProductsPageLoading() {
  return (
    <div className="products-page-loading">
      <Navbar />
      <div className="products-hero-loading"></div>
      <div className="products-content-loading"></div>
    </div>
  );
}

// Main component with Suspense boundary
export default function ProductsPage() {
  return (
    <Suspense fallback={<ProductsPageLoading />}>
      <ProductsContent />
    </Suspense>
  );
}
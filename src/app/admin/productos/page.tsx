"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/shared/components/Navbar/Navbar';
import LoadingOverlay from '@/shared/components/LoadingOverlay/LoadingOverlay';
import { Product } from '@/features/products/types/product';
import { getAllProducts } from '@/features/products/services/get/getAllProducts';
import { deleteProduct } from '@/features/products/services/delete/deleteProduct';
import { Add, Edit, Delete, Search, Warning } from '@mui/icons-material';
import useAuth from '@/features/auth/hooks/useAuth';
import { checkAdminStatus } from '@/features/admin/services/checkAdminStatus';
import ROUTES from '@/shared/routes';
import './page.css';
import { getCategoryName } from '@/features/products/types/category';

export default function AdminProductsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Check admin status and fetch products
  useEffect(() => {
    const initialize = async () => {
      if (loading) return;
      
      if (!user) {
        router.push(`${ROUTES.LOGIN}?error=${encodeURIComponent('Debes iniciar sesión para acceder al panel de administración.')}`);
        return;
      }
      
      try {
        // Check admin status
        const adminStatus = await checkAdminStatus();
        setIsAdmin(adminStatus);
        
        if (!adminStatus) {
          router.push(ROUTES.HOME);
          return;
        }

        // Fetch products
        const fetchedProducts = await getAllProducts();
        setProducts(fetchedProducts.products);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [user, loading, router]);

  // Filter products based on search query
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle product deletion
  const handleDeleteProduct = async (id: string) => {
    setIsLoading(true);
    try {
      await deleteProduct(id);
      setProducts(products.filter(product => product.id !== id));
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle product selection for batch operations
  const toggleProductSelection = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(productId => productId !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  // Clear all selections
  const clearSelections = () => {
    setSelectedProducts([]);
  };

  // Handle batch delete
  const handleBatchDelete = async () => {
    if (selectedProducts.length === 0) return;
    
    setIsLoading(true);
    try {
      // Delete each selected product
      for (const id of selectedProducts) {
        await deleteProduct(id);
      }
      
      // Update products list
      setProducts(products.filter(product => !selectedProducts.includes(product.id)));
      setSelectedProducts([]);
    } catch (error) {
      console.error("Error batch deleting products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state during authentication or data fetching
  const showLoading = loading || isLoading;

  return (
    <div className="admin-products-page">
      <Navbar />
      <LoadingOverlay isVisible={showLoading} />
      
      {!showLoading && isAdmin && (
        <div className="admin-products-container">
          <div className="admin-products-header">
            <h1>Gestión de Productos</h1>
            <button 
              className="create-product-button"
              onClick={() => router.push(ROUTES.ADMIN_PRODUCT_CREATE('create'))}
            >
              <Add /> Nuevo Producto
            </button>
          </div>
          
          <div className="products-toolbar">
            <div className="products-search-container">
              <Search className="products-search-icon" />
              <input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="products-search-input"
              />
            </div>
            
            {selectedProducts.length > 0 && (
              <div className="batch-actions">
                <span>{selectedProducts.length} seleccionados</span>
                <button className="batch-delete-button" onClick={handleBatchDelete}>
                  <Delete /> Eliminar seleccionados
                </button>
                <button className="clear-selection-button" onClick={clearSelections}>
                  Cancelar
                </button>
              </div>
            )}
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th className="checkbox-column">
                      <input 
                        type="checkbox"
                        checked={selectedProducts.length === filteredProducts.length}
                        onChange={() => {
                          if (selectedProducts.length === filteredProducts.length) {
                            setSelectedProducts([]);
                          } else {
                            setSelectedProducts(filteredProducts.map(p => p.id));
                          }
                        }}
                      />
                    </th>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Precio</th>
                    <th>Stock</th>
                    <th>Destacado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.id}>
                      <td className="checkbox-column">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                        />
                      </td>
                      <td>
                        <img 
                          src={product.images[0] || '/placeholder-product.jpg'} 
                          alt={product.name}
                          className="product-thumbnail"
                        />
                      </td>
                      <td>{product.name}</td>
                      <td>
                        {/* Get the name of the category using the helper function */}
                        {getCategoryName(product.category)}
                      </td>
                      <td>S/ {product.price.toFixed(2)}</td>
                      <td>
                        {product.stockQuantity > 0 ? (
                          product.stockQuantity
                        ) : (
                          <span className="out-of-stock">Agotado</span>
                        )}
                      </td>
                      <td>
                        {product.featured ? (
                          <span className="featured-badge">Destacado</span>
                        ) : (
                          <span className="not-featured">No</span>
                        )}
                      </td>
                      <td className="actions-column">
                        <button 
                          className="edit-button"
                          onClick={() => router.push(ROUTES.ADMIN_PRODUCT_EDIT(product.id))}
                        >
                          <Edit />
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => setShowDeleteConfirm(product.id)}
                        >
                          <Delete />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="no-products-found">
              <Search className="no-results-icon" />
              <h3>No se encontraron productos</h3>
              <p>Intenta con otra búsqueda o crea un nuevo producto</p>
            </div>
          )}
        </div>
      )}
      
      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="modal-content">
            <Warning className="warning-icon" />
            <h3>¿Estás seguro?</h3>
            <p>Esta acción no se puede deshacer. El producto será marcado como inactivo.</p>
            <div className="modal-actions">
              <button 
                className="cancel-button"
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancelar
              </button>
              <button 
                className="confirm-button"
                onClick={() => handleDeleteProduct(showDeleteConfirm)}
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
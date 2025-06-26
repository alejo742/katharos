"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Save, 
  ArrowBack, 
  CheckCircle,
  RemoveCircle
} from '@mui/icons-material';
import { getAllCategories, getCategoryName } from '@/features/products/types/category';
import { Product } from '@/features/products/types/product';
import { createProduct } from '../../services/create/createProduct';
import { updateProduct } from '../../services/update/updateProduct';
import { getProductById } from '../../services/get/getProductById';
import ImageUploader from '../ImageUploader/ImageUploader';
import ImagePreview from '../ImagePreview/ImagePreview';
import LoadingOverlay from '@/shared/components/LoadingOverlay/LoadingOverlay';
import ROUTES from '@/shared/routes';
import './ProductForm.css';
import useAuth from '@/features/auth/hooks/useAuth';

interface ProductFormProps {
  productId?: string; // If provided, we're editing an existing product
}

const ProductForm: React.FC<ProductFormProps> = ({ productId }) => {
  const { user, loading: userLoading } = useAuth();
  const router = useRouter();
  const isEditMode = Boolean(productId && productId !== 'create');
  
  // Get categories for the dropdown
  const categories = getAllCategories().filter(cat => cat.id !== 'all');
  
  // Form state
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    description: '',
    price: 0,
    salePrice: undefined,
    images: [],
    category: '',
    tags: [],
    stockQuantity: 0,
    featured: false,
    attributes: {},
    isActive: true
  });
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  
  // Fetch product data if in edit mode
  useEffect(() => {
    const fetchProduct = async () => {
      if (!isEditMode) return;
      
      setLoading(true);
      try {
        const product = await getProductById(productId!);
        if (product) {
          setFormData(product);
        } else {
          router.push(ROUTES.ADMIN_PRODUCTS);
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId, router, isEditMode]);
  
  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear error when field is updated
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors[name];
        return newErrors;
      });
    }
    
    // Handle numeric fields
    if (name === 'price' || name === 'salePrice' || name === 'stockQuantity') {
      const numValue = parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle image uploads
  const handleImagesUploaded = (newImageUrls: string[]) => {
    setFormData(prev => ({
      ...prev,
      images: [...(prev.images || []), ...newImageUrls]
    }));
    
    // Clear any image-related errors
    if (errors.images) {
      setErrors(prev => {
        const newErrors = {...prev};
        delete newErrors.images;
        return newErrors;
      });
    }
  };
  
  // Handle image removal
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index)
    }));
  };
  
  // Handle image reordering
  const handleReorderImages = (startIndex: number, endIndex: number) => {
    setFormData(prev => {
      const newImages = [...(prev.images || [])];
      const [removed] = newImages.splice(startIndex, 1);
      newImages.splice(endIndex, 0, removed);
      return {
        ...prev,
        images: newImages
      };
    });
  };
  
  // Handle tag input
  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), tagInput.trim()]
    }));
    
    setTagInput('');
  };
  
  // Handle tag removal
  const handleRemoveTag = (index: number) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter((_, i) => i !== index)
    }));
  };
  
  // Validate the form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.name?.trim()) {
      newErrors.name = 'El nombre del producto es obligatorio';
    }
    
    if (!formData.description?.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }
    
    if (!formData.category) {
      newErrors.category = 'Debes seleccionar una categoría';
    }
    
    // Price validation
    if (formData.price === undefined || formData.price < 0) {
      newErrors.price = 'El precio debe ser un número positivo';
    }
    
    // Sale price validation
    if (formData.salePrice !== undefined && formData.salePrice > 0) {
      if (formData.salePrice >= (formData.price || 0)) {
        newErrors.salePrice = 'El precio de oferta debe ser menor que el precio regular';
      }
    }
    
    // Stock validation
    if (formData.stockQuantity === undefined || formData.stockQuantity < 0) {
      newErrors.stockQuantity = 'La cantidad de stock debe ser un número positivo';
    }
    
    // Images validation
    if (!formData.images?.length) {
      newErrors.images = 'Debes subir al menos una imagen del producto';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setSuccessMessage(null);
    
    try {
      if (isEditMode) {
        // Update existing product
        console.log(`Updating product with ID: ${productId}`);
        await updateProduct(productId!, formData);
        setSuccessMessage('¡Producto actualizado con éxito!');
      } else {
        // Create new product
        console.log('Creating new product');
        const userId = user?.uid || 'unknown';
        // Cast to required type for creation, ensuring all required fields are present
        const productData = {
          ...formData,
          name: formData.name || '',
          description: formData.description || '',
          price: formData.price || 0,
          images: formData.images || [],
          category: formData.category || '',
          tags: formData.tags || [],
          stockQuantity: formData.stockQuantity || 0,
          featured: formData.featured || false,
          isActive: true
        } as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>;
        
        await createProduct(productData, userId);
        setSuccessMessage('¡Producto creado con éxito!');
        
        // Clear form if creating a new product
        setFormData({
          name: '',
          description: '',
          price: 0,
          images: [],
          category: '',
          tags: [],
          stockQuantity: 0,
          featured: false,
          attributes: {},
          isActive: true
        });
      }
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(ROUTES.ADMIN_PRODUCTS);
      }, 2000);
    } catch (error: any) {
      console.error('Error saving product:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Error al guardar el producto. Por favor, inténtalo de nuevo.'
      }));
    } finally {
      setLoading(false);
    }
  };
  
  const formTitle = isEditMode ? 'Editar Producto' : 'Crear Nuevo Producto';
  const submitButtonText = isEditMode ? 'Actualizar Producto' : 'Crear Producto';
  
  return (
    <div className="product-form-container">
      <LoadingOverlay isVisible={loading} />
      
      {/* Success message */}
      {successMessage && (
        <div className="success-message">
          <CheckCircle className="success-icon" />
          <span>{successMessage}</span>
        </div>
      )}
      
      {/* Form header */}
      <div className="form-header">
        <button 
          type="button" 
          className="back-button"
          onClick={() => router.push(ROUTES.ADMIN_PRODUCTS)}
        >
          <ArrowBack /> Volver
        </button>
        <h1>{formTitle}</h1>
        <button 
          type="button" 
          className="preview-toggle"
          onClick={() => setPreviewMode(!previewMode)}
        >
          {previewMode ? 'Modo Edición' : 'Vista Previa'}
        </button>
      </div>
      
      <div className={`form-content ${previewMode ? 'preview-active' : ''}`}>
        {/* Form section */}
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nombre del Producto *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              className={errors.name ? 'error' : ''}
              disabled={loading}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">Precio (S/) *</label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                value={formData.price || 0}
                onChange={handleInputChange}
                className={errors.price ? 'error' : ''}
                disabled={loading}
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="salePrice">Precio de Oferta (S/)</label>
              <input
                type="number"
                id="salePrice"
                name="salePrice"
                min="0"
                step="0.01"
                value={formData.salePrice || ''}
                onChange={handleInputChange}
                className={errors.salePrice ? 'error' : ''}
                disabled={loading}
              />
              {errors.salePrice && <span className="error-message">{errors.salePrice}</span>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Categoría *</label>
              <select
                id="category"
                name="category"
                value={formData.category || ''}
                onChange={handleInputChange}
                className={errors.category ? 'error' : ''}
                disabled={loading}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>
            
            <div className="form-group">
              <label htmlFor="stockQuantity">Cantidad en Stock *</label>
              <input
                type="number"
                id="stockQuantity"
                name="stockQuantity"
                min="0"
                step="1"
                value={formData.stockQuantity || 0}
                onChange={handleInputChange}
                className={errors.stockQuantity ? 'error' : ''}
                disabled={loading}
              />
              {errors.stockQuantity && <span className="error-message">{errors.stockQuantity}</span>}
            </div>
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured || false}
                onChange={handleCheckboxChange}
                disabled={loading}
              />
              Marcar como producto destacado
            </label>
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descripción *</label>
            <textarea
              id="description"
              name="description"
              rows={6}
              value={formData.description || ''}
              onChange={handleInputChange}
              className={errors.description ? 'error' : ''}
              disabled={loading}
            ></textarea>
            {errors.description && <span className="error-message">{errors.description}</span>}
          </div>
          
          <div className="form-group">
            <label>Etiquetas</label>
            <div className="tags-input">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Añadir etiqueta y presionar Enter"
                disabled={loading}
              />
              <button 
                type="button" 
                onClick={handleAddTag}
                disabled={!tagInput.trim() || loading}
              >
                Añadir
              </button>
            </div>
            <div className="tags-list">
              {formData.tags?.map((tag, index) => (
                <span key={index} className="tag">
                  {tag}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveTag(index)}
                    disabled={loading}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          <div className="form-group">
            <label>Imágenes del Producto *</label>
            <ImageUploader 
              onUploadComplete={handleImagesUploaded}
              productId={isEditMode ? productId : undefined}
              multiple={true}
              maxFiles={5}
            />
            {errors.images && <span className="error-message">{errors.images}</span>}
          </div>
          
          <ImagePreview 
            images={formData.images || []}
            onRemove={handleRemoveImage}
            onReorder={handleReorderImages}
          />
          
          {errors.submit && <div className="submit-error">{errors.submit}</div>}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => router.push(ROUTES.ADMIN_PRODUCTS)}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="save-button"
              disabled={loading}
            >
              <Save /> {submitButtonText}
            </button>
          </div>
        </form>
        
        {/* Preview section */}
        {previewMode && (
          <div className="product-preview">
            <div className="preview-header">
              <h2>Vista Previa</h2>
            </div>
            
            <div className="preview-content">
              <div className="preview-images">
                {formData.images && formData.images.length > 0 ? (
                  <img src={formData.images[0]} alt={formData.name} className="main-image" />
                ) : (
                  <div className="placeholder-image">No hay imagen</div>
                )}
                
                {formData.images && formData.images.length > 1 && (
                  <div className="thumbnail-row">
                    {formData.images.slice(0, 4).map((img, index) => (
                      <div key={index} className="thumbnail">
                        <img src={img} alt={`${formData.name} thumbnail ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="preview-info">
                {formData.featured && (
                  <span className="preview-featured-badge">Destacado</span>
                )}
                
                <h1 className="preview-title">{formData.name || 'Nombre del Producto'}</h1>
                
                <div className="preview-price-container">
                  {formData.salePrice ? (
                    <>
                      <span className="preview-original-price">S/ {formData.price?.toFixed(2)}</span>
                      <span className="preview-sale-price">S/ {formData.salePrice?.toFixed(2)}</span>
                    </>
                  ) : (
                    <span className="preview-price">S/ {formData.price?.toFixed(2)}</span>
                  )}
                </div>
                
                <div className="preview-stock">
                  {(formData.stockQuantity || 0) > 0 ? (
                    <span className="in-stock">
                      <CheckCircle /> En stock ({formData.stockQuantity} unidades)
                    </span>
                  ) : (
                    <span className="out-of-stock">
                      <RemoveCircle /> Agotado
                    </span>
                  )}
                </div>
                
                <div className="preview-description">
                  <h3>Descripción</h3>
                  <p>{formData.description || 'No hay descripción disponible.'}</p>
                </div>
                
                {formData.tags && formData.tags.length > 0 && (
                  <div className="preview-tags">
                    {formData.tags.map((tag, index) => (
                      <span key={index} className="preview-tag">{tag}</span>
                    ))}
                  </div>
                )}
                
                <div className="preview-category">
                  <strong>Categoría:</strong> {getCategoryName(formData.category || '')}
                </div>
                
                <button className="preview-buy-button" disabled>
                  Añadir al Carrito
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductForm;
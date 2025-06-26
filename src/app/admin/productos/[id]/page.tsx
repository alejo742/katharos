"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AddAPhoto, Save, ArrowBack, Delete } from '@mui/icons-material';
import Navbar from '@/shared/components/Navbar/Navbar';
import LoadingOverlay from '@/shared/components/LoadingOverlay/LoadingOverlay';
import { Product } from '@/features/products/types/product';
import { CATEGORIES } from '@/features/products/types/category';
import { getProductById } from '@/features/products/services/get/getProductById';
import { updateProduct } from '@/features/products/services/update/updateProduct';
import { createProduct } from '@/features/products/services/create/createProduct'; // Import createProduct
import { uploadProductImages } from '@/features/products/services/images/uploadProductImages';
import { deleteProductImage } from '@/features/products/services/images/deleteProductImage';
import ROUTES from '@/shared/routes';
import useAuth from '@/features/auth/hooks/useAuth';
import { checkAdminStatus } from '@/features/admin/services/checkAdminStatus';
import { getAuth } from 'firebase/auth';
import './page.css';

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const isCreateMode = productId === 'create';
  const { user, loading: authLoading } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Image upload refs
  const fileInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Product state
  const [product, setProduct] = useState<Product>({
    id: '',
    name: '',
    description: '',
    price: 0,
    stockQuantity: 0,
    category: '',
    images: [],
    featured: false,
    isActive: true,
    tags: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: ''
  });

  // Tag input state
  const [tagInput, setTagInput] = useState('');

  // Check admin status
  useEffect(() => {
    const checkAccess = async () => {
      if (authLoading) return;

      if (!user) {
        router.push(ROUTES.LOGIN);
        return;
      }

      const isAdmin = await checkAdminStatus();
      if (!isAdmin) {
        router.push(ROUTES.HOME);
      }
    };

    checkAccess();
  }, [user, authLoading, router]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      if (isCreateMode) {
        // If we're in create mode, just set loading to false
        setLoading(false);
        return;
      }

      try {
        const productData = await getProductById(productId);
        if (productData) {
          setProduct(productData);
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

    fetchProduct();
  }, [productId, isCreateMode]);

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric fields
    if (name === 'price' || name === 'stockQuantity') {
      setProduct({
        ...product,
        [name]: parseFloat(value) || 0
      });
    } else {
      setProduct({
        ...product,
        [name]: value
      });
    }
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setProduct({
      ...product,
      [name]: checked
    });
  };

  // Handle image upload
  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    setLoading(true);
    
    try {
      // For create mode, use a temporary folder
      const tempId = isCreateMode ? 'temp' : productId;
      
      // Upload the image
      const imageUrls = await uploadProductImages([file], tempId);
      
      if (imageUrls && imageUrls.length > 0) {
        // Create a copy of the current images array
        const updatedImages = [...product.images];
        
        // If the index already has an image, replace it
        if (index < updatedImages.length) {
          // Delete the old image if it exists
          if (updatedImages[index] && !isCreateMode) {
            await deleteProductImage(productId, updatedImages[index]);
          }
          updatedImages[index] = imageUrls[0];
        } else {
          // Otherwise, add it to the end
          updatedImages.push(imageUrls[0]);
        }
        
        setProduct({
          ...product,
          images: updatedImages
        });
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Error al subir la imagen');
    } finally {
      setLoading(false);
      // Clear the file input
      if (fileInputRefs[index].current) {
        fileInputRefs[index].current.value = '';
      }
    }
  };

  // Handle image deletion
  const handleImageDelete = async (index: number) => {
    if (index >= product.images.length) return;
    
    setLoading(true);
    
    try {
      // Delete the image if not in create mode
      if (!isCreateMode && product.images[index]) {
        await deleteProductImage(productId, product.images[index]);
      }
      
      // Remove the image from the array
      const updatedImages = [...product.images];
      updatedImages.splice(index, 1);
      
      setProduct({
        ...product,
        images: updatedImages
      });
    } catch (err) {
      console.error('Error deleting image:', err);
      setError('Error al eliminar la imagen');
    } finally {
      setLoading(false);
    }
  };

  // Handle tag input
  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Add tag on Enter or comma
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (!tag) return;
    
    // Check if tag is already in the list
    if (!product.tags.includes(tag)) {
      setProduct({
        ...product,
        tags: [...product.tags, tag]
      });
    }
    
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setProduct({
      ...product,
      tags: product.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // Form validation
  const validateForm = (): boolean => {
    if (!product.name) {
      setError('El nombre del producto es obligatorio');
      return false;
    }
    
    if (!product.description) {
      setError('La descripción del producto es obligatoria');
      return false;
    }
    
    if (product.price <= 0) {
      setError('El precio debe ser mayor que 0');
      return false;
    }
    
    if (product.stockQuantity < 0) {
      setError('La cantidad en stock no puede ser negativa');
      return false;
    }
    
    if (!product.category) {
      setError('Debe seleccionar una categoría');
      return false;
    }
    
    if (product.images.length === 0) {
      setError('Debe subir al menos una imagen');
      return false;
    }
    
    return true;
  };

  // Save product
  const handleSave = async () => {
    // Clear previous messages
    setError(null);
    setSuccess(null);
    
    // Validate form
    if (!validateForm()) return;
    
    setSaving(true);
    
    try {
      // Add any tag still in the input
      if (tagInput.trim()) {
        addTag();
      }
      
      const auth = getAuth();
      const userId = auth.currentUser?.uid || '';
      
      // Create or update the product using the appropriate function
      if (isCreateMode) {
        // Prepare data for create
        const createData = {
          name: product.name,
          description: product.description,
          price: product.price,
          stockQuantity: product.stockQuantity,
          category: product.category,
          images: product.images,
          featured: product.featured,
          isActive: product.isActive,
          tags: product.tags,
        };
        
        // Use createProduct function for new products
        await createProduct(createData as Omit<Product, 'id' | 'createdAt' | 'updatedAt'>, userId);
        setSuccess('Producto creado exitosamente');
      } else {
        // Prepare data for update
        const updateData = {
          name: product.name,
          description: product.description,
          price: product.price,
          stockQuantity: product.stockQuantity,
          category: product.category,
          images: product.images,
          featured: product.featured,
          isActive: product.isActive,
          tags: product.tags,
        };
        
        // Use updateProduct function for existing products
        await updateProduct(productId, updateData);
        setSuccess('Producto actualizado exitosamente');
      }
      
      // Redirect to products list after a brief delay
      setTimeout(() => {
        router.push(ROUTES.ADMIN_PRODUCTS);
      }, 1500);
    } catch (err: any) {
      console.error('Error saving product:', err);
      setError(err.message || 'Error al guardar el producto');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="product-edit-page">
      <Navbar />
      <LoadingOverlay isVisible={loading || saving} />
      
      <div className="product-edit-container">
        <div className="product-edit-header">
          <button 
            className="back-button"
            onClick={() => router.push(ROUTES.ADMIN_PRODUCTS)}
          >
            <ArrowBack /> Volver
          </button>
          <h1>{isCreateMode ? 'Crear Nuevo Producto' : 'Editar Producto'}</h1>
        </div>
        
        {error && (
          <div className="alert error">
            <p>{error}</p>
          </div>
        )}
        
        {success && (
          <div className="alert success">
            <p>{success}</p>
          </div>
        )}
        
        <div className="product-edit-content">
          {/* Left column - Images */}
          <div className="product-images-section">
            <h2>Imágenes del Producto</h2>
            <p className="helper-text">Máximo 5 imágenes. Haz clic en un espacio para subir una imagen.</p>
            
            <div className="product-main-image">
              {product.images.length > 0 ? (
                <div className="image-container">
                  <img src={product.images[0]} alt={product.name || 'Imagen principal'} />
                  <button 
                    className="delete-image-button"
                    onClick={() => handleImageDelete(0)}
                  >
                    <Delete />
                  </button>
                </div>
              ) : (
                <div 
                  className="image-placeholder main-placeholder"
                  onClick={() => fileInputRefs[0].current?.click()}
                >
                  <AddAPhoto />
                  <span>Imagen Principal</span>
                  <input
                    type="file"
                    ref={fileInputRefs[0]}
                    onChange={(e) => handleImageUpload(0, e)}
                    accept="image/*"
                    hidden
                  />
                </div>
              )}
            </div>
            
            <div className="product-thumbnails">
              {[1, 2, 3, 4].map((index) => (
                <div key={index} className="thumbnail-container">
                  {product.images.length > index ? (
                    <div className="image-container">
                      <img src={product.images[index]} alt={`${product.name || 'Imagen'} - ${index + 1}`} />
                      <button 
                        className="delete-image-button small"
                        onClick={() => handleImageDelete(index)}
                      >
                        <Delete />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="image-placeholder"
                      onClick={() => fileInputRefs[index].current?.click()}
                    >
                      <AddAPhoto />
                      <input
                        type="file"
                        ref={fileInputRefs[index]}
                        onChange={(e) => handleImageUpload(index, e)}
                        accept="image/*"
                        hidden
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Right column - Product details */}
          <div className="product-details-section">
            <div className="form-group">
              <label htmlFor="name">Nombre del Producto *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={product.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">Precio (S/) *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={product.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="stockQuantity">Cantidad en Stock *</label>
                <input
                  type="number"
                  id="stockQuantity"
                  name="stockQuantity"
                  value={product.stockQuantity}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="category">Categoría *</label>
              <select
                id="category"
                name="category"
                value={product.category}
                onChange={handleInputChange}
                required
              >
                <option value="">Seleccionar categoría</option>
                {CATEGORIES.filter(cat => cat.id !== 'all').map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Descripción *</label>
              <textarea
                id="description"
                name="description"
                value={product.description}
                onChange={handleInputChange}
                rows={5}
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="tags">Etiquetas</label>
              <div className="tags-input-container">
                <div className="tags-list">
                  {product.tags.map(tag => (
                    <span key={tag} className="tag">
                      {tag}
                      <button onClick={() => removeTag(tag)}>&times;</button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  id="tags"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagInput}
                  onBlur={addTag}
                  placeholder="Añadir etiquetas (presiona Enter)"
                />
              </div>
              <p className="helper-text">Presiona Enter para añadir cada etiqueta</p>
            </div>
            
            <div className="form-row checkbox-row">
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="featured"
                  name="featured"
                  checked={product.featured}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="featured">Producto Destacado</label>
              </div>
              
              <div className="form-group checkbox-group">
                <input
                  type="checkbox"
                  id="isActive"
                  name="isActive"
                  checked={product.isActive}
                  onChange={handleCheckboxChange}
                />
                <label htmlFor="isActive">Activo</label>
              </div>
            </div>
            
            <div className="form-actions">
              <button
                className="save-button"
                onClick={handleSave}
                disabled={saving}
              >
                <Save /> {saving ? 'Guardando...' : isCreateMode ? 'Crear Producto' : 'Guardar Cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
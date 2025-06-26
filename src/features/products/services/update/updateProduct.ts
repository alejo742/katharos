/**
 * Function to update an existing product.
 */
import { Product } from "@/features/products/types/product";
import ProductRepository from "@/features/products/repositories/product.repository";
import { getAuth } from "firebase/auth";

/**
 * Updates an existing product with the provided data
 * @param productId - The ID of the product to update
 * @param data - The product data to update (partial)
 * @returns Promise<string> - The ID of the updated product
 * @throws Error if the update fails or if trying to create a new product
 */
export async function updateProduct(productId: string, data: Partial<Product>): Promise<string> {
  try {
    // Validate that we're not trying to create a product with this function
    if (!productId || productId === 'create') {
      throw new Error('This function is for updating products only. Use createProduct for new products.');
    }
    
    const auth = getAuth();
    const user = auth.currentUser;
    
    // Set updated timestamp and user
    const updateData = {
      ...data,
      updatedAt: new Date(),
      updatedBy: user?.uid || '',
    };
    
    // Update the existing product
    await ProductRepository.updateProduct(productId, updateData);
    return productId;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error instanceof Error 
      ? error 
      : new Error('Failed to update product');
  }
}
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

/**
 * Repository for handling Firebase Storage operations
 */
class StorageRepository {
  /**
   * Upload a product image to Firebase Storage
   * @param file - The image file to upload
   * @param productId - Optional product ID for organizing files
   * @returns Promise with the download URL
   */
  static async uploadProductImage(file: File, productId?: string): Promise<string> {
    try {
      // Validate file type
      if (!this.validateImageType(file)) {
        throw new Error('Invalid file type. Only JPG, PNG, GIF, and WEBP images are allowed.');
      }

      // Create a unique filename
      const fileId = uuidv4();
      const extension = file.name.split('.').pop();
      const fileName = `${fileId}.${extension}`;
      
      // Determine the storage path
      const path = productId 
        ? `product-images/${productId}/${fileName}`
        : `product-images/temp/${fileName}`;
      
      // Create a reference to the file location
      const storageRef = ref(storage, path);
      
      // Upload the file
      const snapshot = await uploadBytes(storageRef, file);
      
      // Get and return the download URL
      return await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('Failed to upload image. Please try again.');
    }
  }
  
  /**
   * Upload multiple product images
   * @param files - Array of image files to upload
   * @param productId - Optional product ID
   * @returns Promise with array of download URLs
   */
  static async uploadMultipleImages(files: File[], productId?: string): Promise<string[]> {
    try {
      const uploadPromises = Array.from(files).map(file => 
        this.uploadProductImage(file, productId)
      );
      
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Error uploading multiple images:', error);
      throw new Error('Failed to upload one or more images. Please try again.');
    }
  }
  
  /**
   * Delete a product image from storage
   * @param imageUrl - The full URL of the image to delete
   */
  static async deleteProductImage(imageUrl: string): Promise<void> {
    try {
      // Extract the path from the URL
      const storageRef = ref(storage, this.getPathFromURL(imageUrl));
      
      // Delete the file
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting image:', error);
      throw new Error('Failed to delete image. Please try again.');
    }
  }

  /**
   * Delete multiple product images from storage
   * @param imageUrls - Array of image URLs to delete
   * @returns Promise that resolves when all images are deleted
   */
  static async deleteMultipleImages(imageUrls: string[]): Promise<void> {
    try {
      const deletePromises = imageUrls.map(url => this.deleteProductImage(url));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Error deleting multiple images:', error);
      throw new Error('Failed to delete one or more images. Please try again.');
    }
  }

  /**
   * Delete all images for a product
   * @param productId - The product ID
   * @returns Promise that resolves when all images are deleted
   */
  static async deleteAllProductImages(productId: string): Promise<void> {
    try {
      const productFolderRef = ref(storage, `product-images/${productId}`);
      
      // List all items in the folder
      const result = await listAll(productFolderRef);
      
      // Delete each item
      const deletePromises = result.items.map(itemRef => deleteObject(itemRef));
      await Promise.all(deletePromises);
    } catch (error) {
      console.error(`Error deleting all images for product ${productId}:`, error);
      throw new Error('Failed to delete product images. Please try again.');
    }
  }

  /**
   * Move an image from temp storage to a specific product folder
   * @param imageUrl - The current image URL
   * @param productId - The product ID to move the image to
   * @returns Promise with the new URL
   */
  static async moveImageToProduct(imageUrl: string, productId: string): Promise<string> {
    try {
      // Get the current path and extract the filename
      const currentPath = this.getPathFromURL(imageUrl);
      const fileName = currentPath.split('/').pop();
      
      if (!fileName) {
        throw new Error('Invalid image URL');
      }
      
      // Download the file - we need its content
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], fileName, { type: blob.type });
      
      // Upload to the new location
      const newUrl = await this.uploadProductImage(file, productId);
      
      // Delete the original file
      await this.deleteProductImage(imageUrl);
      
      return newUrl;
    } catch (error) {
      console.error('Error moving image:', error);
      throw new Error('Failed to move image. Please try again.');
    }
  }

  /**
   * List all images for a product
   * @param productId - The product ID
   * @returns Promise with array of image URLs
   */
  static async listProductImages(productId: string): Promise<string[]> {
    try {
      const productFolderRef = ref(storage, `product-images/${productId}`);
      
      // List all items in the folder
      const result = await listAll(productFolderRef);
      
      // Get download URLs for all items
      const urlPromises = result.items.map(itemRef => getDownloadURL(itemRef));
      return await Promise.all(urlPromises);
    } catch (error) {
      console.error(`Error listing images for product ${productId}:`, error);
      throw new Error('Failed to list product images. Please try again.');
    }
  }
  
  /**
   * Helper method to extract the storage path from a download URL
   */
  private static getPathFromURL(url: string): string {
    // The URL looks like: https://firebasestorage.googleapis.com/v0/b/[bucket]/o/[encoded-path]?token...
    try {
      const baseUrl = 'https://firebasestorage.googleapis.com/v0/b/';
      const bucketEnd = url.indexOf('/o/');
      if (bucketEnd === -1) throw new Error('Invalid storage URL format');
      
      // Extract the path
      const path = url.substring(bucketEnd + 3);
      const pathEnd = path.indexOf('?');
      
      // Decode the path
      return decodeURIComponent(pathEnd !== -1 ? path.substring(0, pathEnd) : path);
    } catch (error) {
      console.error('Error parsing storage URL:', error);
      throw new Error('Invalid storage URL format');
    }
  }

  /**
   * Validate that a file is an allowed image type
   * @param file - The file to validate
   * @returns boolean - True if valid image type
   */
  private static validateImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }
}

export default StorageRepository;
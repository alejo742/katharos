/**
 * Function to delete a product image from storage.
 * Calls the storage repository to remove the file.
 */
import StorageRepository from "@/features/products/repositories/storage.repository";
import ProductRepository from "@/features/products/repositories/product.repository";

/**
 * Deletes a product image from storage and updates the product.
 * @param productId - The ID of the product
 * @param imageUrl - The URL of the image to delete
 * @returns Promise<void> - A promise that resolves when the image is deleted
 */
export async function deleteProductImage(
    productId: string,
    imageUrl: string
): Promise<void> {
    try {
        // Get the current product
        const product = await ProductRepository.fetchProductById(productId);
        if (!product) {
            throw new Error("Product not found");
        }
        
        // Ensure the image URL belongs to this product
        if (!product.images.includes(imageUrl)) {
            throw new Error("Image not found in product");
        }
        
        // Delete the image from storage
        await StorageRepository.deleteProductImage(imageUrl);
        
        // Update the product's image list
        const updatedImages = product.images.filter(url => url !== imageUrl);
        await ProductRepository.updateProduct(productId, { images: updatedImages });
    } catch (error) {
        console.error(`Error deleting product image:`, error);
        throw new Error("Failed to delete image. Please try again later.");
    }
}
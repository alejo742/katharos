/**
 * Function to soft-delete a product.
 * Calls the product repository to mark the product as inactive.
 */
import ProductRepository from "@/features/products/repositories/product.repository";

/**
 * Soft-deletes a product by marking it as inactive.
 * @param productId - The ID of the product to delete
 * @returns Promise<void> - A promise that resolves when the product is deleted
 */
export async function deleteProduct(productId: string): Promise<void> {
    try {
        // Check if product exists
        const existingProduct = await ProductRepository.fetchProductById(productId);
        if (!existingProduct) {
            throw new Error("Product not found");
        }
        
        // Soft delete the product
        await ProductRepository.deleteProduct(productId);
    } catch (error) {
        console.error(`Error deleting product ${productId}:`, error);
        throw new Error("Failed to delete product. Please try again later.");
    }
}
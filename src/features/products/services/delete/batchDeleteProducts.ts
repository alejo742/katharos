/**
 * Function to delete multiple products at once.
 * Calls the product repository to mark multiple products as inactive.
 */
import ProductRepository from "@/features/products/repositories/product.repository";

/**
 * Batch deletes multiple products by marking them as inactive.
 * @param productIds - Array of product IDs to delete
 * @returns Promise<void> - A promise that resolves when all products are deleted
 */
export async function batchDeleteProducts(productIds: string[]): Promise<void> {
    try {
        // Validate input
        if (!productIds || productIds.length === 0) {
            throw new Error("No product IDs provided for deletion");
        }
        
        // Delete each product
        const deletePromises = productIds.map(id => ProductRepository.deleteProduct(id));
        await Promise.all(deletePromises);
    } catch (error) {
        console.error("Error batch deleting products:", error);
        throw new Error("Failed to delete one or more products. Please try again later.");
    }
}
/**
 * Function to toggle a product's featured status.
 * Calls the product repository to update the featured flag.
 */
import { Product } from "@/features/products/types/product";
import ProductRepository from "@/features/products/repositories/product.repository";

/**
 * Toggles the featured status of a product.
 * @param productId - The ID of the product to update
 * @param featured - The new featured status (true/false)
 * @returns Promise<Product> - A promise that resolves to the updated product
 */
export async function toggleProductFeatured(
    productId: string,
    featured: boolean
): Promise<Product> {
    try {
        // Update the featured status
        return await ProductRepository.updateProduct(productId, { featured });
    } catch (error) {
        console.error(`Error updating featured status for product ${productId}:`, error);
        throw new Error("Failed to update product featured status. Please try again later.");
    }
}
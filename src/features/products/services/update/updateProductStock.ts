/**
 * Function to update a product's stock quantity.
 * Calls the product repository to update stock in the database.
 */
import { Product } from "@/features/products/types/product";
import ProductRepository from "@/features/products/repositories/product.repository";

/**
 * Updates the stock quantity of a product.
 * @param productId - The ID of the product to update
 * @param quantity - The new stock quantity
 * @returns Promise<Product> - A promise that resolves to the updated product
 */
export async function updateProductStock(
    productId: string,
    quantity: number
): Promise<Product> {
    try {
        // Validate quantity
        if (quantity < 0) {
            throw new Error("Stock quantity cannot be negative");
        }
        
        // Update stock through repository
        return await ProductRepository.updateStockQuantity(productId, quantity);
    } catch (error) {
        console.error(`Error updating stock for product ${productId}:`, error);
        throw new Error("Failed to update product stock. Please try again later.");
    }
}
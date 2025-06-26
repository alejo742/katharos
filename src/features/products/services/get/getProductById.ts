/**
 * Function to fetch a single product by its ID.
 * Calls the product repository to get the specific product.
 */
import { Product } from "@/features/products/types/product";
import ProductRepository from "@/features/products/repositories/product.repository";

/**
 * Fetches a single product from the server based on its ID.
 * @param id - The ID of the product to fetch.
 * @returns Promise<Product | null> - A promise that resolves to the product or null if not found.
 */
export async function getProductById(id: string): Promise<Product | null> {
    try {
        // Call the repository method to fetch the product by ID
        const product = await ProductRepository.fetchProductById(id);
        
        // If product is inactive, return null unless it's for admin view
        if (product && !product.isActive) {
            return null;
        }
        
        return product;
    } catch (error) {
        console.error(`Error fetching product with ID ${id}:`, error);
        throw new Error("Failed to fetch product. Please try again later.");
    }
}
/**
 * Function to fetch featured products.
 * Calls the product repository to get products marked as featured.
 */
import { Product } from "@/features/products/types/product";
import ProductRepository from "@/features/products/repositories/product.repository";

/**
 * Fetches featured products from the server.
 * @param limit - Maximum number of featured products to return.
 * @returns Promise<Product[]> - A promise that resolves to an array of featured products.
 */
export async function getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    try {
        // Call the repository method to fetch featured products
        const featuredProducts = await ProductRepository.fetchFeaturedProducts(limit);
        return featuredProducts;
    } catch (error) {
        console.error("Error fetching featured products:", error);
        throw new Error("Failed to fetch featured products. Please try again later.");
    }
}
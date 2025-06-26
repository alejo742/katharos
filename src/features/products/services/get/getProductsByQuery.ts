/**
 * Function to fetch products based on a query.
 * Calls the product repository to get products that match the query.
 */
import { Product } from "@/features/products/types/product";
import ProductRepository from "@/features/products/repositories/product.repository";

/**
 * Fetches products from the server based on a search query.
 * @param query - The search query to filter products.
 * @returns Promise<Product[]> - A promise that resolves to an array of products matching the query.
 */
export async function getProductsByQuery(query: string): Promise<Product[]> {
    try {
        // Call the repository method to fetch products by query
        const products = await ProductRepository.fetchProductsByQuery(query);
        return products;
    } catch (error) {
        console.error("Error fetching products by query:", error);
        throw new Error("Failed to fetch products. Please try again later.");
    }
}
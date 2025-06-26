/**
 * Function to fetch products by category.
 * Calls the product repository to get products in the specified category.
 */
import { Product } from "@/features/products/types/product";
import ProductRepository from "@/features/products/repositories/product.repository";

/**
 * Fetches products from the server based on a category.
 * @param category - The category to filter products by.
 * @returns Promise<Product[]> - A promise that resolves to an array of products in the specified category.
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
    try {
        // If "all" category is selected, fetch all products
        if (category === 'all') {
            const allProducts = await ProductRepository.fetchAllProducts();
            return allProducts.filter(product => product.isActive);
        }
        
        // Otherwise, call the repository method to fetch products by category
        const products = await ProductRepository.fetchProductsByCategory(category);
        return products;
    } catch (error) {
        console.error(`Error fetching products in category ${category}:`, error);
        throw new Error("Failed to fetch products. Please try again later.");
    }
}
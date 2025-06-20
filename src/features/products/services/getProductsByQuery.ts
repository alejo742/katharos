/**
 * Function to fetch products based on a query.
 */
import { Product } from "@/features/products/types/product";

/**
 * Fetches products from the server based on a search query.
 * @param query - The search query to filter products.
 * @returns Promise<Product[]> - A promise that resolves to an array of products matching the query.
 */
export async function getProductsByQuery(query: string): Promise<Product[]> {
    try {
        const response = await fetch(`/api/products?query=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error fetching products: ${response.statusText}`);
        }

        const data = await response.json();
        return data.products as Product[];
    } catch (error) {
        console.error("Failed to fetch products:", error);
        return [];
    }
}
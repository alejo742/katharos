/**
 * Function to fetch products with pagination.
 * Calls the product repository to get a page of products.
 */
import { Product } from "@/features/products/types/product";
import ProductRepository from "@/features/products/repositories/product.repository";
import { DocumentSnapshot } from "firebase/firestore";

/**
 * Fetches a paginated list of products.
 * @param pageSize - Number of products per page
 * @param startAfterDoc - Document to start after for pagination
 * @returns Promise with products and last document for pagination
 */
export async function getProductsPaginated(
    pageSize: number = 10,
    startAfterDoc?: DocumentSnapshot
): Promise<{
    products: Product[],
    lastDoc: DocumentSnapshot | null
}> {
    try {
        // Call the repository method to fetch paginated products
        return await ProductRepository.fetchProductsPaginated(pageSize, startAfterDoc);
    } catch (error) {
        console.error("Error fetching paginated products:", error);
        throw new Error("Failed to fetch products. Please try again later.");
    }
}
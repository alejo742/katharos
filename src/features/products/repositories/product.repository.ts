/**
 * Product Repository
 * This module provides functions that are used by the product API
 */
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/features/products/types/product";

export default class ProductRepository {

    /**** PRODUCT FETCHING ****/

    /**
     * Fetches all products from Firebase.
     * @returns Promise<Product[]> - A promise that resolves to an array of all products.
     */
    static async fetchAllProducts(): Promise<Product[]> {
        try {
            const productsRef = collection(db, "products");
            const snapshot = await getDocs(productsRef);
            const products: Product[] = [];

            snapshot.forEach((doc: any) => {
                const product = doc.data() as Product;
                products.push(product);
            });

            return products;
        } catch (error) {
            console.error("Failed to fetch products from Firebase:", error);
            return [];
        }
    }
    /**
     * Fetches products from Firebase based on a specific category.
     * @param category - The category to filter products by.
     * @returns Promise<Product[]> - A promise that resolves to an array of products in the specified category.
     */
    static async fetchProductsByCategory(category: string): Promise<Product[]> {
        try {
            const productsRef = collection(db, "products");
    
            // Use Firestore's `where` clause to filter by category
            const categoryQuery = query(productsRef, where("category", "==", category));
            const snapshot = await getDocs(categoryQuery);
    
            // Map the snapshot to an array of products
            const products: Product[] = snapshot.docs.map((doc) => doc.data() as Product);
    
            return products;
        } catch (error) {
            console.error("Failed to fetch products by category from Firebase:", error);
            return [];
        }
    }
    /**
     * Fetches products from Firebase based on a search query.
     * @param query - The search query to filter products.
     * @returns Promise<Product[]> - A promise that resolves to an array of products matching the query.
     */ // TODO: Search should be improved: multiple matches increases score, basically assign a score (use a util)
    static async fetchProductsByQuery(query: string): Promise<Product[]> {
        try {
            const productsRef = collection(db, "products");
            const snapshot = await getDocs(productsRef);

            // Normalize query for case-insensitive matching
            const normalizedQuery = query.toLowerCase();

            // Filter products client-side for partial matches
            const products: Product[] = [];
            snapshot.forEach((doc: any) => {
                const product = doc.data() as Product;

                if (
                    product.name.toLowerCase().includes(normalizedQuery) || // Match name
                    product.description.toLowerCase().includes(normalizedQuery) || // Match description
                    product.category.toLowerCase().includes(normalizedQuery) // Match category
                ) {
                    products.push(product);
                }
            });

            return products;
        } catch (error) {
            console.error("Failed to fetch products by query from Firebase:", error);
            return [];
        }
    }
}
/**
 * Product Repository
 * This module provides functions for product data operations in Firebase
 */
import { 
    collection, 
    getDocs, 
    getDoc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    doc, 
    query, 
    where,
    orderBy,
    limit,
    startAfter,
    DocumentSnapshot,
    Timestamp,
    serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Product } from "@/features/products/types/product";
import { v4 as uuidv4 } from 'uuid';

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
                const productData = doc.data();
                // Transform any Firestore Timestamps to JavaScript Dates
                const product = this.transformProductDates(productData);
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
    
            // Use Firestore's `where` clause to filter by category and active status
            const categoryQuery = query(
                productsRef, 
                where("category", "==", category),
                where("isActive", "==", true)
            );
            const snapshot = await getDocs(categoryQuery);
    
            // Map the snapshot to an array of products
            const products: Product[] = snapshot.docs.map((doc) => {
                const productData = doc.data();
                return this.transformProductDates(productData);
            });
    
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
     */
    static async fetchProductsByQuery(searchQuery: string): Promise<Product[]> {
        try {
            const productsRef = collection(db, "products");
            
            // Only fetch active products
            const activeQuery = query(productsRef, where("isActive", "==", true));
            const snapshot = await getDocs(activeQuery);

            // Normalize query for case-insensitive matching
            const normalizedQuery = searchQuery.toLowerCase();

            // Filter products client-side for partial matches
            const products: Product[] = [];
            snapshot.forEach((doc: any) => {
                const productData = doc.data();
                const product = this.transformProductDates(productData);

                if (
                    product.name.toLowerCase().includes(normalizedQuery) || // Match name
                    product.description.toLowerCase().includes(normalizedQuery) || // Match description
                    product.category.toLowerCase().includes(normalizedQuery) || // Match category
                    (product.tags && product.tags.some(tag => 
                        tag.toLowerCase().includes(normalizedQuery))) // Match tags
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

    /**
     * Fetches a single product by ID
     * @param productId - The ID of the product to fetch
     * @returns Promise<Product | null> - A promise that resolves to the product or null if not found
     */
    static async fetchProductById(productId: string): Promise<Product | null> {
        try {
            const productRef = doc(db, "products", productId);
            const productSnap = await getDoc(productRef);
            
            if (productSnap.exists()) {
                const productData = productSnap.data();
                return this.transformProductDates(productData);
            }
            
            return null;
        } catch (error) {
            console.error(`Failed to fetch product with ID ${productId}:`, error);
            return null;
        }
    }

    /**
     * Fetches featured products
     * @param limit - Maximum number of products to fetch
     * @returns Promise<Product[]> - A promise that resolves to an array of featured products
     */
    static async fetchFeaturedProducts(maxResults: number = 6): Promise<Product[]> {
        try {
            const productsRef = collection(db, "products");
            
            const featuredQuery = query(
                productsRef,
                where("featured", "==", true),
                where("isActive", "==", true),
                orderBy("createdAt", "desc"),
                limit(maxResults)
            );
            
            const snapshot = await getDocs(featuredQuery);
            
            return snapshot.docs.map(doc => {
                const productData = doc.data();
                return this.transformProductDates(productData);
            });
        } catch (error) {
            console.error("Failed to fetch featured products from Firebase:", error);
            return [];
        }
    }

    /**
     * Fetches products with pagination
     * @param pageSize - Number of products per page
     * @param startAfterDoc - Document to start after for pagination
     * @returns Promise<{products: Product[], lastDoc: DocumentSnapshot | null}> - Products and last document for pagination
     */
    static async fetchProductsPaginated(
        pageSize: number = 10,
        startAfterDoc?: DocumentSnapshot
    ): Promise<{
        products: Product[],
        lastDoc: DocumentSnapshot | null
    }> {
        try {
            const productsRef = collection(db, "products");
            
            let paginatedQuery = query(
                productsRef,
                where("isActive", "==", true),
                orderBy("createdAt", "desc"),
                limit(pageSize)
            );
            
            // If we have a starting document, add it to the query
            if (startAfterDoc) {
                paginatedQuery = query(
                    paginatedQuery,
                    startAfter(startAfterDoc)
                );
            }
            
            const snapshot = await getDocs(paginatedQuery);
            
            const products = snapshot.docs.map(doc => {
                const productData = doc.data();
                return this.transformProductDates(productData);
            });
            
            // Get the last document for next pagination
            const lastDoc = snapshot.docs.length > 0 
                ? snapshot.docs[snapshot.docs.length - 1] 
                : null;
            
            return {
                products,
                lastDoc
            };
        } catch (error) {
            console.error("Failed to fetch paginated products from Firebase:", error);
            return {
                products: [],
                lastDoc: null
            };
        }
    }

    /**** PRODUCT CREATION & UPDATING ****/

    /**
     * Creates a new product in Firestore
     * @param productData - The product data without ID and timestamps
     * @returns Promise<Product> - A promise that resolves to the created product with ID
     */
    static async createProduct(
        productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
        createdBy: string
    ): Promise<Product> {
        try {
            // Generate new ID
            const productId = uuidv4();
            
            // Prepare the product with timestamps and creator ID
            const newProduct: Product = {
                id: productId,
                ...productData,
                createdBy,
                createdAt: new Date(),
                updatedAt: new Date(),
                isActive: true,
            };
            
            // Add to Firestore with the generated ID
            const productRef = doc(db, "products", productId);
            await setDoc(productRef, this.prepareForFirestore(newProduct));
            
            return newProduct;
        } catch (error) {
            console.error("Failed to create product in Firebase:", error);
            throw new Error("Failed to create product. Please try again.");
        }
    }

    /**
     * Updates an existing product in Firestore
     * @param productId - The ID of the product to update
     * @param productData - The partial product data to update
     * @returns Promise<Product> - A promise that resolves to the updated product
     */
    static async updateProduct(
        productId: string, 
        productData: Partial<Omit<Product, 'id' | 'createdAt' | 'createdBy'>>
    ): Promise<Product> {
        try {
            // Get the current product data
            const currentProduct = await this.fetchProductById(productId);
            if (!currentProduct) {
                throw new Error(`Product with ID ${productId} not found`);
            }
            
            // Prepare update data with new timestamp
            const updateData = {
                ...productData,
                updatedAt: new Date()
            };
            
            // Prepare for Firestore
            const firestoreData = this.prepareForFirestore(updateData);
            
            // Update in Firestore
            const productRef = doc(db, "products", productId);
            await updateDoc(productRef, firestoreData);
            
            // Return the updated product
            return {
                ...currentProduct,
                ...productData,
                updatedAt: new Date()
            };
        } catch (error) {
            console.error(`Failed to update product with ID ${productId}:`, error);
            throw new Error("Failed to update product. Please try again.");
        }
    }

    /**
     * Soft deletes a product by setting isActive to false
     * @param productId - The ID of the product to delete
     * @returns Promise<void>
     */
    static async deleteProduct(productId: string): Promise<void> {
        try {
            const productRef = doc(db, "products", productId);
            
            // Update just the isActive field and updatedAt timestamp
            await updateDoc(productRef, { 
                isActive: false,
                updatedAt: new Date()
            });
        } catch (error) {
            console.error(`Failed to delete product with ID ${productId}:`, error);
            throw new Error("Failed to delete product. Please try again.");
        }
    }

    /**
     * Hard deletes a product from Firestore - USE WITH CAUTION
     * @param productId - The ID of the product to permanently delete
     * @returns Promise<void>
     */
    static async permanentlyDeleteProduct(productId: string): Promise<void> {
        try {
            const productRef = doc(db, "products", productId);
            await deleteDoc(productRef);
        } catch (error) {
            console.error(`Failed to permanently delete product with ID ${productId}:`, error);
            throw new Error("Failed to permanently delete product. Please try again.");
        }
    }

    /**
     * Updates the stock quantity of a product
     * @param productId - The ID of the product
     * @param newQuantity - The new stock quantity
     * @returns Promise<Product> - A promise that resolves to the updated product
     */
    static async updateStockQuantity(productId: string, newQuantity: number): Promise<Product> {
        try {
            // Basic validation
            if (newQuantity < 0) {
                throw new Error("Stock quantity cannot be negative");
            }
            
            return await this.updateProduct(productId, { stockQuantity: newQuantity });
        } catch (error) {
            console.error(`Failed to update stock for product ${productId}:`, error);
            throw new Error("Failed to update product stock. Please try again.");
        }
    }

    /**** HELPER METHODS ****/
    
    /**
     * Transforms Firestore Timestamps to JavaScript Dates in a product object
     * @param productData - Raw product data from Firestore
     * @returns Product - Product with proper Date objects
     */
    private static transformProductDates(productData: any): Product {
        const product = { ...productData } as Product;
        
        // Convert Firestore timestamps to JavaScript Date objects
        if (product.createdAt && typeof product.createdAt !== 'string') {
            if ('seconds' in (product.createdAt as any)) {
                product.createdAt = new Date((product.createdAt as any).seconds * 1000);
            }
        }
        
        if (product.updatedAt && typeof product.updatedAt !== 'string') {
            if ('seconds' in (product.updatedAt as any)) {
                product.updatedAt = new Date((product.updatedAt as any).seconds * 1000);
            }
        }
        
        return product;
    }
    
    /**
     * Prepares a product object for Firestore by handling Date objects
     * @param productData - Product data with JavaScript Date objects
     * @returns Object ready for Firestore
     */
    private static prepareForFirestore(productData: Partial<Product>): any {
        const data = { ...productData };
        
        // Firestore handles JavaScript Date objects automatically
        // This method is here in case we need to do additional transformations in the future
        
        return data;
    }
}
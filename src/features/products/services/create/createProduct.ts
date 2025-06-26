/**
 * Function to create a new product.
 * Calls the product repository to add a new product to the database.
 */
import { Product } from "@/features/products/types/product";
import ProductRepository from "@/features/products/repositories/product.repository";
import StorageRepository from "@/features/products/repositories/storage.repository";

/**
 * Creates a new product in the database.
 * @param productData - The product data without ID and timestamps
 * @param userId - The ID of the user creating the product
 * @returns Promise<Product> - A promise that resolves to the created product with ID
 */
export async function createProduct(
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>,
    userId: string
): Promise<Product> {
    try {
        // Validate required fields
        if (!productData.name || !productData.description || !productData.category) {
            throw new Error("Missing required product information");
        }
        
        // Validate price
        if (productData.price <= 0) {
            throw new Error("Product price must be greater than zero");
        }
        
        // Handle temporary images if needed
        if (productData.images && productData.images.length > 0) {
            const tempImages = productData.images.filter(url => 
                url.includes('product-images/temp/')
            );
            
            // We'll move these images to the proper product folder after creation
            // but we'll do this after we have the product ID
        }
        
        // Create the product
        const newProduct = await ProductRepository.createProduct(productData, userId);
        
        // Move any temporary images to the product's folder
        if (productData.images && productData.images.length > 0) {
            const tempImages = productData.images.filter(url => 
                url.includes('product-images/temp/')
            );
            
            if (tempImages.length > 0) {
                const movedImagePromises = tempImages.map(url => 
                    StorageRepository.moveImageToProduct(url, newProduct.id)
                );
                
                const movedImages = await Promise.all(movedImagePromises);
                
                // Replace the temp URLs with the new permanent URLs
                const finalImages = [...productData.images];
                tempImages.forEach((tempUrl, index) => {
                    const tempIndex = finalImages.indexOf(tempUrl);
                    if (tempIndex !== -1) {
                        finalImages[tempIndex] = movedImages[index];
                    }
                });
                
                // Update the product with the new image URLs
                await ProductRepository.updateProduct(newProduct.id, { images: finalImages });
                
                // Update the returned product object
                newProduct.images = finalImages;
            }
        }
        
        return newProduct;
    } catch (error) {
        console.error("Error creating product:", error);
        throw new Error("Failed to create product. Please try again later.");
    }
}
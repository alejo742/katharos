/**
 * Function to upload product images to storage.
 * Calls the storage repository to handle file uploads.
 */
import StorageRepository from "@/features/products/repositories/storage.repository";

/**
 * Uploads product images to Firebase Storage.
 * @param files - The image files to upload
 * @param productId - Optional product ID for organizing files
 * @returns Promise<string[]> - A promise that resolves to an array of image URLs
 */
export async function uploadProductImages(
    files: File[],
    productId?: string
): Promise<string[]> {
    try {
        // Validate input
        if (!files || files.length === 0) {
            throw new Error("No files provided for upload");
        }
        
        // Limit the number of files
        const maxFiles = 5;
        if (files.length > maxFiles) {
            throw new Error(`Cannot upload more than ${maxFiles} images`);
        }
        
        // Upload images
        return await StorageRepository.uploadMultipleImages(files, productId);
    } catch (error) {
        console.error("Error uploading product images:", error);
        throw new Error("Failed to upload images. Please try again later.");
    }
}
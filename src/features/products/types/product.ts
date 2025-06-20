/**
 * Type definition for products
 */

export interface Product {
    id: string; // Unique identifier for the product
    name: string; // Name of the product
    description: string; // Description of the product
    price: number; // Price of the product in soles
    category: string; // Category of the product (e.g., "hombre", "mujer")
    imageUrl: string; // URL to the product image
    stock: number; // Number of items available in stock
    rating?: number; // Optional rating for the product, if applicable
    isFeatured?: boolean; // Optional flag to indicate if the product is featured
}
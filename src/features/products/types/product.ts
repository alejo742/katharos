export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    salePrice?: number;
    images: string[];  // URLs to images
    category: string;
    tags: string[];
    stockQuantity: number;  // When 0, product is out of stock
    featured: boolean;
    attributes?: {
      [key: string]: string | number | boolean;  // Dynamic attributes
    };
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;  // Admin user ID
    isActive: boolean;  // For soft deletion
}
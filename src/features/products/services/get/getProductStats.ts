/**
 * Function to fetch product statistics for admin dashboard.
 * Provides counts of total, out of stock, and featured products.
 */
import ProductRepository from "@/features/products/repositories/product.repository";

/**
 * Product statistics interface
 */
export interface ProductStats {
  total: number;
  outOfStock: number;
  featured: number;
}

/**
 * Fetches product statistics from the server.
 * @returns Promise<ProductStats> - A promise that resolves to product statistics.
 */
export async function getProductStats(): Promise<ProductStats> {
  try {
    // Fetch all products (including inactive ones for admin view)
    const allProducts = await ProductRepository.fetchAllProducts();
    
    // Filter products to get the counts we need
    const activeProducts = allProducts.filter(p => p.isActive);
    const outOfStockProducts = activeProducts.filter(p => p.stockQuantity <= 0);
    const featuredProducts = activeProducts.filter(p => p.featured);
    
    return {
      total: activeProducts.length,
      outOfStock: outOfStockProducts.length,
      featured: featuredProducts.length
    };
  } catch (error) {
    console.error("Error fetching product statistics:", error);
    // Return zero counts if there's an error, to avoid breaking the UI
    return {
      total: 0,
      outOfStock: 0,
      featured: 0
    };
  }
}
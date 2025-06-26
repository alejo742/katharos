/**
 * Service function to get products with flexible filtering and pagination
 */
import { Product } from "@/features/products/types/product";
import ProductRepository from "@/features/products/repositories/product.repository";
import { DocumentSnapshot } from "firebase/firestore";

export interface ProductsResponse {
  products: Product[];
  total: number;
  hasMore: boolean;
  lastDoc?: DocumentSnapshot | null;
}

export interface ProductsQueryOptions {
  page?: number;
  limit?: number;
  category?: string;
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  sortBy?: 'price' | 'createdAt' | 'name';
  sortOrder?: 'asc' | 'desc';
  lastDoc?: DocumentSnapshot;
  fetchAll?: boolean;
}

/**
 * Get products with flexible filtering and pagination options
 * @param options Query options for filtering and pagination
 * @returns Products response with pagination metadata
 */
export async function getAllProducts(options: ProductsQueryOptions = {}): Promise<ProductsResponse> {
  try {
    // Handle the case where we want all products without filtering
    if (options.fetchAll) {
      const products = await ProductRepository.fetchAllProducts();
      return {
        products,
        total: products.length,
        hasMore: false
      };
    }
    
    // Handle specific category requests
    if (options.category && options.category !== 'all') {
      const products = await ProductRepository.fetchProductsByCategory(options.category);
      
      // Apply additional client-side filtering if needed
      let filteredProducts = products;
      
      // Filter by price range if specified
      if (options.minPrice !== undefined || options.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => {
          const price = product.salePrice || product.price;
          if (options.minPrice !== undefined && price < options.minPrice) return false;
          if (options.maxPrice !== undefined && price > options.maxPrice) return false;
          return true;
        });
      }
      
      // Filter by search query if specified
      if (options.query) {
        const normalizedQuery = options.query.toLowerCase();
        filteredProducts = filteredProducts.filter(product => 
          product.name.toLowerCase().includes(normalizedQuery) ||
          product.description.toLowerCase().includes(normalizedQuery) ||
          (product.tags && product.tags.some(tag => tag.toLowerCase().includes(normalizedQuery)))
        );
      }
      
      // Filter by featured status if specified
      if (options.featured !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.featured === options.featured);
      }
      
      // Sort the results
      if (options.sortBy) {
        filteredProducts.sort((a, b) => {
          const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
          
          if (options.sortBy === 'price') {
            const priceA = a.salePrice || a.price;
            const priceB = b.salePrice || b.price;
            return sortOrder * (priceA - priceB);
          } 
          else if (options.sortBy === 'name') {
            return sortOrder * a.name.localeCompare(b.name);
          }
          else { // default to createdAt
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return sortOrder * (dateA.getTime() - dateB.getTime());
          }
        });
      }
      
      // Apply pagination
      const page = options.page || 1;
      const limit = options.limit || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      return {
        products: paginatedProducts,
        total: filteredProducts.length,
        hasMore: endIndex < filteredProducts.length
      };
    }
    
    // Handle search queries
    if (options.query) {
      const products = await ProductRepository.fetchProductsByQuery(options.query);
      
      // Apply additional filtering, sorting, and pagination as needed
      let filteredProducts = products;
      
      // Filter by price range if specified
      if (options.minPrice !== undefined || options.maxPrice !== undefined) {
        filteredProducts = filteredProducts.filter(product => {
          const price = product.salePrice || product.price;
          if (options.minPrice !== undefined && price < options.minPrice) return false;
          if (options.maxPrice !== undefined && price > options.maxPrice) return false;
          return true;
        });
      }
      
      // Filter by featured status if specified
      if (options.featured !== undefined) {
        filteredProducts = filteredProducts.filter(product => product.featured === options.featured);
      }
      
      // Sort the results
      if (options.sortBy) {
        filteredProducts.sort((a, b) => {
          const sortOrder = options.sortOrder === 'asc' ? 1 : -1;
          
          if (options.sortBy === 'price') {
            const priceA = a.salePrice || a.price;
            const priceB = b.salePrice || b.price;
            return sortOrder * (priceA - priceB);
          } 
          else if (options.sortBy === 'name') {
            return sortOrder * a.name.localeCompare(b.name);
          }
          else { // default to createdAt
            const dateA = a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
            const dateB = b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
            return sortOrder * (dateA.getTime() - dateB.getTime());
          }
        });
      }
      
      // Apply pagination
      const page = options.page || 1;
      const limit = options.limit || 12;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      return {
        products: paginatedProducts,
        total: filteredProducts.length,
        hasMore: endIndex < filteredProducts.length
      };
    }
    
    // Handle featured products
    if (options.featured) {
      const limit = options.limit || 6;
      const products = await ProductRepository.fetchFeaturedProducts(limit);
      
      return {
        products,
        total: products.length,
        hasMore: false // Since we're fetching a specific number of featured products
      };
    }
    
    // Default case: paginated products with optional filters
    // If we have a lastDoc, use server-side pagination
    if (options.lastDoc) {
      const result = await ProductRepository.fetchProductsPaginated(
        options.limit || 12,
        options.lastDoc
      );
      
      return {
        products: result.products,
        total: result.products.length, // Note: total count is approximate
        hasMore: result.lastDoc !== null,
        lastDoc: result.lastDoc
      };
    }
    
    // If we're on page 1 or if no pagination is specified, fetch from scratch
    if (!options.page || options.page === 1) {
      const result = await ProductRepository.fetchProductsPaginated(options.limit || 12);
      
      return {
        products: result.products,
        total: result.products.length, // Estimate total for first page
        hasMore: result.lastDoc !== null,
        lastDoc: result.lastDoc
      };
    }
    
    // For pages beyond the first, we need to fetch all preceding pages
    // This is inefficient for large collections, but works for moderate-sized ones
    let lastDoc: DocumentSnapshot | undefined = undefined;
    let allProducts: Product[] = [];
    const limit = options.limit || 12;
    
    // Fetch all pages up to the requested one
    for (let i = 0; i < (options.page || 1); i++) {
      const result = await ProductRepository.fetchProductsPaginated(limit, lastDoc);
      allProducts = [...allProducts, ...result.products];
      
      // Fix for the type error: convert null to undefined if needed
      lastDoc = result.lastDoc || undefined;
      
      if (!result.lastDoc) break; // No more products
    }
    
    // Calculate the slice for the requested page
    const startIndex = ((options.page || 1) - 1) * limit;
    const endIndex = startIndex + limit;
    const pageProducts = allProducts.slice(startIndex, Math.min(endIndex, allProducts.length));
    
    return {
      products: pageProducts,
      total: allProducts.length,
      hasMore: lastDoc !== null && lastDoc !== undefined,
      lastDoc
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      products: [],
      total: 0,
      hasMore: false
    };
  }
}
/**
 * Products API Route
 * This file defines the API route for handling product-related requests.
 * Supports three types of GET requests so far:
 * 1. Get all products (no parameters)
 * 2. Get products by category (category parameter)
 * 3. Get products by search query (query parameter)
 */
import { NextRequest, NextResponse } from "next/server";
import ProductRepository from "@/features/products/repositories/product.repository";

/**
 * GET handler for product requests
 * @param request - The incoming request object
 * @returns NextResponse - JSON response containing products
 */
export async function GET(request: NextRequest) {
    try {
        /**** Parse request parameters ****/
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('query');
        const category = searchParams.get('category');

        /**** Determine request type and fetch products ****/
        let products;

        if (query) {
            products = await ProductRepository.fetchProductsByQuery(query);
        } else if (category) {
            products = await ProductRepository.fetchProductsByCategory(category);
        } else {
            products = await ProductRepository.fetchAllProducts();
        }

        /**** Return response ****/
        return NextResponse.json(products);
    } catch (error) {
        console.error("Error in products API route:", error);
        
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}
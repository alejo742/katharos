/**
 * SearchCard Component
 * Displays product information in search results.
 */
import React from "react";
import Image from "next/image";
import { Product } from "@/features/products/types/product";
import "./SearchCard.css";

export default function SearchCard({ product }: { product: Product }) {
    return (
        <div className="search-card">
            <div className="search-card-image">
                {product.imageUrl && (
                    <Image 
                        src={product.imageUrl} 
                        alt={product.name}
                        width={50}
                        height={50}
                        objectFit="cover"
                    />
                )}
            </div>
            <div className="search-card-info">
                <h4 className="search-card-title">{product.name}</h4>
                <p className="search-card-category">{product.category}</p>
            </div>
            <div className="search-card-price">
                S/ {product.price.toFixed(2)}
            </div>
        </div>
    );
}
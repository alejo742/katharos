/**
 * SearchBar Component
 * A search bar with dropdown results for products.
 */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { SearchOutlined } from "@mui/icons-material";
import { Product } from "@/shared/types/product";
import { getProductsByQuery } from "@/features/products/services/getProductsByQuery";
import SearchCard from "./SearchCard/SearchCard";
import "./SearchBar.css";

interface SearchBarProps {
    placeholder?: string;
    onSearch: (query: string) => void;
}

export default function SearchBar({ placeholder = "Search...", onSearch }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            if (query.trim().length < 2) {
                setSearchResults([]);
                setShowDropdown(false);
                return;
            }
            
            setIsLoading(true);
            setShowDropdown(true);
            
            try {
                // Use the imported function instead of direct fetch
                const data = await getProductsByQuery(query);
                setSearchResults(data);
            } catch (error) {
                console.error("Error fetching products:", error);
                setSearchResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        // Debounce the search
        const debounceTimer = setTimeout(() => {
            fetchProducts();
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [query]);

    useEffect(() => {
        // Close dropdown when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && 
                !dropdownRef.current.contains(event.target as Node) &&
                !searchBarRef.current?.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setQuery(value);
        onSearch(value);
    };

    return (
        <div className="search-container">
            <div className="search-bar" ref={searchBarRef}>
                <SearchOutlined className="search-icon" />
                <input
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    className="search-input"
                    onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
                />
            </div>
            
            {showDropdown && (
                <div className="search-dropdown" ref={dropdownRef}>
                    {isLoading ? (
                        <div className="search-loading">
                            <div className="search-loader"></div>
                            <p>Searching...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="search-results">
                            {searchResults.map((product) => (
                                <SearchCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : query.trim().length >= 2 ? (
                        <div className="search-no-results">
                            <p>No products found for "{query}"</p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
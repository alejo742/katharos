/**
 * SearchBar Component
 * A search bar with dropdown results for products.
 */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { SearchOutlined } from "@mui/icons-material";
import { Product } from "@/features/products/types/product";
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
    const [isDebouncing, setIsDebouncing] = useState(false);
    const [searchResults, setSearchResults] = useState<Product[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const searchBarRef = useRef<HTMLDivElement>(null);
    const searchTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            if (query.trim().length < 2) {
                setSearchResults([]);
                setShowDropdown(false);
                setIsDebouncing(false);
                return;
            }
            
            // Set debouncing state immediately when query changes
            setIsDebouncing(true);
            setShowDropdown(true);
            
            // Clear any existing timer
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
            
            // Set a new 2-second timer before executing the search
            searchTimerRef.current = setTimeout(async () => {
                setIsLoading(true);
                setIsDebouncing(false);
                
                try {
                    // Execute search after 2 seconds of inactivity
                    const data = await getProductsByQuery(query);
                    setSearchResults(data);
                    
                    // Only call onSearch after the debounce period
                    onSearch(query);
                } catch (error) {
                    console.error("Error fetching products:", error);
                    setSearchResults([]);
                } finally {
                    setIsLoading(false);
                }
            }, 2000); // 2 seconds debounce
        };

        fetchProducts();
        
        // Cleanup function to clear the timer when component unmounts
        return () => {
            if (searchTimerRef.current) {
                clearTimeout(searchTimerRef.current);
            }
        };
    }, [query, onSearch]);

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
        // Don't call onSearch here anymore - it will be called after debounce
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
                    {isDebouncing ? (
                        <div className="search-loading">
                            <div className="search-loader"></div>
                            <p>Cargando...</p>
                        </div>
                    ) : isLoading ? (
                        <div className="search-loading">
                            <div className="search-loader"></div>
                            <p>Buscando...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="search-results">
                            {searchResults.map((product) => (
                                <SearchCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : query.trim().length >= 2 ? (
                        <div className="search-no-results">
                            <p>No se encontraron productos para "{query}"</p>
                        </div>
                    ) : null}
                </div>
            )}
        </div>
    );
}
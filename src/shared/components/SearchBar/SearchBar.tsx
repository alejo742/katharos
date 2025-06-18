"use client";

import React, { useState } from "react";
import { SearchOutlined } from "@mui/icons-material";
import "./SearchBar.css";

interface SearchBarProps {
    placeholder?: string;
    onSearch: (query: string) => void;
}

export default function SearchBar({ placeholder = "Search...", onSearch }: SearchBarProps) {
    const [query, setQuery] = useState("");

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(event.target.value);
        onSearch(event.target.value); // state is asynchronous so use value
    };

    return (
        <div className="search-bar">
            <SearchOutlined className="search-icon" />
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder={placeholder}
                className="search-input"
            />
        </div>
    );
}
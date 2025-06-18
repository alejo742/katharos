"use client";

import React, { useState } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import { ShoppingCartOutlined } from '@mui/icons-material';
import './Navbar.css';
import Link from 'next/link';

interface NavbarProps {
    // Define any props that Navbar might need
}

export default function Navbar(props: NavbarProps) {
    const [loggedIn, setLoggedIn] = useState(false);

    /**
     * Handle search function
     */
    const handleSearch = (query: string) => {
        console.log("Searching for:", query);
        // Implement any search logic here
    }

    return (
        <div className='navbar-container'>
            <div className="promotional-banner">
                <span>
                    ¡10% de descuento en tu primera compra al registrarte!
                </span>
            </div>
            <nav className='main-navbar'>
                <Link href="/" className="left">
                    <img src="brand/logo-katharos.png" alt="" />
                </Link>
                <div className="middle">
                    <SearchBar
                        placeholder="Busca productos..."
                        onSearch={(query: string) => handleSearch(query)}
                    />
                </div>
                <div className="right">
                    <div className="cart-button">
                        <ShoppingCartOutlined className='icon'/>
                        <span>Carrito</span>
                    </div>
                    <Link href="/login" className="login-button">
                        {loggedIn ? (
                            <span>Mi cuenta</span>
                        ) : (
                            <span>Iniciar sesión</span>
                        )}
                    </Link>
                </div>
            </nav>
            <div className="mobile-searchbar">
                <SearchBar 
                    placeholder='Busca productos...'
                    onSearch={(query: string) => { handleSearch(query) }}
                />
            </div>
            <div className='category-navbar'>
                <ul>
                    {['Hombres', 'Mujeres', 'Niños', 'Hogar'].map((category) => (
                        <li key={category}>
                            <a href={`/${category.toLowerCase()}`}>{category}</a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}
"use client";

import React from 'react';
import SearchBar from '../SearchBar/SearchBar';
import { ShoppingCartOutlined } from '@mui/icons-material';
import './Navbar.css';
import Link from 'next/link';

interface NavbarProps {
    // Define any props that Navbar might need
}

export default function Navbar(props: NavbarProps) {

    /**
     * Handle search function
     */
    const handleSearch = (query: string) => {
        console.log("Searching for:", query);
        // Implement any search logic here
    }

    return (
        <div className='navbar-container'>
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
                    <div className="profile-button"></div>
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
                    <li>Inicio</li>
                    <li>Productos</li>
                    <li>Sobre nosotros</li>
                    <li>Contacto</li>
                </ul>
            </div>
        </div>
    )
}
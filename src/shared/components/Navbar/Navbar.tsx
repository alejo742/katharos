"use client";

import React, { useState, useRef, useEffect } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import { ShoppingCartOutlined, KeyboardArrowDown, Person, ExitToApp, ShoppingBag } from '@mui/icons-material';
import './Navbar.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Category, CATEGORIES } from '@/features/products/types/category';
import useAuth from '@/features/auth/hooks/useAuth';

interface NavbarProps {
  // Define any props that Navbar might need
}

export default function Navbar(props: NavbarProps) {
  const { loggedIn, loading: authLoading, logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  /**
   * Close dropdown when clicking outside
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Handle search function
   */
  const handleSearch = (query: string) => {
    router.push(`/productos?query=${encodeURIComponent(query)}`);
  }

  /**
   * Handle logout
   */
  const handleLogout = async() => {
    await logout();
    setShowDropdown(false);
  }

  /**
   * Check if a category is currently active based on query params
   */
  const isCategoryActive = (categoryId: string): boolean => {
    return categoryParam === categoryId;
  }

  /**
   * Check if "All Products" should be active (no category param or unknown category)
   */
  const isAllProductsActive = (): boolean => {
    // If there's no category param or it doesn't match any known category
    const knownCategoryIds = CATEGORIES.filter(cat => cat.id !== 'all').map(cat => cat.id);
    return !categoryParam || !knownCategoryIds.includes(categoryParam);
  }

  // Get display categories (exclude 'all' since we handle it separately)
  const displayCategories = CATEGORIES.filter(category => category.id !== 'all');

  // Render the appropriate authentication button based on state
  const renderAuthButton = () => {
    if (authLoading) {
      return (
        <button className="navbar-login-button loading-button" disabled>
          <span>Cargando...</span>
        </button>
      );
    }
    
    if (loggedIn) {
      return (
        <div className="account-dropdown-container" ref={dropdownRef}>
          <button 
            className="navbar-login-button account-button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span>Mi cuenta</span>
            <KeyboardArrowDown className="dropdown-icon" />
          </button>
          
          {showDropdown && (
            <div className="account-dropdown">
              <Link href="/perfil" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                <Person className="dropdown-item-icon" />
                <span>Mi Perfil</span>
              </Link>
              <Link href="/pedidos" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                <ShoppingBag className="dropdown-item-icon" />
                <span>Mis Pedidos</span>
              </Link>
              <button className="dropdown-item logout-item" onClick={handleLogout}>
                <ExitToApp className="dropdown-item-icon" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      );
    }
    
    return (
      <Link href="/login" className="navbar-login-button">
        <span>Iniciar sesión</span>
      </Link>
    );
  };

  return (
    <div className='navbar-container'>
      <Link href="/register" className="promotional-banner">
        <span>
          ¡10% de descuento en tu primera compra al registrarte!
        </span>
      </Link>
      <nav className='main-navbar'>
        <Link href="/productos" className="left">
          <img src="brand/logo-katharos.png" alt="" />
        </Link>
        <div className="middle">
          <SearchBar
            placeholder="Busca productos..."
            onSearch={(query: string) => handleSearch(query)}
          />
        </div>
        <div className="right">
          <Link href="/cart" className="cart-button">
            <ShoppingCartOutlined className='icon'/>
            <span>Carrito</span>
          </Link>
          
          {renderAuthButton()}
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
          <li>
            <Link 
              href="/productos" 
              className={isAllProductsActive() ? 'special-category' : ''}
            >
              Todos los Productos
            </Link>
          </li>
          {displayCategories.map((category: Category) => (
            <li key={category.id}>
              <Link 
                href={`/productos?category=${category.id}`}
                className={isCategoryActive(category.id) ? 'special-category' : ''}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
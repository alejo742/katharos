"use client";

import React, { useState, useRef, useEffect, Suspense } from 'react';
import SearchBar from '../SearchBar/SearchBar';
import { ShoppingCartOutlined, KeyboardArrowDown, Person, ExitToApp, ShoppingBag } from '@mui/icons-material';
import './Navbar.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { getAllCategories } from '@/features/products/types/category';
import useAuth from '@/features/auth/hooks/useAuth';
import ROUTES from '@/shared/routes';
import signOutUser from '@/features/auth/services/signOut';

interface NavbarProps {
  // Define any props that Navbar might need
}

function NavbarContent(props: NavbarProps) {
  const { user, loading } = useAuth();
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
    router.push(`${ROUTES.PRODUCTS}?query=${encodeURIComponent(query)}`);
  }

  /**
   * Handle logout
   */
  const handleLogout = async() => {
    await signOutUser();
    router.push(ROUTES.LOGIN); // Redirect to login after logout
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
    const allCategories = getAllCategories();
    const knownCategoryIds = allCategories.filter(cat => cat.id !== 'all').map(cat => cat.id);
    return !categoryParam || !knownCategoryIds.includes(categoryParam);
  }

  // Get all categories as array for rendering
  const allCategories = getAllCategories();
  
  // Get display categories (exclude 'all' since we handle it separately)
  const displayCategories = allCategories.filter(category => category.id !== 'all');

  // Get user display name
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Usuario';

  // Render the appropriate authentication button based on state
  const renderAuthButton = () => {
    // Show loading state if authentication is still being determined
    if (loading) {
      return (
        <button className="navbar-login-button loading-button" disabled>
          <span>Cargando...</span>
        </button>
      );
    }
    
    // User is logged in
    if (user) {
      return (
        <div className="account-dropdown-container" ref={dropdownRef}>
          <button 
            className="navbar-login-button account-button"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <span>Mi Cuenta</span>
            <KeyboardArrowDown className="dropdown-icon" />
          </button>
          
          {showDropdown && (
            <div className="account-dropdown">
              <Link href={ROUTES.PROFILE} className="dropdown-item" onClick={() => setShowDropdown(false)}>
                <Person className="dropdown-item-icon" />
                <span>Mi Perfil</span>
              </Link>
              <Link href={ROUTES.ORDERS} className="dropdown-item" onClick={() => setShowDropdown(false)}>
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
    
    // Not logged in
    return (
      <Link href={ROUTES.LOGIN} className="navbar-login-button">
        <span>Iniciar sesión</span>
      </Link>
    );
  };
  
  return (
    <div className='navbar-container'>
      <Link href={ROUTES.REGISTER} className="promotional-banner">
        <span>
          ¡10% de descuento en tu primera compra al registrarte!
        </span>
      </Link>
      <nav className='main-navbar'>
        <Link href={ROUTES.HOME} className="left">
          <img src="/brand/logo-katharos.png" alt="Katharos Logo" />
        </Link>
        <div className="middle">
          <SearchBar
            placeholder="Busca productos..."
            onSearch={(query: string) => handleSearch(query)}
          />
        </div>
        <div className="right">
          <Link href={ROUTES.CART} className="cart-button">
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
              href={ROUTES.PRODUCTS}
              className={isAllProductsActive() ? 'special-category' : ''}
            >
              Todos los Productos
            </Link>
          </li>
          {displayCategories.map((category) => (
            <li key={category.id}>
              <Link 
                href={`${ROUTES.PRODUCTS}?category=${category.id}`}
                className={isCategoryActive(category.id) ? 'special-category' : ''}
              >
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Main Navbar component that wraps NavbarContent in a Suspense boundary
export default function Navbar(props: NavbarProps) {
  return (
    <Suspense fallback={<div className="navbar-loading"></div>}>
      <NavbarContent {...props} />
    </Suspense>
  );
}
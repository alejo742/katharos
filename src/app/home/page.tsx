import React from 'react';
import './page.css';
import Navbar from '@/shared/components/Navbar/Navbar';
import Link from 'next/link';
import ROUTES from '@/shared/routes';

export default function Home() {
  return (
    <div className="page-container">
      <Navbar/>
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>Descubre prendas sostenibles al mejor precio.</h1>
            <p>Encuentra los mejores productos para toda la familia con ofertas increíbles.</p>
            <Link href={ROUTES.PRODUCTS} className="hero-cta-button">
              Comprar ahora
            </Link>
          </div>
          <Link href={ROUTES.PRODUCTS} className="hero-image">
            <img src="landing/hero-image.png" alt="Ofertas especiales" />
          </Link>
        </div>
      </div>
    </div>
  );
}
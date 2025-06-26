import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/context/AuthContext";
import { CartProvider } from "@/features/cart/context/CartContext";

export const metadata: Metadata = {
  title: "Katharos",
  description: "Tienda de Katharos: productos ecológicos y sostenibles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&icon_names=close" />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            {/* Main content of the app */}
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

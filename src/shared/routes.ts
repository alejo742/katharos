/**
 * Defining routes globally
 */

const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  PRODUCTS: '/productos',
  PRODUCT_DETAIL: (id: string) => `/productos/${id}`,
  CART: '/carrito',
  ORDERS: '/pedidos',
  CHECKOUT: '/checkout',
  PROFILE: '/perfil',
  FORGOT_PASSWORD: '/forgot-password',
  TERMS: '/legal',
  PRIVACY_POLICY: '/legal',
};

export default ROUTES;
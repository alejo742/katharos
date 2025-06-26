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
  CHECKOUT: '/pago',
  PROFILE: '/perfil',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  TERMS: '/legal',
  PRIVACY_POLICY: '/legal',

  // admin
  ADMIN_PRODUCTS: '/admin/productos',
  ADMIN_PRODUCT_EDIT: (id: string) => `/admin/productos/${id}`,
  ADMIN_PRODUCT_CREATE: (id: string) => `/admin/productos/${id}`,
};

export default ROUTES;
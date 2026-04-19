const BASE = __DEV__
  ? 'http://10.0.2.2:8000/api'
  : 'https://magus-ecommerce.com/ecommerce-back/public/api';

export const API_BASE = BASE;

export const ENDPOINTS = {
  // Auth
  LOGIN:  '/login',
  LOGOUT: '/logout',
  ME:     '/user',

  // Almacén
  PRODUCTOS:  '/productos',
  CATEGORIAS: '/categorias',
  MARCAS:     '/marcas',
  SECCIONES:  '/secciones',

  // Dashboard
  DASHBOARD_STATS:      '/dashboard/estadisticas',
  DASHBOARD_MENSUALES:  '/dashboard/ventas-mensuales',
  DASHBOARD_CATEGORIAS: '/dashboard/categorias-vendidas',

  // Facturación
  VENTAS: '/ventas',
} as const;

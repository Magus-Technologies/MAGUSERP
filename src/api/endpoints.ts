const BASE = __DEV__
  ? 'http://10.0.2.2:8000/api'
  : 'https://tu-dominio.com/api';

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

  // Facturación
  VENTAS: '/ventas',
} as const;

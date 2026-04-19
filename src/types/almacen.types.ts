export interface Categoria {
  id:          number;
  nombre:      string;
  descripcion: string | null;
  id_seccion?: number;
  activo?:     boolean;
  created_at?: string;
}

export interface Marca {
  id:          number;
  nombre:      string;
  descripcion: string | null;
  created_at?: string;
}

export interface Producto {
  id:               number;
  nombre:           string;
  descripcion:      string | null;
  precio:           number;
  precio_venta?:    number;
  precio_compra:    number;
  stock:            number;
  stock_minimo:     number;
  categoria_id:     number;
  marca_id:         number | null;
  imagen_principal: string | null;
  imagen_url?:      string | null;
  categoria?:       { id: number; nombre: string };
  marca?:           { id: number; nombre: string } | null;
}

export interface PaginatedResponse<T> {
  data:          T[];
  current_page:  number;
  last_page:     number;
  per_page:      number;
  total:         number;
}

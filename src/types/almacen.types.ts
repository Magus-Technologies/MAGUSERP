export interface Categoria {
  id:          number;
  nombre:      string;
  descripcion: string | null;
  id_seccion:  number;
  activo:      boolean;
  imagen?:     string | null;
  imagen_url?: string | null;
  created_at?: string;
}

export interface Marca {
  id:          number;
  nombre:      string;
  descripcion: string | null;
  activo:      boolean;
  imagen?:     string | null;
  imagen_url?: string | null;
  created_at?: string;
}

export interface Producto {
  id:               number;
  nombre:           string;
  descripcion:      string | null;
  codigo_producto:  string;
  precio_venta:     number;
  precio_compra:    number;
  stock:            number;
  stock_minimo:     number;
  categoria_id:     number;
  marca_id:         number | null;
  imagen:           string | null;
  imagen_url?:      string | null;
  activo:           boolean;
  destacado:        boolean;
  mostrar_igv:      boolean;
  categoria?:       { id: number; nombre: string };
  marca?:           { id: number; nombre: string } | null;
  precio?:          number; // Fallback for some API responses
}

export interface PaginatedResponse<T> {
  data:          T[];
  current_page:  number;
  last_page:     number;
  per_page:      number;
  total:         number;
}

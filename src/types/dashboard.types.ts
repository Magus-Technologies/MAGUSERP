export interface DashboardStats {
  total_pedidos:       number;
  total_clientes:      number;
  total_ingresos:      number;
  total_productos:     number;
  ganancias_mes_actual: number;
  producto_del_mes?:   ProductoDelMes | null;
}

export interface ProductoDelMes {
  id:                   number;
  nombre:               string;
  imagen_principal:     string;
  ventas_cantidad:      number;
  ventas_total:         number;
  crecimiento_porcentaje: number;
  periodo: {
    mes:        number;
    anio:       number;
    nombre_mes: string;
  };
}

export interface StockCritico {
  id:           number;
  nombre:       string;
  stock:        number;
  stock_minimo: number;
  categoria_id: number;
}

export interface VentaMensual {
  mes:          number;
  anio:         number;
  nombre_mes:   string;
  total_ventas: number;
}

export interface CategoriaVendida {
  id:           number;
  nombre:       string;
  porcentaje:   number;
  color:        string;
  ventas_total: number;
}

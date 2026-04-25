export interface ClienteInfo {
  numero_documento: string;
  nombre_completo:  string;
}

export interface ComprobanteInfo {
  id:               number;
  tipo_comprobante: string;
  serie:            string;
  correlativo:      number;
  numero_completo:  string;
  estado:           string;
  origen:           string;
  fecha_emision:    string | null;
  importe_total:    string;
  mensaje_sunat:    string | null;
  codigo_error_sunat: string | null;
}

export interface Venta {
  id:            number;
  codigo_venta:  string;
  fecha_venta:   string;
  total:         number;
  estado:        string;
  metodo_pago:   string | null;
  cliente_info:  ClienteInfo;
  comprobante_info: ComprobanteInfo | null;
}

export interface VentasEstadisticas {
  total_ventas:       number;
  monto_total:        number;
  ventas_pendientes:  number;
  ventas_facturadas:  number;
  ventas_ecommerce:   number;
  periodo:            { inicio: string; fin: string };
}

export interface VentasEstadisticasSunat {
  total_ventas:    number;
  sin_comprobante: number;
  con_comprobante: number;
  por_estado_sunat: {
    PENDIENTE: number;
    ENVIADO:   number;
    ACEPTADO:  number;
    RECHAZADO: number;
    ANULADO:   number;
  };
  monto_total:    number;
  monto_aceptado: number;
  periodo:        { inicio: string; fin: string };
}

export interface ComprobantesEstadisticasItem {
  estado:           string;
  tipo_comprobante: string;
  cantidad:         number;
  monto:            number;
}

export interface ComprobantesEstadisticas {
  total_comprobantes: number;
  monto_total:        number;
  por_estado:         ComprobantesEstadisticasItem[];
  por_tipo:           ComprobantesEstadisticasItem[];
  periodo:            { inicio: string; fin: string };
}

export interface Cotizacion {
  id:                      number;
  codigo_cotizacion:       string;
  fecha_cotizacion:        string;
  total:                   string | number;
  estado_cotizacion_id:    number;
  estado_cotizacion?:      { id: number; nombre: string; color: string };
  cliente_nombre:          string;
  cliente_email:           string;
  numero_documento:        string | null;
  metodo_pago_preferido:   string | null;
  observaciones:           string | null;
  user_cliente?:           { id: number; nombres: string; apellidos: string; email: string };
}

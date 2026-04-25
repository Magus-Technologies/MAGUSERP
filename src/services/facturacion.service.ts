import { apiClient } from '../api/client';
import {
  VentasEstadisticas,
  VentasEstadisticasSunat,
  ComprobantesEstadisticas,
} from '../types/facturacion.types';

export interface VentasParams {
  search?:  string;
  estado?:  string;
  page?:    number;
}

export interface CotizacionesParams {
  search?:  string;
  estado?:  string;
  page?:    number;
}

export const facturacionService = {
  getVentas(params: VentasParams = {}): Promise<any> {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.estado) q.set('estado', params.estado);
    if (params.page)   q.set('page', String(params.page));
    const qs = q.toString();
    return apiClient.get(`/ventas${qs ? '?' + qs : ''}`);
  },

  getCotizaciones(params: CotizacionesParams = {}): Promise<any> {
    const q = new URLSearchParams();
    if (params.search) q.set('search', params.search);
    if (params.estado) q.set('estado', params.estado);
    if (params.page)   q.set('page', String(params.page));
    const qs = q.toString();
    return apiClient.get(`/cotizaciones${qs ? '?' + qs : ''}`);
  },

  updateCotizacion(id: number, data: any): Promise<any> {
    return apiClient.patch(`/cotizaciones/${id}`, data);
  },

  getVentasEstadisticas(): Promise<VentasEstadisticas> {
    return apiClient.get('/ventas/estadisticas');
  },

  getVentasEstadisticasSunat(): Promise<VentasEstadisticasSunat> {
    return apiClient.get('/ventas/estadisticas-sunat');
  },

  getComprobantesEstadisticas(): Promise<{ success: boolean; data: ComprobantesEstadisticas }> {
    return apiClient.get('/comprobantes/estadisticas');
  },
};

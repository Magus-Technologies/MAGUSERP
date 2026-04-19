import { apiClient } from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import {
  DashboardStats, StockCritico,
  VentaMensual, CategoriaVendida,
} from '../types/dashboard.types';

export const dashboardService = {
  getStats(): Promise<DashboardStats> {
    return apiClient.get('/dashboard/estadisticas');
  },

  getStockCritico(): Promise<StockCritico[]> {
    return apiClient.get(ENDPOINTS.PRODUCTOS + '/stock-critico');
  },

  getVentasMensuales(meses = 6): Promise<{ data: VentaMensual[] }> {
    return apiClient.get(`/dashboard/ventas-mensuales?meses=${meses}`);
  },

  getCategoriasVendidas(limite = 4): Promise<{ data: CategoriaVendida[] }> {
    return apiClient.get(`/dashboard/categorias-vendidas?limite=${limite}`);
  },
};

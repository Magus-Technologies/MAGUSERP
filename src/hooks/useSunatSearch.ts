import { useState, useCallback } from 'react';
import { apiClient } from '../api/client';

interface SunatData {
  nombre: string;
  documento: string;
  tipo_documento: string;
  direccion?: string;
  email?: string;
  telefono?: string;
}

export function useSunatSearch() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<SunatData | null>(null);

  const search = useCallback(async (documento: string, tipoDocumento: string = '1') => {
    if (!documento || documento.length < 8) {
      setError('Ingresa un documento válido');
      return null;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      // Primero intentar buscar en clientes registrados
      try {
        const clienteUrl = `/clientes/buscar-por-documento?numero_documento=${documento.trim()}`;
        const clienteResponse: any = await apiClient.get(clienteUrl);

        if (clienteResponse?.success && clienteResponse?.data && clienteResponse.data.length > 0) {
          const cliente = clienteResponse.data[0];
          const sunatData: SunatData = {
            nombre: cliente.nombre_completo || '',
            documento: cliente.numero_documento || documento,
            tipo_documento: tipoDocumento,
            direccion: cliente.direccion || '',
            email: cliente.email || '',
            telefono: cliente.telefono || '',
          };
          setData(sunatData);
          return sunatData;
        }
      } catch (clienteErr: any) {
        // Si falla la búsqueda de clientes (404, 401, etc), continuar con RENIEC
        console.log('Cliente no encontrado, consultando RENIEC...');
      }

      // Consultar RENIEC
      const reniecUrl = `/reniec/buscar/${documento.trim()}`;
      const reniecResponse: any = await apiClient.get(reniecUrl);

      if (reniecResponse) {
        // Mapear según el tipo de documento
        // RUC: tiene "ruc", "razonSocial"
        // DNI: tiene "dni", "nombres", "apellidoPaterno", "apellidoMaterno"
        // Ambos tienen "nombre" (ya combinado)
        const sunatData: SunatData = {
          nombre: reniecResponse.nombre || reniecResponse.razonSocial || '',
          documento: reniecResponse.ruc || reniecResponse.dni || reniecResponse.numero || documento,
          tipo_documento: tipoDocumento,
          direccion: reniecResponse.direccion || '',
          email: reniecResponse.email || '',
          telefono: reniecResponse.telefonos?.[0] || reniecResponse.telefono || '',
        };
        setData(sunatData);
        return sunatData;
      }

      setError('No se encontraron datos');
      return null;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Error al consultar documento';
      setError(errorMsg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { search, loading, error, data, reset };
}

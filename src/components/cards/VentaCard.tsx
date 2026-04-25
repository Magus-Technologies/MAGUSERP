import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Venta } from '../../types/facturacion.types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';

interface Props {
  item:     Venta;
  onPress?: () => void;
  onEdit?: (venta: Venta) => void;
  onFacturar?: (venta: Venta) => void;
  onEnviarSunat?: (venta: Venta) => void;
  onVerFirma?: (venta: Venta) => void;
  onGenerarPdf?: (venta: Venta) => void;
  onDescargarPdf?: (ventaId: number) => void;
  onDescargarCdr?: (ventaId: number) => void;
  onEnviarPor?: (venta: Venta) => void;
  onConsultarSunat?: (venta: Venta) => void;
  onAnular?: (venta: Venta) => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  color: string;
  visible: boolean;
  action: () => void;
}

export function VentaCard({ 
  item, 
  onPress,
  onEdit,
  onFacturar,
  onEnviarSunat,
  onVerFirma,
  onGenerarPdf,
  onDescargarPdf,
  onDescargarCdr,
  onEnviarPor,
  onConsultarSunat,
  onAnular,
}: Props) {
  const [menuVisible, setMenuVisible] = useState(false);
  const comprobante = item.comprobante_info;

  const menuItems: MenuItem[] = [
    {
      id: 'editar',
      label: 'Editar Venta',
      icon: 'pencil-outline',
      color: '#3B82F6',
      visible: item.estado === 'PENDIENTE' && !comprobante,
      action: () => {
        setMenuVisible(false);
        onEdit?.(item);
      },
    },
    {
      id: 'facturar',
      label: 'Generar Comprobante',
      icon: 'receipt-outline',
      color: '#10B981',
      visible: item.estado === 'PENDIENTE' && !comprobante,
      action: () => {
        setMenuVisible(false);
        onFacturar?.(item);
      },
    },
    {
      id: 'enviar-sunat',
      label: 'Enviar a SUNAT',
      icon: 'paper-plane-outline',
      color: '#F59E0B',
      visible: comprobante && (comprobante.estado === 'PENDIENTE' || comprobante.estado === 'RECHAZADO'),
      action: () => {
        setMenuVisible(false);
        onEnviarSunat?.(item);
      },
    },
    {
      id: 'ver-firma',
      label: 'Ver XML y Firma',
      icon: 'code-outline',
      color: '#3B82F6',
      visible: !!comprobante,
      action: () => {
        setMenuVisible(false);
        onVerFirma?.(item);
      },
    },
    {
      id: 'generar-pdf',
      label: comprobante?.tiene_pdf ? '🔄 Regenerar PDF' : '🎯 Generar PDF',
      icon: 'document-outline',
      color: '#F59E0B',
      visible: comprobante?.estado === 'ACEPTADO',
      action: () => {
        setMenuVisible(false);
        onGenerarPdf?.(item);
      },
    },
    {
      id: 'descargar-pdf',
      label: '📄 Descargar PDF',
      icon: 'download-outline',
      color: '#EF4444',
      visible: comprobante?.estado === 'ACEPTADO',
      action: () => {
        setMenuVisible(false);
        onDescargarPdf?.(item.id);
      },
    },
    {
      id: 'descargar-cdr',
      label: 'Descargar CDR',
      icon: 'document-text-outline',
      color: '#06B6D4',
      visible: !!comprobante && (comprobante.tiene_cdr || comprobante.estado === 'ACEPTADO'),
      action: () => {
        setMenuVisible(false);
        onDescargarCdr?.(item.id);
      },
    },
    {
      id: 'ver-detalle',
      label: 'Ver Detalle',
      icon: 'eye-outline',
      color: '#8B5CF6',
      visible: true,
      action: () => {
        setMenuVisible(false);
        onPress?.();
      },
    },
    {
      id: 'enviar-por',
      label: 'Enviar por Email/WhatsApp',
      icon: 'send-outline',
      color: '#0EA5E9',
      visible: comprobante?.estado === 'ACEPTADO',
      action: () => {
        setMenuVisible(false);
        onEnviarPor?.(item);
      },
    },
    {
      id: 'consultar-sunat',
      label: 'Consultar en SUNAT',
      icon: 'search-outline',
      color: '#14B8A6',
      visible: !!comprobante,
      action: () => {
        setMenuVisible(false);
        onConsultarSunat?.(item);
      },
    },
    {
      id: 'anular',
      label: 'Anular Venta',
      icon: 'close-outline',
      color: '#EF4444',
      visible: item.estado !== 'ANULADO',
      action: () => {
        setMenuVisible(false);
        onAnular?.(item);
      },
    },
  ];

  const visibleItems = menuItems.filter(item => item.visible);

  return (
    <>
      <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
        <Card className="mx-4 mb-3 p-4">
          {/* Fila superior */}
          <View className="flex-row items-start justify-between mb-2">
            <View className="flex-1 mr-3">
              <Text variant="label" numberOfLines={1}>{item.cliente_info.nombre_completo}</Text>
              <Text variant="caption" color="muted">{item.cliente_info.numero_documento}</Text>
            </View>
            <View className="flex-row items-center gap-2">
              <StatusBadge status={item.estado} />
              <TouchableOpacity 
                onPress={() => setMenuVisible(true)}
                className="p-2"
              >
                <Ionicons name="ellipsis-vertical" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Fila media: código + fecha */}
          <View className="flex-row items-center gap-3 mb-2">
            <View className="flex-row items-center gap-1">
              <Ionicons name="receipt-outline" size={13} color="#9CA3AF" />
              <Text variant="caption" color="muted">{item.codigo_venta}</Text>
            </View>
            <View className="flex-row items-center gap-1">
              <Ionicons name="calendar-outline" size={13} color="#9CA3AF" />
              <Text variant="caption" color="muted">{formatDate(item.fecha_venta)}</Text>
            </View>
          </View>

          {/* Fila inferior: comprobante + total */}
          <View className="flex-row items-center justify-between">
            {comprobante ? (
              <View className="flex-row items-center gap-2">
                <StatusBadge status={comprobante.estado} label={comprobante.numero_completo} />
              </View>
            ) : (
              <View className="flex-row items-center gap-1">
                <Ionicons name="document-outline" size={13} color="#9CA3AF" />
                <Text variant="caption" color="muted">Sin comprobante</Text>
              </View>
            )}
            <Text variant="label" className="text-green-600">{formatCurrency(item.total)}</Text>
          </View>
        </Card>
      </TouchableOpacity>

      {/* Modal de menú */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <TouchableOpacity 
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
          className="flex-1 bg-black/40 justify-end"
        >
          <TouchableOpacity activeOpacity={1} onPress={() => {}}>
            <View className="bg-white rounded-t-2xl">
              <View className="px-4 py-3 border-b border-gray-200">
                <Text variant="h4" className="text-center">Acciones</Text>
              </View>
              <FlatList
                data={visibleItems}
                keyExtractor={item => item.id}
                scrollEnabled={false}
                renderItem={({ item: menuItem }) => (
                  <TouchableOpacity
                    onPress={menuItem.action}
                    className="flex-row items-center gap-3 px-4 py-3 border-b border-gray-100"
                  >
                    <Ionicons name={menuItem.icon as any} size={20} color={menuItem.color} />
                    <Text variant="body" className="flex-1">{menuItem.label}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#D1D5DB" />
                  </TouchableOpacity>
                )}
              />
              <TouchableOpacity
                onPress={() => setMenuVisible(false)}
                className="px-4 py-3 border-t border-gray-200"
              >
                <Text variant="body" className="text-center text-gray-600">Cerrar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

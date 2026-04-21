import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '../ui/Text';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { SelectGroup } from '../ui/SelectGroup';
import { formatCurrency } from '../../utils/formatters';

const METODOS_PAGO = [
  { id: 'EFECTIVO',      nombre: 'Efectivo' },
  { id: 'TARJETA',       nombre: 'Tarjeta'  },
  { id: 'TRANSFERENCIA', nombre: 'Transferencia' },
  { id: 'YAPE',          nombre: 'Yape'     },
  { id: 'PLIN',          nombre: 'Plin'     },
  { id: 'CREDITO',       nombre: 'Crédito'  },
];

interface Props {
  subtotal: number;
  igv: number;
  total: number;
  descuentoTotal: number;
  onDescuentoChange: (v: number) => void;
  metodoPago: string;
  onMetodoChange: (v: string) => void;
  observaciones: string;
  onObservacionesChange: (v: string) => void;
  tipoComprobante: '01' | '03';
  onTipoComprobanteChange: (v: '01' | '03') => void;
  series: any[];
  serieId: number | null;
  onSerieChange: (v: number) => void;
}

const TIPOS_COMPROBANTE = [
  { id: '03', nombre: 'Boleta' },
  { id: '01', nombre: 'Factura' },
];

export function VentaSummary({
  subtotal, igv, total, descuentoTotal, onDescuentoChange,
  metodoPago, onMetodoChange, observaciones, onObservacionesChange,
  tipoComprobante, onTipoComprobanteChange,
  series, serieId, onSerieChange
}: Props) {
  // Filtrar series por tipo de comprobante seleccionado
  const filteredSeries = series.filter(s => s.tipo_comprobante === tipoComprobante);

  const [pagaCon, setPagaCon] = useState<number>(0);
  const vuelto = pagaCon > total ? pagaCon - total : 0;

  return (
    <Card className="p-4 gap-4">
      <View className="flex-row gap-2">
        <View className="flex-1">
          <SelectGroup
            label="Tipo de Comprobante"
            options={TIPOS_COMPROBANTE}
            selectedId={tipoComprobante}
            onSelect={(v) => onTipoComprobanteChange(v as any)}
          />
        </View>
        <View className="flex-1">
          <SelectGroup
            label="Serie"
            options={filteredSeries.map(s => ({ id: String(s.id), nombre: s.serie }))}
            selectedId={String(serieId || '')}
            onSelect={(v) => onSerieChange(Number(v))}
          />
        </View>
      </View>

      <SelectGroup
        label="Método de Pago"
        options={METODOS_PAGO}
        selectedId={metodoPago}
        onSelect={onMetodoChange}
      />

      {metodoPago === 'EFECTIVO' && (
        <View className="flex-row gap-4">
          <View className="flex-1">
            <Input
              label="Paga con"
              value={String(pagaCon)}
              onChangeText={v => setPagaCon(parseFloat(v) || 0)}
              keyboardType="numeric"
              size="sm"
            />
          </View>
          <View className="flex-1 justify-end pb-1">
            <Text variant="caption" color="muted">Vuelto</Text>
            <Text variant="h4" className="text-blue-600 font-bold">{formatCurrency(vuelto)}</Text>
          </View>
        </View>
      )}

      <Input
        label="Observaciones"
        value={observaciones}
        onChangeText={onObservacionesChange}
        placeholder="Notas de la venta..."
        multiline
        numberOfLines={2}
      />

      <View className="flex-row justify-between py-1">
        <Text variant="bodySmall" color="muted">Subtotal</Text>
        <Text variant="bodySmall">{formatCurrency(subtotal)}</Text>
      </View>
      <View className="flex-row justify-between py-1">
        <Text variant="bodySmall" color="muted">IGV (18%)</Text>
        <Text variant="bodySmall">{formatCurrency(igv)}</Text>
      </View>
      
      <View className="pt-2 border-t border-gray-100 flex-row items-center justify-between">
        <View className="flex-1 pr-4">
           <Input
             label="Descuento Global"
             value={String(descuentoTotal)}
             onChangeText={v => onDescuentoChange(parseFloat(v) || 0)}
             keyboardType="numeric"
             size="sm"
           />
        </View>
        <View className="items-end">
           <Text variant="label">Total a Pagar</Text>
           <Text variant="h3" className="text-green-600">{formatCurrency(total)}</Text>
        </View>
      </View>
    </Card>
  );
}

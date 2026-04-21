import React from 'react';
import { View, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../ui/Input';
import { Text } from '../ui/Text';
import { Card } from '../ui/Card';
import { SelectGroup } from '../ui/SelectGroup';
import { Cliente } from '../../types/cliente.types';

const TIPO_DOC = [
  { key: '1', label: 'DNI'      },
  { key: '6', label: 'RUC'      },
  { key: '4', label: 'CE'       },
  { key: '7', label: 'Pasaporte'},
  { key: '0', label: 'Otros'    },
];

interface Props {
  data: Cliente;
  onChange: (data: Cliente) => void;
  onSearch: () => void;
  isSearching: boolean;
  error?: string;
  title?: string;
}

export function ClienteForm({ data, onChange, onSearch, isSearching, error, title = 'Información del Cliente' }: Props) {
  const updateField = (field: keyof Cliente, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <Card className="p-4 gap-3">
      <View className="flex-row items-center gap-2 mb-1">
        <Ionicons name="person-outline" size={18} color="#458EFF" />
        <Text variant="label">{title}</Text>
      </View>

      <SelectGroup
        label="Tipo de Documento"
        options={TIPO_DOC.map(t => ({ id: t.key, nombre: t.label }))}
        selectedId={data.tipo_documento}
        onSelect={id => updateField('tipo_documento', id)}
      />

      <View className="flex-row items-end gap-2">
        <View className="flex-1">
          <Input
            label="Número de Documento"
            value={data.numero_documento}
            onChangeText={v => updateField('numero_documento', v)}
            placeholder="Ej: 12345678"
            keyboardType="numeric"
          />
        </View>
        <TouchableOpacity
          onPress={onSearch}
          disabled={isSearching}
          className="bg-primary-500 px-4 py-3.5 rounded-xl items-center justify-center mb-1"
        >
          {isSearching
            ? <ActivityIndicator size="small" color="#fff" />
            : <Ionicons name="search" size={20} color="#fff" />
          }
        </TouchableOpacity>
      </View>

      {error ? <Text variant="caption" color="error">{error}</Text> : null}

      <Input
        label="Razón Social / Nombre"
        value={data.razon_social}
        onChangeText={v => updateField('razon_social', v)}
        placeholder="Nombre completo"
      />

      <Input
        label="Dirección"
        value={data.direccion}
        onChangeText={v => updateField('direccion', v)}
        placeholder="Dirección del cliente"
        leftIcon="location-outline"
      />

      <View className="flex-row gap-2">
        <View className="flex-1">
          <Input
            label="Email"
            value={data.email}
            onChangeText={v => updateField('email', v)}
            placeholder="correo@ejemplo.com"
            keyboardType="email-address"
            leftIcon="mail-outline"
          />
        </View>
        <View className="flex-1">
          <Input
            label="Teléfono"
            value={data.telefono}
            onChangeText={v => updateField('telefono', v)}
            placeholder="999888777"
            keyboardType="phone-pad"
            leftIcon="call-outline"
          />
        </View>
      </View>
    </Card>
  );
}

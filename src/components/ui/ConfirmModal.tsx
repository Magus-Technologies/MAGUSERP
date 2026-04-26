import React from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text }   from './Text';
import { Button } from './Button';

interface Props {
  visible:        boolean;
  title:          string;
  message:        string;
  onConfirm:      () => void;
  onCancel:       () => void;
  loading?:       boolean;
  confirmLabel?:  string;
  confirmVariant?: 'danger' | 'primary' | 'secondary' | 'ghost';
  iconName?:      keyof typeof Ionicons.glyphMap;
  iconColor?:     string;
  iconBg?:        string;
}

export function ConfirmModal({
  visible, title, message, onConfirm, onCancel, loading,
  confirmLabel  = 'Eliminar',
  confirmVariant = 'danger',
  iconName      = 'trash-outline',
  iconColor     = '#EF4444',
  iconBg        = '#FEF2F2',
}: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onCancel}
        className="flex-1 bg-black/40 items-center justify-center px-8"
      >
        <TouchableOpacity activeOpacity={1} className="bg-white rounded-2xl w-full p-6">
          <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: iconBg, alignItems: 'center', justifyContent: 'center', marginBottom: 16, alignSelf: 'center' }}>
            <Ionicons name={iconName} size={22} color={iconColor} />
          </View>
          <Text variant="h4" className="text-center mb-2">{title}</Text>
          <Text variant="body" color="muted" className="text-center mb-6">{message}</Text>
          <View className="flex-row gap-3">
            <Button variant="secondary" size="md" onPress={onCancel} style={{ flex: 1 }}>
              Cancelar
            </Button>
            <Button variant={confirmVariant} size="md" onPress={onConfirm} loading={loading} style={{ flex: 1 }}>
              {confirmLabel}
            </Button>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

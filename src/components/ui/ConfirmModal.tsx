import React from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text }   from './Text';
import { Button } from './Button';

interface Props {
  visible:    boolean;
  title:      string;
  message:    string;
  onConfirm:  () => void;
  onCancel:   () => void;
  loading?:   boolean;
}

export function ConfirmModal({ visible, title, message, onConfirm, onCancel, loading }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onCancel}
        className="flex-1 bg-black/40 items-center justify-center px-8"
      >
        <TouchableOpacity activeOpacity={1} className="bg-white rounded-2xl w-full p-6">
          <View className="w-12 h-12 bg-red-50 rounded-full items-center justify-center mb-4 self-center">
            <Ionicons name="trash-outline" size={22} color="#EF4444" />
          </View>
          <Text variant="h4" className="text-center mb-2">{title}</Text>
          <Text variant="body" color="muted" className="text-center mb-6">{message}</Text>
          <View className="flex-row gap-3">
            <Button variant="secondary" size="md" onPress={onCancel} style={{ flex: 1 }}>
              Cancelar
            </Button>
            <Button variant="danger" size="md" onPress={onConfirm} loading={loading} style={{ flex: 1 }}>
              Eliminar
            </Button>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

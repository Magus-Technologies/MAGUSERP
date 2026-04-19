import React from 'react';
import {
  View, Modal, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text }   from './Text';
import { Button } from './Button';

type Action = 'create' | 'edit' | 'delete';

const iconMap: Record<Action, { name: string; color: string; bg: string }> = {
  create: { name: 'add-circle-outline', color: '#22c55e', bg: 'bg-green-50'  },
  edit:   { name: 'pencil-outline',     color: '#458EFF', bg: 'bg-blue-50'   },
  delete: { name: 'trash-outline',      color: '#EF4444', bg: 'bg-red-50'    },
};

const confirmLabel: Record<Action, string> = {
  create: 'Guardar',
  edit:   'Guardar',
  delete: 'Eliminar',
};

const confirmVariant: Record<Action, 'primary' | 'danger'> = {
  create: 'primary',
  edit:   'primary',
  delete: 'danger',
};

interface Props {
  visible:    boolean;
  action:     Action;
  title:      string;
  message?:   string;
  error?:     string;
  onConfirm:  () => void;
  onCancel:   () => void;
  loading?:   boolean;
  children?:  React.ReactNode;
}

export function ActionModal({
  visible, action, title, message, error,
  onConfirm, onCancel, loading, children,
}: Props) {
  const icon = iconMap[action];

  if (action === 'delete') {
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onCancel}
          className="flex-1 bg-black/40 items-center justify-center px-8"
        >
          <TouchableOpacity activeOpacity={1} className="bg-white rounded-2xl w-full p-6">
            <View className={`w-12 h-12 ${icon.bg} rounded-full items-center justify-center mb-4 self-center`}>
              <Ionicons name={icon.name as any} size={22} color={icon.color} />
            </View>
            <Text variant="h4" className="text-center mb-2">{title}</Text>
            {message ? (
              <Text variant="body" color="muted" className="text-center mb-4">{message}</Text>
            ) : null}
            {error ? (
              <Text variant="caption" color="error" className="text-center mb-4">{error}</Text>
            ) : null}
            <View className="flex-row gap-3">
              <Button variant="secondary" size="md" onPress={onCancel} style={{ flex: 1 }}>
                Cancelar
              </Button>
              <Button variant={confirmVariant[action]} size="md" onPress={onConfirm} loading={loading} style={{ flex: 1 }}>
                {confirmLabel[action]}
              </Button>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        <TouchableOpacity activeOpacity={1} onPress={onCancel} className="flex-1 bg-black/30" />

        <View className="bg-white rounded-t-3xl px-5 pt-4 pb-8">
          <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />

          <View className="flex-row items-center mb-5">
            <View className={`w-8 h-8 ${icon.bg} rounded-lg items-center justify-center mr-3`}>
              <Ionicons name={icon.name as any} size={16} color={icon.color} />
            </View>
            <Text variant="h4" className="flex-1">{title}</Text>
            <TouchableOpacity onPress={onCancel} className="w-8 h-8 items-center justify-center">
              <Ionicons name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>

          <Button onPress={onConfirm} loading={loading} fullWidth>
            {confirmLabel[action]}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

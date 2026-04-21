import React from 'react';
import { View, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';
import { Button } from './Button';

type StatusType = 'success' | 'error' | 'warning';

interface Props {
  visible: boolean;
  type: StatusType;
  title: string;
  message: string;
  onClose: () => void;
}

const config: Record<StatusType, { icon: string; color: string; bg: string }> = {
  success: { icon: 'checkmark-circle', color: '#22c55e', bg: 'bg-green-50' },
  error:   { icon: 'close-circle',     color: '#ef4444', bg: 'bg-red-50'   },
  warning: { icon: 'alert-circle',     color: '#f59e0b', bg: 'bg-orange-50' },
};

export function StatusModal({ visible, type, title, message, onClose }: Props) {
  const { icon, color, bg } = config[type];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        className="flex-1 bg-black/40 items-center justify-center px-8"
      >
        <TouchableOpacity activeOpacity={1} className="bg-white rounded-3xl w-full p-8 items-center">
          <View className={`w-20 h-20 ${bg} rounded-full items-center justify-center mb-5`}>
            <Ionicons name={icon as any} size={48} color={color} />
          </View>
          
          <Text variant="h3" className="text-center mb-2">{title}</Text>
          <Text variant="body" color="muted" className="text-center mb-8">
            {message}
          </Text>

          <Button 
            onPress={onClose} 
            fullWidth 
            variant={type === 'error' ? 'danger' : 'primary'}
            size="lg"
          >
            Continuar
          </Button>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

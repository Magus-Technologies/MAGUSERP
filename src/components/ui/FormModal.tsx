import React from 'react';
import { View, Modal, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Text }   from './Text';
import { Button } from './Button';

interface Props {
  visible:    boolean;
  title:      string;
  onClose:    () => void;
  onSave:     () => void;
  loading?:   boolean;
  children:   React.ReactNode;
}

export function FormModal({ visible, title, onClose, onSave, loading, children }: Props) {
  const { bottom } = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 justify-end"
      >
        <TouchableOpacity activeOpacity={1} onPress={onClose} className="flex-1 bg-black/30" />

        <View className="bg-white rounded-t-3xl px-5 pt-4" style={{ paddingBottom: Math.max(bottom, 16) + 8 }}>
          {/* Handle */}
          <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />

          {/* Header */}
          <View className="flex-row items-center mb-5">
            <Text variant="h4" className="flex-1">{title}</Text>
            <TouchableOpacity onPress={onClose} className="w-8 h-8 items-center justify-center">
              <Ionicons name="close" size={22} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>

          <Button onPress={onSave} loading={loading} fullWidth>
            Guardar
          </Button>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

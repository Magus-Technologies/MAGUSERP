import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { Text } from '@/src/components/ui/Text';
import { EmptyState } from '@/src/components/ui/EmptyState';

export default function Screen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-azul-oscuro px-4 pt-10 pb-3 flex-row items-center">
        <View className="flex-1">
          <Text variant="caption" className="text-white/60">Facturación</Text>
          <Text variant="h4" color="white">Configuración</Text>
        </View>
      </View>
      <EmptyState icon="construct-outline" title="En construcción" message="Esta sección estará disponible próximamente" />
    </View>
  );
}

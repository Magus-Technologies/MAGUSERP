import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../store/AuthContext';
import { Text } from '../ui/Text';

interface MenuItem {
  id:       string;
  label:    string;
  icon:     keyof typeof Ionicons.glyphMap;
  route?:   string;
  children?: MenuItem[];
}

const MENU: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard',   icon: 'home-outline',      route: '/(app)' },
  {
    id: 'almacen', label: 'Almacén', icon: 'cube-outline',
    children: [
      { id: 'productos',  label: 'Productos',  icon: 'pricetags-outline', route: '/(app)/almacen/productos'  },
      { id: 'categorias', label: 'Categorías', icon: 'grid-outline',      route: '/(app)/almacen/categorias' },
      { id: 'marcas',     label: 'Marcas',     icon: 'ribbon-outline',    route: '/(app)/almacen/marcas'     },
    ],
  },
  {
    id: 'facturacion', label: 'Facturación', icon: 'receipt-outline',
    children: [
      { id: 'fact-dashboard',    label: 'Dashboard',          icon: 'home-outline',           route: '/(app)/facturacion/dashboard'    },
      { id: 'ventas',            label: 'Ventas',             icon: 'cash-outline',           route: '/(app)/facturacion/ventas'       },
      { id: 'comprobantes',      label: 'Comprobantes',       icon: 'document-text-outline',  route: '/(app)/facturacion/comprobantes' },
      { id: 'series',            label: 'Series',             icon: 'list-outline',           route: '/(app)/facturacion/series'       },
      { id: 'resumenes',         label: 'Resúmenes',          icon: 'bar-chart-outline',      route: '/(app)/facturacion/resumenes'    },
      { id: 'bajas',             label: 'Bajas',              icon: 'trash-outline',          route: '/(app)/facturacion/bajas'        },
      { id: 'auditoria',         label: 'Auditoría',          icon: 'shield-checkmark-outline',route: '/(app)/facturacion/auditoria'   },
      { id: 'certificados',      label: 'Certificados',       icon: 'ribbon-outline',         route: '/(app)/facturacion/certificados' },
      { id: 'notas-credito',     label: 'Notas de Crédito',  icon: 'add-circle-outline',     route: '/(app)/facturacion/notas-credito'},
      { id: 'notas-debito',      label: 'Notas de Débito',   icon: 'remove-circle-outline',  route: '/(app)/facturacion/notas-debito' },
      { id: 'catalogos-sunat',   label: 'Catálogos SUNAT',   icon: 'book-outline',           route: '/(app)/facturacion/catalogos'    },
      { id: 'gre-remitente',     label: 'GRE Remitente',     icon: 'send-outline',           route: '/(app)/facturacion/gre-remitente'},
      { id: 'gre-transportista', label: 'GRE Transportista', icon: 'car-outline',            route: '/(app)/facturacion/gre-transportista'},
      { id: 'fact-config',       label: 'Configuración',     icon: 'settings-outline',       route: '/(app)/facturacion/configuracion' },
    ],
  },
];

export function DrawerContent({ navigation }: DrawerContentComponentProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [expanded, setExpanded] = useState<string[]>([]);

  const toggle = (id: string) =>
    setExpanded(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const navigate = (route?: string) => {
    if (!route) return;
    navigation.closeDrawer();
    router.push(route as any);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/(auth)/login');
  };

  const renderItem = (item: MenuItem, depth = 0) => {
    const hasChildren = !!item.children?.length;
    const isOpen = expanded.includes(item.id);
    const pl = depth === 0 ? 'pl-4' : 'pl-10';

    return (
      <View key={item.id}>
        <TouchableOpacity
          onPress={() => hasChildren ? toggle(item.id) : navigate(item.route)}
          className={`flex-row items-center py-3 pr-4 ${pl} active:bg-neutral-30`}
        >
          <Ionicons name={item.icon} size={20} color={depth === 0 ? '#458EFF' : '#808080'} />
          <Text
            className={`flex-1 ml-3 ${depth === 0 ? 'font-semibold text-neutral' : 'text-gray-600'}`}
          >
            {item.label}
          </Text>
          {hasChildren && (
            <Ionicons
              name={isOpen ? 'chevron-up' : 'chevron-down'}
              size={16} color="#999"
            />
          )}
        </TouchableOpacity>

        {hasChildren && isOpen && (
          <View className="bg-neutral-30">
            {item.children!.map(child => renderItem(child, depth + 1))}
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-azul-oscuro px-4 pt-14 pb-6">
        <View className="flex-row items-center">
          <View className="w-10 h-10 rounded-full bg-primary-500 items-center justify-center">
            <Text color="white" className="font-bold text-base">
              {user?.name?.charAt(0).toUpperCase() ?? 'M'}
            </Text>
          </View>
          <View className="ml-3 flex-1">
            <Text color="white" className="font-semibold">{user?.name ?? 'Usuario'}</Text>
            <Text className="text-white/60 text-xs" numberOfLines={1}>{user?.email ?? ''}</Text>
          </View>
        </View>
      </View>

      {/* Menú */}
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="py-2">
          {MENU.map(item => renderItem(item))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View className="border-t border-gray-100 pb-6">
        <TouchableOpacity
          onPress={handleLogout}
          className="flex-row items-center px-4 py-4 active:bg-red-50"
        >
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text className="ml-3 text-danger-500 font-medium">Cerrar Sesión</Text>
        </TouchableOpacity>
        <Text variant="caption" color="muted" className="text-center">MagusERP v1.0.0</Text>
      </View>
    </View>
  );
}

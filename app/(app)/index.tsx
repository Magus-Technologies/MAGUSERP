import React from 'react';
import {
  View, ScrollView, TouchableOpacity,
  useWindowDimensions, Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/store/AuthContext';
import { Text } from '@/src/components/ui/Text';

// ── Definición de botones ─────────────────────────────────────────────────────
const MENU: {
  label:  string;
  icon:   keyof typeof Ionicons.glyphMap;
  color:  string;
  route:  string;
}[] = [
  { label: 'Dashboard',           icon: 'stats-chart',          color: '#3B82F6', route: '/(app)/estadisticas'              },
  { label: 'Dash. Facturación',   icon: 'receipt-outline',      color: '#6366F1', route: '/(app)/facturacion/dashboard'     },
  { label: 'Pedidos',             icon: 'bag-handle-outline',   color: '#0EA5E9', route: '/(app)/pedidos'                   },
  { label: 'Clientes',            icon: 'people-outline',       color: '#22C55E', route: '/(app)/clientes'                  },
  { label: 'Productos',           icon: 'cube-outline',         color: '#10B981', route: '/(app)/almacen/productos'         },
  { label: 'Categorías',          icon: 'grid-outline',         color: '#8B5CF6', route: '/(app)/almacen/categorias'        },
  { label: 'Marcas',              icon: 'bookmark-outline',     color: '#F59E0B', route: '/(app)/almacen/marcas'            },
  { label: 'Ventas',              icon: 'cart-outline',         color: '#EF4444', route: '/(app)/facturacion/ventas'        },
  { label: 'Cotizaciones',        icon: 'document-text-outline',color: '#EC4899', route: '/(app)/facturacion/cotizaciones'  },
  { label: 'Nota de Crédito',    icon: 'arrow-undo-outline',   color: '#14B8A6', route: '/(app)/facturacion/notas-credito' },
  { label: 'Nota de Débito',     icon: 'arrow-redo-outline',   color: '#F97316', route: '/(app)/facturacion/notas-debito'  },
];

export default function HomeMenuScreen() {
  const { user } = useAuth();
  const router   = useRouter();
  const { top }    = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();

  const COLS    = 3;
  const PAD     = 16;
  const GAP     = 10;
  const btnSize = Math.floor((W - PAD * 2 - GAP * (COLS - 1)) / COLS);

  return (
    <View style={{ flex: 1, backgroundColor: '#1E3A8A' }}>
      {/* Header */}
      <View style={{ paddingTop: Math.max(top, 16) + 8, paddingBottom: 20, paddingHorizontal: 20, alignItems: 'center' }}>
        <Image
          source={require('@/assets/images/logo3.png')}
          style={{ width: 110, height: 36, marginBottom: 12 }}
          resizeMode="contain"
        />

        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: '#fff' }}>
            {user?.name ?? 'Usuario'}
          </Text>
          <Text style={{ fontSize: 12, color: '#93C5FD', marginTop: 2 }}>
            {user?.email ?? ''}
          </Text>
        </View>
      </View>

      {/* Grid de botones */}
      <ScrollView
        style={{ flex: 1, backgroundColor: '#F1F5F9', borderTopLeftRadius: 24, borderTopRightRadius: 24 }}
        contentContainerStyle={{ padding: PAD, paddingTop: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: GAP }}>
          {MENU.map(item => (
            <TouchableOpacity
              key={item.route}
              onPress={() => router.push(item.route as any)}
              activeOpacity={0.82}
              style={{
                width: btnSize,
                height: btnSize,
                backgroundColor: item.color,
                borderRadius: 18,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                // sombra
                shadowColor: item.color,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
              }}
            >
              <View style={{ backgroundColor: 'rgba(255,255,255,0.22)', width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={item.icon} size={26} color="#fff" />
              </View>
              <Text
                style={{ fontSize: 11, fontWeight: '700', color: '#fff', textAlign: 'center', paddingHorizontal: 6 }}
                numberOfLines={2}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

import React, { useState } from 'react';
import {
  View, ScrollView, TouchableOpacity,
  useWindowDimensions, Image, RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-gifted-charts';
import { useAuth } from '@/src/store/AuthContext';
import { Text }          from '@/src/components/ui/Text';
import { Card }          from '@/src/components/ui/Card';
import { ScreenHeader }  from '@/src/components/ui/ScreenHeader';
import { StatCard }      from '@/src/components/ui/StatCard';
import { SectionHeader } from '@/src/components/ui/SectionHeader';

// ── Tipos ─────────────────────────────────────────────────────────────────────
interface ClienteTop {
  nombre:   string;
  total:    number;
  montos:   number[]; // por categoría: Acces, Audio, Periféricos, Cómputo, Otros
}

interface YearData {
  stats:         { pedidos: number; clientes: number; ingresos: number; productos: number; ganancia: number };
  flujoActual:   number[];
  flujoAnterior: number[];
  topVendidos:   { nombre: string; cantidad: number; color: string }[];
  topGanancia:   { nombre: string; abrev: string; ganancia: number; color: string }[];
  categorias:    { nombre: string; porcentaje: number; color: string; velocidad: string }[];
  topClientes:   ClienteTop[];
}

// ── Constantes ────────────────────────────────────────────────────────────────
const ML  = ['E','F','M','A','M','J','J','A','S','O','N','D'];
const C   = ['#458EFF','#34C98A','#F59E0B','#8B5CF6','#EF4444'];
const CATS = ['Accesorios','Audio','Periféricos','Cómputo','Otros'];

// ── Mock Data ─────────────────────────────────────────────────────────────────
const MOCK: Record<number, YearData> = {
  2023: {
    stats: { pedidos: 145, clientes: 98, ingresos: 27350, productos: 240, ganancia: 7200 },
    flujoActual:   [4800,5200,4600,6100,6800,5900,7400,6900,5600,7200,8100,9200],
    flujoAnterior: [3900,4200,3800,5100,5600,4800,6100,5700,4600,6000,6900,7800],
    topVendidos: [
      { nombre: 'Cable HDMI 2.0',     cantidad: 98, color: C[0] },
      { nombre: 'Cargador USB-A 30W', cantidad: 87, color: C[1] },
      { nombre: 'Audífonos Basic',    cantidad: 74, color: C[2] },
      { nombre: 'Funda Samsung S23',  cantidad: 62, color: C[3] },
      { nombre: 'Mouse USB',          cantidad: 55, color: C[4] },
    ],
    topGanancia: [
      { nombre: 'Laptop Core i5',  abrev: 'Laptop',  ganancia: 2800, color: C[0] },
      { nombre: 'Monitor 22" FHD', abrev: 'Monitor', ganancia: 1900, color: C[1] },
      { nombre: 'Audífonos Basic', abrev: 'Audf.',   ganancia: 1500, color: C[2] },
      { nombre: 'Teclado USB',     abrev: 'Teclado', ganancia: 1200, color: C[3] },
      { nombre: 'Router WiFi',     abrev: 'Router',  ganancia:  900, color: C[4] },
    ],
    categorias: [
      { nombre: 'Accesorios', porcentaje: 40, color: C[0], velocidad: 'Alta'  },
      { nombre: 'Audio',      porcentaje: 24, color: C[1], velocidad: 'Media' },
      { nombre: 'Periféricos',porcentaje: 22, color: C[2], velocidad: 'Media' },
      { nombre: 'Cómputo',    porcentaje: 14, color: C[3], velocidad: 'Baja'  },
    ],
    topClientes: [
      { nombre: 'Inversiones Roca SAC',  total: 4200, montos: [1200, 800, 600, 1100, 500] },
      { nombre: 'Comercial López EIRL',  total: 3800, montos: [1600, 400, 900, 600,  300] },
      { nombre: 'Distribuidora Norte',   total: 3100, montos: [900,  900, 700, 400,  200] },
      { nombre: 'Tech Solutions Perú',   total: 2700, montos: [500,  300, 800, 900,  200] },
      { nombre: 'Grupo Andino Corp.',    total: 2400, montos: [1100, 600, 300, 200,  200] },
      { nombre: 'Servicios Globales SA', total: 1900, montos: [400,  700, 500, 200,  100] },
    ],
  },
  2024: {
    stats: { pedidos: 198, clientes: 142, ingresos: 36420, productos: 285, ganancia: 9870 },
    flujoActual:   [6200,7100,5800,8200,9100,7800,10300,9900,7200,9800,11400,12300],
    flujoAnterior: [4800,5200,4600,6100,6800,5900, 7400,6900,5600,7200, 8100, 9200],
    topVendidos: [
      { nombre: 'Cargador USB-C 65W', cantidad: 132, color: C[0] },
      { nombre: 'Audífonos BT X500',  cantidad:  98, color: C[1] },
      { nombre: 'Cable HDMI 2.1',     cantidad:  87, color: C[2] },
      { nombre: 'Funda iPhone 14',    cantidad:  76, color: C[3] },
      { nombre: 'Mouse Inalámbrico',  cantidad:  61, color: C[4] },
    ],
    topGanancia: [
      { nombre: 'Laptop Core i5',    abrev: 'Laptop',  ganancia: 3600, color: C[0] },
      { nombre: 'Monitor 24" FHD',   abrev: 'Monitor', ganancia: 2400, color: C[1] },
      { nombre: 'Audífonos BT X500', abrev: 'Audf.',   ganancia: 2100, color: C[2] },
      { nombre: 'Teclado Mecánico',  abrev: 'Teclado', ganancia: 1600, color: C[3] },
      { nombre: 'SSD 1TB NVMe',      abrev: 'SSD',     ganancia: 1200, color: C[4] },
    ],
    categorias: [
      { nombre: 'Accesorios', porcentaje: 38, color: C[0], velocidad: 'Alta'  },
      { nombre: 'Audio',      porcentaje: 25, color: C[1], velocidad: 'Alta'  },
      { nombre: 'Periféricos',porcentaje: 20, color: C[2], velocidad: 'Media' },
      { nombre: 'Cómputo',    porcentaje: 17, color: C[3], velocidad: 'Media' },
    ],
    topClientes: [
      { nombre: 'Tech Solutions Perú',   total: 6800, montos: [1400, 900, 1800, 2200,  500] },
      { nombre: 'Inversiones Roca SAC',  total: 5900, montos: [2100, 1100, 900, 1300,  500] },
      { nombre: 'Distribuidora Norte',   total: 5100, montos: [1800, 1400, 900,  700,  300] },
      { nombre: 'Comercial López EIRL',  total: 4600, montos: [2000,  600, 1100, 600,  300] },
      { nombre: 'Grupo Andino Corp.',    total: 3900, montos: [1500,  900,  800, 500,  200] },
      { nombre: 'Servicios Globales SA', total: 3100, montos: [ 700, 1200,  800, 300,  100] },
    ],
  },
  2025: {
    stats: { pedidos: 248, clientes: 186, ingresos: 45230, productos: 312, ganancia: 12450 },
    flujoActual:   [8200, 9100, 7800,10200,11500, 9800,12300,10900, 8700,11200,13400,14800],
    flujoAnterior: [6200, 7100, 5800, 8200, 9100, 7800,10300, 9900, 7200, 9800,11400,12300],
    topVendidos: [
      { nombre: 'Audífonos BT X500',  cantidad: 145, color: C[0] },
      { nombre: 'Cargador USB-C 65W', cantidad: 118, color: C[1] },
      { nombre: 'Funda iPhone 15',    cantidad:  97, color: C[2] },
      { nombre: 'Cable HDMI 2.1',     cantidad:  84, color: C[3] },
      { nombre: 'Mouse Inalámbrico',  cantidad:  72, color: C[4] },
    ],
    topGanancia: [
      { nombre: 'Laptop Core i7',    abrev: 'Laptop',  ganancia: 4200, color: C[0] },
      { nombre: 'Audífonos BT X500', abrev: 'Audf.',   ganancia: 2900, color: C[1] },
      { nombre: 'Monitor 27" 4K',    abrev: 'Monitor', ganancia: 2100, color: C[2] },
      { nombre: 'Teclado Mecánico',  abrev: 'Teclado', ganancia: 1800, color: C[3] },
      { nombre: 'Webcam HD Pro',     abrev: 'Webcam',  ganancia: 1450, color: C[4] },
    ],
    categorias: [
      { nombre: 'Accesorios', porcentaje: 35, color: C[0], velocidad: 'Alta'  },
      { nombre: 'Audio',      porcentaje: 28, color: C[1], velocidad: 'Alta'  },
      { nombre: 'Periféricos',porcentaje: 22, color: C[2], velocidad: 'Media' },
      { nombre: 'Cómputo',    porcentaje: 15, color: C[3], velocidad: 'Media' },
    ],
    topClientes: [
      { nombre: 'Tech Solutions Perú',   total: 8900, montos: [1800, 1200, 2400, 2800,  700] },
      { nombre: 'Inversiones Roca SAC',  total: 7600, montos: [2800, 1500, 1200, 1500,  600] },
      { nombre: 'Grupo Andino Corp.',    total: 6400, montos: [2200, 1800, 1400,  700,  300] },
      { nombre: 'Distribuidora Norte',   total: 5800, montos: [2400, 1600, 1100,  500,  200] },
      { nombre: 'Comercial López EIRL',  total: 5200, montos: [2600,  700, 1300,  400,  200] },
      { nombre: 'Servicios Globales SA', total: 4100, montos: [ 900, 1700, 1000,  300,  200] },
    ],
  },
  2026: {
    stats: { pedidos: 89, clientes: 67, ingresos: 18200, productos: 318, ganancia: 5120 },
    flujoActual:   [9200,10100,8400,11200,   0,   0,   0,   0,   0,   0,   0,   0],
    flujoAnterior: [8200, 9100,7800,10200,11500,9800,12300,10900,8700,11200,13400,14800],
    topVendidos: [
      { nombre: 'Audífonos Pro X',   cantidad: 52, color: C[0] },
      { nombre: 'Cargador GaN 100W', cantidad: 45, color: C[1] },
      { nombre: 'Funda iPhone 16',   cantidad: 38, color: C[2] },
      { nombre: 'SSD 2TB NVMe',      cantidad: 29, color: C[3] },
      { nombre: 'Teclado Mecánico',  cantidad: 24, color: C[4] },
    ],
    topGanancia: [
      { nombre: 'Laptop Core i9',   abrev: 'Laptop',  ganancia: 1900, color: C[0] },
      { nombre: 'Audífonos Pro X',  abrev: 'Audf.',   ganancia: 1400, color: C[1] },
      { nombre: 'Monitor 32" 4K',   abrev: 'Monitor', ganancia:  980, color: C[2] },
      { nombre: 'Teclado Mecánico', abrev: 'Teclado', ganancia:  720, color: C[3] },
      { nombre: 'SSD 2TB NVMe',     abrev: 'SSD',     ganancia:  600, color: C[4] },
    ],
    categorias: [
      { nombre: 'Accesorios', porcentaje: 33, color: C[0], velocidad: 'Alta'  },
      { nombre: 'Audio',      porcentaje: 30, color: C[1], velocidad: 'Alta'  },
      { nombre: 'Periféricos',porcentaje: 23, color: C[2], velocidad: 'Media' },
      { nombre: 'Cómputo',    porcentaje: 14, color: C[3], velocidad: 'Media' },
    ],
    topClientes: [
      { nombre: 'Tech Solutions Perú',   total: 3800, montos: [ 900,  600, 1100, 1000,  200] },
      { nombre: 'Inversiones Roca SAC',  total: 3200, montos: [1200,  700,  600,  500,  200] },
      { nombre: 'Grupo Andino Corp.',    total: 2700, montos: [ 900,  800,  600,  300,  100] },
      { nombre: 'Distribuidora Norte',   total: 2400, montos: [1000,  700,  400,  200,  100] },
      { nombre: 'Comercial López EIRL',  total: 2100, montos: [1100,  300,  500,  100,  100] },
      { nombre: 'Servicios Globales SA', total: 1600, montos: [ 400,  700,  300,  100,  100] },
    ],
  },
};

// ── Barra horizontal ranking ──────────────────────────────────────────────────
function HBar({ label, value, maxVal, color, rank }: {
  label: string; value: number; maxVal: number; color: string; rank: number;
}) {
  const pct = maxVal > 0 ? (value / maxVal) * 100 : 0;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 8 }}>
      <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: color + '22', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 11, color, fontWeight: '700' }}>{rank}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 }}>
          <Text variant="bodySmall" numberOfLines={1} style={{ flex: 1, marginRight: 6 }}>{label}</Text>
          <Text variant="caption" style={{ color, fontWeight: '700' }}>{value.toLocaleString()} uds</Text>
        </View>
        <View style={{ height: 6, backgroundColor: '#F3F4F6', borderRadius: 99 }}>
          <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 99 }} />
        </View>
      </View>
    </View>
  );
}

// ── Barra apilada horizontal (clientes) ───────────────────────────────────────
function StackedBar({ cliente, maxTotal }: { cliente: ClienteTop; maxTotal: number }) {
  const total     = cliente.total;
  const barWidthPct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const topIdx    = cliente.montos.indexOf(Math.max(...cliente.montos));

  return (
    <View style={{ marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
        <Text variant="bodySmall" numberOfLines={1} style={{ flex: 1, marginRight: 8 }}>{cliente.nombre}</Text>
        <Text variant="caption" style={{ fontWeight: '700', color: '#1F2937' }}>
          S/ {total.toLocaleString()}
        </Text>
      </View>
      {/* Barra apilada */}
      <View style={{ height: 18, backgroundColor: '#F3F4F6', borderRadius: 9, overflow: 'hidden', flexDirection: 'row', width: `${barWidthPct}%` }}>
        {cliente.montos.map((v, i) => {
          const segPct = total > 0 ? (v / total) * 100 : 0;
          return segPct > 0 ? (
            <View key={i} style={{ width: `${segPct}%`, backgroundColor: C[i] }} />
          ) : null;
        })}
      </View>
      {/* Producto estrella */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 }}>
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: C[topIdx] }} />
        <Text style={{ fontSize: 9, color: '#9CA3AF' }}>
          Más compra: <Text style={{ color: C[topIdx], fontWeight: '700' }}>{CATS[topIdx]}</Text>
          {' '}· {Math.round((cliente.montos[topIdx] / total) * 100)}% del total
        </Text>
      </View>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
const ANOS = [2023, 2024, 2025, 2026];

export default function DashboardScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { width: W } = useWindowDimensions();
  const chartW = W - 64;

  const [year, setYear]             = useState(2025);
  const [refreshing, setRefreshing] = useState(false);

  const d = MOCK[year];

  // Líneas: solo meses con dato > 0
  const idxActivos   = d.flujoActual.reduce((a, v, i) => { if (v > 0) a.push(i); return a; }, [] as number[]);
  const showLabels   = idxActivos.length <= 6;
  const lineActual   = idxActivos.map(i => ({
    value: d.flujoActual[i],
    label: ML[i],
    dataPointText: showLabels ? `${(d.flujoActual[i] / 1000).toFixed(1)}k` : undefined,
  }));
  const lineAnterior = idxActivos.map(i => ({
    value: d.flujoAnterior[i],
    dataPointText: showLabels ? `${(d.flujoAnterior[i] / 1000).toFixed(1)}k` : undefined,
  }));
  const spacing = idxActivos.length > 1 ? Math.max(22, Math.floor((chartW - 40) / (idxActivos.length - 1))) : chartW - 40;

  // Totales y diferencia
  const totalActual   = idxActivos.reduce((s, i) => s + d.flujoActual[i], 0);
  const totalAnterior = idxActivos.reduce((s, i) => s + d.flujoAnterior[i], 0);
  const diferencia    = totalActual - totalAnterior;
  const difPct        = totalAnterior > 0 ? Math.abs((diferencia / totalAnterior) * 100).toFixed(1) : '0';

  // Barras verticales: Mayor Ganancia
  const barData = d.topGanancia.map(p => ({
    value:      p.ganancia,
    label:      p.abrev,
    frontColor: p.color,
    topLabelComponent: () => (
      <Text style={{ fontSize: 8, color: p.color, fontWeight: '700', marginBottom: 2 }}>
        {(p.ganancia / 1000).toFixed(1)}k
      </Text>
    ),
  }));
  const barW = Math.floor((chartW - 60) / 5) - 6;

  // Dona: Rotación por categoría
  const pieData = d.categorias.map(cat => ({
    value:     cat.porcentaje,
    color:     cat.color,
    text:      `${cat.porcentaje}%`,
    textColor: '#fff',
    textSize:  10,
  }));

  // Top clientes
  const maxTotal     = Math.max(...d.topClientes.map(c => c.total));
  const totalClientes= d.topClientes.reduce((s, c) => s + c.total, 0);
  const topCatGlobal = CATS[
    d.topClientes
      .reduce((acc, c) => c.montos.map((v, i) => acc[i] + v), [0,0,0,0,0])
      .indexOf(Math.max(...d.topClientes.reduce((acc, c) => c.montos.map((v, i) => acc[i] + v), [0,0,0,0,0])))
  ];

  const margen = d.stats.ingresos > 0 ? Math.round((d.stats.ganancia / d.stats.ingresos) * 100) : 0;
  const maxVendido = Math.max(...d.topVendidos.map(p => p.cantidad));

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      <ScreenHeader
        title={user?.name ?? 'Bienvenido'}
        subtitle="Dashboard"
        onMenu={() => navigation.openDrawer()}
        right={
          <Image
            source={require('@/assets/images/logo3.png')}
            style={{ width: 90, height: 30 }}
            resizeMode="contain"
          />
        }
      />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 700); }}
            tintColor="#458EFF"
          />
        }
      >
        <View style={{ paddingHorizontal: 16, paddingVertical: 16, gap: 16 }}>

          {/* ── Filtro Año ── */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {ANOS.map(a => (
              <TouchableOpacity
                key={a}
                onPress={() => setYear(a)}
                style={{
                  flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 10,
                  backgroundColor: year === a ? '#458EFF' : '#fff',
                  borderWidth: 1, borderColor: year === a ? '#458EFF' : '#E5E7EB',
                }}
              >
                <Text variant="caption" style={{ color: year === a ? '#fff' : '#6B7280', fontWeight: '700' }}>
                  {a}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* ── KPIs ── */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <StatCard title="Pedidos"   value={d.stats.pedidos}   icon="cart-outline"   color="primary" />
            <StatCard title="Clientes"  value={d.stats.clientes}  icon="people-outline" color="info"    />
            <StatCard title="Ingresos"  value={`S/ ${d.stats.ingresos.toLocaleString()}`} icon="cash-outline"  color="success" />
            <StatCard title="Productos" value={d.stats.productos}  icon="cube-outline"   color="warning" />
          </View>

          {/* ── Utilidad ── */}
          <Card className="p-4">
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 48, height: 48, backgroundColor: '#F0FDF4', borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="trending-up" size={24} color="#22C55E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="caption" color="muted">Utilidad {year}</Text>
                <Text variant="h3" style={{ color: '#16A34A' }}>S/ {d.stats.ganancia.toLocaleString()}</Text>
              </View>
              <View style={{ backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                <Text style={{ fontSize: 12, color: '#16A34A', fontWeight: '700' }}>{margen}% margen</Text>
              </View>
            </View>
          </Card>

          {/* ── Flujo de Ventas ── */}
          <Card className="p-4">
            <SectionHeader title="Flujo de Ventas" subtitle={`${year} vs ${year - 1}`} />
            <View style={{ flexDirection: 'row', gap: 16, marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 14, height: 3, backgroundColor: '#458EFF', borderRadius: 2 }} />
                <Text variant="caption" color="muted">{year}</Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 14, height: 3, backgroundColor: '#34C98A', borderRadius: 2 }} />
                <Text variant="caption" color="muted">{year - 1}</Text>
              </View>
            </View>
            <LineChart
              data={lineActual}
              data2={lineAnterior}
              width={chartW}
              height={showLabels ? 190 : 160}
              spacing={spacing}
              initialSpacing={8}
              color1="#458EFF"
              color2="#34C98A"
              thickness1={2.5}
              thickness2={2.5}
              dataPointsColor1="#458EFF"
              dataPointsColor2="#34C98A"
              dataPointsRadius={4}
              startFillColor1="#458EFF"
              startFillColor2="#34C98A"
              startOpacity1={0.18}
              startOpacity2={0.08}
              endOpacity1={0}
              endOpacity2={0}
              areaChart
              curved
              hideYAxisText
              xAxisLabelTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
              rulesType="solid"
              rulesColor="#F3F4F6"
              yAxisColor="transparent"
              xAxisColor="#E5E7EB"
              noOfSections={4}
              textShiftY={-8}
              textShiftX={-6}
              textFontSize={9}
            />
            {/* Resumen totales */}
            <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
              <View style={{ flex: 1, backgroundColor: '#EFF6FF', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>{year}</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#458EFF' }}>S/ {totalActual.toLocaleString()}</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#F0FDF4', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>{year - 1}</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: '#34C98A' }}>S/ {totalAnterior.toLocaleString()}</Text>
              </View>
              <View style={{ flex: 1, borderRadius: 10, padding: 10, alignItems: 'center', backgroundColor: diferencia >= 0 ? '#F0FDF4' : '#FEF2F2' }}>
                <Text style={{ fontSize: 10, color: '#9CA3AF', marginBottom: 2 }}>Diferencia</Text>
                <Text style={{ fontSize: 13, fontWeight: '800', color: diferencia >= 0 ? '#16A34A' : '#EF4444' }}>
                  {diferencia >= 0 ? '+' : '-'}S/ {Math.abs(diferencia).toLocaleString()}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginTop: 1 }}>
                  <Ionicons name={diferencia >= 0 ? 'trending-up' : 'trending-down'} size={10} color={diferencia >= 0 ? '#16A34A' : '#EF4444'} />
                  <Text style={{ fontSize: 9, color: diferencia >= 0 ? '#16A34A' : '#EF4444', fontWeight: '700' }}>{difPct}%</Text>
                </View>
              </View>
            </View>
          </Card>

          {/* ── Top Clientes por Facturación (barras apiladas) ── */}
          <Card className="p-4">
            <SectionHeader title="Top Clientes" subtitle="Facturación por categoría de producto" />

            {/* Métricas resumen */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              <View style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: '#9CA3AF', marginBottom: 2 }}>Total facturado</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#1F2937' }}>S/ {totalClientes.toLocaleString()}</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: '#9CA3AF', marginBottom: 2 }}>Clientes activos</Text>
                <Text style={{ fontSize: 12, fontWeight: '800', color: '#1F2937' }}>{d.topClientes.length}</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#F9FAFB', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 9, color: '#9CA3AF', marginBottom: 2 }}>Top categoría</Text>
                <Text style={{ fontSize: 11, fontWeight: '800', color: C[CATS.indexOf(topCatGlobal)] }} numberOfLines={1}>{topCatGlobal}</Text>
              </View>
            </View>

            {/* Leyenda de categorías */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              {CATS.map((cat, i) => (
                <View key={cat} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C[i] }} />
                  <Text style={{ fontSize: 9, color: '#6B7280' }}>{cat}</Text>
                </View>
              ))}
            </View>

            {/* Barras apiladas */}
            {d.topClientes.map(cliente => (
              <StackedBar key={cliente.nombre} cliente={cliente} maxTotal={maxTotal} />
            ))}
          </Card>

          {/* ── Productos Más Vendidos ── */}
          <Card className="p-4">
            <SectionHeader title="Más Vendidos" subtitle="Top 5 por cantidad vendida" />
            {d.topVendidos.map((p, i) => (
              <HBar key={p.nombre} rank={i + 1} label={p.nombre} value={p.cantidad} maxVal={maxVendido} color={p.color} />
            ))}
          </Card>

          {/* ── Mayor Ganancia — Barras verticales ── */}
          <Card className="p-4">
            <SectionHeader title="Mayor Ganancia" subtitle="Top 5 por rentabilidad (S/)" />
            <BarChart
              data={barData}
              width={chartW}
              height={160}
              barWidth={barW}
              barBorderTopLeftRadius={6}
              barBorderTopRightRadius={6}
              hideYAxisText
              xAxisLabelTextStyle={{ color: '#9CA3AF', fontSize: 10 }}
              rulesType="solid"
              rulesColor="#F3F4F6"
              yAxisColor="transparent"
              xAxisColor="#E5E7EB"
              noOfSections={4}
              initialSpacing={Math.floor(barW / 2)}
              spacing={Math.floor(barW / 1.5)}
              showValuesAsTopLabel={false}
            />
          </Card>

          {/* ── Rotación por Categoría — Dona ── */}
          <Card className="p-4" style={{ marginBottom: 8 }}>
            <SectionHeader title="Rotación por Categoría" subtitle="Participación de ventas" />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 }}>
              <PieChart
                data={pieData}
                donut
                radius={70}
                innerRadius={46}
                innerCircleColor="#fff"
                centerLabelComponent={() => (
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '800', color: '#1F2937' }}>{d.categorias.length}</Text>
                    <Text style={{ fontSize: 9, color: '#9CA3AF' }}>cats.</Text>
                  </View>
                )}
              />
              <View style={{ flex: 1, gap: 8 }}>
                {d.categorias.map(cat => (
                  <View key={cat.nombre} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: cat.color }} />
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text variant="bodySmall">{cat.nombre}</Text>
                        <Text variant="caption" style={{ color: cat.color, fontWeight: '700' }}>{cat.porcentaje}%</Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <Ionicons
                          name={cat.velocidad === 'Alta' ? 'flash' : cat.velocidad === 'Media' ? 'trending-up' : 'trending-down'}
                          size={10}
                          color={cat.velocidad === 'Alta' ? '#F59E0B' : cat.velocidad === 'Media' ? '#458EFF' : '#9CA3AF'}
                        />
                        <Text style={{ fontSize: 9, color: '#9CA3AF' }}>Rotación {cat.velocidad}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </Card>

        </View>
      </ScrollView>
    </View>
  );
}

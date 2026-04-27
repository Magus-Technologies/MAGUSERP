import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert, Modal, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { facturacionService }    from '@/src/services/facturacion.service';
import { downloadAndShare }      from '@/src/utils/downloadFile';
import { apiClient }             from '@/src/api/client';
import { useVentas }             from '@/src/hooks/useVentas';
import { VentaCard }             from '@/src/components/cards/VentaCard';
import { SearchBar }             from '@/src/components/ui/SearchBar';
import { FAB }                   from '@/src/components/ui/FAB';
import { LoadingSpinner }        from '@/src/components/ui/LoadingSpinner';
import { EmptyState }            from '@/src/components/ui/EmptyState';
import { Text }                  from '@/src/components/ui/Text';
import { Card }                  from '@/src/components/ui/Card';
import { Input }                 from '@/src/components/ui/Input';
import { Button }                from '@/src/components/ui/Button';
import { Venta }                 from '@/src/types/facturacion.types';
import { ScreenHeader }          from '@/src/components/ui/ScreenHeader';

const ESTADOS = [
  { key: '',           label: 'Todos'     },
  { key: 'PENDIENTE',  label: 'Pendiente' },
  { key: 'FACTURADO',  label: 'Facturado' },
];

interface SendModalState {
  visible:        boolean;
  mode:           'email' | 'whatsapp';
  venta:          Venta | null;
  email:          string;
  telefono:       string;
  puedeEnviar:    boolean;
  razonNoEnviar:  string | null;
  loadingData:    boolean;
  sending:        boolean;
  error:          string;
}

const SEND_MODAL_DEFAULT: SendModalState = {
  visible: false, mode: 'email', venta: null,
  email: '', telefono: '',
  puedeEnviar: true, razonNoEnviar: null,
  loadingData: false, sending: false, error: '',
};

export default function VentasScreen() {
  const router = useRouter();
  const { ventas, search, setSearch, estado, applyEstado, total, loading, loadingMore, error, loadMore, refresh } = useVentas();
  const [sendModal, setSendModal] = useState<SendModalState>(SEND_MODAL_DEFAULT);
  const { bottom } = useSafeAreaInsets();

  const handleEdit = (venta: Venta) => {
    router.push(`/facturacion/editar-venta/${venta.id}` as any);
  };

  const handleFacturar = (venta: Venta) => {
    Alert.alert(
      'Generar Comprobante',
      `¿Deseas generar el comprobante para la venta ${venta.codigo_venta}?`,
      [
        { text: 'Cancelar', onPress: () => {}, style: 'cancel' },
        { 
          text: 'Generar', 
          onPress: async () => {
            try {
              await facturacionService.facturarVenta(venta.id);
              Alert.alert('Éxito', 'Comprobante generado correctamente');
              refresh();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Error al generar comprobante');
            }
          }
        },
      ]
    );
  };

  const handleEnviarSunat = (venta: Venta) => {
    Alert.alert(
      'Enviar a SUNAT',
      `¿Enviar comprobante de la venta ${venta.codigo_venta} a SUNAT?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: async () => {
            try {
              await facturacionService.enviarSunatVenta(venta.id);
              Alert.alert('Éxito', 'Comprobante enviado a SUNAT correctamente');
              refresh();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Error al enviar a SUNAT');
            }
          },
        },
      ]
    );
  };

  const handleConsultarSunat = (venta: Venta) => {
    Alert.alert(
      'Consultar en SUNAT',
      `¿Consultar estado del comprobante ${venta.codigo_venta} en SUNAT?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Consultar',
          onPress: async () => {
            try {
              const res = await facturacionService.consultarSunatVenta(venta.id);
              Alert.alert('Estado SUNAT', res?.data?.mensaje || 'Consulta realizada');
              refresh();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Error al consultar SUNAT');
            }
          },
        },
      ]
    );
  };

  const handleVerFirma = (venta: Venta) => {
    downloadAndShare(`/ventas/${venta.id}/xml`, `venta-${venta.codigo_venta}.xml`, 'application/xml')
      .catch(err => Alert.alert('Error', err.message || 'No se pudo descargar el XML'));
  };

  const handleGenerarPdf = (venta: Venta) => {
    Alert.alert(
      'Generar PDF',
      `¿Generar PDF para la venta ${venta.codigo_venta}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Generar',
          onPress: async () => {
            try {
              await facturacionService.generarPdfVenta(venta.id);
              Alert.alert('Éxito', 'PDF generado. Ahora puedes descargarlo.');
              refresh();
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Error al generar PDF');
            }
          },
        },
      ]
    );
  };

  const handleDescargarPdf = (ventaId: number) => {
    downloadAndShare(`/ventas/${ventaId}/pdf`, `venta-${ventaId}.pdf`, 'application/pdf')
      .catch(err => Alert.alert('Error', err.message || 'No se pudo descargar el PDF'));
  };

  const handleDescargarCdr = (ventaId: number) => {
    downloadAndShare(`/ventas/${ventaId}/cdr`, `cdr-${ventaId}.zip`, 'application/zip')
      .catch(err => Alert.alert('Error', err.message || 'No se pudo descargar el CDR'));
  };

  const openSendModal = async (venta: Venta, mode: 'email' | 'whatsapp') => {
    setSendModal({ ...SEND_MODAL_DEFAULT, visible: true, mode, venta, loadingData: true });
    try {
      const endpoint = mode === 'email' ? 'email-datos' : 'whatsapp-datos';
      const res: any = await apiClient.get(`/ventas/${venta.id}/${endpoint}`);
      const data = res?.data;
      setSendModal(prev => ({
        ...prev,
        loadingData:   false,
        email:         data?.datos_prellenados?.email    ?? '',
        telefono:      data?.datos_prellenados?.telefono ?? '',
        puedeEnviar:   data?.puede_enviar  ?? true,
        razonNoEnviar: data?.razon_no_enviar ?? null,
      }));
    } catch (e: any) {
      setSendModal(prev => ({ ...prev, loadingData: false, error: e.message || 'Error al cargar datos' }));
    }
  };

  const handleEnviarPor = (venta: Venta) => {
    Alert.alert(
      'Enviar comprobante',
      `¿Cómo deseas enviar ${venta.codigo_venta}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Email',    onPress: () => openSendModal(venta, 'email') },
        { text: 'WhatsApp', onPress: () => openSendModal(venta, 'whatsapp') },
      ]
    );
  };

  const handleConfirmSend = async () => {
    const { mode, venta, email, telefono } = sendModal;
    if (!venta) return;
    if (mode === 'email' && !email.trim()) {
      setSendModal(prev => ({ ...prev, error: 'Ingresa un correo electrónico' }));
      return;
    }
    if (mode === 'whatsapp' && !telefono.trim()) {
      setSendModal(prev => ({ ...prev, error: 'Ingresa un número de teléfono' }));
      return;
    }
    setSendModal(prev => ({ ...prev, sending: true, error: '' }));
    try {
      if (mode === 'email') {
        await facturacionService.enviarEmailVenta(venta.id, { email });
        setSendModal(SEND_MODAL_DEFAULT);
        Alert.alert('Éxito', 'Comprobante enviado por email');
      } else {
        const res: any = await facturacionService.enviarWhatsAppVenta(venta.id, { telefono });
        setSendModal(SEND_MODAL_DEFAULT);
        const waUrl: string | undefined = res?.data?.whatsapp_url;
        if (waUrl) {
          await Linking.openURL(waUrl);
        } else {
          Alert.alert('Éxito', 'Comprobante preparado para WhatsApp');
        }
      }
    } catch (e: any) {
      setSendModal(prev => ({ ...prev, sending: false, error: e.message || 'Error al enviar' }));
    }
  };

  const handleAnular = (venta: Venta) => {
    const numeroComprobante = venta.comprobante_info?.numero_completo;
    if (!numeroComprobante) {
      Alert.alert('Sin comprobante', 'Esta venta no tiene comprobante electrónico. No se puede generar nota de crédito.');
      return;
    }
    router.push({
      pathname: '/facturacion/nueva-nota-credito' as any,
      params: { ventaId: String(venta.id) },
    });
  };

  const handleVerDetalle = (venta: Venta) => {
    router.push(`/facturacion/ventas/${venta.id}` as any);
  };

  if (loading) return <LoadingSpinner message="Cargando ventas..." />;

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Ventas"
        subtitle="Facturación"
        onBack={() => router.canGoBack() ? router.back() : router.replace('/(app)')}
        right={<Text variant="caption" className="text-white/60">{total} registros</Text>}
      />

      <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar venta, cliente..." />

      {/* Filtros de estado */}
      <View className="flex-row px-4 pb-2 gap-2">
        {ESTADOS.map(e => (
          <TouchableOpacity
            key={e.key}
            onPress={() => applyEstado(e.key)}
            className={`px-3 py-1.5 rounded-full border ${estado === e.key ? 'bg-azul-oscuro border-azul-oscuro' : 'bg-white border-gray-200'}`}
          >
            <Text variant="caption" className={estado === e.key ? 'text-white' : 'text-gray-600'}>
              {e.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Error */}
      {error && (
        <Card className="mx-4 mb-2 p-3 border border-red-100">
          <View className="flex-row items-center gap-2">
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
            <Text variant="caption" color="error">{error}</Text>
          </View>
        </Card>
      )}

      <FlatList
        data={ventas}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-outline"
            title="Sin ventas"
            message={search ? 'No hay resultados para tu búsqueda' : 'No hay ventas registradas'}
          />
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#458EFF" />
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <VentaCard 
            item={item}
            onPress={() => handleVerDetalle(item)}
            onEdit={handleEdit}
            onFacturar={handleFacturar}
            onEnviarSunat={handleEnviarSunat}
            onVerFirma={handleVerFirma}
            onGenerarPdf={handleGenerarPdf}
            onDescargarPdf={handleDescargarPdf}
            onDescargarCdr={handleDescargarCdr}
            onEnviarPor={handleEnviarPor}
            onConsultarSunat={handleConsultarSunat}
            onAnular={handleAnular}
          />
        )}
      />

      <FAB onPress={() => router.push('/facturacion/nueva-venta' as any)} />

      {/* Modal enviar por email / WhatsApp */}
      <Modal
        visible={sendModal.visible}
        transparent
        animationType="slide"
        onRequestClose={() => setSendModal(SEND_MODAL_DEFAULT)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1 justify-end"
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setSendModal(SEND_MODAL_DEFAULT)}
            className="flex-1 bg-black/30"
          />

          <View className="bg-white rounded-t-3xl px-5 pt-4" style={{ paddingBottom: Math.max(bottom, 16) + 8 }}>
            <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-4" />

            {/* Título */}
            <View className="flex-row items-center mb-5">
              <Ionicons
                name={sendModal.mode === 'email' ? 'mail-outline' : 'logo-whatsapp'}
                size={22}
                color={sendModal.mode === 'email' ? '#458EFF' : '#25D366'}
                style={{ marginRight: 8 }}
              />
              <Text variant="h4" className="flex-1">
                {sendModal.mode === 'email' ? 'Enviar por Email' : 'Enviar por WhatsApp'}
              </Text>
              <TouchableOpacity onPress={() => setSendModal(SEND_MODAL_DEFAULT)} className="w-8 h-8 items-center justify-center">
                <Ionicons name="close" size={22} color="#6b7280" />
              </TouchableOpacity>
            </View>

            {sendModal.loadingData ? (
              <View className="py-8 items-center">
                <ActivityIndicator color="#458EFF" />
                <Text variant="caption" className="mt-2 text-gray-500">Cargando datos...</Text>
              </View>
            ) : (
              <>
                {/* Aviso si no puede enviarse */}
                {!sendModal.puedeEnviar && sendModal.razonNoEnviar && (
                  <Card className="mb-4 p-3 border border-yellow-200 bg-yellow-50">
                    <View className="flex-row items-start gap-2">
                      <Ionicons name="warning-outline" size={16} color="#D97706" style={{ marginTop: 1 }} />
                      <Text variant="caption" className="flex-1 text-yellow-800">{sendModal.razonNoEnviar}</Text>
                    </View>
                  </Card>
                )}

                {sendModal.mode === 'email' ? (
                  <Input
                    label="Correo electrónico"
                    leftIcon="mail-outline"
                    value={sendModal.email}
                    onChangeText={v => setSendModal(prev => ({ ...prev, email: v, error: '' }))}
                    placeholder="cliente@ejemplo.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                ) : (
                  <Input
                    label="Número de WhatsApp"
                    leftIcon="logo-whatsapp"
                    value={sendModal.telefono}
                    onChangeText={v => setSendModal(prev => ({ ...prev, telefono: v, error: '' }))}
                    placeholder="+51 999 999 999"
                    keyboardType="phone-pad"
                  />
                )}

                {sendModal.error ? (
                  <Text variant="caption" color="error" className="mb-3 -mt-2">{sendModal.error}</Text>
                ) : null}

                <Button
                  onPress={handleConfirmSend}
                  loading={sendModal.sending}
                  disabled={!sendModal.puedeEnviar}
                  fullWidth
                >
                  {sendModal.mode === 'email' ? 'Enviar Email' : 'Enviar WhatsApp'}
                </Button>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

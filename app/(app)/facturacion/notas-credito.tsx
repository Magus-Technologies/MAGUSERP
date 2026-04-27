import React, { useState } from 'react';
import {
  View, FlatList, TouchableOpacity, ActivityIndicator,
  RefreshControl, Modal, TextInput, ScrollView, Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNotasCredito, NotaCredito } from '@/src/hooks/useNotasCredito';
import { NotaCard, NotaCardAction } from '@/src/components/cards/NotaCard';
import { facturacionService } from '@/src/services/facturacion.service';
import { SearchBar } from '@/src/components/ui/SearchBar';
import { FAB } from '@/src/components/ui/FAB';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { EmptyState } from '@/src/components/ui/EmptyState';
import { Text } from '@/src/components/ui/Text';
import { Card } from '@/src/components/ui/Card';
import { Button } from '@/src/components/ui/Button';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';
import { StatusModal } from '@/src/components/ui/StatusModal';

const ESTADOS = [
  { key: '',          label: 'Todos'     },
  { key: 'pendiente', label: 'Pendiente' },
  { key: 'generado',  label: 'Generado'  },
  { key: 'aceptado',  label: 'Aceptado'  },
  { key: 'rechazado', label: 'Rechazado' },
  { key: 'anulado',   label: 'Anulado'   },
];

export default function NotasCreditoScreen() {
  const router = useRouter();
  const { bottom } = useSafeAreaInsets();
  const { notas, search, setSearch, estado, applyEstado, total, loading, loadingMore, error, loadMore, refresh } = useNotasCredito();

  const [status, setStatus] = useState<{ visible: boolean; type: 'success' | 'error'; title: string; message: string }>({
    visible: false, type: 'success', title: '', message: '',
  });
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sendModal, setSendModal] = useState<{
    visible: boolean; type: 'email' | 'whatsapp'; notaId: number; value: string;
  }>({ visible: false, type: 'email', notaId: 0, value: '' });

  const handleAction = async (key: string, notaId: number, fn: () => Promise<any>, successMsg: string) => {
    setBusyId(`${notaId}-${key}`);
    try {
      await fn();
      setStatus({ visible: true, type: 'success', title: 'Listo', message: successMsg });
      refresh();
    } catch (e: any) {
      setStatus({ visible: true, type: 'error', title: 'Error', message: e.message || 'Ocurrió un error' });
    } finally {
      setBusyId(null);
    }
  };

  const handleConfirmSend = async () => {
    const { type, notaId, value } = sendModal;
    setSendModal(prev => ({ ...prev, visible: false }));

    if (type === 'email') {
      await handleAction('email', notaId,
        () => facturacionService.enviarEmailNota(notaId, { email: value }),
        'Email enviado correctamente',
      );
    } else {
      setBusyId(`${notaId}-whatsapp`);
      try {
        const res: any = await facturacionService.enviarWhatsAppNota(notaId, { telefono: value });
        if (res?.data?.whatsapp_url) {
          await Linking.openURL(res.data.whatsapp_url);
        }
        setStatus({ visible: true, type: 'success', title: 'Listo', message: 'Enlace de WhatsApp abierto' });
        refresh();
      } catch (e: any) {
        setStatus({ visible: true, type: 'error', title: 'Error', message: e.message || 'Ocurrió un error' });
      } finally {
        setBusyId(null);
      }
    }
  };

  const getActions = (nota: NotaCredito): NotaCardAction[] => {
    const busy = (k: string) => busyId === `${nota.id}-${k}`;
    const actions: NotaCardAction[] = [];

    if (nota.estado === 'pendiente') {
      actions.push({
        icon: 'document-text-outline', label: 'Generar XML', loading: busy('xml'),
        onPress: () => handleAction('xml', nota.id, () => facturacionService.generarXmlNota(nota.id), 'XML generado correctamente'),
      });
    }

    if (nota.estado === 'generado') {
      actions.push({
        icon: 'cloud-upload-outline', label: 'Enviar SUNAT', loading: busy('sunat'),
        onPress: () => handleAction('sunat', nota.id, () => facturacionService.enviarSunatNota(nota.id), 'Enviado a SUNAT correctamente'),
      });
    }

    if (nota.estado === 'rechazado') {
      actions.push({
        icon: 'cloud-upload-outline', label: 'Reenviar', loading: busy('sunat'),
        onPress: () => handleAction('sunat', nota.id, () => facturacionService.enviarSunatNota(nota.id), 'Reenviado a SUNAT'),
      });
    }

    if (nota.xml) {
      actions.push({
        icon: 'search-outline', label: 'Consultar', loading: busy('consultar'),
        onPress: () => handleAction('consultar', nota.id, () => facturacionService.consultarSunatNota(nota.id), 'Consulta realizada'),
      });
    }

    if (nota.estado === 'aceptado') {
      actions.push(
        {
          icon: 'mail-outline', label: 'Email', loading: busy('email'),
          onPress: () => setSendModal({ visible: true, type: 'email', notaId: nota.id, value: '' }),
        },
        {
          icon: 'logo-whatsapp', label: 'WhatsApp', color: '#25D366', loading: busy('whatsapp'),
          onPress: () => setSendModal({ visible: true, type: 'whatsapp', notaId: nota.id, value: '' }),
        },
      );
    }

    return actions;
  };

  if (loading) return <LoadingSpinner message="Cargando notas de crédito..." />;

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Notas de Crédito"
        subtitle="Facturación"
        onBack={() => router.canGoBack() ? router.back() : router.replace('/(app)')}
        right={<Text variant="caption" className="text-white/60">{total} registros</Text>}
      />

      <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar nota, cliente..." />

      {/* Filtros de estado */}
      <View className="mb-2">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
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
        </ScrollView>
      </View>

      {error && (
        <Card className="mx-4 mb-2 p-3 border border-red-100">
          <View className="flex-row items-center gap-2">
            <Ionicons name="alert-circle-outline" size={16} color="#EF4444" />
            <Text variant="caption" color="error">{error}</Text>
          </View>
        </Card>
      )}

      <FlatList
        data={notas.map(n => ({ ...n, tipo: 'credito' as const }))}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListEmptyComponent={
          <EmptyState
            icon="document-outline"
            title="Sin notas de crédito"
            message={search ? 'No hay resultados para tu búsqueda' : 'No hay notas de crédito registradas'}
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
          <NotaCard item={item} actions={getActions(item)} />
        )}
      />

      <FAB onPress={() => router.push('/facturacion/nueva-nota-credito' as any)} />

      {/* Modal Email / WhatsApp */}
      <Modal
        visible={sendModal.visible}
        transparent
        animationType="fade"
        onRequestClose={() => setSendModal(prev => ({ ...prev, visible: false }))}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-2xl p-6" style={{ paddingBottom: Math.max(bottom, 16) + 8 }}>
            <Text variant="h4" className="font-bold mb-4">
              {sendModal.type === 'email' ? 'Enviar por Email' : 'Enviar por WhatsApp'}
            </Text>
            <Text variant="caption" className="text-gray-500 mb-2">
              {sendModal.type === 'email' ? 'Email del cliente' : 'Teléfono (con código de país, ej: +51999...)'}
            </Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-3 py-3 mb-4"
              placeholder={sendModal.type === 'email' ? 'ejemplo@correo.com' : '+51 999 999 999'}
              value={sendModal.value}
              onChangeText={v => setSendModal(prev => ({ ...prev, value: v }))}
              keyboardType={sendModal.type === 'email' ? 'email-address' : 'phone-pad'}
              autoCapitalize="none"
            />
            <View className="flex-row gap-3">
              <Button
                variant="secondary"
                onPress={() => setSendModal(prev => ({ ...prev, visible: false }))}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                onPress={handleConfirmSend}
                disabled={!sendModal.value.trim()}
                className="flex-1"
              >
                Enviar
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      <StatusModal
        visible={status.visible}
        type={status.type}
        title={status.title}
        message={status.message}
        onClose={() => setStatus(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
}

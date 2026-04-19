import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useMarcas }      from '@/src/hooks/useMarcas';
import { Marca }          from '@/src/types/almacen.types';
import { SearchBar }      from '@/src/components/ui/SearchBar';
import { FAB }            from '@/src/components/ui/FAB';
import { RowItem }        from '@/src/components/ui/RowItem';
import { ConfirmModal }   from '@/src/components/ui/ConfirmModal';
import { FormModal }      from '@/src/components/ui/FormModal';
import { Card }           from '@/src/components/ui/Card';
import { Input }          from '@/src/components/ui/Input';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { EmptyState }     from '@/src/components/ui/EmptyState';
import { Text }           from '@/src/components/ui/Text';

export default function MarcasScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { marcas, filtered, search, setSearch, loading, saving, deleting, create, update, remove } = useMarcas();

  const [formVisible,    setFormVisible]    = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selected,       setSelected]       = useState<Marca | null>(null);
  const [nombre,         setNombre]         = useState('');
  const [descripcion,    setDescripcion]    = useState('');
  const [formError,      setFormError]      = useState('');

  const openCreate = () => {
    setSelected(null); setNombre(''); setDescripcion(''); setFormError('');
    setFormVisible(true);
  };

  const openEdit = (item: Marca) => {
    setSelected(item); setNombre(item.nombre); setDescripcion(item.descripcion ?? ''); setFormError('');
    setFormVisible(true);
  };

  const openDelete = (item: Marca) => { setSelected(item); setConfirmVisible(true); };

  const handleSave = async () => {
    if (!nombre.trim()) { setFormError('El nombre es requerido'); return; }
    try {
      const payload = { nombre: nombre.trim(), descripcion: descripcion.trim() || null };
      if (selected) { await update(selected.id, payload.nombre, payload.descripcion); }
      else          { await create(payload.nombre, payload.descripcion); }
      setFormVisible(false);
    } catch (e: any) {
      setFormError(e.message ?? 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    await remove(selected.id);
    setConfirmVisible(false);
  };

  if (loading) return <LoadingSpinner message="Cargando marcas..." />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-azul-oscuro px-4 pt-14 pb-5 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.openDrawer()} className="mr-3">
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text variant="caption" className="text-white/60">Almacén</Text>
          <Text variant="h4" color="white">Marcas</Text>
        </View>
        <Text variant="caption" className="text-white/60">{marcas.length} registros</Text>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar marca..." />

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListEmptyComponent={
          <EmptyState
            icon="ribbon-outline"
            title="Sin marcas"
            message={search ? 'No hay resultados para tu búsqueda' : 'Crea la primera marca'}
          />
        }
        renderItem={({ item, index }) => (
          <Card className="px-4 py-0 mb-0">
            <RowItem
              title={item.nombre}
              subtitle={item.descripcion ?? undefined}
              icon="ribbon-outline"
              iconColor="#FF9F29"
              onEdit={() => openEdit(item)}
              onDelete={() => openDelete(item)}
              last={index === filtered.length - 1}
            />
          </Card>
        )}
      />

      <FAB onPress={openCreate} />

      <FormModal
        visible={formVisible}
        title={selected ? 'Editar Marca' : 'Nueva Marca'}
        onClose={() => setFormVisible(false)}
        onSave={handleSave}
        loading={saving}
      >
        <Input
          label="Nombre *"
          value={nombre}
          onChangeText={t => { setNombre(t); setFormError(''); }}
          placeholder="Ej: Samsung"
          leftIcon="ribbon-outline"
        />
        <Input
          label="Descripción"
          value={descripcion}
          onChangeText={setDescripcion}
          placeholder="Descripción opcional"
          leftIcon="document-text-outline"
          multiline
        />
        {formError ? <Text variant="caption" color="error" className="mb-3">{formError}</Text> : null}
      </FormModal>

      <ConfirmModal
        visible={confirmVisible}
        title="Eliminar Marca"
        message={`¿Estás seguro de eliminar "${selected?.nombre}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
        loading={deleting}
      />
    </View>
  );
}

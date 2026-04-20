import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useMarcas }      from '@/src/hooks/useMarcas';
import { Marca }          from '@/src/types/almacen.types';
import { SearchBar }      from '@/src/components/ui/SearchBar';
import { FAB }            from '@/src/components/ui/FAB';
import { EntityCard }     from '@/src/components/cards/EntityCard';
import { ActionModal }    from '@/src/components/ui/ActionModal';
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
  const [activo,         setActivo]         = useState(true);
  const [formError,      setFormError]      = useState('');
  const [deleteError,    setDeleteError]    = useState('');

  const openCreate = () => {
    setSelected(null); setNombre(''); setDescripcion(''); setActivo(true); setFormError('');
    setFormVisible(true);
  };

  const openEdit = (item: Marca) => {
    setSelected(item); setNombre(item.nombre); setDescripcion(item.descripcion ?? '');
    setActivo(item.activo ?? true); setFormError('');
    setFormVisible(true);
  };

  const openDelete = (item: Marca) => { setSelected(item); setDeleteError(''); setConfirmVisible(true); };

  const handleSave = async () => {
    if (!nombre.trim()) { setFormError('El nombre es requerido'); return; }
    try {
      if (selected) { await update(selected.id, nombre.trim(), descripcion.trim() || null, activo); }
      else          { await create(nombre.trim(), descripcion.trim() || null, activo); }
      setFormVisible(false);
    } catch (e: any) {
      setFormError(e.message ?? 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    try {
      await remove(selected.id);
      setConfirmVisible(false);
    } catch (e: any) {
      setDeleteError(e.message ?? 'No se puede eliminar');
    }
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
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 80 }}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={
          <EmptyState
            icon="ribbon-outline"
            title="Sin marcas"
            message={search ? 'No hay resultados para tu búsqueda' : 'Crea la primera marca'}
          />
        }
        renderItem={({ item }) => (
          <EntityCard
            title={item.nombre}
            subtitle={item.descripcion}
            icon="ribbon-outline"
            iconColor="#FF9F29"
            active={item.activo}
            imagen={item.imagen_url || item.imagen}
            onEdit={() => openEdit(item)}
            onDelete={() => openDelete(item)}
          />
        )}
      />

      <FAB onPress={openCreate} />

      <ActionModal
        visible={formVisible}
        action={selected ? 'edit' : 'create'}
        title={selected ? 'Editar Marca' : 'Nueva Marca'}
        onConfirm={handleSave}
        onCancel={() => setFormVisible(false)}
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

        <TouchableOpacity
          onPress={() => setActivo(!activo)}
          className="flex-row items-center gap-2 mb-4"
        >
          <View className={`w-5 h-5 rounded border-2 items-center justify-center ${activo ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
            {activo && <Ionicons name="checkmark" size={12} color="#fff" />}
          </View>
          <Text variant="bodySmall">Activo</Text>
        </TouchableOpacity>

        {formError ? <Text variant="caption" color="error" className="mb-3">{formError}</Text> : null}
      </ActionModal>

      <ActionModal
        visible={confirmVisible}
        action="delete"
        title="Eliminar Marca"
        message={`¿Estás seguro de eliminar "${selected?.nombre}"?`}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
        loading={deleting}
      />
    </View>
  );
}

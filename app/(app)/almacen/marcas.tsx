import { useRouter } from 'expo-router';
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
import { ImagePickerComponent } from '@/src/components/ui/ImagePicker';
import { ScreenHeader }   from '@/src/components/ui/ScreenHeader';

export default function MarcasScreen() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { marcas, filtered, search, setSearch, loading, saving, deleting, create, update, remove } = useMarcas();

  const [formVisible,    setFormVisible]    = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selected,       setSelected]       = useState<Marca | null>(null);
  const [nombre,         setNombre]         = useState('');
  const [imagen,         setImagen]         = useState('');
  const [descripcion,    setDescripcion]    = useState('');
  const [activo,         setActivo]         = useState(true);
  const [formError,      setFormError]      = useState('');
  const [deleteError,    setDeleteError]    = useState('');

  const openCreate = () => {
    setSelected(null); setNombre(''); setDescripcion(''); setImagen(''); setActivo(true); setFormError('');
    setFormVisible(true);
  };

  const openEdit = (item: Marca) => {
    setSelected(item); setNombre(item.nombre); setDescripcion(item.descripcion ?? '');
    setImagen(item.imagen_url || item.imagen || '');
    setActivo(item.activo ?? true); setFormError('');
    setFormVisible(true);
  };

  const openDelete = (item: Marca) => { setSelected(item); setDeleteError(''); setConfirmVisible(true); };

  const handleSave = async () => {
    if (!nombre.trim()) { setFormError('El nombre es requerido'); return; }
    try {
      const imgVal = imagen.trim() || null;
      if (selected) { await update(selected.id, nombre.trim(), descripcion.trim() || null, activo, imgVal); }
      else          { await create(nombre.trim(), descripcion.trim() || null, activo, imgVal); }
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
      <ScreenHeader
        title="Marcas"
        subtitle="Almacén"
        onBack={() => router.canGoBack() ? router.back() : router.replace('/(app)')}
        right={<Text variant="caption" className="text-white/60">{marcas.length} registros</Text>}
      />

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

        <ImagePickerComponent
          label="Imagen de la Marca"
          imageUri={imagen}
          onImagePicked={v => setImagen(v || '')}
        />

        <Input
          label="O usar URL de Imagen"
          value={imagen && !imagen.startsWith('file') ? imagen : ''}
          onChangeText={setImagen}
          placeholder="https://ejemplo.com/logo.png"
          leftIcon="link-outline"
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

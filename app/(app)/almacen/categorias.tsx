import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useCategorias }  from '@/src/hooks/useCategorias';
import { useSecciones }   from '@/src/hooks/useSecciones';
import { Categoria }      from '@/src/types/almacen.types';
import { SearchBar }      from '@/src/components/ui/SearchBar';
import { FAB }            from '@/src/components/ui/FAB';
import { EntityCard }     from '@/src/components/cards/EntityCard';
import { ActionModal }    from '@/src/components/ui/ActionModal';
import { Input }          from '@/src/components/ui/Input';
import { LoadingSpinner } from '@/src/components/ui/LoadingSpinner';
import { EmptyState }     from '@/src/components/ui/EmptyState';
import { Text }           from '@/src/components/ui/Text';
import { SelectGroup }    from '@/src/components/ui/SelectGroup';
import { ImagePickerComponent } from '@/src/components/ui/ImagePicker';

export default function CategoriasScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const { categorias, filtered, search, setSearch, loading, saving, deleting, create, update, remove } = useCategorias();
  const { secciones } = useSecciones();

  const [formVisible,     setFormVisible]     = useState(false);
  const [confirmVisible,  setConfirmVisible]  = useState(false);
  const [selected,        setSelected]        = useState<Categoria | null>(null);
  const [nombre,          setNombre]          = useState('');
  const [imagen,          setImagen]          = useState('');
  const [descripcion,     setDescripcion]     = useState('');
  const [idSeccion,       setIdSeccion]       = useState<number>(1);
  const [activo,          setActivo]          = useState(true);
  const [formError,       setFormError]       = useState('');
  const [deleteError,     setDeleteError]     = useState('');

  const openCreate = () => {
    setSelected(null); setNombre(''); setDescripcion(''); setImagen(''); setIdSeccion(secciones[0]?.id ?? 1); setActivo(true); setFormError('');
    setFormVisible(true);
  };

  const openEdit = (item: Categoria) => {
    setSelected(item); setNombre(item.nombre); setDescripcion(item.descripcion ?? ''); setImagen(item.imagen ?? '');
    setIdSeccion(item.id_seccion ?? 1); setActivo(item.activo ?? true); setFormError('');
    setFormVisible(true);
  };

  const openDelete = (item: Categoria) => { setSelected(item); setDeleteError(''); setConfirmVisible(true); };

  const handleSave = async () => {
    if (!nombre.trim()) { setFormError('El nombre es requerido'); return; }
    if (!idSeccion) { setFormError('La sección es requerida'); return; }
    try {
      const imgVal = imagen.trim() || null;
      if (selected) { await update(selected.id, nombre.trim(), descripcion.trim() || null, idSeccion, activo, imgVal); }
      else          { await create(nombre.trim(), descripcion.trim() || null, idSeccion, activo, imgVal); }
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

  if (loading) return <LoadingSpinner message="Cargando categorías..." />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-azul-oscuro px-4 pt-14 pb-5 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.openDrawer()} className="mr-3">
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text variant="caption" className="text-white/60">Almacén</Text>
          <Text variant="h4" color="white">Categorías</Text>
        </View>
        <Text variant="caption" className="text-white/60">{categorias.length} registros</Text>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar categoría..." />

      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 80 }}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16 }}
        ListEmptyComponent={
          <EmptyState
            icon="grid-outline"
            title="Sin categorías"
            message={search ? 'No hay resultados para tu búsqueda' : 'Crea la primera categoría'}
          />
        }
        renderItem={({ item }) => (
          <EntityCard
            title={item.nombre}
            subtitle={item.descripcion}
            icon="grid-outline"
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
        title={selected ? 'Editar Categoría' : 'Nueva Categoría'}
        onConfirm={handleSave}
        onCancel={() => setFormVisible(false)}
        loading={saving}
      >
        <Input
          label="Nombre *"
          value={nombre}
          onChangeText={t => { setNombre(t); setFormError(''); }}
          placeholder="Ej: Electrónica"
          leftIcon="grid-outline"
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
          label="Imagen de la Categoría"
          imageUri={imagen}
          onImagePicked={v => setImagen(v || '')}
        />

        <Input
          label="O usar URL de Imagen"
          value={imagen && !imagen.startsWith('file') ? imagen : ''}
          onChangeText={setImagen}
          placeholder="https://ejemplo.com/categoria.png"
          leftIcon="link-outline"
        />

        <SelectGroup
          label="Sección"
          options={secciones}
          selectedId={idSeccion}
          onSelect={setIdSeccion}
          required
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
        title="Eliminar Categoría"
        message={`¿Estás seguro de eliminar "${selected?.nombre}"?`}
        error={deleteError}
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
        loading={deleting}
      />
    </View>
  );
}

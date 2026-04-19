import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { categoriaService }  from '@/src/services/categoria.service';
import { Categoria }         from '@/src/types/almacen.types';
import { SearchBar }         from '@/src/components/ui/SearchBar';
import { FAB }               from '@/src/components/ui/FAB';
import { RowItem }           from '@/src/components/ui/RowItem';
import { ConfirmModal }      from '@/src/components/ui/ConfirmModal';
import { FormModal }         from '@/src/components/ui/FormModal';
import { Card }              from '@/src/components/ui/Card';
import { Input }             from '@/src/components/ui/Input';
import { LoadingSpinner }    from '@/src/components/ui/LoadingSpinner';
import { EmptyState }        from '@/src/components/ui/EmptyState';
import { Text }              from '@/src/components/ui/Text';

export default function CategoriasScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const [categorias,   setCategorias]   = useState<Categoria[]>([]);
  const [filtered,     setFiltered]     = useState<Categoria[]>([]);
  const [search,       setSearch]       = useState('');
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(false);

  const [formVisible,  setFormVisible]  = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selected,     setSelected]     = useState<Categoria | null>(null);

  const [nombre,       setNombre]       = useState('');
  const [descripcion,  setDescripcion]  = useState('');
  const [formError,    setFormError]    = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await categoriaService.getAll();
      const list = Array.isArray(data) ? data : (data as any).data ?? [];
      setCategorias(list);
      setFiltered(list);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? categorias.filter(c => c.nombre.toLowerCase().includes(q)) : categorias);
  }, [search, categorias]);

  const openCreate = () => {
    setSelected(null);
    setNombre('');
    setDescripcion('');
    setFormError('');
    setFormVisible(true);
  };

  const openEdit = (item: Categoria) => {
    setSelected(item);
    setNombre(item.nombre);
    setDescripcion(item.descripcion ?? '');
    setFormError('');
    setFormVisible(true);
  };

  const openDelete = (item: Categoria) => {
    setSelected(item);
    setConfirmVisible(true);
  };

  const handleSave = async () => {
    if (!nombre.trim()) { setFormError('El nombre es requerido'); return; }
    setSaving(true);
    try {
      const payload = { nombre: nombre.trim(), descripcion: descripcion.trim() || null };
      if (selected) {
        await categoriaService.update(selected.id, payload);
      } else {
        await categoriaService.create(payload);
      }
      setFormVisible(false);
      await load();
    } catch (e: any) {
      setFormError(e.message ?? 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setDeleting(true);
    try {
      await categoriaService.delete(selected.id);
      setConfirmVisible(false);
      await load();
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Cargando categorías..." />;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
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
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListEmptyComponent={
          <EmptyState
            icon="grid-outline"
            title="Sin categorías"
            message={search ? 'No hay resultados para tu búsqueda' : 'Crea la primera categoría'}
          />
        }
        renderItem={({ item, index }) => (
          <Card className="px-4 py-0 mb-0">
            <RowItem
              title={item.nombre}
              subtitle={item.descripcion ?? undefined}
              icon="grid-outline"
              onEdit={() => openEdit(item)}
              onDelete={() => openDelete(item)}
              last={index === filtered.length - 1}
            />
          </Card>
        )}
        ItemSeparatorComponent={() => null}
      />

      <FAB onPress={openCreate} />

      {/* Form Modal */}
      <FormModal
        visible={formVisible}
        title={selected ? 'Editar Categoría' : 'Nueva Categoría'}
        onClose={() => setFormVisible(false)}
        onSave={handleSave}
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
        {formError ? <Text variant="caption" color="error" className="mb-3">{formError}</Text> : null}
      </FormModal>

      {/* Confirm Delete */}
      <ConfirmModal
        visible={confirmVisible}
        title="Eliminar Categoría"
        message={`¿Estás seguro de eliminar "${selected?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
        loading={deleting}
      />
    </View>
  );
}

import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useProductos }    from '@/src/hooks/useProductos';
import { useProductoForm } from '@/src/hooks/useProductoForm';
import { useCategorias }   from '@/src/hooks/useCategorias';
import { useMarcas }       from '@/src/hooks/useMarcas';
import { Producto }        from '@/src/types/almacen.types';
import { SearchBar }       from '@/src/components/ui/SearchBar';
import { FAB }             from '@/src/components/ui/FAB';
import { ActionModal }     from '@/src/components/ui/ActionModal';
import { Input }           from '@/src/components/ui/Input';
import { LoadingSpinner }  from '@/src/components/ui/LoadingSpinner';
import { EmptyState }      from '@/src/components/ui/EmptyState';
import { Text }            from '@/src/components/ui/Text';
import { ProductoCard }    from '@/src/components/cards/ProductoCard';
import { SelectGroup }     from '@/src/components/ui/SelectGroup';
import { SearchableSelect } from '@/src/components/ui/SearchableSelect';
import { ImagePickerComponent } from '@/src/components/ui/ImagePicker';
import { StatusModal }  from '@/src/components/ui/StatusModal';
import { ScreenHeader } from '@/src/components/ui/ScreenHeader';

export default function ProductosScreen() {
  const router = useRouter();
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const list = useProductos();
  const { categorias } = useCategorias();
  const { marcas }     = useMarcas();
  const form = useProductoForm(list.refresh);

  const [formVisible,    setFormVisible]    = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toDelete,       setToDelete]       = useState<Producto | null>(null);
  
  const [status, setStatus] = useState<{ visible: boolean; type: 'success' | 'error'; title: string; message: string }>({
    visible: false, type: 'success', title: '', message: ''
  });

  const openCreate = () => { form.open(); setFormVisible(true); };
  const openEdit   = (p: Producto) => { form.open(p); setFormVisible(true); };
  const openDelete = (p: Producto) => { setToDelete(p); setConfirmVisible(true); };

  const handleSave = async () => {
    const isEdit = !!form.editing;
    const ok = await form.save();
    if (ok) {
      setFormVisible(false);
      setStatus({
        visible: true,
        type: 'success',
        title: isEdit ? 'Producto Actualizado' : 'Producto Creado',
        message: `El producto se ha ${isEdit ? 'actualizado' : 'creado'} exitosamente.`
      });
    } else {
      // Si hay error en el form, useProductoForm ya maneja form.error
    }
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    try {
      await list.remove(toDelete.id);
      setConfirmVisible(false);
      setStatus({
        visible: true,
        type: 'success',
        title: 'Producto Eliminado',
        message: 'El producto ha sido eliminado del almacén.'
      });
    } catch (e: any) {
      setStatus({
        visible: true,
        type: 'error',
        title: 'Error al eliminar',
        message: e.message ?? 'No se pudo eliminar el producto.'
      });
    }
  };

  if (list.loading) return <LoadingSpinner message="Cargando productos..." />;

  return (
    <View className="flex-1 bg-gray-50">
      <ScreenHeader
        title="Productos"
        subtitle="Almacén"
        onBack={() => router.canGoBack() ? router.back() : router.replace('/(app)')}
        right={<Text variant="caption" className="text-white/60">{list.total} registros</Text>}
      />

      <SearchBar value={list.search} onChangeText={list.setSearch} placeholder="Buscar producto..." />

      <FlatList
        data={list.productos}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 80 }}
        onEndReached={list.loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={list.loadingMore ? <LoadingSpinner message="" /> : null}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="Sin productos"
            message={list.search ? 'No hay resultados para tu búsqueda' : 'Crea el primer producto'}
          />
        }
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <ProductoCard item={item} onEdit={openEdit} onDelete={openDelete} />
        )}
      />

      <FAB onPress={openCreate} />

      <ActionModal
        visible={formVisible}
        action={form.editing ? 'edit' : 'create'}
        title={form.editing ? 'Editar Producto' : 'Nuevo Producto'}
        onConfirm={handleSave}
        onCancel={() => setFormVisible(false)}
        loading={form.saving}
      >
        <Input
          label="Nombre *"
          value={form.form.nombre}
          onChangeText={v => form.setField('nombre', v)}
          placeholder="Nombre del producto"
          leftIcon="cube-outline"
        />
        <Input
          label="Código *"
          value={form.form.codigo_producto}
          onChangeText={v => form.setField('codigo_producto', v)}
          placeholder="Ej: PROD-001"
          leftIcon="barcode-outline"
        />
        <Input
          label="Precio de venta *"
          value={form.form.precio_venta ? String(form.form.precio_venta) : ''}
          onChangeText={v => form.setField('precio_venta', v)}
          placeholder="0.00"
          leftIcon="cash-outline"
          keyboardType="decimal-pad"
        />
        <Input
          label="Precio de compra"
          value={form.form.precio_compra ? String(form.form.precio_compra) : ''}
          onChangeText={v => form.setField('precio_compra', v)}
          placeholder="0.00"
          leftIcon="cart-outline"
          keyboardType="decimal-pad"
        />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Stock"
              value={String(form.form.stock)}
              onChangeText={v => form.setField('stock', v)}
              placeholder="0"
              keyboardType="number-pad"
            />
          </View>
          <View className="flex-1">
            <Input
              label="Stock mínimo"
              value={String(form.form.stock_minimo)}
              onChangeText={v => form.setField('stock_minimo', v)}
              placeholder="5"
              keyboardType="number-pad"
            />
          </View>
        </View>

        <SearchableSelect
          label="Categoría"
          options={categorias}
          selectedId={form.form.categoria_id}
          onSelect={id => form.setField('categoria_id', id)}
          placeholder="Seleccionar categoría..."
          required
        />

        <SearchableSelect
          label="Marca"
          options={marcas}
          selectedId={form.form.marca_id}
          onSelect={id => form.setField('marca_id', id)}
          placeholder="Seleccionar marca..."
          allowNull
          nullLabel="Sin marca"
        />

        <ImagePickerComponent
          label="Imagen del Producto"
          imageUri={form.form.imagen || null}
          onImagePicked={v => form.setField('imagen', v)}
        />

        <Input
          label="Descripción"
          value={form.form.descripcion ?? ''}
          onChangeText={v => form.setField('descripcion', v || null)}
          placeholder="Descripción opcional"
          leftIcon="document-text-outline"
          multiline
          numberOfLines={4}
          style={{ height: 100, textAlignVertical: 'top', paddingTop: 10 }}
        />

        <Input
          label="O usar URL de Imagen"
          value={form.form.imagen && !form.form.imagen.startsWith('file') ? form.form.imagen : ''}
          onChangeText={v => form.setField('imagen', v || null)}
          placeholder="https://ejemplo.com/producto.png"
          leftIcon="link-outline"
        />

        <View className="flex-row gap-4 mt-2 mb-4">
          <TouchableOpacity
            onPress={() => form.setField('activo', !form.form.activo)}
            className="flex-row items-center gap-2"
          >
            <View className={`w-5 h-5 rounded border-2 items-center justify-center ${form.form.activo ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
              {form.form.activo && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text variant="bodySmall">Activo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => form.setField('destacado', !form.form.destacado)}
            className="flex-row items-center gap-2"
          >
            <View className={`w-5 h-5 rounded border-2 items-center justify-center ${form.form.destacado ? 'bg-orange-500 border-orange-500' : 'border-gray-300'}`}>
              {form.form.destacado && <Ionicons name="star" size={12} color="#fff" />}
            </View>
            <Text variant="bodySmall">Destacado</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => form.setField('mostrar_igv', !form.form.mostrar_igv)}
            className="flex-row items-center gap-2"
          >
            <View className={`w-5 h-5 rounded border-2 items-center justify-center ${form.form.mostrar_igv ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
              {form.form.mostrar_igv && <Ionicons name="checkmark" size={12} color="#fff" />}
            </View>
            <Text variant="bodySmall">Mostrar IGV</Text>
          </TouchableOpacity>
        </View>

        {form.error ? <Text variant="caption" color="error" className="mb-3">{form.error}</Text> : null}
      </ActionModal>

      <ActionModal
        visible={confirmVisible}
        action="delete"
        title="Eliminar Producto"
        message={`¿Estás seguro de eliminar "${toDelete?.nombre}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
        loading={list.deleting}
      />

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

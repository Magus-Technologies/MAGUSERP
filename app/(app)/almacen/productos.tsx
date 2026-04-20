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

export default function ProductosScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const list = useProductos();
  const { categorias } = useCategorias();
  const { marcas }     = useMarcas();
  const form = useProductoForm(list.refresh);

  const [formVisible,    setFormVisible]    = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [toDelete,       setToDelete]       = useState<Producto | null>(null);

  const openCreate = () => { form.open(); setFormVisible(true); };
  const openEdit   = (p: Producto) => { form.open(p); setFormVisible(true); };
  const openDelete = (p: Producto) => { setToDelete(p); setConfirmVisible(true); };

  const handleSave = async () => {
    const ok = await form.save();
    if (ok) setFormVisible(false);
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await list.remove(toDelete.id);
    setConfirmVisible(false);
  };

  if (list.loading) return <LoadingSpinner message="Cargando productos..." />;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="bg-azul-oscuro px-4 pt-10 pb-3 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.openDrawer()} className="mr-3">
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text variant="caption" className="text-white/60">Almacén</Text>
          <Text variant="h4" color="white">Productos</Text>
        </View>
        <Text variant="caption" className="text-white/60">{list.total} registros</Text>
      </View>

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

        <SelectGroup
          label="Categoría"
          options={categorias}
          selectedId={form.form.categoria_id}
          onSelect={id => form.setField('categoria_id', id)}
          required
        />

        <SelectGroup
          label="Marca"
          options={marcas}
          selectedId={form.form.marca_id}
          onSelect={id => form.setField('marca_id', id)}
          allowNull
          nullLabel="Sin marca"
        />

        <Input
          label="Descripción"
          value={form.form.descripcion ?? ''}
          onChangeText={v => form.setField('descripcion', v || null)}
          placeholder="Descripción opcional"
          leftIcon="document-text-outline"
          multiline
        />

        <TouchableOpacity
          onPress={() => form.setField('activo', !form.form.activo)}
          className="flex-row items-center gap-2 mt-2 mb-4"
        >
          <View className={`w-5 h-5 rounded border-2 items-center justify-center ${form.form.activo ? 'bg-primary-500 border-primary-500' : 'border-gray-300'}`}>
            {form.form.activo && <Ionicons name="checkmark" size={12} color="#fff" />}
          </View>
          <Text variant="bodySmall">Activo</Text>
        </TouchableOpacity>

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
    </View>
  );
}

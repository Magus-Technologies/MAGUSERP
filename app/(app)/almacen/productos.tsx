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
import { ConfirmModal }    from '@/src/components/ui/ConfirmModal';
import { FormModal }       from '@/src/components/ui/FormModal';
import { Input }           from '@/src/components/ui/Input';
import { LoadingSpinner }  from '@/src/components/ui/LoadingSpinner';
import { EmptyState }      from '@/src/components/ui/EmptyState';
import { Text }            from '@/src/components/ui/Text';
import { ProductoCard }    from '@/src/components/cards/ProductoCard';

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
      <View className="bg-azul-oscuro px-4 pt-14 pb-5 flex-row items-center">
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

      <FormModal
        visible={formVisible}
        title={form.editing ? 'Editar Producto' : 'Nuevo Producto'}
        onClose={() => setFormVisible(false)}
        onSave={handleSave}
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
          label="Precio de venta *"
          value={form.form.precio ? String(form.form.precio) : ''}
          onChangeText={v => form.setField('precio', v)}
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

        <Text variant="label" className="mb-1">Categoría *</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {categorias.map(c => (
            <TouchableOpacity
              key={c.id}
              onPress={() => form.setField('categoria_id', c.id)}
              className={`px-3 py-1.5 rounded-lg border ${form.form.categoria_id === c.id ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-xs font-medium ${form.form.categoria_id === c.id ? 'text-white' : 'text-gray-700'}`}>
                {c.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text variant="label" className="mb-1">Marca</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          <TouchableOpacity
            onPress={() => form.setField('marca_id', null)}
            className={`px-3 py-1.5 rounded-lg border ${form.form.marca_id === null ? 'bg-gray-700 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <Text className={`text-xs font-medium ${form.form.marca_id === null ? 'text-white' : 'text-gray-700'}`}>
              Sin marca
            </Text>
          </TouchableOpacity>
          {marcas.map(m => (
            <TouchableOpacity
              key={m.id}
              onPress={() => form.setField('marca_id', m.id)}
              className={`px-3 py-1.5 rounded-lg border ${form.form.marca_id === m.id ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-xs font-medium ${form.form.marca_id === m.id ? 'text-white' : 'text-gray-700'}`}>
                {m.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Descripción"
          value={form.form.descripcion ?? ''}
          onChangeText={v => form.setField('descripcion', v || null)}
          placeholder="Descripción opcional"
          leftIcon="document-text-outline"
          multiline
        />

        {form.error ? <Text variant="caption" color="error" className="mb-3">{form.error}</Text> : null}
      </FormModal>

      <ConfirmModal
        visible={confirmVisible}
        title="Eliminar Producto"
        message={`¿Estás seguro de eliminar "${toDelete?.nombre}"?`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
        loading={list.deleting}
      />
    </View>
  );
}

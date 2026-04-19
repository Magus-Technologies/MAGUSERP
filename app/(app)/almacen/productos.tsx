import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { productoService, ProductoPayload } from '@/src/services/producto.service';
import { categoriaService } from '@/src/services/categoria.service';
import { marcaService }     from '@/src/services/marca.service';
import { Producto, Categoria, Marca } from '@/src/types/almacen.types';
import { formatCurrency }   from '@/src/utils/formatters';
import { SearchBar }        from '@/src/components/ui/SearchBar';
import { FAB }              from '@/src/components/ui/FAB';
import { ConfirmModal }     from '@/src/components/ui/ConfirmModal';
import { FormModal }        from '@/src/components/ui/FormModal';
import { Card }             from '@/src/components/ui/Card';
import { Badge }            from '@/src/components/ui/Badge';
import { Input }            from '@/src/components/ui/Input';
import { LoadingSpinner }   from '@/src/components/ui/LoadingSpinner';
import { EmptyState }       from '@/src/components/ui/EmptyState';
import { Text }             from '@/src/components/ui/Text';
import { Divider }          from '@/src/components/ui/Divider';

const EMPTY_FORM: ProductoPayload = {
  nombre: '', descripcion: null, precio: 0, precio_compra: 0,
  stock: 0, stock_minimo: 5, categoria_id: 0, marca_id: null,
};

export default function ProductosScreen() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();

  const [productos,   setProductos]   = useState<Producto[]>([]);
  const [search,      setSearch]      = useState('');
  const [page,        setPage]        = useState(1);
  const [lastPage,    setLastPage]    = useState(1);
  const [total,       setTotal]       = useState(0);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(false);

  const [categorias,  setCategorias]  = useState<Categoria[]>([]);
  const [marcas,      setMarcas]      = useState<Marca[]>([]);

  const [formVisible,    setFormVisible]    = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [selected,       setSelected]       = useState<Producto | null>(null);
  const [form,           setForm]           = useState<ProductoPayload>(EMPTY_FORM);
  const [formError,      setFormError]      = useState('');

  const loadMeta = useCallback(async () => {
    const [cats, mars] = await Promise.all([categoriaService.getAll(), marcaService.getAll()]);
    setCategorias(Array.isArray(cats) ? cats : (cats as any).data ?? []);
    setMarcas(Array.isArray(mars) ? mars : (mars as any).data ?? []);
  }, []);

  const loadProductos = useCallback(async (q: string, p: number, append = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await productoService.getAll({ search: q || undefined, page: p });
      const list = res.data ?? [];
      setProductos(prev => append ? [...prev, ...list] : list);
      setLastPage(res.last_page);
      setTotal(res.total);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadMeta();
    loadProductos('', 1);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadProductos(search, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadMore = () => {
    if (loadingMore || page >= lastPage) return;
    const next = page + 1;
    setPage(next);
    loadProductos(search, next, true);
  };

  const openCreate = () => {
    setSelected(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setFormVisible(true);
  };

  const openEdit = (item: Producto) => {
    setSelected(item);
    setForm({
      nombre:        item.nombre,
      descripcion:   item.descripcion,
      precio:        item.precio,
      precio_compra: item.precio_compra,
      stock:         item.stock,
      stock_minimo:  item.stock_minimo,
      categoria_id:  item.categoria_id,
      marca_id:      item.marca_id,
    });
    setFormError('');
    setFormVisible(true);
  };

  const openDelete = (item: Producto) => {
    setSelected(item);
    setConfirmVisible(true);
  };

  const setField = (key: keyof ProductoPayload, value: any) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setFormError('');
  };

  const handleSave = async () => {
    if (!form.nombre.trim())     { setFormError('El nombre es requerido'); return; }
    if (!form.categoria_id)      { setFormError('Selecciona una categoría'); return; }
    if (form.precio <= 0)        { setFormError('El precio debe ser mayor a 0'); return; }
    setSaving(true);
    try {
      const payload: ProductoPayload = {
        ...form,
        nombre: form.nombre.trim(),
        precio: Number(form.precio),
        precio_compra: Number(form.precio_compra),
        stock: Number(form.stock),
        stock_minimo: Number(form.stock_minimo),
      };
      if (selected) {
        await productoService.update(selected.id, payload);
      } else {
        await productoService.create(payload);
      }
      setFormVisible(false);
      setPage(1);
      await loadProductos(search, 1);
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
      await productoService.delete(selected.id);
      setConfirmVisible(false);
      setPage(1);
      await loadProductos(search, 1);
    } finally {
      setDeleting(false);
    }
  };

  const stockBadge = (p: Producto) => {
    if (p.stock === 0) return <Badge label="Sin stock" variant="error" />;
    if (p.stock <= p.stock_minimo) return <Badge label="Crítico" variant="warning" />;
    return <Badge label="OK" variant="success" />;
  };

  if (loading) return <LoadingSpinner message="Cargando productos..." />;

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-azul-oscuro px-4 pt-14 pb-5 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.openDrawer()} className="mr-3">
          <Ionicons name="menu" size={26} color="#fff" />
        </TouchableOpacity>
        <View className="flex-1">
          <Text variant="caption" className="text-white/60">Almacén</Text>
          <Text variant="h4" color="white">Productos</Text>
        </View>
        <Text variant="caption" className="text-white/60">{total} registros</Text>
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar producto..." />

      <FlatList
        data={productos}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 16, paddingTop: 0, paddingBottom: 80 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loadingMore ? <LoadingSpinner message="" /> : null}
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="Sin productos"
            message={search ? 'No hay resultados para tu búsqueda' : 'Crea el primer producto'}
          />
        }
        renderItem={({ item, index }) => (
          <Card className="mb-3 px-4 py-3">
            <View className="flex-row items-center">
              {/* Imagen */}
              <View className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden mr-3">
                {item.imagen_principal ? (
                  <Image source={{ uri: item.imagen_principal }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <View className="w-full h-full items-center justify-center">
                    <Ionicons name="cube-outline" size={22} color="#9ca3af" />
                  </View>
                )}
              </View>

              {/* Info */}
              <View className="flex-1">
                <Text variant="label" numberOfLines={1}>{item.nombre}</Text>
                <Text variant="caption" color="muted" className="mt-0.5">
                  {item.categoria?.nombre ?? '—'}{item.marca ? ` · ${item.marca.nombre}` : ''}
                </Text>
                <View className="flex-row items-center gap-2 mt-1">
                  <Text variant="caption" className="text-primary-500 font-semibold">
                    {formatCurrency(item.precio)}
                  </Text>
                  <Text variant="caption" color="muted">Stock: {item.stock}</Text>
                </View>
              </View>

              {/* Acciones */}
              <View className="items-end gap-2">
                {stockBadge(item)}
                <View className="flex-row gap-1 mt-1">
                  <TouchableOpacity
                    onPress={() => openEdit(item)}
                    className="w-8 h-8 rounded-lg bg-blue-50 items-center justify-center"
                  >
                    <Ionicons name="pencil-outline" size={15} color="#458EFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => openDelete(item)}
                    className="w-8 h-8 rounded-lg bg-red-50 items-center justify-center"
                  >
                    <Ionicons name="trash-outline" size={15} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Card>
        )}
      />

      <FAB onPress={openCreate} />

      {/* Form Modal */}
      <FormModal
        visible={formVisible}
        title={selected ? 'Editar Producto' : 'Nuevo Producto'}
        onClose={() => setFormVisible(false)}
        onSave={handleSave}
        loading={saving}
      >
        <Input
          label="Nombre *"
          value={form.nombre}
          onChangeText={v => setField('nombre', v)}
          placeholder="Nombre del producto"
          leftIcon="cube-outline"
        />
        <Input
          label="Precio de venta *"
          value={form.precio ? String(form.precio) : ''}
          onChangeText={v => setField('precio', v)}
          placeholder="0.00"
          leftIcon="cash-outline"
          keyboardType="decimal-pad"
        />
        <Input
          label="Precio de compra"
          value={form.precio_compra ? String(form.precio_compra) : ''}
          onChangeText={v => setField('precio_compra', v)}
          placeholder="0.00"
          leftIcon="cart-outline"
          keyboardType="decimal-pad"
        />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Input
              label="Stock"
              value={String(form.stock)}
              onChangeText={v => setField('stock', v)}
              placeholder="0"
              keyboardType="number-pad"
            />
          </View>
          <View className="flex-1">
            <Input
              label="Stock mínimo"
              value={String(form.stock_minimo)}
              onChangeText={v => setField('stock_minimo', v)}
              placeholder="5"
              keyboardType="number-pad"
            />
          </View>
        </View>

        {/* Selector Categoría */}
        <Text variant="label" className="mb-1">Categoría *</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          {categorias.map(c => (
            <TouchableOpacity
              key={c.id}
              onPress={() => setField('categoria_id', c.id)}
              className={`px-3 py-1.5 rounded-lg border ${form.categoria_id === c.id ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-xs font-medium ${form.categoria_id === c.id ? 'text-white' : 'text-gray-700'}`}>
                {c.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selector Marca */}
        <Text variant="label" className="mb-1">Marca</Text>
        <View className="flex-row flex-wrap gap-2 mb-4">
          <TouchableOpacity
            onPress={() => setField('marca_id', null)}
            className={`px-3 py-1.5 rounded-lg border ${form.marca_id === null ? 'bg-gray-700 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <Text className={`text-xs font-medium ${form.marca_id === null ? 'text-white' : 'text-gray-700'}`}>
              Sin marca
            </Text>
          </TouchableOpacity>
          {marcas.map(m => (
            <TouchableOpacity
              key={m.id}
              onPress={() => setField('marca_id', m.id)}
              className={`px-3 py-1.5 rounded-lg border ${form.marca_id === m.id ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-200'}`}
            >
              <Text className={`text-xs font-medium ${form.marca_id === m.id ? 'text-white' : 'text-gray-700'}`}>
                {m.nombre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Descripción"
          value={form.descripcion ?? ''}
          onChangeText={v => setField('descripcion', v || null)}
          placeholder="Descripción opcional"
          leftIcon="document-text-outline"
          multiline
        />

        {formError ? <Text variant="caption" color="error" className="mb-3">{formError}</Text> : null}
      </FormModal>

      <ConfirmModal
        visible={confirmVisible}
        title="Eliminar Producto"
        message={`¿Estás seguro de eliminar "${selected?.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmVisible(false)}
        loading={deleting}
      />
    </View>
  );
}

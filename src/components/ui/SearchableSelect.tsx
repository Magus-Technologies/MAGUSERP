import React, { useState, useMemo } from 'react';
import { View, TouchableOpacity, Modal, FlatList, SafeAreaView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';

interface Option {
  id:     number | string;
  nombre: string;
}

interface Props {
  label:       string;
  options:     Option[];
  selectedId:  number | string | null;
  onSelect:    (id: any) => void;
  placeholder?: string;
  required?:   boolean;
  allowNull?:  boolean;
  nullLabel?:  string;
}

export function SearchableSelect({
  label, options, selectedId, onSelect,
  placeholder = 'Seleccionar...', required = false,
  allowNull = false, nullLabel = 'Ninguno'
}: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedOption = useMemo(() => 
    options.find(opt => opt.id === selectedId), 
    [options, selectedId]
  );

  const filteredOptions = useMemo(() => 
    options.filter(opt => 
      opt.nombre.toLowerCase().includes(search.toLowerCase())
    ),
    [options, search]
  );

  const handleSelect = (id: any) => {
    onSelect(id);
    setModalVisible(false);
    setSearch('');
  };

  return (
    <View className="mb-4">
      <Text variant="label" className="mb-2">
        {label} {required ? '*' : ''}
      </Text>
      
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="flex-row items-center px-4 h-12 bg-white border border-gray-200 rounded-xl"
      >
        <Text className={`flex-1 ${!selectedOption ? 'text-gray-400' : 'text-gray-900'}`}>
          {selectedOption ? selectedOption.nombre : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setModalVisible(false)}
      >
        <SafeAreaView className="flex-1 bg-white">
          <View className="px-4 py-4 border-b border-gray-100 flex-row items-center gap-3">
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={28} color="#374151" />
            </TouchableOpacity>
            <View className="flex-1 h-10 bg-gray-100 rounded-full px-4 flex-row items-center">
              <Ionicons name="search-outline" size={20} color="#6b7280" />
              <TextInput
                autoFocus
                placeholder="Buscar..."
                value={search}
                onChangeText={setSearch}
                className="flex-1 ml-2 text-gray-900"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>

          <FlatList
            data={filteredOptions}
            keyExtractor={item => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
            ListHeaderComponent={
              allowNull ? (
                <TouchableOpacity
                  onPress={() => handleSelect(null)}
                  className="py-4 border-b border-gray-50 flex-row items-center"
                >
                  <Text className={`flex-1 ${selectedId === null ? 'font-bold text-primary-500' : 'text-gray-700'}`}>
                    {nullLabel}
                  </Text>
                  {selectedId === null && <Ionicons name="checkmark" size={20} color="#0d214f" />}
                </TouchableOpacity>
              ) : null
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleSelect(item.id)}
                className="py-4 border-b border-gray-50 flex-row items-center"
              >
                <Text className={`flex-1 ${selectedId === item.id ? 'font-bold text-primary-500' : 'text-gray-700'}`}>
                  {item.nombre}
                </Text>
                {selectedId === item.id && <Ionicons name="checkmark" size={20} color="#0d214f" />}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

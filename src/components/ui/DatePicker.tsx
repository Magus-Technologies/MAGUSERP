import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';

interface Props {
  label?: string;
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: Date;
}

export function DatePicker({ label, value, onChange, placeholder = 'Selecciona una fecha', minDate }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(
    value ? new Date(value) : minDate || new Date()
  );

  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();

  // Generar días del mes
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => null);

  const handleSelectDate = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day);
    const formattedDate = newDate.toISOString().split('T')[0];
    onChange(formattedDate);
    setSelectedDate(newDate);
    setShowModal(false);
  };

  const handlePrevMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const displayDate = value ? new Date(value).toLocaleDateString('es-PE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }) : '';

  const screenWidth = Dimensions.get('window').width;
  const modalWidth = Math.min(screenWidth - 32, 380);
  const daySize = (modalWidth - 32) / 7;

  return (
    <View>
      {label && <Text variant="label" className="mb-2">{label}</Text>}
      
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        className="flex-row items-center px-4 py-3 border border-gray-200 rounded-xl bg-white"
      >
        <Ionicons name="calendar-outline" size={20} color="#458EFF" />
        <Text variant="body" className="flex-1 ml-3">
          {displayDate || placeholder}
        </Text>
        {value && (
          <TouchableOpacity onPress={() => onChange('')}>
            <Ionicons name="close-circle" size={20} color="#D1D5DB" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-center items-center p-4">
          <View style={{ width: modalWidth }} className="bg-white rounded-2xl p-4">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
              <TouchableOpacity onPress={handlePrevMonth} className="p-2">
                <Ionicons name="chevron-back" size={20} color="#458EFF" />
              </TouchableOpacity>
              
              <Text variant="label" className="text-center flex-1">
                {monthNames[currentMonth]} {currentYear}
              </Text>
              
              <TouchableOpacity onPress={handleNextMonth} className="p-2">
                <Ionicons name="chevron-forward" size={20} color="#458EFF" />
              </TouchableOpacity>
            </View>

            {/* Day names */}
            <View className="flex-row mb-2">
              {dayNames.map((day) => (
                <View key={day} style={{ width: daySize }} className="items-center py-1">
                  <Text variant="caption" color="muted" className="text-xs">{day}</Text>
                </View>
              ))}
            </View>

            {/* Days grid */}
            <View className="flex-row flex-wrap">
              {emptyDays.map((_, i) => (
                <View key={`empty-${i}`} style={{ width: daySize, height: daySize }} />
              ))}
              {days.map((day) => {
                const isSelected = value && new Date(value).getDate() === day && 
                                  new Date(value).getMonth() === currentMonth &&
                                  new Date(value).getFullYear() === currentYear;
                
                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => handleSelectDate(day)}
                    style={{ width: daySize, height: daySize }}
                    className={`items-center justify-center rounded-lg ${
                      isSelected ? 'bg-primary-500' : 'bg-gray-50'
                    }`}
                  >
                    <Text
                      variant="caption"
                      className={isSelected ? 'text-white font-bold text-sm' : 'text-gray-700 text-sm'}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Footer buttons */}
            <View className="flex-row gap-2 mt-3">
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="flex-1 py-2 border border-gray-200 rounded-xl items-center justify-center"
              >
                <Text variant="caption" color="muted">Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="flex-1 py-2 bg-primary-500 rounded-xl items-center justify-center"
              >
                <Text variant="caption" className="text-white font-bold">Aceptar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

import React from 'react';
import { View, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Text } from './Text';

interface Props {
  imageUri: string | null;
  onImagePicked: (uri: string | null) => void;
  label?: string;
}

export const ImagePickerComponent: React.FC<Props> = ({ imageUri, onImagePicked, label = "Imagen" }) => {
  
  const pickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImagePicked(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la cámara.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      onImagePicked(result.assets[0].uri);
    }
  };

  const clearImage = () => onImagePicked(null);

  return (
    <View className="mb-4">
      <Text variant="label" className="mb-2">{label}</Text>
      
      {imageUri ? (
        <View className="relative w-full h-48 rounded-xl overflow-hidden bg-gray-200 border border-gray-300">
          <Image source={{ uri: imageUri }} className="w-full h-full" resizeMode="cover" />
          <TouchableOpacity 
            onPress={clearImage}
            className="absolute top-2 right-2 bg-black/50 w-8 h-8 rounded-full items-center justify-center"
          >
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-row gap-3">
          <TouchableOpacity 
            onPress={pickImage}
            className="flex-1 h-32 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center bg-gray-50"
          >
            <Ionicons name="images-outline" size={32} color="#9ca3af" />
            <Text variant="caption" color="muted" className="mt-2 text-center">Galería</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={takePhoto}
            className="flex-1 h-32 border-2 border-dashed border-gray-300 rounded-xl items-center justify-center bg-gray-50"
          >
            <Ionicons name="camera-outline" size={32} color="#9ca3af" />
            <Text variant="caption" color="muted" className="mt-2 text-center">Cámara</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

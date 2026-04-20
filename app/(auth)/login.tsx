import React, { useState, useEffect } from 'react';
import { View, Image, KeyboardAvoidingView, Platform, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/src/store/AuthContext';
import { storage, StorageKeys } from '@/src/utils/storage';
import { Text }   from '@/src/components/ui/Text';
import { Input }  from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [errors,     setErrors]     = useState<{ email?: string; password?: string }>({});

  useEffect(() => {
    loadCredentials();
  }, []);

  const loadCredentials = async () => {
    const saved = await storage.get<{ email: string; password: string }>(StorageKeys.SAVED_CREDENTIALS);
    if (saved) {
      setEmail(saved.email);
      setPassword(saved.password);
      setRememberMe(true);
    }
  };

  const validate = () => {
    const e: typeof errors = {};
    if (!email)    e.email    = 'El correo es requerido';
    if (!password) e.password = 'La contraseña es requerida';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
      
      if (rememberMe) {
        await storage.set(StorageKeys.SAVED_CREDENTIALS, { email, password });
      } else {
        await storage.remove(StorageKeys.SAVED_CREDENTIALS);
      }

      router.replace('/(app)');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header con logo */}
        <View className="bg-neutral items-center justify-center pt-16 pb-10">
          <Image
            source={require('@/assets/images/logo3.png')}
            style={{ width: 180, height: 60 }}
            resizeMode="contain"
          />
        </View>

        {/* Card formulario */}
        <View className="flex-1 bg-white rounded-t-3xl px-6 pt-10 pb-10">
          <Text variant="h3" className="text-center mb-8">Iniciar Sesión</Text>

          <Input
            label="Correo electrónico"
            placeholder="Ingresa tu correo electrónico"
            leftIcon="mail-outline"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            error={errors.email}
          />

          <Input
            label="Contraseña"
            placeholder="Ingresa tu contraseña"
            leftIcon="lock-closed-outline"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
          />

          <TouchableOpacity
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
            className="flex-row items-center mb-6 self-start pl-1"
          >
            <View className={`w-5 h-5 rounded border items-center justify-center mr-2 ${rememberMe ? 'bg-primary-500 border-primary-500' : 'bg-white border-gray-300'}`}>
              {rememberMe && <Ionicons name="checkmark" size={14} color="white" />}
            </View>
            <Text variant="bodySmall" color="muted">Recordar mis credenciales</Text>
          </TouchableOpacity>

          <Button onPress={handleLogin} loading={loading} fullWidth size="lg">
            Iniciar Sesión
          </Button>

          <Text variant="caption" color="muted" className="text-center mt-8">
            MagusERP v1.0.0
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

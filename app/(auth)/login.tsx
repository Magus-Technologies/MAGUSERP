import React, { useState } from 'react';
import { View, Image, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/src/store/AuthContext';
import { Text }   from '@/src/components/ui/Text';
import { Input }  from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';

export default function LoginScreen() {
  const { login } = useAuth();
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [errors,   setErrors]   = useState<{ email?: string; password?: string }>({});

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

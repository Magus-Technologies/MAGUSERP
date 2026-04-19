import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '@/src/store/AuthContext';
import { Text } from '@/src/components/ui/Text';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale   = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(scale,   { toValue: 1, friction: 6, tension: 50, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const timer = setTimeout(() => {
      router.replace(isAuthenticated ? '/(app)' : '/(auth)/login');
    }, 2000);
    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated]);

  return (
    <View className="flex-1 bg-white items-center justify-center">
      <Animated.View style={{ opacity, transform: [{ scale }], alignItems: 'center' }}>
        <Image
          source={require('@/assets/images/logo3.png')}
          style={{ width: width * 0.55, height: width * 0.22 }}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View style={{ opacity }} className="w-16 h-0.5 bg-primary-500 rounded-full mt-8 mb-4" />

      <Animated.View style={{ opacity }}>
        <Text variant="caption" color="muted" className="tracking-widest uppercase">
          Panel de Administración
        </Text>
      </Animated.View>

      <Animated.View style={{ opacity, position: 'absolute', bottom: 48 }}>
        <Text variant="caption" color="muted">v1.0.0</Text>
      </Animated.View>
    </View>
  );
}

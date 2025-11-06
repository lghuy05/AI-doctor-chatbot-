// app/index.tsx
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { Redirect } from 'expo-router';
import { getToken } from '../utils/storage';

export default function Index() {
  const [isReady, setIsReady] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = await getToken();
        console.log('🔐 Auth check:', token ? 'Token found' : 'No token');
        setHasToken(!!token);
      } catch (error) {
        console.error('❌ Auth check failed:', error);
        setHasToken(false);
      } finally {
        setIsReady(true);
      }
    };

    checkAuth();
  }, []);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return hasToken ? <Redirect href="./(drawer)" /> : <Redirect href="./auth/login" />;
}

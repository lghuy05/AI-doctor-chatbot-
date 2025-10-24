// utils/auth.ts
import { removeToken, getToken } from './storage';
import { router } from 'expo-router';
import { Alert } from 'react-native';

export const logout = async (): Promise<void> => {
  try {
    console.log('🟡 [1] Starting logout process...');

    const existingToken = await getToken();
    console.log('🟡 [2] Token exists:', !!existingToken);

    if (existingToken) {
      await removeToken();
      console.log('✅ [3] Token removed successfully');
    } else {
      console.log('ℹ️ [3] No token found');
    }

    console.log('🟡 [4] About to navigate to login...');

    // Try different navigation methods
    router.navigate('/auth/login');
    console.log('🟡 [5] router.navigate() called');

    // Force navigation as backup
    setTimeout(() => {
      console.log('🟡 [6] Backup navigation attempt');
      router.replace('/auth/login');
    }, 100);

  } catch (error) {
    console.error('❌ [ERROR] Logout error:', error);

    Alert.alert(
      'Logout Error',
      'There was an issue logging out. Please try again.',
      [{
        text: 'OK', onPress: () => {
          console.log('🟡 [7] Manual navigation after error');
          router.navigate('/auth/login');
        }
      }]
    );
  }
};

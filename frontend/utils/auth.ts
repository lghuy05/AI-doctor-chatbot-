// utils/auth.ts
import { removeToken } from './storage';
import { router } from 'expo-router';

export const logout = async (): Promise<void> => {
  try {
    await removeToken();
    console.log('✅ Logout successful');

    // Navigate to login screen
    router.replace('/login');
  } catch (error) {
    console.error('❌ Logout error:', error);
  }
};

// utils/auth.ts
import { removeToken, getToken } from './storage';
import { router } from 'expo-router';

export const logout = async (): Promise<void> => {
  try {
    console.log('🟡 [1] Starting logout process...');

    // Check current route
    console.log('🟡 Current route state:', router);

    const existingToken = await getToken();
    console.log('🟡 [2] Token exists:', !!existingToken);

    if (existingToken) {
      await removeToken();
      console.log('✅ [3] Token removed successfully');
    } else {
      console.log('ℹ️ [3] No token found');
    }

    console.log('🟡 [4] Navigating to login...');

    // Use replace instead of navigate to prevent going back
    router.replace('/auth/login');

    console.log('✅ [5] Navigation command sent');

  } catch (error) {
    console.error('❌ [ERROR] Logout error:', error);

    // Even if there's an error, try to navigate to login
    router.replace('/auth/login');
  }
};

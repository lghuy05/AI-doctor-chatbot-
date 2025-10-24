// storage.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export const storeToken = async (token: string): Promise<void> => {
  try {
    await AsyncStorage.setItem('auth_token', token);
    console.log('✅ Token stored successfully');
  } catch (error) {
    console.log('❌ Error storing token:', error);
    throw error;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const token = await AsyncStorage.getItem('auth_token');
    console.log('🔍 Retrieved token:', token ? 'YES' : 'NO');
    return token;
  } catch (error) {
    console.error('❌ Error getting token:', error);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem('auth_token');
    console.log('✅ Token removed successfully');

    // Verify removal
    const verify = await AsyncStorage.getItem('auth_token');
    console.log('🔍 Verification - token exists after removal:', !!verify);
  } catch (error) {
    console.error('❌ Error removing token:', error);
    throw error;
  }
};

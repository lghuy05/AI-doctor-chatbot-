// app/patient/profile.tsx
import { View, Text, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { logout } from '../../utils/auth';
import { profileStyles } from '../styles/profile';

export default function ProfileScreen() {
  const handleLogout = async () => {
    console.log('🟡 Logout initiated');

    try {
      await logout();
      console.log('✅ Logout completed');
    } catch (error) {
      console.error('❌ Logout error:', error);
      router.replace('/auth/login');
    }
  };

  return (
    <View style={profileStyles.container}>
      <View style={profileStyles.header}>
        <TouchableOpacity
          style={profileStyles.backButton}
          onPress={() => router.back()}
        >
          <Text style={profileStyles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={profileStyles.title}>Your Profile</Text>
      </View>

      <View style={profileStyles.card}>
        <Text style={profileStyles.sectionTitle}>Personal Information</Text>

        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Username:</Text>
          <Text style={profileStyles.value}>john_doe</Text>
        </View>

        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Email:</Text>
          <Text style={profileStyles.value}>john@example.com</Text>
        </View>

        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Age:</Text>
          <Text style={profileStyles.value}>30</Text>
        </View>

        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Gender:</Text>
          <Text style={profileStyles.value}>Female</Text>
        </View>

        <TouchableOpacity
          style={profileStyles.logoutButton}
          onPress={handleLogout}
        >
          <Text style={profileStyles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

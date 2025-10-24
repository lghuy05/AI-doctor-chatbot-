// app/patient/profile.tsx
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { logout } from '../../utils/auth';

export default function ProfileScreen() {
  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // If logout doesn't navigate, do it here as backup
              setTimeout(() => {
                router.navigate('/auth/login');
              }, 100);
            } catch (error) {
              console.error('Logout failed:', error);
              // Force navigation even on error
              router.navigate('/auth/login');
            }
          }
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Your Profile</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Personal Information</Text>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Username:</Text>
          <Text style={styles.value}>john_doe</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>john@example.com</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Age:</Text>
          <Text style={styles.value}>30</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.label}>Gender:</Text>
          <Text style={styles.value}>Female</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F7FA',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 50,
  },
  backButton: {
    marginRight: 15,
  },
  backText: {
    fontSize: 16,
    color: '#3B82F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F131A',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0F131A',
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  label: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    color: '#0F131A',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

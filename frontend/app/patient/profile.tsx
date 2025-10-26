// app/patient/profile.tsx - UPDATED
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { logout } from '../../utils/auth';
import { profileStyles } from '../styles/profile';
import { useState, useEffect } from 'react';
import { usePatientStore } from '../../hooks/usePatientStore';

export default function ProfileScreen() {
  const {
    patientProfile,
    isLoading,
    error,
    fetchPatientProfile,
    clearPatientProfile
  } = usePatientStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Fetch profile once when component mounts (uses cache if available)
    loadPatientProfile();
  }, []);

  const loadPatientProfile = async (forceRefresh = false) => {
    // Use the test patient ID
    await fetchPatientProfile('example', forceRefresh);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatientProfile(true); // Force refresh
    setRefreshing(false);
  };

  const handleLogout = async () => {
    console.log('🟡 Logout initiated');
    clearPatientProfile(); // Clear cached data on logout
    try {
      await logout();
      console.log('✅ Logout completed');
    } catch (error) {
      console.error('❌ Logout error:', error);
      router.replace('/auth/login');
    }
  };

  if (isLoading && !patientProfile) {
    return (
      <View style={profileStyles.container}>
        <View style={profileStyles.header}>
          <TouchableOpacity style={profileStyles.backButton} onPress={() => router.back()}>
            <Text style={profileStyles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={profileStyles.title}>Your Profile</Text>
        </View>
        <View style={[profileStyles.card, { alignItems: 'center', padding: 40 }]}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={[profileStyles.label, { marginTop: 16 }]}>Loading EHR data...</Text>
        </View>
      </View>
    );
  }

  if (error && !patientProfile) {
    return (
      <View style={profileStyles.container}>
        <View style={profileStyles.header}>
          <TouchableOpacity style={profileStyles.backButton} onPress={() => router.back()}>
            <Text style={profileStyles.backText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={profileStyles.title}>Your Profile</Text>
        </View>
        <View style={profileStyles.card}>
          <Text style={[profileStyles.label, { color: '#EF4444' }]}>Error: {error}</Text>
          <TouchableOpacity onPress={() => loadPatientProfile(true)} style={[profileStyles.logoutButton, { backgroundColor: '#3B82F6', marginTop: 16 }]}>
            <Text style={profileStyles.logoutButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={profileStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={profileStyles.header}>
        <TouchableOpacity style={profileStyles.backButton} onPress={() => router.back()}>
          <Text style={profileStyles.backText}>‹ Back</Text>
        </TouchableOpacity>
        <Text style={profileStyles.title}>Your Profile</Text>
      </View>

      {/* Personal Information */}
      <View style={profileStyles.card}>
        <Text style={profileStyles.sectionTitle}>Personal Information</Text>

        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Name:</Text>
          <Text style={profileStyles.value}>{patientProfile?.name || 'Not available'}</Text>
        </View>

        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Patient ID:</Text>
          <Text style={[profileStyles.value, { fontSize: 12 }]}>{patientProfile?.id}</Text>
        </View>

        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Age:</Text>
          <Text style={profileStyles.value}>{patientProfile?.age ? `${patientProfile.age} years` : 'Not specified'}</Text>
        </View>

        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Gender:</Text>
          <Text style={profileStyles.value}>{patientProfile?.gender || 'Not specified'}</Text>
        </View>

        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Email:</Text>
          <Text style={profileStyles.value}>{patientProfile?.contact.email || 'Not available'}</Text>
        </View>

        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Phone:</Text>
          <Text style={profileStyles.value}>{patientProfile?.contact.phone || 'Not available'}</Text>
        </View>
      </View>

      {/* Active Medications */}
      {patientProfile?.active_medications && patientProfile.active_medications.length > 0 && (
        <View style={[profileStyles.card, { marginTop: 16 }]}>
          <Text style={profileStyles.sectionTitle}>Active Medications ({patientProfile.active_medications.length})</Text>
          {patientProfile.active_medications.map((med, index) => (
            <View key={index} style={[profileStyles.infoRow, { alignItems: 'flex-start' }]}>
              <View style={{ flex: 1 }}>
                <Text style={[profileStyles.value, { marginBottom: 4 }]}>{med.name}</Text>
                <Text style={[profileStyles.label, { fontSize: 12 }]}>
                  Prescribed by: {med.prescriber} • {med.status}
                </Text>
                {med.prescribed_date && (
                  <Text style={[profileStyles.label, { fontSize: 12 }]}>
                    Since: {new Date(med.prescribed_date).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Medical Conditions */}
      {patientProfile?.medical_conditions && patientProfile.medical_conditions.length > 0 && (
        <View style={[profileStyles.card, { marginTop: 16 }]}>
          <Text style={profileStyles.sectionTitle}>Medical Conditions ({patientProfile.medical_conditions.length})</Text>
          {patientProfile.medical_conditions.map((condition, index) => (
            <View key={index} style={profileStyles.infoRow}>
              <Text style={profileStyles.label}>{condition.name}</Text>
              <Text style={[profileStyles.value, { fontSize: 12 }]}>{condition.status}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Last Updated & Cache Info */}
      {patientProfile?.last_updated && (
        <View style={[profileStyles.card, { marginTop: 16 }]}>
          <Text style={[profileStyles.label, { fontSize: 12, textAlign: 'center' }]}>
            EHR data updated: {new Date(patientProfile.last_updated).toLocaleString()}
          </Text>
          <Text style={[profileStyles.label, { fontSize: 10, textAlign: 'center', marginTop: 4 }]}>
            Pull down to refresh data
          </Text>
        </View>
      )}

      <TouchableOpacity style={[profileStyles.logoutButton, { marginTop: 20 }]} onPress={handleLogout}>
        <Text style={profileStyles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

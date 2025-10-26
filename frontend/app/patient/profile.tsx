// app/patient/profile.tsx
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { logout } from '../../utils/auth';
import { profileStyles } from '../styles/profile';
import { useState, useEffect } from 'react';
import api from '../../api/client';

interface PatientProfile {
  id: string;
  name: string;
  birth_date?: string;
  age?: number;
  gender: string;
  contact: {
    email: string;
    phone: string;
  };
  active_medications: Array<{
    name: string;
    status: string;
    prescribed_date?: string;
    prescriber: string;
  }>;
  medical_conditions: Array<{
    name: string;
    status: string;
    recorded_date?: string;
  }>;
  last_updated: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPatientProfile();
  }, []);

  const fetchPatientProfile = async () => {
    try {
      setLoading(true);
      // Using the test patient ID from your FHIR search results
      const response = await api.get('/patient/profile/500569db-b06d-461a-8361-e6b5adbf081a');

      if (response.data.success && response.data.profile) {
        setProfile(response.data.profile);
      } else {
        setError(response.data.error || 'Failed to load profile');
      }
    } catch (err: any) {
      setError(err.message || 'Error fetching profile data');
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
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

  if (error) {
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
          <TouchableOpacity onPress={fetchPatientProfile} style={[profileStyles.logoutButton, { backgroundColor: '#3B82F6', marginTop: 16 }]}>
            <Text style={profileStyles.logoutButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={profileStyles.container}>
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
          <Text style={profileStyles.value}>{profile?.name || 'Not available'}</Text>
        </View>

        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Patient ID:</Text>
          <Text style={[profileStyles.value, { fontSize: 12 }]}>{profile?.id}</Text>
        </View>

        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Age:</Text>
          <Text style={profileStyles.value}>{profile?.age ? `${profile.age} years` : 'Not specified'}</Text>
        </View>

        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Gender:</Text>
          <Text style={profileStyles.value}>{profile?.gender || 'Not specified'}</Text>
        </View>

        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Email:</Text>
          <Text style={profileStyles.value}>{profile?.contact.email || 'Not available'}</Text>
        </View>

        <View style={profileStyles.infoRow}>
          <Text style={profileStyles.label}>Phone:</Text>
          <Text style={profileStyles.value}>{profile?.contact.phone || 'Not available'}</Text>
        </View>
      </View>

      {/* Active Medications */}
      {profile?.active_medications && profile.active_medications.length > 0 && (
        <View style={[profileStyles.card, { marginTop: 16 }]}>
          <Text style={profileStyles.sectionTitle}>Active Medications ({profile.active_medications.length})</Text>
          {profile.active_medications.map((med, index) => (
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
      {profile?.medical_conditions && profile.medical_conditions.length > 0 && (
        <View style={[profileStyles.card, { marginTop: 16 }]}>
          <Text style={profileStyles.sectionTitle}>Medical Conditions ({profile.medical_conditions.length})</Text>
          {profile.medical_conditions.map((condition, index) => (
            <View key={index} style={profileStyles.infoRow}>
              <Text style={profileStyles.label}>{condition.name}</Text>
              <Text style={[profileStyles.value, { fontSize: 12 }]}>{condition.status}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Last Updated */}
      {profile?.last_updated && (
        <View style={[profileStyles.card, { marginTop: 16 }]}>
          <Text style={[profileStyles.label, { fontSize: 12, textAlign: 'center' }]}>
            EHR data updated: {new Date(profile.last_updated).toLocaleString()}
          </Text>
        </View>
      )}

      <TouchableOpacity style={[profileStyles.logoutButton, { marginTop: 20 }]} onPress={handleLogout}>
        <Text style={profileStyles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

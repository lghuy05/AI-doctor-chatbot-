// app/patient/profile.tsx - UPDATED WITH DRAWER TOGGLE
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { logout } from '../../utils/auth';
import { profileStyles } from '../styles/profile';
import { useState, useEffect } from 'react';
import { usePatientStore } from '../../hooks/usePatientStore';

export default function ProfileScreen() {
  const navigation = useNavigation();
  const {
    patientProfile,
    isLoading,
    error,
    fetchPatientProfile,
    clearPatientProfile
  } = usePatientStore();

  const [refreshing, setRefreshing] = useState(false);

  const toggleDrawer = () => {
    // @ts-ignore
    navigation.toggleDrawer();
  };

  useEffect(() => {
    loadPatientProfile();
  }, []);

  const loadPatientProfile = async (forceRefresh = false) => {
    await fetchPatientProfile('example', forceRefresh);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatientProfile(true);
    setRefreshing(false);
  };

  const handleLogout = async () => {
    console.log('🟡 Logout initiated');
    clearPatientProfile();
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
        <View style={[profileStyles.header, { flexDirection: 'row', alignItems: 'center' }]}>
          <TouchableOpacity
            style={{
              width: 40,
              height: 40,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 20,
              backgroundColor: '#FFFFFF',
              shadowColor: '#000',
              shadowOpacity: 0.1,
              shadowOffset: { width: 0, height: 2 },
              shadowRadius: 4,
              elevation: 3,
              marginRight: 16,
            }}
            onPress={toggleDrawer}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#3B82F6' }}>☰</Text>
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

  return (
    <ScrollView
      style={profileStyles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Updated Header with Drawer Toggle */}
      <View style={[profileStyles.header, { flexDirection: 'row', alignItems: 'center' }]}>
        <TouchableOpacity
          style={{
            width: 40,
            height: 40,
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            backgroundColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOpacity: 0.1,
            shadowOffset: { width: 0, height: 2 },
            shadowRadius: 4,
            elevation: 3,
            marginRight: 16,
          }}
          onPress={toggleDrawer}
        >
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#3B82F6' }}>☰</Text>
        </TouchableOpacity>
        <Text style={profileStyles.title}>Your Profile</Text>
      </View>

      {/* Keep the rest of your profile content */}
      <View style={profileStyles.card}>
        <Text style={profileStyles.sectionTitle}>Personal Information</Text>
        {/* ... rest of content */}
      </View>
    </ScrollView>
  );
}

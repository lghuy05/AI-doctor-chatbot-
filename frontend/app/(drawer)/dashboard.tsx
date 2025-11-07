// app/(drawer)/dashboard.tsx - UPDATED WITH DRAWER TOGGLE
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router, useNavigation } from 'expo-router';
import { dashboardStyles } from '../styles/dashboardStyles';

export default function DashboardScreen() {
  const navigation = useNavigation();

  const toggleDrawer = () => {
    // @ts-ignore - toggleDrawer exists but TypeScript might not recognize it
    navigation.toggleDrawer();
  };

  return (
    <ScrollView style={dashboardStyles.container}>
      {/* Updated Header with Drawer Toggle */}
      <View style={[dashboardStyles.header, { flexDirection: 'row', alignItems: 'center', paddingTop: 60 }]}>
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

        <View style={{ flex: 1 }}>
          <Text style={dashboardStyles.title}>Health Dashboard</Text>
          <Text style={dashboardStyles.subtitle}>Manage your health data</Text>
        </View>
      </View>

      {/* Quick Stats Cards */}
      <View style={dashboardStyles.statsRow}>
        <View style={dashboardStyles.statCard}>
          <Text style={dashboardStyles.statNumber}>12</Text>
          <Text style={dashboardStyles.statLabel}>Chats This Month</Text>
        </View>
        <View style={dashboardStyles.statCard}>
          <Text style={dashboardStyles.statNumber}>3</Text>
          <Text style={dashboardStyles.statLabel}>Active Reminders</Text>
        </View>
      </View>

      {/* Navigation Cards */}
      <View style={dashboardStyles.section}>
        <Text style={dashboardStyles.sectionTitle}>Your Health Data</Text>

        <TouchableOpacity
          style={dashboardStyles.navCard}
          onPress={() => router.push('/(drawer)/profile')}
        >
          <View style={dashboardStyles.navIcon}>
            <Text style={dashboardStyles.navIconText}>👤</Text>
          </View>
          <View style={dashboardStyles.navContent}>
            <Text style={dashboardStyles.navTitle}>Your Profile</Text>
            <Text style={dashboardStyles.navDescription}>
              View and manage your personal information, medications, and conditions
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={dashboardStyles.navCard}
          onPress={() => router.push('/(drawer)')}
        >
          <View style={dashboardStyles.navIcon}>
            <Text style={dashboardStyles.navIconText}>💬</Text>
          </View>
          <View style={dashboardStyles.navContent}>
            <Text style={dashboardStyles.navTitle}>Chat with AI</Text>
            <Text style={dashboardStyles.navDescription}>
              Get instant medical advice and symptom analysis
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={dashboardStyles.navCard}
          onPress={() => router.push('/(drawer)/reminders')}
        >
          <View style={dashboardStyles.navIcon}>
            <Text style={dashboardStyles.navIconText}>⏰</Text>
          </View>
          <View style={dashboardStyles.navContent}>
            <Text style={dashboardStyles.navTitle}>Reminders</Text>
            <Text style={dashboardStyles.navDescription}>
              Set and manage medication reminders and health tasks
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

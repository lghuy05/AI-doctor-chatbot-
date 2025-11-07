// app/(drawer)/_layout.tsx - FIXED VERSION
import { Drawer } from 'expo-router/drawer';
import { View, Text, TouchableOpacity } from 'react-native';
import { router, usePathname } from 'expo-router';

function CustomDrawerContent() {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Dashboard', route: '/(drawer)/dashboard', icon: '📊' },
    { label: 'Chat with AI', route: '/(drawer)', icon: '💬' },
    { label: 'Analytics', route: '/(drawer)/analytics', icon: '📈' },
    { label: 'Reminders', route: '/(drawer)/reminders', icon: '⏰' },
    { label: 'Profile', route: '/(drawer)/profile', icon: '👤' },
  ];

  return (
    <View style={{ flex: 1, paddingTop: 60, backgroundColor: '#fff' }}>
      <View style={{ padding: 20, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#0F131A' }}>Health App</Text>
        <Text style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>Your Medical Companion</Text>
      </View>

      <View style={{ padding: 12 }}>
        {menuItems.map((item, index) => {
          const isActive = pathname === item.route ||
            (item.route === '/(drawer)' && pathname === '/(drawer)/index');
          return (
            <TouchableOpacity
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 16,
                paddingHorizontal: 16,
                borderRadius: 12,
                marginBottom: 4,
                backgroundColor: isActive ? '#EFF6FF' : 'transparent',
              }}
              onPress={() => router.push(item.route as any)}
            >
              <Text style={{ fontSize: 20, marginRight: 12 }}>{item.icon}</Text>
              <Text style={{
                fontSize: 16,
                fontWeight: '600',
                color: isActive ? '#3B82F6' : '#0F131A'
              }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={CustomDrawerContent}
      screenOptions={{
        headerShown: false,
        drawerHideStatusBarOnOpen: false,
        drawerStyle: {
          backgroundColor: '#fff',
          width: 280,
        },
        swipeEnabled: true,
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          drawerLabel: 'Chat with AI',
          title: 'Chat with AI',
        }}
      />
      <Drawer.Screen
        name="dashboard"
        options={{
          drawerLabel: 'Dashboard',
          title: 'Dashboard',
        }}
      />
      <Drawer.Screen
        name="analytics"
        options={{
          drawerLabel: 'Analytics',
          title: 'Analytics',
        }}
      />
      <Drawer.Screen
        name="reminders"
        options={{
          drawerLabel: 'Reminders',
          title: 'Reminders',
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Profile',
          title: 'Profile',
        }}
      />
    </Drawer>
  );
}

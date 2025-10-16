// ------------------------------------------------------
// Step 1: Import navigation + UI utilities
// ------------------------------------------------------
// - Stack: from Expo Router, controls screen navigation flow
// - StatusBar: controls the color/style of the top status bar
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

// ------------------------------------------------------
// Step 2: Define the Root Layout
// ------------------------------------------------------
// This file controls the global navigation and appearance
// for all screens in your Expo Router app.
// It wraps every screen and defines default header + theme settings.
export default function RootLayout() {
  return (
    <>
      {/* Step 3: Configure the status bar (dark text on light background) */}
      <StatusBar style="dark" />

      {/* Step 4: Stack navigator setup
          - headerShown: false → hides headers on all screens
          - contentStyle: sets global background color for every page */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#E8EFF7' }, // light blue background
        }}
      />
    </>
  );
}

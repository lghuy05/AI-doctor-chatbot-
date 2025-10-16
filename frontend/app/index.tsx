// ------------------------------------------------------
// Step 1: Import React Native building blocks + navigation helpers
// ------------------------------------------------------
import { View, Text, StyleSheet } from 'react-native';
import { Link } from 'expo-router';
import PrimaryButton from '../components/PrimaryButton';

// ------------------------------------------------------
// Step 2: Define the Welcome Screen component
//  - This is the first screen users see when they open the app
//  - It offers two paths: New Patient (Register) or Existing Patient (Chat)
// ------------------------------------------------------
export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      {/* Step 3: Center card UI */}
      <View style={styles.card}>
        {/* Step 4: Title text */}
        <Text style={styles.title}>Welcome to the AI{"\n"}Doctor App</Text>

        <View style={{ height: 18 }} />

        {/* Step 5: Button → Navigate to /register */}
        <Link href="/register" asChild>
          <PrimaryButton title="New Patient" />
        </Link>

        <View style={{ height: 14 }} />

        {/* Step 6: Button → Navigate to /chat-intro (existing user) */}
        <Link href="/chat-intro" asChild>
          <PrimaryButton title="Existing Patient" variant="secondary" />
        </Link>

        <View style={{ height: 14 }} />

        <Link href="/testing" asChild>
          <PrimaryButton title="New Page"></PrimaryButton>
        </Link>

      </View>
    </View>
  );
}

// ------------------------------------------------------
// Step 7: Keep styles clean and consistent with other screens
// ------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F4F7FA', // optional: subtle background for contrast
  },
  card: {
    width: '92%',
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2, // Android shadow
  },
  title: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: '#0F131A',
  },
});

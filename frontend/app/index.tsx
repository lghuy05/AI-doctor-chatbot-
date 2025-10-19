// ------------------------------------------------------
// Step 1: Import React Native building blocks + navigation helpers
// ------------------------------------------------------
import { View, Text } from 'react-native';
import { Link } from 'expo-router';
import PrimaryButton from '../components/PrimaryButton';
import { welcomeStyles } from './styles/welcomeStyles';
// ------------------------------------------------------
// Step 2: Define the Welcome Screen component
// ------------------------------------------------------
export default function WelcomeScreen() {
  return (
    <View style={welcomeStyles.container}>
      <View style={welcomeStyles.card}>
        <Text style={welcomeStyles.title}>Welcome to the AI{"\n"}Doctor App</Text>

        <View style={{ height: 18 }} />

        {/* Updated to point to /auth/register */}
        <Link href="/auth/register" asChild>
          <PrimaryButton title="New Patient" />
        </Link>

        <View style={{ height: 14 }} />

        {/* Updated to point to /auth/login for existing patients */}
        <Link href="/auth/login" asChild>
          <PrimaryButton title="Existing Patient" variant="secondary" />
        </Link>

        <View style={{ height: 14 }} />
      </View>
    </View>
  );
}

// ------------------------------------------------------
// Step 1: Import React + React Native building blocks
// ------------------------------------------------------
import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

// ------------------------------------------------------
// Step 2: Define the Register Screen component
//  - Handles user registration input (name, DOB, email, password)
//  - Simple front-end validation (no backend call yet)
//  - Navigates to /chat-intro once valid data is entered
// ------------------------------------------------------
export default function RegisterScreen() {
  // Step 2a: Track input values for each form field
  const [name, setName] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string | number>('');

  // Step 2b: Simple validation — all fields must be filled,
  // email must look valid, and password >= 6 chars
  const canSubmit = name && dob && /.+@.+\..+/.test(email) && password.length >= 6;

  // ------------------------------------------------------
  // Step 3: Render UI
  // ------------------------------------------------------
  return (
    <View style={styles.container}>
      {/* Step 3a: Back button */}
      <TouchableOpacity style={styles.back} onPress={() => router.back()}>
        <Text style={{ fontSize: 16 }}>‹</Text>
      </TouchableOpacity>

      {/* Step 3b: Registration card container */}
      <View style={styles.card}>
        <Text style={styles.header}>Create your account</Text>

        {/* Step 3c: Text fields for user input */}
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          placeholderTextColor="#9AA5B1"
        />
        <TextInput
          style={styles.input}
          placeholder="Date of Birth (YYYY-MM-DD)"
          value={dob}
          onChangeText={setDob}
          keyboardType="numeric"
          placeholderTextColor="#9AA5B1"
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#9AA5B1"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#9AA5B1"
        />

        {/* Step 3d: Register button */}
        <TouchableOpacity
          onPress={() => canSubmit && router.push('/chat-intro')}
          disabled={!canSubmit}
          style={[styles.submit, !canSubmit && { opacity: 0.5 }]}
        >
          <Text style={styles.submitText}>Register</Text>
        </TouchableOpacity>

        {/* Step 3e: Already have account? */}
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.link} onPress={() => router.push('/chat-intro')}>
            Sign In
          </Text>
        </Text>
      </View>
    </View>
  );
}

// ------------------------------------------------------
// Step 4: Define styles for layout and components
// ------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 56,
    paddingHorizontal: 18,
    backgroundColor: '#F4F7FA', // optional: light background for visual comfort
  },
  back: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#FFFFFFAA',
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F131A',
    marginBottom: 12,
  },
  input: {
    height: 46,
    borderRadius: 10,
    backgroundColor: '#F4F7FA',
    paddingHorizontal: 12,
    marginVertical: 6,
    fontSize: 16,
    color: '#0F131A',
  },
  submit: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0F131A',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  footerText: {
    textAlign: 'center',
    marginTop: 10,
    color: '#6B7280',
  },
  link: {
    color: '#0F131A',
    fontWeight: '700',
  },
});

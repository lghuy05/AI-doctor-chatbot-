import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';
import { authStyles } from '../styles/authStyles';

// const API_BASE_URL = 'http://localhost:8000';
const API_BASE_URL = 'https://ai-doctor-chatbot-zw8n.onrender.com';
console.log('🔗 Using API URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function RegisterScreen() {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [sex, setSex] = useState<string>('');
  const [role, setRole] = useState<string>(''); // ← ADD THIS
  const [loading, setLoading] = useState<boolean>(false);

  const passwordsMatch = password === confirmPassword;
  const isAgeValid = age !== '' && !isNaN(Number(age)) && Number(age) > 0 && Number(age) < 120;
  const canSubmit = username && email && /.+@.+\..+/.test(email) && password.length >= 6 && passwordsMatch && isAgeValid && sex && role; // ← ADD role CHECK

  const handleRegister = async () => {
    if (!canSubmit || loading) return;

    setLoading(true);

    try {
      const response = await api.post('/auth/register', {
        username: username,
        email: email,
        password: password,
        age: parseInt(age),
        sex: sex,
        role: role, // ← ADD THIS
      });

      Alert.alert('Success', 'Account created successfully! Please login.');
      router.push('/auth/login');

    } catch (error: any) {
      console.error('Registration error:', error);

      if (error.response?.data?.detail) {
        Alert.alert('Registration Failed', error.response.data.detail);
      } else if (error.code === 'ECONNABORTED') {
        Alert.alert('Timeout', 'Request took too long. Please try again.');
      } else {
        Alert.alert('Error', 'Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={authStyles.container}>
      <TouchableOpacity style={authStyles.back} onPress={() => router.back()}>
        <Text style={authStyles.backText}>‹</Text>
      </TouchableOpacity>

      <ScrollView style={authStyles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={authStyles.card}>
          <Text style={authStyles.header}>Create your account</Text>
          <Text style={authStyles.sectionLabel}>Personal Information</Text>

          <TextInput
            style={authStyles.input}
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor="#9AA5B1"
            autoCapitalize="none"
          />

          <TextInput
            style={authStyles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#9AA5B1"
          />

          <TextInput
            style={[
              authStyles.input,
              !isAgeValid && age !== '' && authStyles.inputError
            ]}
            placeholder="Age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
            placeholderTextColor="#9AA5B1"
          />

          <View style={authStyles.genderContainer}>
            <Text style={authStyles.genderLabel}>Gender</Text>
            <View style={authStyles.genderOptions}>
              <TouchableOpacity
                style={[
                  authStyles.genderOption,
                  sex === 'male' && authStyles.genderOptionSelected
                ]}
                onPress={() => setSex('male')}
              >
                <Text style={[
                  authStyles.genderOptionText,
                  sex === 'male' && authStyles.genderOptionTextSelected
                ]}>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  authStyles.genderOption,
                  sex === 'female' && authStyles.genderOptionSelected
                ]}
                onPress={() => setSex('female')}
              >
                <Text style={[
                  authStyles.genderOptionText,
                  sex === 'female' && authStyles.genderOptionTextSelected
                ]}>Female</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  authStyles.genderOption,
                  sex === 'other' && authStyles.genderOptionSelected
                ]}
                onPress={() => setSex('other')}
              >
                <Text style={[
                  authStyles.genderOptionText,
                  sex === 'other' && authStyles.genderOptionTextSelected
                ]}>Other</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ADD ROLE SELECTION SECTION */}
          <View style={authStyles.genderContainer}>
            <Text style={authStyles.genderLabel}>Role</Text>
            <View style={authStyles.genderOptions}>
              <TouchableOpacity
                style={[
                  authStyles.genderOption,
                  role === 'patient' && authStyles.genderOptionSelected
                ]}
                onPress={() => setRole('patient')}
              >
                <Text style={[
                  authStyles.genderOptionText,
                  role === 'patient' && authStyles.genderOptionTextSelected
                ]}>Patient</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  authStyles.genderOption,
                  role === 'clinician' && authStyles.genderOptionSelected
                ]}
                onPress={() => setRole('clinician')}
              >
                <Text style={[
                  authStyles.genderOptionText,
                  role === 'clinician' && authStyles.genderOptionTextSelected
                ]}>Clinician</Text>
              </TouchableOpacity>
            </View>
          </View>

          {!isAgeValid && age !== '' && (
            <Text style={authStyles.errorText}>Please enter a valid age</Text>
          )}

          <Text style={authStyles.sectionLabel}>Security</Text>

          <TextInput
            style={[
              authStyles.input,
              !passwordsMatch && confirmPassword !== '' && authStyles.inputError
            ]}
            placeholder="Password (min. 6 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#9AA5B1"
          />

          <TextInput
            style={[
              authStyles.input,
              !passwordsMatch && confirmPassword !== '' && authStyles.inputError
            ]}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#9AA5B1"
          />

          {!passwordsMatch && confirmPassword !== '' && (
            <Text style={authStyles.errorText}>Passwords do not match</Text>
          )}

          <TouchableOpacity
            onPress={handleRegister}
            disabled={!canSubmit || loading}
            style={[authStyles.submit, (!canSubmit || loading) && authStyles.submitDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={authStyles.submitText}>Create Account</Text>
            )}
          </TouchableOpacity>

          <Text style={authStyles.footerText}>
            Already have an account?{' '}
            <Text style={authStyles.link} onPress={() => router.push('/auth/login')}>
              Sign In
            </Text>
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

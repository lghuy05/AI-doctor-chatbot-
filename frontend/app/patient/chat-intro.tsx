// ------------------------------------------------------
// Step 1: Import React + React Native building blocks
// ------------------------------------------------------
import { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, ScrollView, Alert
} from 'react-native';
import { router } from 'expo-router';
import axios from 'axios';

// ------------------------------------------------------
// Step 2: Configure Axios with base URL
// ------------------------------------------------------
const API_BASE_URL = 'http://10.0.2.2:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// TODO: Add token to requests (you'll need to get this from your auth storage)
// api.interceptors.request.use((config) => {
//   const token = await getTokenFromStorage(); // Implement this
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// ------------------------------------------------------
// Step 3: Build the screen with Axios
// ------------------------------------------------------
export default function ChatIntroScreen() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState<null | {
    emergency?: boolean;
    advice?: {
      advice: { step: string; details: string }[];
      when_to_seek_care: string[];
      disclaimer: string;
    };
    error?: string;
    notice?: string;
  }>(null);

  const send = async () => {
    const text = message.trim();
    if (!text || loading) return;

    setLoading(true);
    setOutput(null);

    try {
      const payload = { age: 30, sex: 'female', symptoms: text, meds: [], conditions: [] };

      // 5a) TRIAGE FIRST using Axios
      const triageResponse = await api.post('/triage', payload);
      const triage = triageResponse.data;

      if (triage.risk === 'emergency') {
        setOutput({ emergency: true, notice: 'Possible emergency. Please call 911 (or local equivalent).' });
        return;
      }

      // 5c) OTHERWISE GET PATIENT ADVICE using Axios
      const adviceResponse = await api.post('/advice', payload);
      setOutput({ advice: adviceResponse.data });

    } catch (error: any) {
      console.error('API Error:', error);

      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        router.push('/login');
      } else if (error.response?.data?.detail) {
        setOutput({ error: error.response.data.detail });
      } else if (error.code === 'ECONNABORTED') {
        setOutput({ error: 'Request timeout. Please try again.' });
      } else {
        setOutput({ error: error.message || 'Something went wrong.' });
      }
    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.container}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.back} onPress={() => router.back()}>
            <Text style={styles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.title}>AI Doctor App</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.card}>
          <Text style={styles.cardText}>In instances of a medical emergency, please dial 911.</Text>
        </View>
        <View style={[styles.card, styles.secondaryCard]}>
          <Text style={styles.cardText}>Suggestions are subject to error; verify with your primary care doctor.</Text>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {loading && (
            <View style={[styles.card, styles.loadingCard]}>
              <ActivityIndicator />
              <Text style={styles.loadingText}>Thinking…</Text>
            </View>
          )}

          {!!output?.error && (
            <View style={[styles.card, styles.errorCard]}>
              <Text style={styles.errorTitle}>Error</Text>
              <Text style={styles.errorText}>{output.error}</Text>
            </View>
          )}

          {!!output?.emergency && (
            <View style={[styles.card, styles.emergencyCard]}>
              <Text style={styles.emergencyTitle}>Emergency</Text>
              <Text style={styles.emergencyText}>{output.notice}</Text>
            </View>
          )}

          {!!output?.advice && (
            <View style={styles.card}>
              <Text style={styles.adviceTitle}>At-home steps</Text>
              {output.advice.advice?.map((a, idx) => (
                <View key={idx} style={styles.adviceItem}>
                  <Text style={styles.adviceStep}>{a.step}</Text>
                  <Text style={styles.adviceDetails}>{a.details}</Text>
                </View>
              ))}

              {!!output.advice.when_to_seek_care?.length && (
                <>
                  <Text style={styles.careTitle}>When to seek care</Text>
                  {output.advice.when_to_seek_care.map((w, idx) => (
                    <Text key={idx} style={styles.careItem}>• {w}</Text>
                  ))}
                </>
              )}

              {!!output.advice.disclaimer && (
                <Text style={styles.disclaimer}>{output.advice.disclaimer}</Text>
              )}
            </View>
          )}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            placeholder="Send a message..."
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#9AA5B1"
            editable={!loading}
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <TouchableOpacity
            style={[styles.sendBtn, loading && styles.sendBtnDisabled]}
            onPress={send}
            disabled={loading}
          >
            <Text style={styles.sendBtnText}>{loading ? '...' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

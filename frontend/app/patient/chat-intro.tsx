// ------------------------------------------------------
// Step 1: Import React + React Native building blocks
// ------------------------------------------------------
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, SafeAreaView, ActivityIndicator, ScrollView, Alert
} from 'react-native';
import { router } from 'expo-router';
import { chatStyles } from '../styles/chatStyles';
import api from '../../api/client';

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
      const payload = { age: 30, sex: 'female', symptoms: text, meds: [], conditions: [], duration: "unknown" };
      console.log('Payload', payload);

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
        router.push('/auth/login');
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
    <SafeAreaView style={chatStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={chatStyles.container}
      >
        {/* ✅ UPDATED HEADER WITH PROFILE BUTTON */}
        <View style={chatStyles.headerRow}>
          <TouchableOpacity style={chatStyles.back} onPress={() => router.back()}>
            <Text style={chatStyles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={chatStyles.title}>AI Doctor App</Text>

          {/* ✅ PROFILE NAVIGATION BUTTON */}
          <TouchableOpacity onPress={() => router.push('/patient/profile')}>
            <Text style={chatStyles.backText}>👤</Text>
          </TouchableOpacity>
        </View>

        <View style={chatStyles.card}>
          <Text style={chatStyles.cardText}>In instances of a medical emergency, please dial 911.</Text>
        </View>
        <View style={[chatStyles.card, chatStyles.secondaryCard]}>
          <Text style={chatStyles.cardText}>Suggestions are subject to error; verify with your primary care doctor.</Text>
        </View>

        <ScrollView style={chatStyles.scrollView} contentContainerStyle={chatStyles.scrollContent}>
          {loading && (
            <View style={[chatStyles.card, chatStyles.loadingCard]}>
              <ActivityIndicator />
              <Text style={chatStyles.loadingText}>Thinking…</Text>
            </View>
          )}

          {!!output?.error && (
            <View style={[chatStyles.card, chatStyles.errorCard]}>
              <Text style={chatStyles.errorTitle}>Error</Text>
              <Text style={chatStyles.errorText}>{output.error}</Text>
            </View>
          )}

          {!!output?.emergency && (
            <View style={[chatStyles.card, chatStyles.emergencyCard]}>
              <Text style={chatStyles.emergencyTitle}>Emergency</Text>
              <Text style={chatStyles.emergencyText}>{output.notice}</Text>
            </View>
          )}

          {!!output?.advice && (
            <View style={chatStyles.card}>
              <Text style={chatStyles.adviceTitle}>At-home steps</Text>
              {output.advice.advice?.map((a, idx) => (
                <View key={idx} style={chatStyles.adviceItem}>
                  <Text style={chatStyles.adviceStep}>{a.step}</Text>
                  <Text style={chatStyles.adviceDetails}>{a.details}</Text>
                </View>
              ))}

              {!!output.advice.when_to_seek_care?.length && (
                <>
                  <Text style={chatStyles.careTitle}>When to seek care</Text>
                  {output.advice.when_to_seek_care.map((w, idx) => (
                    <Text key={idx} style={chatStyles.careItem}>• {w}</Text>
                  ))}
                </>
              )}

              {!!output.advice.disclaimer && (
                <Text style={chatStyles.disclaimer}>{output.advice.disclaimer}</Text>
              )}
            </View>
          )}
        </ScrollView>

        <View style={chatStyles.inputBar}>
          <TextInput
            style={chatStyles.input}
            placeholder="Send a message..."
            value={message}
            onChangeText={setMessage}
            placeholderTextColor="#9AA5B1"
            editable={!loading}
            returnKeyType="send"
            onSubmitEditing={send}
          />
          <TouchableOpacity
            style={[chatStyles.sendBtn, loading && chatStyles.sendBtnDisabled]}
            onPress={send}
            disabled={loading}
          >
            <Text style={chatStyles.sendBtnText}>{loading ? '...' : 'Send'}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

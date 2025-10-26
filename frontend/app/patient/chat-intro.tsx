// app/chat-intro.tsx - UPDATED WITH PATIENT DATA INTEGRATION
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, SafeAreaView,
  ActivityIndicator, ScrollView, Alert
} from 'react-native';
import { router } from 'expo-router';
import { chatStyles } from '../styles/chatStyles';
import api from '../../api/client';
import { usePatientStore } from '../../hooks/usePatientStore';

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
  const [patientDataLoaded, setPatientDataLoaded] = useState(false);

  // Get patient profile from store
  const {
    patientProfile,
    getPatientContext,
    fetchPatientProfile,
    isLoading: patientLoading,
    error: patientError
  } = usePatientStore();

  // Load patient profile on component mount
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        await fetchPatientProfile('example');
        setPatientDataLoaded(true);
      } catch (error) {
        console.error('Failed to load patient data:', error);
        setPatientDataLoaded(true); // Still set to true to allow chat with fallback
      }
    };

    loadPatientData();
  }, []);

  const getPatientPayload = () => {
    const patientContext = getPatientContext();

    // Default fallback values
    const defaultAge = 30;
    const defaultGender = 'female';

    // Calculate age from birth_date if age is not available
    let age = patientProfile?.age || defaultAge;
    if (!patientProfile?.age && patientProfile?.birth_date) {
      const birthDate = new Date(patientProfile.birth_date);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
    }

    // Normalize gender for API
    let gender = patientProfile?.gender?.toLowerCase() || defaultGender;
    if (gender.includes('male')) {
      gender = 'male';
    } else if (gender.includes('female')) {
      gender = 'female';
    }

    return {
      age: age,
      sex: gender,
      symptoms: message.trim(),
      meds: patientContext.medications,
      conditions: patientContext.conditions,
      duration: "unknown"
    };
  };

  const showPatientDataWarning = () => {
    if (!patientProfile) {
      Alert.alert(
        'Limited Personalization',
        'Your medical profile is not loaded. Chat responses will use generic information.',
        [{ text: 'OK' }]
      );
      return true;
    }
    return false;
  };

  const send = async () => {
    const text = message.trim();
    if (!text) {
      Alert.alert('Empty Message', 'Please describe your symptoms.');
      return;
    }

    if (loading) return;

    // Warn if patient data isn't available
    const hasPatientDataWarning = showPatientDataWarning();

    setLoading(true);
    setOutput(null);

    try {
      const payload = getPatientPayload();
      console.log('Sending payload with patient data:', payload);

      // Show loading state
      setOutput({ notice: 'Analyzing your symptoms with your medical history...' });

      // Step 1: Triage assessment
      const triageResponse = await api.post('/triage', payload);
      const triage = triageResponse.data;

      if (triage.risk === 'emergency') {
        setOutput({
          emergency: true,
          notice: 'Based on your symptoms and medical history, this appears to be a potential emergency. Please call 911 or go to the nearest emergency room immediately.'
        });
        return;
      }

      // Step 2: Get personalized advice
      const adviceResponse = await api.post('/advice', payload);
      setOutput({
        advice: adviceResponse.data,
        notice: hasPatientDataWarning ? 'Note: Using generic medical advice. For personalized recommendations, ensure your patient profile is complete.' : undefined
      });

    } catch (error: any) {
      console.error('API Error:', error);

      let errorMessage = 'Something went wrong. Please try again.';

      if (error.response?.status === 401) {
        Alert.alert('Session Expired', 'Please login again');
        router.push('/auth/login');
        return;
      } else if (error.response?.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment and try again.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Server is temporarily unavailable. Please try again later.';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network connection failed. Please check your internet connection.';
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setOutput({ error: errorMessage });

      // Show alert for critical errors
      if (error.response?.status >= 500) {
        Alert.alert('Service Unavailable', errorMessage);
      }

    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  const retryPatientData = async () => {
    try {
      await fetchPatientProfile('500569db-b06d-461a-8361-e6b5adbf081a', true);
    } catch (error) {
      console.error('Failed to retry patient data:', error);
    }
  };

  return (
    <SafeAreaView style={chatStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={chatStyles.container}
      >
        {/* Header with Profile Button */}
        <View style={chatStyles.headerRow}>
          <TouchableOpacity style={chatStyles.back} onPress={() => router.back()}>
            <Text style={chatStyles.backText}>‹</Text>
          </TouchableOpacity>
          <Text style={chatStyles.title}>AI Doctor App</Text>
          <TouchableOpacity onPress={() => router.push('/patient/profile')}>
            <Text style={chatStyles.backText}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* Patient Data Status */}
        {patientLoading && (
          <View style={[chatStyles.card, chatStyles.infoCard]}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={chatStyles.infoText}>Loading your medical profile...</Text>
          </View>
        )}

        {patientError && (
          <View style={[chatStyles.card, chatStyles.warningCard]}>
            <Text style={chatStyles.warningTitle}>Profile Warning</Text>
            <Text style={chatStyles.warningText}>
              Unable to load your medical profile. Chat will use generic information.
            </Text>
            <TouchableOpacity onPress={retryPatientData} style={chatStyles.retryButton}>
              <Text style={chatStyles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {!patientProfile && patientDataLoaded && !patientLoading && (
          <View style={[chatStyles.card, chatStyles.infoCard]}>
            <Text style={chatStyles.infoText}>
              Complete your patient profile for personalized medical advice.
            </Text>
          </View>
        )}

        {/* Safety Notices */}
        <View style={chatStyles.card}>
          <Text style={chatStyles.cardText}>In instances of a medical emergency, please dial 911.</Text>
        </View>
        <View style={[chatStyles.card, chatStyles.secondaryCard]}>
          <Text style={chatStyles.cardText}>Suggestions are subject to error; verify with your primary care doctor.</Text>
        </View>

        {/* Chat Output */}
        <ScrollView style={chatStyles.scrollView} contentContainerStyle={chatStyles.scrollContent}>
          {loading && (
            <View style={[chatStyles.card, chatStyles.loadingCard]}>
              <ActivityIndicator />
              <Text style={chatStyles.loadingText}>Analyzing your symptoms...</Text>
            </View>
          )}

          {!!output?.notice && !output.error && !output.emergency && (
            <View style={[chatStyles.card, chatStyles.infoCard]}>
              <Text style={chatStyles.infoText}>{output.notice}</Text>
            </View>
          )}

          {!!output?.error && (
            <View style={[chatStyles.card, chatStyles.errorCard]}>
              <Text style={chatStyles.errorTitle}>Error</Text>
              <Text style={chatStyles.errorText}>{output.error}</Text>
              <TouchableOpacity onPress={send} style={chatStyles.retryButton}>
                <Text style={chatStyles.retryButtonText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          )}

          {!!output?.emergency && (
            <View style={[chatStyles.card, chatStyles.emergencyCard]}>
              <Text style={chatStyles.emergencyTitle}>🚨 Emergency Alert</Text>
              <Text style={chatStyles.emergencyText}>{output.notice}</Text>
              <View style={chatStyles.emergencyActions}>
                <TouchableOpacity style={chatStyles.emergencyButton}>
                  <Text style={chatStyles.emergencyButtonText}>Call 911</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[chatStyles.emergencyButton, chatStyles.secondaryEmergencyButton]}
                  onPress={() => setOutput(null)}
                >
                  <Text style={chatStyles.secondaryEmergencyButtonText}>I Understand</Text>
                </TouchableOpacity>
              </View>
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

        {/* Input Bar */}
        <View style={chatStyles.inputBar}>
          <TextInput
            style={[
              chatStyles.input,
              !patientProfile && chatStyles.inputWarning
            ]}
            placeholder={
              patientProfile
                ? "Describe your symptoms..."
                : "Describe symptoms (profile not loaded)..."
            }
            value={message}
            onChangeText={setMessage}
            placeholderTextColor={patientProfile ? "#9AA5B1" : "#F59E0B"}
            editable={!loading}
            returnKeyType="send"
            onSubmitEditing={send}
            multiline
          />
          <TouchableOpacity
            style={[
              chatStyles.sendBtn,
              loading && chatStyles.sendBtnDisabled,
              !patientProfile && chatStyles.sendBtnWarning
            ]}
            onPress={send}
            disabled={loading}
          >
            <Text style={chatStyles.sendBtnText}>
              {loading ? '...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

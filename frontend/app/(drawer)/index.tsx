// app/(drawer)/index.tsx - UPDATED WITH CHAT PERSISTENCE
import { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, SafeAreaView,
  ActivityIndicator, ScrollView, Alert
} from 'react-native';
import { router, useNavigation } from 'expo-router';
import { chatStyles } from '../styles/chatStyles';
import api from '../../api/client';
import { usePatientStore } from '../../hooks/usePatientStore';
import { useChatStore, ChatMessage } from '../../hooks/useChatStore';

export default function ChatIntroScreen() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Use chat store for persistence
  const {
    currentSession,
    addMessage,
    clearCurrentSession,
    isLoading: chatLoading
  } = useChatStore();

  // Get patient profile from store
  const {
    patientProfile,
    getPatientContext,
    fetchPatientProfile,
    isLoading: patientLoading,
    error: patientError
  } = usePatientStore();

  const navigation = useNavigation();

  // Load patient profile on component mount
  useEffect(() => {
    const loadPatientData = async () => {
      try {
        await fetchPatientProfile('example');
      } catch (error) {
        console.error('Failed to load patient data:', error);
      }
    };

    loadPatientData();
  }, []);

  const getPatientPayload = () => {
    const patientContext = getPatientContext();

    let age = patientProfile?.age || 30;
    if (!patientProfile?.age && patientProfile?.birth_date) {
      const birthDate = new Date(patientProfile.birth_date);
      const today = new Date();
      age = today.getFullYear() - birthDate.getFullYear();
    }

    let gender = patientProfile?.gender?.toLowerCase() || 'female';
    if (gender.includes('male')) gender = 'male';
    else if (gender.includes('female')) gender = 'female';

    return {
      age: age,
      sex: gender,
      symptoms: message.trim(),
      meds: patientContext.medications,
      conditions: patientContext.conditions,
      duration: "unknown",
      patient_id: "example"
    };
  };

  const send = async () => {
    const text = message.trim();
    if (!text) {
      Alert.alert('Empty Message', 'Please describe your symptoms.');
      return;
    }

    if (loading) return;

    setLoading(true);
    const patientContext = getPatientContext();

    try {
      const payload = getPatientPayload();
      console.log('Sending payload with patient data:', payload);

      // Step 1: Triage assessment
      const triageResponse = await api.post('/triage', payload);
      const triage = triageResponse.data;

      if (triage.risk === 'emergency') {
        const emergencyResponse = {
          emergency: true,
          notice: 'Based on your symptoms and medical history, this appears to be a potential emergency. Please call 911 or go to the nearest emergency room immediately.'
        };

        addMessage(text, emergencyResponse, text, patientContext);
        setLoading(false);
        setMessage('');
        return;
      }

      // Step 2: Get personalized advice
      const adviceResponse = await api.post('/ehr-advice', payload);

      // Save to persistent store
      addMessage(text, adviceResponse.data, text, patientContext);

      setMessage('');

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
      }

      const errorResponse = { error: errorMessage };
      addMessage(text, errorResponse, text, patientContext);

    } finally {
      setLoading(false);
      setMessage('');
    }
  };

  const renderChatMessage = (chat: ChatMessage) => (
    <View key={chat.id} style={chatStyles.chatBubble}>
      {/* User Message */}
      <View style={chatStyles.userBubble}>
        <Text style={chatStyles.userText}>{chat.userMessage}</Text>
      </View>

      {/* AI Response */}
      <View style={chatStyles.aiBubble}>
        {chat.aiResponse.emergency && (
          <View style={[chatStyles.card, chatStyles.emergencyCard]}>
            <Text style={chatStyles.emergencyTitle}>🚨 Emergency Alert</Text>
            <Text style={chatStyles.emergencyText}>{chat.aiResponse.notice}</Text>
          </View>
        )}

        {chat.aiResponse.advice && (
          <View style={chatStyles.adviceContainer}>
            <Text style={chatStyles.adviceTitle}>At-home steps</Text>
            {chat.aiResponse.advice.map((a, idx) => (
              <View key={idx} style={chatStyles.adviceItem}>
                <Text style={chatStyles.adviceStep}>{a.step}</Text>
                <Text style={chatStyles.adviceDetails}>{a.details}</Text>
              </View>
            ))}
          </View>
        )}

        {chat.aiResponse.error && (
          <View style={[chatStyles.card, chatStyles.errorCard]}>
            <Text style={chatStyles.errorText}>{chat.aiResponse.error}</Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={chatStyles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={chatStyles.container}
      >
        {/* Header */}
        <View style={chatStyles.headerRow}>
          <TouchableOpacity
            style={chatStyles.menuButton}
            onPress={() => navigation.dispatch({ type: 'OPEN_DRAWER' } as any)}
          >
            <Text style={chatStyles.menuText}>☰</Text>
          </TouchableOpacity>

          <Text style={chatStyles.title}>AI Doctor App</Text>

          {/* Clear Chat Button */}
          <TouchableOpacity
            style={chatStyles.clearButton}
            onPress={clearCurrentSession}
          >
            <Text style={chatStyles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Chat History */}
        <ScrollView
          style={chatStyles.scrollView}
          contentContainerStyle={chatStyles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {currentSession.length === 0 && (
            <View style={chatStyles.welcomeCard}>
              <Text style={chatStyles.welcomeTitle}>Welcome to AI Doctor</Text>
              <Text style={chatStyles.welcomeText}>
                Describe your symptoms and get personalized medical advice based on your health profile.
              </Text>
            </View>
          )}

          {currentSession.map(renderChatMessage)}

          {loading && (
            <View style={[chatStyles.card, chatStyles.loadingCard]}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={chatStyles.loadingText}>Analyzing your symptoms...</Text>
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
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              chatStyles.sendBtn,
              loading && chatStyles.sendBtnDisabled,
              !patientProfile && chatStyles.sendBtnWarning
            ]}
            onPress={send}
            disabled={loading || !message.trim()}
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
